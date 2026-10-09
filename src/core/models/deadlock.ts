/**
 * OScope — Deadlock & Banker's Algorithm Domain Models
 * Explicit matrix dimensions and graph nodes/edges for resource allocation analysis.
 */

export interface ResourceAllocationState {
  readonly processCount: number;
  readonly resourceCount: number;
  readonly processes: readonly string[];                // ['P0', 'P1', ..., 'Pn-1']
  readonly resources: readonly string[];                // ['A', 'B', ..., 'Rm-1']
  readonly available: readonly number[];                // Vector [m]
  readonly max: readonly (readonly number[])[];         // Matrix [n x m]
  readonly allocation: readonly (readonly number[])[];  // Matrix [n x m]
  readonly need: readonly (readonly number[])[];        // Matrix [n x m] = Max - Allocation
}

export interface BankerStep {
  readonly stepNumber: number;
  readonly processId: string;
  readonly workVectorBefore: readonly number[];
  readonly needVector: readonly number[];
  readonly allocationVector: readonly number[];
  readonly workVectorAfter: readonly number[];
  readonly canAllocate: boolean;
  readonly explanation: string;
}

export interface BankerSafetyResult {
  readonly isSafe: boolean;
  readonly safeSequence: readonly string[];
  readonly steps: readonly BankerStep[];
  readonly needMatrix: readonly (readonly number[])[];
  readonly explanation: string;
}

export interface ResourceRequest {
  readonly processId: string;
  readonly requestVector: readonly number[];
}

export interface ResourceRequestCheckDetails {
  readonly needCheckPassed: boolean;
  readonly availableCheckPassed: boolean;
  readonly safetyCheckPassed: boolean;
  readonly needCheckReason: string;
  readonly availableCheckReason: string;
  readonly safetyCheckReason: string;
}

export interface ResourceRequestResult {
  readonly granted: boolean;
  readonly requestedState?: ResourceAllocationState;
  readonly safetyResult: BankerSafetyResult;
  readonly reason: string;
  readonly checkDetails: ResourceRequestCheckDetails;
}

export type RAGNodeType = 'PROCESS' | 'RESOURCE';

export interface RAGNode {
  readonly id: string;
  readonly name: string;
  readonly type: RAGNodeType;
  readonly instances?: number; // Total instances for resources
}

export type RAGEdgeType = 'REQUEST' | 'ASSIGNMENT';

export interface RAGEdge {
  readonly from: string; // process ID or resource ID
  readonly to: string;   // resource ID or process ID
  readonly type: RAGEdgeType;
  readonly count?: number; // Number of instances requested/assigned
}

export interface RAGGraph {
  readonly nodes: readonly RAGNode[];
  readonly edges: readonly RAGEdge[];
}

export interface RAGCycleResult {
  readonly hasCycle: boolean;
  readonly cycles: readonly (readonly string[])[];
  readonly cycleNodes: readonly string[];
  readonly cycleEdges: readonly RAGEdge[];
  readonly isSingleInstanceAll: boolean;
  readonly deadlockImplication: string;
  readonly explanation: string;
}

export interface WaitForEdge {
  readonly from: string; // Waiting process PID
  readonly to: string;   // Holding process PID
  readonly resourceId: string;
}

export interface WaitForGraph {
  readonly nodes: readonly string[];
  readonly edges: readonly WaitForEdge[];
  readonly cycles: readonly (readonly string[])[];
  readonly hasCycle: boolean;
  readonly explanation: string;
}

export interface DeadlockDetectionStep {
  readonly stepNumber: number;
  readonly processId: string;
  readonly workBefore: readonly number[];
  readonly requestVector: readonly number[];
  readonly allocationVector: readonly number[];
  readonly workAfter: readonly number[];
  readonly canFinish: boolean;
  readonly explanation: string;
}

export interface DeadlockDetectionResult {
  readonly isDeadlocked: boolean;
  readonly deadlockedProcesses: readonly string[];
  readonly deadlockedResources: readonly string[];
  readonly cyclePaths: readonly (readonly string[])[];
  readonly steps: readonly DeadlockDetectionStep[];
  readonly explanation: string;
}
