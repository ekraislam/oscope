/**
 * OScope — Theory Topic Card Component
 * Renders an individual academic topic with definitions, key points,
 * practical examples, misconception warnings, and Theory vs. Implementation distinctions.
 */

import React from 'react';
import { Link } from 'wouter';
import { ExternalLink, AlertTriangle, Lightbulb, SplitSquareVertical } from 'lucide-react';
import type { TheoryTopic } from '../../../content/types';

interface TheoryTopicCardProps {
  topic: TheoryTopic;
  onSelectTopic?: (topicId: string) => void;
}

export const TheoryTopicCard: React.FC<TheoryTopicCardProps> = ({ topic, onSelectTopic }) => {
  return (
    <article
      id={topic.id}
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
      aria-labelledby={`heading-${topic.id}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.6875rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-primary)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '6px'
            }}
          >
            {topic.subsystem} THEORY
          </span>
          <h3
            id={`heading-${topic.id}`}
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              margin: 0
            }}
          >
            {topic.title}
          </h3>
        </div>

        <Link href={topic.labRoute}>
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
            title={`Launch the ${topic.subsystem} simulator lab`}
          >
            <span>Launch Lab</span>
            <ExternalLink size={13} />
          </button>
        </Link>
      </div>

      {/* Short Definition */}
      <p
        style={{
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          color: 'var(--color-text-main)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderLeft: '3px solid var(--color-primary)',
          padding: '10px 14px',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          margin: 0,
          fontWeight: 500
        }}
      >
        {topic.shortDefinition}
      </p>

      {/* Full Academic Explanation */}
      <div style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-text-muted)' }}>
        {topic.explanation}
      </div>

      {/* Key Core Points */}
      {topic.keyPoints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
            Key Conceptual Points
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {topic.keyPoints.map((point, idx) => (
              <li key={idx} style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Practical Example */}
      {topic.practicalExample && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}
        >
          <Lightbulb size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981', display: 'block', marginBottom: '3px' }}>
              Academic & Practical Example
            </span>
            <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
              {topic.practicalExample}
            </p>
          </div>
        </div>
      )}

      {/* Common Misconception Callout */}
      {topic.commonMisconception && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}
        >
          <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', display: 'block', marginBottom: '3px' }}>
              Common Viva Trap / Misconception
            </span>
            <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
              {topic.commonMisconception}
            </p>
          </div>
        </div>
      )}

      {/* Theory vs. OScope Implementation */}
      {topic.theoryVsImplementation && (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
            <SplitSquareVertical size={14} />
            <span>Theory vs. OScope Implementation</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '12px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                GENERAL OPERATING SYSTEMS THEORY
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.45, color: 'var(--color-text-muted)' }}>
                {topic.theoryVsImplementation.generalTheory}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                OSCOPE EDUCATIONAL IMPLEMENTATION
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.45, color: 'var(--color-text-main)' }}>
                {topic.theoryVsImplementation.oscopeImplementation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Related Topics */}
      {topic.relatedTopics.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '6px', borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Related:
          </span>
          {topic.relatedTopics.map((relId) => (
            <button
              key={relId}
              type="button"
              onClick={() => onSelectTopic?.(relId)}
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px 8px',
                cursor: 'pointer'
              }}
            >
              #{relId}
            </button>
          ))}
        </div>
      )}
    </article>
  );
};
