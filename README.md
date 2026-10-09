# OScope — Interactive Operating System Observatory

> **“Visualizing the hidden operations of an Operating System.”**

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue.svg)](https://www.typescriptlang.org/)
[![Vite SPA](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev/)
[![Tests Passing](https://img.shields.io/badge/Vitest-253%20Passed-success.svg)](https://vitest.dev/)
[![Client-Side SPA](https://img.shields.io/badge/Architecture-100%25%20Client--Side-brightgreen.svg)]()

OScope is an interactive client-side simulation and visualization observatory for Operating Systems concepts. It transforms abstract kernel mechanisms—such as process state transitions, CPU preemption schedules, virtual-to-physical address translations, deadlock avoidance safety vectors, and storage block layouts—into transparent, observable, and academically explainable operations.

---

## 1. Academic Abstract & Problem Motivation

Operating Systems is one of the most foundational subjects in Computer Science, yet students frequently struggle with its concepts because kernel-level operations are invisible:

- **Invisible State**: Context switches, hardware register saves, and queue migrations occur in fractions of a microsecond beneath hardware abstractions.
- **Abstract Algorithms**: Schedulers (SRTF, Round Robin), page replacement policies (LRU, Optimal), and deadlock avoidance (Banker's Algorithm) are typically taught via static textbook formulas rather than observable step-by-step simulations.
- **Isolated Lab Assignments**: University coursework often consists of fragmented programming assignments in C or Python without a cohesive mental model connecting processes to memory, synchronization, and storage.

**OScope bridges this pedagogical divide** by providing five dedicated, interactive laboratories and a unified Central Observatory dashboard. Beyond merely displaying numerical outputs, OScope explains the **academic reasoning** behind every algorithmic decision:

$$\text{Concept} \longrightarrow \text{Rule} \longrightarrow \text{Input} \longrightarrow \text{Decision} \longrightarrow \text{State Change} \longrightarrow \text{Result}$$

---

## 2. Core Educational Laboratories

### Laboratory 1: Process Lifecycle & PCB Laboratory (`/process`)
- **Five-State Lifecycle Machine**: Visualizes transitions across `NEW`, `READY`, `RUNNING`, `WAITING`, and `TERMINATED`.
- **PCB Inspector**: Inspects simulated Process Control Block fields: PID, program counter, CPU register set ($R_0 \dots R_3$), priority, memory bounds, and accounting timestamps.
- **Hardware Context Switching**: Visualizes register evacuation and restoration overhead when the CPU swaps processes.
- **Queue Dynamics**: Interactive Ready Queue, Device Wait Queue, and Terminated process table.

### Laboratory 2: CPU Scheduling Laboratory (`/scheduling`)
- **6 Canonical Scheduling Engines**: First-Come First-Served (FCFS), Shortest Job First (SJF), Shortest Remaining Time First (SRTF Preemptive), Priority (Non-Preemptive & Preemptive), and Round Robin (RR).
- **Interactive Gantt Timeline**: High-resolution timeline with preemption tick markers, idle interval indicators, and process color bars.
- **Mathematical Metrics Engine**: Real-time evaluation of Turnaround Time ($TAT = CT - AT$), Waiting Time ($WT = TAT - BT$), Response Time ($RT = \text{FirstStart} - AT$), CPU Utilization, and Throughput.
- **Convoy Effect & Starvation Demos**: Interactive presets illustrating the FCFS Convoy Effect and SJF/Priority starvation.

### Laboratory 3: Virtual Memory & Paging Laboratory (`/memory`)
- **Address Translation Pipeline**: Complete bitwise decomposition: Virtual Address $\to$ Virtual Page Number (VPN) + Offset $\to$ TLB $\to$ Page Table $\to$ Frame $\to$ Physical Address assembly.
- **TLB Cache vs. Page Table**: Hardware associative cache simulation demonstrating that **TLB Miss $\neq$ Page Fault**.
- **Page Fault Routine**: Step-by-step trap handling, free frame election, disk block fetch, and page table updates.
- **Page Replacement Policies**: Deterministic FIFO, Least Recently Used (LRU), and Optimal (OPT / Bélády's MIN).
- **Bélády's Anomaly Demonstration**: Verified canonical reference string ($[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]$) proving that FIFO produces **9 faults with 3 frames** but **10 faults with 4 frames**.

### Laboratory 4: Deadlock, Banker's Algorithm & RAG Laboratory (`/deadlock`)
- **The Four Coffman Conditions**: Interactive evaluation of Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.
- **Safe vs. Unsafe vs. Deadlocked**: Proves that **Unsafe $\neq$ automatically Deadlocked** via candidate safe sequence permutations.
- **Banker's Algorithm Matrix Model**: Real-time calculation of $Need = Max - Allocation$ and vector search ($Need \le Work$) across multi-instance resource systems.
- **Resource-Request 3-Step Gate**: Evaluates $Request \le Need$, $Request \le Available$, and provisional allocation safety before granting resources.
- **Resource Allocation Graph (RAG) Canvas**: Interactive bipartite graph editor with automatic cycle detection; distinguishes between single-instance cycle equivalency and multi-instance necessary conditions.

### Laboratory 5: File System & Storage Allocation Laboratory (`/filesystem`)
- **Virtual Inode Model**: Explains separation of human-readable directory filenames from inode metadata and block pointers.
- **3 Classic Storage Strategies**:
  - *Contiguous Allocation*: Fast sequential and direct access, but vulnerable to external fragmentation.
  - *Linked Allocation*: Eliminates external fragmentation, but incurs slow random seeking ($O(N)$) and reliability risks.
  - *Indexed Allocation*: Consolidates block pointers inside an Index Block for fast direct access without external fragmentation.
- **Fragmentation Analysis**: Quantifies Internal Fragmentation ($BlockSize - (FileSize \bmod BlockSize)$) and visualizes External Fragmentation when free block runs are non-contiguous.

### Central Observatory Dashboard (`/observatory`)
- **Cross-Subsystem Telemetry**: Real-time unified bus streaming synchronized metrics across Process, CPU, Memory, Deadlock, and Storage.
- **Subsystem Topology Map**: Interactive visual wiring diagram illustrating operational interconnects across all five laboratories.
- **Global Event Terminal**: Filterable chronological trace log capturing major kernel events across the entire simulation session.

---

## 3. Academic Knowledge & Documentation Layer (`/docs`)

OScope includes a comprehensive, client-side academic knowledge repository designed for exam study, laboratory coursework, and viva voce defense:

| Section | Route | Educational Content |
| :--- | :--- | :--- |
| **Academic Overview** | `/docs` | Conceptual overview, curriculum roadmap, and quick-start links. |
| **Process Theory** | `/docs/process` | Process vs. Program, PCB structure, 5-state lifecycle, valid/invalid transitions. |
| **CPU Scheduling** | `/docs/scheduling` | CPU burst cycles, preemption, convoy effects, and 6 full algorithm teardowns. |
| **Memory Theory** | `/docs/memory` | Virtual memory, address translation, TLB semantics, page faults, and Bélády anomaly. |
| **Deadlock Theory** | `/docs/deadlock` | Coffman conditions, safe/unsafe boundaries, Banker matrix algebra, and RAG cycles. |
| **Storage Theory** | `/docs/filesystem` | Inode models, directory entries, allocation comparison table, and fragmentation. |
| **Formula Reference** | `/docs/formulas` | Authoritative formulas with an **Interactive Math Calculator** (TAT, WT, RT, VA $\to$ PA, Blocks). |
| **Glossary** | `/docs/glossary` | 40+ canonical Operating Systems terms with search, categories, and direct lab links. |
| **Concept Map** | `/docs/concept-map` | Deterministic visual dependency map linking processes, memory, locks, and files. |
| **Architecture & FAQ** | `/docs/architecture` | Multi-tier layer teardown, execution flow traces, Real OS vs. OScope, and Academic FAQ. |
| **Viva Mode** | `/docs/viva` | 30s pitch, 2min overview, 5min timed script, 10-step teacher cheat sheet, and 5 common traps. |
| **References** | `/docs/references` | Strictly verified canonical textbooks and landmark historic papers. |

---

## 4. Multi-Tier Decoupled Architecture

OScope is engineered around strict architectural separation. Algorithmic calculations are completely decoupled from UI presentation:

```text
┌────────────────────────────────────────────────────────┐
│  Presentation Layer (React 19, Wouter SPA Router)       │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Visualization Layer (SVG State Machines, Canvas RAG)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Subsystem State Stores (Zustand Immutable Snapshots)  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Simulation Primitives (VirtualClock, EventQueue, Trace)│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Pure Algorithmic Engines (Stateless Math Functions)    │
│  Schedulers · Page Replacers · Banker Safety · Inodes   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Domain Models (PCB, Frame, Inode, Resource Matrix)    │
└────────────────────────────────────────────────────────┘
```

### Key Engineering Invariants
1. **100% Deterministic Simulation**: Virtual time advances strictly in discrete integer ticks governed by a `VirtualClock`, eliminating browser thread jitter.
2. **Reversible Snapshot Timelines**: Immutable state capture allows forward single-stepping and backward time-travel inspection.
3. **Zero Backend Dependency**: Executes entirely client-side in the browser. Zero servers, zero databases, zero cloud dependencies.
4. **Code-Split Documentation Bundle**: The `/docs` knowledge layer is dynamically imported via `React.lazy()`, preserving the initial app bundle size (~788 kB minified / ~180 kB gzip).

---

## 5. Academic References & Bibliography

In accordance with strict academic honesty, OScope only cites verified canonical literature and milestone historical papers. Zero fabricated DOIs, zero invented page numbers:

1. **Silberschatz, A., Galvin, P. B., & Gagne, G. (2018).** *Operating System Concepts* (10th ed.). John Wiley & Sons.
2. **Tanenbaum, A. S., & Bos, H. (2014).** *Modern Operating Systems* (4th ed.). Pearson.
3. **Arpaci-Dusseau, R. H., & Arpaci-Dusseau, A. C. (2018).** *Operating Systems: Three Easy Pieces (OSTEP)*. Arpaci-Dusseau Books.
4. **Stallings, W. (2017).** *Operating Systems: Internals and Design Principles* (9th ed.). Pearson.
5. **Coffman, E. G., Elphick, M. J., & Shoshani, A. (1971).** *System Deadlocks*. ACM Computing Surveys (CSUR), 3(2), 67–78.
6. **Bélády, L. A. (1966).** *A Study of Replacement Algorithms for a Virtual-Storage Computer*. IBM Systems Journal, 5(2), 78–101.
7. **Dijkstra, E. W. (1965).** *Cooperating Sequential Processes* (EWD-123). Technological University Eindhoven.

---

## 6. Real OS vs. OScope Educational Simulation

| Dimension | Production Operating System (Linux, Windows) | OScope Educational Simulator |
| :--- | :--- | :--- |
| **Execution Context** | Bare-metal CPU hardware running in Ring 0 (kernel) and Ring 3 (user). | Sandboxed client-side web browser JavaScript runtime. |
| **Process Execution** | Native binary machine instructions executed by physical cores. | Discrete data models representing execution bursts and PCB states. |
| **Memory Hierarchy** | Silicon MMU hardware, page table registers (CR3), and physical TLB chips. | Deterministic address splitting math, software page tables, and LRU TLB. |
| **Storage Media** | Non-volatile magnetic platters or NVMe flash SSDs via storage drivers. | In-memory virtual disk block array and simulated Inode records. |
| **Concurrency & Clock** | Asynchronous hardware timer interrupts and non-deterministic clock times. | Discrete-event virtual clock with deterministic, reproducible, step-by-step ticks. |
| **Primary Objective** | Low-latency hardware throughput and multi-tenant security isolation. | Transparent visualization, pedagogical clarity, and algorithmic explainability. |

---

## 7. Security & Privacy Statement

- **Zero Host Process Monitoring**: OScope does not inspect host operating system processes.
- **Zero Host Memory Inspection**: OScope cannot read or write physical host RAM.
- **Zero Host File System Access**: OScope runs entirely in-memory; it does not touch the user's hard drive.
- **Zero External Telemetry**: OScope transmits zero simulation data to external servers.
- **Sandbox Compliance**: Operates strictly within modern browser Web Standards without requiring elevated privileges.

---

## 8. Verification & Test Suite

OScope is verified using automated test suites built with [Vitest](https://vitest.dev/):

```bash
npm test
```

### Test Suite Summary
- **24 Test Suites** covering all domains
- **253 Automated Tests** passing with 100% success
- **Test Categories**:
  - Pure scheduling algorithm correctness (FCFS, SJF, SRTF, RR, Priority)
  - Scheduling edge cases (simultaneous arrivals, zero-bursts, tie-breaks, preemption boundaries)
  - Virtual memory address translation math and TLB hit/miss logic
  - Page replacement determinism and Bélády anomaly reproduction ($9 \to 10$ faults)
  - Banker's Algorithm safety evaluation, safe sequence discovery, and request rollback
  - Resource Allocation Graph cycle detection and reduction algorithms
  - File system block allocation, Inode mapping, and internal/external fragmentation
  - Simulation primitives: VirtualClock, EventQueue, SimulationTimeline immutability
  - Academic content layer: formulas, calculators, glossary, and verified citations

---

## 9. Local Development & Build

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+` or `v11+`

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript typecheck
npm run typecheck

# 3. Run automated test suite
npm run test

# 4. Start local development server
npm run dev
```

### Production Build
```bash
# Compile and bundle static production assets to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 10. Deployment Readiness

OScope is configured as a static Single Page Application (SPA) compatible with modern static CDNs:
- **Zero Server Runtime**: Pure static assets (`HTML`, `JS`, `CSS`).
- **SPA Routing Fallback**: Configured via `vercel.json` rewrite rules to route all paths (`/process`, `/scheduling`, `/memory`, `/deadlock`, `/filesystem`, `/observatory`, `/docs`, `/docs/*`) to `index.html`.
- **Performance Optimized**: Sub-second initial load with code-split documentation chunks.

---

## 11. Project Roadmap & Development Phases

```text
[✓] Phase 01 — Architecture & Foundation Analysis
[✓] Phase 02 — Foundation Scaffolding & Vercel-Ready Setup
[✓] Phase 03 — Core Domain Models & Simulation Primitives
[✓] Phase 04 — Process Lifecycle & PCB Laboratory
[✓] Phase 05 — CPU Scheduling Laboratory & Scheduling Engine
[✓] Phase 06 — Memory Management, Paging, TLB & Page Replacement Laboratory
[✓] Phase 07 — Deadlock, Resource Allocation Graph & Banker’s Algorithm Laboratory
[✓] Phase 08 — File System & Storage Allocation Laboratory
[✓] Phase 09 — Central Observatory Dashboard & Cross-Laboratory Integration
[✓] Phase 10 — UI/UX Polish, Accessibility, Motion & Exhibition Refinement
[✓] Phase 11 — Interactive Academic Documentation, Theory Guides & Viva-Ready Knowledge Layer
[✓] Phase 12 — Final Production Audit, Exhibition Readiness, Release Hardening & Vercel Deployment
```

---

## 12. License

Developed for educational purposes in University Operating Systems curricula. All algorithmic models are designed for conceptual instruction and academic demonstration.
