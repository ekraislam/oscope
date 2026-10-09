import React from 'react';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'danger' | 'ready' | 'neutral' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  style,
  ...rest
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderRadius: 'var(--radius-xs)',
    width: 'fit-content',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '3px 8px',
      fontSize: '0.75rem',
      lineHeight: '1.2',
    },
    md: {
      padding: '5px 12px',
      fontSize: '0.8125rem',
      lineHeight: '1.3',
    },
  };

  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    info: {
      backgroundColor: 'var(--color-info-subtle)',
      color: 'var(--color-accent)',
      border: '1px solid var(--color-accent-border)',
    },
    success: {
      backgroundColor: 'var(--color-success-subtle)',
      color: 'var(--color-success)',
      border: '1px solid var(--color-success-border)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-subtle)',
      color: 'var(--color-warning)',
      border: '1px solid var(--color-warning-border)',
    },
    danger: {
      backgroundColor: 'var(--color-danger-subtle)',
      color: 'var(--color-danger)',
      border: '1px solid var(--color-danger-border)',
    },
    ready: {
      backgroundColor: 'var(--color-ready-subtle)',
      color: 'var(--color-ready)',
      border: '1px solid var(--color-ready-border)',
    },
    neutral: {
      backgroundColor: 'var(--color-surface-elevated)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-muted)',
      border: '1px solid var(--color-border)',
    },
  };

  const dotColors: Record<BadgeVariant, string> = {
    info: 'var(--color-accent)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    ready: 'var(--color-ready)',
    neutral: 'var(--color-text-secondary)',
    outline: 'var(--color-text-muted)',
  };

  const mergedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <span className={`oscope-badge oscope-badge--${variant} ${className}`} style={mergedStyles} {...rest}>
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColors[variant],
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
};
