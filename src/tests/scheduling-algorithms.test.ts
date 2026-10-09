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

describe('CPU Scheduling Algorithms — Textbook Cases', () => {
  describe('1. First-Come, First-Served (FCFS)', () => {
    it('executes processes strictly in arrival order (non-preemptive)', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'Task 1', arrivalTime: 0, burstTime: 4, priority: 1 },
        { pid: 'P2', name: 'Task 2', arrivalTime: 1, burstTime: 3, priority: 1 },
        { pid: 'P3', name: 'Task 3', arrivalTime: 2, burstTime: 1, priority: 1 },
      ];

      const result = runFCFS(workload);

      // P1: 0 -> 4
      // P2: 4 -> 7
      // P3: 7 -> 8
      expect(result.gantt).toHaveLength(3);
      expect(result.gantt[0]).toEqual({ type: 'PROCESS', pid: 'P1', startTime: 0, endTime: 4, duration: 4 });
      expect(result.gantt[1]).toEqual({ type: 'PROCESS', pid: 'P2', startTime: 4, endTime: 7, duration: 3 });
      expect(result.gantt[2]).toEqual({ type: 'PROCESS', pid: 'P3', startTime: 7, endTime: 8, duration: 1 });

      // Completion times
      expect(result.processMetrics['P1'].completionTime).toBe(4);
      expect(result.processMetrics['P2'].completionTime).toBe(7);
      expect(result.processMetrics['P3'].completionTime).toBe(8);

      // Turnaround times: CT - AT
      expect(result.processMetrics['P1'].turnaroundTime).toBe(4 - 0); // 4
      expect(result.processMetrics['P2'].turnaroundTime).toBe(7 - 1); // 6
      expect(result.processMetrics['P3'].turnaroundTime).toBe(8 - 2); // 6

      // Waiting times: TAT - BT
      expect(result.processMetrics['P1'].waitingTime).toBe(4 - 4); // 0
      expect(result.processMetrics['P2'].waitingTime).toBe(6 - 3); // 3
      expect(result.processMetrics['P3'].waitingTime).toBe(6 - 1); // 5

      // Response times: FirstStart - AT
      expect(result.processMetrics['P1'].responseTime).toBe(0 - 0); // 0
      expect(result.processMetrics['P2'].responseTime).toBe(4 - 1); // 3
      expect(result.processMetrics['P3'].responseTime).toBe(7 - 2); // 5

      // Aggregate averages
      expect(result.metrics.averageTurnaroundTime).toBeCloseTo((4 + 6 + 6) / 3, 2);
      expect(result.metrics.averageWaitingTime).toBeCloseTo((0 + 3 + 5) / 3, 2);
      expect(result.metrics.cpuUtilization).toBe(100);
      expect(result.metrics.totalTime).toBe(8);
    });

    it('correctly inserts IDLE segment when arrival time has an initial or intermediate gap', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'Task 1', arrivalTime: 3, burstTime: 2, priority: 1 },
        { pid: 'P2', name: 'Task 2', arrivalTime: 8, burstTime: 2, priority: 1 },
      ];

      const result = runFCFS(workload);

      // IDLE: 0 -> 3
      // P1:   3 -> 5
      // IDLE: 5 -> 8
      // P2:   8 -> 10
      expect(result.gantt).toHaveLength(4);
      expect(result.gantt[0]).toEqual({ type: 'IDLE', pid: 'IDLE', startTime: 0, endTime: 3, duration: 3 });
      expect(result.gantt[1]).toEqual({ type: 'PROCESS', pid: 'P1', startTime: 3, endTime: 5, duration: 2 });
      expect(result.gantt[2]).toEqual({ type: 'IDLE', pid: 'IDLE', startTime: 5, endTime: 8, duration: 3 });
      expect(result.gantt[3]).toEqual({ type: 'PROCESS', pid: 'P2', startTime: 8, endTime: 10, duration: 2 });

      expect(result.metrics.totalTime).toBe(10);
      // Active CPU time = 4. Total = 10. Utilization = 40%
      expect(result.metrics.cpuUtilization).toBe(40);
    });
  });

  describe('2. Shortest Job First — Non-Preemptive (SJF)', () => {
    it('selects shortest eligible job among arrived processes, running it to completion', () => {
      // Classic textbook case:
      // P1 arrives at 0, BT 7
      // P2 arrives at 2, BT 4
      // P3 arrives at 4, BT 1
      // P4 arrives at 5, BT 4
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'Job 1', arrivalTime: 0, burstTime: 7, priority: 1 },
        { pid: 'P2', name: 'Job 2', arrivalTime: 2, burstTime: 4, priority: 1 },
        { pid: 'P3', name: 'Job 3', arrivalTime: 4, burstTime: 1, priority: 1 },
        { pid: 'P4', name: 'Job 4', arrivalTime: 5, burstTime: 4, priority: 1 },
      ];

      const result = runSJFNonPreemptive(workload);

      // t=0: Only P1 has arrived. P1 runs to completion: 0 -> 7
      // at t=7: P2 (BT 4), P3 (BT 1), P4 (BT 4) have arrived.
      // Shortest is P3 (BT 1): runs 7 -> 8
      // at t=8: P2 (BT 4) and P4 (BT 4) remain. Tied on burst. Tie-breaker: earlier arrival (P2 arrived at 2, P4 at 5).
      // P2 runs 8 -> 12
      // P4 runs 12 -> 16
      expect(result.gantt.map((s) => s.pid)).toEqual(['P1', 'P3', 'P2', 'P4']);
      expect(result.gantt[0]).toEqual({ type: 'PROCESS', pid: 'P1', startTime: 0, endTime: 7, duration: 7 });
      expect(result.gantt[1]).toEqual({ type: 'PROCESS', pid: 'P3', startTime: 7, endTime: 8, duration: 1 });
      expect(result.gantt[2]).toEqual({ type: 'PROCESS', pid: 'P2', startTime: 8, endTime: 12, duration: 4 });
      expect(result.gantt[3]).toEqual({ type: 'PROCESS', pid: 'P4', startTime: 12, endTime: 16, duration: 4 });

      expect(result.processMetrics['P1'].completionTime).toBe(7);
      expect(result.processMetrics['P3'].completionTime).toBe(8);
      expect(result.processMetrics['P2'].completionTime).toBe(12);
      expect(result.processMetrics['P4'].completionTime).toBe(16);

      expect(result.processMetrics['P1'].waitingTime).toBe(0);
      expect(result.processMetrics['P3'].waitingTime).toBe(3); // 8 - 4 - 1 = 3
      expect(result.processMetrics['P2'].waitingTime).toBe(6); // 12 - 2 - 4 = 6
      expect(result.processMetrics['P4'].waitingTime).toBe(7); // 16 - 5 - 4 = 7
    });
  });

  describe('3. Shortest Remaining Time First (SRTF)', () => {
    it('preempts currently running job when a process with shorter remaining burst arrives', () => {
      // Classic textbook case:
      // P1 arrives at 0, BT 8
      // P2 arrives at 1, BT 4
      // P3 arrives at 2, BT 9
      // P4 arrives at 3, BT 5
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'Task 1', arrivalTime: 0, burstTime: 8, priority: 1 },
        { pid: 'P2', name: 'Task 2', arrivalTime: 1, burstTime: 4, priority: 1 },
        { pid: 'P3', name: 'Task 3', arrivalTime: 2, burstTime: 9, priority: 1 },
        { pid: 'P4', name: 'Task 4', arrivalTime: 3, burstTime: 5, priority: 1 },
      ];

      const result = runSRTFPreemptive(workload);

      // t=0: P1 starts (rem 8).
      // t=1: P2 arrives (BT 4). P1 remaining is 7. 4 < 7 => P1 preempted! P2 runs.
      // t=2: P3 arrives (BT 9). P2 has rem 3. 3 < 9 => P2 continues.
      // t=3: P4 arrives (BT 5). P2 has rem 2. 2 < 5 => P2 continues.
      // t=5: P2 finishes at 5!
      // Ready: P4 (rem 5), P1 (rem 7), P3 (rem 9).
      // P4 runs from 5 to 10 (finishes at 10).
      // P1 runs from 10 to 17 (finishes at 17).
      // P3 runs from 17 to 26 (finishes at 26).
      expect(result.gantt.map((s) => s.pid)).toEqual(['P1', 'P2', 'P4', 'P1', 'P3']);

      expect(result.processMetrics['P2'].completionTime).toBe(5);
      expect(result.processMetrics['P4'].completionTime).toBe(10);
      expect(result.processMetrics['P1'].completionTime).toBe(17);
      expect(result.processMetrics['P3'].completionTime).toBe(26);

      // Waiting times:
      // P1: TAT = 17 - 0 = 17, WT = 17 - 8 = 9
      // P2: TAT = 5 - 1 = 4, WT = 4 - 4 = 0
      // P4: TAT = 10 - 3 = 7, WT = 7 - 5 = 2
      // P3: TAT = 26 - 2 = 24, WT = 24 - 9 = 15
      expect(result.processMetrics['P1'].waitingTime).toBe(9);
      expect(result.processMetrics['P2'].waitingTime).toBe(0);
      expect(result.processMetrics['P4'].waitingTime).toBe(2);
      expect(result.processMetrics['P3'].waitingTime).toBe(15);

      // Response times:
      // P1 first CPU at 0 -> RT = 0
      // P2 first CPU at 1 -> RT = 1 - 1 = 0
      // P4 first CPU at 5 -> RT = 5 - 3 = 2
      // P3 first CPU at 17 -> RT = 17 - 2 = 15
      expect(result.processMetrics['P1'].responseTime).toBe(0);
      expect(result.processMetrics['P2'].responseTime).toBe(0);
      expect(result.processMetrics['P4'].responseTime).toBe(2);
      expect(result.processMetrics['P3'].responseTime).toBe(15);
    });
  });

  describe('4. Priority Scheduling — Non-Preemptive', () => {
    it('dispatches highest priority eligible job to completion without interruption', () => {
      // Default: LOWER_NUMBER_HIGHER_PRIORITY (0 is highest)
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'Task 1', arrivalTime: 0, burstTime: 4, priority: 3 },
        { pid: 'P2', name: 'Task 2', arrivalTime: 1, burstTime: 3, priority: 1 },
        { pid: 'P3', name: 'Task 3', arrivalTime: 2, burstTime: 2, priority: 0 },
      ];

      const result = runPriorityNonPreemptive(workload);

      // t=0: P1 arrives and starts. Runs to completion: 0 -> 4
      // at t=4: P2 (priority 1) and P3 (priority 0) have arrived.
      // P3 has higher priority (0 < 1). P3 runs 4 -> 6
      // P2 runs 6 -> 9
      expect(result.gantt.map((s) => s.pid)).toEqual(['P1', 'P3', 'P2']);
      expect(result.processMetrics['P1'].completionTime).toBe(4);
      expect(result.processMetrics['P3'].completionTime).toBe(6);
      expect(result.processMetrics['P2'].completionTime).toBe(9);
    });
  });

  describe('5. Priority Scheduling — Preemptive', () => {
    it('immediately preempts running process when a higher-priority process arrives', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'Low Priority', arrivalTime: 0, burstTime: 6, priority: 3 },
        { pid: 'P2', name: 'High Priority', arrivalTime: 2, burstTime: 2, priority: 1 },
      ];

      const result = runPriorityPreemptive(workload);

      // t=0: P1 runs
      // t=2: P2 arrives with priority 1 (higher than P1 priority 3). P1 preempted!
      // P2 runs 2 -> 4
      // P1 resumes 4 -> 8
      expect(result.gantt.map((s) => s.pid)).toEqual(['P1', 'P2', 'P1']);
      expect(result.gantt[0]).toEqual({ type: 'PROCESS', pid: 'P1', startTime: 0, endTime: 2, duration: 2 });
      expect(result.gantt[1]).toEqual({ type: 'PROCESS', pid: 'P2', startTime: 2, endTime: 4, duration: 2 });
      expect(result.gantt[2]).toEqual({ type: 'PROCESS', pid: 'P1', startTime: 4, endTime: 8, duration: 4 });

      expect(result.processMetrics['P2'].completionTime).toBe(4);
      expect(result.processMetrics['P1'].completionTime).toBe(8);
      expect(result.processMetrics['P2'].waitingTime).toBe(0);
      expect(result.processMetrics['P1'].waitingTime).toBe(2);
    });
  });

  describe('6. Round Robin (RR)', () => {
    it('cycles processes according to time quantum and FIFO queue', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
        { pid: 'P2', name: 'P2', arrivalTime: 0, burstTime: 3, priority: 1 },
        { pid: 'P3', name: 'P3', arrivalTime: 0, burstTime: 1, priority: 1 },
      ];

      // Quantum = 2
      // Queue initially at t=0: [P1, P2, P3]
      // t=0..2: P1 runs (rem 3). Queue after: [P2, P3, P1]
      // t=2..4: P2 runs (rem 1). Queue after: [P3, P1, P2]
      // t=4..5: P3 runs (rem 0). Finishes at 5! Queue after: [P1, P2]
      // t=5..7: P1 runs (rem 1). Queue after: [P2, P1]
      // t=7..8: P2 runs (rem 0). Finishes at 8! Queue after: [P1]
      // t=8..9: P1 runs (rem 0). Finishes at 9!
      const result = runRoundRobin(workload, { quantum: 2 });

      expect(result.gantt.map((s) => s.pid)).toEqual(['P1', 'P2', 'P3', 'P1', 'P2', 'P1']);
      expect(result.processMetrics['P3'].completionTime).toBe(5);
      expect(result.processMetrics['P2'].completionTime).toBe(8);
      expect(result.processMetrics['P1'].completionTime).toBe(9);
    });

    it('enforces Section 15 Queue Semantics: new arrival enters ready queue before preempted process', () => {
      // P1 arrives at 0, BT 4
      // P2 arrives at 2, BT 2
      // Quantum = 2
      // At t=2: P1 quantum expires (2 units elapsed). Simultaneously, P2 arrives at t=2!
      // Academic policy: P2 enters queue BEFORE P1 re-enters.
      // So at t=2, ready queue MUST be [P2, P1].
      // Therefore P2 MUST run next at t=2!
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'P1', arrivalTime: 0, burstTime: 4, priority: 1 },
        { pid: 'P2', name: 'P2', arrivalTime: 2, burstTime: 2, priority: 1 },
      ];

      const result = runRoundRobin(workload, { quantum: 2 });

      // If P2 was queued first:
      // t=0..2: P1 (rem 2)
      // t=2..4: P2 (rem 0) -> finishes at 4
      // t=4..6: P1 (rem 0) -> finishes at 6
      expect(result.gantt.map((s) => s.pid)).toEqual(['P1', 'P2', 'P1']);
      expect(result.processMetrics['P2'].completionTime).toBe(4);
      expect(result.processMetrics['P1'].completionTime).toBe(6);
    });

    it('handles quantum = 1 correctly with fine-grained interleaving', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'P1', arrivalTime: 0, burstTime: 2, priority: 1 },
        { pid: 'P2', name: 'P2', arrivalTime: 0, burstTime: 2, priority: 1 },
      ];

      const result = runRoundRobin(workload, { quantum: 1 });

      // P1 (0..1), P2 (1..2), P1 (2..3), P2 (3..4)
      expect(result.gantt.map((s) => s.pid)).toEqual(['P1', 'P2', 'P1', 'P2']);
      expect(result.metrics.totalTime).toBe(4);
    });

    it('rejects quantum <= 0 with explicit error', () => {
      const workload: ProcessInput[] = [
        { pid: 'P1', name: 'P1', arrivalTime: 0, burstTime: 3, priority: 1 },
      ];

      expect(() => runRoundRobin(workload, { quantum: 0 })).toThrow(/positive integer/);
      expect(() => runRoundRobin(workload, { quantum: -2 })).toThrow(/positive integer/);
    });
  });
});
