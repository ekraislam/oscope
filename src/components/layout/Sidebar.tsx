import React from 'react';
import { useLocation, Link } from 'wouter';
import {
  Compass,
  Cpu,
  Layers,
  Database,
  Lock,
  HardDrive,
  Activity,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  category: 'OBSERVATORY' | 'SUBSYSTEM' | 'STORAGE' | 'DOCUMENTATION';
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Overview & Status',
    shortcut: '0',
    icon: <Compass size={18} />,
    category: 'OBSERVATORY',
  },
  {
    path: '/observatory',
    label: 'Central Observatory',
    shortcut: '1',
    icon: <Activity size={18} />,
    category: 'OBSERVATORY',
  },
  {
    path: '/process',
    label: 'Process Lifecycle & PCB',
    shortcut: '2',
    icon: <Layers size={18} />,
    category: 'SUBSYSTEM',
  },
  {
    path: '/scheduling',
    label: 'CPU Scheduling Lab',
    shortcut: '3',
    icon: <Cpu size={18} />,
    category: 'SUBSYSTEM',
  },
  {
    path: '/memory',
    label: 'Virtual Memory & Paging',
    shortcut: '4',
    icon: <Database size={18} />,
    category: 'SUBSYSTEM',
  },
  {
    path: '/deadlock',
    label: 'Deadlock & Banker Lab',
    shortcut: '5',
    icon: <Lock size={18} />,
    category: 'SUBSYSTEM',
  },
  {
    path: '/filesystem',
    label: 'Virtual Disk & Storage',
    shortcut: '6',
    icon: <HardDrive size={18} />,
    category: 'STORAGE',
  },
  {
    path: '/docs',
    label: 'Academic Docs & Viva',
    shortcut: '7',
    icon: <GraduationCap size={18} />,
    category: 'DOCUMENTATION',
  },
];

export const Sidebar: React.FC = () => {
  const [location] = useLocation();

  const renderNavItem = (item: NavItem) => {
    const isActive = item.path === '/' 
      ? location === '/' 
      : item.path === '/docs' 
        ? location.startsWith('/docs') 
        : location === item.path;

    return (
      <Link key={item.path} href={item.path}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            backgroundColor: isActive ? 'var(--color-accent-subtle)' : 'transparent',
            border: isActive ? '1px solid var(--color-accent-border)' : '1px solid transparent',
            borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          tabIndex={0}
          role="link"
          aria-current={isActive ? 'page' : undefined}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)', display: 'flex' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-xs)',
              minWidth: '20px',
              textAlign: 'center',
            }}
          >
            {item.shortcut}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <aside
      style={{
        width: '270px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-3)',
        flexShrink: 0,
      }}
      role="navigation"
      aria-label="Laboratory Navigation Sidebar"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Navigation Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div
            style={{
              padding: '0 var(--space-2)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
            }}
          >
            Observatory
          </div>
          {NAV_ITEMS.filter((i) => i.category === 'OBSERVATORY').map(renderNavItem)}
        </div>

        {/* Subsystems Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div
            style={{
              padding: 'var(--space-2) var(--space-2) 0',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
            }}
          >
            Subsystem Laboratories
          </div>
          {NAV_ITEMS.filter((i) => i.category === 'SUBSYSTEM' || i.category === 'STORAGE').map(renderNavItem)}
        </div>

        {/* Documentation & Viva Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div
            style={{
              padding: 'var(--space-2) var(--space-2) 0',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
            }}
          >
            Knowledge & Viva
          </div>
          {NAV_ITEMS.filter((i) => i.category === 'DOCUMENTATION').map(renderNavItem)}
        </div>
      </div>

      {/* Footer System Status Banner */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-surface-subdued)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
            }}
          >
            System Status
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            <CheckCircle2 size={13} />
            ONLINE
          </span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          All 6 OS laboratories operational and integrated into the Central Observatory.
        </p>
      </div>
    </aside>
  );
};
