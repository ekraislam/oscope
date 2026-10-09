/**
 * OScope — First-Come, First-Served (FCFS) CPU Scheduling Engine
 * Non-preemptive scheduling respecting arrival order, idle intervals, and context switches.
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
  compareByArrivalThenPid,
  appendGanttSegment,
  calculateCompletedMetrics,
  makeSchedulingSnapshot,
} from './shared';

export function runFCFS(
  processes: readonly ProcessInput[],
  options?: SchedulingOptions
): SchedulingResult {
  const workload = normalizeWorkload(processes);
  const gantt: GanttSegment[] = [];
  const snapshots: SchedulingSnapshot[] = [];
  const csCost = options?.contextSwitchCost && options.contextSwitchCost > 0 ? options.contextSwitchCost : 0;

  if (workload.length === 0) {
    return {
      algorithm: 'FCFS',
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

  const uncompleted = [...workload];

  while (uncompleted.length > 0) {
    // 1. Identify ready processes that have arrived by currentTime
    const ready = uncompleted.filter((p) => p.arrivalTime <= currentTime);

    // If no process has arrived, advance time to next arrival and log IDLE
    if (ready.length === 0) {
      const nextArrival = Math.min(...uncompleted.map((p) => p.arrivalTime));
      appendGanttSegment(gantt, 'IDLE', 'IDLE', currentTime, nextArrival);
      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          null,
          [],
          terminatedPids,
          `CPU idle from t=${currentTime} to t=${nextArrival} awaiting next arrival.`
        )
      );
      currentTime = nextArrival;
      lastRanPid = null;
      continue;
    }

    // 2. Select process with earliest arrival time (tie-breaker: PID ascending)
    ready.sort(compareByArrivalThenPid);
    const selected = ready[0];

    // 3. Handle zero-burst processes immediately
    if (selected.burstTime === 0) {
      if (selected.startTime === null) selected.startTime = currentTime;
      selected.completionTime = currentTime;
      selected.remainingTime = 0;

      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          selected.pid,
          ready.slice(1),
          terminatedPids,
          `Process ${selected.pid} has burst time = 0. Completed immediately at t=${currentTime}.`
        )
      );

      terminatedPids.push(selected.pid);
      const idx = uncompleted.indexOf(selected);
      if (idx !== -1) uncompleted.splice(idx, 1);
      continue;
    }

    // 4. Context Switch Overhead: Process-to-process switch (P1 -> P2)
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
            `Context switch overhead: Transitioning CPU from ${lastRanPid} to ${selected.pid} (cost: ${csCost}ms).`
          )
        );
        currentTime += csCost;
      }
    }

    // 5. Execute selected process non-preemptively to completion
    if (selected.startTime === null) {
      selected.startTime = currentTime;
    }

    const duration = selected.burstTime;
    const finishTime = currentTime + duration;

    snapshots.push(
      makeSchedulingSnapshot(
        currentTime,
        selected.pid,
        ready.slice(1),
        terminatedPids,
        `FCFS dispatched ${selected.pid} (Arrival: ${selected.arrivalTime}ms, Burst: ${selected.burstTime}ms). Running to completion.`
      )
    );

    appendGanttSegment(gantt, 'PROCESS', selected.pid, currentTime, finishTime);
    currentTime = finishTime;
    selected.remainingTime = 0;
    selected.completionTime = finishTime;
    lastRanPid = selected.pid;

    terminatedPids.push(selected.pid);
    const removeIdx = uncompleted.indexOf(selected);
    if (removeIdx !== -1) uncompleted.splice(removeIdx, 1);
  }

  // Final snapshot at completion
  snapshots.push(
    makeSchedulingSnapshot(
      currentTime,
      null,
      [],
      terminatedPids,
      `All ${workload.length} processes completed. Total makespan: ${currentTime}ms.`
    )
  );

  const { processMetrics, metrics } = calculateCompletedMetrics(workload, gantt, contextSwitchCount);

  return Object.freeze({
    algorithm: 'FCFS',
    gantt: Object.freeze(gantt),
    processMetrics: Object.freeze(processMetrics),
    metrics,
    stepSnapshots: Object.freeze(snapshots),
  });
}
