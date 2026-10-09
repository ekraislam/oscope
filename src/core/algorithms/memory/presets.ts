/**
 * OScope — Educational Memory Management & Page Replacement Presets
 * Curated scenarios demonstrating address translation, TLB hits/misses, page faults,
 * Belady's Anomaly, and comparative replacement performance.
 */

import type { MemoryConfiguration, ReplacementAlgorithm } from '../../models/memory';

export interface MemoryPreset {
  readonly id: string;
  readonly name: string;
  readonly category: 'TRANSLATION' | 'REPLACEMENT' | 'ANOMALY';
  readonly purpose: string;
  readonly expectedConcept: string;
  readonly interestingBehavior: string;
  readonly config: MemoryConfiguration;
  readonly virtualAddress?: number;
  readonly referenceString?: readonly number[];
  readonly frameCount?: number;
  readonly recommendedAlgorithm?: ReplacementAlgorithm;
}

export const MEMORY_PRESETS: readonly MemoryPreset[] = Object.freeze([
  {
    id: 'basic_translation',
    name: '1. Basic Virtual Address Decomposition',
    category: 'TRANSLATION',
    purpose: 'Demonstrates bit-level virtual address decomposition into page number and offset.',
    expectedConcept: 'Address Translation Arithmetic: pageNumber = VA / PageSize, offset = VA % PageSize',
    interestingBehavior: 'For a 4096-byte (4KB) page size, the lower 12 bits represent the byte offset, while the upper 4 bits denote the virtual page number.',
    config: {
      pageSizeBytes: 4096,
      totalMemoryBytes: 65536,
      frameCount: 16,
      tlbSize: 4,
      virtualAddressBits: 16,
      virtualMemoryBytes: 65536,
    },
    virtualAddress: 0x2A3F, // 10815 -> Page 2, Offset 2623 (0xA3F)
  },
  {
    id: 'tlb_hit_demo',
    name: '2. TLB Cache Hit Demonstration',
    category: 'TRANSLATION',
    purpose: 'Shows how an existing translation stored in the hardware TLB bypasses the simulated page table lookup.',
    expectedConcept: 'Hardware Associative Cache (TLB) Acceleration',
    interestingBehavior: 'Translation is resolved directly in O(1) from the TLB, eliminating the latency of consulting the main-memory page table.',
    config: {
      pageSizeBytes: 1024,
      totalMemoryBytes: 16384,
      frameCount: 16,
      tlbSize: 4,
      virtualAddressBits: 16,
      virtualMemoryBytes: 65536,
    },
    virtualAddress: 0x0C50, // Page 3 -> Frame 7
  },
  {
    id: 'tlb_miss_valid_pt',
    name: '3. TLB Miss with Valid Page Table Fallback',
    category: 'TRANSLATION',
    purpose: 'Illustrates a TLB miss followed by a successful page table walk (Page Table Hit).',
    expectedConcept: 'Distinction between TLB Miss (cache miss) and Page Fault (memory absence)',
    interestingBehavior: 'Notice: A TLB miss is NOT a page fault! The requested page is resident in RAM; the translation is retrieved from the Page Table and loaded into the TLB.',
    config: {
      pageSizeBytes: 2048,
      totalMemoryBytes: 32768,
      frameCount: 16,
      tlbSize: 4,
      virtualAddressBits: 16,
      virtualMemoryBytes: 65536,
    },
    virtualAddress: 0x1408, // Page 2, Offset 8
  },
  {
    id: 'page_fault_handling',
    name: '4. Page Fault & Frame Allocation',
    category: 'TRANSLATION',
    purpose: 'Demonstrates handling of a non-resident page (invalid page table entry) and physical frame binding.',
    expectedConcept: 'Demand Paging, OS Page-Fault Interrupt Routine, and Frame Allocation',
    interestingBehavior: 'Because the page is not in physical memory, the OS trap handler allocates the lowest-numbered free frame and updates the Page Table.',
    config: {
      pageSizeBytes: 1024,
      totalMemoryBytes: 16384,
      frameCount: 16,
      tlbSize: 4,
      virtualAddressBits: 16,
      virtualMemoryBytes: 65536,
    },
    virtualAddress: 0x3810, // Page 14 (initially unmapped)
  },
  {
    id: 'fifo_textbook',
    name: '5. FIFO Page Replacement (Silberschatz)',
    category: 'REPLACEMENT',
    purpose: 'Classic 3-frame textbook example demonstrating queue-based page replacement.',
    expectedConcept: 'First-In, First-Out Queue Eviction Discipline',
    interestingBehavior: 'Oldest resident page is evicted regardless of how frequently it is referenced.',
    config: {
      pageSizeBytes: 4096,
      totalMemoryBytes: 16384,
      frameCount: 3,
      tlbSize: 4,
    },
    frameCount: 3,
    referenceString: Object.freeze([7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]),
    recommendedAlgorithm: 'FIFO',
  },
  {
    id: 'lru_textbook',
    name: '6. LRU Recency Replacement (Silberschatz)',
    category: 'REPLACEMENT',
    purpose: 'Demonstrates recency tracking and temporal locality exploitation in LRU.',
    expectedConcept: 'Least Recently Used Eviction & Temporal Locality Principle',
    interestingBehavior: 'Compare with FIFO on this same string: LRU avoids evicting actively used pages, lowering total page faults.',
    config: {
      pageSizeBytes: 4096,
      totalMemoryBytes: 16384,
      frameCount: 3,
      tlbSize: 4,
    },
    frameCount: 3,
    referenceString: Object.freeze([7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]),
    recommendedAlgorithm: 'LRU',
  },
  {
    id: 'belady_anomaly_demo',
    name: "7. Bélády's Anomaly Demonstration",
    category: 'ANOMALY',
    purpose: 'Proves mathematically that increasing physical frames can paradoxically increase FIFO page faults.',
    expectedConcept: "Bélády's Anomaly in First-In, First-Out (FIFO) Page Replacement",
    interestingBehavior: 'On reference string [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]: 3 frames produce 9 faults, while 4 frames produce 10 faults!',
    config: {
      pageSizeBytes: 4096,
      totalMemoryBytes: 16384,
      frameCount: 3,
      tlbSize: 4,
    },
    frameCount: 3,
    referenceString: Object.freeze([1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]),
    recommendedAlgorithm: 'FIFO',
  },
  {
    id: 'multi_algo_comparison',
    name: '8. Multi-Algorithm Replacement Benchmark',
    category: 'REPLACEMENT',
    purpose: 'Side-by-side benchmark comparing FIFO, LRU, and the theoretical Optimal algorithm.',
    expectedConcept: 'Theoretical Lower Bound on Page Faults (Optimal) vs Real Heuristics',
    interestingBehavior: 'Optimal replacement establishes the minimal fault count against which FIFO and LRU are evaluated.',
    config: {
      pageSizeBytes: 4096,
      totalMemoryBytes: 16384,
      frameCount: 4,
      tlbSize: 4,
    },
    frameCount: 4,
    referenceString: Object.freeze([1, 2, 3, 4, 2, 1, 5, 6, 2, 1, 2, 3, 7, 6, 3, 2, 1, 2, 3, 6]),
    recommendedAlgorithm: 'OPTIMAL',
  },
]);
