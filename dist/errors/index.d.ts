export declare class SoilDeviceSdkError extends Error {
    cause?: unknown;
    constructor(message: string, cause?: unknown);
}
export declare class SoilSdkNotConfiguredError extends SoilDeviceSdkError {
    constructor();
}
export declare class ApiKeyInvalidError extends SoilDeviceSdkError {
    constructor();
}
export declare class ApiKeyVerificationFailedError extends SoilDeviceSdkError {
    constructor(message: string, cause?: unknown);
}
export declare class UsbConnectionError extends SoilDeviceSdkError {
    constructor(message: string, cause?: unknown);
}
export declare class ModbusError extends SoilDeviceSdkError {
    constructor(message: string, cause?: unknown);
}
