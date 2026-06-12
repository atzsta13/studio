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
            Log.e("FestivalInsider", "Uncaught exception", exception)
            // Restart only if the previous crash was >10s ago — a deterministic
            // startup crash would otherwise loop forever.
            val prefs = getSharedPreferences("crash_guard", MODE_PRIVATE)
            val last = prefs.getLong("last_crash", 0L)
            val now = System.currentTimeMillis()
            prefs.edit().putLong("last_crash", now).commit()
            if (now - last > 10_000) {
                val intent = packageManager.getLaunchIntentForPackage(packageName)
                    ?.addFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP or android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                if (intent != null) startActivity(intent)
            }
            finish()
            Process.killProcess(Process.myPid())
        }

        // Always initialize — uses saved preference or defaults to "sziget-2026" on first launch.
        // The splash screen routes to festival_select if no preference has been saved yet.
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
    }
}
