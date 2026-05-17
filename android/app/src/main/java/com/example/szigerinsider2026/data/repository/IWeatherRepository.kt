package com.example.szigerinsider2026.data.repository

import com.example.szigerinsider2026.data.model.WeatherData

interface IWeatherRepository {
    suspend fun getForecast(): WeatherData
}
