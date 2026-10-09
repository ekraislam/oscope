import React, { useState } from 'react';
import { useDeadlockStore } from '../../../state/useDeadlockStore';
import { Card, Badge } from '../../../components/common';
import { Network, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ResourceAllocationGraphView: React.FC = () => {
  const ragGraph = useDeadlockStore((s) => s.ragGraph);
  const ragCycles = useDeadlockStore((s) => s.ragCycleResult);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Deterministic 2-column layout
  // Left: Process nodes, Right: Resource nodes
  const processNodes = ragGraph.nodes.filter((n) => n.type === 'PROCESS');
  const resourceNodes = ragGraph.nodes.filter((n) => n.type === 'RESOURCE');

  const width = 640;
  const leftX = 140;
  const rightX = 500;
  const rowHeight = 85;
  const topPadding = 60;

  const totalHeight = Math.max(
    320,
    topPadding + Math.max(processNodes.length, resourceNodes.length) * rowHeight + 40
  );

  // Map node coordinates
  const nodePositions = new Map<string, { x: number; y: number }>();

  processNodes.forEach((node, idx) => {
    nodePositions.set(node.id, {
      x: leftX,
      y: topPadding + idx * rowHeight,
    });
  });

  resourceNodes.forEach((node, idx) => {
    nodePositions.set(node.id, {
      x: rightX,
      y: topPadding + idx * rowHeight,
    });
  });

  const cycleNodeSet = new Set(ragCycles.cycleNodes);

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Network size={18} color="var(--color-accent)" />
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
              RESOURCE ALLOCATION GRAPH (RAG)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {ragCycles.hasCycle ? (
              <Badge variant={ragCycles.isSingleInstanceAll ? 'danger' : 'warning'} size="md">
                {ragCycles.isSingleInstanceAll ? 'Cycle: Deadlock (Single-Inst)' : 'Cycle: Multi-Instance'}
              </Badge>
            ) : (
              <Badge variant="success" size="md">Cycle-Free (No Deadlock)</Badge>
            )}
          </div>
        </div>
      }
      padding="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Academic Interpretation Banner */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: ragCycles.hasCycle
              ? ragCycles.isSingleInstanceAll
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(245, 158, 11, 0.12)'
              : 'rgba(34, 197, 94, 0.1)',
            border: ragCycles.hasCycle
              ? ragCycles.isSingleInstanceAll
                ? '1px solid rgba(239, 68, 68, 0.35)'
                : '1px solid rgba(245, 158, 11, 0.35)'
              : '1px solid rgba(34, 197, 94, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
          }}
        >
          {ragCycles.hasCycle ? (
            <AlertTriangle
              size={20}
              color={ragCycles.isSingleInstanceAll ? 'var(--color-error)' : 'var(--color-warning)'}
              style={{ marginTop: '2px', flexShrink: 0 }}
            />
          ) : (
            <CheckCircle2 size={20} color="var(--color-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
          )}
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9375rem' }}>{ragCycles.deadlockImplication}</strong>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>{ragCycles.explanation}</p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--color-accent)', backgroundColor: 'rgba(56, 189, 248, 0.2)' }} />
            <span>Process Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '2px solid #a855f7', backgroundColor: 'rgba(168, 85, 247, 0.2)' }} />
            <span>Resource Node (dots = instances)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 800 }}>──▶</span>
            <span>Request Edge (Process → Resource)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#a855f7', fontWeight: 800 }}>──▶</span>
            <span>Assignment Edge (Resource → Process)</span>
          </div>
          {ragCycles.hasCycle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-error)', fontWeight: 800 }}>──▶</span>
              <span style={{ color: 'var(--color-error)', fontWeight: 800 }}>Cycle Edge</span>
            </div>
          )}
        </div>

        {/* Interactive SVG Graph */}
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
          <svg
            width={width}
            height={totalHeight}
            viewBox={`0 0 ${width} ${totalHeight}`}
            style={{ maxWidth: '100%', height: 'auto', userSelect: 'none' }}
          >
            <defs>
              {/* Arrow markers */}
              <marker id="arrow-request" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-accent)" />
              </marker>
              <marker id="arrow-assignment" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
              </marker>
              <marker id="arrow-cycle" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-error)" />
              </marker>
            </defs>

            {/* Column Headers */}
            <text x={leftX} y={28} textAnchor="middle" fill="var(--color-text-secondary)" fontSize="14" fontFamily="var(--font-mono)" fontWeight="800">
              PROCESSES
            </text>
            <text x={rightX} y={28} textAnchor="middle" fill="var(--color-text-secondary)" fontSize="14" fontFamily="var(--font-mono)" fontWeight="800">
              RESOURCES
            </text>

            {/* Render Edges */}
            {ragGraph.edges.map((edge, idx) => {
              const fromPos = nodePositions.get(edge.from);
              const toPos = nodePositions.get(edge.to);
              if (!fromPos || !toPos) return null;

              const isCycleEdge = ragCycles.cycleEdges.some(
                (ce) => ce.from === edge.from && ce.to === edge.to
              );

              const strokeColor = isCycleEdge
                ? 'var(--color-error)'
                : edge.type === 'REQUEST'
                ? 'rgba(56, 189, 248, 0.6)'
                : 'rgba(168, 85, 247, 0.6)';

              const strokeWidth = isCycleEdge ? 2.5 : 1.5;
              const markerId = isCycleEdge
                ? 'url(#arrow-cycle)'
                : edge.type === 'REQUEST'
                ? 'url(#arrow-request)'
                : 'url(#arrow-assignment)';

              // Compute slight curve so bidirectional edges don't directly overlap
              const dy = toPos.y - fromPos.y;
              const curveOffset = edge.type === 'REQUEST' ? -18 : 18;
              const midX = (fromPos.x + toPos.x) / 2 + (dy !== 0 ? (dy / Math.abs(dy)) * curveOffset : 0);
              const midY = (fromPos.y + toPos.y) / 2 + curveOffset;

              const pathData = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`;

              return (
                <g key={`${edge.from}-${edge.to}-${idx}`}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={edge.type === 'REQUEST' ? '4 2' : 'none'}
                    markerEnd={markerId}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />
                  {edge.count && edge.count > 1 && (
                    <text
                      x={midX}
                      y={midY}
                      fill={strokeColor}
                      fontSize="11"
                      fontFamily="var(--font-mono)"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      ×{edge.count}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Process Nodes (Circles) */}
            {processNodes.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              const inCycle = cycleNodeSet.has(node.id);
              const isSelected = selectedNodeId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={26}
                    fill="var(--color-surface)"
                    stroke={inCycle ? 'var(--color-error)' : isSelected ? 'var(--color-accent)' : 'var(--color-border)'}
                    strokeWidth={inCycle || isSelected ? 3 : 2}
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
                    {node.name}
                  </text>
                </g>
              );
            })}

            {/* Render Resource Nodes (Rectangles with instance dots) */}
            {resourceNodes.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              const inCycle = cycleNodeSet.has(node.id);
              const isSelected = selectedNodeId === node.id;
              const instances = node.instances ?? 1;

              // Generate instance dot offsets
              const dotCount = Math.min(instances, 6);
              const dotRadius = 3.5;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={-31}
                    y={-25}
                    width={62}
                    height={50}
                    rx={8}
                    fill="var(--color-surface)"
                    stroke={inCycle ? 'var(--color-error)' : isSelected ? '#a855f7' : 'var(--color-border)'}
                    strokeWidth={inCycle || isSelected ? 3 : 2}
                    filter={inCycle ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))' : undefined}
                  />
                  <text
                    x={0}
                    y={-7}
                    textAnchor="middle"
                    fill={inCycle ? 'var(--color-error)' : '#a855f7'}
                    fontSize="12"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {node.name}
                  </text>

                  {/* Instance dots */}
                  <g transform="translate(0, 10)">
                    {Array.from({ length: dotCount }).map((_, dIdx) => {
                      const dotSpacing = 9;
                      const startX = -((dotCount - 1) * dotSpacing) / 2;
                      return (
                        <circle
                          key={dIdx}
                          cx={startX + dIdx * dotSpacing}
                          cy={0}
                          r={dotRadius}
                          fill="#a855f7"
                        />
                      );
                    })}
                  </g>

                  {/* If instances > 6, display +N indicator */}
                  {instances > 6 && (
                    <text x={0} y={22} textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontFamily="var(--font-mono)">
                      ({instances})
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </Card>
  );
};
