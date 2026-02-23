import React, { useEffect, useMemo, useState } from "react";
import { Button, FlatList, SafeAreaView, Text, View } from "react-native";
import { SoilDeviceClient, SoilDeviceSdk, type SoilData, type SoilUsbDeviceInfo } from "react-native-soil-device-sdk";

export default function App() {
  // 1) Configure SDK once (you can move this to your bootstrap file)
  useEffect(() => {
    SoilDeviceSdk.configure({ apiKey: "YOUR_API_KEY" });
  }, []);

  const client = useMemo(
    () =>
      new SoilDeviceClient({
        mode: "once",
        proactiveReportingSeconds: 2,
        slaveId: 1,
        autoReport: true
      }),
    []
  );

  const [devices, setDevices] = useState<SoilUsbDeviceInfo[]>([]);
  const [selected, setSelected] = useState<SoilUsbDeviceInfo | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [data, setData] = useState<SoilData | null>(null);

  useEffect(() => {
    const onData = (d: SoilData) => setData(d);
    const onErr = (e: unknown) => setStatus(String(e));
    client.on("data", onData);
    client.on("error", onErr);
    return () => {
      client.off("data", onData);
      client.off("error", onErr);
      client.dispose();
    };
  }, [client]);

  const loadDevices = async () => {
    try {
      const list = await client.getDeviceList();
      setDevices(list);
      setSelected(list[0] ?? null);
      setStatus(`Found ${list.length} device(s).`);
    } catch (e) {
      setStatus(`Failed to load devices: ${String(e)}`);
    }
  };

  const connect = async () => {
    if (!selected) return setStatus("Select a device first.");
    setIsConnecting(true);
    try {
      await client.makeConnection(selected);
      setStatus(`Connected to ${selected.displayName}`);
    } catch (e) {
      setStatus(`Connection failed: ${String(e)}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await client.makeDisconnect();
      setStatus("Disconnected");
    } catch (e) {
      setStatus(`Disconnect failed: ${String(e)}`);
    }
  };

  const readOnce = async () => {
    try {
      const d = await client.getPrintingValue();
      setData(d);
      setStatus("Read OK");
    } catch (e) {
      setStatus(`Read failed: ${String(e)}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Soil USB Demo (useState)</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title="Refresh devices" onPress={loadDevices} />
        <Button title="Disconnect" onPress={disconnect} />
      </View>

      <FlatList
        data={devices}
        keyExtractor={(d) => String(d.deviceId)}
        renderItem={({ item }) => (
          <Text
            onPress={() => setSelected(item)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor: selected?.deviceId === item.deviceId ? "#eee" : "transparent"
            }}
          >
            {item.displayName}
          </Text>
        )}
      />

      <Button title={isConnecting ? "Connecting..." : "Connect"} onPress={connect} disabled={isConnecting} />
      <Button title="Read once" onPress={readOnce} />

      <Text>Status: {status}</Text>

      <View style={{ marginTop: 8, padding: 12, borderWidth: 1, borderRadius: 12 }}>
        <Text style={{ fontWeight: "600" }}>Latest reading</Text>
        <Text>Temp: {data?.temperatureC ?? "--"} °C</Text>
        <Text>Hum: {data?.humidityPercent ?? "--"} %</Text>
        <Text>pH: {data?.ph ?? "--"}</Text>
        <Text>EC: {data?.ecUsCm ?? "--"}</Text>
        <Text>Salinity: {data?.salinityMgL ?? "--"}</Text>
        <Text>N: {data?.nitrogenMgKg ?? "--"}</Text>
        <Text>P: {data?.phosphorusMgKg ?? "--"}</Text>
        <Text>K: {data?.potassiumMgKg ?? "--"}</Text>
      </View>
    </SafeAreaView>
  );
}
