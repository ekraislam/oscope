/**
 * OScope — Page Replacement Multi-Algorithm Comparison Engine
 * Executes FIFO, LRU, and Optimal algorithms on the identical reference string and frame count.
 */

import type { ReplacementResult, ReplacementAlgorithm } from '../../models/memory';
import { runFIFOReplacement } from './fifoReplacement';
import { runLRUReplacement } from './lruReplacement';
import { runOptimalReplacement } from './optimalReplacement';

export interface PageReplacementComparisonRow {
  readonly algorithm: ReplacementAlgorithm;
  readonly name: string;
  readonly description: string;
  readonly totalFaults: number;
  readonly totalHits: number;
  readonly faultRate: number;
  readonly hitRate: number;
  readonly isTheoretical: boolean;
}

export interface PageReplacementComparisonResult {
  readonly referenceString: readonly number[];
  readonly frameCount: number;
  readonly results: Record<ReplacementAlgorithm, ReplacementResult>;
  readonly rows: readonly PageReplacementComparisonRow[];
  readonly lowestFaultAlgorithm: {
    readonly algorithm: ReplacementAlgorithm;
    readonly name: string;
    readonly faults: number;
  };
  readonly fairnessNotice: string;
}

/**
 * Runs FIFO, LRU, and Optimal on the exact same reference string and frame count.
 */
export function compareReplacementAlgorithms(
  referenceString: readonly number[],
  frameCount: number
): PageReplacementComparisonResult {
  const fifo = runFIFOReplacement(referenceString, frameCount);
  const lru = runLRUReplacement(referenceString, frameCount);
  const optimal = runOptimalReplacement(referenceString, frameCount);

  const results: Record<ReplacementAlgorithm, ReplacementResult> = {
    FIFO: fifo,
    LRU: lru,
    OPTIMAL: optimal,
  };

  const rows: PageReplacementComparisonRow[] = [
    {
      algorithm: 'FIFO',
      name: 'First-In, First-Out (FIFO)',
      description: 'Replaces the oldest resident page. Simple O(1) queue overhead; susceptible to Belady’s Anomaly.',
      totalFaults: fifo.totalFaults,
      totalHits: fifo.totalHits,
      faultRate: fifo.faultRate,
      hitRate: fifo.hitRate,
      isTheoretical: false,
    },
    {
      algorithm: 'LRU',
      name: 'Least Recently Used (LRU)',
      description: 'Replaces the page unused for the longest time. Exploits temporal locality; requires hardware stack or counters.',
      totalFaults: lru.totalFaults,
      totalHits: lru.totalHits,
      faultRate: lru.faultRate,
      hitRate: lru.hitRate,
      isTheoretical: false,
    },
    {
      algorithm: 'OPTIMAL',
      name: 'Optimal Page Replacement (OPT)',
      description: 'Replaces the page whose next reference occurs furthest in the future. Theoretical upper-bound benchmark.',
      totalFaults: optimal.totalFaults,
      totalHits: optimal.totalHits,
      faultRate: optimal.faultRate,
      hitRate: optimal.hitRate,
      isTheoretical: true,
    },
  ];

  // Identify lowest page faults on this workload
  let lowestRow = rows[0];
  for (const r of rows) {
    if (r.totalFaults < lowestRow.totalFaults) {
      lowestRow = r;
    }
  }

  return Object.freeze({
    referenceString: Object.freeze([...referenceString]),
    frameCount,
    results: Object.freeze(results),
    rows: Object.freeze(rows),
    lowestFaultAlgorithm: Object.freeze({
      algorithm: lowestRow.algorithm,
      name: lowestRow.name,
      faults: lowestRow.totalFaults,
    }),
    fairnessNotice:
      'All 3 page replacement algorithms are evaluated against the exact same page reference string and frame count. Optimal provides the theoretical minimum page-fault benchmark for this workload.',
  });
}

/**
 * Specifically tests for Belady's Anomaly for FIFO across two frame counts (e.g. 3 vs 4 frames).
 */
export function checkBeladyAnomaly(
  referenceString: readonly number[],
  smallerFrameCount: number = 3,
  largerFrameCount: number = 4
): {
  isAnomalyDetected: boolean;
  smallerResult: ReplacementResult;
  largerResult: ReplacementResult;
  explanation: string;
} {
  const smallerResult = runFIFOReplacement(referenceString, smallerFrameCount);
  const largerResult = runFIFOReplacement(referenceString, largerFrameCount);

  const isAnomalyDetected = largerResult.totalFaults > smallerResult.totalFaults;

  const explanation = isAnomalyDetected
    ? `Bélády's Anomaly Observed! With ${smallerFrameCount} frames, FIFO generated ${smallerResult.totalFaults} page faults. When physical memory was increased to ${largerFrameCount} frames, page faults unexpectedly increased to ${largerResult.totalFaults}!`
    : `Standard behavior: ${smallerFrameCount} frames yielded ${smallerResult.totalFaults} faults; ${largerFrameCount} frames yielded ${largerResult.totalFaults} faults. (No anomaly on this string).`;

  return Object.freeze({
    isAnomalyDetected,
    smallerResult,
    largerResult,
    explanation,
  });
}
