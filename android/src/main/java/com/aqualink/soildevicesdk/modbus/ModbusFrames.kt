package com.aqualink.soildevicesdk.modbus

import kotlin.math.roundToInt

object ModbusFrames {
  fun buildReadHoldingRegisters(slaveId: Int, startAddress: Int, count: Int): ByteArray {
    val frame = ByteArray(8)
    frame[0] = (slaveId and 0xFF).toByte()
    frame[1] = 0x03
    frame[2] = ((startAddress ushr 8) and 0xFF).toByte()
    frame[3] = (startAddress and 0xFF).toByte()
    frame[4] = ((count ushr 8) and 0xFF).toByte()
    frame[5] = (count and 0xFF).toByte()
    val crc = Crc16.compute(frame, 6)
    frame[6] = (crc and 0xFF).toByte()
    frame[7] = ((crc ushr 8) and 0xFF).toByte()
    return frame
  }

  fun validateCrc(frame: ByteArray): Boolean {
    if (frame.size < 3) return false
    val len = frame.size
    val computed = Crc16.compute(frame, len - 2)
    val lo = frame[len - 2].toInt() and 0xFF
    val hi = frame[len - 1].toInt() and 0xFF
    val received = (hi shl 8) or lo
    return computed == received
  }

  fun parseHoldingRegistersResponse(frame: ByteArray, expectedSlaveId: Int): IntArray {
    // Response: [slaveId][0x03][byteCount][data...][crcLo][crcHi]
    if (frame.size < 5) throw IllegalArgumentException("Frame too short")
    val slave = frame[0].toInt() and 0xFF
    val fc = frame[1].toInt() and 0xFF
    val bc = frame[2].toInt() and 0xFF
    if (slave != (expectedSlaveId and 0xFF)) throw IllegalArgumentException("SlaveId mismatch")
    if (fc != 0x03) throw IllegalArgumentException("Function code mismatch: $fc")
    if (frame.size < 3 + bc + 2) throw IllegalArgumentException("Frame length mismatch")
    if (!validateCrc(frame.copyOfRange(0, 3 + bc + 2))) throw IllegalArgumentException("CRC invalid")

    val regCount = bc / 2
    val regs = IntArray(regCount)
    var idx = 3
    for (i in 0 until regCount) {
      val hi = frame[idx].toInt() and 0xFF
      val lo = frame[idx + 1].toInt() and 0xFF
      regs[i] = (hi shl 8) or lo
      idx += 2
    }
    return regs
  }

  fun toSoilData(registers: IntArray): Map<String, Any?> {
    // Expected 8 registers:
    // 0 temp (signed) /10
    // 1 hum /10
    // 2 ec
    // 3 salin
    // 4 nitro
    // 5 phos
    // 6 potas
    // 7 ph /100
    fun signed16(v: Int): Int {
      return v.toShort().toInt()
    }

    val temp = if (registers.size > 0) signed16(registers[0]) / 10.0 else null
    val hum = if (registers.size > 1) registers[1] / 10.0 else null
    val ec = if (registers.size > 2) registers[2] else null
    val salin = if (registers.size > 3) registers[3] else null
    val nitro = if (registers.size > 4) registers[4] else null
    val phos = if (registers.size > 5) registers[5] else null
    val potas = if (registers.size > 6) registers[6] else null
    val ph = if (registers.size > 7) registers[7] / 100.0 else null

    return mapOf(
      "temperatureC" to temp,
      "humidityPercent" to hum,
      "ecUsCm" to ec,
      "salinityMgL" to salin,
      "nitrogenMgKg" to nitro,
      "phosphorusMgKg" to phos,
      "potassiumMgKg" to potas,
      "ph" to ph
    )
  }
}
