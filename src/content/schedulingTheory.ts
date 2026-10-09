/**
 * OScope — CPU Scheduling Academic Knowledge Base & Algorithm Guides
 */

import type { TheoryTopic, AlgorithmGuide } from './types';

export const SCHEDULING_THEORY_TOPICS: readonly TheoryTopic[] = Object.freeze([
  {
    id: 'cpu_burst_cycle',
    title: 'The CPU-I/O Burst Cycle',
    subsystem: 'SCHEDULING',
    shortDefinition:
      'The foundational empirical observation that process execution alternates between computational CPU bursts and I/O wait bursts.',
    explanation:
      'Process execution consists of a continuous cycle of CPU execution and I/O wait. Processes alternate back and forth between these two states. Process execution begins with a CPU burst, followed by an I/O burst, followed by another CPU burst, eventually terminating on a final CPU burst. The distribution of CPU bursts is characteristically hyperexponential: there is a large number of very short CPU bursts (interactive tasks) and a small number of very long CPU bursts (compute-bound tasks).',
    keyPoints: [
      'CPU-bound Process: Characterized by infrequent, long CPU bursts (scientific simulation, video encoding).',
      'I/O-bound Process: Characterized by frequent, very short CPU bursts followed by I/O requests (text editor, web browser).',
      'A balanced scheduler seeks to interleave I/O-bound and CPU-bound jobs to maximize simultaneous CPU and device utilization.',
    ],
    practicalExample:
      'A word processor consumes 0.5ms of CPU processing keystrokes, then waits 50ms for user input (I/O burst). An image rendering tool executes 2000ms uninterrupted CPU instructions.',
    commonMisconception:
      'Processes only run on the CPU. In reality, most general-purpose processes spend the overwhelming majority of their lifespan waiting for I/O completion.',
    theoryVsImplementation: {
      generalTheory:
        'Burst durations in real operating systems cannot be known in advance and are predicted using exponential smoothing of historical bursts ($\\tau_{n+1} = \\alpha t_n + (1-\\alpha)\\tau_n$).',
      oscopeImplementation:
        'OScope enables deterministic academic exploration by allowing explicit configuration of burst sequences and arrival schedules.',
    },
    relatedTopics: ['preemption_vs_nonpreemption', 'scheduling_criteria'],
    labRoute: '/scheduling',
  },
  {
    id: 'preemption_vs_nonpreemption',
    title: 'Preemptive vs. Non-Preemptive Scheduling',
    subsystem: 'SCHEDULING',
    shortDefinition:
      'Non-preemptive schedulers allow a running process to keep the CPU until it terminates or yields; preemptive schedulers can interrupt a running process mid-burst.',
    explanation:
      'Under non-preemptive (cooperative) scheduling, once the CPU has been allocated to a process, the process keeps the CPU until it either releases the CPU by terminating or transitions to the WAITING state. Under preemptive scheduling, the OS kernel can interrupt a currently executing process when a higher-priority or shorter job arrives in the ready queue, or when a hardware timer quantum expires.',
    keyPoints: [
      'Non-Preemptive (Cooperative): Simple, low overhead, no race conditions on shared kernel structures; highly vulnerable to monopolization and convoy delays.',
      'Preemptive: Essential for modern timesharing and interactive computing; introduces context switch overhead and requires synchronization for shared data.',
      'Four scheduling decision circumstances: (1) Running → Waiting, (2) Running → Ready, (3) Waiting → Ready, (4) Process Terminates. Schedulers that act only on (1) and (4) are strictly non-preemptive.',
    ],
    practicalExample:
      'In non-preemptive SJF, if P1 (burst 10) starts at t=0 and P2 (burst 1) arrives at t=1, P2 must wait until t=10. In preemptive SRTF, P1 is immediately suspended at t=1 and P2 runs to completion at t=2.',
    commonMisconception:
      'Preemption only happens when a timer expires. Preemption also occurs when a higher-priority process transitions from WAITING to READY due to an I/O completion event.',
    theoryVsImplementation: {
      generalTheory:
        'Kernel preemption requires careful spinlock tracking and interrupt disabling to prevent deadlocks in critical kernel sections.',
      oscopeImplementation:
        'OScope implements both non-preemptive and preemptive variants of SJF, Priority, and Round Robin algorithms deterministically.',
    },
    relatedTopics: ['fcfs_algorithm', 'srtf_algorithm'],
    labRoute: '/scheduling',
  },
  {
    id: 'convoy_effect',
    title: 'The Convoy Effect in FCFS',
    subsystem: 'SCHEDULING',
    shortDefinition:
      'A pathological phenomenon where a single long CPU-bound process holds the CPU while numerous short I/O-bound processes queue behind it, drastically inflating average waiting time.',
    explanation:
      'In First-Come, First-Served scheduling, all processes queue in order of arrival. If a heavy compute-bound process occupies the CPU, all interactive I/O-bound jobs must wait in the ready queue. While they wait, the I/O devices sit idle. Once the long process finishes, the short jobs quickly burst on the CPU and then all issue I/O requests simultaneously, leaving the CPU idle. This convoy pattern results in low CPU and device utilization and severely degraded response times.',
    keyPoints: [
      'Origin: Non-preemptive FIFO queue discipline without burst-time prioritization.',
      'Symptom: Average waiting time balloons dramatically when arrival order places long jobs first.',
      'Remedy: Preemptive time-slicing (Round Robin) or shortest-job prioritization (SJF/SRTF).',
    ],
    practicalExample:
      'P1 arrives at t=0 with burst 24; P2, P3 arrive at t=1 with burst 2. In FCFS, P2 and P3 wait 23 and 25 units; average waiting time is 16.0ms. If P2 and P3 ran first, average waiting time would be 2.3ms.',
    commonMisconception:
      'The convoy effect is a deadlock. In reality, no deadlock exists; all processes make progress, but throughput and latency are catastrophically degraded.',
    theoryVsImplementation: {
      generalTheory:
        'Convoy effects also manifest in database lock queues and disk head scheduling (elevator algorithms).',
      oscopeImplementation:
        'OScope includes a dedicated "Convoy Effect Demo" preset in the CPU Scheduling Lab to demonstrate the quantitative waiting time balloon.',
    },
    relatedTopics: ['fcfs_algorithm', 'round_robin_algorithm'],
    labRoute: '/scheduling',
  },
]);

export const ALGORITHM_GUIDES: readonly AlgorithmGuide[] = Object.freeze([
  {
    id: 'fcfs',
    name: 'First-Come, First-Served (FCFS)',
    subsystem: 'SCHEDULING',
    preemptive: false,
    definition:
      'Allocates the CPU to processes strictly in the order in which they request it (FIFO ready queue).',
    mechanism:
      'When a process enters the ready queue, its PCB is linked to the tail of the queue. The dispatcher always selects the process at the head of the queue and executes it to completion.',
    selectionRule: '$$\\arg\\min_{P_i \\in \\text{Ready}} (\\text{ArrivalTime}(P_i))$$',
    advantages: [
      'Extremely simple to implement with minimal algorithmic overhead (O(1) queue operations).',
      'Completely starvation-free: every admitted process is guaranteed to execute eventually.',
      'Low context-switch overhead since each process runs to completion without interruption.',
    ],
    disadvantages: [
      'Vulnerable to the Convoy Effect: one long process dramatically delays all subsequent short jobs.',
      'Average waiting time is typically high and varies wildly based on arrival order.',
      'Completely unsuitable for interactive or time-sharing environments.',
    ],
    complexityNote: 'Selection: O(1) via FIFO queue head removal. Insertion: O(1) at queue tail.',
    starvationNote: 'Zero starvation risk. FIFO discipline guarantees finite bounded waiting time.',
    bestSuitedWorkload:
      'Batch processing systems where jobs have roughly uniform execution times and interactivity is not required.',
    commonMisconceptions: [
      'FCFS is the fairest algorithm. While it respects arrival time, it is deeply unfair to short jobs delayed by long computational jobs.',
      'FCFS has no context switches. FCFS still requires a context switch between consecutive processes.',
    ],
    labRoute: '/scheduling',
  },
  {
    id: 'sjf',
    name: 'Shortest Job First (SJF Non-Preemptive)',
    subsystem: 'SCHEDULING',
    preemptive: false,
    definition:
      'Selects the process with the smallest CPU burst time among all currently available ready processes.',
    mechanism:
      'When the CPU becomes available, the scheduler scans all ready processes and selects the one with the minimal burst time. Ties are broken deterministically by earlier arrival time or PID.',
    selectionRule: '$$\\arg\\min_{P_i \\in \\text{Ready}} (\\text{BurstTime}(P_i))$$',
    advantages: [
      'Provably optimal for minimizing average waiting time among non-preemptive scheduling algorithms.',
      'Maximizes system throughput by clearing short jobs from the ready pool as quickly as possible.',
      'Reduces the number of concurrent processes residing in memory.',
    ],
    disadvantages: [
      'Requires advance knowledge or accurate estimation of future CPU bursts.',
      'Vulnerable to starvation: long processes can wait indefinitely if short processes arrive continuously.',
      'Non-preemptive nature means an unexpectedly long job cannot be suspended once started.',
    ],
    complexityNote: 'Selection: O(log n) via min-heap priority queue keyed on burst time.',
    starvationNote: 'High starvation risk for long-burst processes under heavy short-job arrival pressure.',
    bestSuitedWorkload:
      'Long-term batch systems where runtimes are estimated accurately from previous compilations or user declarations.',
    commonMisconceptions: [
      'SJF is optimal for all metrics. SJF is optimal only for average waiting time; it does not optimize maximum waiting time or variance.',
    ],
    labRoute: '/scheduling',
  },
  {
    id: 'srtf',
    name: 'Shortest Remaining Time First (SRTF Preemptive)',
    subsystem: 'SCHEDULING',
    preemptive: true,
    definition:
      'Preemptive counterpart of SJF: constantly allocates the CPU to the process with the smallest remaining execution time.',
    mechanism:
      'Whenever a new process arrives in the ready queue, its burst time is compared to the remaining time of the currently running process. If the new job is shorter, the running job is preempted and returned to the ready queue.',
    selectionRule: '$$\\arg\\min_{P_i \\in \\text{Ready} \\cup \\{P_{\\text{running}}\\}}(\\text{RemainingTime}(P_i))$$',
    advantages: [
      'Yields provably optimal average waiting time and turnaround time across all single-core scheduling algorithms.',
      'Interactive processes with short bursts receive virtually instantaneous CPU service.',
      'Minimizes overall queue lengths in memory.',
    ],
    disadvantages: [
      'Frequent preemption increases context-switch overhead, which can degrade net CPU throughput.',
      'Severe starvation risk for long processes under sustained arrivals of short jobs.',
      'Requires tracking exact elapsed burst time for the running process.',
    ],
    complexityNote: 'Selection & Preemption: O(log n) min-heap update on every process arrival.',
    starvationNote: 'Severe starvation risk for long processes. Requires aging mechanisms in production implementations.',
    bestSuitedWorkload:
      'Workloads with highly diverse burst times where interactive responsiveness is prioritized over long batch throughput.',
    commonMisconceptions: [
      'SRTF is the same algorithm as SJF. SRTF evaluates preemption upon every new arrival, creating significantly different Gantt schedules.',
    ],
    labRoute: '/scheduling',
  },
  {
    id: 'priority_non_preemptive',
    name: 'Priority Scheduling (Non-Preemptive)',
    subsystem: 'SCHEDULING',
    preemptive: false,
    definition:
      'Assigns a priority rank to each process and allocates the CPU to the ready process with the highest priority rank without preemption.',
    mechanism:
      'Ready processes are ordered by priority (in OScope, lower numeric value denotes higher priority, matching Silberschatz convention). Once dispatched, the process runs until completion.',
    selectionRule: '$$\\arg\\min_{P_i \\in \\text{Ready}} (\\text{PriorityRank}(P_i))$$',
    advantages: [
      'Allows explicit business logic and policy-driven CPU allocation (e.g., real-time tasks > background daemons).',
      'Straightforward conceptual model with predictable behavior for mission-critical tasks.',
    ],
    disadvantages: [
      'Indefinite blocking / Starvation: Low-priority processes may never execute if high-priority jobs continually arrive.',
      'A low-priority process holding the CPU cannot be interrupted by an urgent high-priority arrival.',
    ],
    complexityNote: 'Selection: O(log n) via priority heap.',
    starvationNote: 'Major starvation vulnerability. The classic solution is aging: gradually incrementing priority as wait time increases.',
    bestSuitedWorkload:
      'Static priority environments where task criticality is well-defined and job arrival rates are predictable.',
    commonMisconceptions: [
      'A priority scheduler cannot suffer from convoy effects. If a low-priority job with a huge burst begins running, all high-priority arrivals are delayed.',
    ],
    labRoute: '/scheduling',
  },
  {
    id: 'priority_preemptive',
    name: 'Priority Scheduling (Preemptive)',
    subsystem: 'SCHEDULING',
    preemptive: true,
    definition:
      'Preemptively allocates the CPU to the highest-priority process. If a higher-priority process arrives, the current job is immediately preempted.',
    mechanism:
      'On every process arrival or priority change, the scheduler checks if any ready process has a higher priority than the currently running job. If so, a context switch is performed.',
    selectionRule: '$$\\arg\\min_{P_i \\in \\text{Ready} \\cup \\{P_{\\text{running}}\\}}(\\text{PriorityRank}(P_i))$$',
    advantages: [
      'Guarantees immediate CPU access for urgent, high-priority real-time processes.',
      'Excellent response times for critical system services.',
    ],
    disadvantages: [
      'Severe starvation for low-priority jobs under sustained high-priority traffic.',
      'Increased context-switch overhead during rapid bursts of high-priority arrivals.',
      'Vulnerable to Priority Inversion when lower-priority processes hold locks needed by higher-priority jobs.',
    ],
    complexityNote: 'Selection & Preemption check: O(log n) on every arrival.',
    starvationNote: 'High starvation risk. Mitigated in real kernels via dynamic priority decay or aging.',
    bestSuitedWorkload:
      'Embedded systems and multimedia engines requiring hard or soft real-time task guarantees.',
    commonMisconceptions: [
      'Higher numeric priority always means more important. Conventions differ: Unix uses lower numbers for higher priority (nice values), while some systems use higher numbers.',
    ],
    labRoute: '/scheduling',
  },
  {
    id: 'round_robin',
    name: 'Round Robin (RR)',
    subsystem: 'SCHEDULING',
    preemptive: true,
    definition:
      'Timesharing scheduler that allocates a fixed time slice (quantum $q$) to each process in FIFO ready queue order.',
    mechanism:
      'The ready queue is treated as a circular FIFO queue. The dispatcher allocates the CPU to the head process for up to 1 time quantum. If the burst finishes within $q$, the process terminates. If the burst exceeds $q$, a timer interrupt preempts the process and places it at the tail of the ready queue.',
    selectionRule: 'Head of circular FIFO ready queue, with maximum execution duration $q$.',
    advantages: [
      'Fair CPU sharing: no process can monopolize the core for more than $q$ time units.',
      'Guaranteed upper bound on response time: no process waits more than $(n-1) \\times q$ units before getting CPU service.',
      'Completely starvation-free without requiring complex aging algorithms.',
    ],
    disadvantages: [
      'Performance is acutely sensitive to the choice of time quantum $q$:',
      'If $q$ is extremely large: RR degenerates into FCFS (convoy effect returns).',
      'If $q$ is extremely small: Context-switch overhead consumes the majority of CPU cycles (processor thrashing).',
      'Average turnaround time is often higher than SJF/SRTF because all jobs complete around the same time.',
    ],
    complexityNote: 'Selection: O(1) head removal. Queue re-insertion: O(1) tail push.',
    starvationNote: 'Zero starvation risk. Every runnable process receives at least $q$ units every cycle.',
    bestSuitedWorkload:
      'General-purpose timesharing, desktop workstations, and cloud multi-tenant web servers.',
    commonMisconceptions: [
      'Round Robin is always faster than FCFS. For jobs of equal length that do not perform I/O, RR actually produces worse average turnaround time than FCFS due to context switches.',
    ],
    labRoute: '/scheduling',
  },
]);

export const SCHEDULING_ALGORITHMS = ALGORITHM_GUIDES;
