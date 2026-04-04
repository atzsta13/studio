package com.example.szigerinsider2026.ui.components

import android.content.Intent
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.style.TextOverflow
import coil.compose.AsyncImage
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.getMood
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import com.example.szigerinsider2026.data.config.FestivalConfig

@Composable
fun ArtistCard(
    artist: Artist,
    modifier: Modifier = Modifier,
    isFavorite: Boolean = false,
    onToggleFavorite: (String) -> Unit = {},
    onClick: (String) -> Unit = {}
) {
    val haptic = rememberHapticManager()
    val context = LocalContext.current
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessHigh),
        label = "cardScale"
    )

    // Headliner shimmer animation
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")
    val shimmerOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerOffset"
    )

    val shimmerBrush = if (artist.isHeadliner) {
        Brush.linearGradient(
            colors = listOf(
                MaterialTheme.colorScheme.primary.copy(alpha = 0.3f),
                MaterialTheme.colorScheme.secondary.copy(alpha = 0.8f),
                MaterialTheme.colorScheme.primary,
                MaterialTheme.colorScheme.secondary.copy(alpha = 0.3f),
                MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
            ),
            start = Offset(shimmerOffset * 2000f - 1000f, 0f),
            end = Offset(shimmerOffset * 2000f, 1000f)
        )
    } else {
        Brush.linearGradient(
            listOf(Color.White.copy(alpha = 0.05f), Color.White.copy(alpha = 0.05f))
        )
    }

    val mood = getMood(artist)
    val fallbackBrush = Brush.radialGradient(
        listOf(mood.color.copy(alpha = 0.4f), OLEDBlack)
    )

    // Outer Box: animated shimmer border
    Box(
        modifier = modifier
            .graphicsLayer(scaleX = scale, scaleY = scale)
            .fillMaxWidth()
            .clip(RoundedCornerShape(32.dp))
            .background(shimmerBrush)
            .padding(1.dp)
            .pointerInput(Unit) {
                detectTapGestures(
                    onLongPress = {
                        haptic.successBurst()
                        val shareText = "🎵 ${artist.name}\n" +
                            "📅 ${artist.day ?: "TBA"} · ${artist.stage ?: "Main Stage"}\n" +
                            "⏰ ${artist.startTime ?: ""} – ${artist.endTime ?: ""}\n\n" +
                            "${FestivalConfig.NAME} ${FestivalConfig.current.dates.year} · ${FestivalConfig.current.location.city} · ${FestivalConfig.current.tagline}"
                        val sendIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, shareText)
                        }
                        context.startActivity(Intent.createChooser(sendIntent, null))
                    }
                )
            }
    ) {
        Surface(
            onClick = {
                haptic.lightTap()
                onClick(artist.id)
            },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(31.dp)),
            color = CardBackground,
            interactionSource = interactionSource
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Upper Visual Section
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(4f / 5f)
                        .background(MutedBackground)
                ) {
                    // Image with initials fallback
                    Box(modifier = Modifier.fillMaxSize()) {
                        Box(
                            modifier = Modifier.fillMaxSize().background(fallbackBrush),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = artist.name.split(" ").filter { it.isNotEmpty() }.take(2).map { it.first().uppercaseChar() }.joinToString(""),
                                fontSize = 64.sp,
                                fontWeight = FontWeight.Black,
                                fontStyle = FontStyle.Italic,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                        }
                        if (artist.imageUrl != null) {
                            AsyncImage(
                                model = artist.imageUrl,
                                contentDescription = artist.name,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }

                    // Tactical Gradient Overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Color.Black.copy(alpha = 0.2f),
                                        Color.Black.copy(alpha = 0.95f)
                                    )
                                )
                            )
                    )

                    // Overlays: Day Badge
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        if (artist.returningHero) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(MaterialTheme.colorScheme.secondary)
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "RETURNING HERO",
                                    color = Color.Black,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    fontStyle = FontStyle.Italic
                                )
                            }
                        }
                        if (artist.day != null) {
                            BrutalistBadge(text = artist.day.uppercase(), color = Color.White)
                        }
                    }

                    // Overlays: Favorite Star
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(16.dp)
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.6f))
                            .border(
                                1.dp,
                                if (isFavorite) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.1f),
                                CircleShape
                            )
                            .clickable {
                                if (isFavorite) haptic.mediumTap() else haptic.favoriteTap()
                                onToggleFavorite(artist.id)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Filled.Star else Icons.Outlined.StarBorder,
                            contentDescription = "Toggle Favorite",
                            tint = if (isFavorite) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.6f),
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    // Overlays: Artist Info
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(20.dp)
                    ) {
                        Text(
                            text = artist.name.uppercase(),
                            style = BrutalistTypography.titleLarge,
                            color = if (artist.isHeadliner) MaterialTheme.colorScheme.primary else Color.White,
                            modifier = Modifier.padding(bottom = 4.dp),
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            lineHeight = 24.sp
                        )

                        // Genre Pills
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            artist.genres.filter { it != "MUSIC" }.take(2).forEach { genre ->
                                BrutalistBadge(text = genre, color = TextPrimary, isOutlined = true)
                            }
                        }
                    }
                }

                // Bottom Vibe Section
                if (artist.vibes.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MutedBackground.copy(alpha = 0.3f))
                            .padding(horizontal = 20.dp, vertical = 12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(mood.color)
                            )
                            Text(
                                text = mood.label + " • " + artist.vibes.first().uppercase(),
                                style = BrutalistTypography.labelSmall,
                                color = TextMuted.copy(alpha = 0.6f),
                                fontSize = 9.sp,
                                letterSpacing = 2.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }
    }
}
