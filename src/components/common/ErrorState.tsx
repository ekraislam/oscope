/**
 * OScope — Standardized Simulation Error State Component
 * User-facing technical explanation with corrective action and collapsible diagnostic details.
 */

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  diagnosticDetails?: string | Record<string, any>;
  onRetry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Simulation Constraint Violation',
  message,
  diagnosticDetails,
  onRetry,
  retryLabel = 'Reset Parameters',
  action,
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const formattedDiagnostics =
    typeof diagnosticDetails === 'object'
      ? JSON.stringify(diagnosticDetails, null, 2)
      : diagnosticDetails;

  return (
    <Card
      variant="default"
      style={{
        borderLeft: '4px solid var(--color-danger)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-danger-subtle)',
            color: 'var(--color-danger)',
            display: 'flex',
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '4px',
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw size={14} />}
          >
            {retryLabel}
          </Button>
        )}
        {action}
        {formattedDiagnostics && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiagnostics((prev) => !prev)}
            icon={showDiagnostics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          >
            {showDiagnostics ? 'Hide Technical Diagnostics' : 'Show Technical Diagnostics'}
          </Button>
        )}
      </div>

      {/* Collapsible Diagnostics */}
      {showDiagnostics && formattedDiagnostics && (
        <pre
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-subdued)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            overflowX: 'auto',
            maxHeight: '160px',
          }}
        >
          {formattedDiagnostics}
        </pre>
      )}
    </Card>
  );
};
