/**
 * OScope — Memory Management & Virtual Memory Theory
 * Academic knowledge base covering virtual memory, paging, address translation,
 * TLB caching, page faults, page replacement algorithms, and Bélády's anomaly.
 */

import type { TheoryTopic, AlgorithmGuide } from './types';

export const MEMORY_THEORY_TOPICS: readonly TheoryTopic[] = [
  {
    id: 'mem-virtual-memory',
    title: 'Virtual Memory & Logical Address Spaces',
    subsystem: 'MEMORY',
    shortDefinition:
      'A memory management technique that provides an idealized abstraction of the storage resources available to a process, separating logical memory from physical memory.',
    explanation:
      'Virtual memory allows an operating system to execute processes whose memory requirements exceed available physical RAM. Each process operates within its own contiguous, uniform virtual address space, while the underlying physical memory (frames) may be non-contiguous, shared, or paged out to secondary backing store. Virtual memory provides hardware-enforced protection between processes, simplifies compilation and linking, and enables efficient inter-process memory sharing (such as shared libraries).',
    keyPoints: [
      'Separates programmer-perceived logical address space from machine physical address space.',
      'Enables execution of processes partially loaded in physical RAM.',
      'Provides hardware-enforced memory isolation and protection between processes.',
      'Facilitates shared memory pages and copy-on-write mechanisms.'
    ],
    practicalExample:
      'A 32-bit architecture provides a 4 GiB virtual address space per process (addresses 0x00000000 to 0xFFFFFFFF), even on an embedded machine containing only 512 MiB of physical RAM.',
    commonMisconception:
      'Virtual memory is not merely disk swap space. Swap space is an auxiliary backing store; virtual memory is the overall abstraction mapping logical addresses to physical frames and backing storage.',
    theoryVsImplementation: {
      generalTheory:
        'Real operating systems utilize multi-level hierarchical or inverted page tables backed by disk swap partitions, MMU fault traps, and demand paging page caches.',
      oscopeImplementation:
        'OScope simulates a single-process virtual memory space with configurable virtual page count, physical frame pool, deterministic address translator, and visible frame resident status.'
    },
    relatedTopics: ['mem-paging', 'mem-address-translation', 'mem-page-fault'],
    labRoute: '/memory'
  },
  {
    id: 'mem-paging',
    title: 'Paging: Pages, Frames, and the Page Table',
    subsystem: 'MEMORY',
    shortDefinition:
      'A fixed-size memory allocation scheme where virtual memory is partitioned into pages and physical memory is partitioned into frames of identical size.',
    explanation:
      'Paging eliminates the need for contiguous allocation of physical memory, completely avoiding external fragmentation. Both pages (in logical memory) and frames (in physical memory) have identical power-of-two sizes (e.g., 4 KiB in OScope default). The operating system maintains an authoritative Page Table per process that stores the mapping from Virtual Page Number (VPN) to Physical Frame Number (PFN), along with control bits (valid/present, dirty/modified, reference/accessed, protection).',
    keyPoints: [
      'Page size equals frame size, commonly a power of two to facilitate bitmask address splitting.',
      'Eliminates external fragmentation because any free frame can be allocated to any page.',
      'Permits internal fragmentation only in the final page of an allocation.',
      'The Page Table is indexed by Virtual Page Number and stores the assigned Physical Frame Number and status bits.'
    ],
    practicalExample:
      'With a 4 KiB (4096-byte) page size, virtual address 10000 has page number floor(10000 / 4096) = 2 and offset 10000 mod 4096 = 1808. If the page table maps page 2 to frame 7, the physical address is 7 * 4096 + 1808 = 30480.',
    commonMisconception:
      'Paging does not suffer from external fragmentation, but it does incur internal fragmentation in the last allocated page (averaging half a page per process).',
    theoryVsImplementation: {
      generalTheory:
        'Modern 64-bit systems utilize 4-level or 5-level paging hierarchies (e.g., PML4/PML5 on x86-64) to prevent massive sparse page table overhead in RAM.',
      oscopeImplementation:
        'OScope models a flat educational page table with configurable frame count, displaying explicit validity flags and frame mappings in an interactive matrix.'
    },
    relatedTopics: ['mem-virtual-memory', 'mem-tlb-vs-page-table', 'mem-address-translation'],
    labRoute: '/memory'
  },
  {
    id: 'mem-address-translation',
    title: 'Virtual-to-Physical Address Translation Flow',
    subsystem: 'MEMORY',
    shortDefinition:
      'The deterministic multi-stage hardware and OS pipeline translating a logical address into a physical memory location.',
    explanation:
      'When the CPU references a virtual address, the hardware MMU decomposes the binary address into a high-order Virtual Page Number (VPN) and low-order Offset. The translation pipeline proceeds: (1) Check the TLB for the VPN. If present (TLB Hit), retrieve the PFN directly. (2) If absent (TLB Miss), inspect the process Page Table in memory. (3) If the valid bit is 1, retrieve the PFN, install the translation into the TLB, and form the physical address as (PFN * PageSize) + Offset. (4) If the valid bit is 0, generate a Page Fault interrupt.',
    keyPoints: [
      'Address splitting: Virtual Page Number = floor(VA / PageSize); Offset = VA mod PageSize.',
      'The Offset is invariant during translation; it passes unchanged directly from the virtual address to the physical address.',
      'Physical Address = (Frame Number * Frame Size) + Offset.',
      'The pipeline order is strictly: TLB Lookup -> (if miss) Page Table Lookup -> (if invalid) Page Fault Handler.'
    ],
    practicalExample:
      'In OScope, given Page Size = 4096 bytes: Virtual Address 4100 decomposes to VPN 1, Offset 4. If Page 1 maps to Frame 3, Physical Address = (3 * 4096) + 4 = 12292.',
    commonMisconception:
      'The offset does not change during address translation. Only the page number is replaced by the corresponding frame number.',
    theoryVsImplementation: {
      generalTheory:
        'Hardware Memory Management Units (MMUs) perform this lookup in nanoseconds using hardware table-walkers and associative TLB circuits.',
      oscopeImplementation:
        'OScope visually highlights each stage step-by-step: Bit decomposition, TLB associative probe, Page Table index, and physical arithmetic assembly.'
    },
    relatedTopics: ['mem-tlb-vs-page-table', 'mem-page-fault', 'mem-paging'],
    labRoute: '/memory'
  },
  {
    id: 'mem-tlb-vs-page-table',
    title: 'TLB vs. Page Table: Roles and Miss Semantics',
    subsystem: 'MEMORY',
    shortDefinition:
      'A critical distinction: the TLB is a high-speed hardware cache of recent translations, whereas the Page Table is the complete authoritative memory mapping.',
    explanation:
      'Because every virtual memory access could require an extra memory access just to read the page table, the CPU incorporates a Translation Lookaside Buffer (TLB)—a fast, fully associative hardware cache storing recent VPN-to-PFN mappings. A TLB Miss simply means the translation is not cached in the TLB; the page itself may be perfectly resident in physical RAM. Conversely, a Page Fault means the requested page is not resident in physical RAM at all.',
    keyPoints: [
      'TLB is a small (e.g., 32 to 512 entries), high-speed associative hardware cache.',
      'TLB Miss != Page Fault: A TLB miss is resolved by querying the Page Table in RAM.',
      'A Page Fault occurs ONLY when the Page Table entry has its valid/present bit cleared (0).',
      'Effective Memory Access Time (EMAT) depends heavily on TLB hit ratio: EMAT = HitRate * (TLB + Mem) + MissRate * (TLB + 2*Mem).'
    ],
    practicalExample:
      'If Page 3 is loaded in Frame 5, but was not recently referenced, a probe produces a TLB Miss followed by a Page Table Hit (no page fault!). The translation is loaded into the TLB and execution continues immediately.',
    commonMisconception:
      'MYTH: A TLB miss means a page fault has occurred. REALITY: TLB miss merely means the translation was not in cache; if the page table marks the page valid, it is in RAM and no page fault happens.',
    theoryVsImplementation: {
      generalTheory:
        'Modern CPUs have multi-level TLBs (L1 dTLB/iTLB, unified L2 TLB) with hardware refill units or software trap handlers (MIPS/SPARC).',
      oscopeImplementation:
        'OScope implements an interactive TLB with configurable entries (default 4) and deterministic LRU replacement, clearly displaying Hit vs Miss vs Page Fault status.'
    },
    relatedTopics: ['mem-address-translation', 'mem-page-fault'],
    labRoute: '/memory'
  },
  {
    id: 'mem-page-fault',
    title: 'The Page Fault Lifecycle',
    subsystem: 'MEMORY',
    shortDefinition:
      'A hardware trap raised by the MMU when a program accesses a virtual page that has no valid translation resident in physical RAM.',
    explanation:
      'When an accessed page table entry is marked invalid (present bit = 0), the MMU raises a page fault interrupt, transferring control to the OS kernel. The OS executes the page fault routine: (1) Verify internal tables to confirm if the reference is valid or an illegal address violation (segmentation fault). (2) Locate a free physical frame; if none is free, invoke a Page Replacement Algorithm (FIFO, LRU, Optimal) to select a victim frame. (3) If the victim page is dirty, flush it to backing disk. (4) Schedule a disk read to load the requested page into the selected frame. (5) Update the page table entry to valid (PFN assigned). (6) Restart the trapped instruction.',
    keyPoints: [
      'Page faults are normal operations of demand paging, not application crashes (unless accessing invalid unallocated memory).',
      'Handling a page fault requires disk I/O, which is orders of magnitude slower than RAM access (milliseconds vs nanoseconds).',
      'If physical frames are exhausted, the OS must evict a victim page using a page replacement policy.',
      'The trapped instruction must be precisely restartable by the CPU hardware.'
    ],
    practicalExample:
      'In OScope Memory Lab, accessing page 5 when only pages 0, 1, 2, 3 reside in frames triggers a Page Fault. Frame 0 is selected by FIFO, page 0 is evicted, and page 5 is loaded into Frame 0.',
    commonMisconception:
      'A page fault does not mean the program crashed. It is the fundamental mechanism that enables demand paging by loading pages only when they are first referenced.',
    theoryVsImplementation: {
      generalTheory:
        'Real kernels handle page faults via asynchronous interrupt handlers, dirty-page writeback daemons, and speculative readahead.',
      oscopeImplementation:
        'OScope steps through the exact academic sequence: access attempt -> invalid detection -> victim frame election -> table update -> post-fault resolution.'
    },
    relatedTopics: ['mem-tlb-vs-page-table', 'mem-belady-anomaly'],
    labRoute: '/memory'
  },
  {
    id: 'mem-belady-anomaly',
    title: "Bélády's Anomaly",
    subsystem: 'MEMORY',
    shortDefinition:
      "The counter-intuitive phenomenon where increasing the number of physical page frames results in an increased number of page faults under certain page replacement algorithms (such as FIFO).",
    explanation:
      "Discovered by László Bélády in 1969, this anomaly defies the intuitive expectation that allocating more memory frames should always reduce or maintain the number of page faults. Bélády's anomaly occurs in algorithms that do not satisfy the Stack Property (inclusion property). In a stack algorithm (such as LRU or Optimal), the set of pages in memory with n frames is guaranteed to be a strict subset of the pages that would be in memory with n+1 frames. FIFO is not a stack algorithm, allowing an additional frame to disrupt the eviction order and displace pages that are referenced soon after.",
    keyPoints: [
      'Discovered by László Bélády in 1969.',
      'Occurs in FIFO replacement because FIFO does not possess the stack inclusion property.',
      'Does NOT occur in LRU or Optimal replacement because both are provably stack algorithms.',
      'Demonstrates that heuristic memory policies can exhibit non-monotonic behavior under specific reference patterns.'
    ],
    practicalExample:
      'Canonical Reference String: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]. With 3 frames, FIFO produces exactly 9 page faults. With 4 frames, FIFO produces exactly 10 page faults!',
    commonMisconception:
      'MYTH: More memory always causes more faults. REALITY: More memory usually reduces page faults; Bélády anomaly is a specific phenomenon where certain non-stack algorithms (like FIFO) produce more faults for specific reference patterns.',
    theoryVsImplementation: {
      generalTheory:
        'Proved mathematically by Mattson et al. (1970) using stack algorithms where M(n) ⊆ M(n+1) for all t.',
      oscopeImplementation:
        'OScope includes a one-click Bélády Anomaly demo preset in the Memory Lab that runs both 3-frame and 4-frame FIFO simulations side-by-side with verified 9 vs 10 fault outputs.'
    },
    relatedTopics: ['mem-page-fault', 'mem-paging'],
    labRoute: '/memory'
  }
];

export const PAGE_REPLACEMENT_ALGORITHMS: readonly AlgorithmGuide[] = [
  {
    id: 'pr-fifo',
    name: 'First-In, First-Out (FIFO) Page Replacement',
    subsystem: 'MEMORY',
    preemptive: true,
    definition:
      'A page replacement policy that associates each page with the time it was brought into physical memory and always evicts the oldest resident page.',
    mechanism:
      'Maintains a FIFO queue of resident frames. When a page fault occurs and all frames are occupied, the frame at the head of the queue is chosen as the victim, and the incoming page is enqueued at the tail.',
    selectionRule:
      'Victim = argmin_{p in Resident}(ArrivalTime(p)) — evict the page resident for the longest total duration.',
    advantages: [
      'Extremely simple to implement with minimal hardware support (a basic circular queue or timestamp).',
      'Negligible per-memory-access bookkeeping overhead (no update required on page hits).'
    ],
    disadvantages: [
      "Can evict frequently and heavily used pages simply because they were loaded early during initialization.",
      "Susceptible to Bélády's anomaly where increasing frame allocation can increase total page faults.",
      'Generally yields inferior hit ratios compared to access-aware heuristics like LRU.'
    ],
    complexityNote:
      'O(1) queue maintenance on page fault; O(0) overhead on hit (no data structure update needed).',
    starvationNote:
      'Not applicable in the CPU sense; however, long-lived essential shared pages can be repeatedly evicted and immediately re-faulted (thrashing).',
    bestSuitedWorkload:
      'Strictly sequential data streaming or one-pass linear memory access where past reference history provides zero predictive value for future access.',
    commonMisconceptions: [
      'Believing that FIFO is a stack algorithm. FIFO violates the inclusion property.',
      'Assuming FIFO considers how often or how recently a page was read. FIFO only tracks when the page arrived.'
    ],
    labRoute: '/memory'
  },
  {
    id: 'pr-lru',
    name: 'Least Recently Used (LRU) Page Replacement',
    subsystem: 'MEMORY',
    preemptive: true,
    definition:
      'A page replacement algorithm that replaces the page that has not been referenced for the longest period of time, using recent past history as an approximation of the near future.',
    mechanism:
      'Tracks the timestamp or relative recency order of every reference to resident pages. When a page fault occurs and frames are full, the page with the oldest last-access timestamp is evicted.',
    selectionRule:
      'Victim = argmin_{p in Resident}(LastAccessTime(p)) — evict the page whose most recent reference is furthest in the past.',
    advantages: [
      "Does NOT suffer from Bélády's anomaly; mathematically proven to be a stack algorithm.",
      'Approximates the Optimal algorithm effectively by exploiting temporal locality of reference.',
      'Consistently yields higher hit rates than FIFO on typical program memory access distributions.'
    ],
    disadvantages: [
      'Expensive to implement in pure hardware: requires updating counters or doubly-linked list nodes on every single memory access.',
      'Pure LRU hardware is rarely implemented in modern MMUs; systems use approximations like Clock (Second-Chance).'
    ],
    complexityNote:
      'Pure LRU: O(1) list update per memory reference with hardware support, or O(N) software search without hardware timestamp support.',
    starvationNote:
      'A page accessed in a periodic loop larger than available frame capacity will be repeatedly evicted just before each subsequent reuse (cyclic thrashing).',
    bestSuitedWorkload:
      'General-purpose workloads demonstrating strong temporal locality (functions, stack frames, working sets referenced repeatedly within short time windows).',
    commonMisconceptions: [
      'Confusing LRU with LFU (Least Frequently Used). LRU tracks time since last reference; LFU tracks total reference counts.',
      'Assuming modern commodity CPUs implement pure LRU for all main memory pages. Most use Clock or pseudo-LRU variants due to hardware overhead.'
    ],
    labRoute: '/memory'
  },
  {
    id: 'pr-optimal',
    name: 'Optimal Page Replacement (OPT / MIN / Bélády)',
    subsystem: 'MEMORY',
    preemptive: true,
    definition:
      'A theoretical benchmark algorithm that replaces the page that will not be used for the longest period of time in the future.',
    mechanism:
      'Scans the remaining future reference string from the current time step forward. For each currently resident page, determines the time until its next reference. Evicts the page whose next reference occurs furthest in the future (or never).',
    selectionRule:
      'Victim = argmax_{p in Resident}(NextReferenceTime(p)) — evict the page with the maximum distance to its next future reference.',
    advantages: [
      'Provably guarantees the lowest possible number of page faults for any fixed number of frames on a given reference string.',
      "Belongs to the class of stack algorithms; provably immune to Bélády's anomaly.",
      'Serves as the golden baseline standard for measuring the empirical efficiency of realizable replacement policies.'
    ],
    disadvantages: [
      'Physically impossible to implement in a real general-purpose OS because the kernel cannot predict future memory accesses of arbitrary user programs.',
      'Useful strictly as an offline post-hoc analysis tool or in deterministic static embedded systems with fixed trace logs.'
    ],
    complexityNote:
      'O(F * S) offline search per fault, where F is frame count and S is the length of the remaining future reference stream.',
    starvationNote:
      'A page never referenced again is evicted immediately on the next fault, which is optimal behavior.',
    bestSuitedWorkload:
      'Offline trace evaluation and academic benchmark comparisons to establish the theoretical minimum fault ceiling.',
    commonMisconceptions: [
      'Believing Optimal can be deployed in a real-time OS. It requires prescient oracle knowledge of future program code paths.',
      'Assuming Optimal always produces zero page faults. Initial compulsory (cold-start) faults are unavoidable.'
    ],
    labRoute: '/memory'
  }
];
