/**
 * OScope — Virtual Disk Heatmap & Storage Telemetry Component
 * Displays responsive, interactive disk block map with semantic color encoding,
 * block numbers, file ownership, linked pointers, and index block roles.
 */

import React from 'react';
import { HardDrive, Layers } from 'lucide-react';
import { Card, Badge } from '../../../components/common';
import { useFileSystemStore } from '../../../state/useFileSystemStore';

export const VirtualDiskHeatmap: React.FC = () => {
  const state = useFileSystemStore((s) => s.state);
  const selectedBlockNumber = useFileSystemStore((s) => s.selectedBlockNumber);
  const selectedInodeNumber = useFileSystemStore((s) => s.selectedInodeNumber);
  const freeSpaceAnalysis = useFileSystemStore((s) => s.freeSpaceAnalysis);
  const selectBlock = useFileSystemStore((s) => s.selectBlock);
  const preview = useFileSystemStore((s) => s.preview);

  const totalBlocks = state.totalBlocks;
  const freeBlocks = state.freeBlocksCount;
  const allocatedBlocks = totalBlocks - freeBlocks;
  const usagePercentage = Math.round((allocatedBlocks / totalBlocks) * 100);

  // Identify which blocks belong to the currently selected file/inode
  const selectedFileBlockNumbers = React.useMemo(() => {
    if (selectedInodeNumber === null) return new Set<number>();
    const inode = state.inodes[selectedInodeNumber];
    if (!inode) return new Set<number>();
    const set = new Set<number>(inode.directBlocks);
    if (inode.indexBlock !== undefined) set.add(inode.indexBlock);
    return set;
  }, [state.inodes, selectedInodeNumber]);

  // Identify candidate preview blocks
  const candidateBlocksSet = React.useMemo(() => {
    if (!preview || !preview.canAllocate) return new Set<number>();
    const set = new Set<number>(preview.candidateBlocks);
    if (preview.candidateIndexBlock !== undefined) set.add(preview.candidateIndexBlock);
    return set;
  }, [preview]);

  const selectedBlock = selectedBlockNumber !== null
    ? state.diskBlocks.find((b) => b.blockNumber === selectedBlockNumber)
    : null;

  return (
    <Card padding="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header with Disk Capacity Gauge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <HardDrive size={18} color="var(--color-accent)" />
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                Virtual Storage Surface
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {totalBlocks} Blocks × {state.blockSizeBytes} Bytes ({((totalBlocks * state.blockSizeBytes) / 1024).toFixed(0)} KB Total Capacity)
              </p>
            </div>
          </div>

          {/* Metrics summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ALLOCATED:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {allocatedBlocks}/{totalBlocks} ({usagePercentage}%)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>FREE RUNS:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                {freeSpaceAnalysis.runs.length} (Max run: {freeSpaceAnalysis.largestFreeRun} blk)
              </span>
            </div>
            <Badge variant={freeBlocks === 0 ? 'danger' : usagePercentage > 80 ? 'warning' : 'success'} size="md">
              {freeBlocks} BLOCKS FREE
            </Badge>
          </div>
        </div>

        {/* Disk Capacity Bar */}
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            display: 'flex',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: `${usagePercentage}%`,
              background: 'linear-gradient(90deg, var(--color-accent) 0%, #38bdf8 100%)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
            padding: '6px 12px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)' }} />
            <span>FREE BLOCK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(56, 189, 248, 0.3)', border: '1px solid #38bdf8' }} />
            <span>FILE DATA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(234, 179, 8, 0.3)', border: '1px solid #eab308' }} />
            <span>INDEX BLOCK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(168, 85, 247, 0.4)', border: '1px solid #a855f7' }} />
            <span>SELECTED FILE</span>
          </div>
          {preview && preview.canAllocate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(34, 197, 94, 0.35)', border: '1px dashed #22c55e' }} />
              <span>ALLOCATION CANDIDATE</span>
            </div>
          )}
        </div>

        {/* Disk Block Grid — Spacious & Highly Legible */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
            gap: '10px',
            maxHeight: '460px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {state.diskBlocks.map((block) => {
            const isSelected = selectedBlockNumber === block.blockNumber;
            const isFileSelected = selectedFileBlockNumbers.has(block.blockNumber);
            const isCandidate = candidateBlocksSet.has(block.blockNumber);

            // Styling based on block role and selection state
            let bg = 'rgba(255, 255, 255, 0.03)';
            let borderColor = 'var(--color-border)';
            let textColor = 'var(--color-text-secondary)';

            if (block.role === 'INDEX') {
              bg = 'rgba(234, 179, 8, 0.16)';
              borderColor = '#eab308';
              textColor = '#fde047';
            } else if (block.role === 'DATA') {
              bg = 'rgba(56, 189, 248, 0.12)';
              borderColor = 'rgba(56, 189, 248, 0.4)';
              textColor = '#bae6fd';
            }

            if (isFileSelected) {
              bg = 'rgba(168, 85, 247, 0.22)';
              borderColor = '#a855f7';
              textColor = '#e9d5ff';
            }

            if (isCandidate) {
              bg = 'rgba(34, 197, 94, 0.2)';
              borderColor = '#22c55e';
            }

            if (isSelected) {
              borderColor = '#ffffff';
              bg = 'rgba(255, 255, 255, 0.2)';
            }

            return (
              <button
                key={block.blockNumber}
                onClick={() => selectBlock(block.blockNumber)}
                title={`Block #${block.blockNumber}: ${
                  block.isAllocated
                    ? `${block.fileName} (${block.role}) Inode #${block.inodeNumber}`
                    : 'FREE'
                }`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 6px',
                  minHeight: '74px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: bg,
                  border: `1px solid ${borderColor}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: isSelected ? '2px solid #ffffff' : 'none',
                  outlineOffset: '1px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {/* Block Number & Role */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    padding: '0 2px',
                  }}
                >
                  <span>#{String(block.blockNumber).padStart(2, '0')}</span>
                  {block.role === 'INDEX' ? (
                    <span style={{ fontSize: '0.75rem', color: '#fde047', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: 'rgba(234, 179, 8, 0.2)' }}>IDX</span>
                  ) : block.role === 'DATA' ? (
                    <span style={{ fontSize: '0.75rem', color: '#7dd3fc', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: 'rgba(56, 189, 248, 0.2)' }}>DAT</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>FREE</span>
                  )}
                </div>

                {/* File Label or Empty Marker */}
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: textColor,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    marginTop: '2px',
                  }}
                >
                  {block.isAllocated ? (
                    block.fileName ?? 'file'
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>—</span>
                  )}
                </div>

                {/* Footer metadata (linked pointer / inode) */}
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    marginTop: '2px',
                  }}
                >
                  {block.nextBlock !== null ? (
                    <span style={{ color: block.nextBlock === -1 ? '#ef4444' : '#38bdf8' }}>
                      {block.nextBlock === -1 ? 'EOF' : `→ #${block.nextBlock}`}
                    </span>
                  ) : block.inodeNumber !== null ? (
                    `i#${block.inodeNumber}`
                  ) : (
                    'empty'
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Block Detailed Inspector */}
        {selectedBlock ? (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Layers size={18} color="var(--color-accent)" />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  INSPECTING BLOCK #{selectedBlock.blockNumber}:
                </span>{' '}
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  {selectedBlock.isAllocated ? (
                    <>
                      Assigned to <strong>{selectedBlock.fileName}</strong> (Inode #{selectedBlock.inodeNumber}, Role:{' '}
                      <span style={{ color: selectedBlock.role === 'INDEX' ? '#fde047' : '#38bdf8', fontWeight: 700 }}>
                        {selectedBlock.role}
                      </span>
                      )
                    </>
                  ) : (
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Unallocated (In Free Pool)</span>
                  )}
                </span>
              </div>
            </div>

            {selectedBlock.nextBlock !== null && (
              <Badge variant="info" size="md">
                Linked Pointer: {selectedBlock.nextBlock === -1 ? 'End-Of-File (EOF)' : `Next Block #${selectedBlock.nextBlock}`}
              </Badge>
            )}
            {selectedBlock.isIndexBlock && (
              <Badge variant="warning" size="md">Dedicated Index Block (Holds Block Pointers)</Badge>
            )}
          </div>
        ) : null}
      </div>
    </Card>
  );
};
