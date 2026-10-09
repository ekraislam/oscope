/**
 * OScope — Observatory Store & Multi-Lab Scenario Coordination Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useObservatoryStore } from '../state/useObservatoryStore';
import { useSchedulingStore } from '../state/useSchedulingStore';
import { useMemoryStore } from '../state/useMemoryStore';
import { useDeadlockStore } from '../state/useDeadlockStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { OBSERVATORY_SCENARIOS } from '../core/algorithms/observatory';

describe('useObservatoryStore & Multi-Lab Coordination', () => {
  beforeEach(() => {
    useObservatoryStore.getState().resetObservatory();
  });

  it('initializes with default dashboard tab, OVERVIEW subsystem, and tracked PID P1', () => {
    const state = useObservatoryStore.getState();
    expect(state.activeTab).toBe('dashboard');
    expect(state.selectedSubsystem).toBe('OVERVIEW');
    expect(state.trackedPid).toBe('P1');
    expect(state.eventModuleFilter).toBe('ALL');
    expect(state.eventSeverityFilter).toBe('ALL');
    expect(state.eventSearchQuery).toBe('');
  });

  it('updates tab, subsystem selection, filters, and search query', () => {
    const store = useObservatoryStore.getState();
    store.setActiveTab('topology');
    store.setSelectedSubsystem('MEMORY');
    store.setEventModuleFilter('MEMORY');
    store.setEventSeverityFilter('WARN');
    store.setEventSearchQuery('page fault');
    store.setTrackedPid('P2');

    const updated = useObservatoryStore.getState();
    expect(updated.activeTab).toBe('topology');
    expect(updated.selectedSubsystem).toBe('MEMORY');
    expect(updated.eventModuleFilter).toBe('MEMORY');
    expect(updated.eventSeverityFilter).toBe('WARN');
    expect(updated.eventSearchQuery).toBe('page fault');
    expect(updated.trackedPid).toBe('P2');
  });

  it('coordinates presets across subsystem stores when loading showcase scenarios', () => {
    const store = useObservatoryStore.getState();

    // 1. Load memory-pressure scenario
    store.loadScenario('scenario_memory_pressure');
    expect(useObservatoryStore.getState().activeScenarioId).toBe('scenario_memory_pressure');
    expect(useMemoryStore.getState().selectedReplacementAlgorithm).toBe('FIFO');

    // 2. Load resource-risk scenario
    store.loadScenario('scenario_resource_risk');
    expect(useObservatoryStore.getState().activeScenarioId).toBe('scenario_resource_risk');
    // Deadlock store should have loaded deadlock preset
    expect(useDeadlockStore.getState().state.processes.length).toBeGreaterThan(0);

    // 3. Load full-tour scenario
    store.loadScenario('tour_full_system');
    expect(useObservatoryStore.getState().activeScenarioId).toBe('tour_full_system');
    expect(useSchedulingStore.getState().selectedAlgorithm).toBe('SRTF_PREEMPTIVE');
    expect(useFileSystemStore.getState().state.totalBlocks).toBe(32);
  });

  it('resets observatory UI state gracefully', () => {
    const store = useObservatoryStore.getState();
    store.setSelectedSubsystem('CPU');
    store.setEventSearchQuery('dispatch');
    store.resetObservatory();

    const after = useObservatoryStore.getState();
    expect(after.selectedSubsystem).toBe('OVERVIEW');
    expect(after.eventSearchQuery).toBe('');
    expect(after.trackedPid).toBe('P1');
  });

  it('has 5 distinct predefined showcase scenarios with academic justifications', () => {
    expect(OBSERVATORY_SCENARIOS.length).toBe(5);
    const ids = OBSERVATORY_SCENARIOS.map((s) => s.id);
    expect(ids).toContain('tour_full_system');
    expect(ids).toContain('scenario_cpu_intensive');
    expect(ids).toContain('scenario_memory_pressure');
    expect(ids).toContain('scenario_resource_risk');
    expect(ids).toContain('scenario_storage_fragmentation');

    for (const sc of OBSERVATORY_SCENARIOS) {
      expect(sc.name.length).toBeGreaterThan(0);
      expect(sc.description.length).toBeGreaterThan(0);
      expect(sc.educationalFocus.length).toBeGreaterThan(0);
    }
  });
});
