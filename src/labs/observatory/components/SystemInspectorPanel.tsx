/**
 * OScope — System & Process Correlation Inspector Component
 * Provides academic telemetry deep-dives for selected subsystems,
 * and allows users to "Follow a Process" across all five laboratories.
 */

import React from 'react';
import { Search, UserCheck, Shield } from 'lucide-react';
import { Card, Badge, Button } from '../../../components/common';
import type { ObservatorySnapshot } from '../../../core/models/observatory';
import { useObservatoryStore } from '../../../state/useObservatoryStore';

interface Props {
  snapshot: ObservatorySnapshot;
}

export const SystemInspectorPanel: React.FC<Props> = ({ snapshot }) => {
  const selectedSubsystem = useObservatoryStore((s) => s.selectedSubsystem);
  const trackedPid = useObservatoryStore((s) => s.trackedPid);
  const setTrackedPid = useObservatoryStore((s) => s.setTrackedPid);

  const { process, scheduling, memory, deadlock, filesystem, activeCorrelation } = snapshot;

  const [inputPid, setInputPid] = React.useState(trackedPid ?? 'P1');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPid.trim()) {
      setTrackedPid(inputPid.trim().toUpperCase());
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
      {/* Panel 1: Subsystem Deep-Dive Inspector */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} color="var(--color-accent)" />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                Subsystem Architecture Inspector: {selectedSubsystem}
              </h4>
            </div>
            <Badge variant="outline">Live Observability</Badge>
          </div>

          {selectedSubsystem === 'OVERVIEW' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                The <strong>Central Observatory</strong> synthesizes live execution telemetry from five independent
                Operating System laboratories.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Process Lifecycle</strong>: Models PCB records and state transitions (New → Ready → Running → Waiting → Terminated).</li>
                <li><strong>CPU Scheduling</strong>: Simulates preemption, quantum slicing, and scheduling metrics (FCFS, SJF, SRTF, RR, Priority).</li>
                <li><strong>Virtual Memory</strong>: Simulates hardware address translation, TLB lookups, page tables, and page replacement policies.</li>
                <li><strong>Deadlock & Banker</strong>: Evaluates conservative resource allocation safety, cycle detection, and deadlocked processes.</li>
                <li><strong>Virtual Storage</strong>: Simulates contiguous, linked, and indexed disk block allocation, Inodes, and external fragmentation.</li>
              </ul>
            </div>
          )}

          {selectedSubsystem === 'PROCESS' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ margin: 0 }}>
                <strong>Role:</strong> Manages Process Control Blocks (PCBs), process state transitions, and execution queues.
              </p>
              <div style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                <div>Total Registered: <strong>{process.totalProcesses}</strong></div>
                <div>Currently Running: <strong>{process.runningPid ?? 'None (CPU Idle)'}</strong></div>
                <div>Ready Queue Length: <strong>{process.readyCount}</strong></div>
                <div>Waiting on I/O: <strong>{process.waitingCount}</strong></div>
                <div>Terminated: <strong>{process.terminatedCount}</strong></div>
              </div>
              <p style={{ margin: 0, fontSize: '0.6875rem' }}>
                * Select a process in the Process Lab to inspect its individual registers, memory limits, and priority.
              </p>
            </div>
          )}

          {selectedSubsystem === 'CPU' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ margin: 0 }}>
                <strong>Role:</strong> Dispatches ready processes to the virtual CPU using algorithmic scheduling heuristics.
              </p>
              <div style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                <div>Active Algorithm: <strong>{scheduling.activeAlgorithm}</strong></div>
                <div>CPU Utilization: <strong>{scheduling.cpuUtilization !== null ? `${scheduling.cpuUtilization}%` : '—'}</strong></div>
                <div>Average Waiting Time: <strong>{scheduling.averageWaitingTime !== null ? `${scheduling.averageWaitingTime} ticks` : '—'}</strong></div>
                <div>Average Turnaround: <strong>{scheduling.averageTurnaroundTime !== null ? `${scheduling.averageTurnaroundTime} ticks` : '—'}</strong></div>
                <div>Context Switches: <strong>{scheduling.contextSwitches ?? '—'}</strong></div>
              </div>
            </div>
          )}

          {selectedSubsystem === 'MEMORY' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ margin: 0 }}>
                <strong>Role:</strong> Translates virtual addresses to physical frames and handles page replacement when physical frames saturate.
              </p>
              <div style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                <div>Physical Memory Frames: <strong>{memory.occupiedFrames}/{memory.frameCount} occupied ({memory.memoryUtilization}%)</strong></div>
                <div>TLB Cache: <strong>{memory.tlbEntriesUsed}/{memory.tlbCapacity} entries used</strong></div>
                <div>TLB Hit Rate: <strong>{memory.tlbHitRate !== null ? `${memory.tlbHitRate}%` : '—'}</strong></div>
                <div>Page Faults: <strong>{memory.pageFaults !== null ? `${memory.pageFaults} (${memory.pageFaultRate}%)` : '—'}</strong></div>
                <div>Replacement Algorithm: <strong>{memory.replacementAlgorithm}</strong></div>
              </div>
            </div>
          )}

          {selectedSubsystem === 'DEADLOCK' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ margin: 0 }}>
                <strong>Role:</strong> Verifies safe execution sequences via Banker’s Algorithm and detects circular waits in Resource Allocation Graphs.
              </p>
              <div style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                <div>Banker State: <strong>{deadlock.bankerState}</strong></div>
                <div>Safe Sequence: <strong>{deadlock.safeSequence ? `<${deadlock.safeSequence.join(', ')}>` : 'None (Unsafe)'}</strong></div>
                <div>Deadlock Detected: <strong>{deadlock.isDeadlocked ? 'YES (Critical)' : 'NO (Acyclic)'}</strong></div>
                <div>Blocked Processes: <strong>{deadlock.deadlockedPids.length > 0 ? deadlock.deadlockedPids.join(', ') : 'None'}</strong></div>
              </div>
            </div>
          )}

          {selectedSubsystem === 'FILESYSTEM' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ margin: 0 }}>
                <strong>Role:</strong> Allocates disk blocks for files using Contiguous, Linked, or Indexed placement strategies.
              </p>
              <div style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                <div>Storage Capacity: <strong>{filesystem.allocatedBlocks}/{filesystem.totalBlocks} Blocks ({filesystem.diskUsagePercentage}%)</strong></div>
                <div>Free Space: <strong>{filesystem.freeBlocks} Blocks (Largest extent: {filesystem.largestFreeRun})</strong></div>
                <div>VFS Objects: <strong>{filesystem.fileCount} files, {filesystem.directoryCount} directories, {filesystem.inodeCount} Inodes</strong></div>
                <div>Placement Strategy: <strong>{filesystem.selectedStrategy}</strong></div>
                <div>Structural Integrity: <strong>{filesystem.isConsistent ? 'Consistent (All 6 invariants pass)' : 'Corruption Detected'}</strong></div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Panel 2: Cross-Subsystem Process Correlation (Follow a Process) */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} color="var(--color-accent)" />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                Follow a Process Across Subsystems
              </h4>
            </div>
            {activeCorrelation && (
              <Badge variant={activeCorrelation.confidence === 'DIRECT' ? 'success' : 'info'}>
                {activeCorrelation.confidence} CORRELATION
              </Badge>
            )}
          </div>

          {/* Process Selector Form */}
          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={inputPid}
              onChange={(e) => setInputPid(e.target.value)}
              placeholder="e.g. P1, P2, P3"
              style={{
                flex: 1,
                padding: '6px 8px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
              }}
            />
            <Button variant="primary" size="sm" icon={<Search size={13} />}>
              Trace PID
            </Button>
          </form>

          {/* Correlation Results */}
          {activeCorrelation ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                  TRACING {activeCorrelation.pid}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Confidence: {activeCorrelation.confidence}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>PROCESS STATE: </span>
                  <strong>{activeCorrelation.processState ?? 'Not currently in Process Lab'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>CPU SCHEDULING: </span>
                  <strong>{activeCorrelation.cpuScheduled ? 'Scheduled in active workload' : 'Not scheduled'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>DEADLOCK RESOURCES HELD: </span>
                  <strong>
                    {activeCorrelation.resourcesAllocated.length > 0
                      ? activeCorrelation.resourcesAllocated.join(', ')
                      : 'None'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>RESOURCES REQUESTED: </span>
                  <strong>
                    {activeCorrelation.resourcesRequested.length > 0
                      ? activeCorrelation.resourcesRequested.join(', ')
                      : 'None'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>STORAGE FILES: </span>
                  <strong>
                    {activeCorrelation.filesAccessed.length > 0
                      ? activeCorrelation.filesAccessed.join(', ')
                      : 'None'}
                  </strong>
                </div>
              </div>

              <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {activeCorrelation.explanation}
              </p>
            </div>
          ) : (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(0,0,0,0.15)',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--color-border)',
              }}
            >
              No correlated activity available for PID "{inputPid.toUpperCase()}".
              <br />
              Enter an existing process ID such as <strong>P1</strong> or <strong>P2</strong> to trace its footprint.
            </div>
          )}

          <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            * Academic Notice: OScope identifies cross-lab correlations when identical PIDs or explicit resource bindings are present. Independent simulations are never artificially merged.
          </div>
        </div>
      </Card>
    </div>
  );
};
