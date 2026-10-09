/**
 * OScope — Concept Relationship Map
 * Deterministic visual graph and interactive conceptual dependency map
 * illustrating how processes, scheduling, memory, deadlocks, and storage interconnect.
 */

import React, { useState } from 'react';
import { Network, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

interface ConceptNode {
  readonly id: string;
  readonly label: string;
  readonly subsystem: string;
  readonly category: 'CORE' | 'MECHANISM' | 'RESULT';
  readonly description: string;
  readonly connectsTo: readonly string[];
  readonly labRoute: string;
}

const CONCEPT_NODES: readonly ConceptNode[] = [
  {
    id: 'proc',
    label: 'PROCESS',
    subsystem: 'PROCESS',
    category: 'CORE',
    description: 'A program in execution, represented by a PCB with program counter, registers, and state.',
    connectsTo: ['sched', 'mem', 'res'],
    labRoute: '/process'
  },
  {
    id: 'sched',
    label: 'CPU SCHEDULING',
    subsystem: 'SCHEDULING',
    category: 'CORE',
    description: 'Selects eligible ready processes to execute on CPU cores using algorithmic priority rules.',
    connectsTo: ['cs', 'gantt'],
    labRoute: '/scheduling'
  },
  {
    id: 'cs',
    label: 'CONTEXT SWITCH',
    subsystem: 'PROCESS',
    category: 'MECHANISM',
    description: 'Saves current CPU registers to PCB and restores the next scheduled process registers.',
    connectsTo: ['gantt'],
    labRoute: '/process'
  },
  {
    id: 'gantt',
    label: 'GANTT & METRICS',
    subsystem: 'SCHEDULING',
    category: 'RESULT',
    description: 'Visualizes CPU makespan, turnaround times (TAT), waiting times (WT), and preemption slices.',
    connectsTo: [],
    labRoute: '/scheduling'
  },
  {
    id: 'mem',
    label: 'VIRTUAL MEMORY',
    subsystem: 'MEMORY',
    category: 'CORE',
    description: 'Logical address space abstraction decoupling process memory from physical hardware RAM frames.',
    connectsTo: ['paging', 'tlb'],
    labRoute: '/memory'
  },
  {
    id: 'paging',
    label: 'PAGING & PAGE TABLE',
    subsystem: 'MEMORY',
    category: 'MECHANISM',
    description: 'Decomposes virtual address into Page Number and Offset; maps page to physical frame.',
    connectsTo: ['pf'],
    labRoute: '/memory'
  },
  {
    id: 'tlb',
    label: 'TLB CACHE',
    subsystem: 'MEMORY',
    category: 'MECHANISM',
    description: 'High-speed hardware associative cache of recent address translations. TLB Miss != Page Fault.',
    connectsTo: ['pf'],
    labRoute: '/memory'
  },
  {
    id: 'pf',
    label: 'PAGE FAULT & REPLACEMENT',
    subsystem: 'MEMORY',
    category: 'RESULT',
    description: 'Handles non-resident pages via FIFO, LRU, or Optimal replacement; demonstrates Belady anomaly.',
    connectsTo: [],
    labRoute: '/memory'
  },
  {
    id: 'res',
    label: 'SYSTEM RESOURCES',
    subsystem: 'DEADLOCK',
    category: 'CORE',
    description: 'Exclusive hardware and software resources requested, allocated, and released by processes.',
    connectsTo: ['coffman', 'rag'],
    labRoute: '/deadlock'
  },
  {
    id: 'coffman',
    label: 'COFFMAN CONDITIONS',
    subsystem: 'DEADLOCK',
    category: 'MECHANISM',
    description: 'All 4 conditions required: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
    connectsTo: ['banker'],
    labRoute: '/deadlock'
  },
  {
    id: 'rag',
    label: 'RAG & CYCLES',
    subsystem: 'DEADLOCK',
    category: 'MECHANISM',
    description: 'Bipartite graph modeling requests and allocations. Cycle = Deadlock in single-instance only.',
    connectsTo: ['banker'],
    labRoute: '/deadlock'
  },
  {
    id: 'banker',
    label: "BANKER'S ALGORITHM",
    subsystem: 'DEADLOCK',
    category: 'RESULT',
    description: 'Proactive avoidance verifying Need <= Work to guarantee Safe State (Unsafe != Deadlocked).',
    connectsTo: [],
    labRoute: '/deadlock'
  },
  {
    id: 'file',
    label: 'FILE & DIRECTORY',
    subsystem: 'FILESYSTEM',
    category: 'CORE',
    description: 'Named persistent byte stream abstraction; directory maps path names to internal Inodes.',
    connectsTo: ['inode'],
    labRoute: '/filesystem'
  },
  {
    id: 'inode',
    label: 'INODE POINTERS',
    subsystem: 'FILESYSTEM',
    category: 'MECHANISM',
    description: 'Stores metadata (size, permissions) and direct/indexed block addresses for file storage.',
    connectsTo: ['alloc'],
    labRoute: '/filesystem'
  },
  {
    id: 'alloc',
    label: 'STORAGE ALLOCATION',
    subsystem: 'FILESYSTEM',
    category: 'RESULT',
    description: 'Contiguous vs Linked vs Indexed strategies; demonstrates internal vs external fragmentation.',
    connectsTo: [],
    labRoute: '/filesystem'
  }
];

export const ConceptRelationshipMap: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('proc');
  const selectedNode = CONCEPT_NODES.find((n) => n.id === selectedNodeId) || CONCEPT_NODES[0];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-primary)' }}>
          <Network size={18} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Operating System Concept Relationship Map
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Interactive dependency flow across all major Operating System domains
          </span>
        </div>
      </div>

      {/* Interactive Concept Node Grid / Flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Stream 1: Process & Scheduling */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Process Execution & CPU Scheduling Subsystem
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <NodePill node={CONCEPT_NODES[0]} isSelected={selectedNodeId === 'proc'} onClick={() => setSelectedNodeId('proc')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[1]} isSelected={selectedNodeId === 'sched'} onClick={() => setSelectedNodeId('sched')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[2]} isSelected={selectedNodeId === 'cs'} onClick={() => setSelectedNodeId('cs')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[3]} isSelected={selectedNodeId === 'gantt'} onClick={() => setSelectedNodeId('gantt')} />
          </div>
        </div>

        {/* Stream 2: Memory & Address Translation */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981', textTransform: 'uppercase', marginBottom: '8px' }}>
            Virtual Memory & Paging Subsystem
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <NodePill node={CONCEPT_NODES[4]} isSelected={selectedNodeId === 'mem'} onClick={() => setSelectedNodeId('mem')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[5]} isSelected={selectedNodeId === 'paging'} onClick={() => setSelectedNodeId('paging')} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>+</span>
            <NodePill node={CONCEPT_NODES[6]} isSelected={selectedNodeId === 'tlb'} onClick={() => setSelectedNodeId('tlb')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[7]} isSelected={selectedNodeId === 'pf'} onClick={() => setSelectedNodeId('pf')} />
          </div>
        </div>

        {/* Stream 3: Deadlock & Concurrency */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Deadlock, Graph Models & Safety Subsystem
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <NodePill node={CONCEPT_NODES[8]} isSelected={selectedNodeId === 'res'} onClick={() => setSelectedNodeId('res')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[9]} isSelected={selectedNodeId === 'coffman'} onClick={() => setSelectedNodeId('coffman')} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>+</span>
            <NodePill node={CONCEPT_NODES[10]} isSelected={selectedNodeId === 'rag'} onClick={() => setSelectedNodeId('rag')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[11]} isSelected={selectedNodeId === 'banker'} onClick={() => setSelectedNodeId('banker')} />
          </div>
        </div>

        {/* Stream 4: Storage & Filesystem */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#a855f7', textTransform: 'uppercase', marginBottom: '8px' }}>
            Secondary Storage & File System Subsystem
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <NodePill node={CONCEPT_NODES[12]} isSelected={selectedNodeId === 'file'} onClick={() => setSelectedNodeId('file')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[13]} isSelected={selectedNodeId === 'inode'} onClick={() => setSelectedNodeId('inode')} />
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <NodePill node={CONCEPT_NODES[14]} isSelected={selectedNodeId === 'alloc'} onClick={() => setSelectedNodeId('alloc')} />
          </div>
        </div>
      </div>

      {/* Selected Node Academic Inspector */}
      {selectedNode && (
        <div
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                {selectedNode.subsystem}
              </span>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {selectedNode.label}
              </h4>
            </div>

            <Link href={selectedNode.labRoute}>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span>Open in Laboratory</span>
                <ExternalLink size={12} />
              </button>
            </Link>
          </div>

          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
            {selectedNode.description}
          </p>
        </div>
      )}
    </div>
  );
};

const NodePill: React.FC<{
  node: ConceptNode;
  isSelected: boolean;
  onClick: () => void;
}> = ({ node, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 'var(--radius-xs)',
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        border: '1px solid',
        borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'var(--color-surface)',
        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      {node.label}
    </button>
  );
};
