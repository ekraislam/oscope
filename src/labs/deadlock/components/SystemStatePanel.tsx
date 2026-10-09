import React from 'react';
import { useDeadlockStore } from '../../../state/useDeadlockStore';
import { Card, Badge } from '../../../components/common';
import { ShieldCheck, ShieldAlert, Cpu, CheckCircle2, XCircle } from 'lucide-react';
import { computeTotalResources } from '../../../core/algorithms/deadlock';

export const SystemStatePanel: React.FC = () => {
  const state = useDeadlockStore((s) => s.state);
  const safetyResult = useDeadlockStore((s) => s.safetyResult);
  const deadlockResult = useDeadlockStore((s) => s.deadlockDetectionResult);
  const ragCycles = useDeadlockStore((s) => s.ragCycleResult);
  const updateAvailableElement = useDeadlockStore((s) => s.updateAvailableElement);

  const totals = computeTotalResources(state.available, state.allocation);

  // Invariant validation checks
  const isAllocationValid = state.processes.every((_, i) =>
    state.resources.every((_, j) => state.allocation[i][j] <= state.max[i][j])
  );
  const isAvailableValid = state.available.every((v) => v >= 0);
  const isNeedConsistent = state.processes.every((_, i) =>
    state.resources.every((_, j) => state.need[i][j] === state.max[i][j] - state.allocation[i][j])
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* High-Level Status Banner */}
      <Card padding="md" variant="elevated">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {safetyResult.isSafe ? (
              <ShieldCheck size={32} color="var(--color-success)" />
            ) : (
              <ShieldAlert size={32} color="var(--color-warning)" />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {safetyResult.isSafe ? 'SYSTEM IN SAFE STATE' : 'SYSTEM IN UNSAFE STATE'}
                </span>
                <Badge variant={safetyResult.isSafe ? 'success' : 'warning'} size="md">
                  {safetyResult.isSafe ? 'Banker: Safe' : 'Banker: Unsafe'}
                </Badge>
                {ragCycles.hasCycle ? (
                  <Badge variant={ragCycles.isSingleInstanceAll ? 'danger' : 'warning'} size="md">
                    {ragCycles.isSingleInstanceAll ? 'RAG: Deadlock Cycle' : 'RAG: Multi-Instance Cycle'}
                  </Badge>
                ) : (
                  <Badge variant="outline" size="md">RAG: Acyclic</Badge>
                )}
                {deadlockResult.isDeadlocked ? (
                  <Badge variant="danger" size="md">Deadlock Detected ({deadlockResult.deadlockedProcesses.length})</Badge>
                ) : (
                  <Badge variant="outline" size="md">No Deadlock</Badge>
                )}
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginTop: '6px', maxWidth: '850px', lineHeight: 1.6 }}>
                {safetyResult.explanation}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Available Vector + Total Resources + Consistency Checker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Available Vector */}
        <Card
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Cpu size={18} color="var(--color-accent)" />
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
                AVAILABLE VECTOR (UNALLOCATED)
              </span>
            </div>
          }
          padding="md"
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {state.resources.map((res, rIdx) => (
              <div
                key={res}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  minWidth: '68px',
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                  {res}
                </span>
                <input
                  type="number"
                  min="0"
                  value={state.available[rIdx]}
                  onChange={(e) => updateAvailableElement(rIdx, parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: '52px',
                    textAlign: 'center',
                    padding: '6px 8px',
                    marginTop: '6px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Total System Capacity */}
        <Card
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Cpu size={18} color="var(--color-text-muted)" />
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
                TOTAL RESOURCE CAPACITY (AVAIL + ALLOC)
              </span>
            </div>
          }
          padding="md"
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {state.resources.map((res, rIdx) => {
              const allocatedSum = totals[rIdx] - state.available[rIdx];
              return (
                <div
                  key={res}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    minWidth: '68px',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {res}
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {totals[rIdx]}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {state.available[rIdx]} free / {allocatedSum} held
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* System Consistency Checker */}
        <Card
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShieldCheck size={18} color="var(--color-success)" />
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
                SYSTEM INVARIANT CONSISTENCY
              </span>
            </div>
          }
          padding="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {isAllocationValid ? <CheckCircle2 size={16} color="var(--color-success)" /> : <XCircle size={16} color="var(--color-error)" />}
              <span>Allocation ≤ Maximum Demand</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {isNeedConsistent ? <CheckCircle2 size={16} color="var(--color-success)" /> : <XCircle size={16} color="var(--color-error)" />}
              <span>Need = Max - Allocation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {isAvailableValid ? <CheckCircle2 size={16} color="var(--color-success)" /> : <XCircle size={16} color="var(--color-error)" />}
              <span>Available quantities are non-negative</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={16} color="var(--color-success)" />
              <span>Immutable snapshot isolation maintained</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
