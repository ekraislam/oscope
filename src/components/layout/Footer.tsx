import React from 'react';
import { Sparkles, Code, Cpu, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-6)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
      role="contentinfo"
      aria-label="Platform Footer"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        {/* Left: Brand & Designer/Developer Credit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: 'var(--color-text-primary)',
                letterSpacing: '0.04em',
              }}
            >
              OScope
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid var(--color-accent-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-accent)',
              }}
            >
              <Sparkles size={13} />
              v1.0.0 Academic Platform
            </span>
          </div>

          {/* Designed and Developed by Ohi */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9375rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span style={{ fontWeight: 600 }}>Designed & Developed by</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(56, 189, 248, 0.14)',
                border: '1.5px solid var(--color-accent)',
                color: 'var(--color-accent)',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9375rem',
                letterSpacing: '0.06em',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.28)',
              }}
            >
              <Code size={16} />
              OHI
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 0 8px var(--color-accent)',
                  display: 'inline-block',
                }}
              />
            </span>
          </div>
        </div>

        {/* Center / Right: Quick Navigation & Platform Mission */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
          }}
        >
          <Link href="/">
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} className="hover-accent">
              Overview
            </span>
          </Link>
          <span>•</span>
          <Link href="/observatory">
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} className="hover-accent">
              Observatory
            </span>
          </Link>
          <span>•</span>
          <Link href="/process">
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} className="hover-accent">
              Process Lab
            </span>
          </Link>
          <span>•</span>
          <Link href="/scheduling">
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} className="hover-accent">
              CPU Scheduling
            </span>
          </Link>
          <span>•</span>
          <Link href="/memory">
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} className="hover-accent">
              Virtual Memory
            </span>
          </Link>
          <span>•</span>
          <Link href="/deadlock">
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} className="hover-accent">
              Deadlock Lab
            </span>
          </Link>
          <span>•</span>
          <Link href="/filesystem">
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} className="hover-accent">
              Virtual Storage
            </span>
          </Link>
          <span>•</span>
          <Link href="/docs">
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} className="hover-accent">
              Academic Docs & Viva
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: 'var(--space-3)',
        }}
      >
        <span>
          © {new Date().getFullYear()} OScope. Built for Operating Systems Education & Simulation.
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontWeight: 600 }}>
            <ShieldCheck size={14} /> 100% Deterministic Engines
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={14} /> Invariant Verified
          </span>
        </div>
      </div>
    </footer>
  );
};
