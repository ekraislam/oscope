/**
 * OScope — Least Recently Used (LRU) Page Replacement Engine
 * Replaces the resident page whose most recent reference timestamp is furthest in the past.
 */

import type { ReplacementResult, PageReference } from '../../models/memory';
import { validateReferenceString } from '../../utils/validation';

/**
 * Executes pure LRU page replacement simulation.
 * Updates access recency on every page reference (both hits and faults).
 */
export function runLRUReplacement(
  referenceString: readonly number[],
  frameCount: number
): ReplacementResult {
  const validation = validateReferenceString(referenceString);
  if (!validation.valid) {
    throw new Error(`LRUReplacementError: ${validation.errors.join('; ')}`);
  }

  if (frameCount <= 0 || !Number.isInteger(frameCount)) {
    throw new Error(`LRUReplacementError: Frame count must be a positive integer, received: ${frameCount}`);
  }

  const frames: (number | null)[] = new Array(frameCount).fill(null);

  // Map storing pageNumber -> lastReferencedStep (step index 0..N-1)
  const lastUsedMap = new Map<number, number>();

  const steps: PageReference[] = [];
  let totalHits = 0;
  let totalFaults = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const existingFrameIdx = frames.indexOf(page);

    if (existingFrameIdx !== -1) {
      // PAGE HIT: Update recency of accessed page!
      totalHits += 1;
      lastUsedMap.set(page, i);

      steps.push(
        Object.freeze({
          step: i + 1,
          pageNumber: page,
          isHit: true,
          tlbHit: false,
          evictedPage: null,
          allocatedFrame: existingFrameIdx,
          memoryFramesSnapshot: Object.freeze([...frames]),
        })
      );
    } else {
      // PAGE FAULT
      totalFaults += 1;
      let targetFrameIdx = frames.indexOf(null);
      let evictedPage: number | null = null;

      if (targetFrameIdx !== -1) {
        // Free frame available
        frames[targetFrameIdx] = page;
      } else {
        // Find resident page with the minimum last-used step
        let lruPage = frames[0]!;
        let minStep = lastUsedMap.get(lruPage) ?? 0;
        let lruFrameIdx = 0;

        for (let f = 1; f < frames.length; f++) {
          const resPage = frames[f]!;
          const stepVal = lastUsedMap.get(resPage) ?? 0;
          if (stepVal < minStep) {
            minStep = stepVal;
            lruPage = resPage;
            lruFrameIdx = f;
          }
        }

        evictedPage = lruPage;
        lastUsedMap.delete(evictedPage);
        targetFrameIdx = lruFrameIdx;
        frames[targetFrameIdx] = page;
      }

      lastUsedMap.set(page, i);

      steps.push(
        Object.freeze({
          step: i + 1,
          pageNumber: page,
          isHit: false,
          tlbHit: false,
          evictedPage,
          allocatedFrame: targetFrameIdx,
          memoryFramesSnapshot: Object.freeze([...frames]),
        })
      );
    }
  }

  const total = referenceString.length;
  const faultRate = total > 0 ? (totalFaults / total) * 100 : 0;
  const hitRate = total > 0 ? (totalHits / total) * 100 : 0;

  return Object.freeze({
    algorithm: 'LRU',
    referenceString: Object.freeze([...referenceString]),
    frameCount,
    steps: Object.freeze(steps),
    totalFaults,
    totalHits,
    faultRate,
    hitRate,
  });
}
