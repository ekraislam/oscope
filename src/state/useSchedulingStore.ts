/**
 * OScope — CPU Scheduling Laboratory Zustand Store
 * Orchestrates workload definitions, algorithm execution, comparison matrix, and step-by-step playback.
 */

import { create } from 'zustand';
import type { ProcessInput, SchedulingResult, SchedulingOptions } from '../core/models';
import {
  type SchedulerType,
  runFCFS,
  runSJFNonPreemptive,
  runSRTFPreemptive,
  runPriorityNonPreemptive,
  runPriorityPreemptive,
  runRoundRobin,
  compareAllSchedulers,
  type SchedulingComparisonResult,
  SCHEDULING_PRESETS,
} from '../core/algorithms/scheduling';
import { validateProcessInput } from '../core/utils/validation';

export interface SchedulingStoreState {
  // Workload definition
  workload: ProcessInput[];
  selectedAlgorithm: SchedulerType;
  options: SchedulingOptions;

  // Active computation results
  result: SchedulingResult | null;
  comparisonResult: SchedulingComparisonResult | null;

  // Step-by-step playback state
  currentSnapshotIndex: number;
  isPlaying: boolean;
  activeTab: 'timeline' | 'comparison' | 'theory';

  // Actions
  setAlgorithm: (algo: SchedulerType) => void;
  setQuantum: (quantum: number) => void;
  setContextSwitchCost: (cost: number) => void;
  setPriorityType: (type: 'LOWER_NUMBER_HIGHER_PRIORITY' | 'HIGHER_NUMBER_HIGHER_PRIORITY') => void;
  addProcess: (proc: ProcessInput) => { success: boolean; error?: string };
  updateProcess: (pid: string, updated: Partial<ProcessInput>) => { success: boolean; error?: string };
  removeProcess: (pid: string) => void;
  clearWorkload: () => void;
  loadPreset: (presetId: string) => void;
  runSimulation: () => void;
  runComparison: () => void;
  goToSnapshot: (index: number) => void;
  stepForward: () => void;
  stepBack: () => void;
  resetPlayback: () => void;
  setActiveTab: (tab: 'timeline' | 'comparison' | 'theory') => void;
}

export const useSchedulingStore = create<SchedulingStoreState>((set, get) => {
  // Default initial workload: Classic textbook 4-process set
  const initialWorkload: ProcessInput[] = [
    { pid: 'P1', name: 'Task Alpha', arrivalTime: 0, burstTime: 7, priority: 2 },
    { pid: 'P2', name: 'Task Beta', arrivalTime: 2, burstTime: 4, priority: 1 },
    { pid: 'P3', name: 'Task Gamma', arrivalTime: 4, burstTime: 1, priority: 3 },
    { pid: 'P4', name: 'Task Delta', arrivalTime: 5, burstTime: 4, priority: 2 },
  ];

  const defaultOptions: SchedulingOptions = {
    quantum: 2,
    contextSwitchCost: 0,
    priorityType: 'LOWER_NUMBER_HIGHER_PRIORITY',
  };

  function computeResultFor(algo: SchedulerType, wl: readonly ProcessInput[], opts: SchedulingOptions): SchedulingResult {
    switch (algo) {
      case 'FCFS':
        return runFCFS(wl, opts);
      case 'SJF_NON_PREEMPTIVE':
        return runSJFNonPreemptive(wl, opts);
      case 'SRTF_PREEMPTIVE':
        return runSRTFPreemptive(wl, opts);
      case 'PRIORITY_NON_PREEMPTIVE':
        return runPriorityNonPreemptive(wl, opts);
      case 'PRIORITY_PREEMPTIVE':
        return runPriorityPreemptive(wl, opts);
      case 'ROUND_ROBIN':
        return runRoundRobin(wl, opts);
    }
  }

  const initialResult = computeResultFor('FCFS', initialWorkload, defaultOptions);

  return {
    workload: initialWorkload,
    selectedAlgorithm: 'FCFS',
    options: defaultOptions,
    result: initialResult,
    comparisonResult: null,
    currentSnapshotIndex: 0,
    isPlaying: false,
    activeTab: 'timeline',

    setAlgorithm: (algo) => {
      set({ selectedAlgorithm: algo });
      get().runSimulation();
    },

    setQuantum: (quantum) => {
      if (quantum <= 0) return;
      set((s) => ({ options: { ...s.options, quantum } }));
      get().runSimulation();
    },

    setContextSwitchCost: (cost) => {
      if (cost < 0) return;
      set((s) => ({ options: { ...s.options, contextSwitchCost: cost } }));
      get().runSimulation();
    },

    setPriorityType: (type) => {
      set((s) => ({ options: { ...s.options, priorityType: type } }));
      get().runSimulation();
    },

    addProcess: (proc) => {
      const state = get();
      const validation = validateProcessInput(proc);
      if (!validation.valid) {
        return { success: false, error: validation.errors[0] };
      }
      if (state.workload.some((p) => p.pid === proc.pid.trim())) {
        return { success: false, error: `Process PID "${proc.pid}" already exists in workload` };
      }

      const updated = [...state.workload, proc];
      set({ workload: updated });
      get().runSimulation();
      return { success: true };
    },

    updateProcess: (pid, updated) => {
      const state = get();
      const targetIdx = state.workload.findIndex((p) => p.pid === pid);
      if (targetIdx === -1) {
        return { success: false, error: `Process ${pid} not found` };
      }

      const merged: ProcessInput = {
        ...state.workload[targetIdx],
        ...updated,
      };

      const validation = validateProcessInput(merged);
      if (!validation.valid) {
        return { success: false, error: validation.errors[0] };
      }

      const updatedWorkload = [...state.workload];
      updatedWorkload[targetIdx] = merged;
      set({ workload: updatedWorkload });
      get().runSimulation();
      return { success: true };
    },

    removeProcess: (pid) => {
      set((s) => ({ workload: s.workload.filter((p) => p.pid !== pid) }));
      get().runSimulation();
    },

    clearWorkload: () => {
      set({ workload: [], result: null, comparisonResult: null, currentSnapshotIndex: 0 });
    },

    loadPreset: (presetId) => {
      const preset = SCHEDULING_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      const newOptions: SchedulingOptions = {
        ...get().options,
        ...preset.recommendedOptions,
      };

      set({
        workload: [...preset.processes],
        selectedAlgorithm: preset.recommendedAlgorithm,
        options: newOptions,
        activeTab: 'timeline',
      });

      get().runSimulation();
    },

    runSimulation: () => {
      const state = get();
      if (state.workload.length === 0) {
        set({ result: null, comparisonResult: null, currentSnapshotIndex: 0 });
        return;
      }

      const result = computeResultFor(state.selectedAlgorithm, state.workload, state.options);
      set({
        result,
        currentSnapshotIndex: 0,
      });

      // If comparison view is active, update comparison too
      if (state.activeTab === 'comparison') {
        get().runComparison();
      }
    },

    runComparison: () => {
      const state = get();
      if (state.workload.length === 0) return;
      const comparison = compareAllSchedulers(state.workload, state.options);
      set({ comparisonResult: comparison });
    },

    goToSnapshot: (index) => {
      const result = get().result;
      if (!result || !result.stepSnapshots || result.stepSnapshots.length === 0) return;
      const clamped = Math.max(0, Math.min(index, result.stepSnapshots.length - 1));
      set({ currentSnapshotIndex: clamped });
    },

    stepForward: () => {
      const state = get();
      if (!state.result) return;
      const maxIndex = state.result.stepSnapshots.length - 1;
      if (state.currentSnapshotIndex < maxIndex) {
        set({ currentSnapshotIndex: state.currentSnapshotIndex + 1 });
      }
    },

    stepBack: () => {
      const state = get();
      if (state.currentSnapshotIndex > 0) {
        set({ currentSnapshotIndex: state.currentSnapshotIndex - 1 });
      }
    },

    resetPlayback: () => {
      set({ currentSnapshotIndex: 0, isPlaying: false });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
      if (tab === 'comparison') {
        get().runComparison();
      }
    },
  };
});
