import { describe, it, expect } from 'vitest';
import {
  createResourceAllocationState,
  buildRAGFromState,
  detectRAGCycles,
  buildWaitForGraph,
  runDeadlockDetection,
  DEADLOCK_PRESETS,
} from '../core/algorithms/deadlock';

describe('RAG, Wait-For Graph & Deadlock Detection Engine', () => {
  describe('Resource Allocation Graph (RAG) Construction', () => {
    it('constructs correct process nodes, resource nodes, and directional edges', () => {
      // 2 processes, 2 single-instance resources
      const state = createResourceAllocationState({
        processes: ['P0', 'P1'],
        resources: ['R0', 'R1'],
        available: [0, 0],
        max: [
          [1, 1],
          [1, 1],
        ],
        allocation: [
          [1, 0], // P0 holds R0
          [0, 1], // P1 holds R1
        ],
      });

      const rag = buildRAGFromState(state);

      expect(rag.nodes.length).toBe(4);
      expect(rag.nodes.filter((n) => n.type === 'PROCESS').map((n) => n.id)).toEqual(['P0', 'P1']);
      expect(rag.nodes.filter((n) => n.type === 'RESOURCE').map((n) => n.id)).toEqual(['R0', 'R1']);

      // Assignments: R0 -> P0, R1 -> P1
      const assignments = rag.edges.filter((e) => e.type === 'ASSIGNMENT');
      expect(assignments.some((e) => e.from === 'R0' && e.to === 'P0')).toBe(true);
      expect(assignments.some((e) => e.from === 'R1' && e.to === 'P1')).toBe(true);

      // Requests (from Need): P0 needs R1, P1 needs R0
      const requests = rag.edges.filter((e) => e.type === 'REQUEST');
      expect(requests.some((e) => e.from === 'P0' && e.to === 'R1')).toBe(true);
      expect(requests.some((e) => e.from === 'P1' && e.to === 'R0')).toBe(true);
    });
  });

  describe('Single-Instance vs Multi-Instance RAG Cycle Theorem', () => {
    it('proves that a single-instance RAG cycle is necessary and sufficient for deadlock', () => {
      // Classic 2-process circular wait on single-instance resources
      const state = createResourceAllocationState({
        processes: ['P0', 'P1'],
        resources: ['R0', 'R1'],
        available: [0, 0],
        max: [
          [1, 1],
          [1, 1],
        ],
        allocation: [
          [1, 0],
          [0, 1],
        ],
      });

      const rag = buildRAGFromState(state);
      const cycleResult = detectRAGCycles(rag);

      expect(cycleResult.hasCycle).toBe(true);
      expect(cycleResult.isSingleInstanceAll).toBe(true);
      expect(cycleResult.deadlockImplication).toContain('DEFINITIVE DEADLOCK');
      expect(cycleResult.explanation).toContain('BOTH a necessary and sufficient condition');

      // Deadlock detection must confirm deadlock
      const detection = runDeadlockDetection(state);
      expect(detection.isDeadlocked).toBe(true);
      expect(detection.deadlockedProcesses).toEqual(['P0', 'P1']);
    });

    it('proves that a multi-instance RAG cycle is NOT sufficient for deadlock (Distinction B)', () => {
      // 3 processes, R0 has 2 instances, R1 has 1 instance
      // P0 holds R0(1), requests R1
      // P1 holds R1(1), requests R0
      // P2 holds R0(2), but needs nothing more! P2 can complete and free R0, breaking the cycle!
      const state = createResourceAllocationState({
        processes: ['P0', 'P1', 'P2'],
        resources: ['R0', 'R1'],
        available: [0, 0],
        max: [
          [1, 1],
          [1, 1],
          [1, 0], // P2 already has max allocation!
        ],
        allocation: [
          [1, 0],
          [0, 1],
          [1, 0],
        ],
      });

      const rag = buildRAGFromState(state);
      const cycleResult = detectRAGCycles(rag);

      // Cycle exists in RAG between P0, R1, P1, R0!
      expect(cycleResult.hasCycle).toBe(true);
      // But R0 has 2 instances!
      expect(cycleResult.isSingleInstanceAll).toBe(false);
      expect(cycleResult.deadlockImplication).toContain('POTENTIAL DEADLOCK');
      expect(cycleResult.explanation).toContain('NOT a sufficient condition');

      // BUT Deadlock Detection engine proves the system is NOT deadlocked!
      // (P2 finishes, frees R0 -> P1 finishes -> P0 finishes)
      const detection = runDeadlockDetection(state);
      expect(detection.isDeadlocked).toBe(false);
      expect(detection.deadlockedProcesses).toEqual([]);
    });

    it('correctly reports no cycles for an acyclic system', () => {
      const state = createResourceAllocationState({
        processes: ['P0', 'P1'],
        resources: ['R0', 'R1'],
        available: [1, 1],
        max: [
          [1, 0],
          [0, 1],
        ],
        allocation: [
          [0, 0],
          [0, 0],
        ],
      });

      const rag = buildRAGFromState(state);
      const cycleResult = detectRAGCycles(rag);

      expect(cycleResult.hasCycle).toBe(false);
      expect(cycleResult.cycleNodes).toEqual([]);
      expect(cycleResult.deadlockImplication).toContain('NO DEADLOCK');
    });
  });

  describe('Derived Wait-For Graph (WFG)', () => {
    it('derives process-to-process wait edges and identifies circular waiting', () => {
      const state = createResourceAllocationState({
        processes: ['P0', 'P1'],
        resources: ['R0', 'R1'],
        available: [0, 0],
        max: [
          [1, 1],
          [1, 1],
        ],
        allocation: [
          [1, 0],
          [0, 1],
        ],
      });

      const wfg = buildWaitForGraph(state);

      expect(wfg.nodes).toEqual(['P0', 'P1']);
      // P0 needs R1, held by P1 -> Edge P0 -> P1
      // P1 needs R0, held by P0 -> Edge P1 -> P0
      expect(wfg.edges.some((e) => e.from === 'P0' && e.to === 'P1')).toBe(true);
      expect(wfg.edges.some((e) => e.from === 'P1' && e.to === 'P0')).toBe(true);
      expect(wfg.hasCycle).toBe(true);
      expect(wfg.explanation).toContain('circular wait dependency');
    });
  });

  describe('Multi-Instance Deadlock Detection Algorithm', () => {
    it('detects deadlocked processes while allowing independent processes to complete', () => {
      const state = createResourceAllocationState({
        processes: ['P0', 'P1', 'P2', 'P3'],
        resources: ['A', 'B', 'C'],
        available: [0, 0, 0],
        max: [
          [0, 1, 0], // P0 holds B, needs 0 -> can finish immediately!
          [2, 0, 2], // P1 holds A, needs [0, 0, 2]
          [0, 2, 0], // P2 holds B, needs [0, 1, 0]
          [1, 0, 1], // P3 holds A, C, needs [2, 3, 2]
        ],
        allocation: [
          [0, 1, 0], // P0
          [2, 0, 0], // P1
          [0, 1, 0], // P2
          [1, 0, 1], // P3
        ],
      });

      const detection = runDeadlockDetection(state);

      // P0 completes, releasing B. But P1, P2, and P3 remain blocked in deadlock
      expect(detection.isDeadlocked).toBe(true);
      expect(detection.deadlockedProcesses).toContain('P1');
      expect(detection.deadlockedProcesses).not.toContain('P0');
      expect(detection.steps.length).toBeGreaterThan(0);
    });

    it('does not falsely mark processes with zero allocation as deadlocked', () => {
      const state = createResourceAllocationState({
        processes: ['P0', 'P1'],
        resources: ['A'],
        available: [0],
        max: [
          [0], // P0 holds 0, needs 0
          [1], // P1 holds 1, needs 0
        ],
        allocation: [
          [0],
          [1],
        ],
      });

      const detection = runDeadlockDetection(state);
      expect(detection.isDeadlocked).toBe(false);
      expect(detection.deadlockedProcesses).toEqual([]);
    });
  });

  describe('Educational Presets Invariants', () => {
    it('verifies all 7 educational presets match their declared academic specifications', () => {
      for (const preset of DEADLOCK_PRESETS) {
        const rag = buildRAGFromState(preset.state, preset.pendingRequests);
        const ragCycles = detectRAGCycles(rag);
        const detection = runDeadlockDetection(preset.state, preset.pendingRequests);

        expect(ragCycles.hasCycle).toBe(preset.expectedCycle);
        expect(detection.isDeadlocked).toBe(preset.expectedDeadlocked);
      }
    });
  });
});
