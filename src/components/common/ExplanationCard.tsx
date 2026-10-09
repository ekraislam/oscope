/**
 * OScope — Standardized Educational Explanation Card Component
 * Formats academic explanations into the rigorous 3-tier hierarchy:
 * 1. WHAT: The observed simulation state or transition
 * 2. WHY: The algorithmic condition or invariant triggering the action
 * 3. RESULT: The tangible architectural effect on simulated state
 */

import React from 'react';
import { HelpCircle, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from './Card';

export interface ExplanationCardProps {
  title?: string;
  what: React.ReactNode;
  why: React.ReactNode;
  result: React.ReactNode;
  conceptBadge?: React.ReactNode;
  subsystem?: 'PROCESS' | 'CPU' | 'MEMORY' | 'DEADLOCK' | 'FILESYSTEM' | 'OBSERVATORY';
  className?: string;
  style?: React.CSSProperties;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  title = 'Simulation Decision Analysis',
  what,
  why,
  result,
  conceptBadge,
  subsystem = 'OBSERVATORY',
  className = '',
  style,
}) => {
  const accentColorMap: Record<string, string> = {
    PROCESS: 'var(--color-success)',
    CPU: 'var(--color-ready)',
    MEMORY: 'var(--color-accent)',
    DEADLOCK: 'var(--color-warning)',
    FILESYSTEM: 'var(--color-info)',
    OBSERVATORY: 'var(--color-accent)',
  };

  const accentColor = accentColorMap[subsystem] ?? 'var(--color-accent)';

  return (
    <Card
      variant="default"
      className={`oscope-explanation-card ${className}`}
      style={{
        borderLeft: `3px solid ${accentColor}`,
        backgroundColor: 'var(--color-surface)',
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <HelpCircle size={16} color={accentColor} />
          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {title}
          </h4>
        </div>
        {conceptBadge}
      </div>

      {/* 3-Tier Hierarchy: WHAT -> WHY -> RESULT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Tier 1: WHAT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: 'var(--space-3)',
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: accentColor,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronRight size={12} />
            WHAT:
          </span>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            {what}
          </div>
        </div>

        {/* Tier 2: WHY */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: 'var(--space-3)',
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-warning)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronRight size={12} />
            WHY:
          </span>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {why}
          </div>
        </div>

        {/* Tier 3: RESULT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: 'var(--space-3)',
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-success)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ArrowRight size={12} />
            RESULT:
          </span>
          <div
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={14} color="var(--color-success)" />
            <span>{result}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
