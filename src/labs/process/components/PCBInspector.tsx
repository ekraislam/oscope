import React from 'react';
import type { ProcessControlBlock } from '../../../core/models/process';
import { Card, Badge, EmptyState } from '../../../components/common';
import { formatHexAddress } from '../../../core/utils/formatters';
import { Cpu, HardDrive, Clock, FileCode, Layers } from 'lucide-react';

interface PCBInspectorProps {
  process: ProcessControlBlock | null;
}

export const PCBInspector: React.FC<PCBInspectorProps> = ({ process }) => {
  if (!process) {
    return (
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileCode size={18} color="var(--color-accent)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9375rem' }}>
              PROCESS CONTROL BLOCK (PCB)
            </span>
          </div>
        }
        padding="md"
        variant="subdued"
      >
        <EmptyState
          icon={<Layers size={28} />}
          title="No Process Selected"
          description="Select a process from the table or creation deck to inspect its hardware registers, address limits, and runtime timing metrics."
        />
      </Card>
    );
  }

  const stateBadgeVariants: Record<string, 'outline' | 'info' | 'ready' | 'warning' | 'danger' | 'success'> = {
    NEW: 'outline',
    READY: 'ready',
    RUNNING: 'success',
    WAITING: 'warning',
    TERMINATED: 'danger',
  };

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileCode size={18} color="var(--color-accent)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '0.02em' }}>
              PCB INSPECTOR: {process.pid}
            </span>
          </div>
          <Badge variant={stateBadgeVariants[process.state] ?? 'outline'} size="md" dot>
            {process.state}
          </Badge>
        </div>
      }
      padding="md"
      variant="default"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Section 1: Process Identity */}
        <div>
          <span
            style={{
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            1. Process Identity & Descriptor
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
              backgroundColor: 'var(--color-surface-subdued)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>PID:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-accent)' }}>
                {process.pid}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Name:</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {process.name}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Priority:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {process.priority}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Open Files:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {process.openFiles.length > 0 ? process.openFiles.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: CPU Registers Context */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Cpu size={16} color="var(--color-accent)" />
            <span
              style={{
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              2. CPU Register Context
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
              backgroundColor: 'var(--color-surface-subdued)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>PC:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                {formatHexAddress(process.registers.programCounter)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>ACC:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {process.registers.accumulator}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>BASE:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                {formatHexAddress(process.registers.baseRegister)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>LIMIT:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                {formatHexAddress(process.registers.limitRegister)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Timing Accounting */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={16} color="var(--color-ready)" />
            <span
              style={{
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              3. Timing Accounting
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
              backgroundColor: 'var(--color-surface-subdued)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Arrival:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{process.arrivalTime} ms</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Burst:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{process.burstTime} ms</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Remaining:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: process.remainingTime === 0 ? 'var(--color-success)' : 'var(--color-accent)' }}>
                {process.remainingTime} ms
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Start:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                {process.startTime !== null ? `${process.startTime} ms` : '—'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Completion:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                {process.completionTime !== null ? `${process.completionTime} ms` : '—'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Waiting:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{process.waitingTime} ms</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Turnaround:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{process.turnaroundTime} ms</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Response:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{process.responseTime} ms</span>
            </div>
          </div>
        </div>

        {/* Section 4: I/O Burst Configuration */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <HardDrive size={16} color="var(--color-warning)" />
            <span
              style={{
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              4. I/O Burst Profile
            </span>
          </div>
          <div
            style={{
              marginTop: 'var(--space-2)',
              backgroundColor: 'var(--color-surface-subdued)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.875rem',
            }}
          >
            {process.ioBursts.length === 0 ? (
              <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                Pure CPU-bound process (No I/O bursts configured)
              </span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {process.ioBursts.map((io, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      padding: '4px 0',
                    }}
                  >
                    <span>
                      Trigger at CPU Time: <strong style={{ color: 'var(--color-accent)' }}>{io.startAtCPUTime}ms</strong>
                    </span>
                    <span>
                      Duration: <strong style={{ color: 'var(--color-warning)' }}>{io.duration}ms</strong>
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      Device: {io.device ?? 'Storage I/O'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
