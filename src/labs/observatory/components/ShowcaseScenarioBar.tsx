/**
 * OScope — Observatory Showcase Scenario Controller Component
 * Allows users and educators to load coordinated multi-subsystem scenarios
 * for demonstrations, lectures, and academic vivas.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '../../../components/common';
import { OBSERVATORY_SCENARIOS } from '../../../core/algorithms/observatory';
import { useObservatoryStore } from '../../../state/useObservatoryStore';

export const ShowcaseScenarioBar: React.FC = () => {
  const activeScenarioId = useObservatoryStore((s) => s.activeScenarioId);
  const loadScenario = useObservatoryStore((s) => s.loadScenario);

  const activeScenario = OBSERVATORY_SCENARIOS.find((s) => s.id === activeScenarioId) ?? OBSERVATORY_SCENARIOS[0];

  return (
    <Card padding="sm" variant="subdued">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              OBSERVATORY SHOWCASE SCENARIO:
            </span>
          </div>

          {/* Scenario Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {OBSERVATORY_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => loadScenario(sc.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    activeScenarioId === sc.id
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                  backgroundColor:
                    activeScenarioId === sc.id ? 'rgba(56, 189, 248, 0.15)' : 'var(--color-surface)',
                  color:
                    activeScenarioId === sc.id
                      ? 'var(--color-accent)'
                      : 'var(--color-text-secondary)',
                  transition: 'all 0.12s ease',
                }}
              >
                {sc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scenario Details & Focus */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '6px 10px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)' }}>
            <strong>Focus:</strong> {activeScenario.educationalFocus}
          </span>
          <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
            {activeScenario.description}
          </span>
        </div>
      </div>
    </Card>
  );
};
