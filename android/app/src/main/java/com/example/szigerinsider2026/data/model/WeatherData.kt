package com.example.szigerinsider2026.data.model

data class WeatherData(
    val daily: List<DailyForecast>,
    val rainAlert: Boolean
)

data class DailyForecast(
    val date: String,
    val maxTemp: Float,
    val minTemp: Float,
    val precipProbability: Int,
    val weatherCode: Int
)
