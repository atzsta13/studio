package com.example.szigerinsider2026.ui.tools

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavController
import com.example.szigerinsider2026.data.config.FestivalConfig
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AfterMovieScreen(navController: NavController) {
    val haptic = rememberHapticManager()
    val config = FestivalConfig.current
    // FestivalConfigData does not have afterMovieUrl; we use null for now (can be extended)
    val afterMovieUrl: String? = null

    Scaffold(
        containerColor = OLEDBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "AFTER MOVIE",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-1).sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { haptic.lightTap(); navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OLEDBlack)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(OLEDBlack)
                .padding(padding)
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            if (afterMovieUrl != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .clip(RoundedCornerShape(20.dp))
                ) {
                    AndroidView(
                        factory = { ctx ->
                            WebView(ctx).apply {
                                webViewClient = WebViewClient()
                                settings.javaScriptEnabled = true
                                loadUrl(afterMovieUrl)
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            } else {
                // Pre-festival placeholder card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(
                            Brush.verticalGradient(
                                listOf(
                                    Color(0xFF1A0A2E),
                                    OLEDBlack
                                )
                            )
                        )
                        .border(1.dp, PrimaryMagenta.copy(alpha = 0.3f), RoundedCornerShape(24.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(PrimaryMagenta.copy(alpha = 0.15f))
                                .border(2.dp, PrimaryMagenta.copy(alpha = 0.5f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("▶", color = PrimaryMagenta, fontSize = 28.sp)
                        }
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(
                            text = "AFTER MOVIE",
                            color = TextPrimary,
                            fontSize = 26.sp,
                            fontWeight = FontWeight.Black,
                            fontStyle = FontStyle.Italic,
                            letterSpacing = (-1).sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "COMING SOON",
                            color = PrimaryMagenta,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 3.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "The official ${config.name} ${config.dates.year} after movie will be available here after the festival. Stay tuned.",
                    color = TextMuted,
                    fontSize = 14.sp,
                    lineHeight = 22.sp
                )
            }
        }
    }
}
