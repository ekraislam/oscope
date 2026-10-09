/**
 * OScope — Searchable Academic Glossary of Operating System Concepts
 * 40+ canonical terms indexed across process management, scheduling, memory,
 * deadlocks, storage, and architecture.
 */

import type { GlossaryTerm } from './types';

export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  {
    term: 'Algorithm',
    category: 'GENERAL',
    shortDefinition:
      'A finite, well-defined sequence of computational steps or rules designed to solve a specific class of problems or accomplish a decision task.',
    inDepthExplanation:
      'In operating systems, algorithms govern core policies such as process scheduling, cache replacement, deadlock avoidance, and disk block placement. Algorithms are evaluated on time complexity, space complexity, starvation resistance, fairness, and implementation overhead.',
    relatedConcepts: ['SJF', 'SRTF', 'FIFO', 'LRU', "Banker's Algorithm"],
    labRoute: '/scheduling'
  },
  {
    term: 'Arrival Time (AT)',
    category: 'SCHEDULING',
    shortDefinition:
      'The point in time at which a newly created or unblocked process enters the Ready Queue, becoming eligible for CPU dispatch.',
    inDepthExplanation:
      'Arrival time establishes the timeline boundary for scheduling decisions. A process cannot be selected by the scheduler before its arrival time, regardless of how short its burst time is or how high its priority.',
    relatedConcepts: ['Ready Queue', 'Burst Time', 'Turnaround Time'],
    labRoute: '/scheduling'
  },
  {
    term: "Banker's Algorithm",
    category: 'DEADLOCK',
    shortDefinition:
      'A classic deadlock avoidance algorithm developed by Edsger Dijkstra that tests whether granting a resource request preserves a Safe State.',
    inDepthExplanation:
      "Banker's Algorithm simulates worst-case resource claiming using Available, Max, Allocation, and Need matrices. It ensures the OS never grants an allocation that could prevent at least one process sequence from finishing without deadlock.",
    relatedConcepts: ['Safe State', 'Unsafe State', 'Need Matrix', 'Resource Allocation Graph'],
    labRoute: '/deadlock'
  },
  {
    term: "Bélády's Anomaly",
    category: 'MEMORY',
    shortDefinition:
      'The counter-intuitive phenomenon where increasing the number of physical page frames results in an increased number of page faults under certain page replacement algorithms (such as FIFO).',
    inDepthExplanation:
      "Discovered by László Bélády in 1969. It occurs in algorithms that do not satisfy the Stack Property. Stack algorithms (like LRU and Optimal) guarantee that pages resident with n frames are a subset of pages resident with n+1 frames, completely preventing this anomaly.",
    relatedConcepts: ['FIFO', 'LRU', 'Page Fault', 'Stack Algorithm'],
    labRoute: '/memory'
  },
  {
    term: 'Block (Disk Block)',
    category: 'FILESYSTEM',
    shortDefinition:
      'The smallest contiguous unit of data storage allocated or read by an operating system file system on secondary storage.',
    inDepthExplanation:
      'Commonly sized as 512 bytes, 1 KiB, 2 KiB, or 4 KiB. File systems allocate storage in whole block multiples, which can cause internal fragmentation in the last allocated block of a file.',
    relatedConcepts: ['Inode', 'Internal Fragmentation', 'Contiguous Allocation', 'Indexed Allocation'],
    labRoute: '/filesystem'
  },
  {
    term: 'Context Switch',
    category: 'PROCESS',
    shortDefinition:
      'The computational procedure of saving the execution state of a currently running process and restoring the saved state of another process to resume execution.',
    inDepthExplanation:
      'Context switching represents pure OS overhead because no user work is accomplished while saving and loading CPU register files, program counters, stack pointers, and memory management page table bases.',
    relatedConcepts: ['PCB', 'Ready Queue', 'Preemption'],
    labRoute: '/process'
  },
  {
    term: 'CPU Burst',
    category: 'SCHEDULING',
    shortDefinition:
      'A continuous period of time during which a process actively executes computational instructions on the CPU without blocking for I/O.',
    inDepthExplanation:
      'Process execution consists of an alternating cycle of CPU bursts and I/O bursts. Scheduling algorithms target CPU bursts to optimize metrics such as throughput, turnaround, and waiting time.',
    relatedConcepts: ['Burst Time', 'Arrival Time', 'SJF', 'SRTF'],
    labRoute: '/scheduling'
  },
  {
    term: 'Deadlock',
    category: 'DEADLOCK',
    shortDefinition:
      'A situation where two or more processes are permanently blocked because each holds resources and waits for resources held by another process in the group.',
    inDepthExplanation:
      'Deadlock requires all four Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait). No process in the deadlocked set can make forward progress or release its held resources.',
    relatedConcepts: ['Coffman Conditions', 'Safe State', 'Banker\'s Algorithm', 'RAG'],
    labRoute: '/deadlock'
  },
  {
    term: 'Directory',
    category: 'FILESYSTEM',
    shortDefinition:
      'An organizational file system structure that maps user-friendly hierarchical path names to internal file identifiers (such as Inode numbers).',
    inDepthExplanation:
      'A directory entry typically stores only the filename and its corresponding inode pointer, keeping directory scanning fast and separating naming from metadata and disk block storage.',
    relatedConcepts: ['Inode', 'File Metadata', 'Indexed Allocation'],
    labRoute: '/filesystem'
  },
  {
    term: 'External Fragmentation',
    category: 'FILESYSTEM',
    shortDefinition:
      'A storage or memory condition where total free space is sufficient to satisfy a request, but the free space is fragmented into scattered, non-contiguous blocks.',
    inDepthExplanation:
      'In file systems, external fragmentation prevents contiguous allocations from succeeding even when total free disk space is ample. It is solved by using non-contiguous allocation methods (linked, indexed) or defragmentation.',
    relatedConcepts: ['Internal Fragmentation', 'Contiguous Allocation', 'Indexed Allocation'],
    labRoute: '/filesystem'
  },
  {
    term: 'FIFO (First-In, First-Out)',
    category: 'GENERAL',
    shortDefinition:
      'A queue-based discipline where the element that arrived earliest is served or replaced first.',
    inDepthExplanation:
      'Used in CPU scheduling (as FCFS) and page replacement (FIFO replacement). In page replacement, FIFO can exhibit Bélády\'s anomaly because it does not obey the stack inclusion property.',
    relatedConcepts: ['Bélády\'s Anomaly', 'FCFS', 'LRU'],
    labRoute: '/memory'
  },
  {
    term: 'Frame (Page Frame)',
    category: 'MEMORY',
    shortDefinition:
      'A fixed-size physical memory block in physical RAM with a size identical to that of a virtual page.',
    inDepthExplanation:
      'Physical RAM is divided into frames. Virtual pages are mapped to physical frames via the Page Table. Because frames are identical in size to pages, physical memory allocation suffers no external fragmentation.',
    relatedConcepts: ['Page', 'Page Table', 'Virtual Memory', 'Address Translation'],
    labRoute: '/memory'
  },
  {
    term: 'Gantt Chart',
    category: 'SCHEDULING',
    shortDefinition:
      'A horizontal bar chart visualizing the sequential allocation of the CPU to different processes across a continuous simulation timeline.',
    inDepthExplanation:
      'Displays which process was executing at each virtual time tick, highlighting preemption points, context switches, and CPU idle intervals. Essential for verifying scheduling algorithms.',
    relatedConcepts: ['Turnaround Time', 'Waiting Time', 'CPU Utilization'],
    labRoute: '/scheduling'
  },
  {
    term: 'Hold and Wait',
    category: 'DEADLOCK',
    shortDefinition:
      'A necessary condition for deadlock where a process holds at least one resource while waiting to acquire additional resources held by other processes.',
    inDepthExplanation:
      'One of the four Coffman conditions. It can be prevented by requiring processes to request all required resources simultaneously upfront, or by forcing a process to release all held resources before making a new request.',
    relatedConcepts: ['Coffman Conditions', 'Mutual Exclusion', 'Circular Wait'],
    labRoute: '/deadlock'
  },
  {
    term: 'Inode (Index Node)',
    category: 'FILESYSTEM',
    shortDefinition:
      'A fundamental on-disk data structure in Unix-style file systems that stores all metadata and block addresses for a file, excluding its directory filename.',
    inDepthExplanation:
      'Stores file type, size, owner, permissions, timestamps, and direct/indirect block pointers. Decouples the file data and attributes from the directory entry that names it.',
    relatedConcepts: ['Directory', 'Block', 'Indexed Allocation'],
    labRoute: '/filesystem'
  },
  {
    term: 'Internal Fragmentation',
    category: 'FILESYSTEM',
    shortDefinition:
      'Unused storage space residing inside an allocated block or page because the allocated block size exceeds the data size stored within it.',
    inDepthExplanation:
      'Arises because allocations occur in fixed-size blocks (e.g. 4096 bytes). If a file is 5000 bytes, it requires two 4096-byte blocks (8192 bytes), resulting in 3192 bytes of wasted internal fragmentation in the second block.',
    relatedConcepts: ['External Fragmentation', 'Block', 'Paging'],
    labRoute: '/filesystem'
  },
  {
    term: 'LRU (Least Recently Used)',
    category: 'MEMORY',
    shortDefinition:
      'A page replacement policy that replaces the page that has not been referenced for the longest period of time.',
    inDepthExplanation:
      'Exploits the principle of temporal locality: pages accessed recently are likely to be accessed again soon. LRU is a provably sound stack algorithm that never exhibits Bélády\'s anomaly.',
    relatedConcepts: ['FIFO', 'Optimal Replacement', 'Bélády\'s Anomaly'],
    labRoute: '/memory'
  },
  {
    term: 'Mutual Exclusion',
    category: 'DEADLOCK',
    shortDefinition:
      'A concurrency property and Coffman condition stating that only one process at a time can access or hold a non-shareable resource.',
    inDepthExplanation:
      'If another process requests a non-shareable resource currently held by a process, the requesting process must wait until the resource is released.',
    relatedConcepts: ['Coffman Conditions', 'Hold and Wait', 'Deadlock'],
    labRoute: '/deadlock'
  },
  {
    term: 'No Preemption',
    category: 'DEADLOCK',
    shortDefinition:
      'A Coffman condition where resources held by a process cannot be forcibly taken away; they can only be released voluntarily by the holding process.',
    inDepthExplanation:
      'If preemption were allowed, the OS could break deadlocks by forcibly revoking resources from blocked processes and reassigning them.',
    relatedConcepts: ['Coffman Conditions', 'Deadlock Prevention'],
    labRoute: '/deadlock'
  },
  {
    term: 'Optimal Page Replacement',
    category: 'MEMORY',
    shortDefinition:
      'A theoretical page replacement benchmark algorithm that replaces the page that will not be referenced for the longest duration in the future.',
    inDepthExplanation:
      'Provably achieves the minimum possible number of page faults for any given reference string and frame count. It cannot be implemented in general-purpose operating systems because future memory accesses cannot be predicted with certainty.',
    relatedConcepts: ['LRU', 'FIFO', 'Page Fault'],
    labRoute: '/memory'
  },
  {
    term: 'Page',
    category: 'MEMORY',
    shortDefinition:
      'A fixed-length contiguous block of virtual memory described by a single Virtual Page Number (VPN).',
    inDepthExplanation:
      'The fundamental unit of virtual memory allocation and protection. In modern operating systems, pages are typically 4 KiB or 2 MiB (huge pages) in size.',
    relatedConcepts: ['Frame', 'Page Table', 'Virtual Memory', 'TLB'],
    labRoute: '/memory'
  },
  {
    term: 'Page Fault',
    category: 'MEMORY',
    shortDefinition:
      'A hardware trap raised by the MMU when a program accesses a virtual page that is marked invalid or not currently resident in physical RAM.',
    inDepthExplanation:
      'The OS responds by pausing the process, allocating a physical frame (evicting another page if necessary via page replacement), reading the missing page from disk, updating the page table, and restarting the instruction.',
    relatedConcepts: ['Page Table', 'TLB', 'FIFO', 'LRU'],
    labRoute: '/memory'
  },
  {
    term: 'Page Table',
    category: 'MEMORY',
    shortDefinition:
      'An in-memory data structure maintained by the operating system that maps each virtual page number (VPN) of a process to its assigned physical frame number (PFN).',
    inDepthExplanation:
      'Contains status bits for each page entry, including valid/present, modified/dirty, referenced/accessed, and read/write/execute permissions.',
    relatedConcepts: ['Page', 'Frame', 'TLB', 'Virtual Memory'],
    labRoute: '/memory'
  },
  {
    term: 'PCB (Process Control Block)',
    category: 'PROCESS',
    shortDefinition:
      'A kernel data structure containing all administrative and execution information needed to manage a specific process.',
    inDepthExplanation:
      'Typical fields include Process ID (PID), process state, program counter, CPU register set, memory management pointers, open file handles, priority, and accounting metrics.',
    relatedConcepts: ['Process', 'Context Switch', 'Process State'],
    labRoute: '/process'
  },
  {
    term: 'Priority',
    category: 'SCHEDULING',
    shortDefinition:
      'An integer rank or metric assigned to a process indicating its relative scheduling precedence over other eligible processes.',
    inDepthExplanation:
      'The scheduler selects the eligible process with the highest priority (conventionally the lowest numerical integer in Unix, or highest integer in some systems). Can cause starvation of low-priority processes unless mitigated by aging.',
    relatedConcepts: ['Starvation', 'SJF', 'Preemption'],
    labRoute: '/scheduling'
  },
  {
    term: 'Process',
    category: 'PROCESS',
    shortDefinition:
      'A program in execution, representing the fundamental unit of work and resource allocation in an operating system.',
    inDepthExplanation:
      'A passive program on disk becomes an active process when loaded into memory with an allocated address space, stack, heap, data segment, program counter, and PCB.',
    relatedConcepts: ['PCB', 'Context Switch', 'Process State'],
    labRoute: '/process'
  },
  {
    term: 'Resource Allocation Graph (RAG)',
    category: 'DEADLOCK',
    shortDefinition:
      'A directed bipartite graph modeling processes, resources, assignment edges, and request edges to evaluate deadlock conditions.',
    inDepthExplanation:
      'Nodes represent processes and resources. In single-instance resource systems, a directed cycle is necessary and sufficient for deadlock. In multi-instance systems, a cycle is necessary but not sufficient.',
    relatedConcepts: ['Deadlock', 'Coffman Conditions', "Banker's Algorithm"],
    labRoute: '/deadlock'
  },
  {
    term: 'Ready Queue',
    category: 'PROCESS',
    shortDefinition:
      'A queue or priority data structure of processes that reside in main memory and are ready and eligible to execute on a CPU.',
    inDepthExplanation:
      'Processes in the Ready Queue are waiting only for the CPU scheduler to allocate them a CPU time slice; they are not waiting for I/O or external events.',
    relatedConcepts: ['Process State', 'Context Switch', 'Arrival Time'],
    labRoute: '/process'
  },
  {
    term: 'Response Time (RT)',
    category: 'SCHEDULING',
    shortDefinition:
      'The time duration from when a process first arrives in the system until the exact moment it receives its first CPU time slice.',
    inDepthExplanation:
      'Formula: RT = FirstStartTime - ArrivalTime. Crucial for interactive systems where users expect rapid feedback when launching an action.',
    relatedConcepts: ['Turnaround Time', 'Waiting Time', 'Round Robin'],
    labRoute: '/scheduling'
  },
  {
    term: 'Round Robin (RR)',
    category: 'SCHEDULING',
    shortDefinition:
      'A preemptive CPU scheduling algorithm where each ready process is allocated a fixed time quantum in a circular FIFO order.',
    inDepthExplanation:
      'If a process does not complete within its assigned time quantum, it is preempted and moved to the back of the Ready Queue. Designed specifically for time-sharing interactive systems.',
    relatedConcepts: ['Preemption', 'Context Switch', 'Response Time'],
    labRoute: '/scheduling'
  },
  {
    term: 'Safe State',
    category: 'DEADLOCK',
    shortDefinition:
      'A system resource state from which there exists at least one order (a Safe Sequence) in which all processes can complete without deadlocking.',
    inDepthExplanation:
      'A system in a safe state can guarantee that all processes will eventually finish, even if every process suddenly requests its declared maximum claim.',
    relatedConcepts: ['Unsafe State', "Banker's Algorithm", 'Deadlock'],
    labRoute: '/deadlock'
  },
  {
    term: 'Shortest Job First (SJF)',
    category: 'SCHEDULING',
    shortDefinition:
      'A non-preemptive scheduling policy that selects the ready process with the smallest anticipated CPU burst time.',
    inDepthExplanation:
      'Provably minimizes average waiting time for a set of processes arriving simultaneously. Requires knowing or estimating future burst lengths, and can starve long-burst processes.',
    relatedConcepts: ['SRTF', 'Waiting Time', 'Starvation'],
    labRoute: '/scheduling'
  },
  {
    term: 'Shortest Remaining Time First (SRTF)',
    category: 'SCHEDULING',
    shortDefinition:
      'The preemptive counterpart of SJF that always allocates the CPU to the eligible process with the shortest remaining burst time.',
    inDepthExplanation:
      'If a new process arrives with a remaining burst shorter than the currently running process, the running process is preempted and returned to the ready queue.',
    relatedConcepts: ['SJF', 'Preemption', 'Waiting Time'],
    labRoute: '/scheduling'
  },
  {
    term: 'Starvation',
    category: 'SCHEDULING',
    shortDefinition:
      'A condition where an eligible process is indefinitely delayed from receiving a required resource or CPU time due to higher-priority processes continually being favored.',
    inDepthExplanation:
      'Can occur in SJF, SRTF, and Priority scheduling when small or high-priority jobs continually arrive. Mitigated in real operating systems by Aging (gradually increasing process priority over time).',
    relatedConcepts: ['Priority', 'SJF', 'SRTF'],
    labRoute: '/scheduling'
  },
  {
    term: 'TLB (Translation Lookaside Buffer)',
    category: 'MEMORY',
    shortDefinition:
      'A high-speed associative hardware cache inside the CPU MMU storing recent Virtual Page Number to Physical Frame Number translations.',
    inDepthExplanation:
      'Drastically speeds up address translation by avoiding extra memory accesses to the page table in RAM. A TLB miss is NOT a page fault; it merely means the mapping must be fetched from the page table in RAM.',
    relatedConcepts: ['Page Table', 'Page Fault', 'Virtual Memory'],
    labRoute: '/memory'
  },
  {
    term: 'Throughput',
    category: 'SCHEDULING',
    shortDefinition:
      'The number of completed processes or tasks executed by the operating system per unit of time.',
    inDepthExplanation:
      'Formula: Throughput = Completed Processes / Total Elapsed Time. A core performance metric for evaluating batch and server workloads.',
    relatedConcepts: ['Turnaround Time', 'CPU Utilization'],
    labRoute: '/scheduling'
  },
  {
    term: 'Turnaround Time (TAT)',
    category: 'SCHEDULING',
    shortDefinition:
      'The total elapsed time from when a process is submitted to the system until it finishes execution completely.',
    inDepthExplanation:
      'Formula: TAT = CompletionTime - ArrivalTime. Represents the entire lifecycle duration from the perspective of the process.',
    relatedConcepts: ['Waiting Time', 'Response Time', 'Completion Time'],
    labRoute: '/scheduling'
  },
  {
    term: 'Unsafe State',
    category: 'DEADLOCK',
    shortDefinition:
      'A system resource state in which no safe execution sequence can be guaranteed to satisfy all processes up to their maximum claims.',
    inDepthExplanation:
      'CRITICAL DISTINCTION: An unsafe state is NOT necessarily deadlocked. It simply means that if processes exercise their peak demands simultaneously, the OS cannot prevent deadlock.',
    relatedConcepts: ['Safe State', 'Deadlock', "Banker's Algorithm"],
    labRoute: '/deadlock'
  },
  {
    term: 'Virtual Address',
    category: 'MEMORY',
    shortDefinition:
      'A memory address generated by the CPU during instruction execution, referencing a location in the process\'s private logical address space.',
    inDepthExplanation:
      'Must be translated by the hardware MMU (using TLB and Page Table) into a physical address before accessing physical RAM chips.',
    relatedConcepts: ['Virtual Memory', 'Page', 'Frame', 'Page Table'],
    labRoute: '/memory'
  },
  {
    term: 'Virtual Memory',
    category: 'MEMORY',
    shortDefinition:
      'An operating system memory management abstraction that provides processes with large, uniform, contiguous logical address spaces decoupled from physical RAM limits.',
    inDepthExplanation:
      'Allows executing processes that exceed physical memory capacity via demand paging, enforces memory isolation between processes, and enables shared memory.',
    relatedConcepts: ['Paging', 'Page Fault', 'TLB', 'Page Table'],
    labRoute: '/memory'
  },
  {
    term: 'Waiting Time (WT)',
    category: 'SCHEDULING',
    shortDefinition:
      'The total accumulated time a process spent waiting inside the Ready Queue waiting to be allocated CPU time.',
    inDepthExplanation:
      'Formula: WT = TurnaroundTime - BurstTime. Isolates the delay caused strictly by scheduling competition.',
    relatedConcepts: ['Turnaround Time', 'Burst Time', 'Arrival Time'],
    labRoute: '/scheduling'
  }
];
