/**
 * OScope — Academic References & Bibliography View
 * Displays strictly verified canonical textbooks and historical landmark papers.
 * Upholds academic honesty with zero fabricated DOIs or page numbers.
 */

import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { ACADEMIC_REFERENCES } from '../../../content/references';

export const ReferencesView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-primary)' }}>
            <BookOpen size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Verified Academic References & Bibliography
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Foundational operating systems literature informing OScope simulation models
            </span>
          </div>
        </div>

        {/* Academic Honesty Guarantee Callout */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <ShieldCheck size={18} style={{ color: '#10b981', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
            <strong>Academic Honesty Commitment:</strong> All bibliographic entries below represent verified standard Operating Systems textbooks and peer-reviewed landmark papers. OScope strictly avoids inventing DOI links, arbitrary page numbers, or unverified citations.
          </p>
        </div>
      </div>

      {/* References List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ACADEMIC_REFERENCES.map((ref) => (
          <div
            key={ref.id}
            id={ref.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              scrollMarginTop: '80px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: ref.verifiedType === 'TEXTBOOK' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: ref.verifiedType === 'TEXTBOOK' ? 'var(--color-primary)' : '#f59e0b',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}
                >
                  {ref.verifiedType === 'TEXTBOOK' ? 'Canonical Textbook' : 'Landmark Classical Paper'}
                </span>
                <h4 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {ref.title}
                </h4>
              </div>

              {ref.year && (
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                  {ref.year}
                </span>
              )}
            </div>

            {/* Authors & Publisher */}
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <strong>Authors:</strong> {ref.authors.join(', ')}
              {ref.edition ? ` · ${ref.edition}` : ''}
              {ref.publisher ? ` · ${ref.publisher}` : ''}
            </div>

            {/* Formal Citation String */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                backgroundColor: 'var(--color-bg)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-main)'
              }}
            >
              {ref.canonicalCitation}
            </div>

            {/* Project Relevance */}
            <div style={{ fontSize: '0.75rem', lineHeight: 1.45, color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>Relevance to OScope: </strong>
              {ref.relevance}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
