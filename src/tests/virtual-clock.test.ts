import { describe, it, expect, vi } from 'vitest';
import { VirtualClock } from '../core/simulation/VirtualClock';

describe('VirtualClock', () => {
  it('initializes with default time t=0 and paused state', () => {
    const clock = new VirtualClock();
    expect(clock.getCurrentTime()).toBe(0);
    expect(clock.isPlaying()).toBe(false);
    expect(clock.getPlaybackSpeed()).toBe(1.0);
  });

  it('increments time deterministically on stepForward', () => {
    const clock = new VirtualClock(0);
    expect(clock.stepForward(1)).toBe(1);
    expect(clock.stepForward(5)).toBe(6);
    expect(clock.getCurrentTime()).toBe(6);
  });

  it('decrements time on stepBackward and clamps at 0', () => {
    const clock = new VirtualClock(5);
    expect(clock.stepBackward(2)).toBe(3);
    expect(clock.stepBackward(10)).toBe(0); // Clamped at 0
    expect(clock.getCurrentTime()).toBe(0);
  });

  it('controls play and pause state flags', () => {
    const clock = new VirtualClock();
    expect(clock.isPlaying()).toBe(false);
    clock.play();
    expect(clock.isPlaying()).toBe(true);
    clock.pause();
    expect(clock.isPlaying()).toBe(false);
  });

  it('clamps playback speed between MIN_SPEED and MAX_SPEED', () => {
    const clock = new VirtualClock();
    clock.setSpeed(2.5);
    expect(clock.getPlaybackSpeed()).toBe(2.5);

    clock.setSpeed(999);
    expect(clock.getPlaybackSpeed()).toBe(VirtualClock.MAX_SPEED);

    clock.setSpeed(-5);
    expect(clock.getPlaybackSpeed()).toBe(VirtualClock.MIN_SPEED);
  });

  it('notifies registered tick listeners when time changes', () => {
    const clock = new VirtualClock(0);
    const listener = vi.fn();
    const unsubscribe = clock.onTick(listener);

    clock.stepForward(3);
    expect(listener).toHaveBeenCalledWith(3, 3);

    clock.stepBackward(1);
    expect(listener).toHaveBeenCalledWith(2, -1);

    unsubscribe();
    clock.stepForward(1);
    expect(listener).toHaveBeenCalledTimes(2); // No new calls after unsubscribe
  });

  it('resets time to 0 and pauses playback', () => {
    const clock = new VirtualClock(25);
    clock.play();
    clock.reset();

    expect(clock.getCurrentTime()).toBe(0);
    expect(clock.isPlaying()).toBe(false);
  });
});
