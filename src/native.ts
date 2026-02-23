import { NativeModules, Platform } from "react-native";
import type { SoilData, SoilUsbDeviceInfo } from "./models";

const LINKING_ERROR =
  `The package 'react-native-soil-device-sdk' doesn't seem to be linked.\n` +
  Platform.select({ ios: "- iOS is not supported for USB-Serial.\n", default: "" }) +
  "- Did you run 'pod install'? (iOS)\n" +
  "- Did you rebuild the app after installing the package?\n" +
  "- Are you using Expo Go? USB requires a custom dev client / bare RN.\n";

export type SoilNativeModule = {
  listDevices(): Promise<SoilUsbDeviceInfo[]>;
  connect(deviceId: number): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  readOnce(slaveId: number, timeoutMs: number): Promise<SoilData>;
};

const SoilDeviceSdk = NativeModules.SoilDeviceSdk
  ? (NativeModules.SoilDeviceSdk as SoilNativeModule)
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        }
      }
    ) as SoilNativeModule;

export default SoilDeviceSdk;
