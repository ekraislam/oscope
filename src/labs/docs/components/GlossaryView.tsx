/**
 * OScope — Searchable Academic Glossary Component
 * Renders 40+ canonical Operating Systems terms with category filtering,
 * instant query search, deep explanations, and lab cross-links.
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Search, ExternalLink, Tag } from 'lucide-react';
import { GLOSSARY_TERMS } from '../../../content/glossary';
import type { SubsystemCategory } from '../../../content/types';

export const GlossaryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubsystemCategory | 'ALL'>('ALL');

  const categories: (SubsystemCategory | 'ALL')[] = [
    'ALL',
    'PROCESS',
    'SCHEDULING',
    'MEMORY',
    'DEADLOCK',
    'FILESYSTEM',
    'GENERAL'
  ];

  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return GLOSSARY_TERMS.filter((item) => {
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.shortDefinition.toLowerCase().includes(q) ||
        item.inDepthExplanation.toLowerCase().includes(q) ||
        item.relatedConcepts.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Search and Category Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search 40+ canonical Operating Systems terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              fontSize: '0.875rem',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-main)',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: selectedCategory === cat ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-text-muted)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingLeft: '4px' }}>
        Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} definitions
      </div>

      {/* Terms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-3)' }}>
        {filteredTerms.map((item) => {
          const anchorId = item.term.toLowerCase().replace(/[^a-z0-9]/g, '-');
          return (
            <div
              key={item.term}
              id={anchorId}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                scrollMarginTop: '80px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {item.term}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                <p style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)', fontWeight: 500 }}>
                  {item.shortDefinition}
                </p>

                <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.55, color: 'var(--color-text-muted)' }}>
                  {item.inDepthExplanation}
                </p>
              </div>

              <div>
                {/* Related Concepts */}
                {item.relatedConcepts.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <Tag size={11} style={{ color: 'var(--color-text-muted)' }} />
                    {item.relatedConcepts.map((rel) => (
                      <span
                        key={rel}
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-muted)',
                          backgroundColor: 'var(--color-bg)',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        {rel}
                      </span>
                    ))}
                  </div>
                )}

                {/* Lab Cross Link */}
                <Link href={item.labRoute}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    <span>View in Simulator</span>
                    <ExternalLink size={11} />
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
