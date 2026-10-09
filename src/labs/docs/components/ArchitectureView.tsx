/**
 * OScope — Architecture, Verification & Engineering Documentation View
 * Documents the multi-tier decoupled system design, module taxonomy, execution traces,
 * automated testing methodology, Academic FAQ, and Real OS vs OScope comparisons.
 */

import React from 'react';
import {
  Layers,
  Terminal,
  Shield,
  HelpCircle,
  GitBranch,
  FolderTree
} from 'lucide-react';
import {
  ARCHITECTURE_LAYERS,
  MODULE_DIRECTORY_REFERENCE,
  ACADEMIC_FAQ,
  REAL_OS_VS_OSCOPE
} from '../../../content/architectureDoc';

export const ArchitectureView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Overview Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-primary)' }}>
            <Layers size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              OScope System Architecture & Engineering
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Decoupled, deterministic, client-side academic simulation architecture
            </span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text-main)' }}>
          OScope is engineered around strict separation of concerns. Algorithmic engines and domain models are completely decoupled from UI rendering, operating as pure mathematical functions governed by a deterministic discrete-event virtual clock and immutable state snapshots.
        </p>
      </div>

      {/* --- MULTI-TIER LAYER BREAKDOWN --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitBranch size={16} style={{ color: 'var(--color-primary)' }} />
          <span>Multi-Tier Architectural Layers</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ARCHITECTURE_LAYERS.map((layer, idx) => (
            <div
              key={layer.layerName}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                display: 'grid',
                gridTemplateColumns: '40px 180px 1fr',
                gap: '14px',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ fontSize: '1.125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textAlign: 'center' }}>
                L{idx + 1}
              </div>
              <div>
                <h5 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {layer.layerName}
                </h5>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                  Deps: {layer.dependencies.join(', ')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                  {layer.role}
                </p>
                <div style={{ fontSize: '0.75rem', lineHeight: 1.45, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  {layer.academicSignificance}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODULE DIRECTORY REFERENCE --- */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FolderTree size={16} style={{ color: 'var(--color-primary)' }} />
          <span>Core Module Directory Reference</span>
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Module Path</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Subsystem Purpose</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Key Artifacts</th>
              </tr>
            </thead>
            <tbody>
              {MODULE_DIRECTORY_REFERENCE.map((mod) => (
                <tr key={mod.path} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>{mod.path}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-main)' }}>{mod.purpose}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{mod.keyArtifacts.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EXECUTION FLOW TRACES --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={16} style={{ color: 'var(--color-primary)' }} />
          <span>Algorithmic Execution Trace Flows</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {/* Flow 1: SRTF */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
              SRTF PREEMPTION FLOW
            </span>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
              New Process Arrives<br />
              &nbsp;&nbsp;↓<br />
              Compare Remaining Bursts<br />
              &nbsp;&nbsp;↓<br />
              Trigger Preemption Interrupt<br />
              &nbsp;&nbsp;↓<br />
              Save Outgoing PCB State<br />
              &nbsp;&nbsp;↓<br />
              Dispatch Shortest Process
            </div>
          </div>

          {/* Flow 2: Page Fault */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
              PAGE FAULT RESOLUTION FLOW
            </span>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
              CPU References Virtual Address<br />
              &nbsp;&nbsp;↓<br />
              TLB Miss → Page Table Checked<br />
              &nbsp;&nbsp;↓<br />
              Valid Bit = 0 → Page Fault Trap<br />
              &nbsp;&nbsp;↓<br />
              Evict Victim (FIFO/LRU/OPT)<br />
              &nbsp;&nbsp;↓<br />
              Load Page to Frame & Update Entry
            </div>
          </div>

          {/* Flow 3: Banker's Algorithm */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
              BANKER'S RESOURCE REQUEST FLOW
            </span>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
              Request &lt;= Need Check<br />
              &nbsp;&nbsp;↓<br />
              Request &lt;= Available Check<br />
              &nbsp;&nbsp;↓<br />
              Provisional Vector Allocation<br />
              &nbsp;&nbsp;↓<br />
              Run Safety Algorithm<br />
              &nbsp;&nbsp;↓<br />
              Safe? Grant : Rollback & Wait
            </div>
          </div>

          {/* Flow 4: File Allocation */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#a855f7' }}>
              INODE & STORAGE ALLOCATION FLOW
            </span>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
              Directory Entry Created<br />
              &nbsp;&nbsp;↓<br />
              Inode Allocated from Inode Table<br />
              &nbsp;&nbsp;↓<br />
              Calculate Required Blocks<br />
              &nbsp;&nbsp;↓<br />
              Allocate Blocks (Contig/Linked/Idx)<br />
              &nbsp;&nbsp;↓<br />
              Record Inode Pointers & Mark Bitmap
            </div>
          </div>
        </div>
      </div>

      {/* --- REAL OS VS OSCOPE COMPARISON TABLE --- */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Real Operating System vs. OScope Simulation
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Dimension</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Production Operating System</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>OScope Educational Simulation</th>
              </tr>
            </thead>
            <tbody>
              {REAL_OS_VS_OSCOPE.map((row) => (
                <tr key={row.dimension} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-main)' }}>{row.dimension}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)' }}>{row.realOperatingSystem}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-main)' }}>{row.oscopeSimulation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ACADEMIC FAQ --- */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} style={{ color: 'var(--color-primary)' }} />
          <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Engineering & Academic FAQ
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ACADEMIC_FAQ.map((faq, idx) => (
            <div key={idx} style={{ backgroundColor: 'var(--color-bg)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                Q: {faq.question}
              </div>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.8125rem', lineHeight: 1.55, color: 'var(--color-text-muted)' }}>
                {faq.answer}
              </p>
              <div style={{ fontSize: '0.6875rem', fontStyle: 'italic', color: 'var(--color-primary)' }}>
                Rationale: {faq.rationale}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- SECURITY & PRIVACY STATEMENT --- */}
      <div
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}
      >
        <Shield size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981', display: 'block', marginBottom: '2px' }}>
            Security & Privacy Assurance
          </span>
          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
            OScope is strictly an in-memory client-side educational simulation. It does not monitor host operating system processes, does not inspect host RAM, does not read or write host hard drive files, and does not transmit telemetry data to external servers. It runs in any modern browser without requiring administrative privileges or compiler toolchains.
          </p>
        </div>
      </div>
    </div>
  );
};
