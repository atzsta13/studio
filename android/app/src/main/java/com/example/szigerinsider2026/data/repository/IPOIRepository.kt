package com.example.szigerinsider2026.data.repository

import com.example.szigerinsider2026.data.model.POI

interface IPOIRepository {
    suspend fun getPOIs(): List<POI>
}
