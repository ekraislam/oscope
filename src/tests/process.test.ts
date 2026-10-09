import { describe, it, expect } from 'vitest';
import { createProcessControlBlock } from '../core/models/process';
import { validateProcessInput, validateProcessWorkload } from '../core/utils/validation';

describe('Process Model & PCB Factory', () => {
  it('creates an immutable PCB with default initial state NEW', () => {
    const pcb = createProcessControlBlock({
      pid: 'P1',
      name: 'Process 1',
      arrivalTime: 0,
      burstTime: 8,
      priority: 2,
    });

    expect(pcb.pid).toBe('P1');
    expect(pcb.name).toBe('Process 1');
    expect(pcb.state).toBe('NEW');
    expect(pcb.remainingTime).toBe(8);
    expect(pcb.priority).toBe(2);
    expect(pcb.startTime).toBeNull();
    expect(pcb.completionTime).toBeNull();
    expect(pcb.waitingTime).toBe(0);
    expect(pcb.turnaroundTime).toBe(0);
    expect(pcb.openFiles).toEqual(['stdin', 'stdout']);

    // Check immutability (frozen object)
    expect(Object.isFrozen(pcb)).toBe(true);
    expect(Object.isFrozen(pcb.registers)).toBe(true);
  });

  it('uses PID as name if name is omitted or blank', () => {
    const pcb = createProcessControlBlock({
      pid: 'P2',
      arrivalTime: 2,
      burstTime: 4,
    });
    expect(pcb.name).toBe('P2');
    expect(pcb.priority).toBe(0);
  });
});

describe('Process Validation', () => {
  it('validates a correct process input without errors', () => {
    const result = validateProcessInput({
      pid: 'P1',
      arrivalTime: 0,
      burstTime: 5,
      priority: 1,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects an empty or whitespace-only PID', () => {
    const result = validateProcessInput({
      pid: '   ',
      arrivalTime: 0,
      burstTime: 5,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Process PID must not be empty');
  });

  it('rejects negative arrival time', () => {
    const result = validateProcessInput({
      pid: 'P1',
      arrivalTime: -4,
      burstTime: 6,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('arrivalTime must be a non-negative number'))).toBe(true);
  });

  it('rejects negative burst time', () => {
    const result = validateProcessInput({
      pid: 'P1',
      arrivalTime: 2,
      burstTime: -1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('burstTime must be a non-negative number'))).toBe(true);
  });

  it('validates I/O bursts duration and bounds against total burst time', () => {
    const invalidIoResult = validateProcessInput({
      pid: 'P1',
      arrivalTime: 0,
      burstTime: 5,
      ioBursts: [{ startAtCPUTime: 7, duration: 2 }],
    });

    expect(invalidIoResult.valid).toBe(false);
    expect(invalidIoResult.errors.some((e) => e.includes('must be less than total CPU burst'))).toBe(true);
  });

  it('rejects duplicate PIDs in a workload', () => {
    const workload = [
      { pid: 'P1', arrivalTime: 0, burstTime: 4 },
      { pid: 'P2', arrivalTime: 1, burstTime: 3 },
      { pid: 'P1', arrivalTime: 2, burstTime: 2 }, // Duplicate PID
    ];

    const result = validateProcessWorkload(workload);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duplicate process PID detected: "P1"');
  });

  it('rejects an empty workload', () => {
    const result = validateProcessWorkload([]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Process workload must not be empty');
  });
});
