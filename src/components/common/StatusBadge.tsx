/**
 * OScope — Standardized Academic Status Badge Component
 * Combines semantic color, visible symbol/icon, and ARIA attributes
 * so state is never communicated through color alone.
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Activity,
  PauseCircle,
  ShieldCheck,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export type AcademicStatus =
  | 'STANDBY'
  | 'ACTIVE'
  | 'ATTENTION'
  | 'FAULT'
  | 'SAFE'
  | 'UNSAFE'
  | 'DEADLOCKED'
  | 'READY'
  | 'OFFLINE';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AcademicStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

interface StatusVisualConfig {
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  defaultLabel: string;
  ariaDescription: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
  style,
  ...rest
}) => {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  const configMap: Record<AcademicStatus, StatusVisualConfig> = {
    STANDBY: {
      color: 'var(--color-text-secondary)',
      bg: 'var(--color-surface-elevated)',
      border: 'var(--color-border)',
      icon: <PauseCircle size={iconSize} />,
      defaultLabel: 'STANDBY',
      ariaDescription: 'Simulation is uninitialized or in standby state',
    },
    ACTIVE: {
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-subtle)',
      border: 'var(--color-accent-border)',
      icon: <Activity size={iconSize} />,
      defaultLabel: 'ACTIVE',
      ariaDescription: 'Simulation engine actively computing or dispatching',
    },
    ATTENTION: {
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-subtle)',
      border: 'var(--color-warning-border)',
      icon: <AlertTriangle size={iconSize} />,
      defaultLabel: 'ATTENTION',
      ariaDescription: 'Subsystem in non-fatal advisory state (e.g. Banker unsafe claim)',
    },
    FAULT: {
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-subtle)',
      border: 'var(--color-danger-border)',
      icon: <Flame size={iconSize} />,
      defaultLabel: 'SYSTEM FAULT',
      ariaDescription: 'Critical simulation anomaly or unrecoverable deadlock condition',
    },
    SAFE: {
      color: 'var(--color-success)',
      bg: 'var(--color-success-subtle)',
      border: 'var(--color-success-border)',
      icon: <ShieldCheck size={iconSize} />,
      defaultLabel: 'SAFE',
      ariaDescription: 'Banker safety check verified: valid safe execution sequence exists',
    },
    UNSAFE: {
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-subtle)',
      border: 'var(--color-warning-border)',
      icon: <ShieldAlert size={iconSize} />,
      defaultLabel: 'UNSAFE',
      ariaDescription: 'Banker safety check failed: no safe sequence found. Note: not a deadlock.',
    },
    DEADLOCKED: {
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-subtle)',
      border: 'var(--color-danger-border)',
      icon: <AlertOctagon size={iconSize} />,
      defaultLabel: 'DEADLOCKED',
      ariaDescription: 'Permanent circular wait detected: processes cannot proceed',
    },
    READY: {
      color: 'var(--color-success)',
      bg: 'var(--color-success-subtle)',
      border: 'var(--color-success-border)',
      icon: <CheckCircle2 size={iconSize} />,
      defaultLabel: 'READY',
      ariaDescription: 'Laboratory is ready for user interaction',
    },
    OFFLINE: {
      color: 'var(--color-text-disabled)',
      bg: 'var(--color-surface-subdued)',
      border: 'var(--color-border-subtle)',
      icon: <PauseCircle size={iconSize} />,
      defaultLabel: 'OFFLINE',
      ariaDescription: 'Subsystem is currently inactive or unmounted',
    },
  };

  const current = configMap[status] ?? configMap.STANDBY;
  const text = label ?? current.defaultLabel;

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '2px 8px',
      fontSize: '0.6875rem',
      gap: '4px',
    },
    md: {
      padding: '4px 10px',
      fontSize: '0.75rem',
      gap: '6px',
    },
    lg: {
      padding: '6px 14px',
      fontSize: '0.875rem',
      gap: '8px',
    },
  };

  return (
    <span
      role="status"
      aria-label={`${text}: ${current.ariaDescription}`}
      className={`oscope-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderRadius: 'var(--radius-xs)',
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...style,
      }}
      {...rest}
    >
      {showIcon && <span style={{ display: 'inline-flex' }}>{current.icon}</span>}
      <span>{text}</span>
    </span>
  );
};
