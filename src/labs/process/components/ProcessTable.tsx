import React from 'react';
import type { ProcessControlBlock } from '../../../core/models/process';
import { Card, Badge, Button } from '../../../components/common';
import { Layers, Plus } from 'lucide-react';

interface ProcessTableProps {
  processes: ProcessControlBlock[];
  selectedPid: string | null;
  onSelectProcess: (pid: string) => void;
  onOpenCreateModal: () => void;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({
  processes,
  selectedPid,
  onSelectProcess,
  onOpenCreateModal,
}) => {
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
            <Layers size={18} color="var(--color-ready)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem' }}>
              ACTIVE PROCESS TABLE
            </span>
            <Badge variant="outline" size="md">
              {processes.length} {processes.length === 1 ? 'Process' : 'Processes'}
            </Badge>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={onOpenCreateModal}
          >
            Create Process
          </Button>
        </div>
      }
      padding="none"
      variant="default"
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-subdued)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <th style={{ padding: '12px 16px' }}>PID</th>
              <th style={{ padding: '12px 16px' }}>Process Name</th>
              <th style={{ padding: '12px 16px' }}>State</th>
              <th style={{ padding: '12px 16px' }}>Arrival</th>
              <th style={{ padding: '12px 16px' }}>Burst</th>
              <th style={{ padding: '12px 16px' }}>Remaining</th>
              <th style={{ padding: '12px 16px' }}>Priority</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 'var(--space-8) var(--space-4)',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.9375rem',
                    fontStyle: 'italic',
                  }}
                >
                  No processes registered. Click "Create Process" or "Load Demo Preset" to populate.
                </td>
              </tr>
            ) : (
              processes.map((proc) => {
                const isSelected = selectedPid === proc.pid;

                return (
                  <tr
                    key={proc.pid}
                    onClick={() => onSelectProcess(proc.pid)}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected
                        ? 'rgba(56, 189, 248, 0.1)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-accent)' }}>
                      {proc.pid}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {proc.name}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={stateBadgeVariants[proc.state] ?? 'outline'} size="md" dot>
                        {proc.state}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {proc.arrivalTime} ms
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {proc.burstTime} ms
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      <span style={{ color: proc.remainingTime === 0 ? 'var(--color-success)' : 'var(--color-accent)' }}>
                        {proc.remainingTime} ms
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {proc.priority}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProcess(proc.pid);
                        }}
                      >
                        {isSelected ? 'Inspecting' : 'Inspect'}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
