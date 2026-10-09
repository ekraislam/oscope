/**
 * OScope — Allocation Strategy Comparison Component
 * Side-by-side comparative analysis of Contiguous, Linked, and Indexed allocation.
 * Evaluates identical workloads, block placement, access performance, and metadata overhead.
 */

import React from 'react';
import { Columns3 } from 'lucide-react';
import { Card, Badge } from '../../../components/common';
import { useFileSystemStore } from '../../../state/useFileSystemStore';
import { previewAllocation } from '../../../core/algorithms/filesystem';

export const StrategyComparisonPanel: React.FC = () => {
  const state = useFileSystemStore((s) => s.state);
  const [testSizeBytes, setTestSizeBytes] = React.useState(2800);

  // Run preview on the current disk for all 3 strategies with the exact same test file size
  const testFileSpec = React.useMemo(
    () => ({ fileName: 'comparison_sample.dat', sizeBytes: testSizeBytes }),
    [testSizeBytes]
  );
  const contiguousPreview = React.useMemo(
    () => previewAllocation(state, testFileSpec, 'CONTIGUOUS'),
    [state, testFileSpec]
  );
  const linkedPreview = React.useMemo(
    () => previewAllocation(state, testFileSpec, 'LINKED'),
    [state, testFileSpec]
  );
  const indexedPreview = React.useMemo(
    () => previewAllocation(state, testFileSpec, 'INDEXED'),
    [state, testFileSpec]
  );

  return (
    <Card padding="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Columns3 size={18} color="var(--color-accent)" />
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                Allocation Strategy Architectural Comparison
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Evaluating Contiguous vs Linked vs Indexed storage allocation under identical disk conditions.
              </p>
            </div>
          </div>

          {/* Test Workload Controller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              EVALUATE WORKLOAD:
            </span>
            <input
              type="number"
              min={512}
              step={512}
              value={testSizeBytes}
              onChange={(e) => setTestSizeBytes(Math.max(1, parseInt(e.target.value || '0', 10)))}
              style={{
                width: '90px',
                padding: '4px 6px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
              }}
            />
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Bytes
            </span>
          </div>
        </div>

        {/* Live Workload Feasibility Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
          {/* Contiguous Card */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                CONTIGUOUS
              </span>
              <Badge variant={contiguousPreview.canAllocate ? 'success' : 'danger'}>
                {contiguousPreview.canAllocate ? 'ALLOCATION FEASIBLE' : 'CANNOT ALLOCATE'}
              </Badge>
            </div>

            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Blocks: </span>
                <strong>{contiguousPreview.totalBlocksNeeded}</strong> (Data only)
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Metadata Blocks: </span>
                <strong>0</strong> (None required)
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>External Frag Risk: </span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>HIGH (Blocking)</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Random Access: </span>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>O(1) Direct Base + Offset</span>
              </div>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
              {contiguousPreview.canAllocate
                ? `Can fit into consecutive run: [${contiguousPreview.candidateBlocks.join(', ')}].`
                : contiguousPreview.reason}
            </p>
          </div>

          {/* Linked Card */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#4ade80' }}>
                LINKED
              </span>
              <Badge variant={linkedPreview.canAllocate ? 'success' : 'danger'}>
                {linkedPreview.canAllocate ? 'ALLOCATION FEASIBLE' : 'CANNOT ALLOCATE'}
              </Badge>
            </div>

            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Blocks: </span>
                <strong>{linkedPreview.totalBlocksNeeded}</strong> (Scattered)
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Metadata Overhead: </span>
                <strong>Pointers inside blocks</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>External Frag Risk: </span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>NONE (Scattered placement)</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Random Access: </span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>O(k) Sequential Pointer Hops</span>
              </div>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
              {linkedPreview.canAllocate
                ? `Can allocate non-contiguous blocks: [${linkedPreview.candidateBlocks.join(', ')}].`
                : linkedPreview.reason}
            </p>
          </div>

          {/* Indexed Card */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(234, 179, 8, 0.05)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fde047' }}>
                INDEXED
              </span>
              <Badge variant={indexedPreview.canAllocate ? 'success' : 'danger'}>
                {indexedPreview.canAllocate ? 'ALLOCATION FEASIBLE' : 'CANNOT ALLOCATE'}
              </Badge>
            </div>

            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Blocks: </span>
                <strong>{indexedPreview.totalBlocksNeeded}</strong> ({indexedPreview.dataBlocksNeeded} data + 1 index)
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Metadata Blocks: </span>
                <strong>1 dedicated index block</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>External Frag Risk: </span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>NONE (Scattered placement)</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Random Access: </span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>O(1) Two-step Indirection</span>
              </div>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
              {indexedPreview.canAllocate
                ? `Uses Index Block #${indexedPreview.candidateIndexBlock} pointing to [${indexedPreview.candidateBlocks.join(', ')}].`
                : indexedPreview.reason}
            </p>
          </div>
        </div>

        {/* Detailed Textbook Comparison Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>DIMENSION</th>
                <th style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>CONTIGUOUS</th>
                <th style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#4ade80' }}>LINKED</th>
                <th style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fde047' }}>INDEXED</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'var(--font-mono)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Block Placement</td>
                <td style={{ padding: '8px 12px' }}>Consecutive adjacent blocks</td>
                <td style={{ padding: '8px 12px' }}>Scattered anywhere on disk</td>
                <td style={{ padding: '8px 12px' }}>Scattered anywhere on disk</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>External Fragmentation</td>
                <td style={{ padding: '8px 12px', color: '#ef4444' }}>Severe; occurs when runs fragment</td>
                <td style={{ padding: '8px 12px', color: '#22c55e' }}>None; any free block is usable</td>
                <td style={{ padding: '8px 12px', color: '#22c55e' }}>None; any free block is usable</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Internal Fragmentation</td>
                <td style={{ padding: '8px 12px' }}>Last block only</td>
                <td style={{ padding: '8px 12px' }}>Last block only</td>
                <td style={{ padding: '8px 12px' }}>Last block only</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Metadata Overhead</td>
                <td style={{ padding: '8px 12px', color: '#22c55e' }}>Zero extra disk blocks</td>
                <td style={{ padding: '8px 12px' }}>Pointer bytes per block</td>
                <td style={{ padding: '8px 12px', color: '#fde047' }}>1 dedicated Index Block per file</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Sequential Access</td>
                <td style={{ padding: '8px 12px', color: '#22c55e' }}>Extremely fast (minimum seek)</td>
                <td style={{ padding: '8px 12px' }}>Good (follows chain)</td>
                <td style={{ padding: '8px 12px' }}>Good (sequential index lookup)</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Random / Direct Access</td>
                <td style={{ padding: '8px 12px', color: '#22c55e' }}>Direct calculation (Base + k)</td>
                <td style={{ padding: '8px 12px', color: '#ef4444' }}>Poor (Must traverse k pointer hops)</td>
                <td style={{ padding: '8px 12px', color: '#38bdf8' }}>Fast (Read Index Block, then Block[k])</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
