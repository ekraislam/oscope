/**
 * OScope — Educational Inode Inspector Component
 * Visualizes Unix-like Inode structure: file size, allocation strategy,
 * direct data block pointers, index block pointer, and internal fragmentation.
 */

import React from 'react';
import { Database, FileCode, ArrowRight, HelpCircle } from 'lucide-react';
import { Card, Badge, Button } from '../../../components/common';
import { useFileSystemStore } from '../../../state/useFileSystemStore';
import type { Inode } from '../../../core/models/filesystem';

export const InodeInspector: React.FC = () => {
  const state = useFileSystemStore((s) => s.state);
  const selectedInodeNumber = useFileSystemStore((s) => s.selectedInodeNumber);
  const selectInode = useFileSystemStore((s) => s.selectInode);
  const selectBlock = useFileSystemStore((s) => s.selectBlock);
  const generateExplanation = useFileSystemStore((s) => s.generateExplanation);

  const selectedInode: Inode | undefined = selectedInodeNumber !== null
    ? state.inodes[selectedInodeNumber]
    : undefined;

  const inodeList = Object.values(state.inodes);

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
            <Database size={16} color="var(--color-accent)" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
              Educational Inode Inspector
            </h3>
          </div>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            Total Inodes: {inodeList.length}
          </span>
        </div>

        {selectedInode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Primary Details Card */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(0,0,0,0.25)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCode size={15} color="var(--color-accent)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    INODE #{selectedInode.inodeNumber}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    ({selectedInode.fileName})
                  </span>
                </div>
                <Badge
                  variant={
                    selectedInode.allocationStrategy === 'CONTIGUOUS'
                      ? 'info'
                      : selectedInode.allocationStrategy === 'LINKED'
                      ? 'success'
                      : 'warning'
                  }
                >
                  {selectedInode.allocationStrategy}
                </Badge>
              </div>

              {/* Data Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>FILE SIZE: </span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    {selectedInode.fileSizeBytes} Bytes
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>BLOCK COUNT: </span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    {selectedInode.blockCount} Block{selectedInode.blockCount === 1 ? '' : 's'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>INTERNAL FRAG: </span>
                  <strong style={{ color: selectedInode.internalFragmentationBytes > 0 ? '#fbbf24' : 'var(--color-success)' }}>
                    {selectedInode.internalFragmentationBytes} Bytes
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>STORAGE OCCUPIED: </span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    {selectedInode.blockCount * state.blockSizeBytes} Bytes
                  </strong>
                </div>
              </div>
            </div>

            {/* Block Pointers Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {selectedInode.allocationStrategy === 'INDEXED'
                  ? 'INDEX BLOCK & DATA POINTERS'
                  : selectedInode.allocationStrategy === 'LINKED'
                  ? 'POINTER CHAIN (TRAVERSAL SEQUENCE)'
                  : 'DIRECT DATA BLOCK EXTENT'}
              </span>

              {/* Indexed Strategy Pointer Map */}
              {selectedInode.allocationStrategy === 'INDEXED' && (
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: 'rgba(234, 179, 8, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#fde047', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      INDEX BLOCK:
                    </span>
                    <button
                      onClick={() => selectBlock(selectedInode.indexBlock ?? null)}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(234, 179, 8, 0.25)',
                        border: '1px solid #eab308',
                        borderRadius: '2px',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#fef08a',
                        cursor: 'pointer',
                      }}
                    >
                      Block #{selectedInode.indexBlock}
                    </button>
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                      (Metadata overhead)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Points to:
                    </span>
                    {selectedInode.directBlocks.map((b, idx) => (
                      <button
                        key={b}
                        onClick={() => selectBlock(b)}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: 'rgba(56, 189, 248, 0.2)',
                          border: '1px solid #38bdf8',
                          borderRadius: '2px',
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#bae6fd',
                          cursor: 'pointer',
                        }}
                      >
                        [L{idx} → #{b}]
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Strategy Chain */}
              {selectedInode.allocationStrategy === 'LINKED' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexWrap: 'wrap',
                    padding: '8px',
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <span style={{ fontSize: '0.6875rem', color: '#4ade80', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    HEAD:
                  </span>
                  {selectedInode.directBlocks.map((b, idx) => (
                    <React.Fragment key={b}>
                      <button
                        onClick={() => selectBlock(b)}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid #22c55e',
                          borderRadius: '2px',
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: '#bbf7d0',
                          cursor: 'pointer',
                        }}
                      >
                        #{b}
                      </button>
                      {idx < selectedInode.directBlocks.length - 1 ? (
                        <ArrowRight size={12} color="#4ade80" />
                      ) : (
                        <span style={{ fontSize: '0.6875rem', color: '#ef4444', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          → EOF
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Contiguous Strategy Run */}
              {selectedInode.allocationStrategy === 'CONTIGUOUS' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexWrap: 'wrap',
                    padding: '8px',
                    backgroundColor: 'rgba(56, 189, 248, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <span style={{ fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    EXTENT:
                  </span>
                  {selectedInode.directBlocks.map((b) => (
                    <button
                      key={b}
                      onClick={() => selectBlock(b)}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(56, 189, 248, 0.2)',
                        border: '1px solid #38bdf8',
                        borderRadius: '2px',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: '#bae6fd',
                        cursor: 'pointer',
                      }}
                    >
                      #{b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Explain Inode Button */}
            <Button
              variant="outline"
              size="sm"
              icon={<HelpCircle size={14} />}
              onClick={generateExplanation}
            >
              Explain This Inode & Layout
            </Button>
          </div>
        ) : (
          /* When no Inode is specifically selected, list all available Inodes */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Select an Inode below or click a file / disk block:
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '340px',
                overflowY: 'auto',
              }}
            >
              {inodeList.map((ino) => (
                <div
                  key={ino.inodeNumber}
                  onClick={() => selectInode(ino.inodeNumber)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                      #{ino.inodeNumber}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {ino.fileName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Badge variant="outline">{ino.allocationStrategy}</Badge>
                    <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      {ino.blockCount} blk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
