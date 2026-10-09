/**
 * OScope — Central Observatory System Metrics Strip Component
 * Displays top-level derived telemetry: clock time, active processes,
 * simulated CPU utilization, virtual memory occupancy, and overall system status.
 * Strictly adheres to the rule: NO FAKE TELEMETRY (distinguishes '—' from 0).
 */

import { Clock, Cpu, Database, HardDrive, Layers, Activity } from 'lucide-react';
import { Card, Badge } from '../../../components/common';
import type { ObservatorySnapshot } from '../../../core/models/observatory';

interface Props {
  snapshot: ObservatorySnapshot;
}

export const SystemMetricsStrip: React.FC<Props> = ({ snapshot }) => {
  const { systemStatus, systemStatusReason, process, scheduling, memory, filesystem, timestamp } = snapshot;

  const statusVariant =
    systemStatus === 'FAULT'
      ? 'danger'
      : systemStatus === 'ATTENTION'
      ? 'warning'
      : systemStatus === 'ACTIVE'
      ? 'success'
      : 'neutral';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {/* 6 Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {/* Metric 1: System Status */}
        <Card padding="sm" variant="subdued">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                SYSTEM STATUS
              </span>
              <Activity size={16} color="var(--color-accent)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '2px 0' }}>
              <Badge variant={statusVariant} size="md" dot>
                {systemStatus}
              </Badge>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={systemStatusReason}
            >
              {systemStatusReason}
            </span>
          </div>
        </Card>

        {/* Metric 2: Virtual Clock Time */}
        <Card padding="sm" variant="subdued">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                SIMULATION TIME
              </span>
              <Clock size={16} color="var(--color-accent)" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
              t = {String(timestamp).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Discrete virtual clock ticks
            </span>
          </div>
        </Card>

        {/* Metric 3: Active Processes */}
        <Card padding="sm" variant="subdued">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                TOTAL PROCESSES
              </span>
              <Layers size={16} color="var(--color-accent)" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
              {process.totalProcesses > 0 ? process.totalProcesses : '0'}
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {process.runningPid ? `Running: ${process.runningPid}` : 'CPU Idle'} · Ready: {process.readyCount}
            </span>
          </div>
        </Card>

        {/* Metric 4: Simulated CPU Utilization */}
        <Card padding="sm" variant="subdued">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                SIMULATED CPU
              </span>
              <Cpu size={16} color="var(--color-accent)" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
              {scheduling.cpuUtilization !== null ? `${scheduling.cpuUtilization}%` : '—'}
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {scheduling.hasSimulation ? `${scheduling.activeAlgorithm} simulation` : 'No simulation run'}
            </span>
          </div>
        </Card>

        {/* Metric 5: Virtual Memory Utilization */}
        <Card padding="sm" variant="subdued">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                MEMORY OCCUPANCY
              </span>
              <Database size={16} color="var(--color-accent)" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
              {memory.memoryUtilization > 0 ? `${memory.memoryUtilization}%` : '—'}
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {memory.occupiedFrames}/{memory.frameCount} frames occupied
            </span>
          </div>
        </Card>

        {/* Metric 6: Virtual Disk Allocation */}
        <Card padding="sm" variant="subdued">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                VIRTUAL STORAGE
              </span>
              <HardDrive size={16} color="var(--color-accent)" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
              {filesystem.allocatedBlocks}/{filesystem.totalBlocks} Blk
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {filesystem.freeBlocks} free · {filesystem.fileCount} file(s)
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
