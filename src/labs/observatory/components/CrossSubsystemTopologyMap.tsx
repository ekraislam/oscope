/**
 * OScope — Cross-Subsystem Topology Map Component
 * Interactive visual representation of Operating System architecture
 * connecting Process Lifecycle, CPU Scheduling, Virtual Memory,
 * Deadlock Avoidance, and Virtual Storage.
 */

import { Layers, Cpu, Database, Lock, HardDrive, ArrowDown } from 'lucide-react';
import { Card, Badge } from '../../../components/common';
import type { ObservatorySnapshot, SubsystemStatus } from '../../../core/models/observatory';
import { useObservatoryStore, type SubsystemIdentifier } from '../../../state/useObservatoryStore';

interface Props {
  snapshot: ObservatorySnapshot;
}

export const CrossSubsystemTopologyMap: React.FC<Props> = ({ snapshot }) => {
  const selectedSubsystem = useObservatoryStore((s) => s.selectedSubsystem);
  const setSelectedSubsystem = useObservatoryStore((s) => s.setSelectedSubsystem);

  const { process, scheduling, memory, deadlock, filesystem } = snapshot;

  const getStatusColor = (status: SubsystemStatus) => {
    switch (status) {
      case 'FAULT':
        return '#ef4444';
      case 'ATTENTION':
        return '#f59e0b';
      case 'ACTIVE':
        return '#22c55e';
      case 'STANDBY':
      default:
        return 'var(--color-text-muted)';
    }
  };

  const renderNode = (
    id: SubsystemIdentifier,
    title: string,
    icon: React.ReactNode,
    status: SubsystemStatus,
    statPrimary: string,
    statSecondary: string
  ) => {
    const isSelected = selectedSubsystem === id;
    const color = getStatusColor(status);

    return (
      <button
        onClick={() => setSelectedSubsystem(id)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 16px',
          minWidth: '150px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--color-surface)',
          border: isSelected ? '2px solid var(--color-accent)' : `1px solid var(--color-border)`,
          cursor: 'pointer',
          textAlign: 'center',
          boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
          transition: 'all 0.15s ease',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          {icon}
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color,
            }}
          >
            {status}
          </span>
        </div>

        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
          {statPrimary}
        </span>
        <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
          {statSecondary}
        </span>
      </button>
    );
  };

  return (
    <Card padding="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
              Operating System Cross-Subsystem Topology
            </h3>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
              Interactive architectural map showing execution flow and resource dependencies.
            </p>
          </div>
          <Badge variant="outline">Interactive System Map</Badge>
        </div>

        {/* Topology Diagram Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            position: 'relative',
          }}
        >
          {/* Level 1: PROCESS MANAGEMENT */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {renderNode(
              'PROCESS',
              'PROCESS & PCB',
              <Layers size={16} color="var(--color-accent)" />,
              process.status,
              `${process.totalProcesses} Registered`,
              process.runningPid ? `Running: ${process.runningPid}` : `Ready: ${process.readyCount}`
            )}
          </div>

          {/* Flow Connector: Process to Execution Tier */}
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-border)', gap: '4px' }}>
            <ArrowDown size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              DISPATCH & RESOURCE ALLOCATION
            </span>
            <ArrowDown size={16} color="var(--color-accent)" />
          </div>

          {/* Level 2: CPU, MEMORY, DEADLOCK (Execution & Control Tier) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            {renderNode(
              'CPU',
              'CPU SCHEDULER',
              <Cpu size={16} color="#38bdf8" />,
              scheduling.status,
              scheduling.cpuUtilization !== null ? `${scheduling.cpuUtilization}% Util` : 'Standby',
              scheduling.activeAlgorithm
            )}

            {renderNode(
              'MEMORY',
              'VIRTUAL MEMORY',
              <Database size={16} color="#a855f7" />,
              memory.status,
              `${memory.memoryUtilization}% Frames`,
              memory.pageFaults !== null ? `${memory.pageFaults} Faults (${memory.pageFaultRate}%)` : `${memory.frameCount} Frames`
            )}

            {renderNode(
              'DEADLOCK',
              'RESOURCE SAFETY',
              <Lock size={16} color="#f59e0b" />,
              deadlock.status,
              `State: ${deadlock.bankerState}`,
              deadlock.isDeadlocked
                ? `${deadlock.deadlockedPids.length} Deadlocked!`
                : deadlock.ragCycleDetected
                ? 'RAG Cycle'
                : 'No Cycles'
            )}
          </div>

          {/* Flow Connector: Execution to Storage Tier */}
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-border)', gap: '4px' }}>
            <ArrowDown size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              PERSISTENT STORAGE & INODES
            </span>
            <ArrowDown size={16} color="var(--color-accent)" />
          </div>

          {/* Level 3: FILE SYSTEM (Storage Tier) */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {renderNode(
              'FILESYSTEM',
              'FILE SYSTEM & STORAGE',
              <HardDrive size={16} color="#22c55e" />,
              filesystem.status,
              `${filesystem.allocatedBlocks}/${filesystem.totalBlocks} Blocks (${filesystem.diskUsagePercentage}%)`,
              `${filesystem.fileCount} Files · ${filesystem.selectedStrategy}`
            )}
          </div>
        </div>

        {/* Selected Subsystem Quick Hint */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>
            CLICK ANY NODE TO INSPECT SUBSYSTEM · CURRENT SELECTION: <strong>{selectedSubsystem}</strong>
          </span>
          <button
            onClick={() => setSelectedSubsystem('OVERVIEW')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.6875rem',
            }}
          >
            Reset Selection to Overview
          </button>
        </div>
      </div>
    </Card>
  );
};
