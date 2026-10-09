import React from 'react';
import { useDeadlockStore } from '../../../state/useDeadlockStore';
import { Card, Badge } from '../../../components/common';
import { Table, AlertCircle } from 'lucide-react';

export const MatrixEditor: React.FC = () => {
  const state = useDeadlockStore((s) => s.state);
  const validationError = useDeadlockStore((s) => s.validationError);
  const updateMaxCell = useDeadlockStore((s) => s.updateMaxCell);
  const updateAllocationCell = useDeadlockStore((s) => s.updateAllocationCell);

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Table size={18} color="var(--color-accent)" />
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
              RESOURCE ALLOCATION MATRICES
            </span>
          </div>
          <Badge variant="outline" size="md">
            Live Derived: Need = Max - Allocation
          </Badge>
        </div>
      }
      padding="md"
    >
      {validationError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '10px 14px',
            marginBottom: 'var(--space-4)',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-error)',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Maximum Claim Matrix (Max) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
              MAXIMUM CLAIM (MAX)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Editable</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subdued)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>Proc</th>
                  {state.resources.map((res) => (
                    <th key={res} style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--color-accent)', fontSize: '0.8125rem' }}>
                      {res}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.processes.map((pid, pIdx) => (
                  <tr key={pid} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{pid}</td>
                    {state.resources.map((res, rIdx) => (
                      <td key={res} style={{ padding: '6px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          value={state.max[pIdx][rIdx]}
                          onChange={(e) => updateMaxCell(pIdx, rIdx, parseInt(e.target.value, 10) || 0)}
                          style={{
                            width: '48px',
                            textAlign: 'center',
                            padding: '6px',
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Allocation Matrix (Allocation) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
              CURRENT ALLOCATION
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Editable</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subdued)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>Proc</th>
                  {state.resources.map((res) => (
                    <th key={res} style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--color-accent)', fontSize: '0.8125rem' }}>
                      {res}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.processes.map((pid, pIdx) => (
                  <tr key={pid} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{pid}</td>
                    {state.resources.map((res, rIdx) => {
                      const allocVal = state.allocation[pIdx][rIdx];
                      const maxVal = state.max[pIdx][rIdx];
                      const isExcessive = allocVal > maxVal;
                      return (
                        <td key={res} style={{ padding: '6px', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            value={allocVal}
                            onChange={(e) => updateAllocationCell(pIdx, rIdx, parseInt(e.target.value, 10) || 0)}
                            style={{
                              width: '48px',
                              textAlign: 'center',
                              padding: '6px',
                              backgroundColor: isExcessive ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-bg)',
                              border: isExcessive ? '1px solid var(--color-error)' : '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              color: isExcessive ? 'var(--color-error)' : 'var(--color-text-primary)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Derived Remaining Need Matrix (Need = Max - Allocation) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
              REMAINING NEED (NEED = MAX - ALLOC)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Auto-Derived</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subdued)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>Proc</th>
                  {state.resources.map((res) => (
                    <th key={res} style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--color-accent)', fontSize: '0.8125rem' }}>
                      {res}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.processes.map((pid, pIdx) => (
                  <tr key={pid} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{pid}</td>
                    {state.resources.map((res, rIdx) => {
                      const needVal = state.need[pIdx][rIdx];
                      return (
                        <td key={res} style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-accent)',
                              fontWeight: 700,
                            }}
                          >
                            {needVal}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
};
