/**
 * OScope — Process Management & PCB Academic Knowledge Base
 */

import type { TheoryTopic } from './types';

export const PROCESS_THEORY_TOPICS: readonly TheoryTopic[] = Object.freeze([
  {
    id: 'process_vs_program',
    title: 'Process vs. Program',
    subsystem: 'PROCESS',
    shortDefinition:
      'A program is a passive entity of code stored on disk; a process is an active instance of a program in execution with an allocated address space and CPU context.',
    explanation:
      'Operating systems distinguish strictly between static executable files (stored as ELF or PE binaries in secondary storage) and executing processes residing in volatile memory. A process includes executable instructions (text section), current activity represented by the Program Counter and registers, process stack for temporary data (function parameters, return addresses, local variables), data section for global variables, and dynamically allocated heap memory.',
    keyPoints: [
      'Program: Passive file on disk containing machine instructions.',
      'Process: Dynamic entity with an execution state, memory allocation, and CPU registers.',
      'Multiple processes can execute the same underlying program binary independently (e.g., multiple text editor instances).',
    ],
    practicalExample:
      'The file `/usr/bin/gcc` on disk is a program. When a student executes `gcc main.c` in the terminal, the OS creates a process with PID 1042 containing its own registers, stack, and heap.',
    commonMisconception:
      'A program and a process are the same thing. In reality, a single program can instantiate multiple concurrently executing processes with isolated memory spaces.',
    theoryVsImplementation: {
      generalTheory:
        'A process has virtual address space divided into text, data, bss, heap, and stack segments managed by kernel page tables.',
      oscopeImplementation:
        'OScope models processes using strongly-typed `ProcessControlBlock` structures with virtual register states, memory boundaries, burst schedules, and priority metadata.',
    },
    relatedTopics: ['pcb_structure', 'process_lifecycle'],
    labRoute: '/process',
  },
  {
    id: 'pcb_structure',
    title: 'Process Control Block (PCB)',
    subsystem: 'PROCESS',
    shortDefinition:
      'The core kernel data structure holding all operational metadata, hardware registers, memory bounds, and scheduling state for an individual process.',
    explanation:
      'When an Operating System creates a process, it allocates a dedicated Process Control Block (also termed Task Struct in Linux). The PCB serves as the repository for all information that varies between processes and allows the kernel to suspend a running process and later resume it exactly where it left off. Without a PCB, preemptive multitasking and context switching are physically impossible.',
    keyPoints: [
      'Identifier: Unique Process ID (PID) and parent PID (PPID).',
      'Process State: Current state (NEW, READY, RUNNING, WAITING, TERMINATED).',
      'CPU Registers: Program Counter (PC), Accumulator (AC), Stack Pointer (SP), Base/Limit registers.',
      'CPU Scheduling Info: Priority rank, quantum allocation, scheduling queue pointers.',
      'Memory Management: Page table base registers, segment tables, and allocated bounds.',
      'Accounting & I/O: Elapsed CPU time, cumulative waiting time, open file descriptor tables.',
    ],
    practicalExample:
      'During a timer interrupt, the kernel saves the hardware CPU register values directly into Process P1’s PCB in RAM, loads Process P2’s PCB register values into the hardware CPU, and updates the Program Counter to P2’s next instruction.',
    commonMisconception:
      'The PCB executes instructions. In fact, the PCB is pure passive kernel memory read and written by the scheduler and interrupt dispatcher; the CPU hardware executes user instructions.',
    theoryVsImplementation: {
      generalTheory:
        'Production OS kernels store architecture-specific registers (x86-64 `%rip`, `%rsp`, `%rax`, CR3 page table pointer) in deep kernel struct hierarchies.',
      oscopeImplementation:
        'OScope models registers (`programCounter`, `accumulator`, `baseRegister`, `limitRegister`) and memory limits inside an immutable TypeScript `ProcessControlBlock` object.',
    },
    relatedTopics: ['context_switch', 'process_states'],
    labRoute: '/process',
  },
  {
    id: 'process_states',
    title: 'The Five-State Process Lifecycle',
    subsystem: 'PROCESS',
    shortDefinition:
      'The canonical textbook finite-state machine representing the lifecycle stages of an OS process: NEW, READY, RUNNING, WAITING, and TERMINATED.',
    explanation:
      'As a process executes, it transitions between mutually exclusive discrete states governed by OS scheduling events, interrupts, and I/O requests. At any given moment, on a single-core CPU, at most one process can be in the RUNNING state, while multiple processes can concurrently reside in READY or WAITING queues.',
    keyPoints: [
      'NEW: The process is being created and its PCB is being initialized; not yet admitted to the ready pool.',
      'READY: The process is loaded in main memory and waiting to be assigned to a CPU core by the short-term scheduler.',
      'RUNNING: Instructions are actively being fetched, decoded, and executed on the CPU core.',
      'WAITING (BLOCKED): The process cannot execute until an external event or I/O operation completes (e.g., disk read, network packet, mutex lock).',
      'TERMINATED: The process has finished execution or encountered an unhandled exception; PCB is retained temporarily for parent exit status inspection (zombie cleanup).',
    ],
    practicalExample:
      'Process P1 is RUNNING on the CPU. It issues a system call `read(diskFd, buffer, 1024)`. P1 immediately transitions from RUNNING to WAITING on the DISK queue. The scheduler dispatches P2 from the READY queue to the RUNNING state.',
    commonMisconception:
      'A process in the READY state is executing code. In reality, a READY process is completely halted in memory, awaiting dispatcher CPU assignment.',
    theoryVsImplementation: {
      generalTheory:
        'Some real operating systems split states further (e.g. READY-SUSPENDED and BLOCKED-SUSPENDED when swapped to secondary storage swap space).',
      oscopeImplementation:
        'OScope visualizes the classic 5-state machine (Silberschatz / Galvin standard) with animated state transitions and live queue occupancy counters.',
    },
    relatedTopics: ['state_transitions', 'pcb_structure'],
    labRoute: '/process',
  },
  {
    id: 'state_transitions',
    title: 'Process State Transitions & Invariants',
    subsystem: 'PROCESS',
    shortDefinition:
      'Deterministic transition rules governing valid movements between process states and enforcing fundamental operating system invariants.',
    explanation:
      'Transitions between process states are strictly constrained by OS kernel invariants. A process cannot arbitrarily transition between any two states. For example, a process in WAITING cannot directly transition to RUNNING; it must first enter the READY queue and await scheduler selection. Likewise, a NEW process cannot jump directly to RUNNING without admission.',
    keyPoints: [
      'Admit: NEW → READY (Long-term scheduler approves process entry into memory).',
      'Dispatch: READY → RUNNING (Short-term scheduler assigns CPU to head of ready queue).',
      'Timer Interrupt / Preempt: RUNNING → READY (Time slice expired or higher-priority job arrived).',
      'I/O or Event Wait: RUNNING → WAITING (Process requests synchronous resource or waits for signal).',
      'I/O Completion: WAITING → READY (Hardware interrupt signals event finished; process moves to ready queue, NOT directly to CPU).',
      'Exit: RUNNING → TERMINATED (Process calls exit() or completes main routine).',
    ],
    practicalExample:
      'When a keyboard key is pressed, the interrupt service routine handles the hardware signal and moves the waiting text editor process to the READY queue. The text editor will only run when the scheduler next selects it.',
    commonMisconception:
      'When an I/O device finishes, the waiting process immediately preempts the CPU. In reality, the device interrupt only moves the process to READY; CPU dispatch remains the scheduler’s decision.',
    theoryVsImplementation: {
      generalTheory:
        'Invalid state transitions trigger kernel panics or invalid opcode traps in production operating systems.',
      oscopeImplementation:
        'OScope validates all transition triggers in `canTransition()` and displays informative rejection reasons if an invalid transition is attempted.',
    },
    relatedTopics: ['process_states', 'context_switch'],
    labRoute: '/process',
  },
  {
    id: 'context_switch',
    title: 'Context Switching & Dispatcher Overhead',
    subsystem: 'PROCESS',
    shortDefinition:
      'The mechanism of saving the CPU context of a running process and restoring the saved context of another process so execution can seamlessly resume.',
    explanation:
      'Switching the CPU to another process requires performing a state save of the current process into its PCB and a state restore of the new process from its PCB. Context-switch time represents pure computational overhead: during a context switch, the CPU performs no productive user execution. Minimizing context switch frequency while preserving responsiveness is a core dilemma in scheduler design.',
    keyPoints: [
      'State Save: Hardware registers, flags, program counter, and stack pointer written to old PCB.',
      'State Restore: Register values, page directory base, and stack pointer loaded from new PCB.',
      'Overhead Cost: Memory bus traffic, cache invalidation, and TLB flushes.',
      'Frequency Trade-off: Frequent context switches improve interactivity at the cost of reduced overall CPU throughput.',
    ],
    practicalExample:
      'In a Round Robin scheduler with a 2ms quantum, a 0.2ms context switch overhead consumes 10% of total CPU time purely swapping register state.',
    commonMisconception:
      'Context switching accomplishes process work. In fact, context switching is pure OS overhead that decreases effective CPU utilization.',
    theoryVsImplementation: {
      generalTheory:
        'Hardware context switches take a few microseconds and frequently cause indirect costs via CPU cache pollution (L1/L2 cold cache misses).',
      oscopeImplementation:
        'OScope explicitly parameters and accounts for context switch duration (`contextSwitchCost`) in CPU scheduling timelines and metrics calculations.',
    },
    relatedTopics: ['pcb_structure', 'scheduling_metrics'],
    labRoute: '/scheduling',
  },
]);
