import { atom } from "recoil";
import type { SoilData, SoilUsbDeviceInfo } from "react-native-soil-device-sdk";

export const devicesAtom = atom<SoilUsbDeviceInfo[]>({ key: "devices", default: [] });
export const selectedAtom = atom<SoilUsbDeviceInfo | undefined>({ key: "selected", default: undefined });
export const statusAtom = atom<string>({ key: "status", default: "" });
export const dataAtom = atom<SoilData | undefined>({ key: "data", default: undefined });
