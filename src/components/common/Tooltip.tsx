import React, { useState } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-6px)',
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(6px)',
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(-6px)',
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(6px)',
    },
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 50,
            padding: '4px 8px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-elevated)',
            borderRadius: 'var(--radius-xs)',
            boxShadow: 'var(--shadow-md)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            ...positionStyles[position],
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
