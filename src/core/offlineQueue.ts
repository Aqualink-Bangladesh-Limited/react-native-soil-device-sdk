import AsyncStorage from "@react-native-async-storage/async-storage";

export class OfflineQueue {
  constructor(private readonly key = "soil_device_sdk.offline_queue") {}

  async load(): Promise<Record<string, unknown>[]> {
    const raw = await AsyncStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list.filter(Boolean).filter((v) => typeof v === "object");
    } catch {
      return [];
    }
  }

  async enqueue(payload: Record<string, unknown>): Promise<void> {
    const list = await this.load();
    list.push(payload);
    await AsyncStorage.setItem(this.key, JSON.stringify(list));
  }

  async replaceAll(payloads: Record<string, unknown>[]): Promise<void> {
    await AsyncStorage.setItem(this.key, JSON.stringify(payloads ?? []));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(this.key);
  }
}
