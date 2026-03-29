package com.example.szigerinsider2026.ui.utils

import android.graphics.Bitmap
import android.graphics.Color
import com.example.szigerinsider2026.data.config.FestivalConfig
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter

object QRUtils {
    fun generateQRCode(content: String, size: Int = 512): Bitmap? {
        return try {
            val writer = MultiFormatWriter()
            val bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size)
            val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
            for (x in 0 until size) {
                for (y in 0 until size) {
                    bitmap.setPixel(x, y, if (bitMatrix.get(x, y)) Color.BLACK else Color.WHITE)
                }
            }
            bitmap
        } catch (e: Exception) {
            null
        }
    }

    fun encodeSquad(ids: Collection<String>): String {
        return "${FestivalConfig.DEEP_LINK_SCHEME}://squad?ids=" + ids.joinToString(",")
    }

    fun decodeSquad(uri: String): List<String>? {
        val prefix = "${FestivalConfig.DEEP_LINK_SCHEME}://squad?ids="
        if (!uri.startsWith(prefix)) return null
        return uri.substringAfter("ids=").split(",").filter { it.isNotEmpty() }
    }
}
