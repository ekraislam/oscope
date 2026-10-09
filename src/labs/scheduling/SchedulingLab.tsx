import React, { useState } from 'react';
import { Cpu, BarChart3, Clock, BookOpen, Scale } from 'lucide-react';
import { LabLayout } from '../../components/layout';
import { Button, StatusBadge, ExplanationCard, EmptyState } from '../../components/common';
import { useSchedulingStore } from '../../state';
import { useDocumentTitle } from '../../core/utils/useDocumentTitle';
import {
  GanttChart,
  WorkloadEditor,
  AlgorithmSelector,
  DecisionTracePanel,
  MetricsSummaryDeck,
  FairComparisonView,
  SchedulingTheoryPanel,
} from './components';

export const SchedulingLab: React.FC = () => {
  useDocumentTitle('CPU Scheduling Laboratory', 'Interactive Gantt charts, context-switch metrics, and comparisons across 6 CPU schedulers.');

  const {
    workload,
    selectedAlgorithm,
    options,
    result,
    comparisonResult,
    currentSnapshotIndex,
    activeTab,
    setAlgorithm,
    setQuantum,
    setContextSwitchCost,
    setPriorityType,
    addProcess,
    updateProcess,
    removeProcess,
    clearWorkload,
    loadPreset,
    goToSnapshot,
    stepForward,
    stepBack,
    resetPlayback,
    setActiveTab,
    runComparison,
  } = useSchedulingStore();

  const [selectedPid, setSelectedPid] = useState<string | null>(null);

  // Compute current playback time from snapshot index
  const currentSnapshot = result?.stepSnapshots[currentSnapshotIndex];
  const currentPlaybackTime = currentSnapshot?.time ?? 0;

  const handleSwitchTab = (tab: 'timeline' | 'comparison' | 'theory') => {
    setActiveTab(tab);
    if (tab === 'comparison' && !comparisonResult) {
      runComparison();
    }
  };

  return (
    <LabLayout
      title="CPU Scheduling Laboratory"
      description="Deterministic execution of FCFS, SJF, SRTF, Priority (Non-Preemptive & Preemptive), and Round Robin schedulers with Gantt charts, context-switch accounting, step decision traces, and timing metric analysis."
      badge={<StatusBadge status={result ? 'ACTIVE' : 'STANDBY'} size="sm" />}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant={activeTab === 'timeline' ? 'primary' : 'outline'}
            size="md"
            icon={<Clock size={16} />}
            onClick={() => handleSwitchTab('timeline')}
          >
            Timeline & Trace
          </Button>
          <Button
            variant={activeTab === 'comparison' ? 'primary' : 'outline'}
            size="md"
            icon={<Scale size={16} />}
            onClick={() => handleSwitchTab('comparison')}
          >
            Fair Comparison
          </Button>
          <Button
            variant={activeTab === 'theory' ? 'primary' : 'outline'}
            size="md"
            icon={<BookOpen size={16} />}
            onClick={() => handleSwitchTab('theory')}
          >
            Theory & Concepts
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Top Algorithm Selector & Config Bar */}
        <AlgorithmSelector
          selectedAlgorithm={selectedAlgorithm}
          options={options}
          onSelectAlgorithm={setAlgorithm}
          onUpdateQuantum={setQuantum}
          onUpdateContextSwitchCost={setContextSwitchCost}
          onUpdatePriorityType={setPriorityType}
        />

        {/* Tab 1: Timeline & Execution */}
        {activeTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Gantt Timeline */}
            <GanttChart
              gantt={result?.gantt ?? []}
              totalTime={result?.metrics.totalTime ?? 0}
              currentPlaybackTime={currentPlaybackTime}
              selectedPid={selectedPid}
              onSelectProcess={setSelectedPid}
            />

            {/* Decision Trace & Step Scrubber */}
            <DecisionTracePanel
              snapshots={result?.stepSnapshots ?? []}
              currentIndex={currentSnapshotIndex}
              onGoToSnapshot={goToSnapshot}
              onStepForward={stepForward}
              onStepBack={stepBack}
              onReset={resetPlayback}
            />

            {/* Academic Explanation Card */}
            {result && currentSnapshot && (
              <ExplanationCard
                subsystem="CPU"
                title={`Scheduling Step Analysis (t=${currentSnapshot.time} ms)`}
                what={
                  <span>
                    Dispatcher evaluated ready queue under <strong>{selectedAlgorithm}</strong> scheduler policy.
                    {currentSnapshot.runningPid ? (
                      <span> Selected <strong>{currentSnapshot.runningPid}</strong> for CPU execution.</span>
                    ) : (
                      <span> No runnable processes in ready queue; CPU entered <strong>IDLE</strong> state.</span>
                    )}
                  </span>
                }
                why={
                  <span>
                    {currentSnapshot.explanation ??
                      `Algorithm evaluated all arrived processes at time t=${currentSnapshot.time} and chose lowest metric under selected policy.`}
                  </span>
                }
                result={
                  currentSnapshot.runningPid
                    ? `PID ${currentSnapshot.runningPid} occupies virtual core until quantum expiration, preemption, or burst completion.`
                    : 'CPU cycle consumed as idle time; makespan clock advances.'
                }
              />
            )}

            {/* Two-Column Working Area: Workload Editor & Metrics Deck */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: 'var(--space-5)',
                alignItems: 'start',
              }}
              className="stack-mobile"
            >
              {/* Left Column: Workload Management */}
              <WorkloadEditor
                workload={workload}
                onAddProcess={addProcess}
                onUpdateProcess={updateProcess}
                onRemoveProcess={removeProcess}
                onClearWorkload={clearWorkload}
                onLoadPreset={loadPreset}
                selectedPid={selectedPid}
                onSelectProcess={setSelectedPid}
              />

              {/* Right Column: Execution Metrics Deck */}
              {result ? (
                <MetricsSummaryDeck
                  result={result}
                  workload={workload}
                  selectedPid={selectedPid}
                  onSelectProcess={setSelectedPid}
                />
              ) : (
                <EmptyState
                  icon={<BarChart3 size={28} />}
                  title="No Scheduling Simulation Active"
                  description="Add processes to the workload editor or select an academic preset to calculate Gantt timelines and turnaround metrics."
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Fair Comparison */}
        {activeTab === 'comparison' && (
          <div>
            {comparisonResult ? (
              <FairComparisonView
                comparison={comparisonResult}
                selectedAlgorithm={selectedAlgorithm}
                onSelectAlgorithm={(algo) => {
                  setAlgorithm(algo);
                  setActiveTab('timeline');
                }}
              />
            ) : (
              <EmptyState
                icon={<Cpu size={28} />}
                title="Cross-Scheduler Comparison Not Computed"
                description="Simulate all 6 scheduling algorithms concurrently on this exact workload to evaluate waiting time and throughput."
                action={
                  <Button variant="primary" size="sm" onClick={runComparison}>
                    Run All 6 Schedulers
                  </Button>
                }
              />
            )}
          </div>
        )}

        {/* Tab 3: Educational Theory */}
        {activeTab === 'theory' && (
          <div>
            <SchedulingTheoryPanel selectedAlgorithm={selectedAlgorithm} />
          </div>
        )}
      </div>
    </LabLayout>
  );
};
