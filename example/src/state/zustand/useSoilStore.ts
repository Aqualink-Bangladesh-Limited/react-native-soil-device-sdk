import { create } from "zustand";
import { SoilDeviceClient, type SoilData, type SoilUsbDeviceInfo } from "react-native-soil-device-sdk";

const client = new SoilDeviceClient({ mode: "once", proactiveReportingSeconds: 2, slaveId: 1 });

type SoilStore = {
  devices: SoilUsbDeviceInfo[];
  selected?: SoilUsbDeviceInfo;
  status: string;
  data?: SoilData;
  loadDevices(): Promise<void>;
  connect(): Promise<void>;
  readOnce(): Promise<void>;
};

export const useSoilStore = create<SoilStore>((set, get) => ({
  devices: [],
  status: "",
  async loadDevices() {
    try {
      const list = await client.getDeviceList();
      set({ devices: list, selected: list[0], status: `Found ${list.length} device(s).` });
    } catch (e) {
      set({ status: `Failed: ${String(e)}` });
    }
  },
  async connect() {
    const d = get().selected;
    if (!d) return set({ status: "Select a device first." });
    try {
      await client.makeConnection(d);
      set({ status: `Connected to ${d.displayName}` });
    } catch (e) {
      set({ status: `Connect failed: ${String(e)}` });
    }
  },
  async readOnce() {
    try {
      const data = await client.getPrintingValue();
      set({ data, status: "Read OK" });
    } catch (e) {
      set({ status: `Read failed: ${String(e)}` });
    }
  }
}));
