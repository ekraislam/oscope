/**
 * OScope — Deadlock & Resource Allocation Theory
 * Academic knowledge base covering deadlock fundamentals, the four Coffman conditions,
 * Safe vs. Unsafe vs. Deadlocked distinctions, Banker's Algorithm, Resource Request checks,
 * and Resource Allocation Graphs (RAG / WFG).
 */

import type { TheoryTopic, AlgorithmGuide } from './types';

export const DEADLOCK_THEORY_TOPICS: readonly TheoryTopic[] = [
  {
    id: 'deadlock-definition',
    title: 'The Deadlock Problem & System Resource Model',
    subsystem: 'DEADLOCK',
    shortDefinition:
      'A condition in concurrent computing where a set of processes are permanently blocked because each process holds resources and waits for resources held by others in the set.',
    explanation:
      'In a multiprogramming operating system, processes compete for a finite collection of non-shareable resources (e.g., mutexes, tape drives, memory regions, printer locks). Under the standard resource allocation model, a process utilizes a resource in three steps: (1) Request, (2) Use, and (3) Release. A deadlock arises when every process in a set is waiting for an event (the release of an allocated resource) that can only be caused by another blocked process in the same set. None of the processes can run, allocate, or terminate, resulting in permanent starvation and frozen execution.',
    keyPoints: [
      'Deadlock involves a set of processes, each blocked waiting for an event caused only by another process in that set.',
      'Resources can be single-instance (only 1 unit exists in the system) or multi-instance (multiple identical units).',
      'The standard OS approaches to deadlock are: Prevention (structure rules to make deadlock impossible), Avoidance (dynamically steer away from unsafe states), Detection & Recovery (permit deadlocks, periodically detect them, and preempt/kill), or Ignorance (the Ostrich algorithm used by general-purpose OS kernels).',
      'Deadlock differs from livelock: in deadlock processes are permanently blocked in WAITING state; in livelock processes actively change state but make zero forward progress.'
    ],
    practicalExample:
      'Classic Two-Process Mutex Deadlock: Process P1 holds Resource R1 and requests R2; simultaneously, Process P2 holds Resource R2 and requests R1. Neither can proceed.',
    commonMisconception:
      'A slow or busy process is not deadlocked. A process is only deadlocked if its waiting condition cannot be cleared by any external event outside the deadlocked set.',
    theoryVsImplementation: {
      generalTheory:
        'Commodity general-purpose kernels (Linux, Windows, macOS) largely rely on application-level locks and the Ostrich approach due to the runtime overhead of dynamic avoidance.',
      oscopeImplementation:
        'OScope implements an interactive formal laboratory with multi-instance resource vectors, interactive RAG editor, cycle detection, and step-by-step Banker safety evaluations.'
    },
    relatedTopics: ['deadlock-coffman-conditions', 'deadlock-safe-vs-unsafe', 'deadlock-banker-algorithm'],
    labRoute: '/deadlock'
  },
  {
    id: 'deadlock-coffman-conditions',
    title: 'The Four Coffman Conditions',
    subsystem: 'DEADLOCK',
    shortDefinition:
      'The four simultaneous necessary conditions identified by Edward G. Coffman Jr. et al. (1971) that must hold for a deadlock to arise.',
    explanation:
      'For a system to enter a deadlocked state, ALL FOUR of the following conditions must hold simultaneously in the system: (1) Mutual Exclusion: At least one resource must be held in a non-shareable mode (only one process at a time can use the resource). (2) Hold and Wait: A process must be currently holding at least one resource and actively waiting to acquire additional resources held by other processes. (3) No Preemption: Resources cannot be forcibly taken away from a process; a resource can only be released voluntarily by the holding process after completing its task. (4) Circular Wait: A closed chain of processes exists such that P0 is waiting for a resource held by P1, P1 is waiting for a resource held by P2, ..., and Pn is waiting for a resource held by P0.',
    keyPoints: [
      'ALL FOUR conditions are strictly necessary. Eliminating any SINGLE condition mathematically prevents deadlock.',
      '1. Mutual Exclusion: Inherent to non-shareable physical resources (e.g., writers on a shared file).',
      '2. Hold and Wait: Prevented by requiring processes to request all resources at once or release all before requesting new ones.',
      '3. No Preemption: Prevented by forcibly revoking allocated resources if a new request cannot be immediately satisfied.',
      '4. Circular Wait: Prevented by imposing a strict total resource ordering (Havender protocol) and requiring monotonic acquisition.'
    ],
    practicalExample:
      'If processes are strictly required to acquire resources in ascending numerical order (e.g., acquire R1 before R2), a circular wait condition is mathematically impossible to form, guaranteeing deadlock-free execution.',
    commonMisconception:
      'MYTH: Observing any single condition (e.g. mutual exclusion) proves that deadlock is occurring. REALITY: All four conditions must be simultaneously satisfied for a deadlock to exist.',
    theoryVsImplementation: {
      generalTheory:
        'Coffman conditions form the bedrock of Deadlock Prevention strategies by structurally negating at least one condition via protocol design.',
      oscopeImplementation:
        'OScope displays the four conditions with dynamic status indicators reflecting whether the current system configuration satisfies the preconditions for potential deadlock.'
    },
    relatedTopics: ['deadlock-definition', 'deadlock-safe-vs-unsafe', 'deadlock-rag-theory'],
    labRoute: '/deadlock'
  },
  {
    id: 'deadlock-safe-vs-unsafe',
    title: 'Safe vs. Unsafe vs. Deadlocked States',
    subsystem: 'DEADLOCK',
    shortDefinition:
      'A fundamental academic distinction: a Safe State guarantees that at least one execution sequence can finish without deadlock; an Unsafe State contains no such guarantee, but is NOT necessarily deadlocked.',
    explanation:
      'One of the most widely misunderstood distinctions in Operating Systems. A state is SAFE if there exists at least one "Safe Sequence" <P0, P1, ..., Pn> such that for each Pi, the resources that Pi may still request can be satisfied by currently Available resources PLUS the resources already held by all preceding processes Pj (where j < i). A state is UNSAFE if no such sequence can be found. An unsafe state is NOT deadlocked; rather, it is a vulnerable state that CAN lead to a deadlock if processes happen to exercise their maximum remaining resource demands. Every deadlocked state is unsafe, but NOT every unsafe state is deadlocked!',
    keyPoints: [
      'SAFE: A safe execution sequence exists. The OS can guarantee that all processes will eventually terminate even if each requests its declared maximum.',
      'UNSAFE: No safe sequence can be guaranteed. Deadlock is NOT present yet, but may occur if processes demand maximum remaining claims.',
      'DEADLOCKED: An actual circular wait or unsatisfied resource dependency is currently blocking a subset of processes right now.',
      'CRITICAL VIVA POINT: Unsafe does NOT equal Deadlocked! Safe is a strict subset of Deadlock-Free states.'
    ],
    practicalExample:
      'Consider 1 resource with 12 total instances. P0 has 5 (Max 10), P1 has 2 (Max 4), P2 has 2 (Max 9). Available = 12 - 9 = 3. Safe sequence exists: <P1, P0, P2>. If Available drops to 1, no safe sequence exists (UNSAFE). However, if P0, P1, P2 never actually request their remaining claims, the system completes without ever deadlocking!',
    commonMisconception:
      'MYTH: "The system entered an unsafe state, so it is deadlocked." REALITY: An unsafe state merely means the OS cannot guarantee avoidance; if processes release resources early or do not request maximum claims, deadlock may never materialize.',
    theoryVsImplementation: {
      generalTheory:
        'Illustrated as concentric state circles: Safe States ⊂ Deadlock-Free States ⊂ Total States, with Unsafe States bridging between safe and deadlocked states.',
      oscopeImplementation:
        'OScope explicitly colors and classifies states as SAFE (green), UNSAFE (amber), or DEADLOCKED (crimson), and interactively shows candidate safe sequence permutations.'
    },
    relatedTopics: ['deadlock-banker-algorithm', 'deadlock-definition'],
    labRoute: '/deadlock'
  },
  {
    id: 'deadlock-banker-algorithm',
    title: "Banker's Algorithm: Matrix Model & Safety Evaluation",
    subsystem: 'DEADLOCK',
    shortDefinition:
      'A classic deadlock avoidance algorithm developed by Edsger Dijkstra that dynamically tests whether granting a resource request leaves the system in a safe state.',
    explanation:
      "Banker's Algorithm is a Deadlock Avoidance algorithm (NOT a detection algorithm). Modeled after a conservative small-town banker who never allocates cash unless all customer credit lines can be fully guaranteed, the algorithm maintains four core data structures for n processes and m resource types: (1) Available[m]: Available instances per resource. (2) Max[n, m]: Declared maximum requirement of each process. (3) Allocation[n, m]: Currently allocated resources. (4) Need[n, m] = Max - Allocation: Remaining resources each process may still request. The Safety Algorithm verifies whether a hypothetical work vector can satisfy the Need of each process sequentially until all finish.",
    keyPoints: [
      'Classified as Deadlock Avoidance: Requires processes to declare their maximum resource demands a priori (upon arrival).',
      'Need Matrix Formula: Need[i, j] = Max[i, j] - Allocation[i, j].',
      'Work and Finish Vectors: Work is initialized to Available; Finish[i] is initialized to false for all i.',
      'Search Step: Find an index i such that Finish[i] == false and Need[i] <= Work. If found, Work += Allocation[i], Finish[i] = true, and repeat.',
      'If all processes finish (Finish[i] == true for all i), the system is in a SAFE state and the selection order forms a Safe Sequence.'
    ],
    practicalExample:
      'If Process P1 has Need = [1, 2, 2] and current Work = [3, 3, 2], then Need[P1] <= Work holds. Process P1 is chosen: it hypothetically runs, terminates, and returns its Allocation [2, 0, 0] back to Work, updating Work to [5, 3, 2].',
    commonMisconception:
      "MYTH: Banker's Algorithm detects whether a system is currently deadlocked. REALITY: Banker's algorithm is an avoidance strategy that evaluates whether a hypothetical future request could force the system into an unsafe state.",
    theoryVsImplementation: {
      generalTheory:
        "Requires exact pre-declaration of maximum claims and fixed resource counts, making pure Banker's algorithm impractical for general-purpose OS kernels with dynamic user processes.",
      oscopeImplementation:
        'OScope provides full interactive vector/matrix inspection (Available, Max, Allocation, Need), live recalculation of Need, and step-by-step visual animation of the Safety search loop.'
    },
    relatedTopics: ['deadlock-safe-vs-unsafe', 'deadlock-resource-request'],
    labRoute: '/deadlock'
  },
  {
    id: 'deadlock-resource-request',
    title: 'The Resource-Request Algorithm: Three-Step Decision Gate',
    subsystem: 'DEADLOCK',
    shortDefinition:
      "The rigorous three-phase verification protocol executed by the Banker's Algorithm whenever a process makes a dynamic resource request.",
    explanation:
      'When Process Pi requests a vector Request[i] of resources, the OS evaluates: Step 1: Verify Request[i] <= Need[i]. If false, raise an error condition because the process has exceeded its declared maximum claim. Step 2: Verify Request[i] <= Available. If false, process Pi must wait because the requested resources are not currently available in the system pool. Step 3: Provisional Allocation. The OS tentatively pretends to grant the request by modifying system vectors: Available = Available - Request[i]; Allocation[i] = Allocation[i] + Request[i]; Need[i] = Need[i] - Request[i]. The OS then runs the Safety Algorithm on this modified state. If SAFE -> the allocation is formally GRANTED. If UNSAFE -> the provisional allocation is ROLLED BACK and Pi must WAIT.',
    keyPoints: [
      'Step 1 Check: Request <= Need (bounds check against declared maximum claim).',
      'Step 2 Check: Request <= Available (capacity check against current free units).',
      'Step 3 Check: Safety Algorithm on provisional state (guarantee of future deadlock freedom).',
      'Atomic rollback: If the provisional state is unsafe, system state is restored to its exact pre-request configuration.'
    ],
    practicalExample:
      'P0 requests [1, 0, 2]. Need[P0] is [1, 2, 2] (Step 1 PASS). Available is [3, 3, 2] (Step 2 PASS). Provisional state tested: if Safety returns safe sequence <P1, P3, P0, P2, P4>, request is GRANTED. If unsafe, P0 waits.',
    commonMisconception:
      'Assuming that if resources are physically Available, the request must immediately be granted. Even if units are available, granting them may lead to an unsafe state, so the OS must deny or delay the allocation.',
    theoryVsImplementation: {
      generalTheory:
        'Guarantees zero deadlocks at the cost of conservative over-constraining and potential starvation of resource-heavy tasks.',
      oscopeImplementation:
        'OScope enables users to craft arbitrary request vectors and click "Evaluate Request", providing step-by-step diagnostic breakdown of all three checks with immediate visual feedback.'
    },
    relatedTopics: ['deadlock-banker-algorithm', 'deadlock-safe-vs-unsafe'],
    labRoute: '/deadlock'
  },
  {
    id: 'deadlock-rag-theory',
    title: 'Resource Allocation Graph (RAG) & Wait-For Graph (WFG)',
    subsystem: 'DEADLOCK',
    shortDefinition:
      'A directed bipartite graph representing system resource state, where nodes are partitioned into Processes and Resources, and edges model assignments and requests.',
    explanation:
      'A Resource Allocation Graph G = (V, E) formally maps concurrency interactions. Vertex set V is partitioned into Process nodes P = {P1, ..., Pn} and Resource nodes R = {R1, ..., Rm}. Edges are directed: (1) Request Edge: Directed from Process Pi to Resource Rj (Pi -> Rj), indicating that Pi is currently blocked waiting for an instance of Rj. (2) Assignment Edge: Directed from an instance of Resource Rj to Process Pi (Rj -> Pi), indicating that an instance of Rj is currently allocated to Pi. In a Single-Instance resource system: A directed cycle in the RAG is BOTH a necessary AND sufficient condition for deadlock! In a Multi-Instance resource system: A directed cycle is a NECESSARY condition, but NOT a sufficient condition.',
    keyPoints: [
      'Bipartite structure: Edges only connect Processes to Resources or Resources to Processes (never Process to Process directly).',
      'Request Edge: Pi -> Rj (process is waiting for resource).',
      'Assignment Edge: Rj -> Pi (resource instance is held by process).',
      'Single-Instance Rule: Cycle <=> Deadlock. A cycle guarantees deadlock.',
      'Multi-Instance Rule: Cycle != Deadlock automatically. Other processes outside the cycle holding instances may complete and break the knot.',
      'Wait-For Graph (WFG): Collapses single-instance RAGs by removing resource nodes: Pi -> Pj means Pi waits for a resource held by Pj.'
    ],
    practicalExample:
      'Multi-instance cycle without deadlock: P1 holds R1 and requests R2; P2 holds R2 and requests R1 (forming cycle P1 -> R2 -> P2 -> R1 -> P1). However, R1 has a second instance held by P3. If P3 completes and releases R1, P2 acquires R1, finishes, releases R2, allowing P1 to finish. No deadlock occurred!',
    commonMisconception:
      'MYTH: A cycle in any RAG always means deadlock. REALITY: A cycle proves deadlock ONLY in single-instance resource systems. In multi-instance systems, a cycle is merely a necessary condition that requires formal reduction/safety testing to confirm deadlock.',
    theoryVsImplementation: {
      generalTheory:
        'Graph reduction algorithms (Tarjan SCC or cycle detection) are run periodically by detection daemons in distributed systems.',
      oscopeImplementation:
        'OScope provides an interactive canvas RAG editor with real-time cycle detection, cycle node highlighting, and distinction between single and multi-instance edges.'
    },
    relatedTopics: ['deadlock-coffman-conditions', 'deadlock-definition'],
    labRoute: '/deadlock'
  }
];

export const DEADLOCK_ALGORITHMS: readonly AlgorithmGuide[] = [
  {
    id: 'dl-banker',
    name: "Banker's Safety & Avoidance Algorithm",
    subsystem: 'DEADLOCK',
    preemptive: false,
    definition:
      "A proactive deadlock avoidance algorithm that evaluates system safety before granting resource allocations, ensuring that the system never enters an unsafe state.",
    mechanism:
      'Simulates worst-case resource claiming by processes. Repeatedly finds a process whose remaining maximum need can be satisfied by current free resources plus freed resources from already simulated processes.',
    selectionRule:
      'Candidate Pi selected if Finish[Pi] == false AND Need[Pi, j] <= Work[j] for all resource types j.',
    advantages: [
      'Provably guarantees that deadlocks can never occur in the system.',
      'Permits higher resource utilization than static deadlock prevention protocols (e.g., Hold and Wait prevention).',
      'Does not require preempting running processes or terminating jobs.'
    ],
    disadvantages: [
      'Requires processes to state their maximum resource needs in advance, which is rarely known in dynamic environments.',
      'Assumes a fixed number of processes and fixed total resource capacities.',
      'O(m * n^2) computational overhead on every resource request can degrade system throughput.'
    ],
    complexityNote:
      'Safety check complexity is O(m * n^2), where n is process count and m is resource type count.',
    starvationNote:
      'A process requiring large amounts of resources may wait indefinitely while smaller processes enter, acquire, finish, and leave.',
    bestSuitedWorkload:
      'Batch transaction systems or scientific processing workflows with predictable, static, pre-declared maximum resource envelopes.',
    commonMisconceptions: [
      "Assuming Banker's Algorithm recovers from existing deadlocks. It avoids deadlocks by denying entry into unsafe states.",
      'Believing an unsafe state is already deadlocked. Unsafe means safety cannot be guaranteed under worst-case claims.'
    ],
    labRoute: '/deadlock'
  }
];
