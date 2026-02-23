export declare class OfflineQueue {
    private readonly key;
    constructor(key?: string);
    load(): Promise<Record<string, unknown>[]>;
    enqueue(payload: Record<string, unknown>): Promise<void>;
    replaceAll(payloads: Record<string, unknown>[]): Promise<void>;
    clear(): Promise<void>;
}
