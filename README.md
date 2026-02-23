# react-native-soil-device-sdk

React Native SDK for a **USB Type‑C soil sensor cable (CH34x/CH340)** that talks **Modbus‑RTU** over USB Serial and (optionally) reports readings to your server with an **offline queue**.

> Android only. USB Host / OTG is required. iOS does not allow generic USB-serial access in normal apps.

## What you get

- List USB serial devices (CH34x/CH340 preferred)
- Connect / disconnect
- Read 8 soil parameters from Modbus holding registers 0x0000–0x0007:
  - temp (°C), hum (%), EC (µS/cm), salinity (mg/L), N/P/K (mg/kg), pH
- Optional: API-key verification (`/api/verify`) and reporting (`/api/data`) with offline FIFO queue

## Install

```bash
npm i react-native-soil-device-sdk
# or
yarn add react-native-soil-device-sdk
```

Peer deps you must install (for offline queue + online detection):

```bash
yarn add @react-native-async-storage/async-storage @react-native-community/netinfo
```

## Android setup

**1) Enable USB host**

`android/app/src/main/AndroidManifest.xml`

```xml
<uses-feature android:name="android.hardware.usb.host" />

<application
  android:usesCleartextTraffic="true"
  ... />
```

**2) (Recommended) Add USB intent filter (auto-open your app when the cable plugs in)**  
Create `android/app/src/main/res/xml/soil_device_filter.xml` in your app:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <!-- WCH CH340/CH341 -->
  <usb-device vendor-id="6790" />
</resources>
```

Then add this inside your `MainActivity` in the app manifest:

```xml
<intent-filter>
  <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
</intent-filter>

<meta-data
  android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
  android:resource="@xml/soil_device_filter" />
```

## Quick start

```ts
import { SoilDeviceSdk, SoilDeviceClient } from "react-native-soil-device-sdk";

// 1) Configure once at app startup
SoilDeviceSdk.configure({ apiKey: "YOUR_API_KEY" });

// 2) Create a client
const client = new SoilDeviceClient({
  mode: "once",
  proactiveReportingSeconds: 2,
  slaveId: 1
});

// 3) List, connect, read
const devices = await client.getDeviceList();
await client.makeConnection(devices[0]);

const data = await client.getPrintingValue();
console.log(data);
```

## State management examples

See: `example/src/state/*`

- `useState` / hooks: `example/src/App.useState.tsx`
- Context + useReducer: `example/src/state/context/*`
- Redux Toolkit: `example/src/state/redux/*`
- Zustand: `example/src/state/zustand/*`
- MobX: `example/src/state/mobx/*`
- Recoil: `example/src/state/recoil/*`


## Notes / limitations

- You must physically plug the USB sensor in and accept the Android permission prompt.
- On some devices, manufacturer/product names are only available after permission is granted.
