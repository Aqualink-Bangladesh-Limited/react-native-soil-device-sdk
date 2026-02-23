# Example usage (copy into a React Native app)

Because this workspace is generated offline, we include the *implementation code* you need.
To run it:

1) Create a new bare React Native app (Android):
```bash
npx react-native@latest init SoilDemoApp --template react-native-template-typescript
cd SoilDemoApp
```

2) Add this SDK as a local dependency (during development):
```bash
yarn add ../react-native-soil-device-sdk
```

3) Install peer deps:
```bash
yarn add @react-native-async-storage/async-storage @react-native-community/netinfo
```

4) Replace your `App.tsx` with one of the example apps here:
- `example/src/App.useState.tsx`
- or pick a state management folder under `example/src/state/*`

5) Android:
- Ensure USB host feature is enabled (see root README)

6) Run:
```bash
yarn android
```
