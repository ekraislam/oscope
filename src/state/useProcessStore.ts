/**
 * OScope — Process Management Laboratory Zustand Store
 * Bridges React UI with the pure domain process state machine and simulation primitives.
 */

import { create } from 'zustand';
import type { ProcessControlBlock, ProcessInput } from '../core/models/process';
import { createProcessControlBlock } from '../core/models/process';
import type { SimulationEvent } from '../core/models/simulation';
import { createSimulationEvent, createSimulationSnapshot } from '../core/models/simulation';
import { validateProcessInput } from '../core/utils/validation';
import {
  transitionProcess,
  executeRunningProcessTick,
  type ProcessTransitionResult,
} from '../core/process/processTransitions';
import { VirtualClock } from '../core/simulation/VirtualClock';
import { SimulationTimeline } from '../core/simulation/SimulationTimeline';

export interface WaitingProcessEntry {
  readonly pid: string;
  readonly remainingWaitTicks: number;
  readonly device: string;
}

export interface ProcessLabSnapshotState {
  readonly processes: Record<string, ProcessControlBlock>;
  readonly runningPid: string | null;
  readonly readyQueue: string[];
  readonly waitingQueue: WaitingProcessEntry[];
  readonly terminatedPids: string[];
  readonly newPids: string[];
  readonly selectedPid: string | null;
}

export interface ProcessStoreState {
  // Subsystem State
  processes: Record<string, ProcessControlBlock>;
  selectedPid: string | null;
  runningPid: string | null;
  readyQueue: string[];
  waitingQueue: WaitingProcessEntry[];
  terminatedPids: string[];
  newPids: string[];
  events: SimulationEvent[];

  // Simulation Engines
  clock: VirtualClock;
  timeline: SimulationTimeline<ProcessLabSnapshotState>;

  // Actions
  selectProcess: (pid: string | null) => void;
  createProcess: (input: ProcessInput) => { success: boolean; errors?: readonly string[] };
  admitProcess: (pid: string) => ProcessTransitionResult;
  dispatchProcess: (pid: string) => ProcessTransitionResult;
  blockProcess: (pid: string, ioDuration?: number, device?: string) => ProcessTransitionResult;
  unblockProcess: (pid: string) => ProcessTransitionResult;
  yieldProcess: (pid: string) => ProcessTransitionResult;
  terminateProcess: (pid: string) => ProcessTransitionResult;
  executeTick: () => { executedPid: string | null; completed: boolean; blockedForIO: boolean };
  resetLab: () => void;
  loadPresetWorkload: () => void;
}

export const useProcessStore = create<ProcessStoreState>((set, get) => {
  const clock = new VirtualClock(0);
  const timeline = new SimulationTimeline<ProcessLabSnapshotState>();

  function takeSnapshot(description: string, event?: SimulationEvent) {
    const state = get();
    const snapshotState: ProcessLabSnapshotState = {
      processes: { ...state.processes },
      runningPid: state.runningPid,
      readyQueue: [...state.readyQueue],
      waitingQueue: [...state.waitingQueue],
      terminatedPids: [...state.terminatedPids],
      newPids: [...state.newPids],
      selectedPid: state.selectedPid,
    };

    timeline.record(
      createSimulationSnapshot({
        simulationTime: clock.getCurrentTime(),
        snapshotIndex: timeline.size(),
        subsystemState: snapshotState,
        description,
        event,
      })
    );
  }

  return {
    processes: {},
    selectedPid: null,
    runningPid: null,
    readyQueue: [],
    waitingQueue: [],
    terminatedPids: [],
    newPids: [],
    events: [],
    clock,
    timeline,

    selectProcess: (pid) => {
      const state = get();
      if (pid === null || state.processes[pid]) {
        set({ selectedPid: pid });
      }
    },

    createProcess: (input) => {
      const state = get();

      // Validate single process input
      const validation = validateProcessInput(input);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      // Check unique PID invariant
      if (state.processes[input.pid]) {
        return {
          success: false,
          errors: [`Duplicate process PID detected: "${input.pid}" already exists in the system`],
        };
      }

      const pcb = createProcessControlBlock(input);
      const currentTime = clock.getCurrentTime();

      const creationEvent = createSimulationEvent({
        timestamp: currentTime,
        type: 'PROCESS_CREATED',
        sourceModule: 'KERNEL',
        severity: 'INFO',
        description: `Process ${pcb.pid} ("${pcb.name}") created with burst ${pcb.burstTime}ms`,
        details: { pid: pcb.pid, burstTime: pcb.burstTime, priority: pcb.priority },
      });

      set((prev) => ({
        processes: { ...prev.processes, [pcb.pid]: pcb },
        newPids: [...prev.newPids, pcb.pid],
        selectedPid: prev.selectedPid === null ? pcb.pid : prev.selectedPid,
        events: [creationEvent, ...prev.events],
      }));

      takeSnapshot(`Process ${pcb.pid} created`, creationEvent);
      return { success: true };
    },

    admitProcess: (pid) => {
      const state = get();
      const proc = state.processes[pid];
      if (!proc) {
        return {
          success: false,
          previousState: 'NEW',
          nextState: 'NEW',
          updatedProcess: proc,
          event: null,
          reason: `Process ${pid} not found`,
        };
      }

      const result = transitionProcess(proc, 'READY', clock.getCurrentTime());
      if (!result.success) return result;

      set((prev) => ({
        processes: { ...prev.processes, [pid]: result.updatedProcess },
        newPids: prev.newPids.filter((p) => p !== pid),
        readyQueue: [...prev.readyQueue, pid],
        events: result.event ? [result.event, ...prev.events] : prev.events,
      }));

      takeSnapshot(`Process ${pid} admitted to Ready queue`, result.event ?? undefined);
      return result;
    },

    dispatchProcess: (pid) => {
      const state = get();
      const proc = state.processes[pid];
      if (!proc) {
        return {
          success: false,
          previousState: 'READY',
          nextState: 'READY',
          updatedProcess: proc,
          event: null,
          reason: `Process ${pid} not found`,
        };
      }

      // Invariant: Single-core execution - cannot dispatch if another process is running
      if (state.runningPid !== null) {
        return {
          success: false,
          previousState: proc.state,
          nextState: proc.state,
          updatedProcess: proc,
          event: null,
          reason: `CPU is currently occupied by process ${state.runningPid}. Must yield, block, or terminate before dispatching.`,
        };
      }

      const result = transitionProcess(proc, 'RUNNING', clock.getCurrentTime());
      if (!result.success) return result;

      set((prev) => ({
        processes: { ...prev.processes, [pid]: result.updatedProcess },
        runningPid: pid,
        readyQueue: prev.readyQueue.filter((p) => p !== pid),
        events: result.event ? [result.event, ...prev.events] : prev.events,
      }));

      takeSnapshot(`Process ${pid} dispatched to CPU`, result.event ?? undefined);
      return result;
    },

    blockProcess: (pid, ioDuration = 3, device = 'Disk Drive') => {
      const state = get();
      const proc = state.processes[pid];
      if (!proc) {
        return {
          success: false,
          previousState: 'RUNNING',
          nextState: 'RUNNING',
          updatedProcess: proc,
          event: null,
          reason: `Process ${pid} not found`,
        };
      }

      const result = transitionProcess(proc, 'WAITING', clock.getCurrentTime(), {
        deviceName: device,
        ioDuration,
      });
      if (!result.success) return result;

      set((prev) => ({
        processes: { ...prev.processes, [pid]: result.updatedProcess },
        runningPid: prev.runningPid === pid ? null : prev.runningPid,
        waitingQueue: [...prev.waitingQueue, { pid, remainingWaitTicks: ioDuration, device }],
        events: result.event ? [result.event, ...prev.events] : prev.events,
      }));

      takeSnapshot(`Process ${pid} blocked on I/O (${device})`, result.event ?? undefined);
      return result;
    },

    unblockProcess: (pid) => {
      const state = get();
      const proc = state.processes[pid];
      if (!proc) {
        return {
          success: false,
          previousState: 'WAITING',
          nextState: 'WAITING',
          updatedProcess: proc,
          event: null,
          reason: `Process ${pid} not found`,
        };
      }

      const result = transitionProcess(proc, 'READY', clock.getCurrentTime());
      if (!result.success) return result;

      set((prev) => ({
        processes: { ...prev.processes, [pid]: result.updatedProcess },
        waitingQueue: prev.waitingQueue.filter((w) => w.pid !== pid),
        readyQueue: [...prev.readyQueue, pid],
        events: result.event ? [result.event, ...prev.events] : prev.events,
      }));

      takeSnapshot(`Process ${pid} I/O finished, returned to Ready`, result.event ?? undefined);
      return result;
    },

    yieldProcess: (pid) => {
      const state = get();
      const proc = state.processes[pid];
      if (!proc) {
        return {
          success: false,
          previousState: 'RUNNING',
          nextState: 'RUNNING',
          updatedProcess: proc,
          event: null,
          reason: `Process ${pid} not found`,
        };
      }

      const result = transitionProcess(proc, 'READY', clock.getCurrentTime());
      if (!result.success) return result;

      set((prev) => ({
        processes: { ...prev.processes, [pid]: result.updatedProcess },
        runningPid: prev.runningPid === pid ? null : prev.runningPid,
        readyQueue: [...prev.readyQueue, pid],
        events: result.event ? [result.event, ...prev.events] : prev.events,
      }));

      takeSnapshot(`Process ${pid} yielded to Ready queue`, result.event ?? undefined);
      return result;
    },

    terminateProcess: (pid) => {
      const state = get();
      const proc = state.processes[pid];
      if (!proc) {
        return {
          success: false,
          previousState: 'RUNNING',
          nextState: 'RUNNING',
          updatedProcess: proc,
          event: null,
          reason: `Process ${pid} not found`,
        };
      }

      const result = transitionProcess(proc, 'TERMINATED', clock.getCurrentTime());
      if (!result.success) return result;

      set((prev) => ({
        processes: { ...prev.processes, [pid]: result.updatedProcess },
        runningPid: prev.runningPid === pid ? null : prev.runningPid,
        readyQueue: prev.readyQueue.filter((p) => p !== pid),
        waitingQueue: prev.waitingQueue.filter((w) => w.pid !== pid),
        newPids: prev.newPids.filter((p) => p !== pid),
        terminatedPids: [...prev.terminatedPids, pid],
        events: result.event ? [result.event, ...prev.events] : prev.events,
      }));

      takeSnapshot(`Process ${pid} terminated`, result.event ?? undefined);
      return result;
    },

    executeTick: () => {
      const state = get();
      clock.stepForward(1);
      const currentTime = clock.getCurrentTime();

      let executedPid: string | null = null;
      let completed = false;
      let blockedForIO = false;
      let updatedProcesses = { ...state.processes };
      let newRunningPid = state.runningPid;
      let newReadyQueue = [...state.readyQueue];
      let newTerminatedPids = [...state.terminatedPids];
      let newWaitingQueue: WaitingProcessEntry[] = [];
      const newEvents: SimulationEvent[] = [];

      // 1. Advance I/O waiting timers
      for (const item of state.waitingQueue) {
        const remaining = item.remainingWaitTicks - 1;
        if (remaining <= 0) {
          // I/O completed! Transition WAITING -> READY
          const proc = updatedProcesses[item.pid];
          if (proc) {
            const transResult = transitionProcess(proc, 'READY', currentTime);
            if (transResult.success) {
              updatedProcesses[item.pid] = transResult.updatedProcess;
              newReadyQueue.push(item.pid);
              if (transResult.event) newEvents.push(transResult.event);
            }
          }
        } else {
          newWaitingQueue.push({ ...item, remainingWaitTicks: remaining });
        }
      }

      // 2. Execute 1 tick on currently running process (if one exists)
      if (state.runningPid && updatedProcesses[state.runningPid]) {
        const currentProc = updatedProcesses[state.runningPid];
        executedPid = state.runningPid;

        const tickResult = executeRunningProcessTick(currentProc);
        updatedProcesses[state.runningPid] = tickResult.updatedProcess;

        if (tickResult.isCompleted) {
          // Process burst reached 0 -> auto-terminate
          completed = true;
          const termResult = transitionProcess(tickResult.updatedProcess, 'TERMINATED', currentTime);
          if (termResult.success) {
            updatedProcesses[state.runningPid] = termResult.updatedProcess;
            newTerminatedPids.push(state.runningPid);
            newRunningPid = null;
            if (termResult.event) newEvents.push(termResult.event);
          }
        } else if (tickResult.shouldTriggerIO && tickResult.triggeredIOBurst) {
          // Process hit an I/O burst point -> transition RUNNING -> WAITING
          blockedForIO = true;
          const ioDuration = tickResult.triggeredIOBurst.duration;
          const ioDevice = tickResult.triggeredIOBurst.device ?? 'Storage I/O';

          const blockResult = transitionProcess(tickResult.updatedProcess, 'WAITING', currentTime, {
            deviceName: ioDevice,
            ioDuration,
          });

          if (blockResult.success) {
            updatedProcesses[state.runningPid] = blockResult.updatedProcess;
            newWaitingQueue.push({
              pid: state.runningPid,
              remainingWaitTicks: ioDuration,
              device: ioDevice,
            });
            newRunningPid = null;
            if (blockResult.event) newEvents.push(blockResult.event);
          }
        }
      }

      set((prev) => ({
        processes: updatedProcesses,
        runningPid: newRunningPid,
        readyQueue: newReadyQueue,
        waitingQueue: newWaitingQueue,
        terminatedPids: newTerminatedPids,
        events: [...newEvents, ...prev.events],
      }));

      takeSnapshot(`Clock advanced to t=${currentTime}ms`);
      return { executedPid, completed, blockedForIO };
    },

    resetLab: () => {
      clock.reset();
      timeline.clear();
      set({
        processes: {},
        selectedPid: null,
        runningPid: null,
        readyQueue: [],
        waitingQueue: [],
        terminatedPids: [],
        newPids: [],
        events: [],
      });
      takeSnapshot('Process Laboratory Reset');
    },

    loadPresetWorkload: () => {
      const state = get();
      state.resetLab();

      const presets: ProcessInput[] = [
        {
          pid: 'P1',
          name: 'Compiler (CPU-Bound)',
          arrivalTime: 0,
          burstTime: 6,
          priority: 1,
        },
        {
          pid: 'P2',
          name: 'Database Engine (I/O-Bound)',
          arrivalTime: 1,
          burstTime: 5,
          priority: 2,
          ioBursts: [{ startAtCPUTime: 2, duration: 3, device: 'Disk Storage' }],
        },
        {
          pid: 'P3',
          name: 'Telemetry Monitor (Short Burst)',
          arrivalTime: 2,
          burstTime: 3,
          priority: 3,
        },
        {
          pid: 'P4',
          name: 'Background Worker',
          arrivalTime: 3,
          burstTime: 4,
          priority: 2,
        },
      ];

      for (const p of presets) {
        state.createProcess(p);
      }

      // Automatically admit P1 and P2 to READY for instant interactive demonstration
      state.admitProcess('P1');
      state.admitProcess('P2');
      state.selectProcess('P1');
    },
  };
});
