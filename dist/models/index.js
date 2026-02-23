"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoilDataHelpers = void 0;
exports.SoilDataHelpers = {
    hasAnyReading(d) {
        return (d.temperatureC != null ||
            d.humidityPercent != null ||
            d.ecUsCm != null ||
            d.salinityMgL != null ||
            d.nitrogenMgKg != null ||
            d.phosphorusMgKg != null ||
            d.potassiumMgKg != null ||
            d.ph != null);
    },
    toApiParameters(d) {
        return {
            temp: d.temperatureC != null ? Number(d.temperatureC).toFixed(1) : "",
            hum: d.humidityPercent != null ? Number(d.humidityPercent).toFixed(1) : "",
            ph: d.ph != null ? Number(d.ph).toFixed(2) : "",
            ec: d.ecUsCm != null ? String(d.ecUsCm) : "",
            salin: d.salinityMgL != null ? String(d.salinityMgL) : "",
            nitro: d.nitrogenMgKg != null ? String(d.nitrogenMgKg) : "",
            phos: d.phosphorusMgKg != null ? String(d.phosphorusMgKg) : "",
            potas: d.potassiumMgKg != null ? String(d.potassiumMgKg) : ""
        };
    }
};
