package com.example.szigerinsider2026.ui.discover

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import kotlinx.coroutines.delay

enum class SerendipityState { SPINNING, REVEALED }

@Composable
fun SerendipityScreen(
    artist: Artist,
    onExplore: () -> Unit,
    onSpinAgain: () -> Unit,
    onDismiss: () -> Unit
) {
    val haptic = rememberHapticManager()
    var state by remember { mutableStateOf(SerendipityState.SPINNING) }

    // Animate to revealed after 1500ms
    LaunchedEffect(artist.id) {
        state = SerendipityState.SPINNING
        delay(1500)
        haptic.successBurst()
        state = SerendipityState.REVEALED
    }

    // Spinning rings
    val infiniteTransition = rememberInfiniteTransition(label = "spin")
    val rotation1 by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = 360f,
        animationSpec = InfiniteRepeatableSpec(tween(2000, easing = LinearEasing)),
        label = "r1"
    )
    val rotation2 by infiniteTransition.animateFloat(
        initialValue = 360f, targetValue = 0f,
        animationSpec = InfiniteRepeatableSpec(tween(1500, easing = LinearEasing)),
        label = "r2"
    )
    val pulse by infiniteTransition.animateFloat(
        initialValue = 0.8f, targetValue = 1f,
        animationSpec = InfiniteRepeatableSpec(tween(600), RepeatMode.Reverse),
        label = "pulse"
    )

    // Card slide-in animation
    val cardOffset by animateDpAsState(
        targetValue = if (state == SerendipityState.REVEALED) 0.dp else 300.dp,
        animationSpec = spring(dampingRatio = 0.5f, stiffness = 400f),
        label = "card_offset"
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(OLEDBlack.copy(alpha = 0.97f))
        ) {
            // Close button
            IconButton(
                onClick = { haptic.lightTap(); onDismiss() },
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
            ) {
                Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
            }

            when (state) {
                SerendipityState.SPINNING -> {
                    // Spinning rings + scanning text
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        // Outer ring
                        Box(
                            modifier = Modifier
                                .size(240.dp)
                                .rotate(rotation1)
                                .border(2.dp, PrimaryMagenta.copy(alpha = 0.6f), CircleShape)
                        )
                        // Middle ring
                        Box(
                            modifier = Modifier
                                .size(180.dp)
                                .rotate(rotation2)
                                .border(2.dp, AcidYellow.copy(alpha = 0.6f), CircleShape)
                        )
                        // Inner ring
                        Box(
                            modifier = Modifier
                                .size(120.dp)
                                .rotate(rotation1 * 1.5f)
                                .border(2.dp, CyanPulse.copy(alpha = 0.6f), CircleShape)
                        )
                        // Center icon
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .graphicsLayer { scaleX = pulse; scaleY = pulse }
                                .clip(CircleShape)
                                .background(CardBackground),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Shuffle,
                                contentDescription = null,
                                tint = AcidYellow,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.offset(y = 160.dp)
                        ) {
                            Text(
                                text = "SCANNING LINEUP...",
                                color = TextMuted,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 3.sp
                            )
                        }
                    }
                }

                SerendipityState.REVEALED -> {
                    // Artist card slides in from bottom
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .offset(y = cardOffset),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Label
                        Text(
                            text = "YOUR NEXT DISCOVERY",
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 3.sp,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )

                        // Artist card
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 24.dp)
                                .clip(RoundedCornerShape(28.dp))
                                .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(28.dp))
                                .background(CardBackground)
                        ) {
                            Column {
                                // Hero image
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(280.dp)
                                ) {
                                    AsyncImage(
                                        model = artist.imageUrl,
                                        contentDescription = artist.artist,
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                    // Gradient overlay
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(
                                                Brush.verticalGradient(
                                                    colors = listOf(Color.Transparent, CardBackground),
                                                    startY = 150f
                                                )
                                            )
                                    )
                                    // Headliner badge
                                    if (artist.isHeadliner) {
                                        Box(
                                            modifier = Modifier
                                                .align(Alignment.TopEnd)
                                                .padding(12.dp)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(AcidYellow)
                                                .padding(horizontal = 10.dp, vertical = 4.dp)
                                        ) {
                                            Text("HEADLINER", color = Color.Black, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                                        }
                                    }
                                }

                                Column(modifier = Modifier.padding(20.dp)) {
                                    Text(
                                        text = artist.artist.uppercase(),
                                        color = TextPrimary,
                                        fontSize = 26.sp,
                                        fontWeight = FontWeight.Black,
                                        fontStyle = FontStyle.Italic,
                                        letterSpacing = (-0.5).sp,
                                        lineHeight = 28.sp
                                    )
                                    if (artist.genres.isNotEmpty()) {
                                        Text(
                                            text = artist.genres.take(3).joinToString(" · "),
                                            color = TextMuted,
                                            fontSize = 13.sp,
                                            modifier = Modifier.padding(top = 6.dp)
                                        )
                                    }
                                    artist.day?.let {
                                        Text(
                                            text = it.uppercase(),
                                            color = CyanPulse,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.sp,
                                            modifier = Modifier.padding(top = 4.dp)
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Action buttons
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 24.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(AcidYellow)
                                .clickable { haptic.mediumTap(); onExplore() }
                                .padding(18.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "EXPLORE →",
                                color = Color.Black,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        TextButton(onClick = { haptic.lightTap(); onSpinAgain() }) {
                            Text(
                                text = "SPIN AGAIN",
                                color = TextMuted,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
