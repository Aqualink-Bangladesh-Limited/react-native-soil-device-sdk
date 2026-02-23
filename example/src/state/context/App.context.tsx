import React, { useEffect } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { SoilDeviceSdk } from "react-native-soil-device-sdk";
import { SoilProvider, useSoil } from "./soilContext";

function Screen() {
  const { state, actions } = useSoil();

  useEffect(() => {
    actions.loadDevices();
  }, [actions]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Soil USB Demo (Context)</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title="Refresh" onPress={actions.loadDevices} />
        <Button title={state.connecting ? "Connecting..." : "Connect"} onPress={actions.connect} disabled={state.connecting} />
        <Button title="Read once" onPress={actions.readOnce} />
      </View>

      <Text>Status: {state.status}</Text>
      <Text>Selected: {state.selected?.displayName ?? "--"}</Text>
      <Text>Temp: {state.data?.temperatureC ?? "--"} °C</Text>
    </SafeAreaView>
  );
}

export default function App() {
  useEffect(() => {
    SoilDeviceSdk.configure({ apiKey: "YOUR_API_KEY" });
  }, []);
  return (
    <SoilProvider>
      <Screen />
    </SoilProvider>
  );
}
