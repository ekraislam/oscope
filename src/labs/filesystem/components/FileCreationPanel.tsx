/**
 * OScope — Interactive File Creation & Live Allocation Preview Component
 * Form for file creation with real-time pre-allocation feasibility checks,
 * external fragmentation warnings, and strategy selection.
 */

import React from 'react';
import { PlusCircle, FilePlus, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, Badge, Button } from '../../../components/common';
import { useFileSystemStore } from '../../../state/useFileSystemStore';
import type { AllocationStrategy } from '../../../core/models/filesystem';

export const FileCreationPanel: React.FC = () => {
  const creationForm = useFileSystemStore((s) => s.creationForm);
  const preview = useFileSystemStore((s) => s.preview);
  const updateCreationForm = useFileSystemStore((s) => s.updateCreationForm);
  const executeFileCreation = useFileSystemStore((s) => s.executeFileCreation);
  const freeSpaceAnalysis = useFileSystemStore((s) => s.freeSpaceAnalysis);

  const handleStrategyChange = (strat: AllocationStrategy) => {
    updateCreationForm({ strategy: strat });
  };

  const handlePresetSize = (bytes: number) => {
    updateCreationForm({ sizeBytes: bytes });
  };

  return (
    <Card padding="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FilePlus size={16} color="var(--color-accent)" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
              File Creation & Allocation Simulator
            </h3>
          </div>
          <Badge variant="outline">Live Preview Engine</Badge>
        </div>

        {/* Strategy Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            ALLOCATION STRATEGY:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {(['CONTIGUOUS', 'LINKED', 'INDEXED'] as AllocationStrategy[]).map((strat) => {
              const isSelected = creationForm.strategy === strat;
              return (
                <button
                  key={strat}
                  onClick={() => handleStrategyChange(strat)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isSelected
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isSelected
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'var(--color-surface)',
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {strat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields: Name & Size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
              FILENAME:
            </label>
            <input
              type="text"
              value={creationForm.fileName}
              onChange={(e) => updateCreationForm({ fileName: e.target.value })}
              placeholder="e.g. data_sample.bin"
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
              FILE SIZE (BYTES):
            </label>
            <input
              type="number"
              min={0}
              step={128}
              value={creationForm.sizeBytes}
              onChange={(e) => updateCreationForm({ sizeBytes: parseInt(e.target.value || '0', 10) })}
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
        </div>

        {/* Quick Size Preset Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Quick Sizes:
          </span>
          {[512, 1024, 2500, 3900, 5000].map((s) => (
            <button
              key={s}
              onClick={() => handlePresetSize(s)}
              style={{
                padding: '2px 6px',
                fontSize: '0.625rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: creationForm.sizeBytes === s ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.2)',
                border: '1px solid var(--color-border)',
                borderRadius: '2px',
                color: creationForm.sizeBytes === s ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              {s}B
            </button>
          ))}
        </div>

        {/* Live Allocation Preview Box */}
        {preview && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: preview.canAllocate
                ? 'rgba(34, 197, 94, 0.08)'
                : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${preview.canAllocate ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {preview.canAllocate ? (
                  <CheckCircle size={14} color="#22c55e" />
                ) : (
                  <AlertTriangle size={14} color="#ef4444" />
                )}
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: preview.canAllocate ? '#22c55e' : '#ef4444',
                  }}
                >
                  {preview.canAllocate ? 'ALLOCATION FEASIBLE' : 'ALLOCATION BLOCKED'}
                </span>
              </div>
              <Badge variant={preview.canAllocate ? 'success' : 'danger'}>
                {preview.totalBlocksNeeded} Block{preview.totalBlocksNeeded === 1 ? '' : 's'} Needed
              </Badge>
            </div>

            {/* Candidate Blocks or Reason */}
            {preview.canAllocate ? (
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                <span>Candidate Blocks: </span>
                <strong style={{ color: '#86efac' }}>
                  [{preview.candidateBlocks.join(', ')}]
                </strong>
                {preview.candidateIndexBlock !== undefined && (
                  <span style={{ color: '#fde047' }}>
                    {' '}+ Index Block #{preview.candidateIndexBlock}
                  </span>
                )}
                <div style={{ marginTop: '2px', color: 'var(--color-text-muted)' }}>
                  Internal Fragmentation: {preview.internalFragmentationBytes} Bytes
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: '#fca5a5', lineHeight: 1.4 }}>
                {preview.reason}
              </div>
            )}

            {/* External Fragmentation Callout */}
            {preview.externalFragmentationBlocking && (
              <div
                style={{
                  marginTop: '4px',
                  padding: '6px 8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '2px',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#fecaca',
                }}
              >
                <strong>ACADEMIC INSIGHT:</strong> The disk possesses {freeSpaceAnalysis.totalFreeBlocks} total free blocks, but because the selected strategy is <strong>CONTIGUOUS</strong>, it requires a single uninterrupted extent. The largest available run is only {freeSpaceAnalysis.largestFreeRun} block(s). Switch to <strong>LINKED</strong> or <strong>INDEXED</strong> to allocate these scattered blocks!
              </div>
            )}
          </div>
        )}

        {/* Commit File Button */}
        <Button
          variant="primary"
          size="md"
          icon={<PlusCircle size={15} />}
          onClick={executeFileCreation}
          disabled={!preview?.canAllocate}
        >
          Commit File to Storage
        </Button>
      </div>
    </Card>
  );
};
