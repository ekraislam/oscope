/**
 * OScope — Central Observatory Zustand Store
 * Manages dashboard view modes, event filtering/search, subsystem selection,
 * process correlation tracking, and showcase scenario orchestration.
 */

import { create } from 'zustand';
import { OBSERVATORY_SCENARIOS } from '../core/algorithms/observatory';
import { useSchedulingStore } from './useSchedulingStore';
import { useMemoryStore } from './useMemoryStore';
import { useDeadlockStore } from './useDeadlockStore';
import { useFileSystemStore } from './useFileSystemStore';

export type ObservatoryTab = 'dashboard' | 'topology' | 'events' | 'inspector' | 'theory';
export type SubsystemIdentifier = 'OVERVIEW' | 'PROCESS' | 'CPU' | 'MEMORY' | 'DEADLOCK' | 'FILESYSTEM';

export interface ObservatoryStoreState {
  // Navigation & View Mode
  activeTab: ObservatoryTab;
  selectedSubsystem: SubsystemIdentifier;
  activeScenarioId: string;

  // Event Filtering & Search Controls
  eventModuleFilter: 'ALL' | 'PROCESS' | 'CPU' | 'MEMORY' | 'DEADLOCK' | 'FILESYSTEM';
  eventSeverityFilter: 'ALL' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  eventSearchQuery: string;
  retentionLimit: number;

  // Process Tracing & Correlation
  trackedPid: string | null;

  // Notification Banner
  notification: { message: string; severity: 'info' | 'success' | 'warning' | 'danger' } | null;

  // Actions
  setActiveTab: (tab: ObservatoryTab) => void;
  setSelectedSubsystem: (subsystem: SubsystemIdentifier) => void;
  setEventModuleFilter: (filter: 'ALL' | 'PROCESS' | 'CPU' | 'MEMORY' | 'DEADLOCK' | 'FILESYSTEM') => void;
  setEventSeverityFilter: (severity: 'ALL' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR') => void;
  setEventSearchQuery: (query: string) => void;
  setTrackedPid: (pid: string | null) => void;
  loadScenario: (scenarioId: string) => void;
  clearNotification: () => void;
  resetObservatory: () => void;
}

export const useObservatoryStore = create<ObservatoryStoreState>((set) => ({
  activeTab: 'dashboard',
  selectedSubsystem: 'OVERVIEW',
  activeScenarioId: OBSERVATORY_SCENARIOS[0].id,

  eventModuleFilter: 'ALL',
  eventSeverityFilter: 'ALL',
  eventSearchQuery: '',
  retentionLimit: 100,

  trackedPid: 'P1',
  notification: null,

  setActiveTab: (tab: ObservatoryTab) => set({ activeTab: tab }),

  setSelectedSubsystem: (subsystem: SubsystemIdentifier) => set({ selectedSubsystem: subsystem }),

  setEventModuleFilter: (filter) => set({ eventModuleFilter: filter }),

  setEventSeverityFilter: (severity) => set({ eventSeverityFilter: severity }),

  setEventSearchQuery: (query) => set({ eventSearchQuery: query }),

  setTrackedPid: (pid) => set({ trackedPid: pid }),

  loadScenario: (scenarioId: string) => {
    const scenario = OBSERVATORY_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    try {
      // Coordinate presets across subsystem stores safely
      if (scenario.actions.schedulingPresetId) {
        useSchedulingStore.getState().loadPreset(scenario.actions.schedulingPresetId);
      }
      if (scenario.actions.memoryPresetId) {
        useMemoryStore.getState().loadPreset(scenario.actions.memoryPresetId);
      }
      if (scenario.actions.deadlockPresetId) {
        useDeadlockStore.getState().loadPreset(scenario.actions.deadlockPresetId);
      }
      if (scenario.actions.filesystemPresetId) {
        useFileSystemStore.getState().loadPreset(scenario.actions.filesystemPresetId);
      }

      set({
        activeScenarioId: scenario.id,
        notification: {
          message: `Loaded scenario: "${scenario.name}". Subsystems coordinated for demonstration.`,
          severity: 'info',
        },
      });
    } catch (err: any) {
      set({
        notification: {
          message: `Failed to load scenario: ${err?.message ?? 'Unknown error'}`,
          severity: 'danger',
        },
      });
    }
  },

  clearNotification: () => set({ notification: null }),

  resetObservatory: () =>
    set({
      selectedSubsystem: 'OVERVIEW',
      eventModuleFilter: 'ALL',
      eventSeverityFilter: 'ALL',
      eventSearchQuery: '',
      trackedPid: 'P1',
      notification: {
        message: 'Observatory telemetry view reset.',
        severity: 'info',
      },
    }),
}));
