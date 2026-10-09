import React, { useRef } from 'react';
import type { GanttSegment } from '../../../core/models';
import { Card, Badge } from '../../../components/common';
import { Clock, Eye } from 'lucide-react';

interface GanttChartProps {
  gantt: readonly GanttSegment[];
  totalTime: number;
  currentPlaybackTime: number;
  selectedPid: string | null;
  onSelectProcess?: (pid: string) => void;
}

const PROCESS_COLORS: readonly string[] = [
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#14B8A6', // Teal
  '#A855F7', // Purple
];

function getProcessColor(pid: string): string {
  if (pid === 'IDLE') return '#1E293B';
  if (pid === 'CS') return '#D97706';
  const match = pid.match(/\d+/);
  const num = match ? parseInt(match[0], 10) : pid.charCodeAt(0);
  return PROCESS_COLORS[(num - 1 + PROCESS_COLORS.length) % PROCESS_COLORS.length];
}

export const GanttChart: React.FC<GanttChartProps> = ({
  gantt,
  totalTime,
  currentPlaybackTime,
  selectedPid,
  onSelectProcess,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (gantt.length === 0 || totalTime <= 0) {
    return (
      <Card padding="md" variant="subdued">
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: 'var(--space-6)' }}>
          No execution timeline available. Add processes or load a preset to generate the Gantt chart.
        </div>
      </Card>
    );
  }

  // Calculate pixel scaling (minimum 40px per time unit or scale to fit)
  const pixelsPerUnit = Math.max(36, Math.min(65, 800 / totalTime));
  const chartWidth = Math.max(totalTime * pixelsPerUnit, 600);

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={18} color="var(--color-accent)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '0.02em' }}>
              CPU EXECUTION GANTT TIMELINE
            </span>
            <Badge variant="outline" size="md">
              Makespan: {totalTime} ms
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Playback Cursor:</span>
            <strong style={{ color: 'var(--color-accent)' }}>t = {currentPlaybackTime} ms</strong>
          </div>
        </div>
      }
      padding="md"
      variant="default"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Horizontal scroll wrapper */}
        <div
          ref={containerRef}
          style={{
            overflowX: 'auto',
            paddingBottom: 'var(--space-3)',
            position: 'relative',
          }}
        >
          <div style={{ width: `${chartWidth}px`, position: 'relative', minHeight: '100px' }}>
            {/* Timeline Bars */}
            <div
              style={{
                display: 'flex',
                height: '54px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-subdued)',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.25)',
              }}
            >
              {gantt.map((segment, index) => {
                const width = segment.duration * pixelsPerUnit;
                const isIdle = segment.type === 'IDLE';
                const isCS = segment.type === 'CONTEXT_SWITCH';
                const color = getProcessColor(segment.pid);
                const isSelected = selectedPid === segment.pid;

                return (
                  <div
                    key={`${segment.pid}-${segment.startTime}-${index}`}
                    onClick={() => {
                      if (!isIdle && !isCS && onSelectProcess) {
                        onSelectProcess(segment.pid);
                      }
                    }}
                    title={`${segment.type}: ${segment.pid} (${segment.startTime}ms → ${segment.endTime}ms, duration: ${segment.duration}ms)`}
                    style={{
                      width: `${width}px`,
                      minWidth: `${width}px`,
                      height: '100%',
                      backgroundColor: isIdle
                        ? 'rgba(30, 41, 59, 0.5)'
                        : isCS
                        ? 'rgba(217, 119, 6, 0.35)'
                        : color,
                      borderRight: '1.5px solid var(--color-bg)',
                      borderTop: isSelected ? '4px solid #FFFFFF' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isIdle || isCS ? 'default' : 'pointer',
                      transition: 'all var(--transition-fast)',
                      backgroundImage: isIdle
                        ? 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255, 255, 255, 0.04) 6px, rgba(255, 255, 255, 0.04) 12px)'
                        : isCS
                        ? 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0, 0, 0, 0.25) 4px, rgba(0, 0, 0, 0.25) 8px)'
                        : 'none',
                      color: isIdle || isCS ? 'var(--color-text-muted)' : '#070A13',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.9375rem',
                      userSelect: 'none',
                      boxShadow: isSelected ? '0 0 12px rgba(255, 255, 255, 0.4)' : 'none',
                    }}
                  >
                    {isIdle ? (
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>IDLE</span>
                    ) : isCS ? (
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-warning)' }}>CS</span>
                    ) : (
                      <span>{segment.pid}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Marker Ticks Axis */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '26px',
                marginTop: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              {/* Beginning tick 0 */}
              <span style={{ position: 'absolute', left: 0, transform: 'translateX(0)' }}>
                0
              </span>

              {/* End boundaries for each segment */}
              {gantt.map((segment, index) => {
                const leftPos = segment.endTime * pixelsPerUnit;
                return (
                  <span
                    key={`time-${index}`}
                    style={{
                      position: 'absolute',
                      left: `${leftPos}px`,
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ width: '1.5px', height: '6px', backgroundColor: 'var(--color-border)', marginBottom: '3px' }} />
                    {segment.endTime}
                  </span>
                );
              })}
            </div>

            {/* Playback Cursor Line */}
            {currentPlaybackTime >= 0 && currentPlaybackTime <= totalTime && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: '26px',
                  left: `${currentPlaybackTime * pixelsPerUnit}px`,
                  width: '2.5px',
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 0 10px var(--color-accent)',
                  pointerEvents: 'none',
                  zIndex: 20,
                  transition: 'left 150ms ease-out',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '-5px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent)',
                    boxShadow: '0 0 8px var(--color-accent)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-accent)', borderRadius: '3px' }} />
            <span style={{ fontWeight: 600 }}>Process Execution</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                border: '1px dashed var(--color-border)',
                borderRadius: '3px',
              }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>CPU Idle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(217, 119, 6, 0.7)', borderRadius: '3px' }} />
            <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>Context Switch (CS)</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
            <Eye size={14} color="var(--color-accent)" />
            <span>Click any process bar to inspect details</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
