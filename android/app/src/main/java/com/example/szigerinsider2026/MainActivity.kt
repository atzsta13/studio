package com.example.szigerinsider2026

import android.net.Uri
import android.os.Bundle
import android.os.Process
import android.util.Log
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
import com.example.szigerinsider2026.ui.theme.FestivalInsiderTheme

import com.example.szigerinsider2026.data.config.FestivalConfig
import com.example.szigerinsider2026.ui.navigation.AppNavigation

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Thread.setDefaultUncaughtExceptionHandler { _, exception ->
            Log.e("FestivalInsider", "Uncaught exception — restarting app", exception)
            val intent = packageManager.getLaunchIntentForPackage(packageName)
                ?.addFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP or android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            if (intent != null) startActivity(intent)
            finish()
            Process.killProcess(Process.myPid())
        }

        // Initialize unified configuration from JSON assets
        FestivalConfig.initialize(applicationContext)
        
        enableEdgeToEdge()
        setContent {
            FestivalInsiderTheme {
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
        if (uri?.scheme == FestivalConfig.DEEP_LINK_SCHEME && uri.host == "spotify-callback") {
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
