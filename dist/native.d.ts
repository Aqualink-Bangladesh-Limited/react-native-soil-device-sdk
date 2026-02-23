import type { SoilData, SoilUsbDeviceInfo } from "./models";
export type SoilNativeModule = {
    listDevices(): Promise<SoilUsbDeviceInfo[]>;
    connect(deviceId: number): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
    readOnce(slaveId: number, timeoutMs: number): Promise<SoilData>;
};
declare const SoilDeviceSdk: SoilNativeModule;
export default SoilDeviceSdk;
