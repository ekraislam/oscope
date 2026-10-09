/**
 * OScope — Priority CPU Scheduling Engines (Preemptive & Non-Preemptive)
 * Prioritizes ready processes based on priority numbers (supports lower=higher or higher=higher directions).
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
  comparePriority,
  appendGanttSegment,
  calculateCompletedMetrics,
  makeSchedulingSnapshot,
  type InternalProcess,
} from './shared';

/**
 * Non-Preemptive Priority Scheduling
 */
export function runPriorityNonPreemptive(
  processes: readonly ProcessInput[],
  options?: SchedulingOptions
): SchedulingResult {
  const workload = normalizeWorkload(processes);
  const gantt: GanttSegment[] = [];
  const snapshots: SchedulingSnapshot[] = [];
  const csCost = options?.contextSwitchCost && options.contextSwitchCost > 0 ? options.contextSwitchCost : 0;
  const priorityType = options?.priorityType ?? 'LOWER_NUMBER_HIGHER_PRIORITY';

  if (workload.length === 0) {
    return {
      algorithm: 'Priority (Non-Preemptive)',
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

  function priorityComparator(a: InternalProcess, b: InternalProcess): number {
    const pDiff = comparePriority(a, b, priorityType);
    if (pDiff !== 0) return pDiff;
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
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

    ready.sort(priorityComparator);
    const selected = ready[0];

    // Zero burst process
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

      const idx = uncompleted.indexOf(selected);
      if (idx !== -1) uncompleted.splice(idx, 1);
      continue;
    }

    // Context switch
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
        `Priority Non-Preemptive selected ${selected.pid} with priority ${selected.priority}. Running to completion.`
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

  const { processMetrics, metrics } = calculateCompletedMetrics(workload, gantt, contextSwitchCount);

  return Object.freeze({
    algorithm: 'Priority (Non-Preemptive)',
    gantt: Object.freeze(gantt),
    processMetrics: Object.freeze(processMetrics),
    metrics,
    stepSnapshots: Object.freeze(snapshots),
  });
}

/**
 * Preemptive Priority Scheduling
 */
export function runPriorityPreemptive(
  processes: readonly ProcessInput[],
  options?: SchedulingOptions
): SchedulingResult {
  const workload = normalizeWorkload(processes);
  const gantt: GanttSegment[] = [];
  const snapshots: SchedulingSnapshot[] = [];
  const csCost = options?.contextSwitchCost && options.contextSwitchCost > 0 ? options.contextSwitchCost : 0;
  const priorityType = options?.priorityType ?? 'LOWER_NUMBER_HIGHER_PRIORITY';

  if (workload.length === 0) {
    return {
      algorithm: 'Priority (Preemptive)',
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

  function priorityComparator(a: InternalProcess, b: InternalProcess): number {
    const pDiff = comparePriority(a, b, priorityType);
    if (pDiff !== 0) return pDiff;
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return comparePids(a.pid, b.pid);
  }

  while (terminatedPids.length < workload.length) {
    const ready = workload.filter(
      (p) => p.arrivalTime <= currentTime && !terminatedPids.includes(p.pid)
    );

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
          `CPU idle from t=${currentTime} to t=${nextArrival}. Awaiting arrivals.`
        )
      );
      currentTime = nextArrival;
      lastRanPid = null;
      continue;
    }

    ready.sort(priorityComparator);
    const selected = ready[0];

    // Zero burst process
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
          `Process ${selected.pid} (Priority ${selected.priority}) has burst = 0. Finished immediately.`
        )
      );
      continue;
    }

    // Context switch
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

    // Look ahead to next arrival of a process that might have higher priority
    const futureArrivals = workload.filter(
      (p) => p.arrivalTime > currentTime && !terminatedPids.includes(p.pid)
    );
    const nextEventArrival =
      futureArrivals.length > 0 ? Math.min(...futureArrivals.map((p) => p.arrivalTime)) : Infinity;

    const timeUntilNextArrival = nextEventArrival - currentTime;
    const runDuration = Math.min(selected.remainingTime, timeUntilNextArrival);

    const segmentEnd = currentTime + runDuration;
    appendGanttSegment(gantt, 'PROCESS', selected.pid, currentTime, segmentEnd);

    snapshots.push(
      makeSchedulingSnapshot(
        currentTime,
        selected.pid,
        ready.slice(1),
        terminatedPids,
        `Priority Preemptive running ${selected.pid} (Priority ${selected.priority}, Remaining: ${selected.remainingTime}ms).`
      )
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

  const { processMetrics, metrics } = calculateCompletedMetrics(workload, gantt, contextSwitchCount);

  return Object.freeze({
    algorithm: 'Priority (Preemptive)',
    gantt: Object.freeze(gantt),
    processMetrics: Object.freeze(processMetrics),
    metrics,
    stepSnapshots: Object.freeze(snapshots),
  });
}
