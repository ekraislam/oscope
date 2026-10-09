/**
 * OScope — CPU Scheduling Domain Models & Contracts
 * Pure data models for Gantt charts, process metrics, and scheduler results.
 */

import type { ProcessInput } from './process';

export type GanttSegmentType = 'PROCESS' | 'IDLE' | 'CONTEXT_SWITCH';

export type SchedulerType =
  | 'FCFS'
  | 'SJF_NON_PREEMPTIVE'
  | 'SRTF_PREEMPTIVE'
  | 'PRIORITY_NON_PREEMPTIVE'
  | 'PRIORITY_PREEMPTIVE'
  | 'ROUND_ROBIN';

export interface GanttSegment {
  readonly type: GanttSegmentType;
  readonly pid: string | 'IDLE' | 'CS';
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
}

export interface ProcessMetrics {
  readonly pid: string;
  readonly arrivalTime: number;
  readonly burstTime: number;
  readonly completionTime: number;
  readonly turnaroundTime: number; // CT - AT
  readonly waitingTime: number;    // TT - BT
  readonly responseTime: number;   // FirstStartTime - AT
}

export interface AggregateMetrics {
  readonly averageWaitingTime: number;
  readonly averageTurnaroundTime: number;
  readonly averageResponseTime: number;
  readonly cpuUtilization: number;    // [0 - 100]%
  readonly throughput: number;        // completed processes / total time
  readonly contextSwitchCount: number;
  readonly totalTime: number;
}

export interface SchedulingSnapshot {
  readonly time: number;
  readonly runningPid: string | null;
  readonly readyQueue: readonly string[];
  readonly waitingQueue: readonly string[];
  readonly terminatedQueue: readonly string[];
  readonly remainingBurst?: Readonly<Record<string, number>>;
  readonly explanation: string;
}

export interface SchedulingResult {
  readonly algorithm: string;
  readonly gantt: readonly GanttSegment[];
  readonly processMetrics: Readonly<Record<string, ProcessMetrics>>;
  readonly metrics: AggregateMetrics;
  readonly stepSnapshots: readonly SchedulingSnapshot[];
}

export type PriorityTieBreaker = 'PID_ASCENDING' | 'FIFO';

export interface SchedulingOptions {
  readonly quantum?: number;
  readonly contextSwitchCost?: number;
  readonly priorityType?: 'LOWER_NUMBER_HIGHER_PRIORITY' | 'HIGHER_NUMBER_HIGHER_PRIORITY';
  readonly tieBreaker?: PriorityTieBreaker;
}

/**
 * Standard contract for pure CPU scheduler algorithms.
 * Every scheduler implementation (FCFS, SJF, SRTF, Priority, RR) implements this interface.
 */
export type SchedulerFunction = (
  processes: readonly ProcessInput[],
  options?: SchedulingOptions
) => SchedulingResult;
