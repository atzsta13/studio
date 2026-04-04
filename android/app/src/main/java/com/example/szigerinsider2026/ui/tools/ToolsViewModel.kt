package com.example.szigerinsider2026.ui.tools

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.model.WeatherData
import com.example.szigerinsider2026.data.repository.WeatherRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

import android.content.Context
import androidx.lifecycle.ViewModelProvider
import com.example.szigerinsider2026.data.model.WeatherData
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.data.repository.WeatherRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ToolsViewModel(
    private val lineupRepository: LineupRepository
) : ViewModel() {
    private val weatherRepository = WeatherRepository()

    private val _weather = MutableStateFlow<WeatherData?>(null)
    val weather: StateFlow<WeatherData?> = _weather

    private val _isLoadingWeather = MutableStateFlow(true)
    val isLoadingWeather: StateFlow<Boolean> = _isLoadingWeather

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing

    private val _syncResult = MutableSharedFlow<Boolean>()
    val syncResult: SharedFlow<Boolean> = _syncResult

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

    fun syncData() {
        viewModelScope.launch {
            _isSyncing.value = true
            val success = lineupRepository.syncLineup()
            _syncResult.emit(success)
            _isSyncing.value = false
        }
    }

    class Factory(private val context: Context) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return ToolsViewModel(LineupRepository(context)) as T
        }
    }
}
