import React, { useState, useEffect } from 'react';
import type { ReplacementResult, ReplacementAlgorithm } from '../../../core/models/memory';
import { Card, Badge, Button } from '../../../components/common';
import {
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Flame,
  Clock,
} from 'lucide-react';

interface PageReplacementSimulatorProps {
  result: ReplacementResult | null;
  selectedAlgorithm: ReplacementAlgorithm;
  referenceString: readonly number[];
  frameCount: number;
  currentStep: number;
  onSelectAlgorithm: (algo: ReplacementAlgorithm) => void;
  onUpdateReferenceString: (refString: number[]) => { success: boolean; error?: string };
  onUpdateFrameCount: (frames: number) => void;
  onGoToStep: (step: number) => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
}

export const PageReplacementSimulator: React.FC<PageReplacementSimulatorProps> = ({
  result,
  selectedAlgorithm,
  referenceString,
  frameCount,
  currentStep,
  onSelectAlgorithm,
  onUpdateReferenceString,
  onUpdateFrameCount,
  onGoToStep,
  onStepForward,
  onStepBack,
  onReset,
}) => {
  const [refStringInput, setRefStringInput] = useState<string>(referenceString.join(', '));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync ref string input when external referenceString changes
  useEffect(() => {
    setRefStringInput(referenceString.join(', '));
  }, [referenceString]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || !result || result.steps.length === 0) return;

    if (currentStep >= result.steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      onStepForward();
    }, speedMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, result, speedMs, onStepForward]);

  const handleRefStringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parts = refStringInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const nums: number[] = [];
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (isNaN(n) || n < 0) {
        setErrorMsg(`Invalid page number "${p}". All pages must be non-negative integers.`);
        return;
      }
      nums.push(n);
    }

    if (nums.length === 0) {
      setErrorMsg('Reference string cannot be empty.');
      return;
    }

    const res = onUpdateReferenceString(nums);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update reference string.');
    }
  };

  const steps = result?.steps ?? [];
  const currentStepData = steps[currentStep] || steps[0];
  const isFirst = currentStep === 0;
  const isLast = steps.length > 0 && currentStep === steps.length - 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Control Bar: Algorithm Selector + Frame Count + Reference String */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Layers size={16} color="var(--color-accent)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                PAGE REPLACEMENT SIMULATOR
              </span>
            </div>

            {/* Algorithm Selector Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              {(['FIFO', 'LRU', 'OPTIMAL'] as const).map((algo) => (
                <button
                  key={algo}
                  onClick={() => onSelectAlgorithm(algo)}
                  style={{
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    border: selectedAlgorithm === algo ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                    backgroundColor: selectedAlgorithm === algo ? 'rgba(6, 182, 212, 0.15)' : 'var(--color-surface)',
                    color: selectedAlgorithm === algo ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {algo === 'OPTIMAL' ? 'OPT (Lookahead)' : algo}
                </button>
              ))}
            </div>
          </div>
        }
        padding="md"
        variant="default"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Reference String Input and Frame Count Stepper */}
          <form
            onSubmit={handleRefStringSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: '280px' }}>
              <label
                htmlFor="ref-string-input"
                style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}
              >
                Page Reference String:
              </label>
              <input
                id="ref-string-input"
                type="text"
                value={refStringInput}
                onChange={(e) => setRefStringInput(e.target.value)}
                placeholder="7, 0, 1, 2, 0, 3, 0, 4..."
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  backgroundColor: 'var(--color-surface-subdued)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text)',
                }}
              />
              <Button type="submit" variant="secondary" size="sm">
                Apply String
              </Button>
            </div>

            {/* Frame Count Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <label
                htmlFor="frame-count-input"
                style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}
              >
                Physical Frames:
              </label>
              <input
                id="frame-count-input"
                type="number"
                min={1}
                max={10}
                value={frameCount}
                onChange={(e) => onUpdateFrameCount(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '55px',
                  padding: '3px 6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-surface-subdued)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-accent)',
                  textAlign: 'center',
                }}
              />
            </div>
          </form>

          {errorMsg && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>
              {errorMsg}
            </div>
          )}
        </div>
      </Card>

      {/* Aggregate Metric Cards Deck */}
      {result && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          {/* Total References */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
            }}
          >
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Total References
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
              {result.referenceString.length}
            </div>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>Workload length</span>
          </div>

          {/* Page Faults */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-warning)' }}>
              <Flame size={13} />
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Page Faults
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>
              {result.totalFaults}
            </div>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>Fault Rate: {result.faultRate.toFixed(1)}%</span>
          </div>

          {/* Page Hits */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
              <CheckCircle2 size={13} />
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Page Hits
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
              {result.totalHits}
            </div>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>Hit Rate: {result.hitRate.toFixed(1)}%</span>
          </div>

          {/* Fault Ratio */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
            }}
          >
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Fault Efficiency
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              {result.faultRate.toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>Faults / N</span>
          </div>
        </div>
      )}

      {/* Playback Controls & Current Frame Snapshot */}
      {result && steps.length > 0 && currentStepData && (
        <Card
          header={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Clock size={16} color="var(--color-accent)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  STEP-BY-STEP REPLACEMENT INSPECTOR
                </span>
                <Badge variant="outline" size="sm">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>

              {/* Status Badge: HIT vs FAULT */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                  Page {currentStepData.pageNumber}:
                </span>
                <Badge variant={currentStepData.isHit ? 'success' : 'warning'} size="md">
                  {currentStepData.isHit ? 'PAGE HIT ✓' : 'PAGE FAULT ⚠'}
                </Badge>
              </div>
            </div>
          }
          padding="md"
          variant="default"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Playback Button Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--color-surface-subdued)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
              }}
            >
              {/* Stepper Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Button variant="outline" size="sm" icon={<RotateCcw size={13} />} onClick={() => { setIsPlaying(false); onReset(); }} title="Reset" />
                <Button variant="outline" size="sm" icon={<SkipBack size={13} />} onClick={() => { setIsPlaying(false); onStepBack(); }} disabled={isFirst} title="Step back" />
                <Button
                  variant={isPlaying ? 'secondary' : 'primary'}
                  size="sm"
                  icon={isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  onClick={() => {
                    if (isLast && !isPlaying) onGoToStep(0);
                    setIsPlaying(!isPlaying);
                  }}
                >
                  {isPlaying ? 'Pause' : isLast ? 'Replay' : 'Play'}
                </Button>
                <Button variant="outline" size="sm" icon={<SkipForward size={13} />} onClick={() => { setIsPlaying(false); onStepForward(); }} disabled={isLast} title="Step forward" />
              </div>

              {/* Step Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: '160px', maxWidth: '300px' }}>
                <input
                  type="range"
                  min={0}
                  max={steps.length - 1}
                  value={currentStep}
                  onChange={(e) => {
                    setIsPlaying(false);
                    onGoToStep(Number(e.target.value));
                  }}
                  style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                />
              </div>

              {/* Playback Speed */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Speed:</span>
                {[
                  { label: '0.5x', ms: 1600 },
                  { label: '1x', ms: 1000 },
                  { label: '2x', ms: 500 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSpeedMs(s.ms)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: '3px',
                      border: speedMs === s.ms ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
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

            {/* Frame State Snapshot at this step */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Physical Frames at Step {currentStep + 1} (Referenced Page: {currentStepData.pageNumber})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${frameCount}, 1fr)`, gap: 'var(--space-3)' }}>
                {currentStepData.memoryFramesSnapshot.map((residentPage, fIdx) => {
                  const isReferencedInThisFrame = currentStepData.allocatedFrame === fIdx;

                  return (
                    <div
                      key={fIdx}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isReferencedInThisFrame
                          ? currentStepData.isHit
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(245, 158, 11, 0.12)'
                          : 'var(--color-surface)',
                        border: isReferencedInThisFrame
                          ? currentStepData.isHit
                            ? '2px solid var(--color-success)'
                            : '2px solid var(--color-warning)'
                          : '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        Frame {fIdx}
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: residentPage !== null ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                        {residentPage !== null ? `P${residentPage}` : '—'}
                      </span>
                      {isReferencedInThisFrame && (
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: currentStepData.isHit ? 'var(--color-success)' : 'var(--color-warning)' }}>
                          {currentStepData.isHit ? 'HIT TARGET' : currentStepData.evictedPage !== null ? `LOADED (Evicted P${currentStepData.evictedPage})` : 'LOADED'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Replacement Details Banner */}
            <div
              style={{
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--color-surface-subdued)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                flexWrap: 'wrap',
              }}
            >
              <span>
                Referenced Page: <strong style={{ color: 'var(--color-accent)' }}>{currentStepData.pageNumber}</strong>
              </span>
              <span>
                Outcome:{' '}
                <strong style={{ color: currentStepData.isHit ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {currentStepData.isHit ? 'HIT (No Replacement)' : 'FAULT'}
                </strong>
              </span>
              {currentStepData.evictedPage !== null && (
                <span style={{ color: 'var(--color-error)' }}>
                  Evicted Page: <strong>Page {currentStepData.evictedPage}</strong> ({selectedAlgorithm})
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Section 36: Full Step Matrix History Table */}
      {result && steps.length > 0 && (
        <Card
          header={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                FULL EXECUTION FRAME MATRIX
              </span>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                {steps.length} Total Steps
              </span>
            </div>
          }
          padding="none"
          variant="default"
        >
          <div style={{ overflowX: 'auto', maxHeight: '320px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--color-surface-subdued)',
                    borderBottom: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <th style={{ padding: '6px 12px' }}>Step</th>
                  <th style={{ padding: '6px 12px' }}>Ref Page</th>
                  {Array.from({ length: frameCount }).map((_, fIdx) => (
                    <th key={fIdx} style={{ padding: '6px 12px' }}>
                      Frame {fIdx}
                    </th>
                  ))}
                  <th style={{ padding: '6px 12px' }}>Result</th>
                  <th style={{ padding: '6px 12px' }}>Evicted</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((st, idx) => {
                  const isCurrent = currentStep === idx;

                  return (
                    <tr
                      key={st.step}
                      onClick={() => onGoToStep(idx)}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: isCurrent ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '6px 12px', color: 'var(--color-text-muted)' }}>
                        #{st.step}
                      </td>
                      <td style={{ padding: '6px 12px', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {st.pageNumber}
                      </td>
                      {st.memoryFramesSnapshot.map((resident, fIdx) => (
                        <td
                          key={fIdx}
                          style={{
                            padding: '6px 12px',
                            fontWeight: st.allocatedFrame === fIdx ? 700 : 400,
                            color: st.allocatedFrame === fIdx ? 'var(--color-text)' : 'var(--color-text-secondary)',
                          }}
                        >
                          {resident !== null ? resident : '—'}
                        </td>
                      ))}
                      <td style={{ padding: '6px 12px' }}>
                        <span
                          style={{
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            backgroundColor: st.isHit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: st.isHit ? 'var(--color-success)' : 'var(--color-warning)',
                          }}
                        >
                          {st.isHit ? 'HIT' : 'FAULT'}
                        </span>
                      </td>
                      <td style={{ padding: '6px 12px', color: st.evictedPage !== null ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                        {st.evictedPage !== null ? `P${st.evictedPage}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
