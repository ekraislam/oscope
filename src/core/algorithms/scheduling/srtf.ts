/**
 * OScope — Shortest Remaining Time First (SRTF) Preemptive CPU Scheduling Engine
 * Dynamically preempts running processes when a newly arrived job has strictly shorter remaining execution time.
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

export function runSRTFPreemptive(
  processes: readonly ProcessInput[],
  options?: SchedulingOptions
): SchedulingResult {
  const workload = normalizeWorkload(processes);
  const gantt: GanttSegment[] = [];
  const snapshots: SchedulingSnapshot[] = [];
  const csCost = options?.contextSwitchCost && options.contextSwitchCost > 0 ? options.contextSwitchCost : 0;

  if (workload.length === 0) {
    return {
      algorithm: 'SRTF (Preemptive)',
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

  function srtfComparator(a: InternalProcess, b: InternalProcess): number {
    // 1. Primary: Shortest remaining time
    if (a.remainingTime !== b.remainingTime) {
      return a.remainingTime - b.remainingTime;
    }
    // 2. Secondary: Earlier arrival time
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }
    // 3. Final: Natural PID order
    return comparePids(a.pid, b.pid);
  }

  while (terminatedPids.length < workload.length) {
    // 1. Identify uncompleted ready processes
    const ready = workload.filter(
      (p) => p.arrivalTime <= currentTime && !terminatedPids.includes(p.pid)
    );

    // If no process is ready, jump to next arrival
    if (ready.length === 0) {
      const remainingUnarrived = workload.filter((p) => !terminatedPids.includes(p.pid));
      const nextArrival = Math.min(...remainingUnarrived.map((p) => p.arrivalTime));
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
      continue;
    }

    ready.sort(srtfComparator);
    const selected = ready[0];

    // Handle zero burst time immediately
    if (selected.burstTime === 0) {
      if (selected.startTime === null) selected.startTime = currentTime;
      selected.completionTime = currentTime;
      selected.remainingTime = 0;
      terminatedPids.push(selected.pid);

      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          selected.pid,
          ready.slice(1),
          terminatedPids,
          `Process ${selected.pid} has burst time = 0. Finished immediately at t=${currentTime}.`
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
            ready,
            terminatedPids,
            `Context switch: Transitioning CPU from ${lastRanPid} to ${selected.pid} (cost: ${csCost}ms).`
          )
        );
        currentTime += csCost;
      }
    }

    if (selected.startTime === null) {
      selected.startTime = currentTime;
    }

    // Determine how long this process can run before the next event (either process completes or a new process arrives)
    const futureArrivals = workload.filter(
      (p) => p.arrivalTime > currentTime && !terminatedPids.includes(p.pid)
    );
    const nextEventArrival =
      futureArrivals.length > 0 ? Math.min(...futureArrivals.map((p) => p.arrivalTime)) : Infinity;

    const timeUntilNextArrival = nextEventArrival - currentTime;
    const runDuration = Math.min(selected.remainingTime, timeUntilNextArrival);

    const segmentEnd = currentTime + runDuration;
    appendGanttSegment(gantt, 'PROCESS', selected.pid, currentTime, segmentEnd);

    // Snapshot
    const isPreemptionPoint = runDuration < selected.remainingTime && futureArrivals.length > 0;
    const explanation =
      selected.remainingTime === selected.burstTime
        ? `SRTF dispatched ${selected.pid} with remaining time ${selected.remainingTime}ms.`
        : isPreemptionPoint
        ? `SRTF running ${selected.pid}. Evaluating new arrivals at t=${segmentEnd}ms.`
        : `SRTF running ${selected.pid} to completion.`;

    snapshots.push(
      makeSchedulingSnapshot(currentTime, selected.pid, ready.slice(1), terminatedPids, explanation)
    );

    currentTime = segmentEnd;
    selected.remainingTime -= runDuration;
    lastRanPid = selected.pid;

    if (selected.remainingTime === 0) {
      selected.completionTime = currentTime;
      terminatedPids.push(selected.pid);

      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          selected.pid,
          workload.filter((p) => p.arrivalTime <= currentTime && !terminatedPids.includes(p.pid)),
          terminatedPids,
          `Process ${selected.pid} completed execution at t=${currentTime}ms.`
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
      `SRTF simulation complete for all ${workload.length} processes at t=${currentTime}ms.`
    )
  );

  const { processMetrics, metrics } = calculateCompletedMetrics(workload, gantt, contextSwitchCount);

  return Object.freeze({
    algorithm: 'SRTF (Preemptive)',
    gantt: Object.freeze(gantt),
    processMetrics: Object.freeze(processMetrics),
    metrics,
    stepSnapshots: Object.freeze(snapshots),
  });
}
