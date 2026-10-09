/**
 * OScope — File System & Storage Allocation Educational Theory Panel
 * Academic reference covering VFS, Inodes, Contiguous/Linked/Indexed allocation,
 * fragmentation mechanics, access paths, and free-space tracking.
 */

import React from 'react';
import { Link } from 'wouter';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Card, Badge } from '../../../components/common';

export const FileSystemTheoryPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Overview Banner */}
      <Card padding="md" variant="subdued">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <BookOpen size={20} color="var(--color-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
              Operating Systems Storage Allocation & Inode Theory
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
              The Operating System file system abstracts raw physical sectors into logical files and directories.
              The primary challenge is <strong>disk block allocation</strong>: determining where and how file bytes
              are organized across secondary storage to maximize access speed and space efficiency.
            </p>
          </div>
        </div>
      </Card>

      {/* 4 Academic Concepts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Contiguous Allocation */}
        <Card padding="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                1. Contiguous Allocation
              </span>
              <Badge variant="info">Consecutive Extents</Badge>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Each file occupies a contiguous set of adjacent blocks on disk.
              <br /><br />
              <strong>Strengths:</strong> Outstanding sequential and random read performance. Random access is resolved by:
              <br />
              <code style={{ color: 'var(--color-accent)', fontSize: '0.625rem' }}>PhysicalBlock = BaseBlock + LogicalOffset</code>
              <br /><br />
              <strong>Weakness:</strong> Suffers heavily from <em>External Fragmentation</em>. Over time, file deletions leave free "holes". Even if sufficient total free space exists, large files cannot be allocated if no single contiguous extent is big enough.
            </p>
          </div>
        </Card>

        {/* Linked Allocation */}
        <Card padding="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#4ade80' }}>
                2. Linked Allocation
              </span>
              <Badge variant="success">Pointer Chains</Badge>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Each file is a linked list of scattered disk blocks. The directory entry / Inode points to the head block, and each block contains a physical pointer to the next block (with <code style={{ color: '#ef4444' }}>-1 (EOF)</code> marking the end).
              <br /><br />
              <strong>Strengths:</strong> Zero external fragmentation. Any free block anywhere on disk can be immediately allocated.
              <br /><br />
              <strong>Weakness:</strong> Extremely slow direct/random access. Accessing logical block <code style={{ color: 'var(--color-accent)' }}>k</code> requires traversing <code style={{ color: 'var(--color-accent)' }}>k</code> sequential pointer hops across the disk. Pointer loss or corruption destroys the remainder of the file.
            </p>
          </div>
        </Card>

        {/* Indexed Allocation */}
        <Card padding="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fde047' }}>
                3. Indexed Allocation
              </span>
              <Badge variant="warning">Dedicated Index Block</Badge>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Brings all pointers together into a dedicated <strong>Index Block</strong>. The Inode points to the index block, which contains an array of direct pointers to data blocks.
              <br /><br />
              <strong>Strengths:</strong> Supports fast random access without external fragmentation. Reading block <code style={{ color: 'var(--color-accent)' }}>k</code> takes only 2 disk reads: read index block, then directly read block <code style={{ color: 'var(--color-accent)' }}>Index[k]</code>.
              <br /><br />
              <strong>Trade-off:</strong> Index block overhead. Every file requires at least 1 dedicated metadata block, even for tiny 1-byte files.
            </p>
          </div>
        </Card>

        {/* Educational Inode Structure */}
        <Card padding="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#a855f7' }}>
                4. Educational Inode Concept
              </span>
              <Badge variant="outline">Unix-like Metadata</Badge>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              An <strong>Index Node (Inode)</strong> stores file metadata independently of directory names.
              <br /><br />
              <strong>Core Inode Fields:</strong>
              <br />
              • Inode Number & File Size (bytes)
              <br />
              • Allocation Strategy tag
              <br />
              • Direct Block Pointers array
              <br />
              • Index / Indirect pointer reference
              <br />
              • Internal Fragmentation tally
              <br /><br />
              A directory entry merely pairs a human-readable filename with an Inode number: <code style={{ color: 'var(--color-accent)' }}>("thesis.pdf", Inode #4)</code>.
            </p>
          </div>
        </Card>
      </div>

      {/* Deep Link to Comprehensive Academic Docs */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
        <Link href="/docs/filesystem">
          <button
            type="button"
            className="btn-interactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--color-accent)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              cursor: 'pointer'
            }}
          >
            <span>Explore Inode Structures, Allocation Comparisons & Fragmentation in Docs</span>
            <ExternalLink size={13} />
          </button>
        </Link>
      </div>
    </div>
  );
};
