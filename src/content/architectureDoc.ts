/**
 * OScope — Architecture, Verification & Engineering Documentation
 * Comprehensive technical reference detailing system layers, data flows,
 * testing strategy, Academic FAQ, Real OS vs OScope comparisons, and privacy statements.
 */

export interface ArchitectureLayer {
  readonly layerName: string;
  readonly role: string;
  readonly dependencies: readonly string[];
  readonly representativeModules: readonly string[];
  readonly academicSignificance: string;
}

export const ARCHITECTURE_LAYERS: readonly ArchitectureLayer[] = [
  {
    layerName: 'Domain Models',
    role: 'Immutable, framework-independent data structures defining the core entities of an Operating System.',
    dependencies: ['None (pure TypeScript)'],
    representativeModules: [
      'src/core/models/process.ts',
      'src/core/models/pcb.ts',
      'src/core/models/memory.ts',
      'src/core/models/deadlock.ts',
      'src/core/models/filesystem.ts'
    ],
    academicSignificance:
      'Encapsulates textbook OS abstractions (ProcessControlBlock, PageTable, Inode, ResourceVector) without frontend framework coupling, ensuring pure academic domain fidelity.'
  },
  {
    layerName: 'Pure Algorithmic Engines',
    role: 'Stateless, deterministic algorithm implementations with zero side effects.',
    dependencies: ['Domain Models'],
    representativeModules: [
      'src/core/algorithms/scheduling/*.ts (FCFS, SJF, SRTF, RR, Priority)',
      'src/core/algorithms/memory/*.ts (FIFO, LRU, Optimal)',
      'src/core/algorithms/deadlock/*.ts (Banker, RAG cycle detection)',
      'src/core/algorithms/filesystem/*.ts (Contiguous, Linked, Indexed)'
    ],
    academicSignificance:
      'Implements canonical textbook algorithms as pure mathematical functions. Given identical inputs, they produce identical execution traces every single time, enabling rigorous academic validation.'
  },
  {
    layerName: 'Simulation Primitives & Event Timeline',
    role: 'Virtual time orchestration, discrete event queues, and immutable snapshot capture.',
    dependencies: ['Domain Models', 'Pure Algorithmic Engines'],
    representativeModules: [
      'src/core/simulation/VirtualClock.ts',
      'src/core/simulation/EventQueue.ts',
      'src/core/simulation/SimulationTimeline.ts',
      'src/core/simulation/DecisionTrace.ts'
    ],
    academicSignificance:
      'Replaces non-deterministic wall-clock timers with a discrete-event simulation model. Allows precise single-stepping, step-backwards inspection, and reproducible time-tick advancement.'
  },
  {
    layerName: 'Subsystem State Stores',
    role: 'Reactive controllers managing lab-specific simulation sessions, user inputs, and playback states.',
    dependencies: ['Domain Models', 'Simulation Primitives', 'Zustand'],
    representativeModules: [
      'src/state/processStore.ts',
      'src/state/schedulingStore.ts',
      'src/state/memoryStore.ts',
      'src/state/deadlockStore.ts',
      'src/state/filesystemStore.ts',
      'src/state/observatoryStore.ts'
    ],
    academicSignificance:
      'Centralizes state mutation with immutable transitions. Provides actions for running simulations, adjusting parameters, and streaming step events to the UI.'
  },
  {
    layerName: 'Visualization & Observability Components',
    role: 'Interactive UI components rendering live visualizations of OS structures.',
    dependencies: ['Subsystem State Stores', 'React', 'Lucide Icons'],
    representativeModules: [
      'GanttChart.tsx',
      'PcbCard.tsx',
      'StateTransitionDiagram.tsx',
      'MemoryGrid.tsx',
      'TlbInspector.tsx',
      'RagCanvas.tsx',
      'DiskBlockGrid.tsx',
      'InodeInspector.tsx'
    ],
    academicSignificance:
      'Translates internal OS kernel state into visual educational diagrams, enabling immediate cognitive comprehension of abstract low-level mechanisms.'
  },
  {
    layerName: 'Laboratory & Presentation Layer',
    role: 'Top-level interactive workbenches and integrated Observatory coordinating user scenarios.',
    dependencies: ['Visualization Components', 'Subsystem State Stores'],
    representativeModules: [
      'src/labs/process/ProcessLabView.tsx',
      'src/labs/scheduling/SchedulingLabView.tsx',
      'src/labs/memory/MemoryLabView.tsx',
      'src/labs/deadlock/DeadlockLabView.tsx',
      'src/labs/filesystem/FilesystemLabView.tsx',
      'src/labs/observatory/ObservatoryLabView.tsx',
      'src/labs/docs/DocsHubView.tsx'
    ],
    academicSignificance:
      'Combines parameter controls, execution panels, live metrics, visualizers, and contextual educational explanations into dedicated learning environments.'
  }
];

export interface ModuleDocumentation {
  readonly path: string;
  readonly purpose: string;
  readonly keyArtifacts: readonly string[];
}

export const MODULE_DIRECTORY_REFERENCE: readonly ModuleDocumentation[] = [
  {
    path: 'src/core/models',
    purpose: 'Typed domain models representing OS primitives (PCB, PageTable, Inode, Resource Matrix).',
    keyArtifacts: ['process.ts', 'pcb.ts', 'memory.ts', 'deadlock.ts', 'filesystem.ts']
  },
  {
    path: 'src/core/algorithms',
    purpose: 'Stateless algorithmic engines for CPU scheduling, page replacement, deadlock avoidance, and storage allocation.',
    keyArtifacts: ['scheduling/', 'memory/', 'deadlock/', 'filesystem/']
  },
  {
    path: 'src/core/simulation',
    purpose: 'Discrete-event simulation engine, virtual clock, timeline history, and decision reasoning recorder.',
    keyArtifacts: ['VirtualClock.ts', 'EventQueue.ts', 'SimulationTimeline.ts', 'DecisionTrace.ts']
  },
  {
    path: 'src/state',
    purpose: 'Zustand stores coordinating reactive lab state, interactive controls, and global Observatory snapshots.',
    keyArtifacts: ['processStore.ts', 'schedulingStore.ts', 'memoryStore.ts', 'deadlockStore.ts', 'filesystemStore.ts', 'observatoryStore.ts']
  },
  {
    path: 'src/components',
    purpose: 'Reusable design-system primitives, layout scaffolding, controls, and subsystem visualizers.',
    keyArtifacts: ['layout/', 'controls/', 'feedback/', 'common/']
  },
  {
    path: 'src/labs',
    purpose: 'The 5 dedicated laboratory views, Central Observatory dashboard, and Academic Documentation Hub.',
    keyArtifacts: ['process/', 'scheduling/', 'memory/', 'deadlock/', 'filesystem/', 'observatory/', 'docs/']
  },
  {
    path: 'src/content',
    purpose: 'Structured, typed academic knowledge layer containing theory guides, formulas, glossary, and viva resources.',
    keyArtifacts: ['types.ts', 'processTheory.ts', 'schedulingTheory.ts', 'memoryTheory.ts', 'deadlockTheory.ts', 'filesystemTheory.ts', 'formulas.ts', 'glossary.ts', 'vivaGuide.ts', 'references.ts']
  },
  {
    path: 'src/tests',
    purpose: 'Automated Vitest test suite validating domain invariants, algorithm correctness, and simulation determinism.',
    keyArtifacts: ['domain models', 'algorithm engines', 'simulation primitives', 'cross-lab integration']
  }
];

export interface AcademicFaqItem {
  readonly question: string;
  readonly answer: string;
  readonly rationale: string;
}

export const ACADEMIC_FAQ: readonly AcademicFaqItem[] = [
  {
    question: 'Why build OScope entirely client-side rather than with a Python or C backend?',
    answer:
      'A client-side architecture guarantees zero latency, complete offline operability, instant user-driven stepping, zero server maintenance costs, and effortless deployment to static CDNs such as Vercel. Furthermore, students can run simulations in any modern browser without installing compiler toolchains, virtual machines, or runtime dependencies.',
    rationale: 'Maximizes pedagogical accessibility while eliminating infrastructure overhead.'
  },
  {
    question: 'Why use TypeScript for Operating Systems simulation instead of C or Rust?',
    answer:
      'TypeScript delivers strict type safety, algebraic data types, and compile-time immutability, preventing entire classes of simulation bugs while running natively in modern JavaScript V8 engines. It allows us to implement mathematically pure algorithms alongside reactive visualizers without complex WebAssembly glue or memory segmentation boundaries.',
    rationale: 'Provides the optimal balance of type safety, expressive modeling, and web-native rendering.'
  },
  {
    question: 'Why is it critical to separate algorithmic logic from presentation components?',
    answer:
      'Separation of concerns ensures that the scheduling, memory, deadlock, and filesystem algorithms are pure, testable functions independent of React or HTML. This allows algorithms to be verified using automated unit tests with canonical textbook test cases, eliminating visual side effects from core academic calculations.',
    rationale: 'Guarantees algorithmic correctness and enables comprehensive automated test coverage.'
  },
  {
    question: 'Why does OScope use a discrete VirtualClock instead of real wall-clock time?',
    answer:
      'Real wall-clock execution (such as `setTimeout` or `performance.now()`) is subject to thread scheduling jitter, browser throttling, and non-deterministic timing delays. A discrete virtual clock increments in integer time ticks only when simulation events occur, ensuring 100% reproducible, step-by-step observable state progressions.',
    rationale: 'Determinism is the foundation of scientific and academic verification.'
  },
  {
    question: 'Why are simulation snapshots stored immutably?',
    answer:
      'Immutable state snapshots allow the simulation timeline to travel forwards and backwards arbitrarily without re-running calculations from scratch. A student can pause at tick t=15, step back to t=10 to inspect a preemption decision, and return forward without state corruption.',
    rationale: 'Enables non-destructive time-travel exploration of complex state transitions.'
  },
  {
    question: 'Why is OScope called an "educational simulator" rather than a real operating system?',
    answer:
      'OScope executes within a sandboxed browser JavaScript virtual machine. It models the mathematical and architectural behaviors of operating system policies (e.g., paging address math, Banker safety checks, Gantt scheduling) rather than interfacing with physical hardware, MMU circuits, interrupt controllers, or kernel ring-0 privilege levels.',
    rationale: 'Intellectual and academic honesty: modeling OS logic versus hosting a production kernel.'
  },
  {
    question: 'Does OScope monitor or inspect host operating system resources?',
    answer:
      'No. OScope is strictly self-contained. It never inspects host OS processes, reads host RAM, accesses the host hard drive, or requires administrator privileges. All simulated processes, virtual memory pages, and disk blocks reside in browser memory as simulated data structures.',
    rationale: 'Ensures absolute client-side security, zero privacy exposure, and sandbox compliance.'
  }
];

export interface RealOsVsSimulationRow {
  readonly dimension: string;
  readonly realOperatingSystem: string;
  readonly oscopeSimulation: string;
}

export const REAL_OS_VS_OSCOPE: readonly RealOsVsSimulationRow[] = [
  {
    dimension: 'Execution Environment',
    realOperatingSystem: 'Bare-metal CPU hardware running in Ring 0 (kernel mode) and Ring 3 (user mode).',
    oscopeSimulation: 'Client-side web browser JavaScript runtime within a secure sandbox.'
  },
  {
    dimension: 'Process Representation',
    realOperatingSystem: 'Real binary machine code instructions executed natively by the CPU hardware.',
    oscopeSimulation: 'Simulated data models representing execution bursts, arrival timestamps, and PCB states.'
  },
  {
    dimension: 'Memory Management',
    realOperatingSystem: 'Physical silicon MMU hardware, page table registers (CR3 on x86), and TLB circuits.',
    oscopeSimulation: 'Deterministic mathematical address splitter, software page table matrix, and LRU TLB model.'
  },
  {
    dimension: 'Storage Media',
    realOperatingSystem: 'Non-volatile magnetic disk platters or NVMe flash SSDs accessed via device drivers.',
    oscopeSimulation: 'Virtual block array in memory representing disk sectors, inodes, and allocation maps.'
  },
  {
    dimension: 'Concurrency & Timing',
    realOperatingSystem: 'Hardware timer interrupts, multi-core asynchronous preemption, and real-time clocks.',
    oscopeSimulation: 'Discrete event virtual clock with deterministic, reproducible, step-by-step ticks.'
  },
  {
    dimension: 'Target Objective',
    realOperatingSystem: 'Maximum performance, low latency, hardware utilization, and multi-tenant security.',
    oscopeSimulation: 'Pedagogical clarity, transparent decision explanations, and interactive visual insight.'
  }
];
