package com.aqualink.soildevicesdk.modbus

object Crc16 {
  // Standard Modbus CRC-16 (poly 0xA001), little-endian output (Lo, Hi)
  fun compute(data: ByteArray, length: Int = data.size): Int {
    var crc = 0xFFFF
    for (i in 0 until length) {
      crc = crc xor (data[i].toInt() and 0xFF)
      for (b in 0 until 8) {
        crc = if ((crc and 0x0001) != 0) {
          (crc ushr 1) xor 0xA001
        } else {
          crc ushr 1
        }
      }
    }
    return crc and 0xFFFF
  }
}
