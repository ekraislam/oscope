import React from 'react';
import { Card } from './Card';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  badge,
  action,
}) => {
  return (
    <Card
      variant="subdued"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-6)',
        gap: 'var(--space-4)',
        borderStyle: 'dashed',
      }}
    >
      {icon && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-accent)',
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
        {badge}
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            maxWidth: '460px',
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      </div>
      {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
    </Card>
  );
};
