export type VerifyResponse = {
  valid: boolean;
  userId?: string;
  email?: string;
  name?: string;
};

export type DataPostResponse = {
  success: boolean;
  id?: string;
  createdAt?: string;
};

export type SoilUsbDeviceInfo = {
  deviceId: number;
  vid: number;
  pid: number;
  manufacturerName?: string | null;
  productName?: string | null;
  deviceName?: string | null;
  displayName: string;
  isCh34x: boolean;
};

export type SoilData = {
  temperatureC?: number | null;
  humidityPercent?: number | null;
  ecUsCm?: number | null;
  salinityMgL?: number | null;
  nitrogenMgKg?: number | null;
  phosphorusMgKg?: number | null;
  potassiumMgKg?: number | null;
  ph?: number | null;
};

export const SoilDataHelpers = {
  hasAnyReading(d: SoilData): boolean {
    return (
      d.temperatureC != null ||
      d.humidityPercent != null ||
      d.ecUsCm != null ||
      d.salinityMgL != null ||
      d.nitrogenMgKg != null ||
      d.phosphorusMgKg != null ||
      d.potassiumMgKg != null ||
      d.ph != null
    );
  },

  toApiParameters(d: SoilData): Record<string, string> {
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
