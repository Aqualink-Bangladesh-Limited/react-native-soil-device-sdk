# State management usage patterns (React Native)

This SDK is intentionally "thin":
- USB + Modbus read is native (Android)
- Live loop and API reporting are JS
- You can wrap it in any state management style

The example folder contains working patterns you can copy.

## 1) Hooks / useState
File: `example/src/App.useState.tsx`

## 2) Context + useReducer
Folder: `example/src/state/context/*`

## 3) Redux Toolkit
Folder: `example/src/state/redux/*`

## 4) Zustand
Folder: `example/src/state/zustand/*`

## 5) MobX
Folder: `example/src/state/mobx/*`

## 6) Recoil
Folder: `example/src/state/recoil/*`
