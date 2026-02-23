import type { VerifyResponse } from "../models";
export type SoilSdkConfig = {
    apiKey: string;
    queueKey?: string;
};
export declare class SoilDeviceSdk {
    static readonly defaultBaseUrl = "https://platform.soilapi.aqualinkbd.com";
    private static apiKey?;
    private static api?;
    private static queue;
    private static verifyInfo?;
    private static verifyPromise?;
    private static netInfoUnsub?;
    private static flushing;
    static configure(cfg: SoilSdkConfig): void;
    static initialize(cfg: SoilSdkConfig): Promise<VerifyResponse>;
    static get isConfigured(): boolean;
    static get verify(): VerifyResponse | undefined;
    private static ensureConfigured;
    private static kickoffVerify;
    static verifyApiKey(opts?: {
        force?: boolean;
    }): Promise<VerifyResponse>;
    static requireValidApiKey(): Promise<void>;
    static postOrQueue(payload: Record<string, unknown>): Promise<boolean>;
    static flushOfflineQueue(): Promise<void>;
    static dispose(): Promise<void>;
}
