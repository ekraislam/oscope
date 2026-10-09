import React from 'react';
import type { TLBState } from '../../../core/algorithms/memory';
import { Card, Badge } from '../../../components/common';
import { Zap } from 'lucide-react';

interface TLBViewProps {
  tlb: TLBState;
  activePageNumber: number | null;
  isHit: boolean;
}

export const TLBView: React.FC<TLBViewProps> = ({
  tlb,
  activePageNumber,
  isHit,
}) => {
  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Zap size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              TRANSLATION LOOKASIDE BUFFER (TLB)
            </span>
          </div>
          <Badge variant="outline" size="sm">
            {tlb.entries.length}/{tlb.capacity} Slots (LRU)
          </Badge>
        </div>
      }
      padding="none"
      variant="default"
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-surface-subdued)',
                borderBottom: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
              }}
            >
              <th style={{ padding: '6px 12px' }}>Slot</th>
              <th style={{ padding: '6px 12px' }}>Page #</th>
              <th style={{ padding: '6px 12px' }}>Frame #</th>
              <th style={{ padding: '6px 12px' }}>Last Used</th>
              <th style={{ padding: '6px 12px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tlb.entries.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  TLB is currently empty (Cold cache).
                </td>
              </tr>
            ) : (
              tlb.entries.map((entry, idx) => {
                const isMatched = activePageNumber === entry.pageNumber;

                return (
                  <tr
                    key={entry.pageNumber}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: isMatched && isHit
                        ? 'rgba(16, 185, 129, 0.12)'
                        : isMatched
                        ? 'rgba(6, 182, 212, 0.08)'
                        : 'transparent',
                      fontFamily: 'var(--font-mono)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '6px 12px', color: 'var(--color-text-muted)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '6px 12px', fontWeight: 700, color: 'var(--color-accent)' }}>
                      Page {entry.pageNumber}
                    </td>
                    <td style={{ padding: '6px 12px', fontWeight: 600 }}>
                      Frame {entry.frameNumber}
                    </td>
                    <td style={{ padding: '6px 12px', color: 'var(--color-text-secondary)' }}>
                      t={entry.lastUsedTime}
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      {isMatched && isHit ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.6875rem' }}>
                          HIT ✓
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem' }}>
                          Cached
                        </span>
                      )}
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
