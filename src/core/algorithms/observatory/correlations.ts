/**
 * OScope — Cross-Subsystem Correlation Engine
 * Traces simulated process activities across Process, CPU Scheduling,
 * Memory, Deadlock, and File System laboratories without fabricating relationships.
 */

import type { CrossSubsystemCorrelation, CorrelationConfidence } from '../../models/observatory';

export function traceProcessCorrelation(
  pid: string,
  states: {
    processState?: {
      processes?: Record<string, any>;
      runningPid?: string | null;
      readyQueue?: readonly string[];
      waitingQueue?: readonly any[];
    };
    schedulingState?: {
      workload?: readonly any[];
      result?: any | null;
    };
    memoryState?: {
      physicalMemory?: any;
      translationResult?: any | null;
    };
    deadlockState?: {
      state?: {
        processIds?: readonly string[];
        resourceIds?: readonly string[];
        allocation?: readonly (readonly number[])[];
        need?: readonly (readonly number[])[];
      };
    };
    filesystemState?: {
      state?: {
        diskBlocks?: readonly any[];
        directoryEntries?: readonly any[];
      };
    };
  }
): CrossSubsystemCorrelation | null {
  if (!pid || !pid.trim()) return null;
  const targetPid = pid.toUpperCase().trim();

  // 1. Process Lab Presence
  const pcb = states.processState?.processes?.[targetPid];
  const processState = pcb?.state ?? (states.processState?.runningPid === targetPid ? 'RUNNING' : null);

  // 2. CPU Scheduling Presence
  const inWorkload = (states.schedulingState?.workload ?? []).some(
    (p: any) => p.pid.toUpperCase() === targetPid
  );
  const cpuScheduled = inWorkload || states.schedulingState?.result?.executionSteps?.some(
    (s: any) => s.currentRunningPid?.toUpperCase() === targetPid
  );

  // 3. Memory Page References
  let memoryPageReferences = 0;
  if (states.memoryState?.physicalMemory?.frames) {
    memoryPageReferences = states.memoryState.physicalMemory.frames.filter(
      (f: any) => f.processId?.toUpperCase() === targetPid
    ).length;
  }

  // 4. Deadlock Resource Allocation
  const allocatedResources: string[] = [];
  const requestedResources: string[] = [];
  const dlState = states.deadlockState?.state;

  if (dlState && dlState.processIds && dlState.resourceIds) {
    const pIdx = dlState.processIds.findIndex((id) => id.toUpperCase() === targetPid);
    if (pIdx !== -1) {
      const resIds = dlState.resourceIds;
      const allocRow = dlState.allocation?.[pIdx] ?? [];
      const needRow = dlState.need?.[pIdx] ?? [];

      allocRow.forEach((qty: number, rIdx: number) => {
        if (qty > 0 && resIds[rIdx]) {
          allocatedResources.push(`${qty}×${resIds[rIdx]}`);
        }
      });

      needRow.forEach((qty: number, rIdx: number) => {
        if (qty > 0 && resIds[rIdx]) {
          requestedResources.push(`${qty}×${resIds[rIdx]}`);
        }
      });
    }
  }

  // 5. File System References
  const filesAccessed: string[] = [];
  const fsEntries = states.filesystemState?.state?.directoryEntries ?? [];
  fsEntries.forEach((e: any) => {
    if (e.name.toUpperCase().includes(targetPid) || e.path.toUpperCase().includes(targetPid)) {
      filesAccessed.push(e.name);
    }
  });

  // Evaluate correlation strength
  const hits = [
    pcb !== undefined,
    cpuScheduled,
    allocatedResources.length > 0,
    filesAccessed.length > 0,
  ].filter(Boolean).length;

  if (hits === 0) {
    return null;
  }

  let confidence: CorrelationConfidence = 'CONCEPTUAL';
  if (hits >= 2) {
    confidence = 'DIRECT';
  } else if (inWorkload || pcb) {
    confidence = 'DERIVED';
  }

  let explanation = `Process ${targetPid} correlation: `;
  if (processState) {
    explanation += `State in Process Lab: [${processState}]. `;
  }
  if (cpuScheduled) {
    explanation += `Registered in CPU scheduling workload. `;
  }
  if (allocatedResources.length > 0) {
    explanation += `Holds Deadlock resources: [${allocatedResources.join(', ')}]. `;
  }
  if (requestedResources.length > 0) {
    explanation += `Pending request for: [${requestedResources.join(', ')}]. `;
  }
  if (filesAccessed.length > 0) {
    explanation += `Associated storage files: [${filesAccessed.join(', ')}].`;
  }

  return Object.freeze({
    pid: targetPid,
    confidence,
    processState,
    cpuScheduled,
    memoryPageReferences,
    resourcesAllocated: Object.freeze(allocatedResources),
    resourcesRequested: Object.freeze(requestedResources),
    filesAccessed: Object.freeze(filesAccessed),
    explanation,
  });
}
