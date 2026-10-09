import React from 'react';
import { useDeadlockStore } from '../../../state/useDeadlockStore';
import { Card, Badge } from '../../../components/common';
import { GitFork, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WaitForGraphView: React.FC = () => {
  const wfg = useDeadlockStore((s) => s.waitForGraph);

  const width = 580;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 100;

  // Position processes in a clean radial circle
  const n = wfg.nodes.length;
  const nodePositions = new Map<string, { x: number; y: number }>();

  wfg.nodes.forEach((pid, idx) => {
    const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
    nodePositions.set(pid, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  const cycleProcesses = new Set<string>();
  if (wfg.cycles.length > 0) {
    for (const c of wfg.cycles) {
      for (const p of c) {
        cycleProcesses.add(p);
      }
    }
  }

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <GitFork size={18} color="var(--color-accent)" />
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
              DERIVED WAIT-FOR GRAPH (WFG)
            </span>
          </div>
          <Badge variant={wfg.hasCycle ? 'danger' : 'success'} size="md">
            {wfg.hasCycle ? 'Circular Wait Detected' : 'Acyclic (No Circular Wait)'}
          </Badge>
        </div>
      }
      padding="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          A Wait-For Graph collapses resource nodes: an edge <code>Pi → Pj</code> directly indicates that Process{' '}
          <code>Pi</code> is blocked waiting for a resource currently held by <code>Pj</code>.
        </p>

        <div
          style={{
            overflowX: 'auto',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%', userSelect: 'none' }}>
            <defs>
              <marker id="wfg-arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-accent)" />
              </marker>
              <marker id="wfg-arrow-cycle" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-error)" />
              </marker>
            </defs>

            {/* Edges */}
            {wfg.edges.map((edge, idx) => {
              const fromPos = nodePositions.get(edge.from);
              const toPos = nodePositions.get(edge.to);
              if (!fromPos || !toPos) return null;

              const isCycleEdge = wfg.cycles.some((c) => {
                const uIdx = c.indexOf(edge.from);
                if (uIdx === -1) return false;
                const nextInCycle = c[(uIdx + 1) % c.length];
                return nextInCycle === edge.to;
              });

              return (
                <g key={`${edge.from}-${edge.to}-${idx}`}>
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={isCycleEdge ? 'var(--color-error)' : 'rgba(56, 189, 248, 0.5)'}
                    strokeWidth={isCycleEdge ? 2.5 : 1.5}
                    markerEnd={isCycleEdge ? 'url(#wfg-arrow-cycle)' : 'url(#wfg-arrow)'}
                  />
                  <text
                    x={(fromPos.x + toPos.x) / 2}
                    y={(fromPos.y + toPos.y) / 2 - 4}
                    fill={isCycleEdge ? 'var(--color-error)' : 'var(--color-text-secondary)'}
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    for {edge.resourceId}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {wfg.nodes.map((pid) => {
              const pos = nodePositions.get(pid);
              if (!pos) return null;
              const inCycle = cycleProcesses.has(pid);

              return (
                <g key={pid} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r={26}
                    fill="var(--color-surface)"
                    stroke={inCycle ? 'var(--color-error)' : 'var(--color-border)'}
                    strokeWidth={inCycle ? 3 : 2}
                    filter={inCycle ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))' : undefined}
                  />
                  <text
                    textAnchor="middle"
                    dy=".35em"
                    fill={inCycle ? 'var(--color-error)' : 'var(--color-text-primary)'}
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {pid}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.8125rem' }}>
          {wfg.hasCycle ? (
            <AlertCircle size={16} color="var(--color-error)" />
          ) : (
            <CheckCircle2 size={16} color="var(--color-success)" />
          )}
          <span style={{ color: wfg.hasCycle ? 'var(--color-error)' : 'var(--color-success)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {wfg.explanation}
          </span>
        </div>
      </div>
    </Card>
  );
};
