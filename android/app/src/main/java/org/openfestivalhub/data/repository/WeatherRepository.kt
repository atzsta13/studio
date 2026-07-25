package org.openfestivalhub.data.repository

import org.openfestivalhub.data.model.DailyForecast
import org.openfestivalhub.data.model.WeatherData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL

class WeatherRepository : IWeatherRepository {

    companion object {
        private var cachedData: WeatherData? = null
        private var cacheTime: Long = 0
        private const val CACHE_TTL_MS = 30 * 60 * 1000L
    }

    private val BASE_URL = "https://api.open-meteo.com/v1/forecast?" +
        "latitude=47.5194&longitude=19.0512" +
        "&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min,weathercode" +
        "&hourly=precipitation_probability" +
        "&timezone=Europe%2FBudapest" +
        "&forecast_days=7"

    override suspend fun getForecast(): WeatherData = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        cachedData?.takeIf { now - cacheTime < CACHE_TTL_MS }?.let { return@withContext it }

        try {
            val json = JSONObject(URL(BASE_URL).readText())
            val daily = json.getJSONObject("daily")
            val dates = daily.getJSONArray("time")
            val maxTemps = daily.getJSONArray("temperature_2m_max")
            val minTemps = daily.getJSONArray("temperature_2m_min")
            val precipProbs = daily.getJSONArray("precipitation_probability_max")
            val weatherCodes = daily.getJSONArray("weathercode")

            val hourlyPrecip = json.getJSONObject("hourly").getJSONArray("precipitation_probability")
            val rainAlert = (0 until minOf(24, hourlyPrecip.length())).any {
                hourlyPrecip.getInt(it) > 60
            }

            val forecasts = (0 until dates.length()).map { i ->
                DailyForecast(
                    date = dates.getString(i),
                    maxTemp = maxTemps.optDouble(i, 0.0).toFloat(),
                    minTemp = minTemps.optDouble(i, 0.0).toFloat(),
                    precipProbability = precipProbs.optInt(i, 0),
                    weatherCode = weatherCodes.optInt(i, 0)
                )
            }

            WeatherData(forecasts, rainAlert).also {
                cachedData = it
                cacheTime = now
            }
        } catch (e: Exception) {
            e.printStackTrace()
            cachedData ?: WeatherData(emptyList(), false)
        }
    }
}
