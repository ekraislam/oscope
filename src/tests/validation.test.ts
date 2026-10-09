import { describe, it, expect } from 'vitest';
import {
  validateBankerState,
  validateMemoryConfig,
  validateReferenceString,
  validateVirtualAddress,
} from '../core/utils/validation';

describe('Banker Matrix Validation', () => {
  const validBanker = {
    processes: ['P0', 'P1', 'P2'],
    resources: ['A', 'B', 'C'],
    available: [3, 3, 2],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
    ],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
    ],
  };

  it('validates a standard consistent Banker allocation state', () => {
    const result = validateBankerState(validBanker);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects available vector with dimension mismatch', () => {
    const result = validateBankerState({
      ...validBanker,
      available: [3, 3], // 2 resources instead of 3
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Available vector length'))).toBe(true);
  });

  it('rejects Max matrix with row mismatch', () => {
    const result = validateBankerState({
      ...validBanker,
      max: [
        [7, 5, 3],
        [3, 2, 2], // Only 2 rows instead of 3
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Max matrix row count'))).toBe(true);
  });

  it('rejects when Allocation exceeds Maximum demand', () => {
    const result = validateBankerState({
      ...validBanker,
      allocation: [
        [8, 1, 0], // Allocation 8 > Max 7 on resource A for P0
        [2, 0, 0],
        [3, 0, 2],
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('exceeds maximum demand'))).toBe(true);
  });

  it('rejects negative numbers in matrices', () => {
    const result = validateBankerState({
      ...validBanker,
      available: [3, -1, 2],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('must be a non-negative integer'))).toBe(true);
  });
});

describe('Memory Address & Hardware Validation', () => {
  it('accepts valid power-of-2 page sizes and multiples of memory', () => {
    const result = validateMemoryConfig({
      pageSizeBytes: 1024,
      totalMemoryBytes: 4096,
      frameCount: 4,
      tlbSize: 8,
    });
    expect(result.valid).toBe(true);
  });

  it('rejects page size that is not a power of 2', () => {
    const result = validateMemoryConfig({
      pageSizeBytes: 1000, // Not power of 2
      totalMemoryBytes: 4000,
      frameCount: 4,
      tlbSize: 8,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('must be a power of 2'))).toBe(true);
  });

  it('validates page reference strings', () => {
    expect(validateReferenceString([7, 0, 1, 2, 0, 3, 0, 4, 2, 3]).valid).toBe(true);
    expect(validateReferenceString([]).valid).toBe(false);
    expect(validateReferenceString([1, 2, -3]).valid).toBe(false);
  });

  it('validates virtual addresses and limits', () => {
    expect(validateVirtualAddress(1024, 65536).valid).toBe(true);
    expect(validateVirtualAddress(-5).valid).toBe(false);
    expect(validateVirtualAddress(70000, 65536).valid).toBe(false);
  });
});
