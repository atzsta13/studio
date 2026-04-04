package com.example.szigerinsider2026.data.local

import androidx.room.TypeConverter
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

import com.example.szigerinsider2026.data.model.Socials

class Converters {
    @TypeConverter
    fun fromSocials(value: Socials?): String? {
        return value?.let { Json.encodeToString(it) }
    }

    @TypeConverter
    fun toSocials(value: String?): Socials? {
        return value?.let { Json.decodeFromString(it) }
    }

    @TypeConverter
    fun fromStringList(value: List<String>): String {
        return Json.encodeToString(value)
    }

    @TypeConverter
    fun toStringList(value: String): List<String> {
        return Json.decodeFromString(value)
    }
}
