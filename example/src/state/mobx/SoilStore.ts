import { makeAutoObservable, runInAction } from "mobx";
import { SoilDeviceClient, type SoilData, type SoilUsbDeviceInfo } from "react-native-soil-device-sdk";

export class SoilStore {
  devices: SoilUsbDeviceInfo[] = [];
  selected?: SoilUsbDeviceInfo;
  status = "";
  data?: SoilData;

  private client = new SoilDeviceClient({ mode: "once", proactiveReportingSeconds: 2, slaveId: 1 });

  constructor() {
    makeAutoObservable(this);
  }

  async loadDevices() {
    try {
      const list = await this.client.getDeviceList();
      runInAction(() => {
        this.devices = list;
        this.selected = list[0];
        this.status = `Found ${list.length} device(s).`;
      });
    } catch (e) {
      runInAction(() => (this.status = `Failed: ${String(e)}`));
    }
  }

  async connect() {
    if (!this.selected) return (this.status = "Select a device first.");
    try {
      await this.client.makeConnection(this.selected);
      runInAction(() => (this.status = `Connected to ${this.selected!.displayName}`));
    } catch (e) {
      runInAction(() => (this.status = `Connect failed: ${String(e)}`));
    }
  }

  async readOnce() {
    try {
      const d = await this.client.getPrintingValue();
      runInAction(() => {
        this.data = d;
        this.status = "Read OK";
      });
    } catch (e) {
      runInAction(() => (this.status = `Read failed: ${String(e)}`));
    }
  }
}
