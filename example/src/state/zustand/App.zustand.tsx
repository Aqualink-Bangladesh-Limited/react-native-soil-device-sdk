import React, { useEffect } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { SoilDeviceSdk } from "react-native-soil-device-sdk";
import { useSoilStore } from "./useSoilStore";

export default function App() {
  const { status, data, loadDevices, connect, readOnce } = useSoilStore();

  useEffect(() => {
    SoilDeviceSdk.configure({ apiKey: "YOUR_API_KEY" });
    loadDevices();
  }, [loadDevices]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Soil USB Demo (Zustand)</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title="Refresh" onPress={loadDevices} />
        <Button title="Connect" onPress={connect} />
        <Button title="Read once" onPress={readOnce} />
      </View>

      <Text>Status: {status}</Text>
      <Text>Temp: {data?.temperatureC ?? "--"} °C</Text>
    </SafeAreaView>
  );
}
