"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const LINKING_ERROR = `The package 'react-native-soil-device-sdk' doesn't seem to be linked.\n` +
    react_native_1.Platform.select({ ios: "- iOS is not supported for USB-Serial.\n", default: "" }) +
    "- Did you run 'pod install'? (iOS)\n" +
    "- Did you rebuild the app after installing the package?\n" +
    "- Are you using Expo Go? USB requires a custom dev client / bare RN.\n";
const SoilDeviceSdk = react_native_1.NativeModules.SoilDeviceSdk
    ? react_native_1.NativeModules.SoilDeviceSdk
    : new Proxy({}, {
        get() {
            throw new Error(LINKING_ERROR);
        }
    });
exports.default = SoilDeviceSdk;
