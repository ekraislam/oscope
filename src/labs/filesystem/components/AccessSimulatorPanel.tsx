/**
 * OScope — Storage Access Trace & Pointer Traversal Simulator Component
 * Visualizes how an Operating System resolves a logical block request into a physical disk block
 * across Contiguous, Linked, and Indexed allocation strategies.
 */

import React from 'react';
import { Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Button } from '../../../components/common';
import { useFileSystemStore } from '../../../state/useFileSystemStore';

export const AccessSimulatorPanel: React.FC = () => {
  const state = useFileSystemStore((s) => s.state);
  const accessTargetFileName = useFileSystemStore((s) => s.accessTargetFileName);
  const accessLogicalBlockIndex = useFileSystemStore((s) => s.accessLogicalBlockIndex);
  const lastAccessResult = useFileSystemStore((s) => s.lastAccessResult);
  const setAccessTarget = useFileSystemStore((s) => s.setAccessTarget);
  const executeAccessSimulation = useFileSystemStore((s) => s.executeAccessSimulation);
  const selectBlock = useFileSystemStore((s) => s.selectBlock);

  const fileList = state.directoryEntries.filter((e) => e.type === 'FILE');

  // Find max logical blocks for selected target file
  const targetEntry = state.directoryEntries.find((e) => e.name === accessTargetFileName);
  const targetInode = targetEntry ? state.inodes[targetEntry.inodeNumber] : undefined;
  const maxLogicalIndex = targetInode ? Math.max(0, targetInode.directBlocks.length - 1) : 0;

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
            <Search size={18} color="var(--color-accent)" />
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                Disk Read & Pointer Traversal Simulator
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Tracing the step-by-step resolution from Logical Block Offset to Physical Disk Block.
              </p>
            </div>
          </div>
          <Badge variant="outline">Educational Access Model</Badge>
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Target File Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
              TARGET FILE:
            </label>
            <select
              value={accessTargetFileName}
              onChange={(e) => setAccessTarget(e.target.value, 0)}
              style={{
                padding: '6px 8px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
              }}
            >
              {fileList.map((f) => (
                <option key={f.path} value={f.name}>
                  {f.name} ({state.inodes[f.inodeNumber]?.allocationStrategy ?? 'FILE'})
                </option>
              ))}
            </select>
          </div>

          {/* Logical Block Index Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
              LOGICAL BLOCK OFFSET (0..{maxLogicalIndex}):
            </label>
            <input
              type="number"
              min={0}
              max={maxLogicalIndex}
              value={accessLogicalBlockIndex}
              onChange={(e) =>
                setAccessTarget(
                  accessTargetFileName,
                  Math.min(maxLogicalIndex, Math.max(0, parseInt(e.target.value || '0', 10)))
                )
              }
              style={{
                padding: '6px 8px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="primary"
              size="md"
              icon={<Search size={15} />}
              onClick={executeAccessSimulation}
              disabled={fileList.length === 0}
              style={{ width: '100%' }}
            >
              Trace Read Access
            </Button>
          </div>
        </div>

        {/* Access Result Visualization */}
        {lastAccessResult ? (
          <div
            style={{
              padding: '14px',
              backgroundColor: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header Result */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#22c55e" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  LOGICAL BLOCK #{lastAccessResult.logicalBlockIndex} → PHYSICAL BLOCK #{lastAccessResult.physicalBlockNumber}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Badge variant="info">{lastAccessResult.strategy}</Badge>
                <Badge variant={lastAccessResult.totalSteps === 1 ? 'success' : 'warning'}>
                  {lastAccessResult.totalSteps} Step{lastAccessResult.totalSteps === 1 ? '' : 's'} Required
                </Badge>
              </div>
            </div>

            {/* Step-by-Step Traversal Pipeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                RESOLUTION PIPELINE:
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {lastAccessResult.steps.map((st, idx) => (
                  <React.Fragment key={st.stepNumber}>
                    <button
                      onClick={() => selectBlock(st.physicalBlockNumber)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor:
                          st.role === 'INDEX'
                            ? 'rgba(234, 179, 8, 0.2)'
                            : idx === lastAccessResult.steps.length - 1
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(56, 189, 248, 0.15)',
                        border:
                          st.role === 'INDEX'
                            ? '1px solid #eab308'
                            : idx === lastAccessResult.steps.length - 1
                            ? '1px solid #22c55e'
                            : '1px solid #38bdf8',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        STEP {st.stepNumber} ({st.role})
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                        Disk Block #{st.physicalBlockNumber}
                      </span>
                    </button>

                    {idx < lastAccessResult.steps.length - 1 && (
                      <ArrowRight size={14} color="var(--color-accent)" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                padding: '8px 10px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {lastAccessResult.explanation}
            </div>

            {/* Academic Notice */}
            <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              * Note: Step counts represent simulated pointer dereferences and Inode translations. Real hardware timing is influenced by disk head seek and rotational latency.
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Click "Trace Read Access" to visualize physical block resolution and pointer hops.
          </div>
        )}
      </div>
    </Card>
  );
};
