"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModbusError = exports.UsbConnectionError = exports.ApiKeyVerificationFailedError = exports.ApiKeyInvalidError = exports.SoilSdkNotConfiguredError = exports.SoilDeviceSdkError = void 0;
class SoilDeviceSdkError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = "SoilDeviceSdkError";
        this.cause = cause;
    }
}
exports.SoilDeviceSdkError = SoilDeviceSdkError;
class SoilSdkNotConfiguredError extends SoilDeviceSdkError {
    constructor() {
        super("SoilDeviceSdk.configure() was not called.");
        this.name = "SoilSdkNotConfiguredError";
    }
}
exports.SoilSdkNotConfiguredError = SoilSdkNotConfiguredError;
class ApiKeyInvalidError extends SoilDeviceSdkError {
    constructor() {
        super("API key invalid");
        this.name = "ApiKeyInvalidError";
    }
}
exports.ApiKeyInvalidError = ApiKeyInvalidError;
class ApiKeyVerificationFailedError extends SoilDeviceSdkError {
    constructor(message, cause) {
        super(message, cause);
        this.name = "ApiKeyVerificationFailedError";
    }
}
exports.ApiKeyVerificationFailedError = ApiKeyVerificationFailedError;
class UsbConnectionError extends SoilDeviceSdkError {
    constructor(message, cause) {
        super(message, cause);
        this.name = "UsbConnectionError";
    }
}
exports.UsbConnectionError = UsbConnectionError;
class ModbusError extends SoilDeviceSdkError {
    constructor(message, cause) {
        super(message, cause);
        this.name = "ModbusError";
    }
}
exports.ModbusError = ModbusError;
