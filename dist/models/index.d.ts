export type VerifyResponse = {
    valid: boolean;
    userId?: string;
    email?: string;
    name?: string;
};
export type DataPostResponse = {
    success: boolean;
    id?: string;
    createdAt?: string;
};
export type SoilUsbDeviceInfo = {
    deviceId: number;
    vid: number;
    pid: number;
    manufacturerName?: string | null;
    productName?: string | null;
    deviceName?: string | null;
    displayName: string;
    isCh34x: boolean;
};
export type SoilData = {
    temperatureC?: number | null;
    humidityPercent?: number | null;
    ecUsCm?: number | null;
    salinityMgL?: number | null;
    nitrogenMgKg?: number | null;
    phosphorusMgKg?: number | null;
    potassiumMgKg?: number | null;
    ph?: number | null;
};
export declare const SoilDataHelpers: {
    hasAnyReading(d: SoilData): boolean;
    toApiParameters(d: SoilData): Record<string, string>;
};
