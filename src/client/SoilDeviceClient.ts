import { SimpleEmitter } from "../core/emitter";
import SoilNative from "../native";
import { ApiKeyInvalidError, SoilSdkNotConfiguredError, UsbConnectionError } from "../errors";
import type { SoilData, SoilUsbDeviceInfo } from "../models";
import { SoilDataHelpers } from "../models";
import { SoilDeviceSdk } from "../core/SoilDeviceSdk";

export type SoilReadMode = "once" | "live";

export type LocationProvider = () => Promise<{ lat: string; lon: string } | null>;

export type SoilDeviceClientOptions = {
  proactiveReportingSeconds?: number; // >=1
  mode?: SoilReadMode;
  slaveId?: number; // default 1
  timeoutMs?: number; // default 1500
  autoReport?: boolean; // default true
  locationProvider?: LocationProvider; // optional
};

export type SoilDeviceClientEvents = {
  data: (data: SoilData) => void;
  error: (err: unknown) => void;
};

export class SoilDeviceClient extends SimpleEmitter {
  private readonly proactiveReportingSeconds: number;
  private mode: SoilReadMode;
  private readonly slaveId: number;
  private readonly timeoutMs: number;
  private readonly autoReport: boolean;
  private readonly locationProvider?: LocationProvider;

  private timer?: ReturnType<typeof setInterval>;
  private inFlight = false;

  public lastValue?: SoilData;

  constructor(opts?: SoilDeviceClientOptions) {
    super();
    const proactive = opts?.proactiveReportingSeconds ?? 2;
    if (proactive < 1) throw new Error("proactiveReportingSeconds must be >= 1");
    this.proactiveReportingSeconds = proactive;

    this.mode = opts?.mode ?? "once";
    this.slaveId = opts?.slaveId ?? 1;
    this.timeoutMs = opts?.timeoutMs ?? 1500;
    this.autoReport = opts?.autoReport ?? true;
    this.locationProvider = opts?.locationProvider;
  }

  async getDeviceList(): Promise<SoilUsbDeviceInfo[]> {
    const devices = await SoilNative.listDevices();
    // Already sorted by native, but keep JS stable ordering.
    return devices.slice().sort((a, b) => {
      const aIs = a.vid === 0x1a86;
      const bIs = b.vid === 0x1a86;
      if (aIs === bIs) return a.displayName.localeCompare(b.displayName);
      return aIs ? -1 : 1;
    });
  }

  async makeConnection(device: SoilUsbDeviceInfo): Promise<void> {
    if (!SoilDeviceSdk.isConfigured) throw new SoilSdkNotConfiguredError();

    // Ensure key is valid before allowing device connection.
    await SoilDeviceSdk.requireValidApiKey().catch((e) => {
      if (e instanceof ApiKeyInvalidError) throw e;
      throw e;
    });

    try {
      await SoilNative.connect(device.deviceId);
    } catch (e) {
      throw new UsbConnectionError("USB connect failed", e);
    }

    if (this.mode === "live") this.startLive();
  }

  async makeDisconnect(): Promise<void> {
    this.stopLive();
    try {
      await SoilNative.disconnect();
    } catch (e) {
      throw new UsbConnectionError("USB disconnect failed", e);
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      return await SoilNative.isConnected();
    } catch {
      return false;
    }
  }

  async getPrintingValue(): Promise<SoilData> {
    const connected = await this.isConnected();
    if (!connected) throw new UsbConnectionError("Device not connected");

    let data: SoilData;
    try {
      data = await SoilNative.readOnce(this.slaveId, this.timeoutMs);
    } catch (e) {
      throw new UsbConnectionError("Failed to read sensor", e);
    }

    this.lastValue = data;

    // Optional: emit even in once mode for convenience
    this.emit("data", data);

    if (this.autoReport && SoilDataHelpers.hasAnyReading(data)) {
      // best-effort
      this.reportToApi(data).catch(() => {});
    }
    return data;
  }

  startLive(): void {
    if (this.timer) return;
    this.mode = "live";

    this.timer = setInterval(async () => {
      if (this.inFlight) return;
      this.inFlight = true;
      try {
        const d = await this.getPrintingValue();
        this.emit("data", d);
      } catch (e) {
        this.emit("error", e);
      } finally {
        this.inFlight = false;
      }
    }, this.proactiveReportingSeconds * 1000);
  }

  stopLive(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  async dispose(): Promise<void> {
    this.stopLive();
    await this.makeDisconnect().catch(() => {});
    this.removeAllListeners();
  }

  private async reportToApi(data: SoilData): Promise<void> {
    const loc = await (this.locationProvider?.().catch(() => null) ?? null);

    const payload: Record<string, unknown> = {
      location: {
        lat: loc?.lat ?? "--",
        lon: loc?.lon ?? "--"
      },
      parameters: SoilDataHelpers.toApiParameters(data)
    };

    await SoilDeviceSdk.postOrQueue(payload);
  }
}
