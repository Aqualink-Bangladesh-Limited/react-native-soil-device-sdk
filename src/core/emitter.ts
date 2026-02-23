export type Listener<T extends any[] = any[]> = (...args: T) => void;

export class SimpleEmitter {
  private listeners: Record<string, Set<Listener>> = {};

  on(event: string, fn: Listener): this {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(fn);
    return this;
  }

  off(event: string, fn: Listener): this {
    this.listeners[event]?.delete(fn);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const set = this.listeners[event];
    if (!set || set.size === 0) return false;
    for (const fn of Array.from(set)) {
      try {
        fn(...args);
      } catch {
        // swallow listener errors
      }
    }
    return true;
  }

  removeAllListeners(): void {
    this.listeners = {};
  }
}
