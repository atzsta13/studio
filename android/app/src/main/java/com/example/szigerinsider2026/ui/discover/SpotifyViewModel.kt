package com.example.szigerinsider2026.ui.discover

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.SpotifyRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class SpotifyAuthState {
    object Idle : SpotifyAuthState()
    object Loading : SpotifyAuthState()
    object Connected : SpotifyAuthState()
    data class Error(val message: String) : SpotifyAuthState()
}

class SpotifyViewModel(private val repository: SpotifyRepository) : ViewModel() {

    private val _authState = MutableStateFlow<SpotifyAuthState>(
        if (repository.isConnected()) SpotifyAuthState.Connected else SpotifyAuthState.Idle
    )
    val authState: StateFlow<SpotifyAuthState> = _authState.asStateFlow()

    private val _matchedArtistIds = MutableStateFlow<Set<String>>(emptySet())
    val matchedArtistIds: StateFlow<Set<String>> = _matchedArtistIds.asStateFlow()

    fun startAuth(): Pair<String, String> {
        val codeVerifier = repository.generateCodeVerifier()
        val codeChallenge = repository.generateCodeChallenge(codeVerifier)
        val authUrl = repository.buildAuthUrl(codeChallenge)
        return Pair(authUrl, codeVerifier)
    }

    fun handleCallback(code: String, codeVerifier: String, lineup: List<Artist>) {
        viewModelScope.launch {
            _authState.value = SpotifyAuthState.Loading
            try {
                val tokens = repository.exchangeCode(code, codeVerifier)
                if (tokens != null) {
                    val matched = repository.getMatchedArtistIds(lineup)
                    _matchedArtistIds.value = matched
                    _authState.value = SpotifyAuthState.Connected
                } else {
                    _authState.value = SpotifyAuthState.Error("Failed to exchange code")
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _authState.value = SpotifyAuthState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun disconnect() {
        repository.disconnect()
        _matchedArtistIds.value = emptySet()
        _authState.value = SpotifyAuthState.Idle
    }
}
