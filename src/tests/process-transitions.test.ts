import { describe, it, expect } from 'vitest';
import { createProcessControlBlock } from '../core/models/process';
import {
  isValidTransition,
  getValidNextStates,
  transitionProcess,
  executeRunningProcessTick,
  PERMISSIBLE_TRANSITIONS,
} from '../core/process/processTransitions';

describe('Process State Machine Rules', () => {
  it('confirms permissible transitions match standard OS 5-state lifecycle', () => {
    expect(PERMISSIBLE_TRANSITIONS.NEW).toEqual(['READY']);
    expect(PERMISSIBLE_TRANSITIONS.READY).toEqual(['RUNNING']);
    expect(PERMISSIBLE_TRANSITIONS.RUNNING).toEqual(['WAITING', 'READY', 'TERMINATED']);
    expect(PERMISSIBLE_TRANSITIONS.WAITING).toEqual(['READY']);
    expect(PERMISSIBLE_TRANSITIONS.TERMINATED).toEqual([]);
  });

  it('validates permitted and blocked state transitions accurately', () => {
    // Valid
    expect(isValidTransition('NEW', 'READY')).toBe(true);
    expect(isValidTransition('READY', 'RUNNING')).toBe(true);
    expect(isValidTransition('RUNNING', 'WAITING')).toBe(true);
    expect(isValidTransition('WAITING', 'READY')).toBe(true);
    expect(isValidTransition('RUNNING', 'TERMINATED')).toBe(true);
    expect(isValidTransition('RUNNING', 'READY')).toBe(true);

    // Invalid
    expect(isValidTransition('NEW', 'RUNNING')).toBe(false);
    expect(isValidTransition('NEW', 'TERMINATED')).toBe(false);
    expect(isValidTransition('WAITING', 'RUNNING')).toBe(false);
    expect(isValidTransition('TERMINATED', 'READY')).toBe(false);
    expect(isValidTransition('TERMINATED', 'RUNNING')).toBe(false);
    expect(isValidTransition('READY', 'READY')).toBe(false);
  });

  it('returns valid next states for any current state', () => {
    expect(getValidNextStates('NEW')).toEqual(['READY']);
    expect(getValidNextStates('TERMINATED')).toEqual([]);
  });
});

describe('transitionProcess Execution', () => {
  const sampleInput = {
    pid: 'P1',
    name: 'Test Task',
    arrivalTime: 2,
    burstTime: 6,
    priority: 1,
  };

  it('executes NEW → READY transition and generates PROCESS_CREATED event', () => {
    const pcb = createProcessControlBlock(sampleInput);
    const result = transitionProcess(pcb, 'READY', 2);

    expect(result.success).toBe(true);
    expect(result.previousState).toBe('NEW');
    expect(result.nextState).toBe('READY');
    expect(result.updatedProcess.state).toBe('READY');
    expect(result.event).not.toBeNull();
    expect(result.event?.type).toBe('PROCESS_CREATED');
    expect(result.event?.timestamp).toBe(2);
  });

  it('executes READY → RUNNING transition, records startTime, and calculates responseTime', () => {
    const pcb = createProcessControlBlock(sampleInput);
    const readyResult = transitionProcess(pcb, 'READY', 2);
    const runningResult = transitionProcess(readyResult.updatedProcess, 'RUNNING', 5);

    expect(runningResult.success).toBe(true);
    expect(runningResult.updatedProcess.state).toBe('RUNNING');
    expect(runningResult.updatedProcess.startTime).toBe(5);
    // Response time = startTime (5) - arrivalTime (2) = 3
    expect(runningResult.updatedProcess.responseTime).toBe(3);
    expect(runningResult.event?.type).toBe('PROCESS_DISPATCHED');
  });

  it('executes RUNNING → WAITING transition with device details', () => {
    const pcb = createProcessControlBlock(sampleInput);
    const ready = transitionProcess(pcb, 'READY', 2).updatedProcess;
    const running = transitionProcess(ready, 'RUNNING', 3).updatedProcess;

    const waitingResult = transitionProcess(running, 'WAITING', 4, {
      deviceName: 'Magnetic Disk',
      ioDuration: 5,
    });

    expect(waitingResult.success).toBe(true);
    expect(waitingResult.updatedProcess.state).toBe('WAITING');
    expect(waitingResult.event?.type).toBe('PROCESS_BLOCKED_IO');
    expect(waitingResult.event?.details?.device).toBe('Magnetic Disk');
  });

  it('executes WAITING → READY transition on I/O completion', () => {
    const pcb = createProcessControlBlock(sampleInput);
    const ready = transitionProcess(pcb, 'READY', 0).updatedProcess;
    const running = transitionProcess(ready, 'RUNNING', 1).updatedProcess;
    const waiting = transitionProcess(running, 'WAITING', 2).updatedProcess;

    const unblockedResult = transitionProcess(waiting, 'READY', 6);
    expect(unblockedResult.success).toBe(true);
    expect(unblockedResult.updatedProcess.state).toBe('READY');
    expect(unblockedResult.event?.type).toBe('PROCESS_IO_COMPLETE');
  });

  it('executes RUNNING → TERMINATED and calculates Turnaround and Waiting times', () => {
    // Arrival: 2, Burst: 6
    const pcb = createProcessControlBlock(sampleInput);
    const ready = transitionProcess(pcb, 'READY', 2).updatedProcess;
    const running = transitionProcess(ready, 'RUNNING', 3).updatedProcess;

    // Terminate at t=10
    const termResult = transitionProcess(running, 'TERMINATED', 10);
    expect(termResult.success).toBe(true);
    expect(termResult.updatedProcess.state).toBe('TERMINATED');
    expect(termResult.updatedProcess.completionTime).toBe(10);
    expect(termResult.updatedProcess.remainingTime).toBe(0);

    // Turnaround = 10 - 2 = 8
    expect(termResult.updatedProcess.turnaroundTime).toBe(8);
    // Waiting = Turnaround (8) - Burst (6) = 2
    expect(termResult.updatedProcess.waitingTime).toBe(2);
    expect(termResult.event?.type).toBe('PROCESS_TERMINATED');
  });

  it('blocks invalid transitions and returns structured failure reason', () => {
    const pcb = createProcessControlBlock(sampleInput); // State: NEW

    // Illegal: NEW -> RUNNING
    const invalidResult = transitionProcess(pcb, 'RUNNING', 2);
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.reason).toContain('Illegal state transition: Cannot transition from NEW to RUNNING');
    expect(invalidResult.updatedProcess.state).toBe('NEW');
    expect(invalidResult.event).toBeNull();
  });
});

describe('executeRunningProcessTick', () => {
  it('decrements remainingTime, advances PC by 4, and accumulator by 1', () => {
    const pcb = createProcessControlBlock({ pid: 'P1', arrivalTime: 0, burstTime: 3 });
    const ready = transitionProcess(pcb, 'READY', 0).updatedProcess;
    const running = transitionProcess(ready, 'RUNNING', 0).updatedProcess;

    const tick1 = executeRunningProcessTick(running);
    expect(tick1.updatedProcess.remainingTime).toBe(2);
    expect(tick1.updatedProcess.registers.programCounter).toBe(4);
    expect(tick1.updatedProcess.registers.accumulator).toBe(1);
    expect(tick1.isCompleted).toBe(false);

    const tick2 = executeRunningProcessTick(tick1.updatedProcess);
    expect(tick2.updatedProcess.remainingTime).toBe(1);
    expect(tick2.updatedProcess.registers.programCounter).toBe(8);
    expect(tick2.isCompleted).toBe(false);

    const tick3 = executeRunningProcessTick(tick2.updatedProcess);
    expect(tick3.updatedProcess.remainingTime).toBe(0);
    expect(tick3.updatedProcess.registers.programCounter).toBe(12);
    expect(tick3.isCompleted).toBe(true);
  });

  it('triggers I/O burst flag when CPU execution time matches scheduled burst', () => {
    const pcb = createProcessControlBlock({
      pid: 'P2',
      arrivalTime: 0,
      burstTime: 6,
      ioBursts: [{ startAtCPUTime: 2, duration: 4, device: 'Disk 0' }],
    });
    const ready = transitionProcess(pcb, 'READY', 0).updatedProcess;
    const running = transitionProcess(ready, 'RUNNING', 0).updatedProcess;

    // Tick 1 (executed 1 CPU ms) -> no I/O yet
    const t1 = executeRunningProcessTick(running);
    expect(t1.shouldTriggerIO).toBe(false);

    // Tick 2 (executed 2 CPU ms) -> matches startAtCPUTime: 2!
    const t2 = executeRunningProcessTick(t1.updatedProcess);
    expect(t2.shouldTriggerIO).toBe(true);
    expect(t2.triggeredIOBurst?.duration).toBe(4);
    expect(t2.triggeredIOBurst?.device).toBe('Disk 0');
  });

  it('throws error if attempting to execute tick on a non-RUNNING process', () => {
    const readyPcb = createProcessControlBlock({ pid: 'P1', arrivalTime: 0, burstTime: 4 });
    expect(() => executeRunningProcessTick(readyPcb)).toThrowError(/not RUNNING/);
  });
});
