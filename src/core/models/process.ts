/**
 * OScope — Process & Process Control Block (PCB) Domain Models
 * Framework-independent, strictly typed representation of OS processes.
 */

export type ProcessState =
  | 'NEW'
  | 'READY'
  | 'RUNNING'
  | 'WAITING'
  | 'TERMINATED';

export interface CPURegisters {
  readonly programCounter: number;
  readonly accumulator: number;
  readonly baseRegister: number;
  readonly limitRegister: number;
}

export interface MemoryLimits {
  readonly baseAddress: number;
  readonly limit: number;
  readonly allocatedPages: readonly number[];
}

export interface IOBurst {
  readonly startAtCPUTime: number; // Cumulative CPU execution time when this I/O starts
  readonly duration: number;       // Time units spent in WAITING state
  readonly device?: string;        // Optional device descriptor (e.g. "Disk 0", "Network")
}

export interface ProcessControlBlock {
  readonly pid: string;
  readonly name: string;
  readonly state: ProcessState;
  readonly priority: number;
  readonly registers: CPURegisters;
  readonly memory: MemoryLimits;
  readonly openFiles: readonly string[];
  readonly ioBursts: readonly IOBurst[];

  // Timing metrics
  readonly arrivalTime: number;
  readonly burstTime: number;
  readonly remainingTime: number;
  readonly startTime: number | null;      // Time first scheduled on CPU
  readonly completionTime: number | null; // Time process reached TERMINATED
  readonly waitingTime: number;
  readonly turnaroundTime: number;
  readonly responseTime: number;
}

export interface ProcessInput {
  readonly pid: string;
  readonly name?: string;
  readonly arrivalTime: number;
  readonly burstTime: number;
  readonly priority?: number;
  readonly ioBursts?: readonly IOBurst[];
}

/**
 * Creates an initial ProcessControlBlock in the 'NEW' state from user input.
 * All timing metrics are initialized to safe deterministic defaults.
 */
export function createProcessControlBlock(input: ProcessInput): ProcessControlBlock {
  const name = input.name && input.name.trim().length > 0 ? input.name.trim() : input.pid;
  const priority = input.priority !== undefined ? input.priority : 0;
  const ioBursts = input.ioBursts ? [...input.ioBursts] : [];

  return Object.freeze({
    pid: input.pid,
    name,
    state: 'NEW' as const,
    priority,
    registers: Object.freeze({
      programCounter: 0,
      accumulator: 0,
      baseRegister: 0,
      limitRegister: input.burstTime,
    }),
    memory: Object.freeze({
      baseAddress: 0,
      limit: input.burstTime * 1024,
      allocatedPages: Object.freeze([]),
    }),
    openFiles: Object.freeze(['stdin', 'stdout']),
    ioBursts: Object.freeze(ioBursts),
    arrivalTime: input.arrivalTime,
    burstTime: input.burstTime,
    remainingTime: input.burstTime,
    startTime: null,
    completionTime: null,
    waitingTime: 0,
    turnaroundTime: 0,
    responseTime: 0,
  });
}
