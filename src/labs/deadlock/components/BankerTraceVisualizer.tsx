import React from 'react';
import { useDeadlockStore } from '../../../state/useDeadlockStore';
import { Card, Badge, Button } from '../../../components/common';
import { CheckCircle2, XCircle, ArrowRight, SkipBack, SkipForward, Play, Pause, RotateCcw } from 'lucide-react';

export const BankerTraceVisualizer: React.FC = () => {
  const safetyResult = useDeadlockStore((s) => s.safetyResult);
  const playbackStep = useDeadlockStore((s) => s.playbackStep);
  const isPlaying = useDeadlockStore((s) => s.isPlaying);
  const stepForward = useDeadlockStore((s) => s.stepForward);
  const stepBackward = useDeadlockStore((s) => s.stepBackward);
  const togglePlay = useDeadlockStore((s) => s.togglePlay);
  const setPlaybackStep = useDeadlockStore((s) => s.setPlaybackStep);

  const steps = safetyResult.steps;
  const currentStep = steps[playbackStep] ?? steps[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Safe Sequence Banner */}
      <Card padding="md" variant="subdued">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              SAFE SEQUENCE:
            </span>
            {safetyResult.isSafe ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {safetyResult.safeSequence.map((pid, idx) => (
                  <React.Fragment key={pid}>
                    <Badge variant="success" size="md">
                      {pid}
                    </Badge>
                    {idx < safetyResult.safeSequence.length - 1 && (
                      <ArrowRight size={16} color="var(--color-text-muted)" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <Badge variant="warning" size="md">
                NO COMPLETE SAFE SEQUENCE (UNSAFE STATE)
              </Badge>
            )}
          </div>

          {/* Step Controls */}
          {steps.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Button
                variant="outline"
                size="md"
                icon={<RotateCcw size={16} />}
                onClick={() => setPlaybackStep(0)}
                title="Reset to step 1"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={<SkipBack size={16} />}
                onClick={stepBackward}
                disabled={playbackStep === 0}
              >
                Step Back
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
                onClick={togglePlay}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={<SkipForward size={16} />}
                onClick={stepForward}
                disabled={playbackStep >= steps.length - 1}
              >
                Step Forward
              </Button>
              <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontWeight: 700, marginLeft: 'var(--space-2)' }}>
                Step {playbackStep + 1} of {steps.length}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Active Step Telemetry Card */}
      {currentStep && (
        <Card
          header={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Badge variant={currentStep.canAllocate ? 'success' : 'danger'} size="md">
                  Step {currentStep.stepNumber}
                </Badge>
                <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
                  Evaluating Process {currentStep.processId}
                </span>
              </div>
              <Badge variant={currentStep.canAllocate ? 'success' : 'warning'} size="md">
                {currentStep.canAllocate ? 'Need ≤ Work (Pass)' : 'Need > Work (Fail)'}
              </Badge>
            </div>
          }
          padding="md"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                WORK VECTOR BEFORE
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                [{currentStep.workVectorBefore.join(', ')}]
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                NEED OF {currentStep.processId}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                [{currentStep.needVector.join(', ')}]
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                ALLOCATION RECLAIMED
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
                {currentStep.canAllocate ? `+ [${currentStep.allocationVector.join(', ')}]` : 'None (Blocked)'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                WORK VECTOR AFTER
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                [{currentStep.workVectorAfter.join(', ')}]
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: '12px 16px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>Decision Reason: </strong>
            {currentStep.explanation}
          </div>
        </Card>
      )}

      {/* Full Step History Table */}
      <Card
        header={
          <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
            COMPLETE BANKER SAFETY STEP TRACE
          </span>
        }
        padding="none"
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subdued)', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>#</th>
                <th style={{ padding: '12px 14px' }}>Process</th>
                <th style={{ padding: '12px 14px' }}>Work Before</th>
                <th style={{ padding: '12px 14px' }}>Need</th>
                <th style={{ padding: '12px 14px' }}>Need ≤ Work</th>
                <th style={{ padding: '12px 14px' }}>Alloc Reclaimed</th>
                <th style={{ padding: '12px 14px' }}>Work After</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((st, idx) => (
                <tr
                  key={st.stepNumber}
                  onClick={() => setPlaybackStep(idx)}
                  style={{
                    borderBottom: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                    backgroundColor: idx === playbackStep ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    transition: 'background var(--transition-fast)',
                  }}
                  className="hover-subtle"
                >
                  <td style={{ padding: '12px 14px', color: 'var(--color-text-muted)' }}>{st.stepNumber}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{st.processId}</td>
                  <td style={{ padding: '12px 14px' }}>[{st.workVectorBefore.join(', ')}]</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-accent)', fontWeight: 700 }}>[{st.needVector.join(', ')}]</td>
                  <td style={{ padding: '12px 14px' }}>
                    {st.canAllocate ? (
                      <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        <CheckCircle2 size={16} /> Pass
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        <XCircle size={16} /> Fail
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-success)', fontWeight: 700 }}>
                    {st.canAllocate ? `+ [${st.allocationVector.join(', ')}]` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>[{st.workVectorAfter.join(', ')}]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
