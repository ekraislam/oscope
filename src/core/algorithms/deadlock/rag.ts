/**
 * OScope — Resource Allocation Graph (RAG) & Cycle Detection Engine
 * Pure graph algorithms for RAG construction, deterministic cycle detection, and Wait-For Graph derivation.
 */

import type {
  ResourceAllocationState,
  RAGGraph,
  RAGNode,
  RAGEdge,
  RAGCycleResult,
  WaitForGraph,
  WaitForEdge,
} from '../../models/deadlock';
import { computeTotalResources } from './matrix';

/**
 * Builds an immutable RAG from the resource allocation state.
 */
export function buildRAGFromState(
  state: ResourceAllocationState,
  pendingRequests?: readonly (readonly number[])[]
): RAGGraph {
  const nodes: RAGNode[] = [];
  const edges: RAGEdge[] = [];

  const requests = pendingRequests ?? state.need;
  const totals = computeTotalResources(state.available, state.allocation);

  // 1. Process Nodes
  for (const pid of state.processes) {
    nodes.push(
      Object.freeze({
        id: pid,
        name: pid,
        type: 'PROCESS',
      })
    );
  }

  // 2. Resource Nodes
  for (let j = 0; j < state.resourceCount; j++) {
    const rid = state.resources[j];
    nodes.push(
      Object.freeze({
        id: rid,
        name: rid,
        type: 'RESOURCE',
        instances: totals[j],
      })
    );
  }

  // 3. Edges:
  // Assignment: Resource Rj -> Process Pi (for Allocation[i][j] > 0)
  for (let i = 0; i < state.processCount; i++) {
    const pid = state.processes[i];
    for (let j = 0; j < state.resourceCount; j++) {
      const rid = state.resources[j];
      const allocCount = state.allocation[i][j];
      if (allocCount > 0) {
        edges.push(
          Object.freeze({
            from: rid,
            to: pid,
            type: 'ASSIGNMENT',
            count: allocCount,
          })
        );
      }
    }
  }

  // Request: Process Pi -> Resource Rj (for Request[i][j] > 0)
  for (let i = 0; i < state.processCount; i++) {
    const pid = state.processes[i];
    for (let j = 0; j < state.resourceCount; j++) {
      const rid = state.resources[j];
      const reqCount = requests[i]?.[j] ?? 0;
      if (reqCount > 0) {
        edges.push(
          Object.freeze({
            from: pid,
            to: rid,
            type: 'REQUEST',
            count: reqCount,
          })
        );
      }
    }
  }

  return Object.freeze({
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
  });
}

/**
 * Deterministically detects all directed cycles in the Resource Allocation Graph.
 */
export function detectRAGCycles(graph: RAGGraph): RAGCycleResult {
  const adj = new Map<string, string[]>();
  const nodeMap = new Map<string, RAGNode>();

  for (const node of graph.nodes) {
    adj.set(node.id, []);
    nodeMap.set(node.id, node);
  }

  for (const edge of graph.edges) {
    adj.get(edge.from)?.push(edge.to);
  }

  // Sort adjacency lists for deterministic traversal
  for (const [, neighbors] of adj) {
    neighbors.sort();
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const path: string[] = [];

  // Canonicalize cycle to avoid duplicates (e.g. A->B->C is same as B->C->A)
  const canonicalCycles = new Set<string>();

  function dfs(curr: string) {
    visited.add(curr);
    inStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) ?? [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        dfs(next);
      } else if (inStack.has(next)) {
        // Cycle detected!
        const cycleStartIndex = path.indexOf(next);
        if (cycleStartIndex !== -1) {
          const rawCycle = path.slice(cycleStartIndex);
          // Canonical form: find minimum string in cycle and rotate
          let minIdx = 0;
          for (let i = 1; i < rawCycle.length; i++) {
            if (rawCycle[i] < rawCycle[minIdx]) {
              minIdx = i;
            }
          }
          const canonical = [
            ...rawCycle.slice(minIdx),
            ...rawCycle.slice(0, minIdx),
          ];
          const key = canonical.join('->');
          if (!canonicalCycles.has(key)) {
            canonicalCycles.add(key);
            cycles.push(canonical);
          }
        }
      }
    }

    path.pop();
    inStack.delete(curr);
  }

  // Iterate in sorted order of node IDs for strict determinism
  const sortedNodeIds = graph.nodes.map((n) => n.id).sort();
  for (const nodeId of sortedNodeIds) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  const hasCycle = cycles.length > 0;
  const cycleNodeSet = new Set<string>();
  for (const c of cycles) {
    for (const n of c) {
      cycleNodeSet.add(n);
    }
  }

  // Find all edges that participate in the cycles
  const cycleEdges: RAGEdge[] = [];
  for (const c of cycles) {
    for (let i = 0; i < c.length; i++) {
      const u = c[i];
      const v = c[(i + 1) % c.length];
      const matchingEdge = graph.edges.find((e) => e.from === u && e.to === v);
      if (matchingEdge && !cycleEdges.includes(matchingEdge)) {
        cycleEdges.push(matchingEdge);
      }
    }
  }

  // Check whether every resource node involved in the cycle has single instance
  let isSingleInstanceAll = true;
  for (const nodeId of cycleNodeSet) {
    const node = nodeMap.get(nodeId);
    if (node?.type === 'RESOURCE') {
      if ((node.instances ?? 1) > 1) {
        isSingleInstanceAll = false;
        break;
      }
    }
  }

  let deadlockImplication = '';
  let explanation = '';

  if (!hasCycle) {
    deadlockImplication = 'NO DEADLOCK (Cycle-Free RAG)';
    explanation =
      'The Resource Allocation Graph contains no directed cycles. According to Operating System theory, if a RAG has no cycles, the system cannot be deadlocked.';
  } else if (isSingleInstanceAll) {
    deadlockImplication = 'DEFINITIVE DEADLOCK (Single-Instance Resource Cycle)';
    explanation =
      `Cycle detected: [${cycles[0]?.join(' → ')} → ${cycles[0]?.[0]}]. Because ALL resources in this cycle have exactly 1 instance, a cycle is BOTH a necessary and sufficient condition for deadlock. The system is DEFINITIVELY DEADLOCKED.`;
  } else {
    deadlockImplication = 'POTENTIAL DEADLOCK (Multi-Instance Resource Cycle)';
    explanation =
      `Cycle detected: [${cycles[0]?.join(' → ')} → ${cycles[0]?.[0]}], but one or more involved resources have MULTIPLE instances. In multi-instance systems, a cycle is a necessary condition for deadlock, but NOT a sufficient condition. Circular waiting exists, but an external process holding instances could finish and break the cycle. Consult Banker's safety or Deadlock Detection.`;
  }

  return Object.freeze({
    hasCycle,
    cycles: Object.freeze(cycles.map((c) => Object.freeze(c))),
    cycleNodes: Object.freeze(Array.from(cycleNodeSet)),
    cycleEdges: Object.freeze(cycleEdges),
    isSingleInstanceAll,
    deadlockImplication,
    explanation,
  });
}

/**
 * Derives a Wait-For Graph (WFG) from the system's allocation and pending requests.
 * An edge Pi -> Pj exists if Pi is waiting for a resource instance held by Pj.
 */
export function buildWaitForGraph(
  state: ResourceAllocationState,
  pendingRequests?: readonly (readonly number[])[]
): WaitForGraph {
  const requests = pendingRequests ?? state.need;
  const nodes = [...state.processes];
  const edges: WaitForEdge[] = [];

  for (let i = 0; i < state.processCount; i++) {
    const pWaiting = state.processes[i];
    for (let j = 0; j < state.resourceCount; j++) {
      const resId = state.resources[j];
      const reqAmount = requests[i]?.[j] ?? 0;
      if (reqAmount > 0) {
        // Find all other processes Pk holding an allocation of Rj
        for (let k = 0; k < state.processCount; k++) {
          if (k !== i && (state.allocation[k][j] ?? 0) > 0) {
            const pHolding = state.processes[k];
            edges.push(
              Object.freeze({
                from: pWaiting,
                to: pHolding,
                resourceId: resId,
              })
            );
          }
        }
      }
    }
  }

  // Detect cycles in Wait-For Graph
  const adj = new Map<string, string[]>();
  for (const p of nodes) {
    adj.set(p, []);
  }
  for (const e of edges) {
    adj.get(e.from)?.push(e.to);
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const path: string[] = [];
  const canonicalCycles = new Set<string>();

  function dfs(curr: string) {
    visited.add(curr);
    inStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) ?? [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        dfs(next);
      } else if (inStack.has(next)) {
        const cycleStartIndex = path.indexOf(next);
        if (cycleStartIndex !== -1) {
          const rawCycle = path.slice(cycleStartIndex);
          let minIdx = 0;
          for (let i = 1; i < rawCycle.length; i++) {
            if (rawCycle[i] < rawCycle[minIdx]) minIdx = i;
          }
          const canonical = [
            ...rawCycle.slice(minIdx),
            ...rawCycle.slice(0, minIdx),
          ];
          const key = canonical.join('->');
          if (!canonicalCycles.has(key)) {
            canonicalCycles.add(key);
            cycles.push(canonical);
          }
        }
      }
    }

    path.pop();
    inStack.delete(curr);
  }

  for (const p of [...nodes].sort()) {
    if (!visited.has(p)) {
      dfs(p);
    }
  }

  const hasCycle = cycles.length > 0;
  const explanation = hasCycle
    ? `Wait-For Graph contains a circular wait dependency: <${cycles[0]?.join(' → ')} → ${cycles[0]?.[0]}>. In single-instance systems, this guarantees deadlock.`
    : `Wait-For Graph is acyclic. Processes are not engaged in circular waiting.`;

  return Object.freeze({
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
    cycles: Object.freeze(cycles.map((c) => Object.freeze(c))),
    hasCycle,
    explanation,
  });
}
