import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { SoilDeviceClient, type SoilData, type SoilUsbDeviceInfo } from "react-native-soil-device-sdk";

const client = new SoilDeviceClient({ mode: "once", proactiveReportingSeconds: 2, slaveId: 1 });

export const loadDevices = createAsyncThunk("soil/loadDevices", async () => {
  return await client.getDeviceList();
});

export const connectDevice = createAsyncThunk("soil/connect", async (device: SoilUsbDeviceInfo) => {
  await client.makeConnection(device);
  return device;
});

export const readOnce = createAsyncThunk("soil/readOnce", async () => {
  return await client.getPrintingValue();
});

type SoilState = {
  devices: SoilUsbDeviceInfo[];
  selected?: SoilUsbDeviceInfo;
  status: string;
  data?: SoilData;
};

const initialState: SoilState = { devices: [], status: "" };

const soilSlice = createSlice({
  name: "soil",
  initialState,
  reducers: {
    select(state, action: PayloadAction<SoilUsbDeviceInfo | undefined>) {
      state.selected = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadDevices.fulfilled, (state, action) => {
      state.devices = action.payload;
      state.selected = action.payload[0];
      state.status = `Found ${action.payload.length} device(s).`;
    });
    builder.addCase(loadDevices.rejected, (state, action) => {
      state.status = String(action.error.message ?? "Failed");
    });
    builder.addCase(connectDevice.fulfilled, (state, action) => {
      state.status = `Connected to ${action.payload.displayName}`;
    });
    builder.addCase(connectDevice.rejected, (state, action) => {
      state.status = String(action.error.message ?? "Connect failed");
    });
    builder.addCase(readOnce.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = "Read OK";
    });
    builder.addCase(readOnce.rejected, (state, action) => {
      state.status = String(action.error.message ?? "Read failed");
    });
  }
});

export const { select } = soilSlice.actions;
export const soilReducer = soilSlice.reducer;
export { client as soilClient };
