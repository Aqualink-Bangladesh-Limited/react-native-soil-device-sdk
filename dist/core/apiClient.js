"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoilApiClient = void 0;
async function fetchWithTimeout(url, options, ms) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    }
    finally {
        clearTimeout(t);
    }
}
class SoilApiClient {
    constructor(baseUrl, apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }
    headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
        };
    }
    async verify() {
        var _a, _b, _c, _d, _e, _f;
        const url = `${this.baseUrl}/api/verify`;
        const res = await fetchWithTimeout(url, {
            method: "POST",
            headers: this.headers()
        }, 8000);
        const data = await res.json().catch(() => ({}));
        // Accept either valid: true or success: true from backend
        const valid = res.ok && ((data === null || data === void 0 ? void 0 : data.valid) === true || (data === null || data === void 0 ? void 0 : data.success) === true);
        return {
            valid,
            userId: (_b = (_a = data === null || data === void 0 ? void 0 : data.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a),
            email: (_d = (_c = data === null || data === void 0 ? void 0 : data.email) === null || _c === void 0 ? void 0 : _c.toString) === null || _d === void 0 ? void 0 : _d.call(_c),
            name: (_f = (_e = data === null || data === void 0 ? void 0 : data.name) === null || _e === void 0 ? void 0 : _e.toString) === null || _f === void 0 ? void 0 : _f.call(_e)
        };
    }
    async postData(payload) {
        var _a, _b, _c, _d;
        const res = await fetchWithTimeout(`${this.baseUrl}/api/data`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(payload)
        }, 8000);
        const data = await res.json().catch(() => ({}));
        return {
            success: (data === null || data === void 0 ? void 0 : data.success) === true,
            id: (_b = (_a = data === null || data === void 0 ? void 0 : data.id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a),
            createdAt: (_d = (_c = data === null || data === void 0 ? void 0 : data.createdAt) === null || _c === void 0 ? void 0 : _c.toString) === null || _d === void 0 ? void 0 : _d.call(_c)
        };
    }
}
exports.SoilApiClient = SoilApiClient;
