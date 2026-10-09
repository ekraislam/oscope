/**
 * OScope — First-In, First-Out (FIFO) Page Replacement Engine
 * Replaces the resident page that has been in physical memory for the longest time.
 */

import type { ReplacementResult, PageReference } from '../../models/memory';
import { validateReferenceString } from '../../utils/validation';

/**
 * Executes pure FIFO page replacement simulation.
 * Maintains page arrival order in physical frames.
 */
export function runFIFOReplacement(
  referenceString: readonly number[],
  frameCount: number
): ReplacementResult {
  const validation = validateReferenceString(referenceString);
  if (!validation.valid) {
    throw new Error(`FIFOReplacementError: ${validation.errors.join('; ')}`);
  }

  if (frameCount <= 0 || !Number.isInteger(frameCount)) {
    throw new Error(`FIFOReplacementError: Frame count must be a positive integer, received: ${frameCount}`);
  }

  // Physical frames holding page numbers, initially empty
  const frames: (number | null)[] = new Array(frameCount).fill(null);

  // FIFO arrival queue: stores page numbers in order of their loading into frames
  const arrivalQueue: number[] = [];

  const steps: PageReference[] = [];
  let totalHits = 0;
  let totalFaults = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const existingFrameIdx = frames.indexOf(page);

    if (existingFrameIdx !== -1) {
      // PAGE HIT: Page already resident in physical memory.
      // In FIFO, reference does NOT alter arrival queue order!
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
      // PAGE FAULT: Page is not resident in physical memory.
      totalFaults += 1;
      let targetFrameIdx = frames.indexOf(null);
      let evictedPage: number | null = null;

      if (targetFrameIdx !== -1) {
        // Free frame available (lowest-numbered empty frame)
        frames[targetFrameIdx] = page;
        arrivalQueue.push(page);
      } else {
        // All frames full -> Evict head of FIFO queue (oldest resident page)
        evictedPage = arrivalQueue.shift()!;
        targetFrameIdx = frames.indexOf(evictedPage);

        if (targetFrameIdx === -1) {
          // Safety fallback if queue state desynced
          targetFrameIdx = 0;
        }

        frames[targetFrameIdx] = page;
        arrivalQueue.push(page);
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
    algorithm: 'FIFO',
    referenceString: Object.freeze([...referenceString]),
    frameCount,
    steps: Object.freeze(steps),
    totalFaults,
    totalHits,
    faultRate,
    hitRate,
  });
}
