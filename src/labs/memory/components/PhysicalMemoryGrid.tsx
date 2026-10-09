import React from 'react';
import type { PhysicalMemoryState } from '../../../core/algorithms/memory';
import { Card, Badge } from '../../../components/common';
import { HardDrive, CheckCircle2, CircleDashed } from 'lucide-react';

interface PhysicalMemoryGridProps {
  memory: PhysicalMemoryState;
  activeFrameNumber: number | null;
  pageSizeBytes: number;
}

export const PhysicalMemoryGrid: React.FC<PhysicalMemoryGridProps> = ({
  memory,
  activeFrameNumber,
  pageSizeBytes,
}) => {
  const occupiedCount = memory.frames.filter((f) => f.isOccupied).length;
  const utilization = ((occupiedCount / memory.frameCount) * 100).toFixed(0);

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <HardDrive size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              PHYSICAL MEMORY FRAMES (RAM)
            </span>
            <Badge variant="outline" size="sm">
              {occupiedCount}/{memory.frameCount} Occupied ({utilization}%)
            </Badge>
          </div>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            {memory.frameCount * pageSizeBytes} B Total
          </span>
        </div>
      }
      padding="md"
      variant="default"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 'var(--space-2)',
        }}
      >
        {memory.frames.map((frame) => {
          const isActive = activeFrameNumber === frame.frameNumber;
          const isOcc = frame.isOccupied;

          return (
            <div
              key={frame.frameNumber}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive
                  ? 'rgba(6, 182, 212, 0.15)'
                  : isOcc
                  ? 'var(--color-surface)'
                  : 'var(--color-surface-subdued)',
                border: isActive
                  ? '2px solid var(--color-accent)'
                  : isOcc
                  ? '1px solid var(--color-border)'
                  : '1px dashed var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Header: Frame # */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  }}
                >
                  Frame #{frame.frameNumber}
                </span>
                {isOcc ? (
                  <CheckCircle2 size={12} color="var(--color-success)" />
                ) : (
                  <CircleDashed size={12} color="var(--color-text-muted)" />
                )}
              </div>

              {/* Resident Page Box */}
              <div style={{ marginTop: '2px' }}>
                {isOcc && frame.allocatedPage !== null ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Page:
                    </span>
                    <span
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                      }}
                    >
                      P{frame.allocatedPage}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    (Free Frame)
                  </span>
                )}
              </div>

              {/* Sub-info: PID & Timestamp */}
              {isOcc && (
                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.3 }}>
                  <div>Owner: {frame.owningPid ?? 'Kernel'}</div>
                  <div>Loaded: t={frame.loadedAtTime}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
