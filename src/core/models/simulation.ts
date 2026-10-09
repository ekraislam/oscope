/**
 * OScope — Simulation Domain Models
 * Unified event taxonomy, discrete event representations, and immutable simulation snapshots.
 */

export type SimulationEventType =
  | 'PROCESS_CREATED'
  | 'PROCESS_DISPATCHED'
  | 'PROCESS_PREEMPTED'
  | 'PROCESS_BLOCKED_IO'
  | 'PROCESS_IO_COMPLETE'
  | 'PROCESS_TERMINATED'
  | 'CONTEXT_SWITCH'
  | 'TLB_HIT'
  | 'TLB_MISS'
  | 'PAGE_FAULT'
  | 'PAGE_REPLACED'
  | 'RESOURCE_REQUESTED'
  | 'RESOURCE_ALLOCATED'
  | 'DEADLOCK_DETECTED'
  | 'SAFE_SEQUENCE_COMPUTED'
  | 'FILE_CREATED'
  | 'FILE_DELETED'
  | 'DISK_BLOCK_ALLOCATED'
  | 'DISK_BLOCK_DEALLOCATED'
  | 'INODE_CREATED'
  | 'INODE_REMOVED'
  | 'DIRECTORY_CREATED'
  | 'FILE_ACCESSED'
  | 'ALLOCATION_FAILED'
  | 'SYSTEM_INTERRUPT'
  | 'CLOCK_TICK';

export type SimulationEventSource =
  | 'PROCESS'
  | 'CPU'
  | 'MEMORY'
  | 'DEADLOCK'
  | 'FILESYSTEM'
  | 'KERNEL'
  | 'CLOCK';

export type SimulationEventSeverity = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

export interface SimulationEvent {
  readonly id: string;
  readonly timestamp: number;       // Virtual simulation tick when event occurs
  readonly sequenceNumber: number;  // Monotonic integer to break ties at identical timestamp
  readonly type: SimulationEventType;
  readonly sourceModule: SimulationEventSource;
  readonly severity: SimulationEventSeverity;
  readonly description: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface SimulationSnapshot<TState = unknown> {
  readonly simulationTime: number;
  readonly snapshotIndex: number;
  readonly event?: SimulationEvent;
  readonly subsystemState: TState;
  readonly description: string;
  readonly recordedAt: number; // Wall-clock timestamp of when snapshot was created
}

let eventSequenceCounter = 0;

/**
 * Creates a strongly-typed SimulationEvent with an auto-incrementing tie-breaker sequence number.
 */
export function createSimulationEvent(params: {
  timestamp: number;
  type: SimulationEventType;
  sourceModule: SimulationEventSource;
  severity?: SimulationEventSeverity;
  description: string;
  details?: Record<string, unknown>;
  id?: string;
  sequenceNumber?: number;
}): SimulationEvent {
  eventSequenceCounter += 1;
  const id = params.id ?? `evt_${params.timestamp}_${params.type.toLowerCase()}_${eventSequenceCounter}`;
  const severity = params.severity ?? 'INFO';
  const sequenceNumber = params.sequenceNumber ?? eventSequenceCounter;

  return Object.freeze({
    id,
    timestamp: params.timestamp,
    sequenceNumber,
    type: params.type,
    sourceModule: params.sourceModule,
    severity,
    description: params.description,
    details: params.details ? Object.freeze({ ...params.details }) : undefined,
  });
}

/**
 * Creates an immutable SimulationSnapshot for time-travel replay.
 */
export function createSimulationSnapshot<TState>(params: {
  simulationTime: number;
  snapshotIndex: number;
  subsystemState: TState;
  description: string;
  event?: SimulationEvent;
}): SimulationSnapshot<TState> {
  return Object.freeze({
    simulationTime: params.simulationTime,
    snapshotIndex: params.snapshotIndex,
    event: params.event,
    subsystemState: params.subsystemState,
    description: params.description,
    recordedAt: Date.now(),
  });
}
