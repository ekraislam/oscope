/**
 * OScope — Shared Scheduling Engine Primitives & Helpers
 * Pure mathematical functions for workload normalization, deterministic tie-breaking,
 * Gantt segment compaction, and standardized metric calculations.
 */

import type {
  ProcessInput,
  ProcessMetrics,
  AggregateMetrics,
  GanttSegment,
  SchedulingSnapshot,
  SchedulingOptions,
} from '../../models';
import {
  calculateTurnaroundTime,
  calculateWaitingTime,
  calculateResponseTime,
  calculateCPUUtilizationPercentage,
  calculateThroughput,
  calculateAverage,
} from '../../utils/metrics';

export interface InternalProcess {
  readonly pid: string;
  readonly name: string;
  readonly arrivalTime: number;
  readonly burstTime: number;
  readonly priority: number;
  remainingTime: number;
  startTime: number | null;
  completionTime: number | null;
}

/**
 * Normalizes and deep-copies user process input, enforcing immutability.
 * Disallows mutating the caller's objects.
 */
export function normalizeWorkload(processes: readonly ProcessInput[]): InternalProcess[] {
  return processes.map((p) => ({
    pid: p.pid.trim(),
    name: p.name && p.name.trim().length > 0 ? p.name.trim() : p.pid.trim(),
    arrivalTime: Math.max(0, p.arrivalTime),
    burstTime: Math.max(0, p.burstTime),
    priority: p.priority !== undefined ? p.priority : 0,
    remainingTime: Math.max(0, p.burstTime),
    startTime: null,
    completionTime: null,
  }));
}

/**
 * Deterministic natural comparator for PIDs.
 * Handles alphanumeric sorting properly (e.g. "P2" comes before "P10").
 */
export function comparePids(pidA: string, pidB: string): number {
  return pidA.localeCompare(pidB, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Standard deterministic tie-breaker for ready processes:
 * 1. Primary: Earliest arrival time
 * 2. Secondary: Natural PID ascending
 */
export function compareByArrivalThenPid(a: InternalProcess, b: InternalProcess): number {
  if (a.arrivalTime !== b.arrivalTime) {
    return a.arrivalTime - b.arrivalTime;
  }
  return comparePids(a.pid, b.pid);
}

/**
 * Evaluates priority comparison based on priority direction option:
 * Default: LOWER_NUMBER_HIGHER_PRIORITY (Unix/Linux niceness style: 0 is highest)
 */
export function comparePriority(
  a: InternalProcess,
  b: InternalProcess,
  priorityType: SchedulingOptions['priorityType'] = 'LOWER_NUMBER_HIGHER_PRIORITY'
): number {
  if (priorityType === 'HIGHER_NUMBER_HIGHER_PRIORITY') {
    return b.priority - a.priority; // higher number first
  }
  return a.priority - b.priority;   // lower number first
}

/**
 * Appends a Gantt segment to the timeline, automatically merging adjacent
 * segments of the same process and type to keep charts clean.
 * Strictly ignores zero-duration segments.
 */
export function appendGanttSegment(
  gantt: GanttSegment[],
  type: GanttSegment['type'],
  pid: string | 'IDLE' | 'CS',
  startTime: number,
  endTime: number
): void {
  if (endTime <= startTime) {
    return; // Never generate zero-duration or negative Gantt segments
  }

  const duration = endTime - startTime;
  const last = gantt[gantt.length - 1];

  // Merge contiguous segments of same type and PID
  if (last && last.type === type && last.pid === pid && last.endTime === startTime) {
    gantt[gantt.length - 1] = {
      type,
      pid,
      startTime: last.startTime,
      endTime,
      duration: last.duration + duration,
    };
  } else {
    gantt.push(
      Object.freeze({
        type,
        pid,
        startTime,
        endTime,
        duration,
      })
    );
  }
}

/**
 * Computes exact per-process and aggregate metrics.
 * Retains raw mathematical precision without UI truncation.
 */
export function calculateCompletedMetrics(
  workload: readonly InternalProcess[],
  gantt: readonly GanttSegment[],
  contextSwitchCount: number
): {
  processMetrics: Record<string, ProcessMetrics>;
  metrics: AggregateMetrics;
} {
  const processMetrics: Record<string, ProcessMetrics> = {};
  const waitingTimes: number[] = [];
  const turnaroundTimes: number[] = [];
  const responseTimes: number[] = [];

  let totalActiveCPUTime = 0;

  for (const proc of workload) {
    const ct = proc.completionTime ?? proc.arrivalTime;
    const tat = calculateTurnaroundTime(ct, proc.arrivalTime);
    const wt = calculateWaitingTime(tat, proc.burstTime);
    const st = proc.startTime !== null ? proc.startTime : proc.arrivalTime;
    const rt = calculateResponseTime(st, proc.arrivalTime);

    processMetrics[proc.pid] = Object.freeze({
      pid: proc.pid,
      arrivalTime: proc.arrivalTime,
      burstTime: proc.burstTime,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    });

    waitingTimes.push(wt);
    turnaroundTimes.push(tat);
    responseTimes.push(rt);
  }

  for (const segment of gantt) {
    if (segment.type === 'PROCESS') {
      totalActiveCPUTime += segment.duration;
    }
  }

  const totalMakespan = gantt.length > 0 ? gantt[gantt.length - 1].endTime : 0;
  const completedCount = workload.filter((p) => p.completionTime !== null).length;

  const aggregateMetrics: AggregateMetrics = Object.freeze({
    averageWaitingTime: calculateAverage(waitingTimes),
    averageTurnaroundTime: calculateAverage(turnaroundTimes),
    averageResponseTime: calculateAverage(responseTimes),
    cpuUtilization: calculateCPUUtilizationPercentage(totalActiveCPUTime, totalMakespan),
    throughput: calculateThroughput(completedCount, totalMakespan),
    contextSwitchCount,
    totalTime: totalMakespan,
  });

  return { processMetrics, metrics: aggregateMetrics };
}

/**
 * Creates an immutable scheduling step snapshot for step-by-step playback.
 */
export function makeSchedulingSnapshot(
  time: number,
  runningPid: string | null,
  readyQueue: readonly InternalProcess[],
  terminatedPids: readonly string[],
  explanation: string,
  workload?: readonly InternalProcess[]
): SchedulingSnapshot {
  const remainingBurst: Record<string, number> = {};
  if (workload) {
    for (const p of workload) {
      remainingBurst[p.pid] = p.remainingTime;
    }
  }

  return Object.freeze({
    time,
    runningPid,
    readyQueue: Object.freeze(readyQueue.map((p) => p.pid)),
    waitingQueue: Object.freeze([]),
    terminatedQueue: Object.freeze([...terminatedPids]),
    remainingBurst: Object.freeze(remainingBurst),
    explanation,
  });
}
