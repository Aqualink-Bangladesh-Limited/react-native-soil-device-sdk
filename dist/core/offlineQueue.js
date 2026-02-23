"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineQueue = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
class OfflineQueue {
    constructor(key = "soil_device_sdk.offline_queue") {
        this.key = key;
    }
    async load() {
        const raw = await async_storage_1.default.getItem(this.key);
        if (!raw)
            return [];
        try {
            const list = JSON.parse(raw);
            if (!Array.isArray(list))
                return [];
            return list.filter(Boolean).filter((v) => typeof v === "object");
        }
        catch {
            return [];
        }
    }
    async enqueue(payload) {
        const list = await this.load();
        list.push(payload);
        await async_storage_1.default.setItem(this.key, JSON.stringify(list));
    }
    async replaceAll(payloads) {
        await async_storage_1.default.setItem(this.key, JSON.stringify(payloads !== null && payloads !== void 0 ? payloads : []));
    }
    async clear() {
        await async_storage_1.default.removeItem(this.key);
    }
}
exports.OfflineQueue = OfflineQueue;
