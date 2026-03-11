package com.example.szigerinsider2026.ui.tools

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.model.WeatherData
import com.example.szigerinsider2026.data.repository.WeatherRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ToolsViewModel : ViewModel() {
    private val weatherRepository = WeatherRepository()

    private val _weather = MutableStateFlow<WeatherData?>(null)
    val weather: StateFlow<WeatherData?> = _weather

    private val _isLoadingWeather = MutableStateFlow(true)
    val isLoadingWeather: StateFlow<Boolean> = _isLoadingWeather

    init {
        loadWeather()
    }

    fun loadWeather() {
        viewModelScope.launch {
            _isLoadingWeather.value = true
            _weather.value = weatherRepository.getForecast()
            _isLoadingWeather.value = false
        }
    }
}
