# demo-app (implementation project)

This folder contains a *ready-to-copy* implementation.

A full React Native Android project includes many generated files.
So the recommended workflow is:

1) Generate a fresh RN app
```bash
npx react-native@latest init SoilDeviceDemo --template react-native-template-typescript
cd SoilDeviceDemo
```

2) Add the SDK
- local development:
```bash
yarn add ../react-native-soil-device-sdk
```
- or from npm later:
```bash
yarn add react-native-soil-device-sdk
```

3) Install peer deps
```bash
yarn add @react-native-async-storage/async-storage @react-native-community/netinfo
```

4) Copy implementation
Copy `demo-app/App.tsx` into your generated app root, replacing its `App.tsx`.

5) Android USB host + optional intent filter
See root README.

6) Run
```bash
yarn android
```
