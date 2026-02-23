import { SoilDeviceClient } from "react-native-soil-device-sdk";
import { dataAtom, devicesAtom, selectedAtom, statusAtom } from "./atoms";
import type { SetterOrUpdater } from "recoil";

const client = new SoilDeviceClient({ mode: "once", proactiveReportingSeconds: 2, slaveId: 1 });

export async function loadDevices(
  setDevices: SetterOrUpdater<any>,
  setSelected: SetterOrUpdater<any>,
  setStatus: SetterOrUpdater<any>
) {
  try {
    const list = await client.getDeviceList();
    setDevices(list);
    setSelected(list[0]);
    setStatus(`Found ${list.length} device(s).`);
  } catch (e) {
    setStatus(`Failed: ${String(e)}`);
  }
}

export async function connect(selected: any, setStatus: SetterOrUpdater<any>) {
  if (!selected) return setStatus("Select a device first.");
  try {
    await client.makeConnection(selected);
    setStatus(`Connected to ${selected.displayName}`);
  } catch (e) {
    setStatus(`Connect failed: ${String(e)}`);
  }
}

export async function readOnce(setData: SetterOrUpdater<any>, setStatus: SetterOrUpdater<any>) {
  try {
    const d = await client.getPrintingValue();
    setData(d);
    setStatus("Read OK");
  } catch (e) {
    setStatus(`Read failed: ${String(e)}`);
  }
}
