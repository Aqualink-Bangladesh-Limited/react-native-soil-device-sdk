package com.aqualink.soildevicesdk.usb

import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbDeviceConnection
import com.hoho.android.usbserial.driver.UsbSerialPort

data class UsbSerialSession(
  val device: UsbDevice,
  val connection: UsbDeviceConnection,
  val port: UsbSerialPort
)
