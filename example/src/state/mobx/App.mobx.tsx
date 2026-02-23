import React, { useEffect, useMemo } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { observer } from "mobx-react-lite";
import { SoilDeviceSdk } from "react-native-soil-device-sdk";
import { SoilStore } from "./SoilStore";

const Screen = observer(({ store }: { store: SoilStore }) => {
  useEffect(() => {
    store.loadDevices();
  }, [store]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Soil USB Demo (MobX)</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title="Refresh" onPress={() => store.loadDevices()} />
        <Button title="Connect" onPress={() => store.connect()} />
        <Button title="Read once" onPress={() => store.readOnce()} />
      </View>

      <Text>Status: {store.status}</Text>
      <Text>Temp: {store.data?.temperatureC ?? "--"} °C</Text>
    </SafeAreaView>
  );
});

export default function App() {
  const store = useMemo(() => new SoilStore(), []);
  useEffect(() => {
    SoilDeviceSdk.configure({ apiKey: "YOUR_API_KEY" });
  }, []);
  return <Screen store={store} />;
}
