import React, { useEffect, useState } from 'react';
import type { SchedulingSnapshot } from '../../../core/models';
import { Card, Button, Badge } from '../../../components/common';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Activity,
  Layers,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface DecisionTracePanelProps {
  snapshots: readonly SchedulingSnapshot[];
  currentIndex: number;
  onGoToSnapshot: (index: number) => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
}

export const DecisionTracePanel: React.FC<DecisionTracePanelProps> = ({
  snapshots,
  currentIndex,
  onGoToSnapshot,
  onStepForward,
  onStepBack,
  onReset,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1000);

  // Playback timer effect
  useEffect(() => {
    if (!isPlaying) return;

    if (currentIndex >= snapshots.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      onStepForward();
    }, speedMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, snapshots.length, speedMs, onStepForward]);

  if (!snapshots || snapshots.length === 0) {
    return (
      <Card padding="md" variant="subdued">
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
          No simulation snapshots available. Run a simulation to view step-by-step decision traces.
        </div>
      </Card>
    );
  }

  const current = snapshots[currentIndex] || snapshots[0];
  const totalSnapshots = snapshots.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSnapshots - 1;

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Activity size={18} color="var(--color-accent)" />
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              DECISION TRACE & SNAPSHOT INSPECTOR
            </span>
            <Badge variant="outline" size="md">
              Step {currentIndex + 1} of {totalSnapshots}
            </Badge>
          </div>

          {/* Scrubber / Step Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Timestamp:
            </span>
            <strong style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              t = {current.time} ms
            </strong>
          </div>
        </div>
      }
      padding="md"
      variant="default"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Playback Controls Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: 'var(--color-surface-subdued)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          {/* Controls: Reset, Back, Play/Pause, Forward */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Button
              variant="outline"
              size="md"
              icon={<RotateCcw size={16} />}
              onClick={() => {
                setIsPlaying(false);
                onReset();
              }}
              title="Reset to initial step"
            />
            <Button
              variant="outline"
              size="md"
              icon={<SkipBack size={16} />}
              onClick={() => {
                setIsPlaying(false);
                onStepBack();
              }}
              disabled={isFirst}
              title="Step backward"
            />
            <Button
              variant={isPlaying ? 'secondary' : 'primary'}
              size="md"
              icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
              onClick={() => {
                if (isLast && !isPlaying) {
                  onGoToSnapshot(0);
                }
                setIsPlaying(!isPlaying);
              }}
            >
              {isPlaying ? 'Pause' : isLast ? 'Replay' : 'Play'}
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<SkipForward size={16} />}
              onClick={() => {
                setIsPlaying(false);
                onStepForward();
              }}
              disabled={isLast}
              title="Step forward"
            />
          </div>

          {/* Slider scrubber */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: '180px', maxWidth: '340px' }}>
            <input
              type="range"
              min={0}
              max={totalSnapshots - 1}
              value={currentIndex}
              onChange={(e) => {
                setIsPlaying(false);
                onGoToSnapshot(Number(e.target.value));
              }}
              style={{
                width: '100%',
                accentColor: 'var(--color-accent)',
                cursor: 'pointer',
                height: '6px',
              }}
            />
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              Speed:
            </span>
            {[
              { label: '0.5x', ms: 1600 },
              { label: '1x', ms: 1000 },
              { label: '2x', ms: 500 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setSpeedMs(s.ms)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '4px',
                  border: speedMs === s.ms ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                  backgroundColor: speedMs === s.ms ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: speedMs === s.ms ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* State Grid: CPU State, Ready Queue, Completed */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
          {/* Active CPU Process */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-surface-subdued)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Active CPU
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: current.runningPid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: current.runningPid ? 'var(--color-success)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {current.runningPid ? 'BUSY' : 'IDLE'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: '4px' }}>
              {current.runningPid ? (
                <>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                    {current.runningPid}
                  </span>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                    <div>Remaining: <strong style={{ color: 'var(--color-text)' }}>{current.remainingBurst?.[current.runningPid] ?? 0} ms</strong></div>
                  </div>
                </>
              ) : (
                <span style={{ fontSize: '0.9375rem', fontStyle: 'italic', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  (No process running)
                </span>
              )}
            </div>
          </div>

          {/* Ready Queue */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-surface-subdued)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} color="var(--color-accent)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Ready Queue (FIFO)
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                [{current.readyQueue.length}]
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px', minHeight: '32px' }}>
              {current.readyQueue.length === 0 ? (
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  Queue is empty
                </span>
              ) : (
                current.readyQueue.map((pid, idx) => (
                  <div
                    key={`${pid}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(6, 182, 212, 0.12)',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--color-accent)',
                    }}
                  >
                    <span>{pid}</span>
                    {current.remainingBurst && (
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>
                        ({current.remainingBurst[pid]}ms)
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Terminated / Completed Processes */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-surface-subdued)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="var(--color-success)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Completed Processes
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
                [{current.terminatedQueue.length}]
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px', minHeight: '32px' }}>
              {current.terminatedQueue.length === 0 ? (
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  None yet
                </span>
              ) : (
                current.terminatedQueue.map((pid: string) => (
                  <span
                    key={pid}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--color-success)',
                    }}
                  >
                    {pid} ✓
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Human-Readable Decision Explanation Box */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            borderLeft: '4px solid var(--color-accent)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Terminal size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', letterSpacing: '0.04em' }}>
              SCHEDULING DECISION & RATIONALE
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              color: 'var(--color-text)',
              lineHeight: 1.6,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {current.explanation || 'No decision rationale recorded for this timestamp.'}
          </p>
        </div>
      </div>
    </Card>
  );
};
