/**
 * OScope — Reversible Simulation Timeline
 * Records an immutable sequence of simulation snapshots to support time-travel scrub and rewind.
 */

import type { SimulationSnapshot } from '../models/simulation';

export class SimulationTimeline<TState = unknown> {
  private snapshots: SimulationSnapshot<TState>[];
  private currentIndex: number;

  constructor() {
    this.snapshots = [];
    this.currentIndex = -1;
  }

  /**
   * Appends an immutable snapshot to the timeline.
   * If the user scrubbed backward previously, future snapshots are discarded
   * to ensure linear causality.
   */
  public record(snapshot: SimulationSnapshot<TState>): void {
    if (!snapshot) return;

    // Truncate future snapshots if we branched/recorded from an earlier step
    if (this.currentIndex >= 0 && this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);
    }

    // Invariant: Non-decreasing simulation time
    if (this.snapshots.length > 0) {
      const last = this.snapshots[this.snapshots.length - 1];
      if (snapshot.simulationTime < last.simulationTime) {
        throw new Error(
          `Timeline monotonicity violation: snapshot time (${snapshot.simulationTime}) cannot be less than previous snapshot (${last.simulationTime})`
        );
      }
    }

    this.snapshots.push(Object.freeze(snapshot));
    this.currentIndex = this.snapshots.length - 1;
  }

  /**
   * Returns the current active snapshot, or null if timeline is empty.
   */
  public current(): SimulationSnapshot<TState> | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.snapshots.length) {
      return null;
    }
    return this.snapshots[this.currentIndex];
  }

  /**
   * Seeks to a specific snapshot index.
   * @param index Target 0-based index
   * @returns Snapshot at index, or null if out of bounds
   */
  public goTo(index: number): SimulationSnapshot<TState> | null {
    if (index < 0 || index >= this.snapshots.length) {
      return null;
    }
    this.currentIndex = index;
    return this.snapshots[this.currentIndex];
  }

  /**
   * Moves forward one snapshot along the recorded timeline.
   */
  public stepForward(): SimulationSnapshot<TState> | null {
    if (!this.canStepForward()) {
      return null;
    }
    this.currentIndex += 1;
    return this.snapshots[this.currentIndex];
  }

  /**
   * Moves backward one snapshot along the recorded timeline.
   */
  public stepBack(): SimulationSnapshot<TState> | null {
    if (!this.canStepBack()) {
      return null;
    }
    this.currentIndex -= 1;
    return this.snapshots[this.currentIndex];
  }

  public canStepForward(): boolean {
    return this.currentIndex < this.snapshots.length - 1;
  }

  public canStepBack(): boolean {
    return this.currentIndex > 0;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public size(): number {
    return this.snapshots.length;
  }

  /**
   * Rewinds the timeline pointer to index 0 without clearing history.
   */
  public reset(): void {
    this.currentIndex = this.snapshots.length > 0 ? 0 : -1;
  }

  /**
   * Clears all recorded snapshots.
   */
  public clear(): void {
    this.snapshots = [];
    this.currentIndex = -1;
  }

  /**
   * Returns a read-only array of all snapshots in the timeline.
   */
  public getAll(): readonly SimulationSnapshot<TState>[] {
    return Object.freeze([...this.snapshots]);
  }
}
