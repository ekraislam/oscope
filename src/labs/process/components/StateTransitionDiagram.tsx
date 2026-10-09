import React from 'react';
import type { ProcessState } from '../../../core/models/process';
import { Badge } from '../../../components/common';

interface StateTransitionDiagramProps {
  activeState: ProcessState | null;
  stateCounts: Record<ProcessState, number>;
  onSelectStateFilter?: (state: ProcessState) => void;
}

export const StateTransitionDiagram: React.FC<StateTransitionDiagramProps> = ({
  activeState,
  stateCounts,
}) => {
  const states: Array<{
    id: ProcessState;
    name: string;
    description: string;
    color: string;
    bgSubtle: string;
    border: string;
    count: number;
    badgeVariant: 'outline' | 'info' | 'ready' | 'warning' | 'danger' | 'success';
  }> = [
    {
      id: 'NEW',
      name: 'NEW',
      description: 'Process being initialized in RAM',
      color: 'var(--color-text-secondary)',
      bgSubtle: 'var(--color-surface-elevated)',
      border: 'var(--color-border)',
      count: stateCounts.NEW ?? 0,
      badgeVariant: 'outline',
    },
    {
      id: 'READY',
      name: 'READY',
      description: 'In Ready Queue, awaiting CPU dispatch',
      color: 'var(--color-ready)',
      bgSubtle: 'var(--color-ready-subtle)',
      border: 'var(--color-ready-border)',
      count: stateCounts.READY ?? 0,
      badgeVariant: 'ready',
    },
    {
      id: 'RUNNING',
      name: 'RUNNING',
      description: 'Actively executing instructions on CPU',
      color: 'var(--color-success)',
      bgSubtle: 'var(--color-success-subtle)',
      border: 'var(--color-success-border)',
      count: stateCounts.RUNNING ?? 0,
      badgeVariant: 'success',
    },
    {
      id: 'WAITING',
      name: 'WAITING',
      description: 'Blocked waiting for I/O completion',
      color: 'var(--color-warning)',
      bgSubtle: 'var(--color-warning-subtle)',
      border: 'var(--color-warning-border)',
      count: stateCounts.WAITING ?? 0,
      badgeVariant: 'warning',
    },
    {
      id: 'TERMINATED',
      name: 'TERMINATED',
      description: 'Execution finished, PCB resources released',
      color: 'var(--color-text-muted)',
      bgSubtle: 'var(--color-surface-subdued)',
      border: 'var(--color-border)',
      count: stateCounts.TERMINATED ?? 0,
      badgeVariant: 'outline',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '0.02em' }}>
            5-STATE LIFECYCLE MACHINE
          </span>
          <Badge variant="outline" size="md">
            Silberschatz Standard
          </Badge>
        </div>
        {activeState && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Selected Process State:</span>
            <Badge variant="info" size="md" dot>
              {activeState}
            </Badge>
          </div>
        )}
      </div>

      {/* State Machine Visual Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-2)',
        }}
      >
        {states.map((st) => {
          const isSelected = activeState === st.id;

          return (
            <div
              key={st.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isSelected ? st.bgSubtle : 'var(--color-surface-elevated)',
                border: isSelected ? `2.5px solid ${st.color}` : `1px solid var(--color-border)`,
                boxShadow: isSelected ? `0 0 16px ${st.bgSubtle}` : 'none',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: isSelected ? st.color : 'var(--color-text-primary)',
                  }}
                >
                  {st.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface-subdued)',
                    border: '1px solid var(--color-border)',
                    color: st.count > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  }}
                >
                  {st.count} {st.count === 1 ? 'proc' : 'procs'}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.45,
                  margin: 0,
                }}
              >
                {st.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Transition Arcs Indicator */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-2)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--color-border-subtle)',
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
        }}
      >
        <span style={{ fontWeight: 600 }}>Valid Transitions:</span>
        <span style={{ color: 'var(--color-ready)', backgroundColor: 'var(--color-ready-subtle)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
          NEW → READY
        </span>
        <span style={{ color: 'var(--color-success)', backgroundColor: 'var(--color-success-subtle)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
          READY → RUNNING
        </span>
        <span style={{ color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-subtle)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
          RUNNING → WAITING
        </span>
        <span style={{ color: 'var(--color-ready)', backgroundColor: 'var(--color-ready-subtle)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
          WAITING → READY
        </span>
        <span style={{ color: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
          RUNNING → TERMINATED
        </span>
      </div>
    </div>
  );
};
