package org.openfestivalhub.ui.splash

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import org.openfestivalhub.data.config.FestivalConfig
import org.openfestivalhub.ui.theme.OLEDBlack
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(navController: NavController) {
    var showFestivalName by remember { mutableStateOf(false) }
    var showInsider by remember { mutableStateOf(false) }
    var showBadge by remember { mutableStateOf(false) }
    val hapticFeedback = LocalHapticFeedback.current
    val context = LocalContext.current
    
    val isSelected = remember { FestivalConfig.isSelected(context) }
    val festivalName = remember { if (isSelected) FestivalConfig.NAME else "FESTIVAL" }

    LaunchedEffect(Unit) {
        delay(150)
        showFestivalName = true
        hapticFeedback.performHapticFeedback(HapticFeedbackType.LongPress)
        delay(200)
        showInsider = true
        delay(300)
        showBadge = true
        delay(1400)
        
        val dest = if (isSelected) "home" else "festival_select"
        navController.navigate(dest) {
            popUpTo("splash") { inclusive = true }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
    ) {
        // High-end tactical layout
        Column(
            horizontalAlignment = Alignment.Start,
            modifier = Modifier
                .align(Alignment.Center)
                .padding(32.dp)
                .fillMaxWidth()
        ) {
            AnimatedVisibility(
                visible = showFestivalName,
                enter = fadeIn(tween(400)) + slideInHorizontally(tween(400, easing = androidx.compose.animation.core.LinearOutSlowInEasing)) { -it / 4 }
            ) {
                Text(
                    text = festivalName.uppercase(),
                    style = MaterialTheme.typography.displayLarge.copy(
                        fontSize = 72.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        color = MaterialTheme.colorScheme.primary,
                        lineHeight = 62.sp,
                        letterSpacing = (-4).sp
                    )
                )
            }

            AnimatedVisibility(
                visible = showInsider,
                enter = fadeIn(tween(400)) + slideInHorizontally(tween(400, easing = androidx.compose.animation.core.LinearOutSlowInEasing)) { it / 4 }
            ) {
                Text(
                    text = "INSIDER",
                    style = MaterialTheme.typography.displayLarge.copy(
                        fontSize = 72.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        color = Color.White,
                        lineHeight = 62.sp,
                        letterSpacing = (-4).sp
                    )
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            AnimatedVisibility(
                visible = showBadge,
                enter = scaleIn(tween(300)) + fadeIn(tween(300))
            ) {
                Surface(
                    color = MaterialTheme.colorScheme.primary,
                    contentColor = Color.Black,
                    shape = androidx.compose.foundation.shape.CutCornerShape(topEnd = 8.dp),
                    modifier = Modifier.padding(top = 8.dp)
                ) {
                    Text(
                        text = "VERSION 2.0.26 // ELITE PLATFORM",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp
                        )
                    )
                }
            }
        }

        // Bottom progress decoration
        if (showBadge) {
            LinearProgressIndicator(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .height(2.dp),
                color = MaterialTheme.colorScheme.primary,
                trackColor = Color.Transparent
            )
        }
    }
}
