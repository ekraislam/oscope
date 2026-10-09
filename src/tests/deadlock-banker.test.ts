import { describe, it, expect } from 'vitest';
import {
  createResourceAllocationState,
  deriveNeedMatrix,
  runBankerSafetyCheck,
  verifySafeSequence,
  runBankerResourceRequest,
  computeTotalResources,
} from '../core/algorithms/deadlock';

describe('Deadlock & Banker Algorithm Engine', () => {
  // Standard textbook scenario (Silberschatz / Galvin)
  const classicSafeParams = {
    processes: ['P0', 'P1', 'P2', 'P3', 'P4'],
    resources: ['A', 'B', 'C'],
    available: [3, 3, 2],
    max: [
      [7, 5, 3], // P0
      [3, 2, 2], // P1
      [9, 0, 2], // P2
      [2, 2, 2], // P3
      [4, 3, 3], // P4
    ],
    allocation: [
      [0, 1, 0], // P0
      [2, 0, 0], // P1
      [3, 0, 2], // P2
      [2, 1, 1], // P3
      [0, 0, 2], // P4
    ],
  };

  describe('Matrix Derivation & State Invariants', () => {
    it('correctly derives Need matrix as Max - Allocation', () => {
      const state = createResourceAllocationState(classicSafeParams);
      expect(state.need).toEqual([
        [7, 4, 3], // P0
        [1, 2, 2], // P1
        [6, 0, 0], // P2
        [0, 1, 1], // P3
        [4, 3, 1], // P4
      ]);
    });

    it('rejects allocation exceeding max claim with an explicit error', () => {
      expect(() => {
        deriveNeedMatrix([[2, 2]], [[3, 1]]); // alloc 3 > max 2 at (0, 0)
      }).toThrow(/Allocation \(3\) cannot exceed Max \(2\)/);
    });

    it('rejects dimension mismatches between resources and available vector', () => {
      expect(() => {
        createResourceAllocationState({
          ...classicSafeParams,
          available: [3, 3], // 2 items for 3 resources
        });
      }).toThrow(/Available vector length/);
    });

    it('calculates total resource capacity correctly', () => {
      const totals = computeTotalResources(classicSafeParams.available, classicSafeParams.allocation);
      // A: 3 available + (0+2+3+2+0) allocated = 10
      // B: 3 available + (1+0+0+1+0) allocated = 5
      // C: 2 available + (0+0+2+1+2) allocated = 7
      expect(totals).toEqual([10, 5, 7]);
    });
  });

  describe('Banker Safety Algorithm', () => {
    it('finds the exact standard safe sequence for the classic safe state', () => {
      const state = createResourceAllocationState(classicSafeParams);
      const result = runBankerSafetyCheck(state);

      expect(result.isSafe).toBe(true);
      // Under deterministic PID ordering tie-breaker (lowest index first):
      // Step 1: P1 has Need [1, 2, 2] <= Work [3, 3, 2] -> completes, Work becomes [5, 3, 2]
      // Step 2: P3 has Need [0, 1, 1] <= Work [5, 3, 2] -> completes, Work becomes [7, 4, 3]
      // Step 3: With Work [7, 4, 3], P0, P2, P4 are eligible. Lowest index is P0 -> completes, Work becomes [7, 5, 3]
      // Step 4: Lowest eligible is P2 -> completes, Work becomes [10, 5, 5]
      // Step 5: P4 -> completes, Work becomes [10, 5, 7]
      expect(result.safeSequence).toEqual(['P1', 'P3', 'P0', 'P2', 'P4']);
      expect(result.steps.length).toBe(5);
    });

    it('detects unsafe state when available resources are depleted', () => {
      const unsafeParams = {
        processes: ['P0', 'P1'],
        resources: ['R0'],
        available: [0],
        max: [[2], [2]],
        allocation: [[1], [1]], // Each holds 1, need 1 each, available 0
      };
      const state = createResourceAllocationState(unsafeParams);
      const result = runBankerSafetyCheck(state);

      expect(result.isSafe).toBe(false);
      expect(result.safeSequence).toEqual([]);
      expect(result.explanation).toContain('UNSAFE STATE');
      // Crucial: check that explanation clarifies unsafe != deadlock
      expect(result.explanation).toContain('does NOT necessarily mean deadlock is currently present');
    });

    it('independently validates an alleged safe sequence', () => {
      const state = createResourceAllocationState(classicSafeParams);
      // Both valid topological safe sequences
      expect(verifySafeSequence(state, ['P1', 'P3', 'P0', 'P2', 'P4'])).toBe(true);
      expect(verifySafeSequence(state, ['P1', 'P3', 'P4', 'P0', 'P2'])).toBe(true);
      // Invalid sequence (P0 cannot execute first with Work [3, 3, 2] because Need is [7, 4, 3])
      expect(verifySafeSequence(state, ['P0', 'P1', 'P2', 'P3', 'P4'])).toBe(false);
      // Incomplete sequence
      expect(verifySafeSequence(state, ['P1', 'P3'])).toBe(false);
      // Sequence with duplicate processes
      expect(verifySafeSequence(state, ['P1', 'P1', 'P3', 'P4', 'P0'])).toBe(false);
    });
  });

  describe('Banker Resource-Request Algorithm (Avoidance)', () => {
    it('rejects a request that exceeds the process remaining need', () => {
      const state = createResourceAllocationState(classicSafeParams);
      // P1 Need is [1, 2, 2]. Request [2, 0, 0] exceeds A need (2 > 1)
      const result = runBankerResourceRequest(state, {
        processId: 'P1',
        requestVector: [2, 0, 0],
      });

      expect(result.granted).toBe(false);
      expect(result.checkDetails.needCheckPassed).toBe(false);
      expect(result.reason).toContain('exceeds declared maximum remaining Need');
    });

    it('rejects a request that exceeds currently available resources', () => {
      const state = createResourceAllocationState(classicSafeParams);
      // P0 Need is [7, 4, 3]. Request [4, 0, 0] <= Need, but Available is [3, 3, 2] (4 > 3)
      const result = runBankerResourceRequest(state, {
        processId: 'P0',
        requestVector: [4, 0, 0],
      });

      expect(result.granted).toBe(false);
      expect(result.checkDetails.needCheckPassed).toBe(true);
      expect(result.checkDetails.availableCheckPassed).toBe(false);
      expect(result.reason).toContain('exceed currently Available resources');
    });

    it('rejects a request that is within need and available, but leaves the system in an unsafe state', () => {
      const state = createResourceAllocationState(classicSafeParams);
      // P4 requests [2, 3, 0].
      // Need of P4 is [4, 3, 1] -> [2, 3, 0] <= Need (PASS)
      // Available is [3, 3, 2] -> [2, 3, 0] <= Available (PASS)
      // Provisional Available: [1, 0, 2].
      // In provisional state, all processes with remaining need require resource B, but 0 is available!
      // No process can complete! System becomes UNSAFE!
      const result = runBankerResourceRequest(state, {
        processId: 'P4',
        requestVector: [2, 3, 0],
      });

      expect(result.granted).toBe(false);
      expect(result.checkDetails.needCheckPassed).toBe(true);
      expect(result.checkDetails.availableCheckPassed).toBe(true);
      expect(result.checkDetails.safetyCheckPassed).toBe(false);
      expect(result.reason).toContain('would leave the system in an UNSAFE STATE');
    });

    it('grants a request that safely preserves system completion', () => {
      const state = createResourceAllocationState(classicSafeParams);
      // P1 requests [1, 0, 2].
      // Need of P1 is [1, 2, 2] -> [1, 0, 2] <= Need (PASS)
      // Available is [3, 3, 2] -> [1, 0, 2] <= Available (PASS)
      // Provisional Available is [2, 3, 0].
      // P1 can still execute, and the system remains SAFE!
      const result = runBankerResourceRequest(state, {
        processId: 'P1',
        requestVector: [1, 0, 2],
      });

      expect(result.granted).toBe(true);
      expect(result.checkDetails.needCheckPassed).toBe(true);
      expect(result.checkDetails.availableCheckPassed).toBe(true);
      expect(result.checkDetails.safetyCheckPassed).toBe(true);
      expect(result.requestedState).toBeDefined();
      expect(result.requestedState?.available).toEqual([2, 3, 0]);
      expect(result.requestedState?.allocation[1]).toEqual([3, 0, 2]);
      expect(result.requestedState?.need[1]).toEqual([0, 2, 0]);
    });
  });

  describe('Edge Cases, Immutability & Determinism', () => {
    it('handles a minimal 1-process 1-resource system', () => {
      const state = createResourceAllocationState({
        processes: ['P0'],
        resources: ['R0'],
        available: [1],
        max: [[2]],
        allocation: [[1]],
      });
      const safety = runBankerSafetyCheck(state);
      expect(safety.isSafe).toBe(true);
      expect(safety.safeSequence).toEqual(['P0']);
    });

    it('guarantees that input matrices are never mutated', () => {
      const state = createResourceAllocationState(classicSafeParams);
      const originalAvail = [...state.available];
      const originalAlloc = state.allocation.map((r) => [...r]);

      // Run safety check and request algorithm
      runBankerSafetyCheck(state);
      runBankerResourceRequest(state, {
        processId: 'P1',
        requestVector: [1, 0, 2],
      });

      expect(state.available).toEqual(originalAvail);
      expect(state.allocation).toEqual(originalAlloc);
    });

    it('guarantees deterministic output across multiple invocations', () => {
      const state = createResourceAllocationState(classicSafeParams);
      const res1 = runBankerSafetyCheck(state);
      const res2 = runBankerSafetyCheck(state);

      expect(res1.safeSequence).toEqual(res2.safeSequence);
      expect(res1.steps.length).toEqual(res2.steps.length);
      for (let i = 0; i < res1.steps.length; i++) {
        expect(res1.steps[i].workVectorAfter).toEqual(res2.steps[i].workVectorAfter);
      }
    });
  });
});
