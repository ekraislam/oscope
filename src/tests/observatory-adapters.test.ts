/**
 * OScope — Observatory Subsystem Adapters & System Status Unit Tests
 * Tests pure telemetry extraction, empty-state detection (null vs 0),
 * system status precedence (FAULT > ATTENTION > ACTIVE > STANDBY),
 * and academic safety rules (e.g. page faults != system fault, unsafe != deadlock).
 */

import { describe, it, expect } from 'vitest';
import {
  extractProcessTelemetry,
  extractSchedulingTelemetry,
  extractMemoryTelemetry,
  extractDeadlockTelemetry,
  extractFileSystemTelemetry,
  computeOverallSystemStatus,
} from '../core/algorithms/observatory';

describe('Observatory Process Telemetry Adapter', () => {
  it('returns STANDBY when no processes exist in the PCB table', () => {
    const tele = extractProcessTelemetry({
      processes: {},
      runningPid: null,
      readyQueue: [],
      waitingQueue: [],
      terminatedPids: [],
      newPids: [],
    });

    expect(tele.totalProcesses).toBe(0);
    expect(tele.runningPid).toBeNull();
    expect(tele.status).toBe('STANDBY');
    expect(tele.statusReason).toContain('No simulated processes');
  });

  it('accurately counts ready, running, waiting, and terminated processes in ACTIVE state', () => {
    const tele = extractProcessTelemetry({
      processes: {
        P1: { pid: 'P1', state: 'RUNNING' } as any,
        P2: { pid: 'P2', state: 'READY' } as any,
        P3: { pid: 'P3', state: 'WAITING' } as any,
        P4: { pid: 'P4', state: 'TERMINATED' } as any,
      },
      runningPid: 'P1',
      readyQueue: ['P2'],
      waitingQueue: [{ pid: 'P3', remainingWaitTicks: 2, device: 'DISK' }],
      terminatedPids: ['P4'],
      newPids: [],
    });

    expect(tele.totalProcesses).toBe(4);
    expect(tele.runningPid).toBe('P1');
    expect(tele.readyCount).toBe(1);
    expect(tele.waitingCount).toBe(1);
    expect(tele.terminatedCount).toBe(1);
    expect(tele.status).toBe('ACTIVE');
    expect(tele.statusReason).toContain('Process P1 currently executing');
  });
});

describe('Observatory CPU Scheduling Telemetry Adapter', () => {
  it('strictly returns null metrics (not fake zeros) when no simulation has been run', () => {
    const tele = extractSchedulingTelemetry({
      workload: [{ pid: 'P1' }, { pid: 'P2' }],
      selectedAlgorithm: 'SRTF',
      result: null,
    });

    expect(tele.hasSimulation).toBe(false);
    expect(tele.activeAlgorithm).toBe('SRTF');
    expect(tele.totalProcesses).toBe(2);
    expect(tele.cpuUtilization).toBeNull();
    expect(tele.averageWaitingTime).toBeNull();
    expect(tele.averageTurnaroundTime).toBeNull();
    expect(tele.contextSwitches).toBeNull();
    expect(tele.status).toBe('STANDBY');
    expect(tele.statusReason).toContain('no CPU scheduling simulation has been run');
  });

  it('extracts real simulated metrics upon simulation completion', () => {
    const tele = extractSchedulingTelemetry({
      workload: [{ pid: 'P1' }, { pid: 'P2' }],
      selectedAlgorithm: 'RR',
      result: {
        totalSimulationTime: 24,
        metrics: {
          cpuUtilization: 83.333,
          averageWaitingTime: 4.5,
          averageTurnaroundTime: 12.0,
          averageResponseTime: 2.0,
          totalContextSwitches: 3,
          throughput: 0.0833,
          completedProcesses: 2,
        },
      },
    });

    expect(tele.hasSimulation).toBe(true);
    expect(tele.cpuUtilization).toBe(83.3);
    expect(tele.averageWaitingTime).toBe(4.5);
    expect(tele.averageTurnaroundTime).toBe(12.0);
    expect(tele.contextSwitches).toBe(3);
    expect(tele.simulationTime).toBe(24);
    expect(tele.status).toBe('ACTIVE');
  });
});

describe('Observatory Memory Telemetry Adapter', () => {
  it('reports STANDBY and null fault rate when no replacement simulation has run', () => {
    const tele = extractMemoryTelemetry({
      config: { frameCount: 8, tlbCapacity: 4 },
      physicalMemory: { frames: [] },
      tlb: { entries: [], hitCount: 0, missCount: 0 },
      replacementResult: null,
    });

    expect(tele.hasSimulation).toBe(false);
    expect(tele.frameCount).toBe(8);
    expect(tele.occupiedFrames).toBe(0);
    expect(tele.freeFrames).toBe(8);
    expect(tele.pageFaults).toBeNull();
    expect(tele.pageFaultRate).toBeNull();
    expect(tele.status).toBe('STANDBY');
  });

  it('triggers ATTENTION on elevated page fault rate, but NEVER flags as system FAULT', () => {
    const tele = extractMemoryTelemetry({
      config: { frameCount: 4, tlbCapacity: 4 },
      physicalMemory: { frames: [{ isAllocated: true }] },
      tlb: { entries: [{ valid: true }], hitCount: 3, missCount: 7 },
      replacementResult: {
        pageFaults: 9,
        pageHits: 1,
        pageFaultRate: 0.9, // 90% fault rate
        algorithm: 'FIFO',
        steps: new Array(10).fill({}),
      },
    });

    expect(tele.hasSimulation).toBe(true);
    expect(tele.pageFaults).toBe(9);
    expect(tele.pageFaultRate).toBe(90);
    expect(tele.tlbHitRate).toBe(30); // 3 hits / 10 lookups = 30%
    expect(tele.status).toBe('ATTENTION'); // Attention, NOT Fault!
    expect(tele.statusReason).toContain('Elevated page fault rate');
  });
});

describe('Observatory Deadlock Telemetry Adapter', () => {
  it('correctly maps safe Banker state to ACTIVE', () => {
    const tele = extractDeadlockTelemetry({
      state: { processIds: ['P1', 'P2'], resourceIds: ['R1', 'R2'] },
      safetyResult: { isSafe: true, safeSequence: ['P1', 'P2'] },
      deadlockDetectionResult: { isDeadlocked: false, deadlockedProcessIds: [] },
      ragCycleResult: { hasCycle: false },
    });

    expect(tele.hasState).toBe(true);
    expect(tele.bankerState).toBe('SAFE');
    expect(tele.safeSequence).toEqual(['P1', 'P2']);
    expect(tele.isDeadlocked).toBe(false);
    expect(tele.status).toBe('ACTIVE');
  });

  it('classifies UNSAFE Banker state as ATTENTION, NOT DEADLOCK/FAULT', () => {
    const tele = extractDeadlockTelemetry({
      state: { processIds: ['P1', 'P2'], resourceIds: ['R1'] },
      safetyResult: { isSafe: false, safeSequence: [] },
      deadlockDetectionResult: { isDeadlocked: false, deadlockedProcessIds: [] }, // No deadlock yet!
      ragCycleResult: { hasCycle: false },
    });

    expect(tele.bankerState).toBe('UNSAFE');
    expect(tele.isDeadlocked).toBe(false);
    expect(tele.status).toBe('ATTENTION');
    expect(tele.statusReason).toContain('reports UNSAFE state');
    expect(tele.statusReason).toContain('Not yet a confirmed deadlock');
  });

  it('triggers FAULT only when an actual confirmed deadlock exists', () => {
    const tele = extractDeadlockTelemetry({
      state: { processIds: ['P1', 'P2'], resourceIds: ['R1', 'R2'] },
      safetyResult: { isSafe: false, safeSequence: [] },
      deadlockDetectionResult: { isDeadlocked: true, deadlockedProcessIds: ['P1', 'P2'] },
      ragCycleResult: { hasCycle: true },
    });

    expect(tele.isDeadlocked).toBe(true);
    expect(tele.deadlockedPids).toEqual(['P1', 'P2']);
    expect(tele.status).toBe('FAULT');
    expect(tele.statusReason).toContain('DEADLOCK DETECTED');
  });
});

describe('Observatory File System Telemetry Adapter', () => {
  it('computes storage occupancy and free space runs', () => {
    const tele = extractFileSystemTelemetry({
      state: {
        totalBlocks: 32,
        freeBlocksCount: 12,
        directoryEntries: [
          { type: 'FILE', name: 'alpha.txt' },
          { type: 'DIRECTORY', name: 'home' },
        ],
        inodes: { 1: {} },
      },
      freeSpaceAnalysis: { largestFreeRun: 4, totalFreeBlocks: 12 },
      consistencyReport: { isConsistent: true },
      selectedStrategy: 'CONTIGUOUS',
    });

    expect(tele.totalBlocks).toBe(32);
    expect(tele.allocatedBlocks).toBe(20);
    expect(tele.freeBlocks).toBe(12);
    expect(tele.diskUsagePercentage).toBe(63); // 20/32 = 62.5% -> 63%
    expect(tele.largestFreeRun).toBe(4);
    expect(tele.fileCount).toBe(1);
    expect(tele.directoryCount).toBe(1);
    expect(tele.status).toBe('ACTIVE');
  });

  it('triggers FAULT if file system structural consistency check fails', () => {
    const tele = extractFileSystemTelemetry({
      state: { totalBlocks: 16, freeBlocksCount: 8, directoryEntries: [], inodes: {} },
      freeSpaceAnalysis: { largestFreeRun: 4, totalFreeBlocks: 8 },
      consistencyReport: { isConsistent: false, errors: ['Double allocation at Block #3'] },
      selectedStrategy: 'CONTIGUOUS',
    });

    expect(tele.status).toBe('FAULT');
    expect(tele.statusReason).toContain('corruption invariants failure');
  });
});

describe('Overall System Status Precedence Engine', () => {
  const baseProcess = extractProcessTelemetry({});
  const baseScheduling = extractSchedulingTelemetry({});
  const baseMemory = extractMemoryTelemetry({});
  const baseDeadlock = extractDeadlockTelemetry({});
  const baseFilesystem = extractFileSystemTelemetry({});

  it('evaluates to STANDBY when all subsystems are idle', () => {
    const res = computeOverallSystemStatus({
      process: baseProcess,
      scheduling: baseScheduling,
      memory: baseMemory,
      deadlock: baseDeadlock,
      filesystem: baseFilesystem,
    });

    expect(res.status).toBe('STANDBY');
  });

  it('evaluates to ACTIVE when normal simulation runs without anomalies', () => {
    const activeProcess = { ...baseProcess, status: 'ACTIVE' as const };
    const res = computeOverallSystemStatus({
      process: activeProcess,
      scheduling: baseScheduling,
      memory: baseMemory,
      deadlock: baseDeadlock,
      filesystem: baseFilesystem,
    });

    expect(res.status).toBe('ACTIVE');
  });

  it('elevates to ATTENTION when a subsystem triggers a warning', () => {
    const attentionDeadlock = { ...baseDeadlock, status: 'ATTENTION' as const };
    const res = computeOverallSystemStatus({
      process: { ...baseProcess, status: 'ACTIVE' as const },
      scheduling: baseScheduling,
      memory: baseMemory,
      deadlock: attentionDeadlock,
      filesystem: baseFilesystem,
    });

    expect(res.status).toBe('ATTENTION');
    expect(res.reason).toContain('Banker\'s Algorithm reports an unsafe state');
  });

  it('enforces highest precedence for FAULT over ATTENTION and ACTIVE', () => {
    const attentionMemory = { ...baseMemory, status: 'ATTENTION' as const };
    const faultDeadlock = {
      ...baseDeadlock,
      status: 'FAULT' as const,
      deadlockedPids: ['P1', 'P2'],
    };

    const res = computeOverallSystemStatus({
      process: { ...baseProcess, status: 'ACTIVE' as const },
      scheduling: baseScheduling,
      memory: attentionMemory,
      deadlock: faultDeadlock, // Should take precedence!
      filesystem: baseFilesystem,
    });

    expect(res.status).toBe('FAULT');
    expect(res.reason).toContain('Deadlock detected');
  });
});
