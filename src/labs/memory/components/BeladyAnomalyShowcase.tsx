import React, { useState } from 'react';
import { Card, Badge, Button } from '../../../components/common';
import { checkBeladyAnomaly } from '../../../core/algorithms/memory';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';

export const BeladyAnomalyShowcase: React.FC = () => {
  const beladyString = Object.freeze([1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]);

  const [activeFrameView, setActiveFrameView] = useState<3 | 4>(3);

  // Run the pure check function
  const anomalyData = checkBeladyAnomaly(beladyString, 3, 4);
  const { smallerResult, largerResult } = anomalyData;

  const currentResult = activeFrameView === 3 ? smallerResult : largerResult;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Hero Banner: Anomaly Overview */}
      <Card padding="md" variant="subdued">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertTriangle size={22} color="var(--color-warning)" />
              <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                BÉLÁDY&apos;S ANOMALY DEMONSTRATION
              </span>
            </div>
            <Badge variant="warning" size="md">
              FIFO Paradox Confirmed
            </Badge>
          </div>

          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Common intuition dictates that adding more physical RAM frames should always reduce (or maintain) the number of page faults.
            In 1969, László Bélády proved that First-In, First-Out (FIFO) replacement violates this principle on specific reference patterns.
          </p>

          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              borderLeft: '4px solid var(--color-warning)',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div>
              Reference String: <strong>[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]</strong>
            </div>
            <div style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
              {anomalyData.explanation}
            </div>
          </div>
        </div>
      </Card>

      {/* Side-by-side Metric Comparison Deck */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {/* 3 Frames Card */}
        <div
          onClick={() => setActiveFrameView(3)}
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeFrameView === 3 ? 'rgba(56, 189, 248, 0.12)' : 'var(--color-surface)',
            border: activeFrameView === 3 ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Configuration A: 3 Frames
            </span>
            <Badge variant="outline" size="sm">
              Less Memory
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', lineHeight: 1 }}>
              {smallerResult.totalFaults}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              Page Faults ({smallerResult.faultRate.toFixed(1)}%)
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Hits: {smallerResult.totalHits} / 12 ({smallerResult.hitRate.toFixed(1)}% hit rate)
          </div>

          <Button variant={activeFrameView === 3 ? 'primary' : 'outline'} size="sm" onClick={() => setActiveFrameView(3)}>
            {activeFrameView === 3 ? 'Inspecting 3 Frames' : 'Inspect 3 Frames Matrix'}
          </Button>
        </div>

        {/* 4 Frames Card */}
        <div
          onClick={() => setActiveFrameView(4)}
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeFrameView === 4 ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-surface)',
            border: activeFrameView === 4 ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Configuration B: 4 Frames
            </span>
            <Badge variant="danger" size="sm">
              Anomaly Triggered
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', lineHeight: 1 }}>
              {largerResult.totalFaults}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              Page Faults ({largerResult.faultRate.toFixed(1)}%)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 600 }}>
            <TrendingUp size={16} />
            <span>+1 FAULT despite having +1 MORE PHYSICAL FRAME!</span>
          </div>

          <Button variant={activeFrameView === 4 ? 'danger' : 'outline'} size="sm" onClick={() => setActiveFrameView(4)}>
            {activeFrameView === 4 ? 'Inspecting 4 Frames' : 'Inspect 4 Frames Matrix'}
          </Button>
        </div>
      </div>

      {/* Frame Matrix for Selected Configuration */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                FIFO FRAME EXECUTION TRACE ({activeFrameView} FRAMES)
              </span>
              <Badge variant={activeFrameView === 3 ? 'info' : 'danger'} size="sm">
                Total Faults: {currentResult.totalFaults}
              </Badge>
            </div>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              12 References
            </span>
          </div>
        }
        padding="none"
        variant="default"
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-subdued)',
                  borderBottom: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <th style={{ padding: '10px 14px' }}>Step</th>
                <th style={{ padding: '10px 14px' }}>Ref</th>
                {Array.from({ length: activeFrameView }).map((_, f) => (
                  <th key={f} style={{ padding: '10px 14px' }}>
                    Frame {f}
                  </th>
                ))}
                <th style={{ padding: '10px 14px' }}>Result</th>
                <th style={{ padding: '10px 14px' }}>Evicted</th>
              </tr>
            </thead>
            <tbody>
              {currentResult.steps.map((st) => (
                <tr
                  key={st.step}
                  style={{
                    borderBottom: '1px solid var(--color-border-subtle)',
                    backgroundColor: st.isHit ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)' }}>
                    #{st.step}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {st.pageNumber}
                  </td>
                  {st.memoryFramesSnapshot.map((resident, f) => (
                    <td
                      key={f}
                      style={{
                        padding: '10px 14px',
                        fontWeight: st.allocatedFrame === f ? 700 : 400,
                        color: st.allocatedFrame === f ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {resident !== null ? resident : '—'}
                    </td>
                  ))}
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: st.isHit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: st.isHit ? 'var(--color-success)' : 'var(--color-warning)',
                        display: 'inline-block',
                      }}
                    >
                      {st.isHit ? 'HIT ✓' : 'FAULT'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: st.evictedPage !== null ? 'var(--color-danger)' : 'var(--color-text-muted)', fontWeight: st.evictedPage !== null ? 700 : 400 }}>
                    {st.evictedPage !== null ? `P${st.evictedPage}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Academic Explanation */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          backgroundColor: 'var(--color-surface-subdued)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          fontSize: '0.95rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.65,
        }}
      >
        <Info size={20} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--color-text-primary)' }}>Why Does This Happen?</strong> Bélády&apos;s Anomaly occurs because
          FIFO is <em>not a stack algorithm</em>. In a stack algorithm (such as LRU or Optimal), the set of pages resident in $N$
          frames is guaranteed to be a strict subset of the pages that would be resident in $N+1$ frames. In FIFO, this subset
          property fails: evicting the oldest resident page can evict a page that will be needed in the immediate future, which
          a larger memory pool ironically kept alive until the wrong time!
        </div>
      </div>
    </div>
  );
};
