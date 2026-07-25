package org.openfestivalhub.data.repository

import org.openfestivalhub.data.model.WeatherData

interface IWeatherRepository {
    suspend fun getForecast(): WeatherData
}
