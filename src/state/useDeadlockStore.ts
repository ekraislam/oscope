/**
 * OScope — Deadlock & Banker's Algorithm Laboratory Zustand Store
 * Orchestrates resource allocation states, interactive matrix editing,
 * Banker's safety verification, resource-request evaluation, RAG visualization,
 * cycle detection, and multi-instance deadlock detection telemetry.
 */

import { create } from 'zustand';
import type {
  ResourceAllocationState,
  BankerSafetyResult,
  ResourceRequestResult,
  RAGGraph,
  RAGCycleResult,
  WaitForGraph,
  DeadlockDetectionResult,
} from '../core/models/deadlock';
import {
  createResourceAllocationState,
  runBankerSafetyCheck,
  runBankerResourceRequest,
  runDeadlockDetection,
  buildRAGFromState,
  detectRAGCycles,
  buildWaitForGraph,
  DEADLOCK_PRESETS,
  cloneMatrix,
} from '../core/algorithms/deadlock';

export interface DeadlockStoreState {
  // Scenario & Configuration
  activePresetId: string;
  state: ResourceAllocationState;

  // Analysis Results
  safetyResult: BankerSafetyResult;
  ragGraph: RAGGraph;
  ragCycleResult: RAGCycleResult;
  waitForGraph: WaitForGraph;
  deadlockDetectionResult: DeadlockDetectionResult;

  // Request Evaluation
  selectedProcessId: string;
  requestVector: number[];
  requestResult: ResourceRequestResult | null;

  // Simulation Playback & Events
  playbackStep: number;
  isPlaying: boolean;
  playbackSpeed: number;
  simulationEvents: readonly string[];
  activeTab: 'safety' | 'rag' | 'detection' | 'theory';

  // Matrix Editing Validation State
  validationError: string | null;

  // Actions
  loadPreset: (presetId: string) => void;
  updateMaxCell: (processIdx: number, resourceIdx: number, value: number) => void;
  updateAllocationCell: (processIdx: number, resourceIdx: number, value: number) => void;
  updateAvailableElement: (resourceIdx: number, value: number) => void;
  setSelectedProcessId: (processId: string) => void;
  setRequestVectorElement: (resourceIdx: number, value: number) => void;
  evaluateSafety: () => void;
  evaluateRequest: () => void;
  applyGrantedRequest: () => void;
  runDetection: () => void;
  setPlaybackStep: (step: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setActiveTab: (tab: 'safety' | 'rag' | 'detection' | 'theory') => void;
  resetToPreset: () => void;
}

// Initial scenario: Classic Safe State
const initialPreset = DEADLOCK_PRESETS[0];
const initialSafety = runBankerSafetyCheck(initialPreset.state);
const initialRAG = buildRAGFromState(initialPreset.state, initialPreset.pendingRequests);
const initialRAGCycles = detectRAGCycles(initialRAG);
const initialWFG = buildWaitForGraph(initialPreset.state, initialPreset.pendingRequests);
const initialDetection = runDeadlockDetection(initialPreset.state, initialPreset.pendingRequests);

export const useDeadlockStore = create<DeadlockStoreState>((set, get) => ({
  activePresetId: initialPreset.id,
  state: initialPreset.state,

  safetyResult: initialSafety,
  ragGraph: initialRAG,
  ragCycleResult: initialRAGCycles,
  waitForGraph: initialWFG,
  deadlockDetectionResult: initialDetection,

  selectedProcessId: initialPreset.recommendedRequest?.processId ?? 'P1',
  requestVector: initialPreset.recommendedRequest?.requestVector
    ? [...initialPreset.recommendedRequest.requestVector]
    : new Array(initialPreset.state.resourceCount).fill(0),
  requestResult: null,

  playbackStep: 0,
  isPlaying: false,
  playbackSpeed: 1000,
  simulationEvents: [
    `[INIT] Loaded preset "${initialPreset.name}".`,
    `[STATE] Available: [${initialPreset.state.available.join(', ')}].`,
    `[SAFETY] Evaluated safety: ${initialSafety.isSafe ? 'SAFE' : 'UNSAFE'}.`,
  ],
  activeTab: 'safety',
  validationError: null,

  loadPreset: (presetId: string) => {
    const preset = DEADLOCK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const safety = runBankerSafetyCheck(preset.state);
    const rag = buildRAGFromState(preset.state, preset.pendingRequests);
    const ragCycles = detectRAGCycles(rag);
    const wfg = buildWaitForGraph(preset.state, preset.pendingRequests);
    const detection = runDeadlockDetection(preset.state, preset.pendingRequests);

    const defaultPid = preset.recommendedRequest?.processId ?? preset.state.processes[0];
    const defaultReq = preset.recommendedRequest?.requestVector
      ? [...preset.recommendedRequest.requestVector]
      : new Array(preset.state.resourceCount).fill(0);

    set({
      activePresetId: preset.id,
      state: preset.state,
      safetyResult: safety,
      ragGraph: rag,
      ragCycleResult: ragCycles,
      waitForGraph: wfg,
      deadlockDetectionResult: detection,
      selectedProcessId: defaultPid,
      requestVector: defaultReq,
      requestResult: null,
      playbackStep: 0,
      isPlaying: false,
      validationError: null,
      simulationEvents: [
        `[PRESET] Loaded preset: ${preset.name}`,
        `[INFO] ${preset.academicFocus}`,
        `[SAFETY] Initial safety: ${safety.isSafe ? 'SAFE' : 'UNSAFE'}`,
      ],
    });
  },

  updateMaxCell: (processIdx: number, resourceIdx: number, value: number) => {
    const { state } = get();
    if (value < 0 || isNaN(value)) {
      set({ validationError: 'Max demands must be non-negative integers.' });
      return;
    }

    try {
      const newMax = cloneMatrix(state.max);
      newMax[processIdx][resourceIdx] = value;

      const newState = createResourceAllocationState({
        processes: state.processes,
        resources: state.resources,
        available: state.available,
        max: newMax,
        allocation: state.allocation,
      });

      const safety = runBankerSafetyCheck(newState);
      const rag = buildRAGFromState(newState);
      const ragCycles = detectRAGCycles(rag);
      const wfg = buildWaitForGraph(newState);
      const detection = runDeadlockDetection(newState);

      set((prev) => ({
        state: newState,
        safetyResult: safety,
        ragGraph: rag,
        ragCycleResult: ragCycles,
        waitForGraph: wfg,
        deadlockDetectionResult: detection,
        requestResult: null,
        validationError: null,
        simulationEvents: [
          ...prev.simulationEvents,
          `[UPDATE] Max for ${state.processes[processIdx]}[${state.resources[resourceIdx]}] set to ${value}`,
        ],
      }));
    } catch (err: unknown) {
      set({ validationError: (err as Error).message });
    }
  },

  updateAllocationCell: (processIdx: number, resourceIdx: number, value: number) => {
    const { state } = get();
    if (value < 0 || isNaN(value)) {
      set({ validationError: 'Allocation quantities must be non-negative integers.' });
      return;
    }

    try {
      const newAlloc = cloneMatrix(state.allocation);
      newAlloc[processIdx][resourceIdx] = value;

      const newState = createResourceAllocationState({
        processes: state.processes,
        resources: state.resources,
        available: state.available,
        max: state.max,
        allocation: newAlloc,
      });

      const safety = runBankerSafetyCheck(newState);
      const rag = buildRAGFromState(newState);
      const ragCycles = detectRAGCycles(rag);
      const wfg = buildWaitForGraph(newState);
      const detection = runDeadlockDetection(newState);

      set((prev) => ({
        state: newState,
        safetyResult: safety,
        ragGraph: rag,
        ragCycleResult: ragCycles,
        waitForGraph: wfg,
        deadlockDetectionResult: detection,
        requestResult: null,
        validationError: null,
        simulationEvents: [
          ...prev.simulationEvents,
          `[UPDATE] Allocation for ${state.processes[processIdx]}[${state.resources[resourceIdx]}] set to ${value}`,
        ],
      }));
    } catch (err: unknown) {
      set({ validationError: (err as Error).message });
    }
  },

  updateAvailableElement: (resourceIdx: number, value: number) => {
    const { state } = get();
    if (value < 0 || isNaN(value)) {
      set({ validationError: 'Available values must be non-negative integers.' });
      return;
    }

    try {
      const newAvail = [...state.available];
      newAvail[resourceIdx] = value;

      const newState = createResourceAllocationState({
        processes: state.processes,
        resources: state.resources,
        available: newAvail,
        max: state.max,
        allocation: state.allocation,
      });

      const safety = runBankerSafetyCheck(newState);
      const rag = buildRAGFromState(newState);
      const ragCycles = detectRAGCycles(rag);
      const wfg = buildWaitForGraph(newState);
      const detection = runDeadlockDetection(newState);

      set((prev) => ({
        state: newState,
        safetyResult: safety,
        ragGraph: rag,
        ragCycleResult: ragCycles,
        waitForGraph: wfg,
        deadlockDetectionResult: detection,
        requestResult: null,
        validationError: null,
        simulationEvents: [
          ...prev.simulationEvents,
          `[UPDATE] Available for ${state.resources[resourceIdx]} set to ${value}`,
        ],
      }));
    } catch (err: unknown) {
      set({ validationError: (err as Error).message });
    }
  },

  setSelectedProcessId: (processId: string) => {
    set({ selectedProcessId: processId });
  },

  setRequestVectorElement: (resourceIdx: number, value: number) => {
    const { requestVector } = get();
    const newVec = [...requestVector];
    newVec[resourceIdx] = Math.max(0, value || 0);
    set({ requestVector: newVec });
  },

  evaluateSafety: () => {
    const { state } = get();
    const safety = runBankerSafetyCheck(state);
    set((prev) => ({
      safetyResult: safety,
      playbackStep: 0,
      simulationEvents: [
        ...prev.simulationEvents,
        `[SAFETY CHECK] Result: ${safety.isSafe ? 'SAFE' : 'UNSAFE'}. ${safety.explanation}`,
      ],
    }));
  },

  evaluateRequest: () => {
    const { state, selectedProcessId, requestVector } = get();
    const result = runBankerResourceRequest(state, {
      processId: selectedProcessId,
      requestVector,
    });

    set((prev) => ({
      requestResult: result,
      simulationEvents: [
        ...prev.simulationEvents,
        `[REQUEST] Process ${selectedProcessId} requested [${requestVector.join(', ')}]`,
        `[DECISION] ${result.granted ? 'GRANTED' : 'DENIED'}: ${result.reason}`,
      ],
    }));
  },

  applyGrantedRequest: () => {
    const { requestResult } = get();
    if (!requestResult || !requestResult.granted || !requestResult.requestedState) {
      return;
    }

    const newState = requestResult.requestedState;
    const safety = runBankerSafetyCheck(newState);
    const rag = buildRAGFromState(newState);
    const ragCycles = detectRAGCycles(rag);
    const wfg = buildWaitForGraph(newState);
    const detection = runDeadlockDetection(newState);

    set((prev) => ({
      state: newState,
      safetyResult: safety,
      ragGraph: rag,
      ragCycleResult: ragCycles,
      waitForGraph: wfg,
      deadlockDetectionResult: detection,
      requestResult: null,
      requestVector: new Array(newState.resourceCount).fill(0),
      simulationEvents: [
        ...prev.simulationEvents,
        `[ALLOCATION APPLIED] Request permanently granted and applied to system state.`,
      ],
    }));
  },

  runDetection: () => {
    const { state } = get();
    const detection = runDeadlockDetection(state);
    set((prev) => ({
      deadlockDetectionResult: detection,
      simulationEvents: [
        ...prev.simulationEvents,
        `[DETECTION] ${detection.isDeadlocked ? 'DEADLOCK DETECTED' : 'NO DEADLOCK'}: ${detection.explanation}`,
      ],
    }));
  },

  setPlaybackStep: (step: number) => {
    set({ playbackStep: step });
  },

  stepForward: () => {
    const { playbackStep, safetyResult } = get();
    const maxStep = Math.max(0, safetyResult.steps.length - 1);
    if (playbackStep < maxStep) {
      set({ playbackStep: playbackStep + 1 });
    }
  },

  stepBackward: () => {
    const { playbackStep } = get();
    if (playbackStep > 0) {
      set({ playbackStep: playbackStep - 1 });
    }
  },

  togglePlay: () => {
    set((prev) => ({ isPlaying: !prev.isPlaying }));
  },

  setPlaybackSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
  },

  setActiveTab: (tab: 'safety' | 'rag' | 'detection' | 'theory') => {
    set({ activeTab: tab });
  },

  resetToPreset: () => {
    const { activePresetId, loadPreset } = get();
    loadPreset(activePresetId);
  },
}));
