import React from 'react';
import type { SimulationEvent } from '../../../core/models/simulation';
import { Card, Badge } from '../../../components/common';
import { Terminal, ScrollText } from 'lucide-react';
import { formatSimulationTime } from '../../../core/utils/formatters';

interface ProcessEventLogProps {
  events: readonly SimulationEvent[];
}

export const ProcessEventLog: React.FC<ProcessEventLogProps> = ({ events }) => {
  const severityColors: Record<string, string> = {
    INFO: 'var(--color-accent)',
    SUCCESS: 'var(--color-success)',
    WARN: 'var(--color-warning)',
    ERROR: 'var(--color-danger)',
  };

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Terminal size={18} color="var(--color-accent)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem' }}>
              KERNEL EVENT LOG & SYSLOG
            </span>
          </div>
          <Badge variant="outline" size="md">
            {events.length} Events
          </Badge>
        </div>
      }
      padding="none"
      variant="default"
    >
      <div
        style={{
          maxHeight: '240px',
          overflowY: 'auto',
          backgroundColor: 'var(--color-surface-subdued)',
          padding: 'var(--space-3) var(--space-4)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {events.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: '0.875rem',
            }}
          >
            <ScrollText size={22} />
            <span>Event log empty. Actions and lifecycle transitions will appear here.</span>
          </div>
        ) : (
          events.slice(0, 50).map((evt) => (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--space-2)',
                lineHeight: 1.5,
                padding: '3px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                [{formatSimulationTime(evt.timestamp)}]
              </span>
              <span
                style={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                [{evt.sourceModule}]
              </span>
              <span
                style={{
                  color: severityColors[evt.severity] ?? 'var(--color-text-primary)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {evt.type}:
              </span>
              <span style={{ color: 'var(--color-text-primary)' }}>{evt.description}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
