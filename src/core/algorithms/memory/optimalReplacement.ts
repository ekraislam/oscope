/**
 * OScope — Optimal (OPT / MIN / Bélády's Optimal) Page Replacement Engine
 * Theoretical benchmark algorithm that evicts the resident page whose next reference
 * occurs furthest in the future (or never again).
 */

import type { ReplacementResult, PageReference } from '../../models/memory';
import { validateReferenceString } from '../../utils/validation';

/**
 * Executes pure Optimal page replacement simulation with future reference lookahead.
 */
export function runOptimalReplacement(
  referenceString: readonly number[],
  frameCount: number
): ReplacementResult {
  const validation = validateReferenceString(referenceString);
  if (!validation.valid) {
    throw new Error(`OptimalReplacementError: ${validation.errors.join('; ')}`);
  }

  if (frameCount <= 0 || !Number.isInteger(frameCount)) {
    throw new Error(`OptimalReplacementError: Frame count must be a positive integer, received: ${frameCount}`);
  }

  const frames: (number | null)[] = new Array(frameCount).fill(null);

  const steps: PageReference[] = [];
  let totalHits = 0;
  let totalFaults = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const existingFrameIdx = frames.indexOf(page);

    if (existingFrameIdx !== -1) {
      // PAGE HIT
      totalHits += 1;
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
        // All frames full: Look into future reference string (from i + 1 to end)
        let farthestNextUse = -1;
        let victimFrameIdx = 0;

        for (let f = 0; f < frames.length; f++) {
          const resPage = frames[f]!;

          // Find index of next occurrence of resPage in future references
          let nextOccurrence = Infinity;
          for (let k = i + 1; k < referenceString.length; k++) {
            if (referenceString[k] === resPage) {
              nextOccurrence = k;
              break;
            }
          }

          // If a page is never referenced again (Infinity), it is an immediate top candidate
          if (nextOccurrence > farthestNextUse) {
            farthestNextUse = nextOccurrence;
            victimFrameIdx = f;
          }
        }

        evictedPage = frames[victimFrameIdx]!;
        targetFrameIdx = victimFrameIdx;
        frames[targetFrameIdx] = page;
      }

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
    algorithm: 'OPTIMAL',
    referenceString: Object.freeze([...referenceString]),
    frameCount,
    steps: Object.freeze(steps),
    totalFaults,
    totalHits,
    faultRate,
    hitRate,
  });
}
