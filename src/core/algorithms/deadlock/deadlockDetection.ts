/**
 * OScope — Deadlock Detection Algorithm
 * Pure, deterministic detection algorithm for multi-instance resource systems.
 * Distinguishes deadlock detection from Banker's avoidance algorithm.
 */

import type {
  ResourceAllocationState,
  DeadlockDetectionResult,
  DeadlockDetectionStep,
} from '../../models/deadlock';
import { isVectorLessOrEqual, addVectors } from './matrix';

/**
 * Runs the standard Operating System Deadlock Detection algorithm on current allocations and outstanding requests.
 *
 * Algorithm semantics:
 * 1. Work = Available
 * 2. For i = 0 to n-1:
 *      if Allocation[i] != 0: Finish[i] = false
 *      else: Finish[i] = true (processes holding zero resources cannot be deadlocked)
 * 3. Find process Pi where Finish[i] == false and Request[i] <= Work.
 *    If found:
 *      Work = Work + Allocation[i]
 *      Finish[i] = true
 *      repeat.
 * 4. Any process with Finish[i] == false is DEADLOCKED.
 */
export function runDeadlockDetection(
  state: ResourceAllocationState,
  outstandingRequests?: readonly (readonly number[])[]
): DeadlockDetectionResult {
  const n = state.processCount;
  const m = state.resourceCount;

  // If no specific request matrix is given, use the Need matrix as pending requests
  const requests = outstandingRequests ?? state.need;

  // 1. Work = Available
  let work = [...state.available];

  // 2. Finish initialization:
  // Finish[i] = true if Allocation[i] is all zeros; otherwise false
  const finish = new Array<boolean>(n).fill(false);
  for (let i = 0; i < n; i++) {
    const isAllZeroAlloc = state.allocation[i].every((v) => v === 0);
    if (isAllZeroAlloc) {
      finish[i] = true;
    }
  }

  const steps: DeadlockDetectionStep[] = [];
  let stepNumber = 1;
  let progressMade = true;

  while (progressMade) {
    progressMade = false;

    // Deterministic selection: inspect processes in PID index order
    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        const reqRow = requests[i] ?? [];
        if (isVectorLessOrEqual(reqRow, work)) {
          const pId = state.processes[i];
          const allocRow = state.allocation[i];
          const workBefore = [...work];

          work = addVectors(work, allocRow);
          finish[i] = true;
          progressMade = true;

          steps.push({
            stepNumber: stepNumber++,
            processId: pId,
            workBefore: Object.freeze(workBefore),
            requestVector: Object.freeze([...reqRow]),
            allocationVector: Object.freeze([...allocRow]),
            workAfter: Object.freeze([...work]),
            canFinish: true,
            explanation: `Process ${pId} has Request [${reqRow.join(', ')}] ≤ Work [${workBefore.join(', ')}]. It can satisfy its request, finish execution, and release Allocation [${allocRow.join(', ')}]. New Work: [${work.join(', ')}].`,
          });
          break; // restart scan from lowest index to guarantee deterministic ordering
        }
      }
    }
  }

  // Identify deadlocked processes
  const deadlockedProcesses: string[] = [];
  for (let i = 0; i < n; i++) {
    if (!finish[i]) {
      const pId = state.processes[i];
      deadlockedProcesses.push(pId);
      const reqRow = requests[i] ?? [];
      const allocRow = state.allocation[i];
      steps.push({
        stepNumber: stepNumber++,
        processId: pId,
        workBefore: Object.freeze([...work]),
        requestVector: Object.freeze([...reqRow]),
        allocationVector: Object.freeze([...allocRow]),
        workAfter: Object.freeze([...work]),
        canFinish: false,
        explanation: `Process ${pId} remains BLOCKED. Its outstanding Request [${reqRow.join(', ')}] exceeds available Work [${work.join(', ')}]. It cannot proceed.`,
      });
    }
  }

  // Identify resources held by deadlocked processes
  const deadlockedResourceSet = new Set<string>();
  if (deadlockedProcesses.length > 0) {
    for (const pId of deadlockedProcesses) {
      const pIdx = state.processes.indexOf(pId);
      for (let j = 0; j < m; j++) {
        if ((state.allocation[pIdx][j] ?? 0) > 0 || (requests[pIdx][j] ?? 0) > 0) {
          deadlockedResourceSet.add(state.resources[j]);
        }
      }
    }
  }

  const isDeadlocked = deadlockedProcesses.length > 0;
  const explanation = isDeadlocked
    ? `DEADLOCK DETECTED: The system contains ${deadlockedProcesses.length} deadlocked process(es): [${deadlockedProcesses.join(', ')}]. These processes are in a permanent circular waiting state with insufficient available resources to proceed.`
    : `NO DEADLOCK DETECTED: All active processes can acquire their requested resources and run to completion with currently available resources and released allocations.`;

  return Object.freeze({
    isDeadlocked,
    deadlockedProcesses: Object.freeze(deadlockedProcesses),
    deadlockedResources: Object.freeze(Array.from(deadlockedResourceSet)),
    cyclePaths: Object.freeze([]),
    steps: Object.freeze(steps),
    explanation,
  });
}
