import React from 'react';
import type { PageReplacementComparisonResult, ReplacementAlgorithm } from '../../../core/algorithms/memory';
import { Card, Badge, Button } from '../../../components/common';
import { Scale, Info, Play } from 'lucide-react';

interface MemoryComparisonViewProps {
  comparison: PageReplacementComparisonResult;
  selectedAlgorithm: ReplacementAlgorithm;
  onSelectAlgorithm: (algo: ReplacementAlgorithm) => void;
}

export const MemoryComparisonView: React.FC<MemoryComparisonViewProps> = ({
  comparison,
  selectedAlgorithm,
  onSelectAlgorithm,
}) => {
  const { rows, lowestFaultAlgorithm, referenceString, frameCount, fairnessNotice } = comparison;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Fairness & Context Notice */}
      <Card padding="md" variant="subdued">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Scale size={16} color="var(--color-accent)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                CONTROLLED PAGE REPLACEMENT COMPARISON
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Badge variant="outline" size="sm">
                {referenceString.length} References
              </Badge>
              <Badge variant="outline" size="sm">
                {frameCount} Physical Frames
              </Badge>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {fairnessNotice}
          </p>

          <div
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            Reference Sequence: [{referenceString.join(', ')}]
          </div>
        </div>
      </Card>

      {/* Comparison Summary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {rows.map((row) => {
          const isLowest = row.algorithm === lowestFaultAlgorithm.algorithm;
          const isSelected = selectedAlgorithm === row.algorithm;

          return (
            <div
              key={row.algorithm}
              onClick={() => onSelectAlgorithm(row.algorithm)}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--color-surface)',
                border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text)' }}>
                  {row.algorithm}
                </span>
                {isLowest && (
                  <Badge variant="success" size="sm">
                    Lowest Faults ★
                  </Badge>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: isLowest ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                >
                  {row.totalFaults}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Faults ({row.faultRate.toFixed(1)}%)
                </span>
              </div>

              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                Hits: <strong>{row.totalHits}</strong> ({row.hitRate.toFixed(1)}% hit rate)
              </div>

              <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: '0.6875rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                {row.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              ALGORITHM BENCHMARK MATRIX
            </span>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Lowest faults highlighted with ★
            </span>
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
                <th style={{ padding: '8px 12px' }}>Algorithm</th>
                <th style={{ padding: '8px 12px' }}>Type</th>
                <th style={{ padding: '8px 12px' }}>Page Faults</th>
                <th style={{ padding: '8px 12px' }}>Fault Rate</th>
                <th style={{ padding: '8px 12px' }}>Page Hits</th>
                <th style={{ padding: '8px 12px' }}>Hit Rate</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isLowest = row.algorithm === lowestFaultAlgorithm.algorithm;
                const isSelected = selectedAlgorithm === row.algorithm;

                return (
                  <tr
                    key={row.algorithm}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                      fontFamily: 'var(--font-mono)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: isSelected ? 'var(--color-accent)' : 'var(--color-text)' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: row.isTheoretical ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: row.isTheoretical ? 'var(--color-info)' : 'var(--color-accent)',
                        }}
                      >
                        {row.isTheoretical ? 'Theoretical' : 'Practical'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: isLowest ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: isLowest ? 700 : 400 }}>
                        {row.totalFaults}
                      </span>
                      {isLowest && <span style={{ marginLeft: '4px', color: 'var(--color-success)' }}>★</span>}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>
                      {row.faultRate.toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                      {row.totalHits}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>
                      {row.hitRate.toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <Button
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        icon={<Play size={12} />}
                        onClick={() => onSelectAlgorithm(row.algorithm)}
                      >
                        {isSelected ? 'Viewing' : 'Inspect'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Academic Takeaway Note */}
      <div
        style={{
          padding: 'var(--space-3)',
          backgroundColor: 'var(--color-surface-subdued)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-2)',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        <Info size={15} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--color-text)' }}>Academic Takeaway:</strong> The Optimal algorithm provides the
          provably minimal number of page faults on any given reference string by utilizing future oracle knowledge. Real
          operating systems cannot forecast the future, so LRU serves as the gold-standard approximation utilizing past
          temporal locality. In systems without hardware stack counters, Second-Chance / Clock algorithms approximate LRU.
        </div>
      </div>
    </div>
  );
};
