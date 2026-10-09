import React from 'react';
import { Activity, Terminal, Monitor, MonitorOff } from 'lucide-react';
import { Badge, StatusBadge, Button } from '../common';
import { Link } from 'wouter';
import { useExhibitionMode } from '../../state/useExhibitionMode';
import { useProcessStore } from '../../state/useProcessStore';
import { useObservatoryTelemetry } from '../../labs/observatory/useObservatoryTelemetry';

export const Header: React.FC = () => {
  const { isExhibitionMode, toggleExhibitionMode } = useExhibitionMode();
  const [fontSizeLevel, setFontSizeLevel] = React.useState<'normal' | 'large' | 'xlarge'>('large');

  React.useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === 'normal') {
      root.style.setProperty('--app-font-size', '17px');
    } else if (fontSizeLevel === 'large') {
      root.style.setProperty('--app-font-size', '19.5px');
    } else if (fontSizeLevel === 'xlarge') {
      root.style.setProperty('--app-font-size', '22px');
    }
  }, [fontSizeLevel]);

  const clockTime = useProcessStore((s) => {
    try {
      return s.clock.getCurrentTime();
    } catch {
      return 0;
    }
  });
  const { systemStatus } = useObservatoryTelemetry();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        height: '64px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        zIndex: 30,
      }}
      role="banner"
    >
      {/* Brand & Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Link href="/">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              cursor: 'pointer',
            }}
            tabIndex={0}
            role="link"
            aria-label="OScope Home"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-accent-border)',
                color: 'var(--color-accent)',
                boxShadow: 'var(--shadow-glow-accent)',
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    letterSpacing: '0.04em',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  OScope
                </span>
                <Badge variant="outline" size="sm">
                  v1.0.0-academic
                </Badge>
              </div>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                Interactive Operating System Observatory
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Center System Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-5)',
          padding: '8px 20px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-surface-subdued)',
          border: '1px solid var(--color-border)',
        }}
        className="hide-mobile"
        aria-label="Global System Telemetry Strip"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            STATUS:
          </span>
          <StatusBadge status={systemStatus} size="sm" />
        </div>
        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            CLOCK:
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-accent)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            t={String(clockTime).padStart(4, '0')} ms
          </span>
        </div>
        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            MODE:
          </span>
          <Badge variant={isExhibitionMode ? 'ready' : 'neutral'} size="sm">
            {isExhibitionMode ? 'Exhibition' : 'Standard'}
          </Badge>
        </div>
      </div>

      {/* Right Controls: Font Scale Toggle, Exhibition Mode Toggle & Terminal Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Dynamic Font Size Zoom Control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-subdued)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px',
          }}
          title="Adjust Text Scale: A (Standard 17px) | A+ (Large 19.5px) | A++ (Extra Large 22px)"
        >
          <button
            type="button"
            onClick={() => setFontSizeLevel('normal')}
            style={{
              padding: '3px 8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: fontSizeLevel === 'normal' ? 'var(--color-accent)' : 'transparent',
              color: fontSizeLevel === 'normal' ? '#070A13' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSizeLevel('large')}
            style={{
              padding: '3px 8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: fontSizeLevel === 'large' ? 'var(--color-accent)' : 'transparent',
              color: fontSizeLevel === 'large' ? '#070A13' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setFontSizeLevel('xlarge')}
            style={{
              padding: '3px 8px',
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: fontSizeLevel === 'xlarge' ? 'var(--color-accent)' : 'transparent',
              color: fontSizeLevel === 'xlarge' ? '#070A13' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            A++
          </button>
        </div>

        <Button
          variant={isExhibitionMode ? 'primary' : 'outline'}
          size="sm"
          onClick={toggleExhibitionMode}
          icon={isExhibitionMode ? <MonitorOff size={16} /> : <Monitor size={16} />}
          title="Toggle Exhibition Presentation Mode (high-density layout for exhibitions)"
          aria-label={isExhibitionMode ? 'Exit Exhibition Mode' : 'Enter Exhibition Mode'}
        >
          {isExhibitionMode ? 'Standard View' : 'Exhibition Mode'}
        </Button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
          }}
          className="hide-mobile"
        >
          <Terminal size={15} color="var(--color-accent)" />
          <span>Academic Platform</span>
        </div>
      </div>
    </header>
  );
};
