/**
 * OScope — Observatory Telemetry Aggregator Hook
 * Reads real simulated state from all 5 laboratory stores,
 * normalizes heterogeneous events, computes overall system status,
 * and traces process correlations across subsystems.
 */

import React from 'react';
import {
  useProcessStore,
  useSchedulingStore,
  useMemoryStore,
  useDeadlockStore,
  useFileSystemStore,
  useObservatoryStore,
} from '../../state';
import {
  extractProcessTelemetry,
  extractSchedulingTelemetry,
  extractMemoryTelemetry,
  extractDeadlockTelemetry,
  extractFileSystemTelemetry,
  computeOverallSystemStatus,
  normalizeEvent,
  filterAndSearchEvents,
  traceProcessCorrelation,
} from '../../core/algorithms/observatory';
import type {
  ObservatorySnapshot,
  NormalizedObservatoryEvent,
} from '../../core/models/observatory';

export function useObservatoryTelemetry(): ObservatorySnapshot {
  // 1. Process Lab Subsystem State
  const processProcesses = useProcessStore((s) => s.processes);
  const processRunningPid = useProcessStore((s) => s.runningPid);
  const processReadyQueue = useProcessStore((s) => s.readyQueue);
  const processWaitingQueue = useProcessStore((s) => s.waitingQueue);
  const processTerminatedPids = useProcessStore((s) => s.terminatedPids);
  const processNewPids = useProcessStore((s) => s.newPids);
  const processEvents = useProcessStore((s) => s.events);
  const processClock = useProcessStore((s) => s.clock);

  // 2. CPU Scheduling Subsystem State
  const schedWorkload = useSchedulingStore((s) => s.workload);
  const schedAlgorithm = useSchedulingStore((s) => s.selectedAlgorithm);
  const schedResult = useSchedulingStore((s) => s.result);

  // 3. Memory Subsystem State
  const memConfig = useMemoryStore((s) => s.config);
  const memPhysical = useMemoryStore((s) => s.physicalMemory);
  const memTlb = useMemoryStore((s) => s.tlb);
  const memReplacementResult = useMemoryStore((s) => s.replacementResult);
  const memTranslationResult = useMemoryStore((s) => s.translationResult);
  const memTranslationEvents = useMemoryStore((s) => s.translationEvents);

  // 4. Deadlock Subsystem State
  const dlState = useDeadlockStore((s) => s.state);
  const dlSafety = useDeadlockStore((s) => s.safetyResult);
  const dlDetection = useDeadlockStore((s) => s.deadlockDetectionResult);
  const dlRagCycle = useDeadlockStore((s) => s.ragCycleResult);
  const dlEvents = useDeadlockStore((s) => s.simulationEvents);

  // 5. File System Subsystem State
  const fsState = useFileSystemStore((s) => s.state);
  const fsFreeSpace = useFileSystemStore((s) => s.freeSpaceAnalysis);
  const fsConsistency = useFileSystemStore((s) => s.consistencyReport);
  const fsStrategy = useFileSystemStore((s) => s.selectedStrategy);
  const fsEvents = useFileSystemStore((s) => s.simulationEvents);

  // 6. Observatory Store Controls
  const eventModuleFilter = useObservatoryStore((s) => s.eventModuleFilter);
  const eventSeverityFilter = useObservatoryStore((s) => s.eventSeverityFilter);
  const eventSearchQuery = useObservatoryStore((s) => s.eventSearchQuery);
  const trackedPid = useObservatoryStore((s) => s.trackedPid);
  const retentionLimit = useObservatoryStore((s) => s.retentionLimit);

  // Derived Telemetry Objects (Memoized)
  const processTelemetry = React.useMemo(
    () =>
      extractProcessTelemetry({
        processes: processProcesses,
        runningPid: processRunningPid,
        readyQueue: processReadyQueue,
        waitingQueue: processWaitingQueue,
        terminatedPids: processTerminatedPids,
        newPids: processNewPids,
      }),
    [
      processProcesses,
      processRunningPid,
      processReadyQueue,
      processWaitingQueue,
      processTerminatedPids,
      processNewPids,
    ]
  );

  const schedulingTelemetry = React.useMemo(
    () =>
      extractSchedulingTelemetry({
        workload: schedWorkload,
        selectedAlgorithm: schedAlgorithm,
        result: schedResult,
      }),
    [schedWorkload, schedAlgorithm, schedResult]
  );

  const memoryTelemetry = React.useMemo(
    () =>
      extractMemoryTelemetry({
        config: memConfig,
        physicalMemory: memPhysical,
        tlb: memTlb,
        replacementResult: memReplacementResult,
      }),
    [memConfig, memPhysical, memTlb, memReplacementResult]
  );

  const deadlockTelemetry = React.useMemo(
    () =>
      extractDeadlockTelemetry({
        state: dlState,
        safetyResult: dlSafety,
        deadlockDetectionResult: dlDetection,
        ragCycleResult: dlRagCycle,
      }),
    [dlState, dlSafety, dlDetection, dlRagCycle]
  );

  const filesystemTelemetry = React.useMemo(
    () =>
      extractFileSystemTelemetry({
        state: fsState,
        freeSpaceAnalysis: fsFreeSpace,
        consistencyReport: fsConsistency,
        selectedStrategy: fsStrategy,
      }),
    [fsState, fsFreeSpace, fsConsistency, fsStrategy]
  );

  // Compute Overall System Status with Precedence (FAULT > ATTENTION > ACTIVE > STANDBY)
  const { status: systemStatus, reason: systemStatusReason } = React.useMemo(
    () =>
      computeOverallSystemStatus({
        process: processTelemetry,
        scheduling: schedulingTelemetry,
        memory: memoryTelemetry,
        deadlock: deadlockTelemetry,
        filesystem: filesystemTelemetry,
      }),
    [processTelemetry, schedulingTelemetry, memoryTelemetry, deadlockTelemetry, filesystemTelemetry]
  );

  // Consolidate and Normalize Heterogeneous Events
  const normalizedEvents: readonly NormalizedObservatoryEvent[] = React.useMemo(() => {
    const rawList: NormalizedObservatoryEvent[] = [];

    // From Process Lab
    processEvents.forEach((evt) => {
      rawList.push(normalizeEvent(evt, 'PROCESS'));
    });

    // From Scheduling Lab (step snapshots)
    if (schedResult?.stepSnapshots) {
      schedResult.stepSnapshots.forEach((snap, idx) => {
        if (snap.explanation) {
          rawList.push(normalizeEvent(snap.explanation, 'CPU', snap.time, idx));
        }
      });
    }

    // From Memory Lab (translation events string array)
    memTranslationEvents.forEach((strEvt, idx) => {
      rawList.push(normalizeEvent(strEvt, 'MEMORY', idx + 1, idx));
    });

    // From Deadlock Lab (simulation events string array)
    dlEvents.forEach((strEvt, idx) => {
      rawList.push(normalizeEvent(strEvt, 'DEADLOCK', idx + 1, idx));
    });

    // From File System Lab (SimulationEvent objects)
    fsEvents.forEach((evt) => {
      rawList.push(normalizeEvent(evt, 'FILESYSTEM'));
    });

    return filterAndSearchEvents(
      rawList,
      eventModuleFilter,
      eventSeverityFilter,
      eventSearchQuery,
      retentionLimit
    );
  }, [
    processEvents,
    schedResult,
    memTranslationEvents,
    dlEvents,
    fsEvents,
    eventModuleFilter,
    eventSeverityFilter,
    eventSearchQuery,
    retentionLimit,
  ]);

  // Cross-Subsystem Process Correlation
  const activeCorrelation = React.useMemo(() => {
    if (!trackedPid) return null;
    return traceProcessCorrelation(trackedPid, {
      processState: {
        processes: processProcesses,
        runningPid: processRunningPid,
        readyQueue: processReadyQueue,
        waitingQueue: processWaitingQueue,
      },
      schedulingState: {
        workload: schedWorkload,
        result: schedResult,
      },
      memoryState: {
        physicalMemory: memPhysical,
        translationResult: memTranslationResult,
      },
      deadlockState: {
        state: dlState,
      },
      filesystemState: {
        state: fsState,
      },
    });
  }, [
    trackedPid,
    processProcesses,
    processRunningPid,
    processReadyQueue,
    processWaitingQueue,
    schedWorkload,
    schedResult,
    memPhysical,
    memTranslationResult,
    dlState,
    fsState,
  ]);

  const timestamp = React.useMemo(() => {
    try {
      return processClock?.getCurrentTime?.() ?? 0;
    } catch {
      return 0;
    }
  }, [processClock]);

  return Object.freeze({
    timestamp,
    systemStatus,
    systemStatusReason,
    process: processTelemetry,
    scheduling: schedulingTelemetry,
    memory: memoryTelemetry,
    deadlock: deadlockTelemetry,
    filesystem: filesystemTelemetry,
    normalizedEvents,
    activeCorrelation,
  });
}
