import React from 'react';

export type SystemStatusType = 'READY' | 'STANDBY' | 'OFFLINE' | 'ACTIVE' | 'WARNING' | 'ERROR';

export interface StatusIndicatorProps {
  status: SystemStatusType;
  label?: string;
  showDot?: boolean;
  pulsing?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showDot = true,
  pulsing = false,
}) => {
  const statusConfig: Record<SystemStatusType, { color: string; bg: string; text: string }> = {
    READY: {
      color: 'var(--color-success)',
      bg: 'var(--color-success-subtle)',
      text: 'READY',
    },
    ACTIVE: {
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-subtle)',
      text: 'ACTIVE',
    },
    STANDBY: {
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-subtle)',
      text: 'STANDBY',
    },
    OFFLINE: {
      color: 'var(--color-offline)',
      bg: 'var(--color-offline-subtle)',
      text: 'OFFLINE',
    },
    WARNING: {
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-subtle)',
      text: 'WARNING',
    },
    ERROR: {
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-subtle)',
      text: 'ERROR',
    },
  };

  const config = statusConfig[status];
  const displayText = label ?? config.text;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: config.color,
      }}
    >
      {showDot && (
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: '8px',
            height: '8px',
          }}
        >
          {pulsing && (
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: config.color,
                opacity: 0.6,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
          )}
          <span
            style={{
              position: 'relative',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: config.color,
            }}
          />
        </span>
      )}
      <span>{displayText}</span>
    </div>
  );
};
