/**
 * OScope — Observatory Subsystem Adapters & Telemetry Aggregator
 * Pure, deterministic adapters that extract telemetry from subsystem states,
 * normalize heterogeneous simulation events, and determine observatory-level status.
 */

import type {
  ProcessTelemetry,
  SchedulingTelemetry,
  MemoryTelemetry,
  DeadlockTelemetry,
  FileSystemTelemetry,
  NormalizedObservatoryEvent,
  ObservatorySystemStatus,
  SubsystemStatus,
} from '../../models/observatory';
import type { SimulationEvent } from '../../models/simulation';

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROCESS TELEMETRY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────
export function extractProcessTelemetry(state: {
  processes?: Record<string, any>;
  runningPid?: string | null;
  readyQueue?: readonly string[];
  waitingQueue?: readonly any[];
  terminatedPids?: readonly string[];
  newPids?: readonly string[];
}): ProcessTelemetry {
  const processes = state.processes ?? {};
  const totalProcesses = Object.keys(processes).length;
  const runningPid = state.runningPid ?? null;
  const readyCount = state.readyQueue?.length ?? 0;
  const waitingCount = state.waitingQueue?.length ?? 0;
  const terminatedCount = state.terminatedPids?.length ?? 0;
  const newCount = state.newPids?.length ?? 0;

  let status: SubsystemStatus = 'STANDBY';
  let statusReason = 'No simulated processes currently registered.';

  if (totalProcesses > 0) {
    if (runningPid !== null) {
      status = 'ACTIVE';
      statusReason = `Process ${runningPid} currently executing on virtual CPU. Ready queue: ${readyCount}.`;
    } else if (readyCount > 0 || waitingCount > 0) {
      status = 'ACTIVE';
      statusReason = `Processes queued for CPU or I/O. Ready: ${readyCount}, Waiting: ${waitingCount}.`;
    } else if (terminatedCount === totalProcesses) {
      status = 'ACTIVE';
      statusReason = `All ${totalProcesses} registered process(es) have reached termination.`;
    } else {
      status = 'ACTIVE';
      statusReason = `${totalProcesses} process(es) loaded in Process Control Block table.`;
    }
  }

  return Object.freeze({
    totalProcesses,
    newCount,
    readyCount,
    runningPid,
    waitingCount,
    terminatedCount,
    status,
    statusReason,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CPU SCHEDULING TELEMETRY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────
export function extractSchedulingTelemetry(state: {
  workload?: readonly any[];
  selectedAlgorithm?: string;
  result?: any | null;
}): SchedulingTelemetry {
  const workload = state.workload ?? [];
  const selectedAlgorithm = (state.selectedAlgorithm ?? 'FCFS') as any;
  const result = state.result ?? null;

  if (!result || !result.metrics) {
    return Object.freeze({
      hasSimulation: false,
      activeAlgorithm: selectedAlgorithm,
      totalProcesses: workload.length,
      simulationTime: null,
      cpuUtilization: null,
      averageWaitingTime: null,
      averageTurnaroundTime: null,
      averageResponseTime: null,
      contextSwitches: null,
      throughput: null,
      status: 'STANDBY',
      statusReason: `Workload defined (${workload.length} processes), but no CPU scheduling simulation has been run.`,
    });
  }

  const metrics = result.metrics;
  const cpuUtilization = Math.round(metrics.cpuUtilization * 10) / 10;
  const avgWait = Math.round(metrics.averageWaitingTime * 10) / 10;
  const avgTurn = Math.round(metrics.averageTurnaroundTime * 10) / 10;
  const avgResp = Math.round(metrics.averageResponseTime * 10) / 10;
  const contextSwitches = metrics.contextSwitchCount ?? metrics.totalContextSwitches ?? 0;
  const throughput = Math.round(metrics.throughput * 100) / 100;
  const simTime = metrics.totalTime ?? result.totalSimulationTime ?? null;

  return Object.freeze({
    hasSimulation: true,
    activeAlgorithm: selectedAlgorithm,
    totalProcesses: workload.length,
    simulationTime: simTime,
    cpuUtilization,
    averageWaitingTime: avgWait,
    averageTurnaroundTime: avgTurn,
    averageResponseTime: avgResp,
    contextSwitches,
    throughput,
    status: 'ACTIVE',
    statusReason: `Completed ${selectedAlgorithm} scheduling run. CPU utilization: ${cpuUtilization}%, Context switches: ${contextSwitches}.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MEMORY MANAGEMENT TELEMETRY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────
export function extractMemoryTelemetry(state: {
  config?: any;
  physicalMemory?: any;
  tlb?: any;
  replacementResult?: any | null;
  selectedReplacementAlgorithm?: string;
}): MemoryTelemetry {
  const config = state.config ?? { frameCount: 8, tlbCapacity: 4 };
  const frameCount = config.frameCount ?? 8;
  const frames = state.physicalMemory?.frames ?? [];
  const occupiedFrames = frames.filter((f: any) => f.isAllocated).length;
  const freeFrames = Math.max(0, frameCount - occupiedFrames);
  const memoryUtilization = Math.round((occupiedFrames / frameCount) * 100);

  const tlb = state.tlb ?? { entries: [], hitCount: 0, missCount: 0 };
  const tlbCapacity = config.tlbCapacity ?? 4;
  const tlbEntriesUsed = (tlb.entries ?? []).filter((e: any) => e.valid).length;
  const totalTlbLookups = (tlb.hitCount ?? 0) + (tlb.missCount ?? 0);
  const tlbHitRate =
    totalTlbLookups > 0 ? Math.round(((tlb.hitCount ?? 0) / totalTlbLookups) * 100) : null;

  const repResult = state.replacementResult ?? null;
  const repAlgorithm = repResult?.algorithm ?? state.selectedReplacementAlgorithm ?? 'FIFO';

  let hasSimulation = false;
  let pageFaults: number | null = null;
  let pageFaultRate: number | null = null;
  let totalReferences = 0;
  let status: SubsystemStatus = 'STANDBY';
  let statusReason = 'Memory subsystem in standby; no active page replacement simulation.';

  if (repResult) {
    hasSimulation = true;
    pageFaults = repResult.pageFaults;
    pageFaultRate = Math.round(repResult.pageFaultRate * 100);
    totalReferences = repResult.steps?.length ?? 0;

    // Academic check: high page fault rate triggers ATTENTION, but is NEVER a system FAULT
    if (repResult.pageFaultRate >= 0.7 && totalReferences >= 6) {
      status = 'ATTENTION';
      statusReason = `Elevated page fault rate (${pageFaultRate}%) observed under ${repAlgorithm} replacement policy.`;
    } else {
      status = 'ACTIVE';
      statusReason = `Page replacement simulation active (${repAlgorithm}). Faults: ${pageFaults}/${totalReferences} (${pageFaultRate}%).`;
    }
  } else if (occupiedFrames > 0) {
    status = 'ACTIVE';
    statusReason = `Physical memory frames populated (${occupiedFrames}/${frameCount} frames occupied, ${memoryUtilization}% utilization).`;
  }

  return Object.freeze({
    hasSimulation,
    frameCount,
    occupiedFrames,
    freeFrames,
    memoryUtilization,
    tlbCapacity,
    tlbEntriesUsed,
    tlbHitRate,
    totalReferences,
    pageFaults,
    pageFaultRate,
    replacementAlgorithm: repAlgorithm,
    status,
    statusReason,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DEADLOCK & BANKER'S ALGORITHM TELEMETRY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────
export function extractDeadlockTelemetry(state: {
  state?: any;
  safetyResult?: any;
  deadlockDetectionResult?: any;
  ragCycleResult?: any;
}): DeadlockTelemetry {
  const allocState = state.state;
  const processCount = allocState?.processIds?.length ?? 0;
  const resourceCount = allocState?.resourceIds?.length ?? 0;
  const safety = state.safetyResult;
  const detection = state.deadlockDetectionResult;
  const rag = state.ragCycleResult;

  if (!allocState || processCount === 0) {
    return Object.freeze({
      hasState: false,
      processCount: 0,
      resourceCount: 0,
      bankerState: 'SAFE',
      safeSequence: null,
      isDeadlocked: false,
      deadlockedPids: Object.freeze([]),
      ragCycleDetected: false,
      status: 'STANDBY',
      statusReason: 'No resource allocation matrix configured.',
    });
  }

  const isSafe = safety?.isSafe ?? true;
  const bankerState: 'SAFE' | 'UNSAFE' = isSafe ? 'SAFE' : 'UNSAFE';
  const safeSequence = isSafe && safety?.safeSequence ? Object.freeze([...safety.safeSequence]) : null;
  const isDeadlocked = detection?.isDeadlocked ?? false;
  const deadlockedPids = detection?.deadlockedProcessIds ? Object.freeze([...detection.deadlockedProcessIds]) : Object.freeze([]);
  const ragCycleDetected = rag?.hasCycle ?? false;

  let status: SubsystemStatus = 'ACTIVE';
  let statusReason = `Banker safety confirmed. Safe sequence: <${safeSequence?.join(', ') ?? 'none'}>.`;

  // Precedence: FAULT for actual deadlock > ATTENTION for unsafe Banker state > ACTIVE
  if (isDeadlocked && deadlockedPids.length > 0) {
    status = 'FAULT';
    statusReason = `DEADLOCK DETECTED: Processes [${deadlockedPids.join(', ')}] are locked in circular wait.`;
  } else if (!isSafe) {
    status = 'ATTENTION';
    statusReason = `Banker's Algorithm reports UNSAFE state: No guaranteed safe execution sequence exists. (Not yet a confirmed deadlock).`;
  }

  return Object.freeze({
    hasState: true,
    processCount,
    resourceCount,
    bankerState,
    safeSequence,
    isDeadlocked,
    deadlockedPids,
    ragCycleDetected,
    status,
    statusReason,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FILE SYSTEM & STORAGE TELEMETRY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────
export function extractFileSystemTelemetry(state: {
  state?: any;
  freeSpaceAnalysis?: any;
  consistencyReport?: any;
  selectedStrategy?: string;
}): FileSystemTelemetry {
  const fsState = state.state;
  if (!fsState) {
    return Object.freeze({
      totalBlocks: 32,
      allocatedBlocks: 0,
      freeBlocks: 32,
      diskUsagePercentage: 0,
      largestFreeRun: 32,
      fileCount: 0,
      directoryCount: 1,
      inodeCount: 0,
      selectedStrategy: 'CONTIGUOUS' as any,
      isConsistent: true,
      status: 'STANDBY',
      statusReason: 'Virtual file system not mounted.',
    });
  }

  const totalBlocks = fsState.totalBlocks ?? 32;
  const freeBlocks = fsState.freeBlocksCount ?? 0;
  const allocatedBlocks = Math.max(0, totalBlocks - freeBlocks);
  const diskUsagePercentage = totalBlocks > 0 ? Math.round((allocatedBlocks / totalBlocks) * 100) : 0;
  const largestFreeRun = state.freeSpaceAnalysis?.largestFreeRun ?? freeBlocks;
  const fileCount = (fsState.directoryEntries ?? []).filter((e: any) => e.type === 'FILE').length;
  const directoryCount = (fsState.directoryEntries ?? []).filter((e: any) => e.type === 'DIRECTORY').length;
  const inodeCount = Object.keys(fsState.inodes ?? {}).length;
  const selectedStrategy = (state.selectedStrategy ?? 'CONTIGUOUS') as any;
  const isConsistent = state.consistencyReport?.isConsistent ?? true;

  let status: SubsystemStatus = 'ACTIVE';
  let statusReason = `Storage pool operational. ${allocatedBlocks}/${totalBlocks} blocks allocated (${diskUsagePercentage}%).`;

  if (!isConsistent) {
    status = 'FAULT';
    statusReason = `Storage structural audit detected corruption invariants failure (${state.consistencyReport?.errors?.length ?? 1} errors).`;
  } else if (freeBlocks > 0 && largestFreeRun <= 2 && selectedStrategy === 'CONTIGUOUS' && allocatedBlocks > 10) {
    status = 'ATTENTION';
    statusReason = `External fragmentation advisory: ${freeBlocks} free blocks exist, but largest contiguous extent is only ${largestFreeRun} block(s).`;
  }

  return Object.freeze({
    totalBlocks,
    allocatedBlocks,
    freeBlocks,
    diskUsagePercentage,
    largestFreeRun,
    fileCount,
    directoryCount,
    inodeCount,
    selectedStrategy,
    isConsistent,
    status,
    statusReason,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. OVERALL SYSTEM STATUS RESOLUTION (PRECEDENCE: FAULT > ATTENTION > ACTIVE > STANDBY)
// ─────────────────────────────────────────────────────────────────────────────
export function computeOverallSystemStatus(telemetries: {
  process: ProcessTelemetry;
  scheduling: SchedulingTelemetry;
  memory: MemoryTelemetry;
  deadlock: DeadlockTelemetry;
  filesystem: FileSystemTelemetry;
}): { status: ObservatorySystemStatus; reason: string } {
  const { process, scheduling, memory, deadlock, filesystem } = telemetries;
  const allSubsystems = [process, scheduling, memory, deadlock, filesystem];

  // 1. FAULT Check
  if (deadlock.status === 'FAULT') {
    return {
      status: 'FAULT',
      reason: `System Fault: Deadlock detected in resource allocation graph (${deadlock.deadlockedPids.length} process(es) permanently blocked).`,
    };
  }
  if (filesystem.status === 'FAULT') {
    return {
      status: 'FAULT',
      reason: `System Fault: Storage subsystem structural corruption invariants violated.`,
    };
  }

  // 2. ATTENTION Check
  if (deadlock.status === 'ATTENTION') {
    return {
      status: 'ATTENTION',
      reason: `System Attention: Banker's Algorithm reports an unsafe state. Resources are constrained without guaranteed safe recovery order.`,
    };
  }
  if (memory.status === 'ATTENTION') {
    return {
      status: 'ATTENTION',
      reason: `System Attention: High page fault rate (${memory.pageFaultRate}%) observed in memory replacement simulation.`,
    };
  }
  if (filesystem.status === 'ATTENTION') {
    return {
      status: 'ATTENTION',
      reason: `System Attention: Contiguous external fragmentation is constraining secondary storage block allocation.`,
    };
  }

  // 3. ACTIVE Check
  const anyActive = allSubsystems.some((s) => s.status === 'ACTIVE');
  if (anyActive) {
    return {
      status: 'ACTIVE',
      reason: `Operating System simulations active. All subsystem invariants satisfied.`,
    };
  }

  // 4. STANDBY
  return {
    status: 'STANDBY',
    reason: `All simulated subsystems currently in standby. Load a scenario or run a laboratory to observe live OS operations.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. EVENT NORMALIZATION & CONTEXTUAL NAVIGATION RESOLVER
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeEvent(
  rawEvent: SimulationEvent | string,
  fallbackSource: 'PROCESS' | 'CPU' | 'MEMORY' | 'DEADLOCK' | 'FILESYSTEM' = 'PROCESS',
  defaultTimestamp = 0,
  defaultIndex = 0
): NormalizedObservatoryEvent {
  if (typeof rawEvent === 'string') {
    // String event e.g. from deadlock or memory stores
    let source: any = fallbackSource;
    let severity: any = 'INFO';
    let targetRoute = '/process';

    if (fallbackSource === 'DEADLOCK') {
      targetRoute = '/deadlock';
      if (rawEvent.toLowerCase().includes('deadlock')) severity = 'ERROR';
      else if (rawEvent.toLowerCase().includes('unsafe') || rawEvent.toLowerCase().includes('denied')) severity = 'WARN';
    } else if (fallbackSource === 'MEMORY') {
      targetRoute = '/memory';
      if (rawEvent.toLowerCase().includes('fault')) severity = 'WARN';
      else if (rawEvent.toLowerCase().includes('hit')) severity = 'SUCCESS';
    }

    return Object.freeze({
      id: `norm_str_${fallbackSource}_${defaultTimestamp}_${defaultIndex}`,
      source,
      timestamp: defaultTimestamp,
      sequenceNumber: defaultIndex,
      type: fallbackSource === 'DEADLOCK' ? 'RESOURCE_EVENT' : 'MEMORY_EVENT',
      severity,
      description: rawEvent,
      targetRoute,
    });
  }

  // Strongly-typed SimulationEvent
  let targetRoute = '/process';
  switch (rawEvent.sourceModule) {
    case 'CPU':
      targetRoute = '/scheduling';
      break;
    case 'MEMORY':
      targetRoute = '/memory';
      break;
    case 'DEADLOCK':
      targetRoute = '/deadlock';
      break;
    case 'FILESYSTEM':
      targetRoute = '/filesystem';
      break;
    case 'PROCESS':
    default:
      targetRoute = '/process';
      break;
  }

  // Extract related PID if present
  let relatedPid: string | undefined;
  if (rawEvent.details?.pid) {
    relatedPid = String(rawEvent.details.pid);
  } else if (rawEvent.description.match(/\b(P\d+)\b/i)) {
    relatedPid = rawEvent.description.match(/\b(P\d+)\b/i)?.[1];
  }

  return Object.freeze({
    id: rawEvent.id,
    source: rawEvent.sourceModule,
    timestamp: rawEvent.timestamp,
    sequenceNumber: rawEvent.sequenceNumber,
    type: rawEvent.type,
    severity: rawEvent.severity,
    description: rawEvent.description,
    relatedPid,
    targetRoute,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. EVENT FILTERING, SEARCH & BOUNDED RETENTION
// ─────────────────────────────────────────────────────────────────────────────
export function filterAndSearchEvents(
  events: readonly NormalizedObservatoryEvent[],
  moduleFilter: string,
  severityFilter: string,
  query: string,
  maxRetention = 100
): readonly NormalizedObservatoryEvent[] {
  let filtered = events;

  // Filter by Source Module
  if (moduleFilter !== 'ALL') {
    filtered = filtered.filter((e) => e.source === moduleFilter);
  }

  // Filter by Severity
  if (severityFilter !== 'ALL') {
    filtered = filtered.filter((e) => e.severity === severityFilter);
  }

  // Filter by Search Query
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        (e.relatedPid && e.relatedPid.toLowerCase().includes(q))
    );
  }

  // Sort descending by timestamp, then sequence number
  const sorted = [...filtered].sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    return b.sequenceNumber - a.sequenceNumber;
  });

  return Object.freeze(sorted.slice(0, maxRetention));
}
