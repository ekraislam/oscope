/**
 * OScope — Shortest Job First (SJF) Non-Preemptive CPU Scheduling Engine
 * Selects the ready process with the smallest initial burst time and runs it to completion.
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

export function runSJFNonPreemptive(
  processes: readonly ProcessInput[],
  options?: SchedulingOptions
): SchedulingResult {
  const workload = normalizeWorkload(processes);
  const gantt: GanttSegment[] = [];
  const snapshots: SchedulingSnapshot[] = [];
  const csCost = options?.contextSwitchCost && options.contextSwitchCost > 0 ? options.contextSwitchCost : 0;

  if (workload.length === 0) {
    return {
      algorithm: 'SJF (Non-Preemptive)',
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

  function sjfComparator(a: InternalProcess, b: InternalProcess): number {
    // 1. Primary: Shortest burst time
    if (a.burstTime !== b.burstTime) {
      return a.burstTime - b.burstTime;
    }
    // 2. Secondary: Earlier arrival time
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }
    // 3. Final: Natural PID order
    return comparePids(a.pid, b.pid);
  }

  while (uncompleted.length > 0) {
    const ready = uncompleted.filter((p) => p.arrivalTime <= currentTime);

    if (ready.length === 0) {
      const nextArrival = Math.min(...uncompleted.map((p) => p.arrivalTime));
      appendGanttSegment(gantt, 'IDLE', 'IDLE', currentTime, nextArrival);
      snapshots.push(
        makeSchedulingSnapshot(
          currentTime,
          null,
          [],
          terminatedPids,
          `CPU idle from t=${currentTime} to t=${nextArrival}. Awaiting arrivals.`
        )
      );
      currentTime = nextArrival;
      lastRanPid = null;
      continue;
    }

    ready.sort(sjfComparator);
    const selected = ready[0];

    // Handle zero burst time immediately
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

    // Context switch if switching processes
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

    const duration = selected.burstTime;
    const finishTime = currentTime + duration;

    snapshots.push(
      makeSchedulingSnapshot(
        currentTime,
        selected.pid,
        ready.slice(1),
        terminatedPids,
        `SJF selected ${selected.pid} because it has the shortest burst time (${selected.burstTime}ms) among ready processes. Running to completion.`
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

  snapshots.push(
    makeSchedulingSnapshot(
      currentTime,
      null,
      [],
      terminatedPids,
      `SJF execution finished for all ${workload.length} processes at t=${currentTime}ms.`
    )
  );

  const { processMetrics, metrics } = calculateCompletedMetrics(workload, gantt, contextSwitchCount);

  return Object.freeze({
    algorithm: 'SJF (Non-Preemptive)',
    gantt: Object.freeze(gantt),
    processMetrics: Object.freeze(processMetrics),
    metrics,
    stepSnapshots: Object.freeze(snapshots),
  });
}
