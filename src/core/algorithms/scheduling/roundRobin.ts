/**
 * OScope — Round Robin (RR) CPU Scheduling Engine
 * Time-sliced scheduling with a real FIFO ready queue, configurable quantum,
 * deterministic arrival-before-preempt queue semantics, and context switches.
 */

import type {
  ProcessInput,
  SchedulingResult,
  SchedulingOptions,
  GanttSegment,
  SchedulingSnapshot,
} from '../../models';
import {
  normalizeWorkload,
  comparePids,
  appendGanttSegment,
  calculateCompletedMetrics,
  makeSchedulingSnapshot,
  type InternalProcess,
} from './shared';

export function runRoundRobin(
  processes: readonly ProcessInput[],
  options?: SchedulingOptions
): SchedulingResult {
  const quantum = options?.quantum ?? 2;

  if (quantum <= 0 || !Number.isFinite(quantum)) {
    throw new Error(`Round Robin error: Time quantum must be a positive integer, received: ${quantum}`);
  }

  const workload = normalizeWorkload(processes);
  const gantt: GanttSegment[] = [];
  const snapshots: SchedulingSnapshot[] = [];
  const csCost = options?.contextSwitchCost && options.contextSwitchCost > 0 ? options.contextSwitchCost : 0;

  if (workload.length === 0) {
    return {
      algorithm: `Round Robin (q=${quantum})`,
      gantt: [],
      processMetrics: {},
      metrics: {
        averageWaitingTime: 0,
        averageTurnaroundTime: 0,
        averageResponseTime: 0,
        cpuUtilization: 0,
        throughput: 0,
        contextSwitchCount: 0,
        totalTime: 0,
      },
      stepSnapshots: [],
    };
  }

  let currentTime = 0;
  let contextSwitchCount = 0;
  let lastRanPid: string | null = null;
  const terminatedPids: string[] = [];

  // Track processes not yet entered into the FIFO ready queue
  const unarrived = [...workload].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return comparePids(a.pid, b.pid);
  });

  const readyQueue: InternalProcess[] = [];

  // Initial check: admit all processes that arrived at t=0
  while (unarrived.length > 0 && unarrived[0].arrivalTime <= currentTime) {
    readyQueue.push(unarrived.shift()!);
  }

  while (terminatedPids.length < workload.length) {
    // If ready queue is empty, advance time to next arrival and insert IDLE
    if (readyQueue.length === 0) {
      if (unarrived.length === 0) break;
      const nextArrival = unarrived[0].arrivalTime;
      appendGanttSegment(gantt, 'IDLE', 'IDLE', currentTime, nextArrival);
      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          null,
          [],
          terminatedPids,
          `CPU idle from t=${currentTime} to t=${nextArrival}. Awaiting next process arrival.`
        )
      );
      currentTime = nextArrival;
      lastRanPid = null;

      while (unarrived.length > 0 && unarrived[0].arrivalTime <= currentTime) {
        readyQueue.push(unarrived.shift()!);
      }
      continue;
    }

    // Dequeue head of Ready Queue
    const selected = readyQueue.shift()!;

    // Zero burst process handling
    if (selected.burstTime === 0) {
      if (selected.startTime === null) selected.startTime = currentTime;
      selected.completionTime = currentTime;
      selected.remainingTime = 0;
      terminatedPids.push(selected.pid);

      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          selected.pid,
          readyQueue,
          terminatedPids,
          `Process ${selected.pid} has burst = 0. Finished immediately at t=${currentTime}.`
        )
      );
      continue;
    }

    // Context switch if switching process
    if (lastRanPid !== null && lastRanPid !== selected.pid) {
      contextSwitchCount += 1;
      if (csCost > 0) {
        appendGanttSegment(gantt, 'CONTEXT_SWITCH', 'CS', currentTime, currentTime + csCost);
        snapshots.push(
          makeSchedulingSnapshot(
            currentTime,
            null,
            [selected, ...readyQueue],
            terminatedPids,
            `Context switch: Transitioning CPU from ${lastRanPid} to ${selected.pid} (cost: ${csCost}ms).`
          )
        );
        currentTime += csCost;

        // During context switch overhead, check if any new processes arrived
        while (unarrived.length > 0 && unarrived[0].arrivalTime <= currentTime) {
          readyQueue.push(unarrived.shift()!);
        }
      }
    }

    if (selected.startTime === null) {
      selected.startTime = currentTime;
    }

    // Execution slice: min(remainingTime, quantum)
    const runDuration = Math.min(selected.remainingTime, quantum);
    const segmentEnd = currentTime + runDuration;

    appendGanttSegment(gantt, 'PROCESS', selected.pid, currentTime, segmentEnd);

    snapshots.push(
      makeSchedulingSnapshot(
        currentTime,
        selected.pid,
        readyQueue,
        terminatedPids,
        `RR dispatched ${selected.pid} with quantum ${quantum}ms (Remaining: ${selected.remainingTime}ms).`
      )
    );

    currentTime = segmentEnd;
    selected.remainingTime -= runDuration;
    lastRanPid = selected.pid;

    // SECTION 15 QUEUE SEMANTICS:
    // When a quantum expires at time t simultaneously with new arrivals,
    // newly arrived processes enter the queue BEFORE the preempted process re-enters!
    while (unarrived.length > 0 && unarrived[0].arrivalTime <= currentTime) {
      readyQueue.push(unarrived.shift()!);
    }

    if (selected.remainingTime === 0) {
      selected.completionTime = currentTime;
      terminatedPids.push(selected.pid);

      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          selected.pid,
          readyQueue,
          terminatedPids,
          `Process ${selected.pid} finished execution within quantum at t=${currentTime}ms.`
        )
      );
    } else {
      // Quantum expired: Preempt and append to the back of the Ready Queue
      readyQueue.push(selected);

      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          null,
          readyQueue,
          terminatedPids,
          `Process ${selected.pid} quantum of ${quantum}ms expired. Re-entered back of ready queue (Remaining: ${selected.remainingTime}ms).`
        )
      );
    }
  }

  snapshots.push(
    makeSchedulingSnapshot(
      currentTime,
      null,
      [],
      terminatedPids,
      `Round Robin (q=${quantum}) simulation completed for all ${workload.length} processes at t=${currentTime}ms.`
    )
  );

  const { processMetrics, metrics } = calculateCompletedMetrics(workload, gantt, contextSwitchCount);

  return Object.freeze({
    algorithm: `Round Robin (q=${quantum})`,
    gantt: Object.freeze(gantt),
    processMetrics: Object.freeze(processMetrics),
    metrics,
    stepSnapshots: Object.freeze(snapshots),
  });
}
