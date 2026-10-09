/**
 * OScope — Pure Process State Machine & Transition Engine
 * Framework-independent transition validation and execution adhering to OS lifecycle rules.
 */

import type { ProcessControlBlock, ProcessState } from '../models/process';
import type { SimulationEvent } from '../models/simulation';
import { createSimulationEvent } from '../models/simulation';
import { calculateTurnaroundTime, calculateWaitingTime, calculateResponseTime } from '../utils/metrics';

/**
 * Formal State Transition Table
 * Defines permissible destination states from each OS process state.
 */
export const PERMISSIBLE_TRANSITIONS: Readonly<Record<ProcessState, readonly ProcessState[]>> = Object.freeze({
  NEW: Object.freeze(['READY'] as const),
  READY: Object.freeze(['RUNNING'] as const),
  RUNNING: Object.freeze(['WAITING', 'READY', 'TERMINATED'] as const),
  WAITING: Object.freeze(['READY'] as const),
  TERMINATED: Object.freeze([] as const),
});

export interface ProcessTransitionResult {
  readonly success: boolean;
  readonly previousState: ProcessState;
  readonly nextState: ProcessState;
  readonly updatedProcess: ProcessControlBlock;
  readonly event: SimulationEvent | null;
  readonly reason?: string;
}

export interface TransitionOptions {
  readonly reason?: string;
  readonly deviceName?: string;
  readonly ioDuration?: number;
}

/**
 * Checks whether a requested state transition is valid under the OS state machine.
 */
export function isValidTransition(currentState: ProcessState, targetState: ProcessState): boolean {
  if (currentState === targetState) return false;
  const allowed = PERMISSIBLE_TRANSITIONS[currentState];
  return allowed ? allowed.includes(targetState) : false;
}

/**
 * Returns all valid next states for a given process state.
 */
export function getValidNextStates(currentState: ProcessState): readonly ProcessState[] {
  return PERMISSIBLE_TRANSITIONS[currentState] ?? [];
}

/**
 * Pure function to execute a validated state transition on a process.
 * Returns the immutable updated PCB and corresponding simulation event.
 */
export function transitionProcess(
  process: ProcessControlBlock,
  targetState: ProcessState,
  currentSimulationTime: number,
  options?: TransitionOptions
): ProcessTransitionResult {
  const previousState = process.state;

  if (!isValidTransition(previousState, targetState)) {
    return Object.freeze({
      success: false,
      previousState,
      nextState: previousState,
      updatedProcess: process,
      event: null,
      reason: `Illegal state transition: Cannot transition from ${previousState} to ${targetState}`,
    });
  }

  let updatedStartTime = process.startTime;
  let updatedCompletionTime = process.completionTime;
  let updatedResponseTime = process.responseTime;
  let updatedTurnaroundTime = process.turnaroundTime;
  let updatedWaitingTime = process.waitingTime;
  let updatedRemainingTime = process.remainingTime;

  // New register context
  let updatedProgramCounter = process.registers.programCounter;
  let updatedAccumulator = process.registers.accumulator;

  let event: SimulationEvent | null = null;

  switch (targetState) {
    case 'READY': {
      if (previousState === 'NEW') {
        event = createSimulationEvent({
          timestamp: currentSimulationTime,
          type: 'PROCESS_CREATED',
          sourceModule: 'KERNEL',
          severity: 'INFO',
          description: `Process ${process.pid} (${process.name}) admitted to READY queue`,
          details: { pid: process.pid, arrivalTime: process.arrivalTime },
        });
      } else if (previousState === 'WAITING') {
        event = createSimulationEvent({
          timestamp: currentSimulationTime,
          type: 'PROCESS_IO_COMPLETE',
          sourceModule: 'KERNEL',
          severity: 'SUCCESS',
          description: `Process ${process.pid} completed I/O and returned to READY queue`,
          details: { pid: process.pid },
        });
      } else if (previousState === 'RUNNING') {
        event = createSimulationEvent({
          timestamp: currentSimulationTime,
          type: 'PROCESS_PREEMPTED',
          sourceModule: 'CPU',
          severity: 'WARN',
          description: `Process ${process.pid} yielded CPU and returned to READY queue`,
          details: { pid: process.pid, remainingTime: process.remainingTime },
        });
      }
      break;
    }

    case 'RUNNING': {
      // First time running -> compute response time
      if (updatedStartTime === null) {
        updatedStartTime = currentSimulationTime;
        updatedResponseTime = calculateResponseTime(updatedStartTime, process.arrivalTime);
      }

      event = createSimulationEvent({
        timestamp: currentSimulationTime,
        type: 'PROCESS_DISPATCHED',
        sourceModule: 'CPU',
        severity: 'INFO',
        description: `Process ${process.pid} dispatched to CPU`,
        details: { pid: process.pid, pc: updatedProgramCounter, remainingTime: process.remainingTime },
      });
      break;
    }

    case 'WAITING': {
      const device = options?.deviceName ?? 'I/O Device';
      event = createSimulationEvent({
        timestamp: currentSimulationTime,
        type: 'PROCESS_BLOCKED_IO',
        sourceModule: 'CPU',
        severity: 'WARN',
        description: `Process ${process.pid} blocked waiting for ${device}`,
        details: { pid: process.pid, device, ioDuration: options?.ioDuration },
      });
      break;
    }

    case 'TERMINATED': {
      updatedCompletionTime = currentSimulationTime;
      updatedRemainingTime = 0;
      updatedTurnaroundTime = calculateTurnaroundTime(updatedCompletionTime, process.arrivalTime);
      updatedWaitingTime = calculateWaitingTime(updatedTurnaroundTime, process.burstTime);

      event = createSimulationEvent({
        timestamp: currentSimulationTime,
        type: 'PROCESS_TERMINATED',
        sourceModule: 'CPU',
        severity: 'SUCCESS',
        description: `Process ${process.pid} terminated execution (Turnaround: ${updatedTurnaroundTime}ms, Waiting: ${updatedWaitingTime}ms)`,
        details: {
          pid: process.pid,
          completionTime: updatedCompletionTime,
          turnaroundTime: updatedTurnaroundTime,
          waitingTime: updatedWaitingTime,
        },
      });
      break;
    }
  }

  const updatedProcess: ProcessControlBlock = Object.freeze({
    ...process,
    state: targetState,
    remainingTime: updatedRemainingTime,
    startTime: updatedStartTime,
    completionTime: updatedCompletionTime,
    responseTime: updatedResponseTime,
    turnaroundTime: updatedTurnaroundTime,
    waitingTime: updatedWaitingTime,
    registers: Object.freeze({
      ...process.registers,
      programCounter: updatedProgramCounter,
      accumulator: updatedAccumulator,
    }),
  });

  return Object.freeze({
    success: true,
    previousState,
    nextState: targetState,
    updatedProcess,
    event,
    reason: options?.reason,
  });
}

/**
 * Executes a single CPU tick on an actively RUNNING process.
 * Decrements remainingTime by 1, advances programCounter and accumulator,
 * and checks for completion or scheduled I/O burst triggers.
 */
export function executeRunningProcessTick(
  process: ProcessControlBlock
): {
  readonly updatedProcess: ProcessControlBlock;
  readonly isCompleted: boolean;
  readonly shouldTriggerIO: boolean;
  readonly triggeredIOBurst?: { duration: number; device?: string };
} {
  if (process.state !== 'RUNNING') {
    throw new Error(`Cannot execute tick: Process ${process.pid} is in state ${process.state}, not RUNNING`);
  }

  const newRemainingTime = Math.max(0, process.remainingTime - 1);
  const executedCpuTime = process.burstTime - newRemainingTime;

  // CPU Context progression
  const newPC = process.registers.programCounter + 4; // 4-byte instruction increment
  const newAcc = process.registers.accumulator + 1;

  // Check if process has an I/O burst scheduled to start at this exact CPU time
  const matchingIO = process.ioBursts.find((io) => io.startAtCPUTime === executedCpuTime);

  const isCompleted = newRemainingTime === 0;
  const shouldTriggerIO = matchingIO !== undefined && !isCompleted;

  const updatedProcess: ProcessControlBlock = Object.freeze({
    ...process,
    remainingTime: newRemainingTime,
    registers: Object.freeze({
      ...process.registers,
      programCounter: newPC,
      accumulator: newAcc,
    }),
  });

  return Object.freeze({
    updatedProcess,
    isCompleted,
    shouldTriggerIO,
    triggeredIOBurst: matchingIO
      ? { duration: matchingIO.duration, device: matchingIO.device }
      : undefined,
  });
}
