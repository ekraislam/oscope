import { describe, it, expect } from 'vitest';
import { EventQueue } from '../core/simulation/EventQueue';
import { createSimulationEvent } from '../core/models/simulation';

describe('EventQueue', () => {
  it('initializes empty', () => {
    const queue = new EventQueue();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size()).toBe(0);
    expect(queue.peek()).toBeNull();
    expect(queue.dequeue()).toBeNull();
  });

  it('orders events chronologically by timestamp ascending', () => {
    const queue = new EventQueue();

    const evt10 = createSimulationEvent({
      timestamp: 10,
      type: 'PROCESS_TERMINATED',
      sourceModule: 'CPU',
      description: 'P1 terminated',
    });

    const evt2 = createSimulationEvent({
      timestamp: 2,
      type: 'PROCESS_DISPATCHED',
      sourceModule: 'CPU',
      description: 'P1 dispatched',
    });

    const evt0 = createSimulationEvent({
      timestamp: 0,
      type: 'PROCESS_CREATED',
      sourceModule: 'CPU',
      description: 'P1 created',
    });

    queue.enqueue(evt10);
    queue.enqueue(evt2);
    queue.enqueue(evt0);

    expect(queue.size()).toBe(3);
    expect(queue.dequeue()?.timestamp).toBe(0);
    expect(queue.dequeue()?.timestamp).toBe(2);
    expect(queue.dequeue()?.timestamp).toBe(10);
    expect(queue.isEmpty()).toBe(true);
  });

  it('breaks ties deterministically using sequenceNumber for identical timestamps', () => {
    const queue = new EventQueue();

    const evtA = createSimulationEvent({
      timestamp: 5,
      type: 'PAGE_FAULT',
      sourceModule: 'MEMORY',
      description: 'First event at t=5',
      sequenceNumber: 101,
    });

    const evtB = createSimulationEvent({
      timestamp: 5,
      type: 'CONTEXT_SWITCH',
      sourceModule: 'CPU',
      description: 'Second event at t=5',
      sequenceNumber: 102,
    });

    // Enqueue in reverse sequence order
    queue.enqueue(evtB);
    queue.enqueue(evtA);

    const firstOut = queue.dequeue();
    const secondOut = queue.dequeue();

    expect(firstOut?.description).toBe('First event at t=5');
    expect(secondOut?.description).toBe('Second event at t=5');
  });

  it('dequeues all events up to a given virtual timestamp with dequeueUpTo', () => {
    const queue = new EventQueue();

    queue.enqueue(
      createSimulationEvent({ timestamp: 0, type: 'PROCESS_CREATED', sourceModule: 'CPU', description: 't=0' })
    );
    queue.enqueue(
      createSimulationEvent({ timestamp: 3, type: 'PROCESS_DISPATCHED', sourceModule: 'CPU', description: 't=3' })
    );
    queue.enqueue(
      createSimulationEvent({ timestamp: 5, type: 'PROCESS_BLOCKED_IO', sourceModule: 'CPU', description: 't=5' })
    );
    queue.enqueue(
      createSimulationEvent({ timestamp: 8, type: 'PROCESS_TERMINATED', sourceModule: 'CPU', description: 't=8' })
    );

    const readyAt3 = queue.dequeueUpTo(3);
    expect(readyAt3).toHaveLength(2);
    expect(readyAt3.map((e) => e.timestamp)).toEqual([0, 3]);

    expect(queue.size()).toBe(2);
    expect(queue.peek()?.timestamp).toBe(5);
  });

  it('clears all queued events', () => {
    const queue = new EventQueue();
    queue.enqueue(
      createSimulationEvent({ timestamp: 1, type: 'CLOCK_TICK', sourceModule: 'CLOCK', description: 'tick' })
    );
    expect(queue.size()).toBe(1);
    queue.clear();
    expect(queue.size()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });
});
