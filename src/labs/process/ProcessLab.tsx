import React, { useState } from 'react';
import { useProcessStore } from '../../state/useProcessStore';
import { LabLayout } from '../../components/layout';
import { Button, StatusBadge, ExplanationCard } from '../../components/common';
import { StateTransitionDiagram } from './components/StateTransitionDiagram';
import { PCBInspector } from './components/PCBInspector';
import { ProcessQueuesView } from './components/ProcessQueuesView';
import { ProcessTable } from './components/ProcessTable';
import { TransitionControlDeck } from './components/TransitionControlDeck';
import { ProcessEventLog } from './components/ProcessEventLog';
import { EducationalConceptPanel } from './components/EducationalConceptPanel';
import { ProcessCreationModal } from './components/ProcessCreationModal';
import { formatSimulationTime } from '../../core/utils/formatters';
import { useDocumentTitle } from '../../core/utils/useDocumentTitle';
import { Link } from 'wouter';
import { Plus, Sparkles, Clock, RotateCcw, BookOpen } from 'lucide-react';
import type { ProcessState } from '../../core/models/process';

export const ProcessLab: React.FC = () => {
  useDocumentTitle('Process Lifecycle & PCB Laboratory', 'Explore OS process states, PCB hardware contexts, and dispatch transitions.');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Store bindings
  const processes = useProcessStore((s) => s.processes);
  const selectedPid = useProcessStore((s) => s.selectedPid);
  const runningPid = useProcessStore((s) => s.runningPid);
  const readyQueue = useProcessStore((s) => s.readyQueue);
  const waitingQueue = useProcessStore((s) => s.waitingQueue);
  const terminatedPids = useProcessStore((s) => s.terminatedPids);
  const events = useProcessStore((s) => s.events);
  const clock = useProcessStore((s) => s.clock);

  // Store actions
  const selectProcess = useProcessStore((s) => s.selectProcess);
  const createProcess = useProcessStore((s) => s.createProcess);
  const admitProcess = useProcessStore((s) => s.admitProcess);
  const dispatchProcess = useProcessStore((s) => s.dispatchProcess);
  const yieldProcess = useProcessStore((s) => s.yieldProcess);
  const blockProcess = useProcessStore((s) => s.blockProcess);
  const unblockProcess = useProcessStore((s) => s.unblockProcess);
  const terminateProcess = useProcessStore((s) => s.terminateProcess);
  const executeTick = useProcessStore((s) => s.executeTick);
  const resetLab = useProcessStore((s) => s.resetLab);
  const loadPresetWorkload = useProcessStore((s) => s.loadPresetWorkload);

  const processList = Object.values(processes);
  const selectedProcess = selectedPid ? processes[selectedPid] ?? null : null;
  const runningProcess = runningPid ? processes[runningPid] ?? null : null;

  // Calculate live state distribution counts
  const stateCounts: Record<ProcessState, number> = {
    NEW: processList.filter((p) => p.state === 'NEW').length,
    READY: readyQueue.length,
    RUNNING: runningPid ? 1 : 0,
    WAITING: waitingQueue.length,
    TERMINATED: terminatedPids.length,
  };

  return (
    <LabLayout
      title="Process Management & PCB Laboratory"
      description="Interactive process lifecycle observatory: execute state transitions, observe queue dynamics, and inspect hardware PCB registers."
      badge={<StatusBadge status={runningPid ? 'ACTIVE' : processList.length > 0 ? 'READY' : 'STANDBY'} size="sm" />}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-subdued)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            }}
          >
            <Clock size={14} color="var(--color-accent)" />
            <span>Clock:</span>
            <strong style={{ color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>
              {formatSimulationTime(clock.getCurrentTime())}
            </strong>
          </div>

          <Link href="/docs/process">
            <Button
              variant="outline"
              size="md"
              icon={<BookOpen size={16} />}
            >
              Theory Guide
            </Button>
          </Link>

          <Button
            variant="outline"
            size="md"
            icon={<Sparkles size={16} />}
            onClick={loadPresetWorkload}
          >
            Load Demo Preset
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Process
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={<RotateCcw size={16} />}
            onClick={resetLab}
            title="Reset Laboratory"
          >
            Reset
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%' }}>
        {/* 1. Transition Control Deck */}
        <TransitionControlDeck
          selectedProcess={selectedProcess}
          isRunningOccupied={runningPid !== null}
          onAdmit={admitProcess}
          onDispatch={dispatchProcess}
          onYield={yieldProcess}
          onBlock={blockProcess}
          onUnblock={unblockProcess}
          onTerminate={terminateProcess}
          onExecuteTick={executeTick}
          onReset={resetLab}
          onLoadPresets={loadPresetWorkload}
        />

        {/* 2. Visual State Machine */}
        <StateTransitionDiagram
          activeState={selectedProcess ? selectedProcess.state : null}
          stateCounts={stateCounts}
        />

        {/* 3. Real-Time OS Queues (CPU, Ready, Waiting, Terminated) */}
        <ProcessQueuesView
          runningProcess={runningProcess}
          readyQueue={readyQueue}
          waitingQueue={waitingQueue}
          terminatedPids={terminatedPids}
          processes={processes}
          selectedPid={selectedPid}
          onSelectProcess={selectProcess}
        />

        {/* 4. Academic Educational Hierarchy Card */}
        <ExplanationCard
          subsystem="PROCESS"
          title="Process Lifecycle & State Transition Invariants"
          what={
            runningProcess ? (
              <span>
                Process <strong>{runningProcess.pid}</strong> ({runningProcess.name}) is currently occupying the simulated CPU in <code>RUNNING</code> state.
              </span>
            ) : readyQueue.length > 0 ? (
              <span>
                CPU is idle with {readyQueue.length} process(es) queued in the <code>READY</code> queue awaiting scheduler dispatch.
              </span>
            ) : (
              <span>All simulated processes are either terminated or awaiting creation. Ready queue is empty.</span>
            )
          }
          why={
            runningProcess ? (
              <span>
                Process was dispatched by the OS short-term scheduler and is executing instructions until preemption, I/O request, or completion.
              </span>
            ) : readyQueue.length > 0 ? (
              <span>
                Process admission has placed executable jobs in memory; CPU requires explicit dispatch invocation or scheduler tick.
              </span>
            ) : (
              <span>Admit or create processes from the control deck to populate the Ready Queue.</span>
            )
          }
          result={
            runningProcess
              ? `PCB program counter advanced; remaining burst: ${runningProcess.remainingTime} ticks.`
              : readyQueue.length > 0
              ? `Head of Ready queue: ${readyQueue[0]}; prepared for immediate dispatch.`
              : 'CPU execution suspended; awaiting runnable processes.'
          }
        />

        {/* 5. Split Deck: Process Table (Left) + PCB & Educational Panel (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(350px, 1.4fr) minmax(320px, 1fr)',
            gap: 'var(--space-5)',
            alignItems: 'start',
          }}
          className="stack-mobile"
        >
          {/* Left Column: Process Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <ProcessTable
              processes={processList}
              selectedPid={selectedPid}
              onSelectProcess={selectProcess}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          </div>

          {/* Right Column: PCB Inspector & Academic Theory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <PCBInspector process={selectedProcess} />
            <EducationalConceptPanel currentState={selectedProcess ? selectedProcess.state : null} />
          </div>
        </div>

        {/* 6. Kernel Syslog / Event Stream */}
        <ProcessEventLog events={events} />
      </div>

      {/* Creation Modal */}
      <ProcessCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createProcess}
      />
    </LabLayout>
  );
};
