"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleEmitter = void 0;
class SimpleEmitter {
    constructor() {
        this.listeners = {};
    }
    on(event, fn) {
        if (!this.listeners[event])
            this.listeners[event] = new Set();
        this.listeners[event].add(fn);
        return this;
    }
    off(event, fn) {
        var _a;
        (_a = this.listeners[event]) === null || _a === void 0 ? void 0 : _a.delete(fn);
        return this;
    }
    emit(event, ...args) {
        const set = this.listeners[event];
        if (!set || set.size === 0)
            return false;
        for (const fn of Array.from(set)) {
            try {
                fn(...args);
            }
            catch {
                // swallow listener errors
            }
        }
        return true;
    }
    removeAllListeners() {
        this.listeners = {};
    }
}
exports.SimpleEmitter = SimpleEmitter;
