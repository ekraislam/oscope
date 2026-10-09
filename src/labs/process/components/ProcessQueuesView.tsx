import React from 'react';
import type { ProcessControlBlock } from '../../../core/models/process';
import type { WaitingProcessEntry } from '../../../state/useProcessStore';
import { Card, Badge } from '../../../components/common';
import { Cpu, Layers, HardDrive, CheckCircle2 } from 'lucide-react';

interface ProcessQueuesViewProps {
  runningProcess: ProcessControlBlock | null;
  readyQueue: readonly string[];
  waitingQueue: readonly WaitingProcessEntry[];
  terminatedPids: readonly string[];
  processes: Record<string, ProcessControlBlock>;
  selectedPid: string | null;
  onSelectProcess: (pid: string) => void;
}

export const ProcessQueuesView: React.FC<ProcessQueuesViewProps> = ({
  runningProcess,
  readyQueue,
  waitingQueue,
  terminatedPids,
  processes,
  selectedPid,
  onSelectProcess,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 'var(--space-4)',
      }}
    >
      {/* 1. CPU EXECUTION CORE */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Cpu size={18} color="var(--color-success)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem' }}>
                CPU EXECUTION CORE
              </span>
            </div>
            <Badge variant={runningProcess ? 'success' : 'outline'} size="md" dot>
              {runningProcess ? 'ACTIVE' : 'IDLE'}
            </Badge>
          </div>
        }
        padding="md"
        variant={runningProcess ? 'elevated' : 'subdued'}
      >
        {runningProcess ? (
          <div
            onClick={() => onSelectProcess(runningProcess.pid)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-success-subtle)',
              border: `1px solid var(--color-success-border)`,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-success)' }}>
                {runningProcess.pid}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {runningProcess.name}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>Remaining: <strong style={{ color: 'var(--color-success)' }}>{runningProcess.remainingTime}ms</strong></span>
              <span>PC: 0x{runningProcess.registers.programCounter.toString(16).padStart(4, '0')}</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: 'var(--space-6) var(--space-4)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
              fontStyle: 'italic',
            }}
          >
            CPU Idle. Ready queue processes can be dispatched.
          </div>
        )}
      </Card>

      {/* 2. READY QUEUE */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Layers size={18} color="var(--color-ready)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem' }}>
                READY QUEUE
              </span>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-ready)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {readyQueue.length} {readyQueue.length === 1 ? 'proc' : 'procs'}
            </span>
          </div>
        }
        padding="sm"
        variant="default"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '80px' }}>
          {readyQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Queue empty
            </div>
          ) : (
            readyQueue.map((pid, idx) => {
              const proc = processes[pid];
              const isSelected = selectedPid === pid;

              return (
                <div
                  key={pid}
                  onClick={() => onSelectProcess(pid)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--color-ready-subtle)' : 'var(--color-surface-subdued)',
                    border: isSelected ? '1px solid var(--color-ready-border)' : '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                      {pid}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                      {proc?.name}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-ready)' }}>
                    {proc?.remainingTime}ms
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* 3. WAITING / I-O QUEUE */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <HardDrive size={18} color="var(--color-warning)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem' }}>
                WAITING / I-O QUEUE
              </span>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {waitingQueue.length} {waitingQueue.length === 1 ? 'proc' : 'procs'}
            </span>
          </div>
        }
        padding="sm"
        variant="default"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '80px' }}>
          {waitingQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No processes waiting for I/O
            </div>
          ) : (
            waitingQueue.map((item) => {
              const isSelected = selectedPid === item.pid;

              return (
                <div
                  key={item.pid}
                  onClick={() => onSelectProcess(item.pid)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--color-warning-subtle)' : 'var(--color-surface-subdued)',
                    border: isSelected ? '1px solid var(--color-warning-border)' : '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                      {item.pid}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      ({item.device})
                    </span>
                  </div>
                  <Badge variant="warning" size="sm">
                    {item.remainingWaitTicks} ticks left
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* 4. TERMINATED LIST */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={18} color="var(--color-text-muted)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem' }}>
                TERMINATED
              </span>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {terminatedPids.length}
            </span>
          </div>
        }
        padding="sm"
        variant="subdued"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '80px', alignContent: 'flex-start' }}>
          {terminatedPids.length === 0 ? (
            <div style={{ textAlign: 'center', width: '100%', padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No terminated processes
            </div>
          ) : (
            terminatedPids.map((pid) => (
              <span
                key={pid}
                onClick={() => onSelectProcess(pid)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedPid === pid ? 'rgba(239, 68, 68, 0.18)' : 'var(--color-surface-elevated)',
                  border: selectedPid === pid ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {pid} (✓)
              </span>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
