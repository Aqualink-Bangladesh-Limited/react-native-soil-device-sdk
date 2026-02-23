"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoilDeviceSdk = void 0;
const netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
const errors_1 = require("../errors");
const apiClient_1 = require("./apiClient");
const offlineQueue_1 = require("./offlineQueue");
class SoilDeviceSdk {
    static configure(cfg) {
        var _a, _b;
        SoilDeviceSdk.apiKey = cfg.apiKey;
        SoilDeviceSdk.queue = new offlineQueue_1.OfflineQueue((_a = cfg.queueKey) !== null && _a !== void 0 ? _a : "soil_device_sdk.offline_queue");
        SoilDeviceSdk.api = new apiClient_1.SoilApiClient(SoilDeviceSdk.defaultBaseUrl, cfg.apiKey);
        // Kick off verification in background (avoid unhandled errors).
        SoilDeviceSdk.kickoffVerify().catch(() => ({ valid: false }));
        // Online listener to flush queue.
        (_b = SoilDeviceSdk.netInfoUnsub) === null || _b === void 0 ? void 0 : _b.call(SoilDeviceSdk);
        SoilDeviceSdk.netInfoUnsub = netinfo_1.default.addEventListener((state) => {
            var _a;
            const online = Boolean(state.isConnected) && Boolean((_a = state.isInternetReachable) !== null && _a !== void 0 ? _a : true);
            if (online) {
                // best-effort
                SoilDeviceSdk.flushOfflineQueue().catch(() => { });
            }
        });
        // Try once at startup.
        SoilDeviceSdk.flushOfflineQueue().catch(() => { });
    }
    static async initialize(cfg) {
        SoilDeviceSdk.configure(cfg);
        return SoilDeviceSdk.verifyApiKey();
    }
    static get isConfigured() {
        return Boolean(SoilDeviceSdk.apiKey && SoilDeviceSdk.api);
    }
    static get verify() {
        return SoilDeviceSdk.verifyInfo;
    }
    static ensureConfigured() {
        if (!SoilDeviceSdk.isConfigured)
            throw new errors_1.SoilSdkNotConfiguredError();
    }
    static async kickoffVerify() {
        if (!SoilDeviceSdk.isConfigured)
            return { valid: false };
        if (!SoilDeviceSdk.verifyPromise) {
            SoilDeviceSdk.verifyPromise = SoilDeviceSdk.api
                .verify()
                .then((v) => {
                SoilDeviceSdk.verifyInfo = v;
                return v;
            })
                .catch((e) => {
                SoilDeviceSdk.verifyPromise = undefined;
                throw new errors_1.ApiKeyVerificationFailedError("Could not verify API key", e);
            });
        }
        return SoilDeviceSdk.verifyPromise;
    }
    static async verifyApiKey(opts) {
        SoilDeviceSdk.ensureConfigured();
        if (opts === null || opts === void 0 ? void 0 : opts.force) {
            SoilDeviceSdk.verifyPromise = undefined;
            SoilDeviceSdk.verifyInfo = undefined;
        }
        return SoilDeviceSdk.kickoffVerify();
    }
    static async requireValidApiKey() {
        const v = await SoilDeviceSdk.verifyApiKey();
        if (!v.valid)
            throw new errors_1.ApiKeyInvalidError();
    }
    static async postOrQueue(payload) {
        SoilDeviceSdk.ensureConfigured();
        try {
            const v = await SoilDeviceSdk.verifyApiKey();
            if (!v.valid)
                throw new errors_1.ApiKeyInvalidError();
            const res = await SoilDeviceSdk.api.postData(payload);
            if (res.success) {
                SoilDeviceSdk.flushOfflineQueue().catch(() => { });
                return true;
            }
            await SoilDeviceSdk.queue.enqueue(payload);
            return false;
        }
        catch {
            await SoilDeviceSdk.queue.enqueue(payload);
            return false;
        }
    }
    static async flushOfflineQueue() {
        var _a;
        if (SoilDeviceSdk.flushing)
            return;
        if (!SoilDeviceSdk.isConfigured)
            return;
        SoilDeviceSdk.flushing = true;
        try {
            const state = await netinfo_1.default.fetch();
            const online = Boolean(state.isConnected) && Boolean((_a = state.isInternetReachable) !== null && _a !== void 0 ? _a : true);
            if (!online)
                return;
            let v;
            try {
                v = await SoilDeviceSdk.verifyApiKey();
            }
            catch {
                return;
            }
            if (!v.valid)
                return;
            const items = await SoilDeviceSdk.queue.load();
            if (!items.length)
                return;
            const remaining = [];
            for (let i = 0; i < items.length; i++) {
                const payload = items[i];
                try {
                    const res = await SoilDeviceSdk.api.postData(payload);
                    if (!res.success) {
                        remaining.push(payload, ...items.slice(i + 1));
                        break;
                    }
                }
                catch {
                    remaining.push(payload, ...items.slice(i + 1));
                    break;
                }
            }
            await SoilDeviceSdk.queue.replaceAll(remaining);
        }
        finally {
            SoilDeviceSdk.flushing = false;
        }
    }
    static async dispose() {
        var _a;
        (_a = SoilDeviceSdk.netInfoUnsub) === null || _a === void 0 ? void 0 : _a.call(SoilDeviceSdk);
        SoilDeviceSdk.netInfoUnsub = undefined;
    }
}
exports.SoilDeviceSdk = SoilDeviceSdk;
SoilDeviceSdk.defaultBaseUrl = "https://platform.soilapi.aqualinkbd.com";
SoilDeviceSdk.queue = new offlineQueue_1.OfflineQueue();
SoilDeviceSdk.flushing = false;
