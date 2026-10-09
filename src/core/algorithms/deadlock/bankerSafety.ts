/**
 * OScope — Banker's Safety Algorithm
 * Pure, deterministic deadlock avoidance algorithm computing safe execution sequences and work telemetry.
 */

import type { ResourceAllocationState, BankerSafetyResult, BankerStep } from '../../models/deadlock';
import { isVectorLessOrEqual, addVectors } from './matrix';

/**
 * Runs Banker's Safety Algorithm on the provided ResourceAllocationState.
 *
 * Deterministic Tie-Breaking Policy:
 * When multiple processes have Need[i] <= Work simultaneously, the algorithm
 * evaluates processes strictly in the order of their appearance in `state.processes`.
 * This guarantees reproducible safe sequence generation across all executions.
 */
export function runBankerSafetyCheck(
  state: ResourceAllocationState,
  customTieBreaker?: (eligibleIndices: number[], processes: readonly string[]) => number
): BankerSafetyResult {
  const n = state.processCount;

  // 1. Work = Available (copy)
  let work = [...state.available];

  // 2. Finish[i] = false for all i
  const finish = new Array<boolean>(n).fill(false);

  const safeSequence: string[] = [];
  const steps: BankerStep[] = [];
  let stepNumber = 1;

  // Loop until all finished or no progress can be made
  let progressMade = true;

  while (progressMade && safeSequence.length < n) {
    progressMade = false;

    // Find all eligible processes: Finish[i] === false && Need[i] <= Work
    const eligibleIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        const needRow = state.need[i];
        if (isVectorLessOrEqual(needRow, work)) {
          eligibleIndices.push(i);
        }
      }
    }

    if (eligibleIndices.length > 0) {
      // Apply tie-breaker: default is lowest index (order in state.processes)
      const selectedIndex = customTieBreaker
        ? customTieBreaker(eligibleIndices, state.processes)
        : eligibleIndices[0];

      const pId = state.processes[selectedIndex];
      const needRow = [...state.need[selectedIndex]];
      const allocRow = [...state.allocation[selectedIndex]];
      const workBefore = [...work];

      // Work = Work + Allocation[i]
      work = addVectors(work, allocRow);
      finish[selectedIndex] = true;
      safeSequence.push(pId);
      progressMade = true;

      steps.push({
        stepNumber: stepNumber++,
        processId: pId,
        workVectorBefore: Object.freeze(workBefore),
        needVector: Object.freeze(needRow),
        allocationVector: Object.freeze(allocRow),
        workVectorAfter: Object.freeze([...work]),
        canAllocate: true,
        explanation: `Process ${pId} has Need [${needRow.join(', ')}] ≤ Work [${workBefore.join(', ')}]. It executes, releases its Allocation [${allocRow.join(', ')}], and Work becomes [${work.join(', ')}].`,
      });
    } else {
      // Check unfinished processes to record why they could not proceed
      for (let i = 0; i < n; i++) {
        if (!finish[i]) {
          const pId = state.processes[i];
          const needRow = [...state.need[i]];
          const allocRow = [...state.allocation[i]];
          steps.push({
            stepNumber: stepNumber++,
            processId: pId,
            workVectorBefore: Object.freeze([...work]),
            needVector: Object.freeze(needRow),
            allocationVector: Object.freeze(allocRow),
            workVectorAfter: Object.freeze([...work]),
            canAllocate: false,
            explanation: `Process ${pId} has Need [${needRow.join(', ')}] > Current Work [${work.join(', ')}]. It cannot proceed.`,
          });
        }
      }
    }
  }

  const isSafe = safeSequence.length === n;
  const explanation = isSafe
    ? `System is in a SAFE STATE. A complete safe execution sequence exists: <${safeSequence.join(', ')}>. All processes can finish without deadlock.`
    : `System is in an UNSAFE STATE. No safe execution sequence exists because remaining processes (${state.processes.filter((_, i) => !finish[i]).join(', ')}) have resource needs exceeding current available work. Note: An unsafe state does NOT necessarily mean deadlock is currently present, but the OS cannot guarantee deadlock prevention.`;

  return Object.freeze({
    isSafe,
    safeSequence: Object.freeze(safeSequence),
    steps: Object.freeze(steps),
    needMatrix: state.need,
    explanation,
  });
}

/**
 * Independently validates that an alleged safe sequence is mathematically executable
 * under the system's Available and Need constraints.
 */
export function verifySafeSequence(
  state: ResourceAllocationState,
  sequence: readonly string[]
): boolean {
  if (sequence.length !== state.processCount) return false;

  // Check uniqueness of processes
  const seen = new Set<string>();
  for (const pid of sequence) {
    if (seen.has(pid)) return false;
    seen.add(pid);
  }

  let work = [...state.available];

  for (const pid of sequence) {
    const idx = state.processes.indexOf(pid);
    if (idx === -1) return false;

    const needRow = state.need[idx];
    const allocRow = state.allocation[idx];

    // Need must be <= Work
    if (!isVectorLessOrEqual(needRow, work)) {
      return false;
    }

    // Work = Work + Allocation
    work = addVectors(work, allocRow);
  }

  return true;
}
