import React from 'react';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  badge,
  actions,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {title}
          </h2>
          {badge}
        </div>
        {description && (
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '750px',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
