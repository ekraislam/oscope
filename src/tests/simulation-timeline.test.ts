import { describe, it, expect } from 'vitest';
import { SimulationTimeline } from '../core/simulation/SimulationTimeline';
import { createSimulationSnapshot } from '../core/models/simulation';

describe('SimulationTimeline', () => {
  it('initializes empty', () => {
    const timeline = new SimulationTimeline();
    expect(timeline.size()).toBe(0);
    expect(timeline.current()).toBeNull();
    expect(timeline.canStepBack()).toBe(false);
    expect(timeline.canStepForward()).toBe(false);
  });

  it('records sequential snapshots and advances current pointer', () => {
    const timeline = new SimulationTimeline<{ runningPid: string | null }>();

    const snap0 = createSimulationSnapshot({
      simulationTime: 0,
      snapshotIndex: 0,
      subsystemState: { runningPid: null },
      description: 'System Idle',
    });

    const snap1 = createSimulationSnapshot({
      simulationTime: 2,
      snapshotIndex: 1,
      subsystemState: { runningPid: 'P1' },
      description: 'P1 Dispatched',
    });

    timeline.record(snap0);
    expect(timeline.size()).toBe(1);
    expect(timeline.current()?.simulationTime).toBe(0);

    timeline.record(snap1);
    expect(timeline.size()).toBe(2);
    expect(timeline.current()?.simulationTime).toBe(2);
    expect(timeline.current()?.subsystemState.runningPid).toBe('P1');
  });

  it('navigates backward and forward along recorded history', () => {
    const timeline = new SimulationTimeline<number>();

    timeline.record(createSimulationSnapshot({ simulationTime: 0, snapshotIndex: 0, subsystemState: 10, description: 'Step 0' }));
    timeline.record(createSimulationSnapshot({ simulationTime: 1, snapshotIndex: 1, subsystemState: 20, description: 'Step 1' }));
    timeline.record(createSimulationSnapshot({ simulationTime: 2, snapshotIndex: 2, subsystemState: 30, description: 'Step 2' }));

    expect(timeline.current()?.subsystemState).toBe(30);
    expect(timeline.canStepBack()).toBe(true);
    expect(timeline.canStepForward()).toBe(false);

    // Step back
    const previous = timeline.stepBack();
    expect(previous?.subsystemState).toBe(20);
    expect(timeline.canStepForward()).toBe(true);

    // Step back again to index 0
    timeline.stepBack();
    expect(timeline.current()?.subsystemState).toBe(10);
    expect(timeline.canStepBack()).toBe(false);

    // Step forward
    timeline.stepForward();
    expect(timeline.current()?.subsystemState).toBe(20);
  });

  it('seeks directly to an index with goTo', () => {
    const timeline = new SimulationTimeline<string>();
    timeline.record(createSimulationSnapshot({ simulationTime: 0, snapshotIndex: 0, subsystemState: 'A', description: 'A' }));
    timeline.record(createSimulationSnapshot({ simulationTime: 1, snapshotIndex: 1, subsystemState: 'B', description: 'B' }));
    timeline.record(createSimulationSnapshot({ simulationTime: 2, snapshotIndex: 2, subsystemState: 'C', description: 'C' }));

    const seeked = timeline.goTo(1);
    expect(seeked?.subsystemState).toBe('B');
    expect(timeline.getCurrentIndex()).toBe(1);

    expect(timeline.goTo(99)).toBeNull(); // Out of bounds returns null
  });

  it('truncates future history when recording from a previous step (linear causality)', () => {
    const timeline = new SimulationTimeline<string>();
    timeline.record(createSimulationSnapshot({ simulationTime: 0, snapshotIndex: 0, subsystemState: 'A', description: 'A' }));
    timeline.record(createSimulationSnapshot({ simulationTime: 2, snapshotIndex: 1, subsystemState: 'B', description: 'B' }));
    timeline.record(createSimulationSnapshot({ simulationTime: 4, snapshotIndex: 2, subsystemState: 'C', description: 'C' }));

    // Step back to index 1 (t=2, 'B')
    timeline.goTo(1);

    // Record new state at t=3 ('D')
    timeline.record(createSimulationSnapshot({ simulationTime: 3, snapshotIndex: 2, subsystemState: 'D', description: 'D' }));

    expect(timeline.size()).toBe(3);
    expect(timeline.current()?.subsystemState).toBe('D');

    // 'C' at t=4 was overwritten/truncated
    const all = timeline.getAll();
    expect(all.map((s) => s.subsystemState)).toEqual(['A', 'B', 'D']);
  });

  it('enforces non-decreasing simulation time monotonicity', () => {
    const timeline = new SimulationTimeline<string>();
    timeline.record(createSimulationSnapshot({ simulationTime: 5, snapshotIndex: 0, subsystemState: 'A', description: 'A' }));

    expect(() => {
      timeline.record(createSimulationSnapshot({ simulationTime: 3, snapshotIndex: 1, subsystemState: 'B', description: 'B' }));
    }).toThrowError(/Timeline monotonicity violation/);
  });
});
