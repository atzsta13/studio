package com.example.szigerinsider2026.ui.splash

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.theme.*
import kotlinx.coroutines.delay

import androidx.compose.material3.MaterialTheme
import com.example.szigerinsider2026.data.config.FestivalConfig

@Composable
fun SplashScreen(navController: NavController) {
    var showFestivalName by remember { mutableStateOf(false) }
    var showInsider by remember { mutableStateOf(false) }
    var showBadge by remember { mutableStateOf(false) }
    val hapticFeedback = LocalHapticFeedback.current

    LaunchedEffect(Unit) {
        delay(80)
        showFestivalName = true
        hapticFeedback.performHapticFeedback(HapticFeedbackType.LongPress)
        delay(180)
        showInsider = true
        delay(280)
        showBadge = true
        delay(1800)
        navController.navigate("home") {
            popUpTo("splash") { inclusive = true }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
    ) {
        // Decorative top-right square
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(150.dp)
                .padding(24.dp)
                .background(MaterialTheme.colorScheme.primary)
        )

        // Main content
        Column(
            horizontalAlignment = Alignment.Start,
            modifier = Modifier
                .align(Alignment.Center)
                .padding(32.dp)
                .fillMaxWidth()
        ) {
            AnimatedVisibility(
                visible = showFestivalName,
                enter = fadeIn(tween(400)) + slideInVertically(tween(400)) { it / 2 }
            ) {
                Text(
                    text = FestivalConfig.NAME.uppercase(),
                    fontSize = 100.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.secondary,
                    lineHeight = 85.sp,
                    letterSpacing = (-4).sp
                )
            }

            AnimatedVisibility(
                visible = showInsider,
                enter = fadeIn(tween(400)) + slideInVertically(tween(400)) { it / 2 }
            ) {
                Text(
                    text = "INSIDER",
                    fontSize = 100.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary,
                    lineHeight = 85.sp,
                    letterSpacing = (-4).sp
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            AnimatedVisibility(
                visible = showBadge,
                enter = fadeIn(tween(350))
            ) {
                Box(
                    modifier = Modifier
                        .background(Color.White)
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "EST. ${FestivalConfig.current.year} – ALPHA v2.0",
                        fontWeight = FontWeight.Black,
                        color = Color.Black,
                        fontSize = 12.sp,
                        letterSpacing = 2.sp
                    )
                }
            }
        }

        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth(0.4f)
                .height(8.dp)
                .background(MaterialTheme.colorScheme.secondary)
        )
    }
}
