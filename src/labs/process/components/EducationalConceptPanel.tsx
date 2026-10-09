import React from 'react';
import type { ProcessState } from '../../../core/models/process';
import { Card, Badge } from '../../../components/common';
import { BookOpen } from 'lucide-react';

interface EducationalConceptPanelProps {
  currentState: ProcessState | null;
}

export const EducationalConceptPanel: React.FC<EducationalConceptPanelProps> = ({ currentState }) => {
  const concepts: Record<
    ProcessState,
    { title: string; concept: string; whyTransition: string; reference: string }
  > = {
    NEW: {
      title: 'State: NEW (Process Initialization)',
      concept:
        'The process is being created. The operating system kernel allocates memory for the Process Control Block (PCB), initializes registers (PC=0), and prepares address space bounds.',
      whyTransition:
        'Transition [NEW → READY]: Occurs when the long-term scheduler (or job scheduler) admits the process into main memory, inserting its PCB into the Ready Queue.',
      reference: 'Silberschatz & Galvin: Section 3.1.2 (Process State)',
    },
    READY: {
      title: 'State: READY (Awaiting CPU Dispatch)',
      concept:
        'The process resides in main memory and is prepared to execute immediately, but is waiting for the operating system to allocate processor time.',
      whyTransition:
        'Transition [READY → RUNNING]: Occurs when the short-term scheduler (CPU dispatcher) selects this process from the Ready Queue and loads its register context into the CPU.',
      reference: 'Silberschatz & Galvin: Section 3.1.2 & Chapter 5',
    },
    RUNNING: {
      title: 'State: RUNNING (Instruction Execution)',
      concept:
        'The process instructions are actively executing on the CPU core. The Program Counter (PC) increments with each fetch-decode-execute cycle.',
      whyTransition:
        'Transitions from RUNNING:\n• [RUNNING → WAITING]: Process initiates an I/O request or system call.\n• [RUNNING → READY]: Timer interrupt expires (preemption) or process yields.\n• [RUNNING → TERMINATED]: Process finishes its last instruction (burst = 0).',
      reference: 'Silberschatz & Galvin: Section 3.1.2',
    },
    WAITING: {
      title: 'State: WAITING / BLOCKED (Awaiting Event)',
      concept:
        'The process cannot execute even if the CPU is free because it is waiting for an external event, such as disk I/O, user input, or inter-process signaling.',
      whyTransition:
        'Transition [WAITING → READY]: The I/O hardware controller raises an interrupt signaling data transfer completion. The OS moves the PCB from the device queue back to the Ready Queue.',
      reference: 'Silberschatz & Galvin: Section 3.1.3 (Process Scheduling)',
    },
    TERMINATED: {
      title: 'State: TERMINATED (Process Exit)',
      concept:
        'The process has finished execution. The operating system reclaims its virtual memory frames, open file handles, and hardware registers while keeping final exit metrics for its parent process.',
      whyTransition:
        'Terminal State: No further lifecycle transitions are allowed. Final turnaround time and waiting time are locked into kernel accounting.',
      reference: 'Silberschatz & Galvin: Section 3.2.3 (Process Termination)',
    },
  };

  const active = currentState ? concepts[currentState] : null;

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <BookOpen size={18} color="var(--color-ready)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9375rem' }}>
              ACADEMIC THEORY & CONCEPT
            </span>
          </div>
          <Badge variant="outline" size="md">
            University Syllabus Guide
          </Badge>
        </div>
      }
      padding="md"
      variant="subdued"
    >
      {active ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {active.title}
          </h4>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
            {active.concept}
          </p>
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem',
              color: 'var(--color-accent)',
              whiteSpace: 'pre-line',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>Underlying OS Mechanic:</strong>
            <br />
            {active.whyTransition}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            Ref: {active.reference}
          </span>
        </div>
      ) : (
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', fontStyle: 'italic', padding: 'var(--space-2) 0' }}>
          Select any process or trigger a state transition to review academic notes on the underlying kernel operation.
        </div>
      )}
    </Card>
  );
};
