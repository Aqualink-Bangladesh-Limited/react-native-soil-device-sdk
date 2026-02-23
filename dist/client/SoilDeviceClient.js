"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoilDeviceClient = void 0;
const emitter_1 = require("../core/emitter");
const native_1 = __importDefault(require("../native"));
const errors_1 = require("../errors");
const models_1 = require("../models");
const SoilDeviceSdk_1 = require("../core/SoilDeviceSdk");
class SoilDeviceClient extends emitter_1.SimpleEmitter {
    constructor(opts) {
        var _a, _b, _c, _d, _e;
        super();
        this.inFlight = false;
        const proactive = (_a = opts === null || opts === void 0 ? void 0 : opts.proactiveReportingSeconds) !== null && _a !== void 0 ? _a : 2;
        if (proactive < 1)
            throw new Error("proactiveReportingSeconds must be >= 1");
        this.proactiveReportingSeconds = proactive;
        this.mode = (_b = opts === null || opts === void 0 ? void 0 : opts.mode) !== null && _b !== void 0 ? _b : "once";
        this.slaveId = (_c = opts === null || opts === void 0 ? void 0 : opts.slaveId) !== null && _c !== void 0 ? _c : 1;
        this.timeoutMs = (_d = opts === null || opts === void 0 ? void 0 : opts.timeoutMs) !== null && _d !== void 0 ? _d : 1500;
        this.autoReport = (_e = opts === null || opts === void 0 ? void 0 : opts.autoReport) !== null && _e !== void 0 ? _e : true;
        this.locationProvider = opts === null || opts === void 0 ? void 0 : opts.locationProvider;
    }
    async getDeviceList() {
        const devices = await native_1.default.listDevices();
        // Already sorted by native, but keep JS stable ordering.
        return devices.slice().sort((a, b) => {
            const aIs = a.vid === 0x1a86;
            const bIs = b.vid === 0x1a86;
            if (aIs === bIs)
                return a.displayName.localeCompare(b.displayName);
            return aIs ? -1 : 1;
        });
    }
    async makeConnection(device) {
        if (!SoilDeviceSdk_1.SoilDeviceSdk.isConfigured)
            throw new errors_1.SoilSdkNotConfiguredError();
        // Ensure key is valid before allowing device connection.
        await SoilDeviceSdk_1.SoilDeviceSdk.requireValidApiKey().catch((e) => {
            if (e instanceof errors_1.ApiKeyInvalidError)
                throw e;
            throw e;
        });
        try {
            await native_1.default.connect(device.deviceId);
        }
        catch (e) {
            throw new errors_1.UsbConnectionError("USB connect failed", e);
        }
        if (this.mode === "live")
            this.startLive();
    }
    async makeDisconnect() {
        this.stopLive();
        try {
            await native_1.default.disconnect();
        }
        catch (e) {
            throw new errors_1.UsbConnectionError("USB disconnect failed", e);
        }
    }
    async isConnected() {
        try {
            return await native_1.default.isConnected();
        }
        catch {
            return false;
        }
    }
    async getPrintingValue() {
        const connected = await this.isConnected();
        if (!connected)
            throw new errors_1.UsbConnectionError("Device not connected");
        let data;
        try {
            data = await native_1.default.readOnce(this.slaveId, this.timeoutMs);
        }
        catch (e) {
            throw new errors_1.UsbConnectionError("Failed to read sensor", e);
        }
        this.lastValue = data;
        // Optional: emit even in once mode for convenience
        this.emit("data", data);
        if (this.autoReport && models_1.SoilDataHelpers.hasAnyReading(data)) {
            // best-effort
            this.reportToApi(data).catch(() => { });
        }
        return data;
    }
    startLive() {
        if (this.timer)
            return;
        this.mode = "live";
        this.timer = setInterval(async () => {
            if (this.inFlight)
                return;
            this.inFlight = true;
            try {
                const d = await this.getPrintingValue();
                this.emit("data", d);
            }
            catch (e) {
                this.emit("error", e);
            }
            finally {
                this.inFlight = false;
            }
        }, this.proactiveReportingSeconds * 1000);
    }
    stopLive() {
        if (this.timer)
            clearInterval(this.timer);
        this.timer = undefined;
    }
    async dispose() {
        this.stopLive();
        await this.makeDisconnect().catch(() => { });
        this.removeAllListeners();
    }
    async reportToApi(data) {
        var _a, _b, _c, _d;
        const loc = await ((_b = (_a = this.locationProvider) === null || _a === void 0 ? void 0 : _a.call(this).catch(() => null)) !== null && _b !== void 0 ? _b : null);
        const payload = {
            location: {
                lat: (_c = loc === null || loc === void 0 ? void 0 : loc.lat) !== null && _c !== void 0 ? _c : "--",
                lon: (_d = loc === null || loc === void 0 ? void 0 : loc.lon) !== null && _d !== void 0 ? _d : "--"
            },
            parameters: models_1.SoilDataHelpers.toApiParameters(data)
        };
        await SoilDeviceSdk_1.SoilDeviceSdk.postOrQueue(payload);
    }
}
exports.SoilDeviceClient = SoilDeviceClient;
