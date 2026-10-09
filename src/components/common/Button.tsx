import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  style,
  ...rest
}) => {
  const isActionDisabled = disabled || loading;

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
    cursor: isActionDisabled ? 'not-allowed' : 'pointer',
    opacity: isActionDisabled ? 0.55 : 1,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: variant === 'icon' ? '6px' : '4px 10px',
      fontSize: '0.8125rem',
      height: '30px',
      minWidth: variant === 'icon' ? '30px' : 'auto',
    },
    md: {
      padding: variant === 'icon' ? '8px' : '8px 16px',
      fontSize: '0.875rem',
      height: '38px',
      minWidth: variant === 'icon' ? '38px' : 'auto',
    },
    lg: {
      padding: variant === 'icon' ? '12px' : '10px 22px',
      fontSize: '1rem',
      height: '46px',
      minWidth: variant === 'icon' ? '46px' : 'auto',
    },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-accent)',
      color: '#070A13',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-glow-accent)',
    },
    secondary: {
      backgroundColor: 'var(--color-surface-elevated)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      backgroundColor: 'var(--color-danger-subtle)',
      color: 'var(--color-danger)',
      border: '1px solid var(--color-danger-border)',
    },
    success: {
      backgroundColor: 'var(--color-success-subtle)',
      color: 'var(--color-success)',
      border: '1px solid var(--color-success-border)',
    },
    icon: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 'var(--radius-sm)',
    },
  };

  const mergedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      className={`oscope-button oscope-button--${variant} ${className}`}
      style={mergedStyles}
      disabled={isActionDisabled}
      aria-disabled={isActionDisabled}
      {...rest}
    >
      {loading ? (
        <Loader2
          size={size === 'sm' ? 14 : 16}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      ) : (
        icon && iconPosition === 'left' && <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
    </button>
  );
};
