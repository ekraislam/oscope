import { describe, it, expect } from 'vitest';
import {
  runFIFOReplacement,
  runLRUReplacement,
  runOptimalReplacement,
  compareReplacementAlgorithms,
  checkBeladyAnomaly,
  MEMORY_PRESETS,
} from '../core/algorithms/memory';

describe('Page Replacement Simulation Engine (FIFO, LRU, Optimal)', () => {
  // Classic Silberschatz textbook reference string
  const textbookString = Object.freeze([
    7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1,
  ]);

  describe('1. FIFO Page Replacement', () => {
    it('executes classic 3-frame textbook scenario with exactly 15 page faults', () => {
      const result = runFIFOReplacement(textbookString, 3);

      expect(result.algorithm).toBe('FIFO');
      expect(result.frameCount).toBe(3);
      expect(result.totalFaults).toBe(15);
      expect(result.totalHits).toBe(5);
      expect(result.faultRate).toBe((15 / 20) * 100);
      expect(result.hitRate).toBe((5 / 20) * 100);

      // Verify initial cold page loads
      expect(result.steps[0]).toMatchObject({ step: 1, pageNumber: 7, isHit: false, evictedPage: null });
      expect(result.steps[1]).toMatchObject({ step: 2, pageNumber: 0, isHit: false, evictedPage: null });
      expect(result.steps[2]).toMatchObject({ step: 3, pageNumber: 1, isHit: false, evictedPage: null });

      // Step 4: Page 2 arrives -> Evicts oldest page (Page 7)
      expect(result.steps[3]).toMatchObject({ step: 4, pageNumber: 2, isHit: false, evictedPage: 7 });

      // Step 5: Page 0 arrives -> HIT (Page 0 is resident in Frame 1)
      expect(result.steps[4]).toMatchObject({ step: 5, pageNumber: 0, isHit: true, evictedPage: null });
    });
  });

  describe('2. LRU Page Replacement', () => {
    it('executes classic 3-frame textbook scenario with exactly 12 page faults', () => {
      const result = runLRUReplacement(textbookString, 3);

      expect(result.algorithm).toBe('LRU');
      expect(result.frameCount).toBe(3);
      expect(result.totalFaults).toBe(12);
      expect(result.totalHits).toBe(8);
      expect(result.faultRate).toBe((12 / 20) * 100);
      expect(result.hitRate).toBe((8 / 20) * 100);

      // Verify that LRU outperforms FIFO on this textbook string
      expect(result.totalFaults).toBeLessThan(15);
    });

    it('updates recency on hits so active pages are protected from eviction', () => {
      // String: [1, 2, 1, 3] with 2 frames
      // Step 1: Page 1 (Fault, frames: [1, null])
      // Step 2: Page 2 (Fault, frames: [1, 2])
      // Step 3: Page 1 (Hit -> Page 1 recency refreshed!)
      // Step 4: Page 3 (Fault -> LRU page is Page 2! Page 2 evicted, NOT Page 1!)
      const result = runLRUReplacement([1, 2, 1, 3], 2);

      expect(result.steps[2].isHit).toBe(true);
      expect(result.steps[3].isHit).toBe(false);
      expect(result.steps[3].evictedPage).toBe(2);
      expect(result.steps[3].memoryFramesSnapshot).toContain(1);
      expect(result.steps[3].memoryFramesSnapshot).toContain(3);
    });
  });

  describe('3. Optimal Page Replacement (OPT)', () => {
    it('executes classic 3-frame textbook scenario with exactly 9 page faults', () => {
      const result = runOptimalReplacement(textbookString, 3);

      expect(result.algorithm).toBe('OPTIMAL');
      expect(result.frameCount).toBe(3);
      expect(result.totalFaults).toBe(9);
      expect(result.totalHits).toBe(11);
      expect(result.faultRate).toBe((9 / 20) * 100);
      expect(result.hitRate).toBe((11 / 20) * 100);

      // Invariant: Optimal faults <= LRU faults <= FIFO faults
      expect(result.totalFaults).toBeLessThanOrEqual(12);
    });

    it('evicts a page that is never referenced again in the future', () => {
      // String: [1, 2, 3, 4] with 3 frames, followed by only references to 1 and 2
      // Step 1..3: load [1, 2, 3]
      // Step 4: Page 4 referenced. Future references: [1, 2, 1, 2]
      // Page 3 is NEVER referenced again (infinity). Page 3 must be evicted!
      const result = runOptimalReplacement([1, 2, 3, 4, 1, 2, 1, 2], 3);

      expect(result.steps[3].isHit).toBe(false);
      expect(result.steps[3].evictedPage).toBe(3);
    });
  });

  describe("4. Section 49: Dedicated Bélády's Anomaly Test", () => {
    it("proves Bélády's Anomaly on [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]", () => {
      const beladyString = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];

      const res3 = runFIFOReplacement(beladyString, 3);
      const res4 = runFIFOReplacement(beladyString, 4);

      // Section 49 non-negotiable assertions:
      expect(res3.totalFaults).toBe(9);
      expect(res4.totalFaults).toBe(10);

      // Paradox: 4 frames yielded MORE page faults than 3 frames!
      expect(res4.totalFaults).toBeGreaterThan(res3.totalFaults);

      const anomalyCheck = checkBeladyAnomaly(beladyString, 3, 4);
      expect(anomalyCheck.isAnomalyDetected).toBe(true);
      expect(anomalyCheck.explanation).toContain("Bélády's Anomaly Observed");
    });
  });

  describe('5. Multi-Algorithm Comparison Matrix', () => {
    it('evaluates FIFO, LRU, and Optimal on identical input and ranks lowest faults', () => {
      const comp = compareReplacementAlgorithms(textbookString, 3);

      expect(comp.rows).toHaveLength(3);
      expect(comp.lowestFaultAlgorithm.algorithm).toBe('OPTIMAL');
      expect(comp.lowestFaultAlgorithm.faults).toBe(9);

      // Conservation invariant: totalHits + totalFaults === N
      for (const row of comp.rows) {
        expect(row.totalHits + row.totalFaults).toBe(textbookString.length);
        expect(row.hitRate + row.faultRate).toBeCloseTo(100, 2);
      }
    });
  });

  describe('6. Edge Cases & Invariants', () => {
    it('handles single frame correctly', () => {
      // 1 frame with alternating pages
      const res = runFIFOReplacement([1, 2, 1, 2], 1);
      expect(res.totalFaults).toBe(4);
      expect(res.totalHits).toBe(0);
    });

    it('yields 100% hits after initial loads when all unique pages fit in memory', () => {
      const res = runLRUReplacement([1, 2, 1, 2, 1, 2], 3);
      expect(res.totalFaults).toBe(2); // Only cold misses for 1 and 2
      expect(res.totalHits).toBe(4);
      expect(res.hitRate).toBeCloseTo((4 / 6) * 100, 2);
    });

    it('rejects frameCount <= 0 with explicit error', () => {
      expect(() => runFIFOReplacement([1, 2], 0)).toThrow(/positive integer/);
      expect(() => runLRUReplacement([1, 2], -1)).toThrow(/positive integer/);
      expect(() => runOptimalReplacement([1, 2], 0)).toThrow(/positive integer/);
    });

    it('rejects empty reference string with explicit error', () => {
      expect(() => runFIFOReplacement([], 3)).toThrow(/cannot be empty/);
      expect(() => runLRUReplacement([], 3)).toThrow(/cannot be empty/);
      expect(() => runOptimalReplacement([], 3)).toThrow(/cannot be empty/);
    });

    it('preserves input immutability: reference string is never mutated', () => {
      const original = Object.freeze([1, 2, 3, 4, 1, 2]);
      const clone = [...original];

      runFIFOReplacement(original, 3);
      runLRUReplacement(original, 3);
      runOptimalReplacement(original, 3);

      expect(original).toEqual(clone);
    });

    it('guarantees deterministic execution: running twice produces identical result', () => {
      const res1 = runLRUReplacement(textbookString, 3);
      const res2 = runLRUReplacement(textbookString, 3);
      expect(res1).toEqual(res2);
    });
  });

  describe('7. Preset Scenarios Validation', () => {
    it('executes all 8 academic presets without runtime errors', () => {
      expect(MEMORY_PRESETS).toHaveLength(8);

      for (const preset of MEMORY_PRESETS) {
        if (preset.referenceString && preset.frameCount) {
          const res = runFIFOReplacement(preset.referenceString, preset.frameCount);
          expect(res.totalFaults).toBeGreaterThan(0);
          expect(res.steps.length).toBe(preset.referenceString.length);
        }
      }
    });
  });
});
