# API Reference

## Types

### `SoilUsbDeviceInfo`
Represents a USB device discovered on Android.

```ts
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
```

### `SoilData`
Parsed readings from Modbus holding registers 0x0000–0x0007.

```ts
export type SoilData = {
  temperatureC?: number | null;     // signed /10
  humidityPercent?: number | null;  // /10
  ecUsCm?: number | null;
  salinityMgL?: number | null;
  nitrogenMgKg?: number | null;
  phosphorusMgKg?: number | null;
  potassiumMgKg?: number | null;
  ph?: number | null;              // /100
};
```

`SoilData.toApiParameters()` matches your backend fields:

```ts
{
  temp: "23.4",
  hum: "45.1",
  ph: "6.86",
  ec: "343",
  salin: "34",
  nitro: "34",
  phos: "34",
  potas: "343"
}
```

### `VerifyResponse`

```ts
export type VerifyResponse = {
  valid: boolean;
  userId?: string;
  email?: string;
  name?: string;
};
```

---

## `SoilDeviceSdk` (global)

### `configure({ apiKey, queueKey? })`

Configures global API behavior (verify + offline queue flushing). The API base URL is fixed inside the SDK.

```ts
SoilDeviceSdk.configure({
  apiKey: "YOUR_API_KEY"
});
```

### `initialize({ apiKey, queueKey? }) => Promise<VerifyResponse>`

Same as `configure`, but waits for the first verification.

### `verifyApiKey({ force? }) => Promise<VerifyResponse>`

Calls `POST /api/verify`. Uses a single in-flight request and caches the latest result.

### `requireValidApiKey() => Promise<void>`

Throws `ApiKeyInvalidError` if the verify response is `{ valid: false }`.

### `postOrQueue(payload) => Promise<boolean>`

Attempts `POST /api/data`. If offline or fails, queues payload locally.

Returns:
- `true` if posted now
- `false` if queued

### `flushOfflineQueue() => Promise<void>`

Flushes queued payloads sequentially (FIFO). Stops at first failure to preserve order.

### `dispose() => Promise<void>`

Unsubscribes connectivity listener.

---

## `SoilDeviceClient`

Create a client per screen/module (or a singleton in your state layer).

```ts
const client = new SoilDeviceClient({
  mode: "once" | "live",
  proactiveReportingSeconds: 2,
  slaveId: 1,
  timeoutMs: 1500,
  autoReport: true,
  locationProvider: async () => ({ lat: "23.7808", lon: "90.4071" })
});
```

### `getDeviceList() => Promise<SoilUsbDeviceInfo[]>`

Lists USB devices and sorts CH34x (VID=0x1A86) first.

### `makeConnection(device) => Promise<void>`

Requests Android USB permission if needed, then opens the serial port.

Also checks your API key validity first (throws `ApiKeyInvalidError`).

If `mode === "live"`, it starts an internal loop and emits:

- `client.on("data", (d) => ...)`
- `client.on("error", (e) => ...)`

### `makeDisconnect() => Promise<void>`

Stops live loop and closes the serial port.

### `getPrintingValue() => Promise<SoilData>`

Reads once from the device:
- Sends Modbus FC 0x03 request (start=0, count=8)
- Parses response + CRC
- Converts registers to `SoilData`

If `autoReport` is enabled, it will also report in background:
- Builds payload `{ location: { lat, lon }, parameters }`
- Calls `SoilDeviceSdk.postOrQueue(payload)`

### `startLive()` / `stopLive()`

You can start/stop the loop manually even if you constructed with `mode: "once"`.

### `dispose() => Promise<void>`

Calls `makeDisconnect()` and removes all listeners.
