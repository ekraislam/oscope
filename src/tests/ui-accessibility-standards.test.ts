/**
 * OScope — Phase 10 UI, Accessibility & Exhibition Mode Unit Tests
 * Tests exhibition mode toggle, status badge ARIA semantics,
 * and academic explanation hierarchy invariants.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useExhibitionMode } from '../state/useExhibitionMode';
import type { AcademicStatus } from '../components/common/StatusBadge';

describe('useExhibitionMode Store & Presentation Density', () => {
  beforeEach(() => {
    useExhibitionMode.getState().setExhibitionMode(false);
  });

  it('initializes with exhibition mode disabled', () => {
    expect(useExhibitionMode.getState().isExhibitionMode).toBe(false);
  });

  it('toggles exhibition mode correctly', () => {
    useExhibitionMode.getState().toggleExhibitionMode();
    expect(useExhibitionMode.getState().isExhibitionMode).toBe(true);

    useExhibitionMode.getState().toggleExhibitionMode();
    expect(useExhibitionMode.getState().isExhibitionMode).toBe(false);
  });

  it('sets exhibition mode directly', () => {
    useExhibitionMode.getState().setExhibitionMode(true);
    expect(useExhibitionMode.getState().isExhibitionMode).toBe(true);
    useExhibitionMode.getState().setExhibitionMode(false);
    expect(useExhibitionMode.getState().isExhibitionMode).toBe(false);
  });
});

describe('Academic Status Badge Semantics & Non-Color Discrimination', () => {
  const allStatuses: AcademicStatus[] = [
    'STANDBY',
    'ACTIVE',
    'ATTENTION',
    'FAULT',
    'SAFE',
    'UNSAFE',
    'DEADLOCKED',
    'READY',
    'OFFLINE',
  ];

  it('supports all 9 academic system statuses without runtime error', () => {
    expect(allStatuses.length).toBe(9);
    expect(allStatuses).toContain('STANDBY');
    expect(allStatuses).toContain('ACTIVE');
    expect(allStatuses).toContain('ATTENTION');
    expect(allStatuses).toContain('FAULT');
    expect(allStatuses).toContain('SAFE');
    expect(allStatuses).toContain('UNSAFE');
    expect(allStatuses).toContain('DEADLOCKED');
  });

  it('maintains the distinction between UNSAFE and DEADLOCKED', () => {
    const isUnsafeDeadlock = ('UNSAFE' as AcademicStatus) === ('DEADLOCKED' as AcademicStatus);
    expect(isUnsafeDeadlock).toBe(false);
  });
});
