import { SimpleEmitter } from "../core/emitter";
import type { SoilData, SoilUsbDeviceInfo } from "../models";
export type SoilReadMode = "once" | "live";
export type LocationProvider = () => Promise<{
    lat: string;
    lon: string;
} | null>;
export type SoilDeviceClientOptions = {
    proactiveReportingSeconds?: number;
    mode?: SoilReadMode;
    slaveId?: number;
    timeoutMs?: number;
    autoReport?: boolean;
    locationProvider?: LocationProvider;
};
export type SoilDeviceClientEvents = {
    data: (data: SoilData) => void;
    error: (err: unknown) => void;
};
export declare class SoilDeviceClient extends SimpleEmitter {
    private readonly proactiveReportingSeconds;
    private mode;
    private readonly slaveId;
    private readonly timeoutMs;
    private readonly autoReport;
    private readonly locationProvider?;
    private timer?;
    private inFlight;
    lastValue?: SoilData;
    constructor(opts?: SoilDeviceClientOptions);
    getDeviceList(): Promise<SoilUsbDeviceInfo[]>;
    makeConnection(device: SoilUsbDeviceInfo): Promise<void>;
    makeDisconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
    getPrintingValue(): Promise<SoilData>;
    startLive(): void;
    stopLive(): void;
    dispose(): Promise<void>;
    private reportToApi;
}
