import React from 'react';
import { useDeadlockStore } from '../../../state/useDeadlockStore';
import { Card, Badge, Button } from '../../../components/common';
import { Search, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const DeadlockDetectionPanel: React.FC = () => {
  const deadlockResult = useDeadlockStore((s) => s.deadlockDetectionResult);
  const runDetection = useDeadlockStore((s) => s.runDetection);

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Search size={16} color="var(--color-accent)" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              MULTI-INSTANCE DEADLOCK DETECTION ENGINE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Badge variant={deadlockResult.isDeadlocked ? 'danger' : 'success'}>
              {deadlockResult.isDeadlocked ? 'Deadlock Detected' : 'No Deadlock Present'}
            </Badge>
            <Button variant="outline" size="sm" icon={<Search size={14} />} onClick={runDetection}>
              Re-Scan System
            </Button>
          </div>
        </div>
      }
      padding="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Academic Comparison Banner */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-accent)' }}>Banker Avoidance vs Deadlock Detection: </strong>
          Banker’s algorithm is a <em>preventative avoidance</em> technique that tests hypothetical future maximum claims (
          <code>Need ≤ Work</code>). In contrast, the Deadlock Detection engine evaluates <em>actual current requests</em> (
          <code>Request ≤ Work</code>) to detect processes already trapped in circular blockage.
        </div>

        {/* Status Card */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: deadlockResult.isDeadlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.08)',
            border: deadlockResult.isDeadlocked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
          }}
        >
          {deadlockResult.isDeadlocked ? (
            <AlertOctagon size={24} color="var(--color-error)" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <CheckCircle2 size={24} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {deadlockResult.isDeadlocked ? 'DEADLOCK CONFIRMED' : 'NO DEADLOCK IN CURRENT STATE'}
            </span>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {deadlockResult.explanation}
            </p>

            {deadlockResult.isDeadlocked && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  Deadlocked Processes:
                </span>
                {deadlockResult.deadlockedProcesses.map((p) => (
                  <Badge key={p} variant="danger" size="sm">
                    {p}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step-by-Step Detection Trace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            DETECTION RESOLUTION STEPS
          </span>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Process</th>
                  <th style={{ padding: '8px' }}>Work Before</th>
                  <th style={{ padding: '8px' }}>Request</th>
                  <th style={{ padding: '8px' }}>Status</th>
                  <th style={{ padding: '8px' }}>Alloc Released</th>
                  <th style={{ padding: '8px' }}>Work After</th>
                </tr>
              </thead>
              <tbody>
                {deadlockResult.steps.map((st) => (
                  <tr key={st.stepNumber} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px', color: 'var(--color-text-muted)' }}>{st.stepNumber}</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{st.processId}</td>
                    <td style={{ padding: '8px' }}>[{st.workBefore.join(', ')}]</td>
                    <td style={{ padding: '8px', color: 'var(--color-accent)' }}>[{st.requestVector.join(', ')}]</td>
                    <td style={{ padding: '8px' }}>
                      {st.canFinish ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Finished</span>
                      ) : (
                        <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>Blocked (Deadlocked)</span>
                      )}
                    </td>
                    <td style={{ padding: '8px', color: 'var(--color-success)' }}>
                      {st.canFinish ? `+ [${st.allocationVector.join(', ')}]` : '-'}
                    </td>
                    <td style={{ padding: '8px' }}>[{st.workAfter.join(', ')}]</td>
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
