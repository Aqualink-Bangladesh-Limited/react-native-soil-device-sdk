import React, { useEffect } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { SoilDeviceSdk } from "react-native-soil-device-sdk";
import { store, type RootState, type AppDispatch } from "./store";
import { connectDevice, loadDevices, readOnce } from "./soilSlice";

function Screen() {
  const dispatch = useDispatch<AppDispatch>();
  const { devices, selected, status, data } = useSelector((s: RootState) => s.soil);

  useEffect(() => {
    dispatch(loadDevices());
  }, [dispatch]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Soil USB Demo (Redux Toolkit)</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title="Refresh" onPress={() => dispatch(loadDevices())} />
        <Button title="Connect" onPress={() => selected && dispatch(connectDevice(selected))} />
        <Button title="Read once" onPress={() => dispatch(readOnce())} />
      </View>

      <Text>Status: {status}</Text>
      <Text>Selected: {selected?.displayName ?? "--"}</Text>
      <Text>Temp: {data?.temperatureC ?? "--"} °C</Text>
    </SafeAreaView>
  );
}

export default function App() {
  useEffect(() => {
    SoilDeviceSdk.configure({ apiKey: "YOUR_API_KEY" });
  }, []);
  return (
    <Provider store={store}>
      <Screen />
    </Provider>
  );
}
