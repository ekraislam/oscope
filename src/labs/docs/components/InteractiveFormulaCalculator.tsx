/**
 * OScope — Interactive Academic Formula Calculator
 * Allows students to input real values and observe step-by-step arithmetic
 * evaluations for CPU scheduling metrics, memory address translations,
 * and storage block allocations.
 */

import React, { useState } from 'react';
import { Calculator, Cpu, Database, HardDrive, RotateCcw } from 'lucide-react';
import {
  calculateSchedulingMetrics,
  calculateMemoryTranslation,
  calculateFilesystemStorage
} from '../../../content/formulas';

export const InteractiveFormulaCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SCHEDULING' | 'MEMORY' | 'FILESYSTEM'>('SCHEDULING');

  // Scheduling State
  const [schedInput, setSchedInput] = useState({ at: 2, bt: 5, ct: 10, firstStart: 2 });
  const schedResult = calculateSchedulingMetrics(schedInput);

  // Memory State
  const [memInput, setMemInput] = useState({ virtualAddress: 10000, pageSize: 4096, assignedFrame: 7 });
  const memResult = calculateMemoryTranslation(memInput);

  // Filesystem State
  const [fsInput, setFsInput] = useState({ fileSize: 1500, blockSize: 512 });
  const fsResult = calculateFilesystemStorage(fsInput);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--color-primary)'
            }}
          >
            <Calculator size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Interactive Academic Formula Calculator
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Test formulas dynamically with live mathematical evaluation
            </span>
          </div>
        </div>

        {/* Subsystem Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-bg)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('SCHEDULING')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'SCHEDULING' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'SCHEDULING' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: activeTab === 'SCHEDULING' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <Cpu size={13} />
            <span>CPU Scheduling</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MEMORY')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'MEMORY' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'MEMORY' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: activeTab === 'MEMORY' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <Database size={13} />
            <span>Virtual Memory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FILESYSTEM')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'FILESYSTEM' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'FILESYSTEM' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: activeTab === 'FILESYSTEM' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <HardDrive size={13} />
            <span>File Storage</span>
          </button>
        </div>
      </div>

      {/* --- SCHEDULING CALCULATOR --- */}
      {activeTab === 'SCHEDULING' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Inputs */}
          <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                Process Parameters
              </span>
              <button
                type="button"
                onClick={() => setSchedInput({ at: 2, bt: 5, ct: 10, firstStart: 2 })}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem' }}
                title="Reset to default example"
              >
                <RotateCcw size={11} /> Reset
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Arrival Time (AT)
                </label>
                <input
                  type="number"
                  min="0"
                  value={schedInput.at}
                  onChange={(e) => setSchedInput({ ...schedInput, at: Math.max(0, parseInt(e.target.value) || 0) })}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Burst Time (BT)
                </label>
                <input
                  type="number"
                  min="1"
                  value={schedInput.bt}
                  onChange={(e) => setSchedInput({ ...schedInput, bt: Math.max(1, parseInt(e.target.value) || 1) })}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Completion Time (CT)
                </label>
                <input
                  type="number"
                  min={schedInput.at + schedInput.bt}
                  value={schedInput.ct}
                  onChange={(e) => setSchedInput({ ...schedInput, ct: Math.max(schedInput.at + schedInput.bt, parseInt(e.target.value) || 0) })}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  First Start Time
                </label>
                <input
                  type="number"
                  min={schedInput.at}
                  value={schedInput.firstStart}
                  onChange={(e) => setSchedInput({ ...schedInput, firstStart: Math.max(schedInput.at, parseInt(e.target.value) || 0) })}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>
              Computed Scheduling Metrics
            </span>

            {/* Turnaround Time */}
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Turnaround Time (TAT)</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  {schedResult.tat}
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                TAT = CT - AT = {schedInput.ct} - {schedInput.at} = {schedResult.tat}
              </div>
            </div>

            {/* Waiting Time */}
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Waiting Time (WT)</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  {schedResult.wt}
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                WT = TAT - BT = {schedResult.tat} - {schedInput.bt} = {schedResult.wt}
              </div>
            </div>

            {/* Response Time */}
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Response Time (RT)</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
                  {schedResult.rt}
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                RT = FirstStart - AT = {schedInput.firstStart} - {schedInput.at} = {schedResult.rt}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MEMORY CALCULATOR --- */}
      {activeTab === 'MEMORY' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Inputs */}
          <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                Memory Configuration
              </span>
              <button
                type="button"
                onClick={() => setMemInput({ virtualAddress: 10000, pageSize: 4096, assignedFrame: 7 })}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem' }}
                title="Reset to default example"
              >
                <RotateCcw size={11} /> Reset
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Virtual Address (VA in Bytes)
              </label>
              <input
                type="number"
                min="0"
                value={memInput.virtualAddress}
                onChange={(e) => setMemInput({ ...memInput, virtualAddress: Math.max(0, parseInt(e.target.value) || 0) })}
                style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Page Size (Bytes)
                </label>
                <select
                  value={memInput.pageSize}
                  onChange={(e) => setMemInput({ ...memInput, pageSize: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
                >
                  <option value={1024}>1024 B (1 KiB)</option>
                  <option value={2048}>2048 B (2 KiB)</option>
                  <option value={4096}>4096 B (4 KiB)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Assigned Frame
                </label>
                <input
                  type="number"
                  min="0"
                  max="63"
                  value={memInput.assignedFrame}
                  onChange={(e) => setMemInput({ ...memInput, assignedFrame: Math.max(0, parseInt(e.target.value) || 0) })}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>
              Address Translation Pipeline Output
            </span>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Virtual Page Number (VPN)</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  Page {memResult.vpn}
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                VPN = floor({memInput.virtualAddress} / {memInput.pageSize}) = {memResult.vpn}
              </div>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Page Offset (Displacement)</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
                  {memResult.offset} B
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Offset = {memInput.virtualAddress} mod {memInput.pageSize} = {memResult.offset} (Invariant)
              </div>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Physical Address (PA)</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  {memResult.physicalAddress} B
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                PA = ({memInput.assignedFrame} * {memInput.pageSize}) + {memResult.offset} = {memResult.physicalAddress}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FILESYSTEM CALCULATOR --- */}
      {activeTab === 'FILESYSTEM' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Inputs */}
          <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                Storage File Parameters
              </span>
              <button
                type="button"
                onClick={() => setFsInput({ fileSize: 1500, blockSize: 512 })}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem' }}
                title="Reset to default example"
              >
                <RotateCcw size={11} /> Reset
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                File Size in Bytes
              </label>
              <input
                type="number"
                min="1"
                value={fsInput.fileSize}
                onChange={(e) => setFsInput({ ...fsInput, fileSize: Math.max(1, parseInt(e.target.value) || 1) })}
                style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Block Size (Bytes)
              </label>
              <select
                value={fsInput.blockSize}
                onChange={(e) => setFsInput({ ...fsInput, blockSize: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-main)' }}
              >
                <option value={512}>512 B (Standard Disk Sector)</option>
                <option value={1024}>1024 B (1 KiB)</option>
                <option value={4096}>4096 B (4 KiB Standard Block)</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>
              Storage Allocation & Fragmentation
            </span>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Required Block Count</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  {fsResult.requiredBlocks} blocks
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                ceil({fsInput.fileSize} / {fsInput.blockSize}) = {fsResult.requiredBlocks} blocks ({fsResult.totalAllocatedBytes} B allocated)
              </div>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Internal Fragmentation</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ef4444' }}>
                  {fsResult.internalFragmentation} bytes
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Unused slack in last block: {fsResult.slackPercentage}% of allocated file storage
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
