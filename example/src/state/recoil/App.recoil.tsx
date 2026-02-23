import React, { useEffect } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { RecoilRoot, useRecoilState } from "recoil";
import { SoilDeviceSdk } from "react-native-soil-device-sdk";
import { dataAtom, devicesAtom, selectedAtom, statusAtom } from "./atoms";
import { connect, loadDevices, readOnce } from "./actions";

function Screen() {
  const [devices, setDevices] = useRecoilState(devicesAtom);
  const [selected, setSelected] = useRecoilState(selectedAtom);
  const [status, setStatus] = useRecoilState(statusAtom);
  const [data, setData] = useRecoilState(dataAtom);

  useEffect(() => {
    loadDevices(setDevices, setSelected, setStatus);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Soil USB Demo (Recoil)</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title="Refresh" onPress={() => loadDevices(setDevices, setSelected, setStatus)} />
        <Button title="Connect" onPress={() => connect(selected, setStatus)} />
        <Button title="Read once" onPress={() => readOnce(setData, setStatus)} />
      </View>

      <Text>Status: {status}</Text>
      <Text>Device count: {devices.length}</Text>
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
    <RecoilRoot>
      <Screen />
    </RecoilRoot>
  );
}
