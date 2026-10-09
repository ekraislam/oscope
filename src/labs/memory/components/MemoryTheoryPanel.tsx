import React from 'react';
import { Link } from 'wouter';
import { Card, Badge } from '../../../components/common';
import { BookOpen, ExternalLink } from 'lucide-react';

export const MemoryTheoryPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Paging & Virtual Memory */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <BookOpen size={18} color="var(--color-accent)" />
              <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                VIRTUAL MEMORY & HARDWARE PAGING
              </span>
            </div>
            <Badge variant="info" size="sm">
              Core Architecture
            </Badge>
          </div>
        }
        padding="md"
        variant="default"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)', lineHeight: 1.65 }}>
            <strong>Paging</strong> is a memory-management scheme that permits the physical address space of a process to be
            non-contiguous. Physical memory is broken into fixed-sized blocks called <strong>Frames</strong>, and virtual
            memory is divided into blocks of the same size called <strong>Pages</strong>.
          </p>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-subdued)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.7,
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-accent)' }}>Virtual Address Formula:</strong> Virtual Address = [ Page Number (p) | Offset (d) ]
            </div>
            <div>
              • Offset bits: d = log2(PageSize)
            </div>
            <div>
              • Page number: p = floor(VirtualAddress / PageSize)
            </div>
            <div>
              • Physical Address: PhysicalAddress = FrameNumber * PageSize + Offset
            </div>
          </div>
        </div>
      </Card>

      {/* Critical Terminology Distinctions */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
              CRITICAL TERMINOLOGY DISTINCTIONS (SECTION 40)
            </span>
            <Badge variant="warning" size="sm">
              Academic Precision
            </Badge>
          </div>
        }
        padding="md"
        variant="default"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
          {/* TLB Hit */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
              TLB HIT
            </div>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              The translation is present in the high-speed associative hardware cache. Resolved immediately without
              accessing memory-resident page tables.
            </p>
          </div>

          {/* TLB Miss */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
              TLB MISS ≠ PAGE FAULT
            </div>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              The translation is simply not cached in the TLB. The MMU now accesses the main Page Table. If the page table
              entry is VALID, it is a Page Table Hit, NOT a page fault!
            </p>
          </div>

          {/* Page Fault */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--color-danger)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
              PAGE FAULT
            </div>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              The requested page is not resident in physical memory (Valid bit = 0). A hardware trap suspends the process,
              and the OS kernel page-fault routine loads the page from backing store.
            </p>
          </div>
        </div>
      </Card>

      {/* Page Replacement Algorithms Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {/* FIFO */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
              FIFO (First-In, First-Out)
            </span>
            <Badge variant="outline" size="sm">Queue-Based</Badge>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
            Maintains a FIFO queue of pages resident in physical memory. When replacement is required, the page at the head
            of the queue (oldest arrival) is evicted.
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-warning)', fontStyle: 'italic' }}>
            <strong>Vulnerability:</strong> Susceptible to Bélády’s Anomaly.
          </div>
        </div>

        {/* LRU */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
              LRU (Least Recently Used)
            </span>
            <Badge variant="success" size="sm">Stack Algorithm</Badge>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
            Evicts the page that has not been referenced for the longest period of time. Approximates the Optimal algorithm
            by looking backward into past temporal locality.
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontStyle: 'italic' }}>
            <strong>Guarantee:</strong> Immune to Bélády’s Anomaly (Stack Algorithm).
          </div>
        </div>

        {/* Optimal */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
              OPT (Optimal / Bélády’s MIN)
            </span>
            <Badge variant="info" size="sm">Theoretical Benchmark</Badge>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
            Evicts the page that will not be used for the longest period of time in the future. Requires an oracle with future
            reference knowledge; serves as the absolute lower-bound metric for evaluating other policies.
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-info)', fontStyle: 'italic' }}>
            <strong>Standard:</strong> Mathematical minimum page faults.
          </div>
        </div>
      </div>

      {/* Deep Link to Comprehensive Academic Docs */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
        <Link href="/docs/memory">
          <button
            type="button"
            className="btn-interactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--color-accent)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer'
            }}
          >
            <span>Explore Virtual Memory, TLB & Replacement Proofs in Docs</span>
            <ExternalLink size={15} />
          </button>
        </Link>
      </div>
    </div>
  );
};
