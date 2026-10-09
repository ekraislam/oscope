/**
 * OScope — Observatory Events & Correlation Engine Unit Tests
 * Tests event normalization, contextual lab route mapping,
 * multi-dimensional filtering, search, bounded retention,
 * and deterministic cross-subsystem process correlation tracking.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeEvent,
  filterAndSearchEvents,
  traceProcessCorrelation,
} from '../core/algorithms/observatory';
import { createSimulationEvent } from '../core/models/simulation';

describe('Event Normalization & Contextual Routing Engine', () => {
  it('maps strongly-typed simulation events to appropriate laboratory routes', () => {
    const cpuEvt = createSimulationEvent({
      timestamp: 5,
      type: 'PROCESS_DISPATCHED',
      sourceModule: 'CPU',
      severity: 'INFO',
      description: 'Process P1 dispatched to virtual CPU core.',
    });

    const norm = normalizeEvent(cpuEvt);
    expect(norm.source).toBe('CPU');
    expect(norm.targetRoute).toBe('/scheduling');
    expect(norm.relatedPid).toBe('P1');
  });

  it('normalizes string events from memory and deadlock logs with inferred severity', () => {
    const memStr = 'Page Fault occurred for virtual address 0x1040 (page 4)';
    const norm = normalizeEvent(memStr, 'MEMORY', 12, 1);

    expect(norm.source).toBe('MEMORY');
    expect(norm.targetRoute).toBe('/memory');
    expect(norm.severity).toBe('WARN');
    expect(norm.description).toBe(memStr);

    const dlStr = 'Deadlock detected: Circular wait cycle [P1 -> P2 -> P1]';
    const normDl = normalizeEvent(dlStr, 'DEADLOCK', 14, 2);
    expect(normDl.source).toBe('DEADLOCK');
    expect(normDl.targetRoute).toBe('/deadlock');
    expect(normDl.severity).toBe('ERROR');
  });
});

describe('Event Filtering, Search & Bounded Retention Engine', () => {
  const sampleEvents = [
    normalizeEvent('P1 page fault', 'MEMORY', 1, 1),
    normalizeEvent('P2 acquired R1', 'DEADLOCK', 2, 2),
    normalizeEvent('P1 CPU preempted', 'PROCESS', 3, 3),
    normalizeEvent('Block #12 allocated for report.txt', 'FILESYSTEM', 4, 4),
  ];

  it('filters events strictly by source module', () => {
    const memOnly = filterAndSearchEvents(sampleEvents, 'MEMORY', 'ALL', '');
    expect(memOnly.length).toBe(1);
    expect(memOnly[0].source).toBe('MEMORY');
  });

  it('filters events by severity level', () => {
    const warnsOnly = filterAndSearchEvents(sampleEvents, 'ALL', 'WARN', '');
    expect(warnsOnly.every((e) => e.severity === 'WARN')).toBe(true);
  });

  it('searches events across descriptions, types, and PIDs', () => {
    const p1Matches = filterAndSearchEvents(sampleEvents, 'ALL', 'ALL', 'P1');
    expect(p1Matches.length).toBe(2);
    expect(p1Matches.every((e) => e.description.includes('P1'))).toBe(true);
  });

  it('enforces retention bounds and sorts newest events first', () => {
    const manyEvents = Array.from({ length: 150 }, (_, i) =>
      normalizeEvent(`Tick event #${i}`, 'PROCESS', i, i)
    );

    const retained = filterAndSearchEvents(manyEvents, 'ALL', 'ALL', '', 50);
    expect(retained.length).toBe(50);
    // Highest timestamp should be first
    expect(retained[0].timestamp).toBe(149);
    expect(retained[retained.length - 1].timestamp).toBe(100);
  });
});

describe('Cross-Subsystem Process Correlation Engine', () => {
  it('correctly discovers DIRECT cross-subsystem correlations when the same PID exists in multiple labs', () => {
    const correlation = traceProcessCorrelation('P1', {
      processState: {
        processes: { P1: { state: 'RUNNING' } },
        runningPid: 'P1',
        readyQueue: [],
      },
      schedulingState: {
        workload: [{ pid: 'P1' }],
      },
      deadlockState: {
        state: {
          processIds: ['P1', 'P2'],
          resourceIds: ['R1', 'R2'],
          allocation: [[1, 0], [0, 1]],
          need: [[0, 1], [1, 0]],
        },
      },
      filesystemState: {
        state: {
          directoryEntries: [{ name: 'P1_output.log', path: '/P1_output.log' }],
        },
      },
    });

    expect(correlation).not.toBeNull();
    expect(correlation?.pid).toBe('P1');
    expect(correlation?.confidence).toBe('DIRECT');
    expect(correlation?.processState).toBe('RUNNING');
    expect(correlation?.cpuScheduled).toBe(true);
    expect(correlation?.resourcesAllocated).toContain('1×R1');
    expect(correlation?.resourcesRequested).toContain('1×R2');
    expect(correlation?.filesAccessed).toContain('P1_output.log');
  });

  it('returns null and does NOT fabricate relationships when a PID does not exist in any lab', () => {
    const correlation = traceProcessCorrelation('P99', {
      processState: { processes: { P1: {} } },
      schedulingState: { workload: [{ pid: 'P1' }] },
      deadlockState: { state: { processIds: ['P1'] } },
    });

    expect(correlation).toBeNull();
  });
});
