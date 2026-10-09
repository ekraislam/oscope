# OScope — Release & Exhibition Guide

**Project:** OScope — Interactive Operating System Observatory  
**Tagline:** *“Visualizing the hidden operations of an Operating System.”*  
**Release Version:** `v1.0.0-final` (Phase 12 Production Hardened)  
**Target Environment:** Modern Web Browsers (Chrome, Edge, Firefox, Safari) / Static CDN (Vercel)

---

## 1. Project Purpose & Scope

OScope is an interactive client-side simulation and visualization observatory engineered for undergraduate and graduate Operating Systems education. It addresses the fundamental pedagogical hurdle in systems programming: the invisibility of kernel mechanisms. 

Through deterministic discrete-event simulation, OScope transforms abstract conceptual models—such as register-level context switches, preemptive CPU dispatching, multi-level paging translation with TLB cache lookups, multi-resource Banker's deadlock avoidance vectors, and inode block pointer allocations—into transparent, observable, and mathematically verifiable demonstrations.

---

## 2. Technology Stack

- **Core Framework:** React 19 (`^19.0.0`)
- **Language & Type System:** TypeScript 5.8 (`strict: true`, no implicit any)
- **Bundler & Build Tool:** Vite 8.3 (`vite build` -> static SPA)
- **Styling Architecture:** Modern Vanilla CSS Design Tokens (Dark-mode first, glassmorphic UI, responsive fluid grid, zero heavy UI frameworks)
- **Client Routing:** Wouter (`~3.5.0`) with HTML5 History API deep linking and Vercel SPA rewrite fallback
- **State Management:** Zustand 5.0 (decoupled, immutable store slices per domain)
- **Icons & Graphics:** Lucide React (`^1.16.0`) & native SVG/HTML5 Canvas renderers
- **Testing Engine:** Vitest 5.0 (24 test suites, 253 unit & integration tests)

---

## 3. Architecture Summary

OScope adheres to a strict multi-tier, decoupled architecture where mathematical computation is strictly independent of UI rendering:

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

1. **Pure Algorithmic Engines:** Pure TypeScript functions calculating state transitions, scheduling traces, address translations, and safety vectors without React dependencies.
2. **Simulation Layer:** Discrete virtual clock (`VirtualClock`), priority event queue (`EventQueue`), and reversible state snapshots (`SimulationTimeline`).
3. **Reactive State Layer:** Zustand stores providing atomic mutations and subscription hooks.
4. **Visualization Layer:** Responsive SVG diagrams, canvas-based bipartite graphs, and telemetry dials.
5. **Knowledge & Documentation Layer:** Lazy-loaded academic theory guide, interactive math calculator, searchable glossary, concept map, testing matrix, and viva defense scripts.

---

## 4. Laboratory Directory

1. **Central Observatory (`/observatory`):** Unified telemetry console displaying cross-subsystem metrics, active subsystem topology, and a chronological global event log.
2. **Process Lifecycle & PCB Laboratory (`/process`):** 5-state lifecycle automaton (`NEW`, `READY`, `RUNNING`, `WAITING`, `TERMINATED`), register evacuation/restoration ($R_0 \dots R_3$), and queue inspectors.
3. **CPU Scheduling Laboratory (`/scheduling`):** 6 canonical scheduling engines (FCFS, SJF, SRTF, Non-preemptive Priority, Preemptive Priority, Round Robin) with Gantt charts, real-time math metrics ($TAT$, $WT$, $RT$, throughput, utilization), and preemption traces.
4. **Virtual Memory Management Laboratory (`/memory`):** Bitwise virtual-to-physical address translation (VPN + Offset $\to$ PFN + Offset), TLB associative cache simulation (**TLB Miss $\neq$ Page Fault**), step-by-step page fault routine, and page replacement policies (FIFO, LRU, Optimal) reproducing the canonical **Bélády's Anomaly** ($9 \to 10$ faults).
5. **Deadlock & Banker's Algorithm Laboratory (`/deadlock`):** Coffman conditions inspector, Banker's Algorithm safety evaluation vector search ($Need \le Work$), safe sequence discovery, 3-step resource-request gate, and bipartite Resource Allocation Graph (RAG) with single vs. multi-instance cycle distinction.
6. **File System & Storage Allocation Laboratory (`/filesystem`):** Directory entry to inode pointer mapping, 3 classic allocation strategies (Contiguous, Linked, Indexed), block bitmap allocation table, and live internal/external fragmentation calculators.
7. **Academic Documentation & Viva Layer (`/docs`):** Complete interactive theory guides, formula calculator, 40+ term searchable glossary, concept dependency map, testing matrix, viva defense scripts, and verified historical bibliography.

---

## 5. Verification & Testing Status

- **Typecheck:** Clean TypeScript validation with zero errors (`tsc -b` -> code 0).
- **Test Framework:** Vitest 5.0.
- **Test Matrix:** 24 Test Suites, 253 Automated Tests passing (100% success rate).
  - Validation & Invariant Assertions: 9 tests
  - Academic Formulas & Formatters: 10 tests
  - Process Model & State Transitions: 29 tests
  - CPU Scheduling Algorithms & Edge Cases: 51 tests
  - Virtual Memory Translation & Page Replacement: 32 tests
  - Deadlock Detection, Banker's Safety & RAG: 22 tests
  - File System Block Allocation & Inode Operations: 24 tests
  - Central Observatory Adapters & Event Bus: 28 tests
  - Deterministic Simulation Primitives: 19 tests
  - Content Layer, Theory & Citations: 21 tests
  - UI Accessibility & Standards: 5 tests
  - Subsystem Zustand Stores: 13 tests

---

## 6. Execution & Deployment Commands

### Local Development
```bash
# Install dependencies
npm install

# Run TypeScript static typecheck
npm run typecheck

# Run test suite
npm run test

# Launch local development server
npm run dev
```

### Production Build
```bash
# Build static bundle for production
npm run build

# Preview production build locally
npm run preview
```

### Static CDN Deployment (Vercel)
OScope is 100% client-side. Deploying to Vercel requires zero server configuration:
```bash
# Automated deployment via Vercel CLI (requires authentication)
npx vercel --prod
```
The repository includes [`vercel.json`](file:///c:/Users/hp/Desktop/OScope/vercel.json) configuring:
- `outputDirectory: "dist"`
- Single-page application URL rewrites: `/(.*) -> /index.html`
- Immutable cache headers for production chunks: `/assets/(.*) -> Cache-Control: max-age=31536000, immutable`

---

## 7. Deterministic 7-Stage Exhibition Sequence

For presentations, viva voce examinations, or technical demonstrations, follow this structured 7-stage walkthrough:

### Stage 1: Central Observatory (`/observatory`)
1. Point out the cross-subsystem status cards showing real-time metrics across all 5 OS subsystems.
2. Highlight the **Topology Map**, demonstrating that OScope is an integrated system rather than disconnected toy demos.
3. Observe the unified live event stream capturing kernel-level activity across laboratories.

### Stage 2: Process Lifecycle & PCB (`/process`)
1. Create a new process or select an existing one.
2. Advance through the lifecycle: `NEW` $\to$ `READY` $\to$ `RUNNING`.
3. Open the **PCB Inspector** to show simulated CPU registers ($R_0 \dots R_3$), program counter, memory bounds, and scheduling priority.
4. Trigger an I/O request to demonstrate transition to `WAITING`, followed by I/O completion back to `READY`.

### Stage 3: CPU Scheduling (`/scheduling`)
1. Load the pre-configured process workload with varied arrival times ($AT$) and burst times ($BT$).
2. Select **SRTF (Preemptive)** algorithm.
3. Press Play or Step forward: observe preemption when a shorter job arrives.
4. Examine the generated Gantt chart, step-by-step decision log, and aggregated metrics ($TAT$, $WT$, $RT$, CPU Utilization).
5. Switch to **FCFS** and load the "Convoy Effect" preset to show a long CPU-bound process delaying short I/O-bound jobs.

### Stage 4: Virtual Memory Management (`/memory`)
1. Select the **Address Translation** tab.
2. Enter a virtual address (e.g., `0x1A40`) and trigger translation.
3. Show the decomposition: Virtual Address $\to$ Page Number (VPN) + Offset $\to$ TLB Lookup.
4. First lookup triggers a **TLB Miss**; point out the educational callout: **TLB Miss $\neq$ Page Fault** (page is present in physical memory).
5. Switch to the **Bélády's Anomaly** demo:
   - Run reference string `[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]` under FIFO.
   - Verify that **3 Frames yield 9 Page Faults**, whereas increasing capacity to **4 Frames yields 10 Page Faults**.

### Stage 5: Deadlock & Banker's Algorithm (`/deadlock`)
1. Inspect the 4 Coffman conditions checklist.
2. In the **Banker's Algorithm** tab, examine the Allocation, Max, and calculated $Need = Max - Allocation$ matrices.
3. Run the Safety Algorithm: observe vector search ($Need_i \le Work$), resource reclamation, and derivation of a candidate **Safe Sequence** (e.g., $\langle P_1, P_3, P_4, P_0, P_2 \rangle$).
4. Switch to the **Resource Allocation Graph (RAG)** tab:
   - Select the Single-Instance Deadlock preset.
   - Run Cycle Detection: show that under single-instance resources, a cycle is necessary and sufficient for deadlock.
   - Select the Multi-Instance Cycle (No Deadlock) preset: demonstrate that a cycle with multiple resource instances does **not** necessarily constitute deadlock.

### Stage 6: File System & Storage Allocation (`/filesystem`)
1. Create a simulated file and observe directory entry insertion pointing to an assigned Inode.
2. Compare storage strategies:
   - **Contiguous Allocation:** Observe disk block run and demonstrate external fragmentation when non-contiguous free blocks cannot accommodate a file.
   - **Linked Allocation:** Demonstrate how scattered free blocks are chained together via pointers, trading random-access speed for elimination of external fragmentation.
   - **Indexed Allocation:** Show the consolidation of disk block pointers within a dedicated Index Block.
3. Inspect the live Internal Fragmentation metric for the allocated file.

### Stage 7: Academic Knowledge Layer (`/docs`)
1. Navigate to `/docs` and demonstrate the **Theory Guides** explaining each subsystem.
2. Open `/docs/formulas` and test the **Interactive Math Calculator** (calculating Turnaround Time, Waiting Time, and Block requirements live).
3. Open `/docs/glossary` and filter terms using the instant search bar.
4. Open `/docs/testing` to show the verification matrix and canonical textbook test scenarios.
5. Open `/docs/viva` to showcase the 30-second pitch, 5-minute presentation script, and teacher defense cheat sheet.

---

## 8. Academic Honesty & Boundary Disclaimer

1. **Educational Simulation:** OScope is an educational model designed for visualization and conceptual clarity. It is not a production operating system kernel.
2. **Deterministic Virtual Clock:** Time in OScope advances in discrete integer ticks governed by a virtual clock; it does not measure real-world hardware microseconds.
3. **No Kernel Host Privileges:** OScope operates completely within the client-side browser sandbox. It does not inspect, monitor, or manipulate host processes, host RAM, or host disk files.
4. **Historical Attribution:** All historical literature citations (Dijkstra 1965, Bélády 1966, Coffman 1971) and canonical textbooks (Silberschatz et al., Tanenbaum & Bos, OSTEP, Stallings) are verified with zero fabricated metadata.
