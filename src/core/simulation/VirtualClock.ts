/**
 * OScope — Deterministic Virtual Clock
 * Controls virtual simulation time progression independent of browser rendering frames or wall-clock time.
 */

export interface ClockState {
  readonly currentTime: number;
  readonly isPlaying: boolean;
  readonly playbackSpeed: number; // e.g. 0.5x, 1x, 2x, 5x
}

export type TickListener = (time: number, delta: number) => void;

export class VirtualClock {
  private currentTime: number;
  private playing: boolean;
  private speed: number;
  private readonly listeners: Set<TickListener>;

  public static readonly MIN_SPEED = 0.1;
  public static readonly MAX_SPEED = 20.0;
  public static readonly DEFAULT_SPEED = 1.0;

  constructor(initialTime: number = 0, initialSpeed: number = VirtualClock.DEFAULT_SPEED) {
    this.currentTime = Math.max(0, initialTime);
    this.playing = false;
    this.speed = this.clampSpeed(initialSpeed);
    this.listeners = new Set();
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  public getPlaybackSpeed(): number {
    return this.speed;
  }

  public getState(): ClockState {
    return Object.freeze({
      currentTime: this.currentTime,
      isPlaying: this.playing,
      playbackSpeed: this.speed,
    });
  }

  public setSpeed(newSpeed: number): void {
    if (typeof newSpeed !== 'number' || isNaN(newSpeed)) {
      return;
    }
    this.speed = this.clampSpeed(newSpeed);
  }

  public play(): void {
    this.playing = true;
  }

  public pause(): void {
    this.playing = false;
  }

  /**
   * Advances simulation time deterministically by `delta` (default: 1 tick).
   * @returns Updated simulation time
   */
  public stepForward(delta: number = 1): number {
    if (delta <= 0) return this.currentTime;
    this.currentTime += delta;
    this.notifyListeners(delta);
    return this.currentTime;
  }

  /**
   * Steps simulation time backward by `delta`, clamped at 0.
   * @returns Updated simulation time
   */
  public stepBackward(delta: number = 1): number {
    if (delta <= 0 || this.currentTime === 0) return this.currentTime;
    const actualDelta = Math.min(delta, this.currentTime);
    this.currentTime -= actualDelta;
    this.notifyListeners(-actualDelta);
    return this.currentTime;
  }

  /**
   * Directly sets the current simulation time to an absolute non-negative value.
   */
  public setTime(targetTime: number): void {
    const validTime = Math.max(0, Math.floor(targetTime));
    const delta = validTime - this.currentTime;
    if (delta !== 0) {
      this.currentTime = validTime;
      this.notifyListeners(delta);
    }
  }

  /**
   * Resets the clock to t=0 and pauses playback.
   */
  public reset(): void {
    this.pause();
    const delta = -this.currentTime;
    this.currentTime = 0;
    if (delta !== 0) {
      this.notifyListeners(delta);
    }
  }

  /**
   * Subscribes a listener to time advances.
   * @returns Unsubscribe function
   */
  public onTick(listener: TickListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(delta: number): void {
    for (const listener of this.listeners) {
      try {
        listener(this.currentTime, delta);
      } catch (err) {
        // Listener error is caught to prevent halting the clock
        console.error('VirtualClock listener error:', err);
      }
    }
  }

  private clampSpeed(speed: number): number {
    return Math.min(VirtualClock.MAX_SPEED, Math.max(VirtualClock.MIN_SPEED, speed));
  }
}
