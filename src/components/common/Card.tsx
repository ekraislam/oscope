import React from 'react';

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'subdued'
  | 'interactive'
  | 'selected'
  | 'status'
  | 'inspector'
  | 'telemetry';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  statusAccent?: 'success' | 'warning' | 'danger' | 'info' | 'ready';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  header,
  footer,
  statusAccent,
  className = '',
  style,
  ...rest
}) => {
  const baseStyles: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all var(--transition-fast)',
  };

  const variantStyles: Record<CardVariant, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--color-surface)',
    },
    elevated: {
      backgroundColor: 'var(--color-surface-elevated)',
      boxShadow: 'var(--shadow-md)',
      borderColor: 'var(--color-border-elevated)',
    },
    subdued: {
      backgroundColor: 'var(--color-surface-subdued)',
      borderColor: 'var(--color-border-subtle)',
    },
    interactive: {
      backgroundColor: 'var(--color-surface)',
      cursor: 'pointer',
    },
    selected: {
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-accent)',
      boxShadow: 'var(--shadow-glow-accent)',
    },
    status: {
      backgroundColor: 'var(--color-surface)',
      borderLeftWidth: '3px',
      borderLeftColor: statusAccent ? `var(--color-${statusAccent})` : 'var(--color-accent)',
    },
    inspector: {
      backgroundColor: 'var(--color-surface-elevated)',
      borderColor: 'var(--color-border-elevated)',
      boxShadow: 'var(--shadow-lg)',
    },
    telemetry: {
      backgroundColor: 'var(--color-surface-subdued)',
      borderColor: 'var(--color-border)',
      fontFamily: 'var(--font-mono)',
    },
  };

  const paddingStyles: Record<string, string> = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-5)',
    lg: 'var(--space-8)',
  };

  return (
    <div
      className={`oscope-card oscope-card--${variant} ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {header && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {header}
        </div>
      )}
      <div style={{ padding: paddingStyles[padding], flex: 1, minWidth: 0 }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
