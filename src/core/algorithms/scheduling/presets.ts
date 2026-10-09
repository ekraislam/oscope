/**
 * OScope — Academic Scheduling Workload Presets
 * Curated scenarios demonstrating key OS principles: convoy effect, preemption,
 * starvation risk, time-slicing, idle CPU gaps, and deterministic tie-breaking.
 */

import type { ProcessInput } from '../../models';

export interface WorkloadPreset {
  readonly id: string;
  readonly name: string;
  readonly recommendedAlgorithm: 'FCFS' | 'SJF_NON_PREEMPTIVE' | 'SRTF_PREEMPTIVE' | 'PRIORITY_PREEMPTIVE' | 'ROUND_ROBIN';
  readonly recommendedOptions: {
    readonly quantum?: number;
    readonly contextSwitchCost?: number;
  };
  readonly purpose: string;
  readonly expectedConcept: string;
  readonly interestingBehavior: string;
  readonly processes: readonly ProcessInput[];
}

export const SCHEDULING_PRESETS: readonly WorkloadPreset[] = Object.freeze([
  {
    id: 'convoy_fcfs',
    name: '1. FCFS Convoy Effect Demo',
    recommendedAlgorithm: 'FCFS',
    recommendedOptions: { contextSwitchCost: 0 },
    purpose: 'Demonstrates how a single long CPU-bound process arriving at t=0 delays all subsequent short processes (the classic Convoy Effect).',
    expectedConcept: 'Convoy Effect / High Average Waiting Time in FCFS',
    interestingBehavior: 'P1 runs for 12ms while P2, P3, P4 are forced to wait, causing average waiting time to balloon.',
    processes: Object.freeze([
      { pid: 'P1', name: 'Heavy Computation', arrivalTime: 0, burstTime: 12, priority: 3 },
      { pid: 'P2', name: 'Quick Task A', arrivalTime: 1, burstTime: 2, priority: 2 },
      { pid: 'P3', name: 'Quick Task B', arrivalTime: 2, burstTime: 2, priority: 1 },
      { pid: 'P4', name: 'Quick Task C', arrivalTime: 3, burstTime: 1, priority: 1 },
    ]),
  },
  {
    id: 'sjf_minimal_wait',
    name: '2. SJF Waiting Time Minimization',
    recommendedAlgorithm: 'SJF_NON_PREEMPTIVE',
    recommendedOptions: { contextSwitchCost: 0 },
    purpose: 'Proves mathematically that Shortest Job First yields the optimal minimal average waiting time among non-preemptive schedulers.',
    expectedConcept: 'Provably Optimal Average Waiting Time for Non-Preemptive Schedulers',
    interestingBehavior: 'Notice the contrast with FCFS on the same workload: average waiting time drops dramatically.',
    processes: Object.freeze([
      { pid: 'P1', name: 'Batch Job', arrivalTime: 0, burstTime: 8, priority: 3 },
      { pid: 'P2', name: 'Interactive UI', arrivalTime: 1, burstTime: 4, priority: 1 },
      { pid: 'P3', name: 'Sensor Poll', arrivalTime: 2, burstTime: 2, priority: 1 },
      { pid: 'P4', name: 'Network Packet', arrivalTime: 3, burstTime: 1, priority: 2 },
    ]),
  },
  {
    id: 'srtf_preemption',
    name: '3. SRTF Dynamic Preemption',
    recommendedAlgorithm: 'SRTF_PREEMPTIVE',
    recommendedOptions: { contextSwitchCost: 0 },
    purpose: 'Demonstrates immediate CPU preemption when a shorter job arrives while a longer job is actively executing.',
    expectedConcept: 'Preemptive Context Switching & Shortest Remaining Time First',
    interestingBehavior: 'P1 starts running at t=0, but is preempted at t=2 when P2 arrives with smaller burst (3 < 6).',
    processes: Object.freeze([
      { pid: 'P1', name: 'Large Task', arrivalTime: 0, burstTime: 8, priority: 3 },
      { pid: 'P2', name: 'Urgent Small', arrivalTime: 2, burstTime: 3, priority: 1 },
      { pid: 'P3', name: 'Medium Job', arrivalTime: 4, burstTime: 4, priority: 2 },
      { pid: 'P4', name: 'Micro Service', arrivalTime: 5, burstTime: 1, priority: 1 },
    ]),
  },
  {
    id: 'round_robin_fairness',
    name: '4. Round Robin Time-Slicing',
    recommendedAlgorithm: 'ROUND_ROBIN',
    recommendedOptions: { quantum: 2, contextSwitchCost: 0 },
    purpose: 'Illustrates time-sliced fair sharing and how response times improve for interactive processes.',
    expectedConcept: 'Time Quantum, Preemption, and FIFO Ready Queue Cycling',
    interestingBehavior: 'Each process executes for 2ms before yielding back to the queue, preventing starvation.',
    processes: Object.freeze([
      { pid: 'P1', name: 'Editor', arrivalTime: 0, burstTime: 5, priority: 2 },
      { pid: 'P2', name: 'Terminal', arrivalTime: 1, burstTime: 4, priority: 2 },
      { pid: 'P3', name: 'Compiler', arrivalTime: 2, burstTime: 6, priority: 2 },
    ]),
  },
  {
    id: 'priority_starvation',
    name: '5. Priority Preemption & Starvation Risk',
    recommendedAlgorithm: 'PRIORITY_PREEMPTIVE',
    recommendedOptions: { contextSwitchCost: 0 },
    purpose: 'Shows how high-priority arrivals continuously preempt and potentially starve lower-priority processes.',
    expectedConcept: 'Priority Inversion / Starvation Vulnerability',
    interestingBehavior: 'P1 (low priority 3) is repeatedly postponed by P2, P3, and P4 which carry higher priorities (1 and 0).',
    processes: Object.freeze([
      { pid: 'P1', name: 'Low Priority Worker', arrivalTime: 0, burstTime: 8, priority: 3 },
      { pid: 'P2', name: 'High Priority Task A', arrivalTime: 1, burstTime: 2, priority: 1 },
      { pid: 'P3', name: 'High Priority Task B', arrivalTime: 3, burstTime: 2, priority: 1 },
      { pid: 'P4', name: 'Real-time Audio Task', arrivalTime: 5, burstTime: 3, priority: 0 },
    ]),
  },
  {
    id: 'idle_gaps',
    name: '6. CPU Idle Intervals & Gaps',
    recommendedAlgorithm: 'FCFS',
    recommendedOptions: { contextSwitchCost: 0 },
    purpose: 'Demonstrates CPU remaining IDLE when arrival times have substantial gaps, and how idle time impacts utilization.',
    expectedConcept: 'CPU Idle Periods & Makespan Calculation',
    interestingBehavior: 'Observe the IDLE segments from t=3 to t=7 and t=10 to t=15. CPU utilization is reduced.',
    processes: Object.freeze([
      { pid: 'P1', name: 'Morning Burst', arrivalTime: 0, burstTime: 3, priority: 1 },
      { pid: 'P2', name: 'Noon Burst', arrivalTime: 7, burstTime: 3, priority: 1 },
      { pid: 'P3', name: 'Evening Burst', arrivalTime: 15, burstTime: 4, priority: 1 },
    ]),
  },
  {
    id: 'tie_breaking_deterministic',
    name: '7. Deterministic Tie-Breaking Scenario',
    recommendedAlgorithm: 'SJF_NON_PREEMPTIVE',
    recommendedOptions: { contextSwitchCost: 0 },
    purpose: 'Validates that processes with identical burst and arrival times break ties deterministically via natural PID order.',
    expectedConcept: 'Deterministic Algorithm Stability & Tie-Breaking Policies',
    interestingBehavior: 'P1, P2, and P3 all arrive at t=0 with identical burst (3ms). Schedulers deterministically dispatch P1, then P2, then P3.',
    processes: Object.freeze([
      { pid: 'P1', name: 'Thread Alpha', arrivalTime: 0, burstTime: 3, priority: 1 },
      { pid: 'P2', name: 'Thread Beta', arrivalTime: 0, burstTime: 3, priority: 1 },
      { pid: 'P3', name: 'Thread Gamma', arrivalTime: 0, burstTime: 3, priority: 1 },
    ]),
  },
]);
