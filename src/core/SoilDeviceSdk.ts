import NetInfo, { type NetInfoSubscription } from "@react-native-community/netinfo";
import { ApiKeyInvalidError, ApiKeyVerificationFailedError, SoilSdkNotConfiguredError } from "../errors";
import type { VerifyResponse } from "../models";
import { SoilApiClient } from "./apiClient";
import { OfflineQueue } from "./offlineQueue";

export type SoilSdkConfig = {
  apiKey: string;
  queueKey?: string;
};

export class SoilDeviceSdk {
  static readonly defaultBaseUrl = "https://platform.soilapi.aqualinkbd.com";

  private static apiKey?: string;
  private static api?: SoilApiClient;
  private static queue = new OfflineQueue();

  private static verifyInfo?: VerifyResponse;
  private static verifyPromise?: Promise<VerifyResponse>;

  private static netInfoUnsub?: NetInfoSubscription;
  private static flushing = false;

  static configure(cfg: SoilSdkConfig): void {
    SoilDeviceSdk.apiKey = cfg.apiKey;
    SoilDeviceSdk.queue = new OfflineQueue(cfg.queueKey ?? "soil_device_sdk.offline_queue");
    SoilDeviceSdk.api = new SoilApiClient(SoilDeviceSdk.defaultBaseUrl, cfg.apiKey);

    // Kick off verification in background (avoid unhandled errors).
    SoilDeviceSdk.kickoffVerify().catch(() => ({ valid: false }));

    // Online listener to flush queue.
    SoilDeviceSdk.netInfoUnsub?.();
    SoilDeviceSdk.netInfoUnsub = NetInfo.addEventListener((state: any) => {
      const online = Boolean(state.isConnected) && Boolean(state.isInternetReachable ?? true);
      if (online) {
        // best-effort
        SoilDeviceSdk.flushOfflineQueue().catch(() => {});
      }
    });

    // Try once at startup.
    SoilDeviceSdk.flushOfflineQueue().catch(() => {});
  }

  static async initialize(cfg: SoilSdkConfig): Promise<VerifyResponse> {
    SoilDeviceSdk.configure(cfg);
    return SoilDeviceSdk.verifyApiKey();
  }

  static get isConfigured(): boolean {
    return Boolean(SoilDeviceSdk.apiKey && SoilDeviceSdk.api);
  }

  static get verify(): VerifyResponse | undefined {
    return SoilDeviceSdk.verifyInfo;
  }

  private static ensureConfigured(): void {
    if (!SoilDeviceSdk.isConfigured) throw new SoilSdkNotConfiguredError();
  }

  private static async kickoffVerify(): Promise<VerifyResponse> {
    if (!SoilDeviceSdk.isConfigured) return { valid: false };
    if (!SoilDeviceSdk.verifyPromise) {
      SoilDeviceSdk.verifyPromise = SoilDeviceSdk.api!
        .verify()
        .then((v) => {
          SoilDeviceSdk.verifyInfo = v;
          return v;
        })
        .catch((e) => {
          SoilDeviceSdk.verifyPromise = undefined;
          throw new ApiKeyVerificationFailedError("Could not verify API key", e);
        });
    }
    return SoilDeviceSdk.verifyPromise;
  }

  static async verifyApiKey(opts?: { force?: boolean }): Promise<VerifyResponse> {
    SoilDeviceSdk.ensureConfigured();
    if (opts?.force) {
      SoilDeviceSdk.verifyPromise = undefined;
      SoilDeviceSdk.verifyInfo = undefined;
    }
    return SoilDeviceSdk.kickoffVerify();
  }

  static async requireValidApiKey(): Promise<void> {
    const v = await SoilDeviceSdk.verifyApiKey();
    if (!v.valid) throw new ApiKeyInvalidError();
  }

  static async postOrQueue(payload: Record<string, unknown>): Promise<boolean> {
    SoilDeviceSdk.ensureConfigured();

    try {
      const v = await SoilDeviceSdk.verifyApiKey();
      if (!v.valid) throw new ApiKeyInvalidError();

      const res = await SoilDeviceSdk.api!.postData(payload);
      if (res.success) {
        SoilDeviceSdk.flushOfflineQueue().catch(() => {});
        return true;
      }

      await SoilDeviceSdk.queue.enqueue(payload);
      return false;
    } catch {
      await SoilDeviceSdk.queue.enqueue(payload);
      return false;
    }
  }

  static async flushOfflineQueue(): Promise<void> {
    if (SoilDeviceSdk.flushing) return;
    if (!SoilDeviceSdk.isConfigured) return;

    SoilDeviceSdk.flushing = true;
    try {
      const state = await NetInfo.fetch();
      const online = Boolean(state.isConnected) && Boolean(state.isInternetReachable ?? true);
      if (!online) return;

      let v: VerifyResponse;
      try {
        v = await SoilDeviceSdk.verifyApiKey();
      } catch {
        return;
      }
      if (!v.valid) return;

      const items = await SoilDeviceSdk.queue.load();
      if (!items.length) return;

      const remaining: Record<string, unknown>[] = [];
      for (let i = 0; i < items.length; i++) {
        const payload = items[i];
        try {
          const res = await SoilDeviceSdk.api!.postData(payload);
          if (!res.success) {
            remaining.push(payload, ...items.slice(i + 1));
            break;
          }
        } catch {
          remaining.push(payload, ...items.slice(i + 1));
          break;
        }
      }
      await SoilDeviceSdk.queue.replaceAll(remaining);
    } finally {
      SoilDeviceSdk.flushing = false;
    }
  }

  static async dispose(): Promise<void> {
    SoilDeviceSdk.netInfoUnsub?.();
    SoilDeviceSdk.netInfoUnsub = undefined;
  }
}
