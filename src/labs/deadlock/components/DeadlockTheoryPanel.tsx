import React from 'react';
import { Link } from 'wouter';
import { Card, Badge } from '../../../components/common';
import { BookOpen, Shield, AlertTriangle, Layers, GitCommit, ExternalLink } from 'lucide-react';

export const DeadlockTheoryPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Banner */}
      <Card padding="md" variant="subdued">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BookOpen size={18} color="var(--color-accent)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            OPERATING SYSTEMS DEADLOCK THEORY & FORMAL PRINCIPLES
          </h3>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
          An academic reference guide outlining Coffman's conditions, the fundamental distinction between Safe, Unsafe,
          and Deadlocked states, and the formal boundaries between Deadlock Prevention, Avoidance, and Detection.
        </p>
      </Card>

      {/* Distinction 1: Safe vs Unsafe vs Deadlock */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={16} color="var(--color-warning)" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              CORE DISTINCTION: SAFE STATE ≠ UNSAFE STATE ≠ DEADLOCK
            </span>
          </div>
        }
        padding="md"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <Badge variant="success" size="sm">SAFE STATE</Badge>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginTop: '6px' }}>Guaranteed Non-Deadlock</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              There exists at least one order (a <strong>Safe Sequence</strong>) in which all processes can request their maximum declared resources, execute, and terminate without deadlocking.
            </p>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Badge variant="warning" size="sm">UNSAFE STATE</Badge>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginTop: '6px' }}>Potential Risk (Not Yet Deadlock)</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              No safe execution sequence can be guaranteed. However, <strong>an unsafe state does NOT mean the system is currently deadlocked</strong>. If processes request less than their maximum claims, the system may run without deadlock.
            </p>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <Badge variant="danger" size="sm">DEADLOCKED STATE</Badge>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginTop: '6px' }}>Definitive Circular Blockage</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              Two or more processes are permanently waiting for an event (resource release) that only another blocked process in the set can cause. Forward progress is permanently impossible without external intervention.
            </p>
          </div>
        </div>
      </Card>

      {/* Coffman's 4 Conditions */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Shield size={16} color="var(--color-accent)" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              COFFMAN'S FOUR NECESSARY CONDITIONS FOR DEADLOCK
            </span>
          </div>
        }
        padding="md"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>1. Mutual Exclusion</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              At least one resource must be held in a non-shareable mode (only one process can use it at any given time).
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>2. Hold and Wait</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              A process must be concurrently holding at least one resource while waiting to acquire additional resources held by others.
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>3. No Preemption</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              Resources cannot be forcibly preempted from a process; they can only be released voluntarily after completion.
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>4. Circular Wait</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              A closed chain of processes exists such that each process holds resources requested by the next process in the chain.
            </p>
          </div>
        </div>
      </Card>

      {/* Prevention vs Avoidance vs Detection */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Layers size={16} color="var(--color-accent)" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              DEADLOCK STRATEGIES: PREVENTION vs AVOIDANCE vs DETECTION
            </span>
          </div>
        }
        padding="md"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent)' }}>Deadlock Prevention</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              <strong>Mechanism: </strong>Enforces structural constraints on requests to guarantee that at least one of the four Coffman conditions can never hold (e.g., global resource ordering, non-blocking requests).
            </p>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent)' }}>Deadlock Avoidance (Banker)</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              <strong>Mechanism: </strong>The OS is given advance knowledge of each process's maximum resource demand. For each request, the OS dynamically verifies that granting it leaves the system in a <em>Safe State</em>.
            </p>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent)' }}>Deadlock Detection</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              <strong>Mechanism: </strong>Requests are granted without restriction. Periodically, an algorithm inspects the allocation state and outstanding requests to identify deadlocked processes and initiate recovery (e.g. termination, preemption).
            </p>
          </div>
        </div>
      </Card>

      {/* Single vs Multi-Instance RAG Rule */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <GitCommit size={16} color="var(--color-accent)" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              RESOURCE ALLOCATION GRAPH CYCLE THEOREM
            </span>
          </div>
        }
        padding="md"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <Badge variant="danger" size="sm">Single-Instance Resources</Badge>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginTop: '6px' }}>Cycle is Necessary & Sufficient</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              If every resource type in the graph has exactly 1 instance, a directed cycle in the RAG is <strong>both necessary and sufficient</strong> for deadlock. The presence of a cycle definitively proves deadlock.
            </p>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <Badge variant="warning" size="sm">Multi-Instance Resources</Badge>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginTop: '6px' }}>Cycle is Necessary, NOT Sufficient</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              When resources have multiple instances, a cycle is <strong>only a necessary condition</strong>. An external process holding an instance of an involved resource may finish and release its allocation, breaking the cycle without deadlock.
            </p>
          </div>
        </div>
      </Card>

      {/* Deep Link to Comprehensive Academic Docs */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
        <Link href="/docs/deadlock">
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
            <span>Explore Complete Deadlock, Banker & RAG Theory in Docs</span>
            <ExternalLink size={13} />
          </button>
        </Link>
      </div>
    </div>
  );
};
