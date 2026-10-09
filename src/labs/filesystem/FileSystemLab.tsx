/**
 * OScope — File System & Storage Allocation Laboratory
 * Comprehensive interactive laboratory for secondary storage block management,
 * Inode representations, contiguous/linked/indexed strategies, external fragmentation,
 * read access trace simulations, and structural consistency audits.
 */

import React from 'react';
import { LabLayout } from '../../components/layout';
import { Button, Card, StatusBadge, ExplanationCard } from '../../components/common';
import { useFileSystemStore, type FileSystemTab } from '../../state/useFileSystemStore';
import { FILESYSTEM_PRESETS } from '../../core/algorithms/filesystem';
import { useDocumentTitle } from '../../core/utils/useDocumentTitle';
import { VirtualDiskHeatmap } from './components/VirtualDiskHeatmap';
import { DirectoryTreeView } from './components/DirectoryTreeView';
import { InodeInspector } from './components/InodeInspector';
import { FileCreationPanel } from './components/FileCreationPanel';
import { StrategyComparisonPanel } from './components/StrategyComparisonPanel';
import { AccessSimulatorPanel } from './components/AccessSimulatorPanel';
import { FileSystemConsistencyPanel } from './components/FileSystemConsistencyPanel';
import { FileSystemTheoryPanel } from './components/FileSystemTheoryPanel';
import {
  HardDrive,
  ListFilter,
  RotateCcw,
  ShieldCheck,
  Columns3,
  Search,
  BookOpen,
  X,
} from 'lucide-react';

export const FileSystemLab: React.FC = () => {
  useDocumentTitle('Virtual Disk & File System Laboratory', 'Simulate contiguous, linked, and indexed block allocation, Inodes, and external fragmentation.');

  const activePresetId = useFileSystemStore((s) => s.activePresetId);
  const activeTab = useFileSystemStore((s) => s.activeTab);
  const state = useFileSystemStore((s) => s.state);
  const freeSpace = useFileSystemStore((s) => s.freeSpaceAnalysis);
  const notification = useFileSystemStore((s) => s.notification);
  const explanation = useFileSystemStore((s) => s.explanation);
  const loadPreset = useFileSystemStore((s) => s.loadPreset);
  const resetToPreset = useFileSystemStore((s) => s.resetToPreset);
  const setActiveTab = useFileSystemStore((s) => s.setActiveTab);
  const runConsistencyAudit = useFileSystemStore((s) => s.runConsistencyAudit);
  const clearNotification = useFileSystemStore((s) => s.clearNotification);

  const activePreset = FILESYSTEM_PRESETS.find((p) => p.id === activePresetId);

  return (
    <LabLayout
      title="File System & Disk Allocation Laboratory"
      description="Interactive simulation of secondary storage block placement (Contiguous, Linked, Indexed), Unix-like Inode metadata, directory hierarchy, and external fragmentation."
      badge={<StatusBadge status="ACTIVE" size="sm" />}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="md"
            icon={<RotateCcw size={16} />}
            onClick={resetToPreset}
          >
            Reset Preset
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<ShieldCheck size={16} />}
            onClick={runConsistencyAudit}
          >
            Audit Consistency
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Preset Selector Bar */}
        <Card padding="md" variant="subdued">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ListFilter size={18} color="var(--color-accent)" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                STORAGE PRESET:
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
                minWidth: '360px',
                cursor: 'pointer',
              }}
            >
              {FILESYSTEM_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* System Notification Banner if active */}
        {notification && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
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
              <X size={14} />
            </button>
          </div>
        )}

        {/* Academic Explanation Card */}
        <ExplanationCard
          subsystem="FILESYSTEM"
          title="Virtual Disk Block Allocation Analysis"
          what={
            <span>
              Virtual disk currently holding <strong>{Object.keys(state.inodes).length}</strong> files across{' '}
              <strong>{state.totalBlocks - state.freeBlocksCount}</strong> allocated blocks (out of {state.totalBlocks} total).
              Largest contiguous free run: <strong>{freeSpace.largestFreeRun} blocks</strong>.
            </span>
          }
          why={
            activePreset ? (
              <span>
                {activePreset.description} <em>({activePreset.academicFocus})</em>
              </span>
            ) : (
              <span>
                Block allocation evaluates available free extents against strategy requirements (Contiguous requires adjacent run; Linked and Indexed allocate arbitrary scattered blocks).
              </span>
            )
          }
          result={
            explanation ? (
              explanation
            ) : freeSpace.largestFreeRun < 3 && state.freeBlocksCount >= 3 ? (
              'External fragmentation present: Contiguous allocations requiring >2 blocks will fail despite sufficient total free space.'
            ) : (
              `Disk usage: ${Math.round(((state.totalBlocks - state.freeBlocksCount) / state.totalBlocks) * 100)}%; Inode table consistent.`
            )
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
            { id: 'disk', label: 'Storage Surface & Explorer', icon: <HardDrive size={14} /> },
            { id: 'comparison', label: 'Strategy Comparison', icon: <Columns3 size={14} /> },
            { id: 'access', label: 'Read Access Simulator', icon: <Search size={14} /> },
            { id: 'consistency', label: 'Structural Audit', icon: <ShieldCheck size={14} /> },
            { id: 'theory', label: 'Storage Theory', icon: <BookOpen size={14} /> },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FileSystemTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.925rem',
                  fontWeight: 700,
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

        {/* Tab Contents */}
        {activeTab === 'disk' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Main Interactive Disk Block Surface */}
            <VirtualDiskHeatmap />

            {/* Bottom 3 Columns: Directory Tree, Inode Inspector, File Creation */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-4)',
              }}
              className="stack-mobile"
            >
              <DirectoryTreeView />
              <InodeInspector />
              <FileCreationPanel />
            </div>
          </div>
        )}

        {activeTab === 'comparison' && <StrategyComparisonPanel />}

        {activeTab === 'access' && <AccessSimulatorPanel />}

        {activeTab === 'consistency' && <FileSystemConsistencyPanel />}

        {activeTab === 'theory' && <FileSystemTheoryPanel />}
      </div>
    </LabLayout>
  );
};
