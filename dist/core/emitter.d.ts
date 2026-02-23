export type Listener<T extends any[] = any[]> = (...args: T) => void;
export declare class SimpleEmitter {
    private listeners;
    on(event: string, fn: Listener): this;
    off(event: string, fn: Listener): this;
    emit(event: string, ...args: any[]): boolean;
    removeAllListeners(): void;
}
