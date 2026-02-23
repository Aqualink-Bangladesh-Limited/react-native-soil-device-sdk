import React, { createContext, useContext, useMemo, useReducer } from "react";
import { SoilDeviceClient, type SoilData, type SoilUsbDeviceInfo } from "react-native-soil-device-sdk";

type State = {
  devices: SoilUsbDeviceInfo[];
  selected?: SoilUsbDeviceInfo;
  status: string;
  connecting: boolean;
  data?: SoilData;
};

type Action =
  | { type: "SET_DEVICES"; devices: SoilUsbDeviceInfo[] }
  | { type: "SELECT"; device?: SoilUsbDeviceInfo }
  | { type: "STATUS"; status: string }
  | { type: "CONNECTING"; connecting: boolean }
  | { type: "DATA"; data?: SoilData };

const initialState: State = { devices: [], status: "", connecting: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DEVICES":
      return { ...state, devices: action.devices, selected: action.devices[0] };
    case "SELECT":
      return { ...state, selected: action.device };
    case "STATUS":
      return { ...state, status: action.status };
    case "CONNECTING":
      return { ...state, connecting: action.connecting };
    case "DATA":
      return { ...state, data: action.data };
    default:
      return state;
  }
}

type Ctx = {
  state: State;
  client: SoilDeviceClient;
  actions: {
    loadDevices(): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    readOnce(): Promise<void>;
  };
};

const SoilCtx = createContext<Ctx | null>(null);

export function SoilProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const client = useMemo(
    () =>
      new SoilDeviceClient({
        mode: "once",
        proactiveReportingSeconds: 2,
        slaveId: 1
      }),
    []
  );

  const actions = useMemo(
    () => ({
      async loadDevices() {
        try {
          const list = await client.getDeviceList();
          dispatch({ type: "SET_DEVICES", devices: list });
          dispatch({ type: "STATUS", status: `Found ${list.length} device(s).` });
        } catch (e) {
          dispatch({ type: "STATUS", status: `Failed to load devices: ${String(e)}` });
        }
      },
      async connect() {
        if (!state.selected) return dispatch({ type: "STATUS", status: "Select a device first." });
        dispatch({ type: "CONNECTING", connecting: true });
        try {
          await client.makeConnection(state.selected);
          dispatch({ type: "STATUS", status: `Connected to ${state.selected.displayName}` });
        } catch (e) {
          dispatch({ type: "STATUS", status: `Connection failed: ${String(e)}` });
        } finally {
          dispatch({ type: "CONNECTING", connecting: false });
        }
      },
      async disconnect() {
        await client.makeDisconnect();
        dispatch({ type: "STATUS", status: "Disconnected" });
      },
      async readOnce() {
        const d = await client.getPrintingValue();
        dispatch({ type: "DATA", data: d });
      }
    }),
    [client, state.selected]
  );

  return <SoilCtx.Provider value={{ state, client, actions }}>{children}</SoilCtx.Provider>;
}

export function useSoil() {
  const v = useContext(SoilCtx);
  if (!v) throw new Error("useSoil must be used inside SoilProvider");
  return v;
}
