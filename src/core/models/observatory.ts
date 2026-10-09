/**
 * OScope — Central Observatory Domain Models
 * Strongly-typed definitions for aggregated subsystem telemetry,
 * normalized cross-lab simulation events, system status precedence,
 * and cross-subsystem correlation tracking.
 */

import type { SimulationEventSeverity, SimulationEventSource } from './simulation';
import type { SchedulerType } from '../algorithms/scheduling';
import type { AllocationStrategy } from './filesystem';

export type SubsystemStatus = 'STANDBY' | 'ACTIVE' | 'ATTENTION' | 'FAULT';
export type ObservatorySystemStatus = 'STANDBY' | 'ACTIVE' | 'ATTENTION' | 'FAULT';

export interface ProcessTelemetry {
  readonly totalProcesses: number;
  readonly newCount: number;
  readonly readyCount: number;
  readonly runningPid: string | null;
  readonly waitingCount: number;
  readonly terminatedCount: number;
  readonly status: SubsystemStatus;
  readonly statusReason: string;
}

export interface SchedulingTelemetry {
  readonly hasSimulation: boolean;
  readonly activeAlgorithm: SchedulerType;
  readonly totalProcesses: number;
  readonly simulationTime: number | null;
  readonly cpuUtilization: number | null; // 0-100 percentage or null
  readonly averageWaitingTime: number | null;
  readonly averageTurnaroundTime: number | null;
  readonly averageResponseTime: number | null;
  readonly contextSwitches: number | null;
  readonly throughput: number | null;
  readonly status: SubsystemStatus;
  readonly statusReason: string;
}

export interface MemoryTelemetry {
  readonly hasSimulation: boolean;
  readonly frameCount: number;
  readonly occupiedFrames: number;
  readonly freeFrames: number;
  readonly memoryUtilization: number; // 0-100 percentage
  readonly tlbCapacity: number;
  readonly tlbEntriesUsed: number;
  readonly tlbHitRate: number | null; // 0-100 percentage or null
  readonly totalReferences: number;
  readonly pageFaults: number | null;
  readonly pageFaultRate: number | null; // 0-100 percentage or null
  readonly replacementAlgorithm: string;
  readonly status: SubsystemStatus;
  readonly statusReason: string;
}

export interface DeadlockTelemetry {
  readonly hasState: boolean;
  readonly processCount: number;
  readonly resourceCount: number;
  readonly bankerState: 'SAFE' | 'UNSAFE';
  readonly safeSequence: readonly string[] | null;
  readonly isDeadlocked: boolean;
  readonly deadlockedPids: readonly string[];
  readonly ragCycleDetected: boolean;
  readonly status: SubsystemStatus;
  readonly statusReason: string;
}

export interface FileSystemTelemetry {
  readonly totalBlocks: number;
  readonly allocatedBlocks: number;
  readonly freeBlocks: number;
  readonly diskUsagePercentage: number;
  readonly largestFreeRun: number;
  readonly fileCount: number;
  readonly directoryCount: number;
  readonly inodeCount: number;
  readonly selectedStrategy: AllocationStrategy;
  readonly isConsistent: boolean;
  readonly status: SubsystemStatus;
  readonly statusReason: string;
}

export interface NormalizedObservatoryEvent {
  readonly id: string;
  readonly source: SimulationEventSource;
  readonly timestamp: number;
  readonly sequenceNumber: number;
  readonly type: string;
  readonly severity: SimulationEventSeverity;
  readonly description: string;
  readonly relatedPid?: string;
  readonly relatedResource?: string;
  readonly targetRoute: string; // Contextual route e.g. "/memory" or "/deadlock"
}

export type CorrelationConfidence = 'DIRECT' | 'DERIVED' | 'CONCEPTUAL';

export interface CrossSubsystemCorrelation {
  readonly pid: string;
  readonly confidence: CorrelationConfidence;
  readonly processState: string | null;
  readonly cpuScheduled: boolean;
  readonly memoryPageReferences: number;
  readonly resourcesAllocated: readonly string[];
  readonly resourcesRequested: readonly string[];
  readonly filesAccessed: readonly string[];
  readonly explanation: string;
}

export interface ObservatorySnapshot {
  readonly timestamp: number;
  readonly systemStatus: ObservatorySystemStatus;
  readonly systemStatusReason: string;
  readonly process: ProcessTelemetry;
  readonly scheduling: SchedulingTelemetry;
  readonly memory: MemoryTelemetry;
  readonly deadlock: DeadlockTelemetry;
  readonly filesystem: FileSystemTelemetry;
  readonly normalizedEvents: readonly NormalizedObservatoryEvent[];
  readonly activeCorrelation: CrossSubsystemCorrelation | null;
}
