/**
 * OScope — Algorithm Guide Card Component
 * Formats comprehensive algorithm teardowns including selection rules,
 * preemption behavior, advantages/disadvantages, complexity, and starvation analysis.
 */

import React from 'react';
import { Link } from 'wouter';
import { ExternalLink, Check, X, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import type { AlgorithmGuide } from '../../../content/types';

interface AlgorithmGuideCardProps {
  algorithm: AlgorithmGuide;
}

export const AlgorithmGuideCard: React.FC<AlgorithmGuideCardProps> = ({ algorithm }) => {
  return (
    <article
      id={algorithm.id}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        scrollMarginTop: '80px'
      }}
      aria-labelledby={`heading-algo-${algorithm.id}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-primary)',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {algorithm.subsystem} ALGORITHM
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: algorithm.preemptive ? '#f59e0b' : '#3b82f6',
                backgroundColor: algorithm.preemptive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {algorithm.preemptive ? 'Preemptive' : 'Non-Preemptive'}
            </span>
          </div>

          <h3
            id={`heading-algo-${algorithm.id}`}
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              margin: 0
            }}
          >
            {algorithm.name}
          </h3>
        </div>

        <Link href={algorithm.labRoute}>
          <button
            type="button"
            className="btn-interactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer'
            }}
          >
            <span>Simulate Algorithm</span>
            <ExternalLink size={13} />
          </button>
        </Link>
      </div>

      {/* Definition */}
      <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--color-text-main)', fontWeight: 500 }}>
        {algorithm.definition}
      </p>

      {/* Mechanism & Selection Rule */}
      <div
        style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
          <Cpu size={14} />
          <span>Operational Mechanism</span>
        </div>
        <div style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
          {algorithm.mechanism}
        </div>
        <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--color-border)' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
            Selection Rule:{' '}
          </span>
          <code
            style={{
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-primary)',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            {algorithm.selectionRule}
          </code>
        </div>
      </div>

      {/* Advantages & Disadvantages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {/* Advantages */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} />
            <span>Key Advantages</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {algorithm.advantages.map((adv, idx) => (
              <li key={idx} style={{ fontSize: '0.8125rem', lineHeight: 1.45, color: 'var(--color-text-main)' }}>
                {adv}
              </li>
            ))}
          </ul>
        </div>

        {/* Disadvantages */}
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <X size={14} />
            <span>Key Limitations</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {algorithm.disadvantages.map((dis, idx) => (
              <li key={idx} style={{ fontSize: '0.8125rem', lineHeight: 1.45, color: 'var(--color-text-main)' }}>
                {dis}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Analytical Footnotes: Complexity, Starvation, Workload */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          padding: '10px 14px',
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem'
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '2px' }}>
            COMPLEXITY / OVERHEAD
          </div>
          <div style={{ color: 'var(--color-text-main)', lineHeight: 1.4 }}>
            {algorithm.complexityNote}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={12} />
            <span>STARVATION PROFILE</span>
          </div>
          <div style={{ color: 'var(--color-text-main)', lineHeight: 1.4 }}>
            {algorithm.starvationNote}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} />
            <span>OPTIMAL WORKLOAD</span>
          </div>
          <div style={{ color: 'var(--color-text-main)', lineHeight: 1.4 }}>
            {algorithm.bestSuitedWorkload}
          </div>
        </div>
      </div>
    </article>
  );
};
