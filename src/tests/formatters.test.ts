import { describe, it, expect } from 'vitest';
import {
  formatSimulationTime,
  formatByteSize,
  formatHexAddress,
  calculateCPUUtilization,
} from '../core/utils/formatters';

describe('formatSimulationTime', () => {
  it('pads numbers with leading zeros', () => {
    expect(formatSimulationTime(42)).toBe('0042 ms');
    expect(formatSimulationTime(0)).toBe('0000 ms');
    expect(formatSimulationTime(1250)).toBe('1250 ms');
  });

  it('handles negative or decimal values gracefully', () => {
    expect(formatSimulationTime(-10)).toBe('0000 ms');
    expect(formatSimulationTime(45.7)).toBe('0045 ms');
  });
});

describe('formatByteSize', () => {
  it('formats bytes, kilobytes, and megabytes accurately', () => {
    expect(formatByteSize(0)).toBe('0 B');
    expect(formatByteSize(512)).toBe('512 B');
    expect(formatByteSize(1024)).toBe('1.0 KB');
    expect(formatByteSize(2048)).toBe('2.0 KB');
    expect(formatByteSize(1024 * 1024)).toBe('1.0 MB');
  });
});

describe('formatHexAddress', () => {
  it('formats address to uppercase hex with 0x prefix', () => {
    expect(formatHexAddress(0)).toBe('0x0000');
    expect(formatHexAddress(255)).toBe('0x00FF');
    expect(formatHexAddress(4096)).toBe('0x1000');
  });
});

describe('calculateCPUUtilization', () => {
  it('computes exact bounded percentage to 2 decimal places', () => {
    expect(calculateCPUUtilization(50, 100)).toBe(50);
    expect(calculateCPUUtilization(1, 3)).toBe(33.33);
    expect(calculateCPUUtilization(0, 100)).toBe(0);
    expect(calculateCPUUtilization(100, 0)).toBe(0);
    expect(calculateCPUUtilization(120, 100)).toBe(100);
  });
});
