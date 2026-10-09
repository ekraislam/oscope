/**
 * OScope — Deadlock & Banker's Algorithm Presets
 * Academically rigorous presets covering safe sequences, unsafe states, request evaluation,
 * classic single-instance RAG deadlock, and multi-instance cycle non-deadlock demonstration.
 */

import type { ResourceAllocationState, ResourceRequest } from '../../models/deadlock';
import { createResourceAllocationState } from './matrix';

export interface DeadlockPreset {
  readonly id: string;
  readonly name: string;
  readonly category: 'SAFETY' | 'REQUEST' | 'RAG_CYCLE' | 'DETECTION';
  readonly description: string;
  readonly academicFocus: string;
  readonly state: ResourceAllocationState;
  readonly pendingRequests?: readonly (readonly number[])[];
  readonly recommendedRequest?: ResourceRequest;
  readonly expectedSafe: boolean;
  readonly expectedDeadlocked: boolean;
  readonly expectedCycle: boolean;
}

/**
 * 1. Classic Safe Banker State (Silberschatz / Galvin standard)
 * 5 processes, 3 resource types (A=10, B=5, C=7)
 */
const classicSafeState = createResourceAllocationState({
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
});

/**
 * 2. Unsafe Banker State
 * Available is [0, 0, 0], no process can satisfy remaining need.
 */
const unsafeBankerState = createResourceAllocationState({
  processes: ['P0', 'P1', 'P2', 'P3'],
  resources: ['A', 'B', 'C'],
  available: [0, 0, 0],
  max: [
    [4, 3, 3],
    [3, 2, 2],
    [5, 2, 2],
    [2, 2, 2],
  ],
  allocation: [
    [2, 1, 1],
    [1, 1, 0],
    [2, 0, 1],
    [1, 1, 1],
  ],
});

/**
 * 3. Single-Instance Deadlock Cycle
 * R0 and R1 have 1 instance each.
 * P0 holds R0, requests R1.
 * P1 holds R1, requests R0.
 */
const singleInstanceDeadlockState = createResourceAllocationState({
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

/**
 * 4. Multi-Instance Non-Deadlock Cycle
 * R0 has 2 instances, R1 has 1 instance.
 * P0 holds 1 of R0, requests R1.
 * P1 holds 1 of R1, requests R0.
 * P2 holds 1 of R0, but needs NO further resources!
 * P2 can finish and release R0, breaking the cycle!
 */
const multiInstanceNonDeadlockState = createResourceAllocationState({
  processes: ['P0', 'P1', 'P2'],
  resources: ['R0', 'R1'],
  available: [0, 0],
  max: [
    [1, 1], // P0
    [1, 1], // P1
    [1, 0], // P2 only needs the 1 of R0 it already holds
  ],
  allocation: [
    [1, 0], // P0 holds R0 (instance 1)
    [0, 1], // P1 holds R1 (instance 1)
    [1, 0], // P2 holds R0 (instance 2)
  ],
});

/**
 * 5. Multi-Instance Deadlock Detection Scenario
 * 4 processes, 3 resource types.
 * Deadlock exists between P1 and P2, while P0 finishes.
 */
const deadlockDetectionState = createResourceAllocationState({
  processes: ['P0', 'P1', 'P2', 'P3'],
  resources: ['A', 'B', 'C'],
  available: [0, 0, 0],
  max: [
    [0, 1, 0], // P0 needs 0
    [2, 0, 2], // P1 needs [0, 0, 2]
    [0, 2, 0], // P2 needs [0, 1, 0]
    [3, 3, 3], // P3
  ],
  allocation: [
    [0, 1, 0], // P0 holds B
    [2, 0, 0], // P1 holds A
    [0, 1, 0], // P2 holds B
    [1, 0, 1], // P3 holds A, C
  ],
});

export const DEADLOCK_PRESETS: readonly DeadlockPreset[] = [
  {
    id: 'classic-safe',
    name: '1. Classic Safe Banker State',
    category: 'SAFETY',
    description: 'Standard textbook system with 5 processes and 3 resource types (A=10, B=5, C=7).',
    academicFocus: 'Demonstrates deterministic Work vector progression and safe sequence discovery: <P1, P3, P0, P2, P4>.',
    state: classicSafeState,
    pendingRequests: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    expectedSafe: true,
    expectedDeadlocked: false,
    expectedCycle: false,
  },
  {
    id: 'unsafe-state',
    name: '2. Unsafe Banker State',
    category: 'SAFETY',
    description: 'System with exhausted Available resources where no process can satisfy its remaining Need.',
    academicFocus: 'Shows why an Unsafe State does NOT automatically mean Deadlock: Banker is unsafe, but no process is currently deadlocked.',
    state: unsafeBankerState,
    pendingRequests: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    expectedSafe: false,
    expectedDeadlocked: false,
    expectedCycle: false,
  },
  {
    id: 'grantable-request',
    name: '3. Grantable Resource Request',
    category: 'REQUEST',
    description: 'Process P1 requests [1, 0, 2] in the classic safe scenario.',
    academicFocus: 'Demonstrates the 3-phase check: Request ≤ Need, Request ≤ Available, and provisional safety preservation.',
    state: classicSafeState,
    pendingRequests: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    recommendedRequest: {
      processId: 'P1',
      requestVector: [1, 0, 2],
    },
    expectedSafe: true,
    expectedDeadlocked: false,
    expectedCycle: false,
  },
  {
    id: 'denied-request',
    name: '4. Denied Resource Request (Unsafe Grant)',
    category: 'REQUEST',
    description: 'Process P4 requests [2, 3, 0]. Although available, granting it leaves Available with [1, 0, 2], an unsafe state.',
    academicFocus: 'Illustrates Banker avoidance: the OS denies an immediately fulfillable request to prevent entering an unsafe state.',
    state: classicSafeState,
    pendingRequests: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    recommendedRequest: {
      processId: 'P4',
      requestVector: [2, 3, 0],
    },
    expectedSafe: true,
    expectedDeadlocked: false,
    expectedCycle: false,
  },
  {
    id: 'single-instance-deadlock',
    name: '5. Single-Instance RAG Deadlock Cycle',
    category: 'RAG_CYCLE',
    description: 'Two processes and two single-instance resources forming a mutual circular hold-and-wait cycle.',
    academicFocus: 'Demonstrates the theorem: For single-instance resources, a cycle in the RAG is BOTH necessary and sufficient for deadlock.',
    state: singleInstanceDeadlockState,
    pendingRequests: [
      [0, 1],
      [1, 0],
    ],
    expectedSafe: false,
    expectedDeadlocked: true,
    expectedCycle: true,
  },
  {
    id: 'multi-instance-non-deadlock',
    name: '6. Multi-Instance Cycle (No Deadlock)',
    category: 'RAG_CYCLE',
    description: 'A directed cycle exists between P0 and P1, but P2 holds a 2nd instance of R0 and can finish to release it.',
    academicFocus: 'Crucial academic distinction: In multi-instance systems, a RAG cycle does NOT necessarily mean deadlock.',
    state: multiInstanceNonDeadlockState,
    pendingRequests: [
      [0, 1],
      [1, 0],
      [0, 0],
    ],
    expectedSafe: true,
    expectedDeadlocked: false,
    expectedCycle: true,
  },
  {
    id: 'deadlock-detection',
    name: '7. Multi-Instance Deadlock Detection',
    category: 'DETECTION',
    description: 'Evaluation of actual outstanding requests against available work to detect permanently blocked processes.',
    academicFocus: 'Contrasts Banker avoidance (based on declared maximum Need) with Deadlock Detection (based on actual pending Requests).',
    state: deadlockDetectionState,
    pendingRequests: [
      [0, 0, 0],
      [0, 0, 2],
      [0, 1, 0],
      [0, 2, 0],
    ],
    expectedSafe: false,
    expectedDeadlocked: true,
    expectedCycle: true,
  },
];
