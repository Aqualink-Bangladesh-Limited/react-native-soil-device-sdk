package com.aqualink.soildevicesdk

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.os.Build
import android.os.SystemClock
import com.aqualink.soildevicesdk.modbus.ModbusFrames
import com.aqualink.soildevicesdk.usb.UsbSerialSession
import com.facebook.react.bridge.*
import com.hoho.android.usbserial.driver.UsbSerialDriver
import com.hoho.android.usbserial.driver.UsbSerialPort
import com.hoho.android.usbserial.driver.UsbSerialProber
import java.io.ByteArrayOutputStream

class SoilDeviceSdkModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "SoilDeviceSdk"

  private val usbManager: UsbManager =
    reactContext.getSystemService(Context.USB_SERVICE) as UsbManager

  private var session: UsbSerialSession? = null
  private var pendingConnectPromise: Promise? = null
  private var pendingConnectDevice: UsbDevice? = null
  private var permissionReceiver: BroadcastReceiver? = null

  private val ACTION_USB_PERMISSION = "com.aqualink.soildevicesdk.USB_PERMISSION"

  @ReactMethod
  fun listDevices(promise: Promise) {
    try {
      val arr = Arguments.createArray()
      val list = usbManager.deviceList.values.toList()

      // Sort: CH34x (VID 0x1A86) first, then by name.
      val sorted = list.sortedWith(compareByDescending<UsbDevice> { it.vendorId == 0x1A86 }
        .thenBy { it.deviceName ?: "" })

      for (d in sorted) {
        val map = Arguments.createMap()
        map.putInt("deviceId", d.deviceId)
        map.putInt("vid", d.vendorId)
        map.putInt("pid", d.productId)
        map.putString("manufacturerName", safeGetManufacturer(d))
        map.putString("productName", safeGetProduct(d))
        map.putString("deviceName", d.deviceName)
        val display = buildDisplayName(d)
        map.putString("displayName", display)
        map.putBoolean("isCh34x", d.vendorId == 0x1A86)
        arr.pushMap(map)
      }

      promise.resolve(arr)
    } catch (e: Exception) {
      promise.reject("LIST_DEVICES_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun isConnected(promise: Promise) {
    promise.resolve(session != null)
  }

  @ReactMethod
  fun connect(deviceId: Int, promise: Promise) {
    // Only one connect at a time.
    if (pendingConnectPromise != null) {
      promise.reject("USB_BUSY", "Another connect request is in progress.")
      return
    }

    val device = usbManager.deviceList.values.firstOrNull { it.deviceId == deviceId }
    if (device == null) {
      promise.reject("USB_NOT_FOUND", "No USB device for deviceId=$deviceId")
      return
    }

    // Close old session if any
    closeSession()

    if (usbManager.hasPermission(device)) {
      try {
        openDevice(device)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("USB_CONNECT_ERROR", e.message, e)
      }
      return
    }

    // Request permission
    pendingConnectPromise = promise
    pendingConnectDevice = device
    requestUsbPermission(device)
  }

  @ReactMethod
  fun disconnect(promise: Promise) {
    try {
      closeSession()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("USB_DISCONNECT_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun readOnce(slaveId: Int, timeoutMs: Int, promise: Promise) {
    val s = session
    if (s == null) {
      promise.reject("USB_NOT_CONNECTED", "No active connection.")
      return
    }

    try {
      val frame = ModbusFrames.buildReadHoldingRegisters(slaveId, 0x0000, 8)
      s.port.write(frame, timeoutMs)

      // Expected: 1(slave) + 1(fc) + 1(byteCount=16) + 16(data) + 2(crc) = 21 bytes
      val resp = readFrame(s.port, timeoutMs, expectedSlaveId = slaveId)
      val regs = ModbusFrames.parseHoldingRegistersResponse(resp, slaveId)
      val map = ModbusFrames.toSoilData(regs)

      val out = Arguments.createMap()
      for ((k, v) in map) {
        when (v) {
          null -> out.putNull(k)
          is Int -> out.putInt(k, v)
          is Double -> out.putDouble(k, v)
          is Boolean -> out.putBoolean(k, v)
          is String -> out.putString(k, v)
          else -> out.putString(k, v.toString())
        }
      }

      promise.resolve(out)
    } catch (e: Exception) {
      promise.reject("MODBUS_READ_ERROR", e.message, e)
    }
  }

  // ---------------- helpers ----------------

  private fun buildDisplayName(d: UsbDevice): String {
    val man = safeGetManufacturer(d)
    val prod = safeGetProduct(d)
    val base = listOfNotNull(man, prod).filter { it.isNotBlank() }.joinToString(" ")
    val ids = "VID:${toHex4(d.vendorId)} PID:${toHex4(d.productId)}"
    return if (base.isNotBlank()) "$base ($ids)" else "${d.deviceName} ($ids)"
  }

  private fun toHex4(v: Int): String = String.format("%04X", v and 0xFFFF)

  private fun safeGetManufacturer(d: UsbDevice): String? {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) d.manufacturerName else null
    } catch (_: Exception) {
      null
    }
  }

  private fun safeGetProduct(d: UsbDevice): String? {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) d.productName else null
    } catch (_: Exception) {
      null
    }
  }

  private fun requestUsbPermission(device: UsbDevice) {
    val intent = Intent(ACTION_USB_PERMISSION)
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or
      (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)

    val pendingIntent = PendingIntent.getBroadcast(reactContext, 0, intent, flags)

    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_USB_PERMISSION) return
        val granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)
        val dev: UsbDevice? = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)

        cleanupPermissionReceiver()

        val p = pendingConnectPromise
        val d = pendingConnectDevice

        pendingConnectPromise = null
        pendingConnectDevice = null

        if (p == null || d == null || dev == null || dev.deviceId != d.deviceId) {
          // Nothing to do.
          return
        }

        if (!granted) {
          p.reject("USB_PERMISSION_DENIED", "USB permission denied by user.")
          return
        }

        try {
          openDevice(d)
          p.resolve(null)
        } catch (e: Exception) {
          p.reject("USB_CONNECT_ERROR", e.message, e)
        }
      }
    }

    permissionReceiver = receiver
    val filter = IntentFilter(ACTION_USB_PERMISSION)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      reactContext.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      reactContext.registerReceiver(receiver, filter)
    }

    usbManager.requestPermission(device, pendingIntent)
  }

  private fun cleanupPermissionReceiver() {
    try {
      permissionReceiver?.let { reactContext.unregisterReceiver(it) }
    } catch (_: Exception) {
    } finally {
      permissionReceiver = null
    }
  }

  private fun openDevice(device: UsbDevice) {
    val driver: UsbSerialDriver = UsbSerialProber.getDefaultProber().probeDevice(device)
      ?: throw IllegalStateException("No USB serial driver for this device.")

    val connection = usbManager.openDevice(device)
      ?: throw IllegalStateException("Failed to open USB device connection.")

    val port: UsbSerialPort = driver.ports.firstOrNull()
      ?: throw IllegalStateException("No serial ports available on this device.")

    port.open(connection)
    port.setParameters(
      9600,
      UsbSerialPort.DATABITS_8,
      UsbSerialPort.STOPBITS_1,
      UsbSerialPort.PARITY_NONE
    )
    try {
      port.setDTR(true)
      port.setRTS(true)
    } catch (_: Exception) {
      // some drivers may not support
    }

    session = UsbSerialSession(device, connection, port)
  }

  private fun closeSession() {
    try {
      session?.port?.close()
    } catch (_: Exception) {
    }
    try {
      session?.connection?.close()
    } catch (_: Exception) {
    }
    session = null
  }

  private fun readFrame(port: UsbSerialPort, timeoutMs: Int, expectedSlaveId: Int): ByteArray {
    val start = SystemClock.uptimeMillis()
    val out = ByteArrayOutputStream()
    var frameLen: Int? = null

    while (SystemClock.uptimeMillis() - start < (timeoutMs.toLong() * 3)) {
      val buf = ByteArray(64)
      val n = port.read(buf, timeoutMs)
      if (n > 0) out.write(buf, 0, n)

      val current = out.toByteArray()
      if (current.size >= 3) {
        val slave = current[0].toInt() and 0xFF
        val fc = current[1].toInt() and 0xFF
        val bc = current[2].toInt() and 0xFF
        if (slave == (expectedSlaveId and 0xFF) && fc == 0x03) {
          frameLen = 3 + bc + 2
        }
      }
      if (frameLen != null && out.size() >= frameLen!!) {
        val all = out.toByteArray()
        return all.copyOfRange(0, frameLen!!)
      }
    }

    throw IllegalStateException("Timed out waiting for Modbus response.")
  }

  override fun invalidate() {
    cleanupPermissionReceiver()
    closeSession()
    super.invalidate()
  }
}
