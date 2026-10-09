/**
 * OScope — Central Observatory Dashboard
 * Cohesive Operating System observatory platform consolidating telemetry,
 * topology mapping, global event stream, and cross-subsystem process tracing.
 */

import React from 'react';
import { Link } from 'wouter';
import { LabLayout } from '../../components/layout';
import { Button, StatusBadge, ExplanationCard } from '../../components/common';
import { useObservatoryTelemetry } from './useObservatoryTelemetry';
import { useObservatoryStore, type ObservatoryTab } from '../../state/useObservatoryStore';
import { useExhibitionMode } from '../../state/useExhibitionMode';
import { useDocumentTitle } from '../../core/utils/useDocumentTitle';
import { SystemMetricsStrip } from './components/SystemMetricsStrip';
import { CrossSubsystemTopologyMap } from './components/CrossSubsystemTopologyMap';
import { SubsystemStatusCards } from './components/SubsystemStatusCards';
import { GlobalEventTerminal } from './components/GlobalEventTerminal';
import { SystemInspectorPanel } from './components/SystemInspectorPanel';
import { ShowcaseScenarioBar } from './components/ShowcaseScenarioBar';
import { AcademicPhilosophyBanner } from './components/AcademicPhilosophyBanner';
import {
  RotateCcw,
  Network,
  Terminal,
  Search,
  BookOpen,
  LayoutDashboard,
  X,
} from 'lucide-react';

export const ObservatoryLab: React.FC = () => {
  useDocumentTitle('Central OS Observatory', 'Unified telemetry console summarizing simulated operating system operations across 5 subsystems.');

  const snapshot = useObservatoryTelemetry();
  const activeTab = useObservatoryStore((s) => s.activeTab);
  const setActiveTab = useObservatoryStore((s) => s.setActiveTab);
  const resetObservatory = useObservatoryStore((s) => s.resetObservatory);
  const notification = useObservatoryStore((s) => s.notification);
  const clearNotification = useObservatoryStore((s) => s.clearNotification);
  const { isExhibitionMode } = useExhibitionMode();

  return (
    <LabLayout
      title="Central OS Observatory Dashboard"
      description="Unified telemetry console summarizing simulated operating system operations across Process Lifecycle, CPU Scheduling, Virtual Memory, Deadlock Avoidance, and Storage Allocation."
      badge={<StatusBadge status={snapshot.systemStatus} size="sm" />}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Link href="/docs/architecture">
            <Button
              variant="outline"
              size="md"
              icon={<BookOpen size={16} />}
            >
              Architecture & Theory Docs
            </Button>
          </Link>
          <Button
            variant="outline"
            size="md"
            icon={<RotateCcw size={16} />}
            onClick={resetObservatory}
          >
            Reset Telemetry View
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Showcase Scenario Selector */}
        <ShowcaseScenarioBar />

        {/* System Notification Banner */}
        {notification && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              backgroundColor:
                notification.severity === 'danger'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : notification.severity === 'success'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
              border: `1px solid ${
                notification.severity === 'danger'
                  ? '#ef4444'
                  : notification.severity === 'success'
                  ? '#22c55e'
                  : '#38bdf8'
              }`,
              color: 'var(--color-text-primary)',
            }}
          >
            <span>{notification.message}</span>
            <button
              onClick={clearNotification}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Top-Level Metrics Strip */}
        <SystemMetricsStrip snapshot={snapshot} />

        {/* Academic Explanation Card */}
        <ExplanationCard
          subsystem="OBSERVATORY"
          title="Overall Operating System Telemetry Invariant"
          what={
            <span>
              Observatory overall system status resolved as <strong>{snapshot.systemStatus}</strong> via deterministic status precedence (<code>FAULT &gt; ATTENTION &gt; ACTIVE &gt; STANDBY</code>).
            </span>
          }
          why={
            <span>
              {snapshot.systemStatusReason}. Note: A normal virtual memory Page Fault does NOT trigger an observatory FAULT, and an UNSAFE Banker state triggers ATTENTION rather than FAULT.
            </span>
          }
          result={
            snapshot.systemStatus === 'FAULT'
              ? 'Critical simulation condition: inspect Deadlock or File System laboratory to resolve blocked states.'
              : snapshot.systemStatus === 'ATTENTION'
              ? 'Subsystem advisory: verify resource claim matrices or memory frame limits in respective laboratories.'
              : snapshot.systemStatus === 'ACTIVE'
              ? 'Subsystem simulation engines actively progressing virtual time and dispatching events.'
              : 'Subsystems in baseline standby; load an educational scenario to initiate execution.'
          }
        />

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          {[
            { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard size={16} /> },
            { id: 'topology', label: 'System Topology Map', icon: <Network size={16} /> },
            { id: 'events', label: 'Global Event Stream', icon: <Terminal size={16} /> },
            { id: 'inspector', label: 'Subsystem & Process Inspector', icon: <Search size={16} /> },
            { id: 'theory', label: 'Architecture & Transparency', icon: <BookOpen size={16} /> },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ObservatoryTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isTabActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: isTabActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderBottom: isTabActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Integrated Command Center View */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <CrossSubsystemTopologyMap snapshot={snapshot} />
            <SubsystemStatusCards snapshot={snapshot} />
            {!isExhibitionMode && <GlobalEventTerminal events={snapshot.normalizedEvents} />}
            <SystemInspectorPanel snapshot={snapshot} />
          </div>
        )}

        {/* Tab 2: Focused Topology Map */}
        {activeTab === 'topology' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <CrossSubsystemTopologyMap snapshot={snapshot} />
            <SystemInspectorPanel snapshot={snapshot} />
          </div>
        )}

        {/* Tab 3: Focused Event Stream */}
        {activeTab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <GlobalEventTerminal events={snapshot.normalizedEvents} />
          </div>
        )}

        {/* Tab 4: Focused Subsystem & Process Inspector */}
        {activeTab === 'inspector' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <SystemInspectorPanel snapshot={snapshot} />
            <SubsystemStatusCards snapshot={snapshot} />
          </div>
        )}

        {/* Tab 5: Architecture & Transparency */}
        {activeTab === 'theory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <AcademicPhilosophyBanner />
            <SystemInspectorPanel snapshot={snapshot} />
          </div>
        )}
      </div>
    </LabLayout>
  );
};
