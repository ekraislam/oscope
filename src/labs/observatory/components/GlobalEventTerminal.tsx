/**
 * OScope — Unified Global Event Terminal Component
 * Aggregates, normalizes, filters, and searches discrete simulation events
 * across Process, CPU Scheduling, Virtual Memory, Deadlock, and File System.
 * Supports contextual direct-to-laboratory navigation.
 */

import React from 'react';
import { Link } from 'wouter';
import { Terminal, Search, ArrowUpRight } from 'lucide-react';
import { Card, Badge } from '../../../components/common';
import type { NormalizedObservatoryEvent } from '../../../core/models/observatory';
import { useObservatoryStore } from '../../../state/useObservatoryStore';

interface Props {
  events: readonly NormalizedObservatoryEvent[];
}

export const GlobalEventTerminal: React.FC<Props> = ({ events }) => {
  const eventModuleFilter = useObservatoryStore((s) => s.eventModuleFilter);
  const eventSeverityFilter = useObservatoryStore((s) => s.eventSeverityFilter);
  const eventSearchQuery = useObservatoryStore((s) => s.eventSearchQuery);
  const setEventModuleFilter = useObservatoryStore((s) => s.setEventModuleFilter);
  const setEventSeverityFilter = useObservatoryStore((s) => s.setEventSeverityFilter);
  const setEventSearchQuery = useObservatoryStore((s) => s.setEventSearchQuery);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'CPU':
        return '#38bdf8';
      case 'MEMORY':
        return '#a855f7';
      case 'DEADLOCK':
        return '#f59e0b';
      case 'FILESYSTEM':
        return '#22c55e';
      case 'PROCESS':
      default:
        return 'var(--color-accent)';
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'ERROR':
        return '#ef4444';
      case 'WARN':
        return '#f59e0b';
      case 'SUCCESS':
        return '#22c55e';
      case 'INFO':
      default:
        return 'var(--color-text-secondary)';
    }
  };

  return (
    <Card padding="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Terminal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Terminal size={18} color="var(--color-accent)" />
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                Unified Global Event Stream
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Chronologically ordered simulation telemetry collected across all five laboratory engines.
              </p>
            </div>
          </div>
          <Badge variant="outline">{events.length} Events Visible</Badge>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Module Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              MODULE:
            </span>
            {(['ALL', 'PROCESS', 'CPU', 'MEMORY', 'DEADLOCK', 'FILESYSTEM'] as const).map((mod) => (
              <button
                key={mod}
                onClick={() => setEventModuleFilter(mod)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: eventModuleFilter === mod ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  backgroundColor: eventModuleFilter === mod ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: eventModuleFilter === mod ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  transition: 'all 0.1s ease',
                }}
              >
                {mod}
              </button>
            ))}
          </div>

          {/* Severity & Search Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Severity Filter Dropdown */}
            <select
              value={eventSeverityFilter}
              onChange={(e) => setEventSeverityFilter(e.target.value as any)}
              style={{
                padding: '4px 6px',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">Severity: ALL</option>
              <option value="INFO">Severity: INFO</option>
              <option value="SUCCESS">Severity: SUCCESS</option>
              <option value="WARN">Severity: WARN</option>
              <option value="ERROR">Severity: ERROR</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={12}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: '6px', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                placeholder="Search events..."
                style={{
                  padding: '4px 8px 4px 22px',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  width: '140px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Terminal Events Log */}
        <div
          style={{
            maxHeight: '340px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          {events.length > 0 ? (
            events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  borderRadius: '2px',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(255, 255, 255, 0.015)',
                  borderLeft: `2px solid ${getSeverityColor(evt.severity)}`,
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    [t={String(evt.timestamp).padStart(2, '0')}]
                  </span>
                  <span
                    style={{
                      color: getSourceColor(evt.source),
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    [{evt.source}]
                  </span>
                  <span
                    style={{
                      color: getSeverityColor(evt.severity),
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    [{evt.type}]
                  </span>
                  <span
                    style={{
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={evt.description}
                  >
                    {evt.description}
                  </span>
                </div>

                {/* Contextual Link to Laboratory */}
                <Link href={evt.targetRoute}>
                  <button
                    title={`Inspect in ${evt.source} Lab`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      color: 'var(--color-accent)',
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>Inspect</span>
                    <ArrowUpRight size={10} />
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              No simulation events matching current filters.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
