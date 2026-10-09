import { describe, it, expect, beforeEach } from 'vitest';
import { useProcessStore } from '../state/useProcessStore';

describe('useProcessStore Operations & Invariants', () => {
  beforeEach(() => {
    // Reset store before each test
    useProcessStore.getState().resetLab();
  });

  it('creates processes with validation and manages state queues', () => {
    const store = useProcessStore.getState();

    const result = store.createProcess({
      pid: 'P1',
      name: 'Compiler',
      arrivalTime: 0,
      burstTime: 5,
      priority: 1,
    });

    expect(result.success).toBe(true);

    const state = useProcessStore.getState();
    expect(state.processes.P1).toBeDefined();
    expect(state.newPids).toContain('P1');
    expect(state.selectedPid).toBe('P1');
    expect(state.events).toHaveLength(1);
    expect(state.events[0].type).toBe('PROCESS_CREATED');
  });

  it('rejects duplicate PIDs and preserves previous state', () => {
    const store = useProcessStore.getState();
    store.createProcess({ pid: 'P1', arrivalTime: 0, burstTime: 5 });

    const duplicateResult = store.createProcess({ pid: 'P1', arrivalTime: 1, burstTime: 3 });
    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.errors?.[0]).toContain('already exists');
  });

  it('admits process from NEW to READY queue', () => {
    const store = useProcessStore.getState();
    store.createProcess({ pid: 'P1', arrivalTime: 0, burstTime: 5 });

    const admitResult = store.admitProcess('P1');
    expect(admitResult.success).toBe(true);

    const state = useProcessStore.getState();
    expect(state.newPids).not.toContain('P1');
    expect(state.readyQueue).toContain('P1');
    expect(state.processes.P1.state).toBe('READY');
  });

  it('dispatches process from READY to RUNNING on CPU', () => {
    const store = useProcessStore.getState();
    store.createProcess({ pid: 'P1', arrivalTime: 0, burstTime: 5 });
    store.admitProcess('P1');

    const dispatchResult = store.dispatchProcess('P1');
    expect(dispatchResult.success).toBe(true);

    const state = useProcessStore.getState();
    expect(state.runningPid).toBe('P1');
    expect(state.readyQueue).not.toContain('P1');
    expect(state.processes.P1.state).toBe('RUNNING');
  });

  it('enforces Invariant 2: Cannot dispatch when CPU is already occupied', () => {
    const store = useProcessStore.getState();
    store.createProcess({ pid: 'P1', arrivalTime: 0, burstTime: 5 });
    store.createProcess({ pid: 'P2', arrivalTime: 0, burstTime: 4 });
    store.admitProcess('P1');
    store.admitProcess('P2');

    // Dispatch P1
    store.dispatchProcess('P1');
    expect(useProcessStore.getState().runningPid).toBe('P1');

    // Attempt to dispatch P2 while P1 is running -> should fail!
    const conflictResult = store.dispatchProcess('P2');
    expect(conflictResult.success).toBe(false);
    expect(conflictResult.reason).toContain('CPU is currently occupied by process P1');

    const state = useProcessStore.getState();
    expect(state.runningPid).toBe('P1');
    expect(state.readyQueue).toContain('P2');
    expect(state.processes.P2.state).toBe('READY');
  });

  it('handles I/O blocking, countdown decrement, and automatic unblocking', () => {
    const store = useProcessStore.getState();
    store.createProcess({ pid: 'P1', arrivalTime: 0, burstTime: 5 });
    store.admitProcess('P1');
    store.dispatchProcess('P1');

    // Block P1 for 2 ticks on Storage
    const blockResult = store.blockProcess('P1', 2, 'Storage Drive');
    expect(blockResult.success).toBe(true);

    let state = useProcessStore.getState();
    expect(state.runningPid).toBeNull();
    expect(state.waitingQueue).toHaveLength(1);
    expect(state.waitingQueue[0].pid).toBe('P1');
    expect(state.waitingQueue[0].remainingWaitTicks).toBe(2);

    // Tick 1
    store.executeTick();
    state = useProcessStore.getState();
    expect(state.waitingQueue[0].remainingWaitTicks).toBe(1);

    // Tick 2 -> I/O expires! P1 should automatically move to READY!
    store.executeTick();
    state = useProcessStore.getState();
    expect(state.waitingQueue).toHaveLength(0);
    expect(state.readyQueue).toContain('P1');
    expect(state.processes.P1.state).toBe('READY');
  });

  it('executes tick on running process, decrements burst, and auto-terminates at 0', () => {
    const store = useProcessStore.getState();
    store.createProcess({ pid: 'P1', arrivalTime: 0, burstTime: 2 });
    store.admitProcess('P1');
    store.dispatchProcess('P1');

    // Tick 1
    const t1 = store.executeTick();
    expect(t1.executedPid).toBe('P1');
    expect(t1.completed).toBe(false);
    expect(useProcessStore.getState().processes.P1.remainingTime).toBe(1);

    // Tick 2 -> Remaining becomes 0 -> auto-terminates!
    const t2 = store.executeTick();
    expect(t2.completed).toBe(true);

    const state = useProcessStore.getState();
    expect(state.runningPid).toBeNull();
    expect(state.terminatedPids).toContain('P1');
    expect(state.processes.P1.state).toBe('TERMINATED');
    expect(state.processes.P1.remainingTime).toBe(0);
  });

  it('loads preset workload and resets cleanly', () => {
    const store = useProcessStore.getState();
    store.loadPresetWorkload();

    let state = useProcessStore.getState();
    expect(Object.keys(state.processes)).toHaveLength(4);
    expect(state.readyQueue).toContain('P1');
    expect(state.readyQueue).toContain('P2');
    expect(state.newPids).toContain('P3');
    expect(state.newPids).toContain('P4');

    // Reset
    store.resetLab();
    state = useProcessStore.getState();
    expect(Object.keys(state.processes)).toHaveLength(0);
    expect(state.readyQueue).toHaveLength(0);
    expect(state.runningPid).toBeNull();
    expect(state.clock.getCurrentTime()).toBe(0);
  });
});
