import React from 'react';
import { Link } from 'wouter';
import {
  Layers,
  Cpu,
  Database,
  Lock,
  HardDrive,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { Card, Badge, Button, StatusBadge } from '../../components/common';
import { useDocumentTitle } from '../../core/utils/useDocumentTitle';

interface LabCardData {
  title: string;
  icon: React.ReactNode;
  phase: string;
  desc: string;
  route: string;
  color: string;
  bgSubtle: string;
  tags: string[];
}

export const LandingView: React.FC = () => {
  useDocumentTitle('Overview & System Status', 'OScope — Interactive Operating System Observatory. Visualizing the hidden operations of an Operating System.');

  const subsystemStatuses = [
    { name: 'Central OS Observatory', status: 'READY' as const, phase: 'Integrated', route: '/observatory' },
    { name: 'Process Management & PCB', status: 'READY' as const, phase: 'Phase 04', route: '/process' },
    { name: 'CPU Scheduling Laboratory', status: 'READY' as const, phase: 'Phase 05', route: '/scheduling' },
    { name: 'Memory & Address Translation', status: 'READY' as const, phase: 'Phase 06', route: '/memory' },
    { name: 'Deadlock & Banker Algorithm', status: 'READY' as const, phase: 'Phase 07', route: '/deadlock' },
    { name: 'File System & Inodes', status: 'READY' as const, phase: 'Phase 08', route: '/filesystem' },
  ];

  const labCards: LabCardData[] = [
    {
      title: 'Central OS Observatory',
      icon: <Activity size={24} color="#38BDF8" />,
      phase: 'Integrated',
      desc: 'Cross-subsystem topology, real-time normalized event terminal, and "Follow a Process" tracker across all virtual kernels.',
      route: '/observatory',
      color: '#38BDF8',
      bgSubtle: 'rgba(56, 189, 248, 0.12)',
      tags: ['System Topology', 'Normalized Event Bus', 'Process Tracer'],
    },
    {
      title: 'Process Management & PCB',
      icon: <Layers size={24} color="#10B981" />,
      phase: 'Phase 04',
      desc: 'Interactive 5-state lifecycle diagrams, complete Process Control Block (PCB) registers, and Ready/Waiting queue telemetry.',
      route: '/process',
      color: '#10B981',
      bgSubtle: 'rgba(16, 185, 129, 0.12)',
      tags: ['State Transitions', 'PCB Registers', 'Priority Queues'],
    },
    {
      title: 'CPU Scheduling Laboratory',
      icon: <Cpu size={24} color="#A78BFA" />,
      phase: 'Phase 05',
      desc: 'Dynamic Gantt charts with context-switch counting, side-by-side metric comparison across 6 standard scheduling algorithms.',
      route: '/scheduling',
      color: '#A78BFA',
      bgSubtle: 'rgba(167, 139, 250, 0.12)',
      tags: ['Interactive Gantt', 'FCFS • SJF • Round Robin', 'Turnaround / Waiting'],
    },
    {
      title: 'Memory Management & Paging',
      icon: <Database size={24} color="#38BDF8" />,
      phase: 'Phase 06',
      desc: 'Virtual address breakdown into VPN/Offset, Translation Lookaside Buffer (TLB), and FIFO/LRU/Optimal page replacement.',
      route: '/memory',
      color: '#38BDF8',
      bgSubtle: 'rgba(56, 189, 248, 0.12)',
      tags: ['TLB Hit / Miss', 'Page Tables', 'FIFO • LRU • Optimal'],
    },
    {
      title: 'Deadlock & Banker Laboratory',
      icon: <Lock size={24} color="#F59E0B" />,
      phase: 'Phase 07',
      desc: "Banker's Algorithm safety state verification with step-by-step Work vectors and Resource Allocation Graph (RAG) cycle detection.",
      route: '/deadlock',
      color: '#F59E0B',
      bgSubtle: 'rgba(245, 158, 11, 0.12)',
      tags: ["Banker's Safety", 'Need Matrix', 'RAG Cycle Detection'],
    },
    {
      title: 'Virtual Disk & Storage',
      icon: <HardDrive size={24} color="#38BDF8" />,
      phase: 'Phase 08',
      desc: 'Interactive block allocation visualizers (contiguous, linked, indexed), Inode tables, and free-space bitmap management.',
      route: '/filesystem',
      color: '#38BDF8',
      bgSubtle: 'rgba(56, 189, 248, 0.12)',
      tags: ['Contiguous • Linked • Indexed', 'Inode Registry', 'Fragmentation Diagnosis'],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
      {/* Hero Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
          padding: 'var(--space-8) var(--space-8)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          backgroundImage: 'radial-gradient(ellipse at top left, rgba(56, 189, 248, 0.12) 0%, transparent 65%), radial-gradient(ellipse at bottom right, rgba(167, 139, 250, 0.08) 0%, transparent 60%)',
          position: 'relative',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Badge variant="info" size="md" dot>
            University Operating Systems Laboratory
          </Badge>
          <Badge variant="ready" size="md">
            Phase 10 — Exhibition Ready
          </Badge>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontWeight: 600 }}>
            <CheckCircle2 size={15} /> All Laboratories Operational
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #38BDF8 50%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}
          >
            OScope
          </h1>
          <p
            style={{
              fontSize: '1.35rem',
              fontWeight: 600,
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            “Visualizing the hidden operations of an Operating System.”
          </p>
          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '820px',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            An interactive, academically rigorous Operating System observatory. Designed for students,
            researchers, and educators to explore process lifecycle states, CPU scheduling algorithms,
            virtual address translation, deadlock prevention, and storage block allocation through
            deterministic, verifiable simulation telemetry.
          </p>
        </div>

        {/* Quick Feature Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Zap size={14} color="var(--color-accent)" /> 6 Interactive Simulators
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <ShieldCheck size={14} color="var(--color-success)" /> Deterministic State (Zero Arbitrary RNG)
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <BookOpen size={14} color="var(--color-ready)" /> Silberschatz & Galvin Curriculum Aligned
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Link href="/observatory">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              style={{
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
                fontWeight: 700,
                padding: '12px 24px',
                fontSize: '1rem',
              }}
            >
              Enter Central Observatory
            </Button>
          </Link>
          <Link href="/scheduling">
            <Button
              variant="secondary"
              size="lg"
              icon={<Cpu size={20} />}
              style={{ padding: '12px 20px', fontSize: '1rem' }}
            >
              Explore Schedulers
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              variant="outline"
              size="lg"
              icon={<BookOpen size={20} />}
              style={{ padding: '12px 20px', fontSize: '1rem' }}
            >
              Academic Docs & Viva
            </Button>
          </Link>
        </div>
      </div>

      {/* Subsystem Readiness Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Subsystem Status Matrix
          </h2>
          <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            All Laboratories Operational
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          {subsystemStatuses.map((subsystem) => (
            <Link key={subsystem.name} href={subsystem.route}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="oscope-card--interactive"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Terminal size={16} color="var(--color-accent)" />
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {subsystem.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    {subsystem.phase}
                  </span>
                  <StatusBadge status={subsystem.status} size="sm" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Operational Observatory Laboratories (Main Interactive Labs) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Operational Observatory Laboratories
          </h2>
          <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
            Select a laboratory to begin simulation
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
          {labCards.map((lab) => (
            <Link key={lab.title} href={lab.route}>
              <Card
                variant="interactive"
                padding="md"
                style={{ height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: lab.bgSubtle,
                        border: `1px solid ${lab.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {lab.icon}
                    </div>
                    <Badge variant="outline" size="sm">
                      {lab.phase}
                    </Badge>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
                      {lab.title}
                    </h3>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {lab.desc}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'var(--space-2)' }}>
                    {lab.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: lab.color,
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <span>Launch Laboratory</span>
                  <ArrowRight size={16} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Academic Architectural Pillars
        </h2>

        <Card variant="default" padding="lg">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)',
                  height: 'fit-content',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
                  Deterministic State Simulation
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Algorithm implementations run purely on client-side state engines with discrete virtual clocks,
                  guaranteeing zero synthetic placeholder values or arbitrary randomness.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-success-subtle)',
                  color: 'var(--color-success)',
                  height: 'fit-content',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
                  Mathematical Verification
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Every simulation step emits verifiable invariant checks: Gantt makespan balances, Work vector
                  progression in Banker's safety, and physical frame residency.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-ready-subtle)',
                  color: 'var(--color-ready)',
                  height: 'fit-content',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
                  Standard Curriculum Alignment
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Standardized on Silberschatz, Galvin & Gagne principles: FCFS, SJF, SRTF, Round Robin, FIFO/LRU/Optimal
                  paging, Wait-For Graphs, and multi-strategy disk allocation.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Academic Integrity Disclaimer */}
      <div
        style={{
          padding: 'var(--space-5) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface-subdued)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <BookOpen size={24} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--color-text-secondary)' }}>Academic Software Notice:</strong> OScope is an interactive simulation and visualization platform
          for Operating Systems concepts. It runs entirely client-side and does not inspect host hardware or kernel
          internals. All metrics derive from deterministic simulation algorithms.
        </p>
      </div>
    </div>
  );
};
