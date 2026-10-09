/**
 * OScope — Viva Voce Preparation, Demo Scripts & Presentation Guide
 * Complete examination-ready kit for students defending OScope in viva voce or technical demos.
 * Includes timed scripts, 10-step teacher walkthrough, question bank, common traps,
 * honest limitations, and future work.
 */

import type { VivaQuestion } from './types';

export const PITCH_30_SECONDS = `
"OScope is an interactive client-side observatory that visualizes the hidden internal operations of an Operating System. Unlike traditional simulators that merely output tables of numbers, OScope makes internal operating system mechanics visible and explains the algorithmic reasoning behind every decision across process lifecycles, CPU scheduling, virtual memory paging, deadlock avoidance, and storage allocation."
`.trim();

export const OVERVIEW_2_MINUTES = `
"OScope was built to solve a fundamental pedagogical challenge in computer science education: Operating System concepts like context switches, Belady's anomaly, Banker's safety checks, and inode pointer resolutions are abstract and happen invisibly inside kernel space. 

To bridge this gap, OScope provides five interactive laboratories and a central integrated observatory:
1. Process Lifecycle Lab: Explores 5-state transitions and PCB field inspections.
2. CPU Scheduling Lab: Models FCFS, SJF, SRTF, Priority, and Round Robin with live Gantt charts and mathematical metrics.
3. Memory Management Lab: Models virtual-to-physical address translation, TLB caching, page faults, and Belady's anomaly.
4. Deadlock Lab: Features multi-instance Banker's algorithm and interactive Resource Allocation Graphs with cycle detection.
5. File System Lab: Contrasts contiguous, linked, and indexed storage allocation, demonstrating internal versus external fragmentation.

Architecturally, OScope decouples pure, mathematically testable algorithms from reactive presentation components, running entirely client-side with a deterministic discrete-event virtual clock and zero backend dependencies."
`.trim();

export interface PresentationTimeSlot {
  readonly interval: string;
  readonly title: string;
  readonly script: string;
  readonly visualAction: string;
}

export const PRESENTATION_SCRIPT_5_MINUTES: readonly PresentationTimeSlot[] = [
  {
    interval: '0:00 – 0:30',
    title: 'Problem & Motivation',
    script:
      'Good morning. Operating Systems is one of the most foundational subjects in computer science, yet students often struggle because kernel operations are hidden beneath hardware abstractions. We created OScope — an interactive observatory designed to visualize the internal mechanics of an OS and explain the academic reasoning behind every state transition.',
    visualAction: 'Show OScope Landing page / Central Observatory Overview.'
  },
  {
    interval: '0:30 – 1:15',
    title: 'System Architecture & Determinism',
    script:
      'OScope is engineered around clean architectural separation: pure domain models and algorithms are decoupled from the UI. Rather than relying on non-deterministic wall-clock timers, we built a discrete VirtualClock and immutable snapshot timeline. This allows students to step forward tick-by-tick or step backwards in time to inspect any previous kernel decision.',
    visualAction: 'Navigate to Architecture documentation or highlight VirtualClock controls.'
  },
  {
    interval: '1:15 – 2:00',
    title: 'Process Lifecycle & CPU Scheduling',
    script:
      'In our Process and Scheduling Labs, we observe the five-state lifecycle and compare algorithms like FCFS, SJF, SRTF, and Round Robin. For example, in SRTF, when a shorter process arrives, OScope immediately displays the preemption event, saves the outgoing PCB context, and explains why the decision was made based on remaining burst times.',
    visualAction: 'Open Scheduling Lab, select SRTF preset, step into a preemption tick, and show Gantt preemption marker.'
  },
  {
    interval: '2:00 – 2:45',
    title: 'Virtual Memory, TLB & Page Replacement',
    script:
      'In the Memory Lab, we demonstrate address translation: splitting virtual addresses into page number and offset, querying the TLB, and falling back to the page table. We prominently teach that a TLB miss is NOT a page fault. We also demonstrate Belady’s anomaly using the canonical 12-reference string, showing live that FIFO with 4 frames generates 10 faults while 3 frames produces only 9.',
    visualAction: 'Open Memory Lab, load Belady Anomaly preset, and compare 3-frame vs 4-frame outputs.'
  },
  {
    interval: '2:45 – 3:30',
    title: 'Deadlock Avoidance & RAG Semantics',
    script:
      'In the Deadlock Lab, we demonstrate Banker’s Algorithm for deadlock avoidance and clarify that an Unsafe state is NOT automatically Deadlocked. We also provide an interactive Resource Allocation Graph where users can build cycles, demonstrating that while a cycle guarantees deadlock in single-instance systems, it is only a necessary condition in multi-instance systems.',
    visualAction: 'Open Deadlock Lab, run Banker Safety test to show Safe Sequence, then toggle RAG cycle view.'
  },
  {
    interval: '3:30 – 4:15',
    title: 'File System & Storage Allocation',
    script:
      'In the File System Lab, we simulate an educational Inode model and contrast Contiguous, Linked, and Indexed block allocation. We visually demonstrate the difference between internal fragmentation (unused space inside the last block) and external fragmentation, where total free disk blocks exist but contiguous allocation fails because they are not adjacent.',
    visualAction: 'Open File System Lab, create a file that fails contiguous allocation due to fragmented runs, then switch to Indexed.'
  },
  {
    interval: '4:15 – 5:00',
    title: 'Central Observatory, Verification & Conclusion',
    script:
      'Finally, our Central Observatory integrates all subsystems into a unified real-time dashboard. The entire application is backed by an automated test suite verifying algorithmic invariants and runs 100% client-side with zero server latency. OScope transforms operating systems from abstract equations into an observable, explainable reality. Thank you, and we welcome your questions.',
    visualAction: 'Open Central Observatory dashboard and show live synchronized cross-subsystem metrics.'
  }
];

export interface DemoCheatSheetStep {
  readonly stepNumber: number;
  readonly lab: string;
  readonly actionToPerform: string;
  readonly whatToExplain: string;
  readonly expectedObservation: string;
}

export const TEACHER_DEMO_CHEAT_SHEET: readonly DemoCheatSheetStep[] = [
  {
    stepNumber: 1,
    lab: 'Observatory',
    actionToPerform: 'Click "Observatory" on the sidebar navigation.',
    whatToExplain:
      'Introduce the unified multi-subsystem view showing Process, CPU, Memory, Deadlock, and Storage telemetry.',
    expectedObservation: 'Global System Health shows NORMAL or ACTIVE with live metrics cards.'
  },
  {
    stepNumber: 2,
    lab: 'Process Lab',
    actionToPerform: 'Navigate to Process Lab; click "Step" twice to move a process from NEW -> READY -> RUNNING.',
    whatToExplain:
      'Show the 5-state state machine and explain why READY is not executing (it is waiting for CPU dispatch).',
    expectedObservation: 'Active process transitions visually in the SVG state machine and updates the PCB card.'
  },
  {
    stepNumber: 3,
    lab: 'CPU Scheduling Lab',
    actionToPerform: 'Select "SRTF" algorithm preset and click "Run Full Simulation".',
    whatToExplain:
      'Explain that SRTF is preemptive; point to the Gantt chart where an arriving shorter job preempted a running process.',
    expectedObservation: 'Gantt chart displays distinct colored slices with preemption tick lines and calculated TAT/WT.'
  },
  {
    stepNumber: 4,
    lab: 'Memory Lab (TLB)',
    actionToPerform: 'Translate Virtual Address 4100; observe the TLB Miss then Page Table resolution.',
    whatToExplain:
      'Point out that a TLB miss did NOT cause a page fault because the page is already resident in Frame 1.',
    expectedObservation: 'TLB Inspector shows MISS; Page Table highlights valid entry; Physical Address assembled.'
  },
  {
    stepNumber: 5,
    lab: 'Memory Lab (Bélády)',
    actionToPerform: 'Click the "Bélády Anomaly" preset button; observe 3 frames vs 4 frames under FIFO.',
    whatToExplain:
      'Explain that FIFO is not a stack algorithm, so adding a frame can increase faults (9 faults with 3 frames vs 10 faults with 4).',
    expectedObservation: 'Comparison card highlights the anomalous fault count difference.'
  },
  {
    stepNumber: 6,
    lab: 'Deadlock Lab (Banker)',
    actionToPerform: 'Click "Evaluate System Safety" on the default Banker matrix.',
    whatToExplain:
      'Explain Need = Max - Allocation, and how the algorithm iteratively finds processes where Need <= Work.',
    expectedObservation: 'Safe Sequence <P1, P3, P4, P0, P2> is verified with state labeled SAFE (green).'
  },
  {
    stepNumber: 7,
    lab: 'Deadlock Lab (RAG)',
    actionToPerform: 'Click "Cycle Preset" in the Resource Allocation Graph.',
    whatToExplain:
      'Explain single-instance vs multi-instance cycle semantics: cycle guarantees deadlock only when resources are single-instance.',
    expectedObservation: 'Graph highlights the cycle in crimson and indicates deadlock presence.'
  },
  {
    stepNumber: 8,
    lab: 'File System Lab',
    actionToPerform: 'Select "Contiguous Allocation" and create a 3-block file.',
    whatToExplain:
      'Explain that contiguous allocation stores consecutive blocks, providing fast direct access but rigid layout requirements.',
    expectedObservation: 'Disk block grid highlights a contiguous sequence of colored blocks.'
  },
  {
    stepNumber: 9,
    lab: 'File System Lab (Fragmentation)',
    actionToPerform: 'Create scattered files, delete middle files, and attempt to allocate a large contiguous file.',
    whatToExplain:
      'Show external fragmentation: total free blocks exceed file size, but no single contiguous run exists. Switch to Indexed to resolve.',
    expectedObservation: 'Contiguous allocation fails with diagnostic notice; Indexed allocation succeeds immediately.'
  },
  {
    stepNumber: 10,
    lab: 'Central Observatory',
    actionToPerform: 'Return to Central Observatory; view consolidated system metrics.',
    whatToExplain:
      'Summarize that all laboratories share consistent domain models, state stores, and academic terminology.',
    expectedObservation: 'Synchronized telemetry display reflecting current simulation states across all 5 labs.'
  }
];

export const VIVA_QUESTIONS: readonly VivaQuestion[] = [
  // --- PROCESS & PCB ---
  {
    id: 'viva-proc-1',
    subsystem: 'PROCESS',
    question: 'What is a Process Control Block (PCB) and why does the operating system need it?',
    shortAnswer30s:
      'A PCB is a kernel data structure that stores all execution and administrative state for a specific process (PID, CPU registers, program counter, process state, memory pointers, open files). The OS needs it to pause, save, and resume process execution during context switching.',
    inDepthAnswer:
      'Without a PCB, multiprogramming would be impossible. When the CPU preempts a process or handles an interrupt, the hardware and OS kernel must save the volatile CPU state (general-purpose registers, condition flags, stack pointer, and program counter) into that process\'s PCB. When the process is dispatched again, the kernel loads these values back into CPU registers, restoring execution seamlessly.',
    commonTrap:
      'Believing the PCB contains the actual program executable code. The PCB only contains metadata, pointers, and saved registers; the program code lives in the process text segment.'
  },
  {
    id: 'viva-proc-2',
    subsystem: 'PROCESS',
    question: 'What is the precise difference between the READY state and the RUNNING state?',
    shortAnswer30s:
      'A process in the READY state has all required resources and is fully eligible to execute, but is currently waiting for the CPU scheduler to allocate it a CPU time slice. A process in the RUNNING state is actively executing instructions on a CPU core right now.',
    inDepthAnswer:
      'The only thing a READY process lacks is a CPU core. In contrast, a WAITING (BLOCKED) process cannot execute even if an idle CPU core is available, because it is waiting for an external event such as disk I/O, network packet, or mutex release.',
    commonTrap:
      'Saying that READY processes are running slowly or waiting for memory. READY processes reside in memory and wait only for CPU dispatch.'
  },

  // --- SCHEDULING ---
  {
    id: 'viva-sched-1',
    subsystem: 'SCHEDULING',
    question: 'Why can Shortest Remaining Time First (SRTF) preempt a running process, whereas SJF cannot?',
    shortAnswer30s:
      'SJF is non-preemptive: once a process is given the CPU, it runs until burst completion or I/O. SRTF is the preemptive version: whenever a new process arrives with a remaining burst shorter than the currently executing process, the CPU is immediately revoked and given to the newcomer.',
    inDepthAnswer:
      'SRTF continuously evaluates the remaining execution time of all ready processes at every arrival event. If process P1 is running with 5 units remaining, and P2 arrives with a total burst of 2 units, SRTF preempts P1, places P1 back into the Ready Queue, and dispatches P2 to minimize overall average waiting time.',
    commonTrap:
      'Confusing remaining burst time with total initial burst time. SRTF compares the remaining time of the running process against the total burst of the new arrival.'
  },
  {
    id: 'viva-sched-2',
    subsystem: 'SCHEDULING',
    question: 'What is the relationship between Turnaround Time and Waiting Time?',
    shortAnswer30s:
      'Turnaround Time is the total lifespan of the process in the system (Completion Time - Arrival Time). Waiting Time is Turnaround Time minus Burst Time (WT = TAT - BT). Waiting time isolates purely the passive time spent sitting in the Ready Queue.',
    inDepthAnswer:
      'Mathematically, TAT = WT + BT (under pure CPU burst models with zero I/O and zero context switch latency). Turnaround time represents user-perceived turnaround, while waiting time isolates scheduling inefficiency.',
    commonTrap:
      'Confusing Waiting Time with Response Time. Response time is time until first CPU dispatch; Waiting time is cumulative delay across the entire execution.'
  },

  // --- MEMORY ---
  {
    id: 'viva-mem-1',
    subsystem: 'MEMORY',
    question: 'Why is a TLB miss NOT necessarily a Page Fault?',
    shortAnswer30s:
      'A TLB miss means the page translation is not cached in the CPU’s high-speed TLB; the page itself may be perfectly resident in physical RAM. A page fault occurs only if the page table entry shows the page is not in physical RAM (valid bit = 0).',
    inDepthAnswer:
      'The TLB is merely a small hardware cache of recent translations. When a TLB miss occurs, the MMU accesses the page table in RAM. If the page table entry is valid, the frame number is retrieved, loaded into the TLB, and execution proceeds immediately without a page fault. A page fault occurs only when the page table lookup confirms the page is not in physical memory.',
    commonTrap:
      'One of the most frequent viva traps! Many students claim that every TLB miss causes a disk access or page fault. In reality, the vast majority of TLB misses simply resolve via a page table read in RAM.'
  },
  {
    id: 'viva-mem-2',
    subsystem: 'MEMORY',
    question: "What is Bélády's Anomaly, and why does it occur in FIFO but not in LRU?",
    shortAnswer30s:
      "Bélády's anomaly is when increasing the number of physical frames increases the number of page faults. It occurs in FIFO because FIFO does not satisfy the Stack Property (inclusion property). LRU is a stack algorithm, where pages in n frames are always a subset of pages in n+1 frames.",
    inDepthAnswer:
      "Discovered by László Bélády in 1969. In a stack algorithm, M(n, t) ⊆ M(n+1, t) for all time t. Because FIFO evicts the oldest arrived page regardless of recency, adding a frame changes which page is considered oldest at different points, causing it to evict a page that is referenced immediately after. Canonical example: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5] yields 9 faults with 3 frames and 10 faults with 4 frames.",
    commonTrap:
      'Believing that more memory always causes more faults. Bélády’s anomaly is an exception that happens only for specific reference patterns under non-stack replacement policies.'
  },

  // --- DEADLOCK ---
  {
    id: 'viva-dl-1',
    subsystem: 'DEADLOCK',
    question: 'Does an Unsafe State mean the system is currently deadlocked?',
    shortAnswer30s:
      'NO! An unsafe state is NOT deadlocked. It simply means that if all processes simultaneously request their declared maximum remaining claims, the operating system cannot guarantee that deadlock will not occur. If processes request less or finish early, no deadlock may ever happen.',
    inDepthAnswer:
      'The state space is partitioned: Safe States ⊆ Deadlock-Free States ⊆ All States. An unsafe state is a vulnerable state where avoidance can no longer be mathematically guaranteed. Deadlock is an actual current circular wait where processes are permanently blocked.',
    commonTrap:
      'Assuming "unsafe" and "deadlocked" are synonyms. This is the single most tested concept in operating systems viva examinations.'
  },
  {
    id: 'viva-dl-2',
    subsystem: 'DEADLOCK',
    question: "Why is Banker's Algorithm called an Avoidance algorithm rather than a Detection algorithm?",
    shortAnswer30s:
      "Because it acts proactively before granting a resource request. It simulates the hypothetical future state and denies or delays any request that would transition the system into an unsafe state, preventing deadlock from ever occurring in the first place.",
    inDepthAnswer:
      'Deadlock Detection algorithms run periodically after resources have already been allocated, scanning for existing cycles or deadlocked sets to trigger recovery (kill process, preempt resource). Banker\'s Algorithm is an avoidance strategy that uses a priori maximum claim declarations to stay strictly within Safe States.',
    commonTrap:
      'Claiming Banker\'s Algorithm detects and kills deadlocked processes. Banker\'s algorithm never allows a deadlock to happen.'
  },

  // --- FILE SYSTEM ---
  {
    id: 'viva-fs-1',
    subsystem: 'FILESYSTEM',
    question: 'What is an Inode, and what information does it NOT contain?',
    shortAnswer30s:
      'An Inode (index node) contains all file metadata (file size, permissions, owner, timestamps, and physical disk block pointers). Crucially, an Inode does NOT contain the filename; filenames are stored in directory entries.',
    inDepthAnswer:
      'Separating the filename from the Inode allows hard links: multiple directory entries with different names can point to the exact same Inode number. The Inode stores a link count, decrementing it when a link is removed, and freeing the disk blocks only when the link count reaches zero.',
    commonTrap:
      'Saying that the Inode stores the filename. Filenames live in directory records.'
  },
  {
    id: 'viva-fs-2',
    subsystem: 'FILESYSTEM',
    question: 'What is the fundamental difference between Internal and External Fragmentation?',
    shortAnswer30s:
      'Internal fragmentation is wasted space INSIDE an allocated block (due to fixed block size granularity). External fragmentation is scattered free space OUTSIDE allocated blocks that cannot be used because it is not contiguous.',
    inDepthAnswer:
      'Internal fragmentation occurs in paging and file systems because space is allocated in discrete block chunks (e.g., 4 KiB). A 5 KiB file needs two 4 KiB blocks, leaving 3 KiB of unused internal slack in block 2. External fragmentation occurs in contiguous memory or disk allocation: total free space may be 100 blocks, but if the largest contiguous run is only 4 blocks, a request for 5 contiguous blocks fails.',
    commonTrap:
      'Saying external fragmentation means the disk is full. The disk may have 90% free space and still suffer external fragmentation under contiguous allocation.'
  }
];

export interface VivaTrap {
  readonly trapQuestion: string;
  readonly quickAnswer: string;
  readonly detailedExplanation: string;
}

export const COMMON_VIVA_TRAPS: readonly VivaTrap[] = [
  {
    trapQuestion: 'Does an Unsafe State mean the system is Deadlocked?',
    quickAnswer: 'No, absolutely not.',
    detailedExplanation:
      'An unsafe state merely means the OS cannot guarantee deadlock freedom under worst-case peak demands. Deadlock only occurs if processes actually proceed to request their full claims in an unresolvable sequence.'
  },
  {
    trapQuestion: 'Does a TLB miss mean a Page Fault occurred?',
    quickAnswer: 'No, they are completely different events.',
    detailedExplanation:
      'A TLB miss means the hardware cache lacked the translation. The MMU then reads the Page Table in RAM. If the page is marked valid in the page table, it is already resident in RAM and no page fault happens.'
  },
  {
    trapQuestion: 'Is Optimal (OPT) page replacement practical for a real operating system?',
    quickAnswer: 'No, it is impossible for general-purpose workloads.',
    detailedExplanation:
      'Optimal requires knowing future memory references in advance. Since future user code execution paths cannot be known, OPT is used strictly as an offline theoretical benchmark to measure how close realizable policies (like LRU) get to perfection.'
  },
  {
    trapQuestion: 'Does a cycle in a Resource Allocation Graph always prove Deadlock?',
    quickAnswer: 'Only in Single-Instance systems; NOT in Multi-Instance systems.',
    detailedExplanation:
      'In a single-instance resource graph, a cycle is both necessary and sufficient for deadlock. In a multi-instance graph, a cycle is merely necessary: if processes outside the cycle release other instances of the same resource, the cycle can resolve without deadlock.'
  },
  {
    trapQuestion: 'Does Linked Allocation suffer from External Fragmentation?',
    quickAnswer: 'No, zero external fragmentation.',
    detailedExplanation:
      'Linked allocation can allocate any free block anywhere on the disk volume, because each block simply links to the next. It does, however, suffer from poor random access (O(N) seek times) and pointer storage overhead.'
  }
];

export const PROJECT_LIMITATIONS: readonly string[] = [
  'Client-Side Educational Model: OScope executes inside a sandboxed browser JavaScript virtual machine rather than interfacing with bare-metal silicon MMUs or CPU interrupt lines.',
  'Discrete Virtual Clock: Time ticks are discrete integer steps rather than asynchronous hardware nanoseconds with bus contention and cache hierarchy stalls.',
  'Single-Process Memory View: The Memory Lab demonstrates address translation and page replacement for a single configurable virtual address space rather than multi-tenant process trees.',
  'Educational Inode Model: File system storage uses a clean single-level or direct/index block pointer layout rather than complete multi-level B-tree extents (e.g. ext4 extent trees).',
  'No Host Privilege Access: OScope does not inspect host OS processes, read host physical RAM, or touch the host hard drive, ensuring 100% sandboxed security.'
];

export const FUTURE_WORK_ROADMAP: readonly string[] = [
  'Multi-Level Page Tables: Visualizing 2-level and 4-level paging hierarchies (PML4) with hierarchical page directory pointers.',
  'Multi-Level Feedback Queue (MLFQ): Interactive multi-priority queue scheduling with dynamic aging and CPU burst tracking.',
  'Clock / Second-Chance Page Replacement: Adding reference bit circular scanning as an approximation of pure LRU.',
  'Multi-Level Indexed Storage: Double-indirect and triple-indirect block expansion for massive file modeling.',
  'Exportable Simulation Lab Reports: Generating downloadable PDF/JSON academic experiment summaries with reproducible seeds.'
];
