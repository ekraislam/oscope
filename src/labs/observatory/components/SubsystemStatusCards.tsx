/**
 * OScope — Subsystem Status Cards Component
 * Detailed telemetry cards for Process, CPU Scheduling, Virtual Memory,
 * Deadlock & Banker, and Virtual File System with direct laboratory navigation.
 */

import React from 'react';
import { Link } from 'wouter';
import { Layers, Cpu, Database, Lock, HardDrive, ArrowUpRight } from 'lucide-react';
import { Card, Badge, Button } from '../../../components/common';
import type { ObservatorySnapshot } from '../../../core/models/observatory';

interface Props {
  snapshot: ObservatorySnapshot;
}

export const SubsystemStatusCards: React.FC<Props> = ({ snapshot }) => {
  const { process, scheduling, memory, deadlock, filesystem } = snapshot;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
      {/* 1. PROCESS LAB CARD */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="var(--color-accent)" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                  Process Management & PCB
                </h4>
              </div>
              <Badge variant={process.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {process.status}
              </Badge>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              {process.statusReason}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>RUNNING PID: </span>
                <strong style={{ color: process.runningPid ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                  {process.runningPid ?? 'Idle'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>READY QUEUE: </span>
                <strong>{process.readyCount}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>WAITING I/O: </span>
                <strong>{process.waitingCount}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>TERMINATED: </span>
                <strong>{process.terminatedCount}</strong>
              </div>
            </div>
          </div>

          <Link href="/process">
            <Button variant="outline" size="sm" icon={<ArrowUpRight size={13} />} style={{ width: '100%', marginTop: '12px' }}>
              Open Process Lab
            </Button>
          </Link>
        </div>
      </Card>

      {/* 2. CPU SCHEDULING CARD */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={16} color="#38bdf8" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                  CPU Scheduling Engine
                </h4>
              </div>
              <Badge variant={scheduling.hasSimulation ? 'success' : 'neutral'}>
                {scheduling.status}
              </Badge>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              {scheduling.statusReason}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>ALGORITHM: </span>
                <strong style={{ color: '#38bdf8' }}>{scheduling.activeAlgorithm}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>UTILIZATION: </span>
                <strong>{scheduling.cpuUtilization !== null ? `${scheduling.cpuUtilization}%` : '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>AVG WAIT: </span>
                <strong>{scheduling.averageWaitingTime !== null ? `${scheduling.averageWaitingTime}t` : '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>CONTEXT SW: </span>
                <strong>{scheduling.contextSwitches !== null ? scheduling.contextSwitches : '—'}</strong>
              </div>
            </div>
          </div>

          <Link href="/scheduling">
            <Button variant="outline" size="sm" icon={<ArrowUpRight size={13} />} style={{ width: '100%', marginTop: '12px' }}>
              Open CPU Scheduling
            </Button>
          </Link>
        </div>
      </Card>

      {/* 3. MEMORY MANAGEMENT CARD */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={16} color="#a855f7" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                  Virtual Memory & Paging
                </h4>
              </div>
              <Badge variant={memory.status === 'ATTENTION' ? 'warning' : memory.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {memory.status}
              </Badge>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              {memory.statusReason}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>FRAMES: </span>
                <strong>{memory.occupiedFrames}/{memory.frameCount} ({memory.memoryUtilization}%)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>PAGE FAULTS: </span>
                <strong style={{ color: memory.pageFaults !== null && memory.pageFaultRate && memory.pageFaultRate > 50 ? '#fbbf24' : 'inherit' }}>
                  {memory.pageFaults !== null ? `${memory.pageFaults} (${memory.pageFaultRate}%)` : '—'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>TLB HIT RATE: </span>
                <strong>{memory.tlbHitRate !== null ? `${memory.tlbHitRate}%` : '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>REPLACEMENT: </span>
                <strong style={{ color: '#c084fc' }}>{memory.replacementAlgorithm}</strong>
              </div>
            </div>
          </div>

          <Link href="/memory">
            <Button variant="outline" size="sm" icon={<ArrowUpRight size={13} />} style={{ width: '100%', marginTop: '12px' }}>
              Open Memory Lab
            </Button>
          </Link>
        </div>
      </Card>

      {/* 4. DEADLOCK & BANKER'S CARD */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={16} color="#f59e0b" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                  Deadlock & Banker’s Safety
                </h4>
              </div>
              <Badge variant={deadlock.status === 'FAULT' ? 'danger' : deadlock.status === 'ATTENTION' ? 'warning' : 'success'}>
                {deadlock.status}
              </Badge>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              {deadlock.statusReason}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>BANKER STATE: </span>
                <strong style={{ color: deadlock.bankerState === 'SAFE' ? 'var(--color-success)' : '#f59e0b' }}>
                  {deadlock.bankerState}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>RAG CYCLES: </span>
                <strong style={{ color: deadlock.ragCycleDetected ? '#ef4444' : 'var(--color-success)' }}>
                  {deadlock.ragCycleDetected ? 'Cycle Present' : 'Acyclic'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>DEADLOCKED: </span>
                <strong style={{ color: deadlock.isDeadlocked ? '#ef4444' : 'var(--color-success)' }}>
                  {deadlock.deadlockedPids.length > 0 ? `${deadlock.deadlockedPids.length} Procs` : 'None (0)'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>PROCESSES: </span>
                <strong>{deadlock.processCount} procs / {deadlock.resourceCount} res</strong>
              </div>
            </div>
          </div>

          <Link href="/deadlock">
            <Button variant="outline" size="sm" icon={<ArrowUpRight size={13} />} style={{ width: '100%', marginTop: '12px' }}>
              Open Deadlock Lab
            </Button>
          </Link>
        </div>
      </Card>

      {/* 5. FILE SYSTEM & STORAGE CARD */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={16} color="#22c55e" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                  File System & Virtual Disk
                </h4>
              </div>
              <Badge variant={filesystem.status === 'FAULT' ? 'danger' : filesystem.status === 'ATTENTION' ? 'warning' : 'success'}>
                {filesystem.status}
              </Badge>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              {filesystem.statusReason}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>OCCUPANCY: </span>
                <strong>{filesystem.allocatedBlocks}/{filesystem.totalBlocks} ({filesystem.diskUsagePercentage}%)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>FREE SPACE: </span>
                <strong>{filesystem.freeBlocks} blks (Max run: {filesystem.largestFreeRun})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>VFS OBJECTS: </span>
                <strong>{filesystem.fileCount} files, {filesystem.directoryCount} dirs</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>STRATEGY: </span>
                <strong style={{ color: '#22c55e' }}>{filesystem.selectedStrategy}</strong>
              </div>
            </div>
          </div>

          <Link href="/filesystem">
            <Button variant="outline" size="sm" icon={<ArrowUpRight size={13} />} style={{ width: '100%', marginTop: '12px' }}>
              Open File System Lab
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
