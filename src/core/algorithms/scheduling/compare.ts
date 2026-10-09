/**
 * OScope — Multi-Algorithm CPU Scheduling Comparison Engine
 * Executes all 6 schedulers on the IDENTICAL workload to produce fair, objective academic comparisons.
 */

import type { ProcessInput, SchedulingResult, SchedulingOptions } from '../../models';
import { runFCFS } from './fcfs';
import { runSJFNonPreemptive } from './sjf';
import { runSRTFPreemptive } from './srtf';
import { runPriorityNonPreemptive, runPriorityPreemptive } from './priority';
import { runRoundRobin } from './roundRobin';

export type SchedulerType =
  | 'FCFS'
  | 'SJF_NON_PREEMPTIVE'
  | 'SRTF_PREEMPTIVE'
  | 'PRIORITY_NON_PREEMPTIVE'
  | 'PRIORITY_PREEMPTIVE'
  | 'ROUND_ROBIN';

export interface ComparisonRow {
  readonly id: SchedulerType;
  readonly name: string;
  readonly isPreemptive: boolean;
  readonly averageWaitingTime: number;
  readonly averageTurnaroundTime: number;
  readonly averageResponseTime: number;
  readonly cpuUtilization: number;
  readonly throughput: number;
  readonly contextSwitches: number;
  readonly totalMakespan: number;
  readonly starvationRisk: 'NONE' | 'POSSIBLE' | 'HIGH';
}

export interface SchedulingComparisonResult {
  readonly workload: readonly ProcessInput[];
  readonly options: SchedulingOptions;
  readonly results: Record<SchedulerType, SchedulingResult>;
  readonly rows: readonly ComparisonRow[];
  readonly bestMetrics: {
    readonly lowestWaitingTime: { readonly algorithmName: string; readonly value: number };
    readonly lowestTurnaroundTime: { readonly algorithmName: string; readonly value: number };
    readonly lowestResponseTime: { readonly algorithmName: string; readonly value: number };
    readonly highestUtilization: { readonly algorithmName: string; readonly value: number };
  };
  readonly fairnessNotice: string;
}

export function compareAllSchedulers(
  workload: readonly ProcessInput[],
  options?: SchedulingOptions
): SchedulingComparisonResult {
  const opts = options ?? {};

  const results: Record<SchedulerType, SchedulingResult> = {
    FCFS: runFCFS(workload, opts),
    SJF_NON_PREEMPTIVE: runSJFNonPreemptive(workload, opts),
    SRTF_PREEMPTIVE: runSRTFPreemptive(workload, opts),
    PRIORITY_NON_PREEMPTIVE: runPriorityNonPreemptive(workload, opts),
    PRIORITY_PREEMPTIVE: runPriorityPreemptive(workload, opts),
    ROUND_ROBIN: runRoundRobin(workload, opts),
  };

  const rows: ComparisonRow[] = [
    {
      id: 'FCFS',
      name: 'FCFS (First-Come First-Served)',
      isPreemptive: false,
      averageWaitingTime: results.FCFS.metrics.averageWaitingTime,
      averageTurnaroundTime: results.FCFS.metrics.averageTurnaroundTime,
      averageResponseTime: results.FCFS.metrics.averageResponseTime,
      cpuUtilization: results.FCFS.metrics.cpuUtilization,
      throughput: results.FCFS.metrics.throughput,
      contextSwitches: results.FCFS.metrics.contextSwitchCount,
      totalMakespan: results.FCFS.metrics.totalTime,
      starvationRisk: 'NONE',
    },
    {
      id: 'SJF_NON_PREEMPTIVE',
      name: 'SJF (Shortest Job First)',
      isPreemptive: false,
      averageWaitingTime: results.SJF_NON_PREEMPTIVE.metrics.averageWaitingTime,
      averageTurnaroundTime: results.SJF_NON_PREEMPTIVE.metrics.averageTurnaroundTime,
      averageResponseTime: results.SJF_NON_PREEMPTIVE.metrics.averageResponseTime,
      cpuUtilization: results.SJF_NON_PREEMPTIVE.metrics.cpuUtilization,
      throughput: results.SJF_NON_PREEMPTIVE.metrics.throughput,
      contextSwitches: results.SJF_NON_PREEMPTIVE.metrics.contextSwitchCount,
      totalMakespan: results.SJF_NON_PREEMPTIVE.metrics.totalTime,
      starvationRisk: 'POSSIBLE',
    },
    {
      id: 'SRTF_PREEMPTIVE',
      name: 'SRTF (Shortest Remaining Time First)',
      isPreemptive: true,
      averageWaitingTime: results.SRTF_PREEMPTIVE.metrics.averageWaitingTime,
      averageTurnaroundTime: results.SRTF_PREEMPTIVE.metrics.averageTurnaroundTime,
      averageResponseTime: results.SRTF_PREEMPTIVE.metrics.averageResponseTime,
      cpuUtilization: results.SRTF_PREEMPTIVE.metrics.cpuUtilization,
      throughput: results.SRTF_PREEMPTIVE.metrics.throughput,
      contextSwitches: results.SRTF_PREEMPTIVE.metrics.contextSwitchCount,
      totalMakespan: results.SRTF_PREEMPTIVE.metrics.totalTime,
      starvationRisk: 'HIGH',
    },
    {
      id: 'PRIORITY_NON_PREEMPTIVE',
      name: 'Priority (Non-Preemptive)',
      isPreemptive: false,
      averageWaitingTime: results.PRIORITY_NON_PREEMPTIVE.metrics.averageWaitingTime,
      averageTurnaroundTime: results.PRIORITY_NON_PREEMPTIVE.metrics.averageTurnaroundTime,
      averageResponseTime: results.PRIORITY_NON_PREEMPTIVE.metrics.averageResponseTime,
      cpuUtilization: results.PRIORITY_NON_PREEMPTIVE.metrics.cpuUtilization,
      throughput: results.PRIORITY_NON_PREEMPTIVE.metrics.throughput,
      contextSwitches: results.PRIORITY_NON_PREEMPTIVE.metrics.contextSwitchCount,
      totalMakespan: results.PRIORITY_NON_PREEMPTIVE.metrics.totalTime,
      starvationRisk: 'HIGH',
    },
    {
      id: 'PRIORITY_PREEMPTIVE',
      name: 'Priority (Preemptive)',
      isPreemptive: true,
      averageWaitingTime: results.PRIORITY_PREEMPTIVE.metrics.averageWaitingTime,
      averageTurnaroundTime: results.PRIORITY_PREEMPTIVE.metrics.averageTurnaroundTime,
      averageResponseTime: results.PRIORITY_PREEMPTIVE.metrics.averageResponseTime,
      cpuUtilization: results.PRIORITY_PREEMPTIVE.metrics.cpuUtilization,
      throughput: results.PRIORITY_PREEMPTIVE.metrics.throughput,
      contextSwitches: results.PRIORITY_PREEMPTIVE.metrics.contextSwitchCount,
      totalMakespan: results.PRIORITY_PREEMPTIVE.metrics.totalTime,
      starvationRisk: 'HIGH',
    },
    {
      id: 'ROUND_ROBIN',
      name: results.ROUND_ROBIN.algorithm,
      isPreemptive: true,
      averageWaitingTime: results.ROUND_ROBIN.metrics.averageWaitingTime,
      averageTurnaroundTime: results.ROUND_ROBIN.metrics.averageTurnaroundTime,
      averageResponseTime: results.ROUND_ROBIN.metrics.averageResponseTime,
      cpuUtilization: results.ROUND_ROBIN.metrics.cpuUtilization,
      throughput: results.ROUND_ROBIN.metrics.throughput,
      contextSwitches: results.ROUND_ROBIN.metrics.contextSwitchCount,
      totalMakespan: results.ROUND_ROBIN.metrics.totalTime,
      starvationRisk: 'NONE',
    },
  ];

  // Compute best performing metrics on this workload
  let bestWT = rows[0];
  let bestTAT = rows[0];
  let bestRT = rows[0];
  let bestUtil = rows[0];

  for (const r of rows) {
    if (r.averageWaitingTime < bestWT.averageWaitingTime) bestWT = r;
    if (r.averageTurnaroundTime < bestTAT.averageTurnaroundTime) bestTAT = r;
    if (r.averageResponseTime < bestRT.averageResponseTime) bestRT = r;
    if (r.cpuUtilization > bestUtil.cpuUtilization) bestUtil = r;
  }

  return Object.freeze({
    workload: Object.freeze([...workload]),
    options: Object.freeze({ ...opts }),
    results: Object.freeze(results),
    rows: Object.freeze(rows),
    bestMetrics: Object.freeze({
      lowestWaitingTime: { algorithmName: bestWT.name, value: bestWT.averageWaitingTime },
      lowestTurnaroundTime: { algorithmName: bestTAT.name, value: bestTAT.averageTurnaroundTime },
      lowestResponseTime: { algorithmName: bestRT.name, value: bestRT.averageResponseTime },
      highestUtilization: { algorithmName: bestUtil.name, value: bestUtil.cpuUtilization },
    }),
    fairnessNotice:
      'All 6 scheduling algorithms are evaluated against the exact same process workload. Performance differences reflect algorithm design trade-offs rather than workload variation.',
  });
}
