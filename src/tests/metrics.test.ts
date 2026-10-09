import { describe, it, expect } from 'vitest';
import {
  calculateTurnaroundTime,
  calculateWaitingTime,
  calculateResponseTime,
  calculateCPUUtilizationPercentage,
  calculateThroughput,
  calculateAverage,
  deepClone,
} from '../core/utils/metrics';

describe('Academic OS Metric Formulas', () => {
  it('calculates Turnaround Time (Completion Time - Arrival Time)', () => {
    expect(calculateTurnaroundTime(10, 2)).toBe(8);
    expect(calculateTurnaroundTime(5, 5)).toBe(0);
    expect(calculateTurnaroundTime(2, 4)).toBe(0); // Clamped at 0
  });

  it('calculates Waiting Time (Turnaround Time - Burst Time)', () => {
    // Process arrived at 0, finished at 10, burst time 6
    // Turnaround = 10, Waiting = 10 - 6 = 4
    expect(calculateWaitingTime(10, 6)).toBe(4);
    expect(calculateWaitingTime(6, 6)).toBe(0);
  });

  it('calculates Response Time (First Scheduled Time - Arrival Time)', () => {
    expect(calculateResponseTime(3, 1)).toBe(2);
    expect(calculateResponseTime(0, 0)).toBe(0);
  });

  it('calculates CPU Utilization percentage mathematically bounded', () => {
    expect(calculateCPUUtilizationPercentage(8, 10)).toBe(80);
    expect(calculateCPUUtilizationPercentage(10, 10)).toBe(100);
    expect(calculateCPUUtilizationPercentage(0, 10)).toBe(0);
    expect(calculateCPUUtilizationPercentage(15, 10)).toBe(100); // Bounded at 100
  });

  it('calculates Throughput (completed processes per total unit time)', () => {
    expect(calculateThroughput(5, 20)).toBe(0.25);
    expect(calculateThroughput(3, 10)).toBe(0.3);
    expect(calculateThroughput(0, 10)).toBe(0);
  });

  it('computes arithmetic average of numbers', () => {
    expect(calculateAverage([2, 4, 6])).toBe(4);
    expect(calculateAverage([3.333, 6.666])).toBe(5);
    expect(calculateAverage([])).toBe(0);
  });
});

describe('deepClone Immutability Utility', () => {
  it('deeply clones nested arrays and objects preventing mutation of original', () => {
    const originalMatrix = [
      [1, 2, 3],
      [4, 5, 6],
    ];

    const cloned = deepClone(originalMatrix);
    cloned[0][0] = 999;

    expect(originalMatrix[0][0]).toBe(1);
    expect(cloned[0][0]).toBe(999);
  });

  it('deeply clones nested objects', () => {
    const original = { pcb: { pid: 'P1', registers: { pc: 0 } } };
    const cloned = deepClone(original);
    cloned.pcb.registers.pc = 42;

    expect(original.pcb.registers.pc).toBe(0);
    expect(cloned.pcb.registers.pc).toBe(42);
  });
});
