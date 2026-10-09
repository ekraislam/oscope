/**
 * OScope — Deterministic Priority Event Queue
 * Orders events chronologically by timestamp ascending, with sequenceNumber tie-breaking.
 */

import type { SimulationEvent } from '../models/simulation';

export class EventQueue {
  private events: SimulationEvent[];

  constructor(initialEvents?: readonly SimulationEvent[]) {
    this.events = [];
    if (initialEvents && initialEvents.length > 0) {
      this.enqueueBatch(initialEvents);
    }
  }

  /**
   * Adds an event into the queue at its deterministic sorted position.
   */
  public enqueue(event: SimulationEvent): void {
    if (!event) return;

    // Binary search to find insertion point for O(log n) search + O(n) splice
    let low = 0;
    let high = this.events.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const comparison = this.compareEvents(event, this.events[mid]);
      if (comparison < 0) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    this.events.splice(low, 0, event);
  }

  /**
   * Adds multiple events in bulk.
   */
  public enqueueBatch(events: readonly SimulationEvent[]): void {
    for (const evt of events) {
      this.enqueue(evt);
    }
  }

  /**
   * Returns the next event without removing it, or null if empty.
   */
  public peek(): SimulationEvent | null {
    return this.events.length > 0 ? this.events[0] : null;
  }

  /**
   * Removes and returns the highest priority (earliest) event, or null if empty.
   */
  public dequeue(): SimulationEvent | null {
    return this.events.length > 0 ? this.events.shift()! : null;
  }

  /**
   * Dequeues all events scheduled at or before the specified virtual timestamp.
   */
  public dequeueUpTo(timestamp: number): SimulationEvent[] {
    const ready: SimulationEvent[] = [];
    while (this.events.length > 0 && this.events[0].timestamp <= timestamp) {
      ready.push(this.events.shift()!);
    }
    return ready;
  }

  /**
   * Checks if the queue has no events.
   */
  public isEmpty(): boolean {
    return this.events.length === 0;
  }

  /**
   * Returns current count of queued events.
   */
  public size(): number {
    return this.events.length;
  }

  /**
   * Clears all events from the queue.
   */
  public clear(): void {
    this.events = [];
  }

  /**
   * Returns an immutable copy of all queued events.
   */
  public getAll(): readonly SimulationEvent[] {
    return Object.freeze([...this.events]);
  }

  /**
   * Deterministic comparison:
   * 1. Primary: timestamp ascending
   * 2. Secondary: sequenceNumber ascending
   */
  private compareEvents(a: SimulationEvent, b: SimulationEvent): number {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    return a.sequenceNumber - b.sequenceNumber;
  }
}
