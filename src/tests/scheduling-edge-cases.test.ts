import { describe, it, expect } from 'vitest';
import type { ProcessInput } from '../core/models';
import {
  runFCFS,
  runSJFNonPreemptive,
  runSRTFPreemptive,
  runPriorityNonPreemptive,
  runPriorityPreemptive,
  runRoundRobin,
} from '../core/algorithms/scheduling';

describe('CPU Scheduling Engine — Invariants & Edge Cases', () => {
  describe('Zero Burst Time Policy', () => {
    it('handles burstTime = 0 deterministically without infinite loop or negative times', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'Zero Task', arrivalTime: 2, burstTime: 0, priority: 1 },
        { pid: 'P2', name: 'Normal Task', arrivalTime: 2, burstTime: 4, priority: 1 },
      ];

      const result = runFCFS(workload);

      // P1 completes immediately at its arrival time 2
      expect(result.processMetrics['P1'].completionTime).toBe(2);
      expect(result.processMetrics['P1'].turnaroundTime).toBe(0);
      expect(result.processMetrics['P1'].waitingTime).toBe(0);
      expect(result.processMetrics['P1'].responseTime).toBe(0);

      // No zero-duration Gantt segment should exist for P1
      for (const seg of result.gantt) {
        expect(seg.duration).toBeGreaterThan(0);
        expect(seg.endTime).toBeGreaterThan(seg.startTime);
      }

      // Normal task executes
      expect(result.processMetrics['P2'].completionTime).toBe(6);
    });
  });

  describe('Deterministic Tie-Breaking Policy', () => {
    it('breaks ties deterministically using arrival time then natural PID order', () => {
      // 3 jobs with identical arrival and identical burst
      const workload: ProcessInput[] = [
        { pid: 'P10', name: 'P10', arrivalTime: 0, burstTime: 3, priority: 1 },
        { pid: 'P2', name: 'P2', arrivalTime: 0, burstTime: 3, priority: 1 },
        { pid: 'P1', name: 'P1', arrivalTime: 0, burstTime: 3, priority: 1 },
      ];

      const result = runSJFNonPreemptive(workload);

      // Natural PID sorting order: P1, P2, P10 (not alphabetical 'P1', 'P10', 'P2')
      expect(result.gantt.map((s) => s.pid)).toEqual(['P1', 'P2', 'P10']);
    });
  });

  describe('Context Switch Cost Semantics', () => {
    it('inserts CS overhead between process-to-process transitions, but not after IDLE', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'P1', arrivalTime: 2, burstTime: 3, priority: 1 },
        { pid: 'P2', name: 'P2', arrivalTime: 2, burstTime: 2, priority: 1 },
      ];

      // Context switch cost = 1
      const result = runFCFS(workload, { contextSwitchCost: 1 });

      // Expected timeline:
      // 0..2: IDLE (No CS overhead before P1 because IDLE -> P1 is dispatch)
      // 2..5: P1 (duration 3)
      // 5..6: CS (duration 1)
      // 6..8: P2 (duration 2)
      expect(result.gantt).toHaveLength(4);
      expect(result.gantt[0]).toEqual({ type: 'IDLE', pid: 'IDLE', startTime: 0, endTime: 2, duration: 2 });
      expect(result.gantt[1]).toEqual({ type: 'PROCESS', pid: 'P1', startTime: 2, endTime: 5, duration: 3 });
      expect(result.gantt[2]).toEqual({ type: 'CONTEXT_SWITCH', pid: 'CS', startTime: 5, endTime: 6, duration: 1 });
      expect(result.gantt[3]).toEqual({ type: 'PROCESS', pid: 'P2', startTime: 6, endTime: 8, duration: 2 });

      expect(result.metrics.contextSwitchCount).toBe(1);
      expect(result.metrics.totalTime).toBe(8);
    });

    it('does not insert CS overhead when contextSwitchCost is 0', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'P1', arrivalTime: 0, burstTime: 2, priority: 1 },
        { pid: 'P2', name: 'P2', arrivalTime: 0, burstTime: 2, priority: 1 },
      ];

      const result = runFCFS(workload, { contextSwitchCost: 0 });
      const csSegments = result.gantt.filter((s) => s.type === 'CONTEXT_SWITCH');
      expect(csSegments).toHaveLength(0);
      expect(result.metrics.contextSwitchCount).toBe(1);
    });
  });

  describe('Input Immutability Guarantee', () => {
    it('strictly preserves caller process objects and arrays without mutation', () => {
      const original: readonly ProcessInput[] = Object.freeze([
        Object.freeze({ pid: 'P1', name: 'Task 1', arrivalTime: 0, burstTime: 5, priority: 2 }),
        Object.freeze({ pid: 'P2', name: 'Task 2', arrivalTime: 1, burstTime: 3, priority: 1 }),
      ]);

      const clone = JSON.parse(JSON.stringify(original));

      runFCFS(original);
      runSJFNonPreemptive(original);
      runSRTFPreemptive(original);
      runPriorityNonPreemptive(original);
      runPriorityPreemptive(original);
      runRoundRobin(original);

      expect(original).toEqual(clone);
    });
  });

  describe('Cross-Algorithm Invariants', () => {
    const complexWorkload: ProcessInput[] = [
      { pid: 'P1', name: 'Alpha', arrivalTime: 0, burstTime: 5, priority: 2 },
      { pid: 'P2', name: 'Beta', arrivalTime: 1, burstTime: 3, priority: 1 },
      { pid: 'P3', name: 'Gamma', arrivalTime: 3, burstTime: 4, priority: 3 },
      { pid: 'P4', name: 'Delta', arrivalTime: 7, burstTime: 2, priority: 0 },
    ];

    const schedulers = [
      { name: 'FCFS', fn: runFCFS },
      { name: 'SJF', fn: runSJFNonPreemptive },
      { name: 'SRTF', fn: runSRTFPreemptive },
      { name: 'Priority NP', fn: runPriorityNonPreemptive },
      { name: 'Priority P', fn: runPriorityPreemptive },
      { name: 'Round Robin', fn: (wl: readonly ProcessInput[]) => runRoundRobin(wl, { quantum: 2 }) },
    ];

    schedulers.forEach(({ name, fn }) => {
      describe(`Invariants for ${name}`, () => {
        const result = fn(complexWorkload);

        it('conserves CPU execution time: sum(PROCESS durations) == sum(burstTime)', () => {
          const expectedTotalBurst = complexWorkload.reduce((sum, p) => sum + p.burstTime, 0);
          const actualProcessGanttDuration = result.gantt
            .filter((s) => s.type === 'PROCESS')
            .reduce((sum, s) => sum + s.duration, 0);

          expect(actualProcessGanttDuration).toBe(expectedTotalBurst);
        });

        it('guarantees non-negative metrics for all processes', () => {
          for (const p of complexWorkload) {
            const m = result.processMetrics[p.pid];
            expect(m).toBeDefined();
            expect(m.completionTime).toBeGreaterThanOrEqual(m.arrivalTime + m.burstTime);
            expect(m.turnaroundTime).toBeGreaterThanOrEqual(m.burstTime);
            expect(m.waitingTime).toBeGreaterThanOrEqual(0);
            expect(m.responseTime).toBeGreaterThanOrEqual(0);
          }
        });

        it('enforces contiguous, non-overlapping Gantt timeline with positive durations', () => {
          expect(result.gantt.length).toBeGreaterThan(0);

          for (let i = 0; i < result.gantt.length; i++) {
            const seg = result.gantt[i];
            expect(seg.endTime).toBeGreaterThan(seg.startTime);
            expect(seg.duration).toBe(seg.endTime - seg.startTime);

            if (i > 0) {
              const prev = result.gantt[i - 1];
              expect(seg.startTime).toBe(prev.endTime);
            }
          }

          const lastSegment = result.gantt[result.gantt.length - 1];
          expect(result.metrics.totalTime).toBe(lastSegment.endTime);
        });

        it('produces valid CPU utilization between 0 and 100', () => {
          expect(result.metrics.cpuUtilization).toBeGreaterThanOrEqual(0);
          expect(result.metrics.cpuUtilization).toBeLessThanOrEqual(100);
        });

        it('produces step snapshots with valid timestamps', () => {
          expect(result.stepSnapshots.length).toBeGreaterThan(0);
          for (const snap of result.stepSnapshots) {
            expect(snap.time).toBeGreaterThanOrEqual(0);
            expect(snap.explanation.length).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  describe('Scheduler Determinism', () => {
    it('produces identical result when executed twice with identical workload and options', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'Task 1', arrivalTime: 0, burstTime: 4, priority: 2 },
        { pid: 'P2', name: 'Task 2', arrivalTime: 1, burstTime: 3, priority: 1 },
      ];

      const res1 = runRoundRobin(workload, { quantum: 2, contextSwitchCost: 1 });
      const res2 = runRoundRobin(workload, { quantum: 2, contextSwitchCost: 1 });

      expect(res1).toEqual(res2);
    });
  });

  describe('Empty Workload Handling', () => {
    it('returns a clean zeroed result for empty workload without crashing', () => {
      const result = runFCFS([]);
      expect(result.gantt).toHaveLength(0);
      expect(result.metrics.totalTime).toBe(0);
      expect(result.metrics.cpuUtilization).toBe(0);
      expect(result.metrics.throughput).toBe(0);
      expect(result.stepSnapshots).toHaveLength(0);
    });
  });
});
