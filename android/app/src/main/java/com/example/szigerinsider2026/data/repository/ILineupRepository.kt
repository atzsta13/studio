package com.example.szigerinsider2026.data.repository

import com.example.szigerinsider2026.data.model.Artist

interface ILineupRepository {
    suspend fun getLineup(year: String = "2026"): List<Artist>
}
