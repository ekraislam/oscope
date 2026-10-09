/**
 * OScope — Standardized Simulation Loading State Component
 * Accessible spinner and academic status indicator without fake progress bars.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from './Card';

export interface LoadingStateProps {
  statusMessage?: string;
  subsystem?: string;
  compact?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  statusMessage = 'Evaluating simulation state...',
  subsystem,
  compact = false,
}) => {
  return (
    <Card
      variant="subdued"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? 'var(--space-6)' : 'var(--space-10)',
        gap: 'var(--space-3)',
        textAlign: 'center',
      }}
      role="status"
      aria-live="polite"
    >
      <Loader2
        size={compact ? 20 : 32}
        color="var(--color-accent)"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {subsystem && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            [{subsystem}]
          </span>
        )}
        <p
          style={{
            fontSize: '0.875rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {statusMessage}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  );
};
