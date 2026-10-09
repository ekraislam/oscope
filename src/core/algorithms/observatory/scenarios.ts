/**
 * OScope — Central Observatory Educational Showcase Scenarios
 * High-level configurations that orchestrate existing academic presets
 * across Process, CPU Scheduling, Memory, Deadlock, and File System laboratories.
 */

export interface ObservatoryScenario {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly category: 'CPU' | 'MEMORY' | 'DEADLOCK' | 'STORAGE' | 'SYSTEM_TOUR';
  readonly description: string;
  readonly educationalFocus: string;
  readonly recommendedLabRoute: string;
  readonly actions: {
    readonly schedulingPresetId?: string;
    readonly memoryPresetId?: string;
    readonly deadlockPresetId?: string;
    readonly filesystemPresetId?: string;
  };
}

export const OBSERVATORY_SCENARIOS: readonly ObservatoryScenario[] = Object.freeze([
  {
    id: 'tour_full_system',
    name: '1. Full OScope Observatory Tour',
    subtitle: 'Coordinated baseline tour across all five simulated OS subsystems',
    category: 'SYSTEM_TOUR',
    description:
      'Orchestrates classic textbook workloads across all laboratories: Shortest Remaining Time First (SRTF) CPU scheduling, Belady Anomaly FIFO memory paging, safe Banker resource allocation, and contiguous storage extents.',
    educationalFocus: 'Comprehensive architectural demonstration of an integrated Operating System model.',
    recommendedLabRoute: '/scheduling',
    actions: {
      schedulingPresetId: 'srtf_preemption',
      memoryPresetId: 'belady_anomaly_demo',
      deadlockPresetId: 'classic-safe',
      filesystemPresetId: 'contiguous_layout',
    },
  },
  {
    id: 'scenario_cpu_intensive',
    name: '2. High-Contention CPU Scheduling',
    subtitle: 'Preemptive Shortest Remaining Time First (SRTF) under heavy arrival pressure',
    category: 'CPU',
    description:
      'Simulates high-frequency process arrivals with varied burst times. Shows how SRTF minimizes average turnaround time at the cost of frequent context switching.',
    educationalFocus: 'CPU dispatching, context switch penalties, and scheduling Gantt chart dynamics.',
    recommendedLabRoute: '/scheduling',
    actions: {
      schedulingPresetId: 'srtf_preemption',
      filesystemPresetId: 'empty_disk',
    },
  },
  {
    id: 'scenario_memory_pressure',
    name: '3. Memory Thrashing & Belady’s Anomaly',
    subtitle: 'Elevated page fault rates, frame allocation stress, and TLB cache behavior',
    category: 'MEMORY',
    description:
      'Demonstrates the famous Belady Anomaly under FIFO replacement alongside comparative LRU evaluation. Traces TLB hits/misses and physical memory frame occupancy.',
    educationalFocus: 'Virtual-to-physical address translation, page faults, and replacement efficiency.',
    recommendedLabRoute: '/memory',
    actions: {
      memoryPresetId: 'belady_anomaly_demo',
      schedulingPresetId: 'convoy_fcfs',
    },
  },
  {
    id: 'scenario_resource_risk',
    name: '4. Resource Risk & Unsafe Banker State',
    subtitle: 'Banker’s Algorithm safety evaluation vs circular wait in Resource Allocation Graph',
    category: 'DEADLOCK',
    description:
      'Creates a state where available resources cannot guarantee completion of all processes (UNSAFE), contrasting it with an actual confirmed DEADLOCK cycle.',
    educationalFocus: 'Deadlock avoidance vs detection, safety vectors, and Wait-For-Graph reduction.',
    recommendedLabRoute: '/deadlock',
    actions: {
      deadlockPresetId: 'single-instance-deadlock',
      schedulingPresetId: 'priority_starvation',
    },
  },
  {
    id: 'scenario_storage_fragmentation',
    name: '5. Storage External Fragmentation',
    subtitle: 'Contiguous allocation failure vs non-contiguous linked and indexed storage',
    category: 'STORAGE',
    description:
      'Presents a disk with 7 total free blocks where the largest contiguous extent is only 2 blocks. Requesting 4 contiguous blocks fails, while linked or indexed allocation succeeds.',
    educationalFocus: 'Internal vs external fragmentation, Inode block pointers, and index block overhead.',
    recommendedLabRoute: '/filesystem',
    actions: {
      filesystemPresetId: 'external_fragmentation',
      deadlockPresetId: 'classic-safe',
    },
  },
]);
