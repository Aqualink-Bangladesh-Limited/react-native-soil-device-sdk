export class SoilDeviceSdkError extends Error {
  public cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SoilDeviceSdkError";
    this.cause = cause;
  }
}

export class SoilSdkNotConfiguredError extends SoilDeviceSdkError {
  constructor() {
    super("SoilDeviceSdk.configure() was not called.");
    this.name = "SoilSdkNotConfiguredError";
  }
}

export class ApiKeyInvalidError extends SoilDeviceSdkError {
  constructor() {
    super("API key invalid");
    this.name = "ApiKeyInvalidError";
  }
}

export class ApiKeyVerificationFailedError extends SoilDeviceSdkError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "ApiKeyVerificationFailedError";
  }
}

export class UsbConnectionError extends SoilDeviceSdkError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "UsbConnectionError";
  }
}

export class ModbusError extends SoilDeviceSdkError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "ModbusError";
  }
}
