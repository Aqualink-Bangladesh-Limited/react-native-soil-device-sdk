declare module "react-native" {
  export const NativeModules: any;
  export const Platform: { OS: string; select: (spec: any) => any };
}

declare module "@react-native-community/netinfo" {
  export type NetInfoState = { isConnected: boolean | null; isInternetReachable?: boolean | null };
  export type NetInfoSubscription = () => void;
  const NetInfo: {
    addEventListener: (cb: (state: NetInfoState) => void) => NetInfoSubscription;
    fetch: () => Promise<NetInfoState>;
  };
  export default NetInfo;
}

declare module "@react-native-async-storage/async-storage" {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
  export default AsyncStorage;
}
