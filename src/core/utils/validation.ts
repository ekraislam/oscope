/**
 * OScope — Pure Domain Validation Utilities
 * Framework-independent validators returning structured ValidationResult objects.
 */

import type { ProcessInput } from '../models/process';
import type { MemoryConfiguration } from '../models/memory';

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function success(): ValidationResult {
  return Object.freeze({ valid: true, errors: Object.freeze([]) });
}

function failure(errors: string[]): ValidationResult {
  return Object.freeze({ valid: false, errors: Object.freeze([...errors]) });
}

/**
 * Validates a single ProcessInput object.
 */
export function validateProcessInput(input: ProcessInput): ValidationResult {
  const errors: string[] = [];

  if (!input.pid || input.pid.trim().length === 0) {
    errors.push('Process PID must not be empty');
  }

  if (typeof input.arrivalTime !== 'number' || isNaN(input.arrivalTime) || input.arrivalTime < 0) {
    errors.push(`Process "${input.pid || 'unknown'}": arrivalTime must be a non-negative number`);
  }

  if (typeof input.burstTime !== 'number' || isNaN(input.burstTime) || input.burstTime < 0) {
    errors.push(`Process "${input.pid || 'unknown'}": burstTime must be a non-negative number`);
  }

  if (input.priority !== undefined && (typeof input.priority !== 'number' || isNaN(input.priority))) {
    errors.push(`Process "${input.pid || 'unknown'}": priority must be a valid number`);
  }

  if (input.ioBursts && input.ioBursts.length > 0) {
    for (let i = 0; i < input.ioBursts.length; i++) {
      const io = input.ioBursts[i];
      if (typeof io.startAtCPUTime !== 'number' || io.startAtCPUTime < 0) {
        errors.push(`Process "${input.pid}": I/O burst [${i}] startAtCPUTime must be non-negative`);
      }
      if (typeof io.duration !== 'number' || io.duration < 0) {
        errors.push(`Process "${input.pid}": I/O burst [${i}] duration must be non-negative`);
      }
      if (io.startAtCPUTime >= input.burstTime && input.burstTime > 0) {
        errors.push(
          `Process "${input.pid}": I/O burst [${i}] start time (${io.startAtCPUTime}) must be less than total CPU burst (${input.burstTime})`
        );
      }
    }
  }

  return errors.length === 0 ? success() : failure(errors);
}

/**
 * Validates a workload of processes ensuring unique PIDs and valid individual attributes.
 */
export function validateProcessWorkload(workload: readonly ProcessInput[]): ValidationResult {
  const errors: string[] = [];

  if (!workload || workload.length === 0) {
    errors.push('Process workload must not be empty');
    return failure(errors);
  }

  const seenPids = new Set<string>();

  for (const proc of workload) {
    const singleResult = validateProcessInput(proc);
    if (!singleResult.valid) {
      errors.push(...singleResult.errors);
    }

    if (proc.pid && seenPids.has(proc.pid)) {
      errors.push(`Duplicate process PID detected: "${proc.pid}"`);
    } else if (proc.pid) {
      seenPids.add(proc.pid);
    }
  }

  return errors.length === 0 ? success() : failure(errors);
}

/**
 * Validates Banker's Algorithm allocation matrices and available vector.
 */
export function validateBankerState(params: {
  readonly processes: readonly string[];
  readonly resources: readonly string[];
  readonly available: readonly number[];
  readonly max: readonly (readonly number[])[];
  readonly allocation: readonly (readonly number[])[];
}): ValidationResult {
  const errors: string[] = [];
  const n = params.processes.length;
  const m = params.resources.length;

  if (n === 0) errors.push('Banker validation error: process list is empty');
  if (m === 0) errors.push('Banker validation error: resource list is empty');

  if (params.available.length !== m) {
    errors.push(`Available vector length (${params.available.length}) must match resource count (${m})`);
  }

  for (let j = 0; j < params.available.length; j++) {
    const val = params.available[j];
    if (typeof val !== 'number' || isNaN(val) || val < 0 || !Number.isInteger(val)) {
      errors.push(`Available resource "${params.resources[j] ?? j}" must be a non-negative integer, got ${val}`);
    }
  }

  if (params.max.length !== n) {
    errors.push(`Max matrix row count (${params.max.length}) must match process count (${n})`);
  }

  if (params.allocation.length !== n) {
    errors.push(`Allocation matrix row count (${params.allocation.length}) must match process count (${n})`);
  }

  for (let i = 0; i < n; i++) {
    const maxRow = params.max[i] ?? [];
    const allocRow = params.allocation[i] ?? [];
    const procName = params.processes[i] ?? `P${i}`;

    if (maxRow.length !== m) {
      errors.push(`Max row for process ${procName} has ${maxRow.length} columns, expected ${m}`);
    }
    if (allocRow.length !== m) {
      errors.push(`Allocation row for process ${procName} has ${allocRow.length} columns, expected ${m}`);
    }

    for (let j = 0; j < m; j++) {
      const maxVal = maxRow[j] ?? 0;
      const allocVal = allocRow[j] ?? 0;
      const resName = params.resources[j] ?? `R${j}`;

      if (maxVal < 0 || !Number.isInteger(maxVal)) {
        errors.push(`Max demand for ${procName} on ${resName} must be a non-negative integer, got ${maxVal}`);
      }
      if (allocVal < 0 || !Number.isInteger(allocVal)) {
        errors.push(`Allocation for ${procName} on ${resName} must be a non-negative integer, got ${allocVal}`);
      }
      if (allocVal > maxVal) {
        errors.push(
          `Allocation (${allocVal}) exceeds maximum demand (${maxVal}) for process ${procName} on resource ${resName}`
        );
      }
    }
  }

  return errors.length === 0 ? success() : failure(errors);
}

/**
 * Validates memory hardware configuration.
 */
export function validateMemoryConfig(config: MemoryConfiguration): ValidationResult {
  const errors: string[] = [];

  if (config.pageSizeBytes <= 0 || !Number.isInteger(config.pageSizeBytes)) {
    errors.push('Page size must be a positive integer');
  } else if ((config.pageSizeBytes & (config.pageSizeBytes - 1)) !== 0) {
    errors.push(`Page size (${config.pageSizeBytes} B) must be a power of 2 (e.g. 256, 512, 1024, 4096)`);
  }

  if (config.totalMemoryBytes <= 0 || !Number.isInteger(config.totalMemoryBytes)) {
    errors.push('Total memory size must be a positive integer');
  } else if (config.pageSizeBytes > 0 && config.totalMemoryBytes % config.pageSizeBytes !== 0) {
    errors.push(`Total memory (${config.totalMemoryBytes} B) must be an exact multiple of page size (${config.pageSizeBytes} B)`);
  }

  if (config.frameCount <= 0 || !Number.isInteger(config.frameCount)) {
    errors.push('Physical frame count must be a positive integer');
  }

  if (config.tlbSize <= 0 || !Number.isInteger(config.tlbSize)) {
    errors.push('TLB entry size must be a positive integer');
  }

  return errors.length === 0 ? success() : failure(errors);
}

/**
 * Validates a page reference string for page replacement simulation.
 */
export function validateReferenceString(referenceString: readonly number[]): ValidationResult {
  const errors: string[] = [];

  if (!referenceString || referenceString.length === 0) {
    errors.push('Page reference string cannot be empty');
    return failure(errors);
  }

  for (let i = 0; i < referenceString.length; i++) {
    const pageNum = referenceString[i];
    if (typeof pageNum !== 'number' || isNaN(pageNum) || pageNum < 0 || !Number.isInteger(pageNum)) {
      errors.push(`Reference string index [${i}]: page number must be a non-negative integer, received ${pageNum}`);
    }
  }

  return errors.length === 0 ? success() : failure(errors);
}

/**
 * Validates a numerical virtual address.
 */
export function validateVirtualAddress(address: number, maxAddressSpace?: number): ValidationResult {
  const errors: string[] = [];

  if (typeof address !== 'number' || isNaN(address) || address < 0 || !Number.isInteger(address)) {
    errors.push(`Virtual address must be a non-negative integer, received: ${address}`);
  } else if (maxAddressSpace !== undefined && address >= maxAddressSpace) {
    errors.push(`Virtual address (${address}) exceeds maximum address space limit (${maxAddressSpace})`);
  }

  return errors.length === 0 ? success() : failure(errors);
}
