package com.example.szigerinsider2026

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.szigerinsider2026.ui.theme.AcidYellow
import com.example.szigerinsider2026.ui.theme.SzigetInsiderTheme

import com.example.szigerinsider2026.ui.navigation.AppNavigation

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SzigetInsiderTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        handleSpotifyCallback(intent.data)
    }

    private fun handleSpotifyCallback(uri: Uri?) {
        if (uri?.scheme == "sziget" && uri.host == "spotify-callback") {
            val code = uri.getQueryParameter("code")
            val error = uri.getQueryParameter("error")

            if (code != null) {
                // Store code and verifier for later processing in SpotifyViewModel
                val prefs = getSharedPreferences("spotify_callback", MODE_PRIVATE)
                prefs.edit().apply {
                    putString("pending_code", code)
                    apply()
                }
            }
        }
    }
}
