import React from 'react';
import { LabLayout } from '../../components/layout';
import { Button, Card, StatusBadge, ExplanationCard } from '../../components/common';
import { useDeadlockStore } from '../../state/useDeadlockStore';
import { DEADLOCK_PRESETS } from '../../core/algorithms/deadlock';
import { useDocumentTitle } from '../../core/utils/useDocumentTitle';
import { SystemStatePanel } from './components/SystemStatePanel';
import { MatrixEditor } from './components/MatrixEditor';
import { BankerTraceVisualizer } from './components/BankerTraceVisualizer';
import { ResourceRequestBuilder } from './components/ResourceRequestBuilder';
import { ResourceAllocationGraphView } from './components/ResourceAllocationGraphView';
import { WaitForGraphView } from './components/WaitForGraphView';
import { DeadlockDetectionPanel } from './components/DeadlockDetectionPanel';
import { DeadlockTheoryPanel } from './components/DeadlockTheoryPanel';
import { ShieldCheck, Network, Search, BookOpen, RotateCcw, ListFilter } from 'lucide-react';

export const DeadlockLab: React.FC = () => {
  useDocumentTitle('Deadlock, RAG & Banker’s Algorithm Laboratory', 'Resource Allocation Graph cycle detection, Banker safety checks, and deadlock avoidance.');

  const activePresetId = useDeadlockStore((s) => s.activePresetId);
  const activeTab = useDeadlockStore((s) => s.activeTab);
  const simulationEvents = useDeadlockStore((s) => s.simulationEvents);
  const safetyResult = useDeadlockStore((s) => s.safetyResult);
  const ragCycleResult = useDeadlockStore((s) => s.ragCycleResult);
  const deadlockDetectionResult = useDeadlockStore((s) => s.deadlockDetectionResult);

  const loadPreset = useDeadlockStore((s) => s.loadPreset);
  const setActiveTab = useDeadlockStore((s) => s.setActiveTab);
  const resetToPreset = useDeadlockStore((s) => s.resetToPreset);
  const evaluateSafety = useDeadlockStore((s) => s.evaluateSafety);

  const currentStatus = deadlockDetectionResult?.isDeadlocked
    ? 'DEADLOCKED'
    : safetyResult.isSafe
    ? 'SAFE'
    : 'UNSAFE';

  return (
    <LabLayout
      title="Deadlock, RAG & Banker’s Algorithm Laboratory"
      description="Interactive Resource Allocation Graph (RAG) cycle visualization, safe/unsafe state verification via Banker's Algorithm, and resource-request safety simulation."
      badge={<StatusBadge status={currentStatus} size="sm" />}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button variant="outline" size="md" icon={<RotateCcw size={16} />} onClick={resetToPreset}>
            Reset Scenario
          </Button>
          <Button variant="primary" size="md" icon={<ShieldCheck size={16} />} onClick={evaluateSafety}>
            Run Safety Check
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Preset Selector Bar */}
        <Card padding="md" variant="subdued">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ListFilter size={18} color="var(--color-accent)" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                EDUCATIONAL PRESET:
              </span>
            </div>
            <select
              value={activePresetId}
              onChange={(e) => {
                if (e.target.value) loadPreset(e.target.value);
              }}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                minWidth: '340px',
                cursor: 'pointer',
              }}
            >
              {DEADLOCK_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* System State & Metrics Banner */}
        <SystemStatePanel />

        {/* Academic Explanation Card */}
        <ExplanationCard
          subsystem="DEADLOCK"
          title="Deadlock & Banker Safety State Analysis"
          what={
            <span>
              System resource state evaluated as <strong>{currentStatus}</strong>.
              {ragCycleResult.hasCycle && (
                <span> Directed cycle detected in RAG ({ragCycleResult.cycleNodes.join(' → ')}).</span>
              )}
              {safetyResult.isSafe && (
                <span> Safe sequence discovered: <code>{safetyResult.safeSequence.join(' → ')}</code>.</span>
              )}
            </span>
          }
          why={
            safetyResult.isSafe ? (
              <span>
                Available vector Work satisfies the remaining Need of at least one process at every iteration until all terminate and release held instances.
              </span>
            ) : deadlockDetectionResult?.isDeadlocked ? (
              <span>
                Directed circular hold-and-wait cycle detected with zero free instances available to unblock the cycle.
              </span>
            ) : (
              <span>
                No complete execution sequence exists under declared maximum demands. (Crucial Academic Distinction: An UNSAFE state is NOT necessarily a deadlock; it indicates vulnerability under worst-case requests).
              </span>
            )
          }
          result={
            safetyResult.isSafe
              ? 'OS can safely grant valid resource requests that preserve at least one safe sequence.'
              : deadlockDetectionResult?.isDeadlocked
              ? 'Deadlock confirmed; processes permanently blocked pending OS preemption or termination.'
              : 'Banker avoidance algorithm must deny non-releasing requests to prevent entering deadlock.'
          }
        />

        {/* Tab Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('safety')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'safety' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'safety' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'safety' ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            <ShieldCheck size={16} />
            <span>Banker Safety & Request</span>
          </button>

          <button
            onClick={() => setActiveTab('rag')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'rag' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'rag' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'rag' ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            <Network size={16} />
            <span>RAG & Wait-For Graphs</span>
          </button>

          <button
            onClick={() => setActiveTab('detection')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'detection' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'detection' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'detection' ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            <Search size={16} />
            <span>Multi-Instance Detection</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'theory' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'theory' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'theory' ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            <BookOpen size={16} />
            <span>Academic Theory & Invariants</span>
          </button>
        </div>

        {/* Tab 1: Banker Safety & Interactive Request Builder */}
        {activeTab === 'safety' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: 'var(--space-5)', alignItems: 'start' }} className="stack-mobile">
              <MatrixEditor />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <BankerTraceVisualizer />
                <ResourceRequestBuilder />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Resource Allocation Graph & Wait-For Graph */}
        {activeTab === 'rag' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: 'var(--space-5)' }} className="stack-mobile">
            <ResourceAllocationGraphView />
            <WaitForGraphView />
          </div>
        )}

        {/* Tab 3: Multi-Instance Deadlock Detection */}
        {activeTab === 'detection' && <DeadlockDetectionPanel />}

        {/* Tab 4: Academic Theory & Invariants */}
        {activeTab === 'theory' && <DeadlockTheoryPanel />}

        {/* Kernel Telemetry Log */}
        {simulationEvents.length > 0 && (
          <Card padding="md" variant="subdued">
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
              DEADLOCK TELEMETRY LOG
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
              {simulationEvents.map((evt, idx) => (
                <div key={idx} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                  {evt}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </LabLayout>
  );
};
