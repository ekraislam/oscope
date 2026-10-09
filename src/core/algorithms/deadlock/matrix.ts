/**
 * OScope — Deadlock Domain Matrix & Vector Operations
 * Pure functions for matrix derivation, immutable state normalization, and vector arithmetic.
 */

import type { ResourceAllocationState } from '../../models/deadlock';

/**
 * Computes derived Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
 */
export function deriveNeedMatrix(
  max: readonly (readonly number[])[],
  allocation: readonly (readonly number[])[]
): number[][] {
  const n = max.length;
  const need: number[][] = [];

  for (let i = 0; i < n; i++) {
    const maxRow = max[i] ?? [];
    const allocRow = allocation[i] ?? [];
    const m = maxRow.length;
    const needRow: number[] = [];

    for (let j = 0; j < m; j++) {
      const maxVal = maxRow[j] ?? 0;
      const allocVal = allocRow[j] ?? 0;
      const needVal = maxVal - allocVal;
      if (needVal < 0) {
        throw new Error(
          `MatrixError: Allocation (${allocVal}) cannot exceed Max (${maxVal}) at row ${i}, col ${j}`
        );
      }
      needRow.push(needVal);
    }
    need.push(needRow);
  }

  return need;
}

/**
 * Normalizes and builds an immutable ResourceAllocationState, strictly deriving Need from Max and Allocation.
 */
export function createResourceAllocationState(params: {
  processes: readonly string[];
  resources: readonly string[];
  available: readonly number[];
  max: readonly (readonly number[])[];
  allocation: readonly (readonly number[])[];
}): ResourceAllocationState {
  const { processes, resources, available, max, allocation } = params;
  const n = processes.length;
  const m = resources.length;

  if (n <= 0) {
    throw new Error('ResourceAllocationStateError: Process list must not be empty.');
  }
  if (m <= 0) {
    throw new Error('ResourceAllocationStateError: Resource list must not be empty.');
  }
  if (available.length !== m) {
    throw new Error(
      `ResourceAllocationStateError: Available vector length (${available.length}) must equal resource count (${m}).`
    );
  }
  if (max.length !== n) {
    throw new Error(
      `ResourceAllocationStateError: Max matrix rows (${max.length}) must equal process count (${n}).`
    );
  }
  if (allocation.length !== n) {
    throw new Error(
      `ResourceAllocationStateError: Allocation matrix rows (${allocation.length}) must equal process count (${n}).`
    );
  }

  // Check each row width
  for (let i = 0; i < n; i++) {
    if (max[i].length !== m) {
      throw new Error(`ResourceAllocationStateError: Max row ${i} has ${max[i].length} cols, expected ${m}.`);
    }
    if (allocation[i].length !== m) {
      throw new Error(`ResourceAllocationStateError: Allocation row ${i} has ${allocation[i].length} cols, expected ${m}.`);
    }
  }

  // Derive Need matrix
  const derivedNeed = deriveNeedMatrix(max, allocation);

  // Deep freeze all data structures
  const frozenMax = Object.freeze(max.map((row) => Object.freeze([...row])));
  const frozenAlloc = Object.freeze(allocation.map((row) => Object.freeze([...row])));
  const frozenNeed = Object.freeze(derivedNeed.map((row) => Object.freeze([...row])));
  const frozenAvailable = Object.freeze([...available]);
  const frozenProcesses = Object.freeze([...processes]);
  const frozenResources = Object.freeze([...resources]);

  return Object.freeze({
    processCount: n,
    resourceCount: m,
    processes: frozenProcesses,
    resources: frozenResources,
    available: frozenAvailable,
    max: frozenMax,
    allocation: frozenAlloc,
    need: frozenNeed,
  });
}

/**
 * Calculates total system resources: Total[j] = Available[j] + sum_i(Allocation[i][j])
 */
export function computeTotalResources(
  available: readonly number[],
  allocation: readonly (readonly number[])[]
): number[] {
  const m = available.length;
  const totals = [...available];

  for (let j = 0; j < m; j++) {
    for (let i = 0; i < allocation.length; i++) {
      totals[j] += allocation[i][j] ?? 0;
    }
  }

  return totals;
}

/**
 * Evaluates whether v1 <= v2 component-wise.
 */
export function isVectorLessOrEqual(v1: readonly number[], v2: readonly number[]): boolean {
  if (v1.length !== v2.length) return false;
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] > v2[i]) return false;
  }
  return true;
}

/**
 * Adds two vectors component-wise: v1 + v2.
 */
export function addVectors(v1: readonly number[], v2: readonly number[]): number[] {
  if (v1.length !== v2.length) {
    throw new Error(`Vector mismatch: length ${v1.length} vs ${v2.length}`);
  }
  return v1.map((val, idx) => val + v2[idx]);
}

/**
 * Subtracts two vectors component-wise: v1 - v2.
 */
export function subtractVectors(v1: readonly number[], v2: readonly number[]): number[] {
  if (v1.length !== v2.length) {
    throw new Error(`Vector mismatch: length ${v1.length} vs ${v2.length}`);
  }
  return v1.map((val, idx) => val - v2[idx]);
}

/**
 * Deep clones a matrix.
 */
export function cloneMatrix(matrix: readonly (readonly number[])[]): number[][] {
  return matrix.map((row) => [...row]);
}
