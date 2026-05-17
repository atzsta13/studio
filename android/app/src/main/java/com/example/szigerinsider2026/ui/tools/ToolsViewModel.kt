package com.example.szigerinsider2026.ui.tools

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.model.WeatherData
import com.example.szigerinsider2026.data.repository.ILineupRepository
import com.example.szigerinsider2026.data.repository.IWeatherRepository
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.data.repository.WeatherRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ToolsViewModel(
    private val repository: ILineupRepository,
    private val weatherRepository: IWeatherRepository = WeatherRepository()
) : ViewModel() {
    private val _weather = MutableStateFlow<WeatherData?>(null)
    val weather: StateFlow<WeatherData?> = _weather

    private val _isLoadingWeather = MutableStateFlow(false)
    val isLoadingWeather: StateFlow<Boolean> = _isLoadingWeather

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing

    private val _syncResult = MutableSharedFlow<Boolean>()
    val syncResult: SharedFlow<Boolean> = _syncResult

    init {
        fetchWeather()
    }

    private fun fetchWeather() {
        viewModelScope.launch {
            _isLoadingWeather.value = true
            try {
                _weather.value = weatherRepository.getForecast()
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoadingWeather.value = false
            }
        }
    }

    fun syncData() {
        viewModelScope.launch {
            _isSyncing.value = true
            try {
                // Simulate cloud sync
                kotlinx.coroutines.delay(2000)
                _syncResult.emit(true)
            } catch (e: Exception) {
                _syncResult.emit(false)
            } finally {
                _isSyncing.value = false
            }
        }
    }

    class Factory(private val context: Context) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return ToolsViewModel(LineupRepository(context)) as T
        }
    }
}
