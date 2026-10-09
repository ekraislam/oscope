import React from 'react';
import { useDeadlockStore } from '../../../state/useDeadlockStore';
import { Card, Badge, Button } from '../../../components/common';
import { Send, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

export const ResourceRequestBuilder: React.FC = () => {
  const state = useDeadlockStore((s) => s.state);
  const selectedProcessId = useDeadlockStore((s) => s.selectedProcessId);
  const requestVector = useDeadlockStore((s) => s.requestVector);
  const requestResult = useDeadlockStore((s) => s.requestResult);
  const setSelectedProcessId = useDeadlockStore((s) => s.setSelectedProcessId);
  const setRequestVectorElement = useDeadlockStore((s) => s.setRequestVectorElement);
  const evaluateRequest = useDeadlockStore((s) => s.evaluateRequest);
  const applyGrantedRequest = useDeadlockStore((s) => s.applyGrantedRequest);

  const pIdx = state.processes.indexOf(selectedProcessId);
  const currentNeed = pIdx !== -1 ? state.need[pIdx] : [];
  const currentAlloc = pIdx !== -1 ? state.allocation[pIdx] : [];

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Send size={16} color="var(--color-accent)" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              RESOURCE-REQUEST ALGORITHM SIMULATOR
            </span>
          </div>
          <Badge variant="outline" size="sm">
            Provisional Safety Evaluation
          </Badge>
        </div>
      }
      padding="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Process Selection & Vector Input Form */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          {/* Select Process */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              REQUESTING PROCESS
            </label>
            <select
              value={selectedProcessId}
              onChange={(e) => setSelectedProcessId(e.target.value)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                minWidth: '100px',
              }}
            >
              {state.processes.map((pid) => (
                <option key={pid} value={pid}>
                  {pid}
                </option>
              ))}
            </select>
          </div>

          {/* Current Process Context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '6px 12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                CURRENT ALLOCATION:{' '}
              </span>
              <strong style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                [{currentAlloc.join(', ')}]
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                REMAINING NEED:{' '}
              </span>
              <strong style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                [{currentNeed.join(', ')}]
              </strong>
            </div>
          </div>

          {/* Request Vector Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              REQUEST VECTOR:
            </span>
            {state.resources.map((res, rIdx) => (
              <div key={res} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                  {res}:
                </span>
                <input
                  type="number"
                  min="0"
                  value={requestVector[rIdx] ?? 0}
                  onChange={(e) => setRequestVectorElement(rIdx, parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: '42px',
                    textAlign: 'center',
                    padding: '4px',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                  }}
                />
              </div>
            ))}
          </div>

          <Button variant="primary" size="md" icon={<Send size={14} />} onClick={evaluateRequest}>
            Evaluate Request
          </Button>
        </div>

        {/* Evaluation Decision Card */}
        {requestResult && (
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: requestResult.granted
                ? '1px solid rgba(34, 197, 94, 0.4)'
                : '1px solid rgba(239, 68, 68, 0.4)',
              backgroundColor: requestResult.granted
                ? 'rgba(34, 197, 94, 0.08)'
                : 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {requestResult.granted ? (
                  <ShieldCheck size={24} color="var(--color-success)" />
                ) : (
                  <ShieldAlert size={24} color="var(--color-error)" />
                )}
                <div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {requestResult.granted ? 'REQUEST GRANTED' : 'REQUEST DENIED'}
                  </span>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {requestResult.reason}
                  </p>
                </div>
              </div>

              {requestResult.granted && (
                <Button variant="secondary" size="sm" icon={<ArrowRight size={14} />} onClick={applyGrantedRequest}>
                  Apply to Current System State
                </Button>
              )}
            </div>

            {/* 3-Constraint Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              {/* Check 1: Need */}
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    1. NEED CONSTRAINT
                  </span>
                  {requestResult.checkDetails.needCheckPassed ? (
                    <Badge variant="success" size="sm">PASS</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">FAIL</Badge>
                  )}
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {requestResult.checkDetails.needCheckReason}
                </p>
              </div>

              {/* Check 2: Available */}
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    2. AVAILABLE CONSTRAINT
                  </span>
                  {requestResult.checkDetails.availableCheckPassed ? (
                    <Badge variant="success" size="sm">PASS</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">FAIL</Badge>
                  )}
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {requestResult.checkDetails.availableCheckReason}
                </p>
              </div>

              {/* Check 3: Safety */}
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    3. SAFETY CONSTRAINT
                  </span>
                  {requestResult.checkDetails.safetyCheckPassed ? (
                    <Badge variant="success" size="sm">PASS</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">FAIL</Badge>
                  )}
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {requestResult.checkDetails.safetyCheckReason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
