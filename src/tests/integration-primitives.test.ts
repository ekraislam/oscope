import { describe, it, expect } from 'vitest';
import { VirtualClock } from '../core/simulation/VirtualClock';
import { EventQueue } from '../core/simulation/EventQueue';
import { SimulationTimeline } from '../core/simulation/SimulationTimeline';
import { createSimulationEvent, createSimulationSnapshot } from '../core/models/simulation';

interface KernelState {
  runningPid: string | null;
  activeProcessCount: number;
}

describe('Primitive Simulation Engine Integration (Section 31 Verification)', () => {
  it('orchestrates VirtualClock, EventQueue, and SimulationTimeline deterministically', () => {
    // 1. Initialize primitives
    const clock = new VirtualClock(0);
    const eventQueue = new EventQueue();
    const timeline = new SimulationTimeline<KernelState>();

    // 2. Schedule deterministic simulation events
    eventQueue.enqueue(
      createSimulationEvent({
        timestamp: 0,
        type: 'PROCESS_CREATED',
        sourceModule: 'CPU',
        description: 'Process P1 created and placed in Ready queue',
        details: { pid: 'P1' },
      })
    );

    eventQueue.enqueue(
      createSimulationEvent({
        timestamp: 2,
        type: 'PROCESS_DISPATCHED',
        sourceModule: 'CPU',
        description: 'Process P1 dispatched to CPU Core 0',
        details: { pid: 'P1' },
      })
    );

    eventQueue.enqueue(
      createSimulationEvent({
        timestamp: 5,
        type: 'PROCESS_TERMINATED',
        sourceModule: 'CPU',
        description: 'Process P1 finished CPU burst and terminated',
        details: { pid: 'P1' },
      })
    );

    expect(eventQueue.size()).toBe(3);

    // Initial state at t=0
    let currentState: KernelState = { runningPid: null, activeProcessCount: 0 };

    // Step 1: Clock at t=0
    const eventsAt0 = eventQueue.dequeueUpTo(clock.getCurrentTime());
    expect(eventsAt0).toHaveLength(1);
    expect(eventsAt0[0].type).toBe('PROCESS_CREATED');

    currentState = { runningPid: null, activeProcessCount: 1 };
    timeline.record(
      createSimulationSnapshot({
        simulationTime: clock.getCurrentTime(),
        snapshotIndex: 0,
        subsystemState: { ...currentState },
        description: eventsAt0[0].description,
        event: eventsAt0[0],
      })
    );

    // Step 2: Advance clock to t=2
    clock.stepForward(2);
    expect(clock.getCurrentTime()).toBe(2);

    const eventsAt2 = eventQueue.dequeueUpTo(clock.getCurrentTime());
    expect(eventsAt2).toHaveLength(1);
    expect(eventsAt2[0].type).toBe('PROCESS_DISPATCHED');

    currentState = { runningPid: 'P1', activeProcessCount: 1 };
    timeline.record(
      createSimulationSnapshot({
        simulationTime: clock.getCurrentTime(),
        snapshotIndex: 1,
        subsystemState: { ...currentState },
        description: eventsAt2[0].description,
        event: eventsAt2[0],
      })
    );

    // Step 3: Advance clock to t=5
    clock.stepForward(3);
    expect(clock.getCurrentTime()).toBe(5);

    const eventsAt5 = eventQueue.dequeueUpTo(clock.getCurrentTime());
    expect(eventsAt5).toHaveLength(1);
    expect(eventsAt5[0].type).toBe('PROCESS_TERMINATED');

    currentState = { runningPid: null, activeProcessCount: 0 };
    timeline.record(
      createSimulationSnapshot({
        simulationTime: clock.getCurrentTime(),
        snapshotIndex: 2,
        subsystemState: { ...currentState },
        description: eventsAt5[0].description,
        event: eventsAt5[0],
      })
    );

    // Verify all events were consumed
    expect(eventQueue.isEmpty()).toBe(true);
    expect(timeline.size()).toBe(3);

    // 4. Test Reversibility / Time-Travel Replay:
    // Rewind back to index 1 (t=2, when P1 was running)
    const snapshotAtT2 = timeline.stepBack();
    expect(snapshotAtT2?.simulationTime).toBe(2);
    expect(snapshotAtT2?.subsystemState.runningPid).toBe('P1');
    expect(snapshotAtT2?.event?.type).toBe('PROCESS_DISPATCHED');

    // Rewind back to index 0 (t=0, when P1 was just created)
    const snapshotAtT0 = timeline.stepBack();
    expect(snapshotAtT0?.simulationTime).toBe(0);
    expect(snapshotAtT0?.subsystemState.runningPid).toBeNull();
    expect(snapshotAtT0?.subsystemState.activeProcessCount).toBe(1);

    // Step forward again to index 2 (t=5, terminated)
    timeline.stepForward();
    const finalSnapshot = timeline.stepForward();
    expect(finalSnapshot?.simulationTime).toBe(5);
    expect(finalSnapshot?.subsystemState.activeProcessCount).toBe(0);
    expect(finalSnapshot?.event?.type).toBe('PROCESS_TERMINATED');
  });
});
