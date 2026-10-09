import React from 'react';
import { Link } from 'wouter';
import type { SchedulerType } from '../../../core/models';
import { Card, Badge } from '../../../components/common';
import { BookOpen, CheckCircle, AlertTriangle, Lightbulb, Server, ExternalLink } from 'lucide-react';

interface SchedulingTheoryPanelProps {
  selectedAlgorithm: SchedulerType;
}

interface TheoryContent {
  title: string;
  category: 'Non-Preemptive' | 'Preemptive';
  definition: string;
  howItWorks: readonly string[];
  advantages: readonly string[];
  disadvantages: readonly string[];
  importantObservation: string;
  realWorldUsage: string;
}

const THEORY_REGISTRY: Record<SchedulerType, TheoryContent> = {
  FCFS: {
    title: 'First-Come, First-Served (FCFS)',
    category: 'Non-Preemptive',
    definition:
      'The simplest CPU scheduling algorithm. Processes are dispatched strictly in the order they arrive in the ready queue, running uninterrupted until completion or self-blocking.',
    howItWorks: [
      'New arrivals enter the rear of the ready queue (FIFO).',
      'The CPU dispatcher continuously assigns the CPU to the head process.',
      'Once a process acquires the CPU, it holds it until termination (non-preemptive).',
      'If the queue is empty, the CPU transitions into the IDLE state.',
    ],
    advantages: [
      'Extremely simple to implement with minimal algorithmic overhead O(1).',
      'Completely starvation-free: every process will eventually reach the front of the queue.',
      'Deterministic execution behavior with predictable FIFO ordering.',
    ],
    disadvantages: [
      'Highly vulnerable to the Convoy Effect: short processes get trapped waiting behind long CPU-bound jobs.',
      'High average waiting time (AWT) compared to shortest-job algorithms.',
      'Unsuitable for interactive time-sharing systems where responsive UI feedback is mandatory.',
    ],
    importantObservation:
      'The Convoy Effect: If a CPU-intensive process arrives first at t=0 with a long burst, subsequent I/O-bound or short tasks sit idle in the ready queue, drastically lowering system throughput.',
    realWorldUsage:
      'Historically used in early batch processing systems. Modern systems use FCFS within individual priority tiers or device controller request queues.',
  },
  SJF_NON_PREEMPTIVE: {
    title: 'Shortest Job First (SJF) — Non-Preemptive',
    category: 'Non-Preemptive',
    definition:
      'Associates each ready process with the length of its next CPU burst. The process with the smallest required burst is selected next and executed to completion.',
    howItWorks: [
      'Processes arrive and enter the pool of eligible ready tasks.',
      'At each scheduling decision point, the scheduler scans all currently arrived processes and selects the one with the minimum burst time.',
      'If two processes have identical burst times, tie-breaking falls back to earliest arrival time, then natural PID order.',
      'Once running, the process retains the CPU until its burst finishes (non-preemptive).',
    ],
    advantages: [
      'Provably optimal in minimizing average waiting time (AWT) among all non-preemptive scheduling algorithms.',
      'Maximizes process throughput for mixed workloads containing many short tasks.',
    ],
    disadvantages: [
      'Requires knowing future CPU burst lengths in advance, which is generally impossible in general-purpose OS kernels without historical exponential smoothing.',
      'Prone to process starvation: a continuous stream of short jobs will indefinitely postpone long jobs.',
    ],
    importantObservation:
      'Non-preemptive SJF will not interrupt a long running job even if a job with burst=1 arrives one millisecond later. That newly arrived job must wait until the current long job finishes.',
    realWorldUsage:
      'Long-term job schedulers in high-performance computing (HPC) clusters where job execution times are declared by users beforehand in batch submission scripts (e.g., Slurm, PBS).',
  },
  SRTF_PREEMPTIVE: {
    title: 'Shortest Remaining Time First (SRTF)',
    category: 'Preemptive',
    definition:
      'The preemptive counterpart of SJF. At any moment in time, the CPU is allocated to the process that has the shortest remaining execution time until completion.',
    howItWorks: [
      'Whenever a new process arrives, its required burst time is compared with the remaining burst time of the currently executing process.',
      'If the new arrival has strictly less remaining time, the running process is immediately preempted and returned to the ready queue.',
      'The new process is dispatched immediately (accounting for context-switch cost if configured).',
      'If remaining times are tied, deterministic arrival and PID rules maintain order.',
    ],
    advantages: [
      'Yields the theoretically minimal average turnaround time and waiting time among all scheduling disciplines.',
      'Provides rapid response times for very short or interactive jobs.',
    ],
    disadvantages: [
      'Frequent preemption increases context-switch overhead, which can degrade overall CPU efficiency.',
      'Severe starvation risk for long processes if short processes continuously arrive.',
      'Continuous monitoring of elapsed runtime requires precise hardware timer interrupt support.',
    ],
    importantObservation:
      'Context Switch Accounting: Frequent preemption is not free. In real systems, context switches incur cache invalidation, TLB flushes, and register saves that can outweigh algorithmic savings if jobs are preempted repeatedly.',
    realWorldUsage:
      'Used as the benchmark against which practical heuristic schedulers are evaluated. Approximated in real-time embedded systems with known task deadlines.',
  },
  PRIORITY_NON_PREEMPTIVE: {
    title: 'Priority Scheduling — Non-Preemptive',
    category: 'Non-Preemptive',
    definition:
      'Each process is assigned a priority rank. The CPU is allocated to the highest-priority eligible process in the ready pool, running uninterrupted until its burst is exhausted.',
    howItWorks: [
      'Every process input includes a priority integer.',
      'The policy convention defines whether smaller numbers represent higher priority (Unix/POSIX convention) or higher numbers represent higher priority.',
      'At dispatch time, the scheduler inspects all arrived processes and selects the highest-priority job.',
      'The selected job runs to completion without interruption from subsequent arrivals.',
    ],
    advantages: [
      'Enables explicit differentiation of critical OS tasks (e.g., kernel threads, audio processing) from background batch workers.',
      'Straightforward to configure policy goals based on process importance or user subscription tier.',
    ],
    disadvantages: [
      'Indefinite blocking (starvation): low-priority processes may never execute if high-priority processes keep arriving.',
      'Non-preemptive nature means a low-priority job already in CPU cannot yield to an urgent critical arrival.',
    ],
    importantObservation:
      'Starvation Mitigation: Standard OS textbooks teach Aging—gradually increasing the priority of processes that have waited in the ready queue for an extended period—to prevent permanent starvation.',
    realWorldUsage:
      'Batch printing queues and batch compilation dispatchers where priority is set by department or user permissions.',
  },
  PRIORITY_PREEMPTIVE: {
    title: 'Priority Scheduling — Preemptive',
    category: 'Preemptive',
    definition:
      'A preemptive priority discipline where the arrival of a higher-priority process immediately interrupts the currently executing lower-priority process.',
    howItWorks: [
      'Whenever a process arrives, its priority is compared with the running process.',
      'If the new arrival holds strictly higher priority, the running process is immediately preempted and returned to the ready queue.',
      'The higher-priority job is dispatched to the CPU.',
      'When two processes share equal priority, tie-breaking falls back to earliest arrival time, then natural PID.',
    ],
    advantages: [
      'Guarantees immediate CPU access for urgent system events and real-time operations.',
      'Essential for real-time operating systems (RTOS) meeting hard deadline constraints.',
    ],
    disadvantages: [
      'High preemption frequency can lead to excessive context switches.',
      'High risk of priority inversion: a high-priority task can become blocked waiting for a lock held by a preempted low-priority task.',
    ],
    importantObservation:
      'Priority Inversion: If low-priority task P3 holds a mutex and is preempted by medium-priority task P2, high-priority task P1 requiring that mutex is indirectly blocked by P2. Modern OSs solve this via Priority Inheritance Protocols.',
    realWorldUsage:
      'Real-Time Operating Systems (FreeRTOS, VxWorks, QNX) and the Linux `SCHED_FIFO` / `SCHED_RR` real-time scheduling classes.',
  },
  ROUND_ROBIN: {
    title: 'Round Robin (RR)',
    category: 'Preemptive',
    definition:
      'Designed specifically for interactive time-sharing systems. The CPU ready queue is treated as a circular FIFO queue; each process is assigned a small unit of CPU time called a time quantum (q).',
    howItWorks: [
      'The scheduler dispatches the process at the front of the ready queue.',
      'A hardware timer is set to interrupt after one time quantum (q).',
      'If the process burst finishes before the quantum expires, the process voluntarily terminates or blocks, and the CPU picks the next task.',
      'If the quantum expires and the process has remaining burst, the process is preempted and appended to the tail of the ready queue.',
      'Academic Queue Policy (Section 15): When a quantum expires at the same timestamp that a new process arrives, the new arrival enters the ready queue BEFORE the preempted process re-enters.',
    ],
    advantages: [
      'Guarantees fairness: every process gets an equal share of CPU execution.',
      'Excellent average response time (RT): every active task receives CPU time within (N-1) * q time units.',
      'Completely immune to process starvation.',
    ],
    disadvantages: [
      'Performance is acutely sensitive to quantum sizing: if q is extremely small, context-switch overhead dominates; if q is infinitely large, RR degenerates into FCFS.',
      'Average turnaround time is often higher than SJF because processes are interleaved rather than completed promptly.',
    ],
    importantObservation:
      'Quantum Selection Rule of Thumb: In standard operating system design, approximately 80% of CPU bursts should be shorter than the time quantum (q) to balance interactive responsiveness with low context-switch overhead.',
    realWorldUsage:
      'The foundational basis of time-sharing interactive operating systems: Windows desktop thread scheduling, macOS Grand Central Dispatch, and Linux Completely Fair Scheduler (CFS) time-slice distribution.',
  },
};

export const SchedulingTheoryPanel: React.FC<SchedulingTheoryPanelProps> = ({ selectedAlgorithm }) => {
  const theory = THEORY_REGISTRY[selectedAlgorithm];

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <BookOpen size={18} color="var(--color-accent)" />
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              EDUCATIONAL THEORY & ARCHITECTURE
            </span>
          </div>
          <Badge variant={theory.category === 'Preemptive' ? 'warning' : 'info'} size="md">
            {theory.category} Discipline
          </Badge>
        </div>
      }
      padding="md"
      variant="default"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Title and Definition */}
        <div>
          <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)' }}>
            {theory.title}
          </h3>
          <p style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text)', lineHeight: 1.65 }}>
            {theory.definition}
          </p>
        </div>

        {/* How It Works List */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--color-surface-subdued)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: 'var(--space-2)', letterSpacing: '0.04em' }}>
            ALGORITHMIC EXECUTION STEPS:
          </div>
          <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
            {theory.howItWorks.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Trade-Offs: Advantages vs Disadvantages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
          {/* Advantages */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              <CheckCircle size={16} />
              <span>CORE ADVANTAGES</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {theory.advantages.map((adv, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  {adv}
                </li>
              ))}
            </ul>
          </div>

          {/* Disadvantages */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-error)', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              <AlertTriangle size={16} />
              <span>LIMITATIONS & TRADE-OFFS</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {theory.disadvantages.map((dis, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  {dis}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Important Academic Observation */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'rgba(245, 158, 11, 0.09)',
            borderLeft: '4px solid var(--color-warning)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-warning)' }}>
            <Lightbulb size={16} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              IMPORTANT ACADEMIC OBSERVATION
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text)', lineHeight: 1.65 }}>
            {theory.importantObservation}
          </p>
        </div>

        {/* Real-World Systems Analogy */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            fontSize: '0.9375rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface-subdued)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <Server size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--color-text)' }}>Practical OS Implementation:</strong> {theory.realWorldUsage}
          </div>
        </div>

        {/* Deep Link to Comprehensive Academic Docs */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
          <Link href="/docs/scheduling">
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
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--color-accent)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                cursor: 'pointer'
              }}
            >
              <span>Explore Full Scheduling Theory & Formulas in Docs</span>
              <ExternalLink size={15} />
            </button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
