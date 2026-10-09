/**
 * OScope — Unified Academic Formula Reference & Calculators
 * Authoritative mathematical formulations across CPU scheduling, memory management,
 * deadlock avoidance, and secondary storage allocation. Includes verified dynamic
 * calculator helper functions for live student experimentation.
 */

import type { FormulaEntry } from './types';

export const FORMULA_CATALOG: readonly FormulaEntry[] = [
  // --- CPU SCHEDULING FORMULAS ---
  {
    id: 'formula-tat',
    name: 'Turnaround Time (TAT)',
    subsystem: 'SCHEDULING',
    latexOrText: 'TAT = CT - AT',
    variables: [
      {
        symbol: 'TAT',
        name: 'Turnaround Time',
        description: 'Total elapsed time from process submission to complete termination.',
        unit: 'time units'
      },
      {
        symbol: 'CT',
        name: 'Completion Time',
        description: 'Virtual clock timestamp at which the process finishes its final CPU burst.',
        unit: 'time units'
      },
      {
        symbol: 'AT',
        name: 'Arrival Time',
        description: 'Virtual clock timestamp at which the process first enters the Ready Queue.',
        unit: 'time units'
      }
    ],
    interpretation:
      'Turnaround Time measures the entire lifespan of a process inside the operating system, encompassing waiting in ready queues, context switch latency, I/O bursts, and active CPU execution time.',
    whereUsed: 'CPU Scheduling Laboratory — Process Metrics Table, Performance Summary Cards.',
    sampleCalculation: {
      inputs: { AT: 2, CT: 10 },
      result: 'TAT = 10 - 2 = 8 time units',
      explanation: 'Process arrived at t=2 and finished at t=10, spending a total of 8 units in the system.'
    }
  },
  {
    id: 'formula-wt',
    name: 'Waiting Time (WT)',
    subsystem: 'SCHEDULING',
    latexOrText: 'WT = TAT - BT',
    variables: [
      {
        symbol: 'WT',
        name: 'Waiting Time',
        description: 'Total cumulative time the process spent sitting in the Ready Queue waiting for CPU assignment.',
        unit: 'time units'
      },
      {
        symbol: 'TAT',
        name: 'Turnaround Time',
        description: 'Total time spent in the system (CT - AT).',
        unit: 'time units'
      },
      {
        symbol: 'BT',
        name: 'Burst Time',
        description: 'Total CPU execution duration required by the process to complete its compute workload.',
        unit: 'time units'
      }
    ],
    interpretation:
      'Waiting Time isolates purely passive delay caused by scheduling competition. Minimizing average waiting time is a primary goal of optimal scheduling algorithms (such as SJF/SRTF).',
    whereUsed: 'CPU Scheduling Laboratory — Comparative Metrics, Algorithm Benchmarking.',
    sampleCalculation: {
      inputs: { TAT: 8, BT: 5 },
      result: 'WT = 8 - 5 = 3 time units',
      explanation: 'Of the 8 total units the process spent in the system, 5 were spent executing on CPU, leaving 3 units spent waiting.'
    }
  },
  {
    id: 'formula-rt',
    name: 'Response Time (RT)',
    subsystem: 'SCHEDULING',
    latexOrText: 'RT = FirstStartTime - AT',
    variables: [
      {
        symbol: 'RT',
        name: 'Response Time',
        description: 'Time from initial process arrival to the exact moment it is first dispatched onto the CPU.',
        unit: 'time units'
      },
      {
        symbol: 'FirstStartTime',
        name: 'First CPU Start Time',
        description: 'Timestamp when the process receives its very first CPU burst quantum.',
        unit: 'time units'
      },
      {
        symbol: 'AT',
        name: 'Arrival Time',
        description: 'Timestamp when the process entered the Ready Queue.',
        unit: 'time units'
      }
    ],
    interpretation:
      'Critical for interactive and time-sharing systems where human users judge system responsiveness by how quickly an application begins producing initial visual output or interaction feedback.',
    whereUsed: 'CPU Scheduling Laboratory — Round Robin Analysis, Interactive Responsiveness.',
    sampleCalculation: {
      inputs: { AT: 3, FirstStartTime: 5 },
      result: 'RT = 5 - 3 = 2 time units',
      explanation: 'The process waited 2 time units after arrival before gaining the CPU for the first time.'
    }
  },
  {
    id: 'formula-cpu-utilization',
    name: 'CPU Utilization (%)',
    subsystem: 'SCHEDULING',
    latexOrText: 'CPU Utilization = (Total Busy Time / Total Elapsed Time) * 100',
    variables: [
      {
        symbol: 'Total Busy Time',
        name: 'CPU Busy Duration',
        description: 'Sum of all time intervals during which the CPU was actively executing user or system processes.',
        unit: 'time units'
      },
      {
        symbol: 'Total Elapsed Time',
        name: 'Simulation Makespan',
        description: 'Total duration from simulation start (t=0) to completion of all scheduled workloads.',
        unit: 'time units'
      }
    ],
    interpretation:
      'Reflects the percentage of time the central processing unit is performing useful work versus remaining idle. Real-world systems aim for 40% (light load) to 90% (heavily loaded mainframe).',
    whereUsed: 'CPU Scheduling Laboratory & Central Observatory — Global System Health.',
    sampleCalculation: {
      inputs: { BusyTime: 45, TotalTime: 50 },
      result: 'Utilization = (45 / 50) * 100 = 90.0%',
      explanation: 'Out of 50 total simulation time units, the CPU was actively running processes for 45 units and idle for 5 units.'
    }
  },
  {
    id: 'formula-throughput',
    name: 'Throughput',
    subsystem: 'SCHEDULING',
    latexOrText: 'Throughput = Completed Processes / Total Elapsed Time',
    variables: [
      {
        symbol: 'Completed Processes',
        name: 'Total Process Count',
        description: 'Number of processes that have transitioned to the TERMINATED state.',
        unit: 'processes'
      },
      {
        symbol: 'Total Elapsed Time',
        name: 'Simulation Makespan',
        description: 'Total duration of the evaluated scheduling session.',
        unit: 'time units'
      }
    ],
    interpretation:
      'The rate at which the operating system completes user workloads per unit of time. High throughput indicates effective process completion, particularly in batch processing systems.',
    whereUsed: 'CPU Scheduling Laboratory — Comparative Workload Summary.',
    sampleCalculation: {
      inputs: { Completed: 5, TotalTime: 25 },
      result: 'Throughput = 5 / 25 = 0.20 processes / time unit',
      explanation: 'The system completed an average of 1 process every 5 time units.'
    }
  },

  // --- MEMORY MANAGEMENT FORMULAS ---
  {
    id: 'formula-page-number',
    name: 'Virtual Page Number (VPN) & Offset Decomposition',
    subsystem: 'MEMORY',
    latexOrText: 'VPN = floor(VA / PageSize),  Offset = VA mod PageSize',
    variables: [
      {
        symbol: 'VA',
        name: 'Virtual Address',
        description: 'Logical byte memory address referenced by the CPU.',
        unit: 'bytes'
      },
      {
        symbol: 'PageSize',
        name: 'Page / Frame Size',
        description: 'Fixed size of a memory page/frame, typically a power of two (e.g. 4096 bytes).',
        unit: 'bytes'
      },
      {
        symbol: 'VPN',
        name: 'Virtual Page Number',
        description: 'High-order index used to look up the frame mapping in the Page Table.',
        unit: 'integer index'
      },
      {
        symbol: 'Offset',
        name: 'Page Offset (Displacement)',
        description: 'Low-order displacement within the selected page/frame. Invariant during translation.',
        unit: 'bytes'
      }
    ],
    interpretation:
      'Hardware MMUs split virtual addresses into VPN and Offset via bit-shifting. For PageSize = 2^k bytes, the lower k bits represent the Offset, and the remaining high-order bits represent the VPN.',
    whereUsed: 'Memory Laboratory — Address Translation Pipeline & Live Bit Inspector.',
    sampleCalculation: {
      inputs: { VA: 10000, PageSize: 4096 },
      result: 'VPN = floor(10000 / 4096) = 2, Offset = 10000 mod 4096 = 1808',
      explanation: 'Virtual address 10000 resides at byte 1808 inside virtual page number 2.'
    }
  },
  {
    id: 'formula-physical-address',
    name: 'Physical Address Assembly',
    subsystem: 'MEMORY',
    latexOrText: 'PA = (Frame Number * FrameSize) + Offset',
    variables: [
      {
        symbol: 'PA',
        name: 'Physical Address',
        description: 'Actual binary address dispatched on the physical memory bus to RAM.',
        unit: 'bytes'
      },
      {
        symbol: 'Frame Number',
        name: 'Physical Frame Number (PFN)',
        description: 'Physical RAM slot assigned to the requested virtual page.',
        unit: 'integer index'
      },
      {
        symbol: 'FrameSize',
        name: 'Frame Size',
        description: 'Identical to PageSize (typically 4096 bytes).',
        unit: 'bytes'
      },
      {
        symbol: 'Offset',
        name: 'Displacement',
        description: 'Identical offset carried directly from the virtual address.',
        unit: 'bytes'
      }
    ],
    interpretation:
      'Translates logical references to physical RAM words. Notice that the frame number replaces the page number, while the displacement (offset) remains completely unchanged.',
    whereUsed: 'Memory Laboratory — Address Translation Pipeline Output.',
    sampleCalculation: {
      inputs: { Frame: 7, FrameSize: 4096, Offset: 1808 },
      result: 'PA = (7 * 4096) + 1808 = 28672 + 1808 = 30480',
      explanation: 'Virtual page 2 mapped to physical frame 7 translates to physical RAM byte address 30480.'
    }
  },
  {
    id: 'formula-hit-fault-rate',
    name: 'Hit Rate & Page Fault Rate',
    subsystem: 'MEMORY',
    latexOrText: 'HitRate = Hits / TotalRefs,  FaultRate = PageFaults / TotalRefs',
    variables: [
      {
        symbol: 'Hits',
        name: 'Memory / TLB Hits',
        description: 'Number of references successfully found resident in cache / physical RAM.',
        unit: 'count'
      },
      {
        symbol: 'PageFaults',
        name: 'Page Fault Count',
        description: 'Number of memory references requiring secondary disk fetch and frame replacement.',
        unit: 'count'
      },
      {
        symbol: 'TotalRefs',
        name: 'Total Memory References',
        description: 'Sum of all memory references processed in the trace stream.',
        unit: 'count'
      }
    ],
    interpretation:
      'Hit rate indicates the effectiveness of the caching hierarchy (TLB or RAM). Fault rate is the complement: FaultRate = 1.0 - HitRate (in a pure resident paging model).',
    whereUsed: 'Memory Laboratory — TLB Statistics & Page Replacement Comparison Cards.',
    sampleCalculation: {
      inputs: { Hits: 15, Faults: 5, TotalRefs: 20 },
      result: 'HitRate = 15/20 = 75.0%, FaultRate = 5/20 = 25.0%',
      explanation: '75% of memory references resolved in memory; 25% triggered costly page fault handlers.'
    }
  },

  // --- DEADLOCK FORMULAS ---
  {
    id: 'formula-banker-need',
    name: "Banker's Algorithm Need Matrix",
    subsystem: 'DEADLOCK',
    latexOrText: 'Need[i, j] = Max[i, j] - Allocation[i, j]',
    variables: [
      {
        symbol: 'Need[i, j]',
        name: 'Remaining Need',
        description: 'Maximum additional units of resource j that process i may still request before completing.',
        unit: 'resource units'
      },
      {
        symbol: 'Max[i, j]',
        name: 'Declared Maximum Claim',
        description: 'Total peak requirement of resource j declared in advance by process i.',
        unit: 'resource units'
      },
      {
        symbol: 'Allocation[i, j]',
        name: 'Current Allocation',
        description: 'Units of resource j currently held by process i.',
        unit: 'resource units'
      }
    ],
    interpretation:
      'Computes the worst-case remaining demand for each process. In the safety algorithm, a process can only be scheduled if its entire Need vector is less than or equal to current system Work.',
    whereUsed: 'Deadlock Laboratory — Matrix Inspector & Safety Step Reasoning Engine.',
    sampleCalculation: {
      inputs: { Max: 7, Allocation: 2 },
      result: 'Need = 7 - 2 = 5 units',
      explanation: 'Process currently holds 2 units and may request up to 5 additional units before releasing all resources.'
    }
  },
  {
    id: 'formula-banker-work',
    name: "Banker's Safety Work Vector Update",
    subsystem: 'DEADLOCK',
    latexOrText: 'Work[j] = Work[j] + Allocation[i, j]',
    variables: [
      {
        symbol: 'Work[j]',
        name: 'Hypothetical Available Vector',
        description: 'Running count of resources available to satisfy future processes in the safe sequence.',
        unit: 'resource units'
      },
      {
        symbol: 'Allocation[i, j]',
        name: 'Process Allocation',
        description: 'Resources held by process i that are reclaimed when process i hypothetically completes.',
        unit: 'resource units'
      }
    ],
    interpretation:
      'Models the hypothetical completion of process i. Once process i finishes, all resources it currently holds are released back into the available pool for other waiting processes.',
    whereUsed: 'Deadlock Laboratory — Step-by-Step Safe Sequence Trace.',
    sampleCalculation: {
      inputs: { CurrentWork: 3, ProcessAllocation: 2 },
      result: 'New Work = 3 + 2 = 5 units',
      explanation: 'Process terminates, releasing its 2 allocated units and increasing available work from 3 to 5.'
    }
  },

  // --- FILE SYSTEM FORMULAS ---
  {
    id: 'formula-fs-block-count',
    name: 'Required Storage Block Count',
    subsystem: 'FILESYSTEM',
    latexOrText: 'RequiredBlocks = ceil(FileSize / BlockSize)',
    variables: [
      {
        symbol: 'RequiredBlocks',
        name: 'Allocated Blocks',
        description: 'Total number of discrete physical disk blocks required to store the file data.',
        unit: 'blocks'
      },
      {
        symbol: 'FileSize',
        name: 'File Size in Bytes',
        description: 'Logical byte length of the file data.',
        unit: 'bytes'
      },
      {
        symbol: 'BlockSize',
        name: 'Physical Block Size',
        description: 'Fixed allocation unit of the secondary storage volume (e.g., 512 B or 4096 B).',
        unit: 'bytes'
      }
    ],
    interpretation:
      'Because storage devices allocate disk space exclusively in integer block multiples, any non-zero remainder requires allocating an entire additional disk block.',
    whereUsed: 'File System Laboratory — File Creation Dialog & Storage Utilization Card.',
    sampleCalculation: {
      inputs: { FileSize: 1500, BlockSize: 512 },
      result: 'RequiredBlocks = ceil(1500 / 512) = ceil(2.929) = 3 blocks',
      explanation: '1500 bytes require 3 disk blocks (total allocated: 1536 bytes).'
    }
  },
  {
    id: 'formula-fs-internal-frag',
    name: 'Internal Storage Fragmentation',
    subsystem: 'FILESYSTEM',
    latexOrText: 'InternalFrag = (BlockSize - (FileSize mod BlockSize)) mod BlockSize',
    variables: [
      {
        symbol: 'InternalFrag',
        name: 'Internal Wasted Space',
        description: 'Unused bytes in the final allocated disk block that cannot be shared with any other file.',
        unit: 'bytes'
      },
      {
        symbol: 'BlockSize',
        name: 'Physical Block Size',
        description: 'Fixed capacity of a disk block.',
        unit: 'bytes'
      },
      {
        symbol: 'FileSize',
        name: 'File Size',
        description: 'Total logical bytes of the stored file.',
        unit: 'bytes'
      }
    ],
    interpretation:
      'Represents slack space inside the final block of a file. When FileSize is an exact multiple of BlockSize, internal fragmentation is 0 bytes.',
    whereUsed: 'File System Laboratory — Disk Layout Grid & Storage Efficiency Analysis.',
    sampleCalculation: {
      inputs: { FileSize: 1500, BlockSize: 512 },
      result: 'InternalFrag = 512 - (1500 mod 512) = 512 - 476 = 36 bytes',
      explanation: 'The third block contains 476 bytes of file data and 36 bytes of unused wasted slack.'
    }
  }
];

// --- INTERACTIVE CALCULATION LOGIC FOR FORMULA EXPERIMENTER ---

export interface SchedulingCalculationInput {
  at: number;
  bt: number;
  ct: number;
  firstStart?: number;
}

export interface SchedulingCalculationResult {
  tat: number;
  wt: number;
  rt: number;
}

export function calculateSchedulingMetrics(input: SchedulingCalculationInput): SchedulingCalculationResult {
  const tat = Math.max(0, input.ct - input.at);
  const wt = Math.max(0, tat - input.bt);
  const first = input.firstStart ?? input.at;
  const rt = Math.max(0, first - input.at);
  return { tat, wt, rt };
}

export interface MemoryCalculationInput {
  virtualAddress: number;
  pageSize: number;
  assignedFrame: number;
}

export interface MemoryCalculationResult {
  vpn: number;
  offset: number;
  physicalAddress: number;
}

export function calculateMemoryTranslation(input: MemoryCalculationInput): MemoryCalculationResult {
  const safePageSize = input.pageSize > 0 ? input.pageSize : 4096;
  const safeVA = Math.max(0, input.virtualAddress);
  const vpn = Math.floor(safeVA / safePageSize);
  const offset = safeVA % safePageSize;
  const physicalAddress = input.assignedFrame * safePageSize + offset;
  return { vpn, offset, physicalAddress };
}

export interface FilesystemCalculationInput {
  fileSize: number;
  blockSize: number;
}

export interface FilesystemCalculationResult {
  requiredBlocks: number;
  totalAllocatedBytes: number;
  internalFragmentation: number;
  slackPercentage: number;
}

export function calculateFilesystemStorage(input: FilesystemCalculationInput): FilesystemCalculationResult {
  const safeBlockSize = input.blockSize > 0 ? input.blockSize : 512;
  const safeFileSize = Math.max(0, input.fileSize);
  const requiredBlocks = Math.ceil(safeFileSize / safeBlockSize) || 1;
  const totalAllocatedBytes = requiredBlocks * safeBlockSize;
  const remainder = safeFileSize % safeBlockSize;
  const internalFragmentation = remainder === 0 && safeFileSize > 0 ? 0 : safeBlockSize - remainder;
  const actualFrag = safeFileSize === 0 ? safeBlockSize : internalFragmentation;
  const slackPercentage = totalAllocatedBytes > 0 ? (actualFrag / totalAllocatedBytes) * 100 : 0;

  return {
    requiredBlocks,
    totalAllocatedBytes,
    internalFragmentation: actualFrag,
    slackPercentage: Number(slackPercentage.toFixed(1))
  };
}
