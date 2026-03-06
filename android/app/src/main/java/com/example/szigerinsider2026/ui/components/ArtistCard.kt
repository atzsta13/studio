package com.example.szigerinsider2026.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.getMood
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@Composable
fun ArtistCard(
    artist: Artist,
    modifier: Modifier = Modifier,
    isFavorite: Boolean = false,
    onToggleFavorite: (String) -> Unit = {},
    onClick: (String) -> Unit = {}
) {
    val haptic = rememberHapticManager()
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessHigh),
        label = "cardScale"
    )

    Column(
        modifier = modifier
            .graphicsLayer(scaleX = scale, scaleY = scale)
            .fillMaxWidth()
            .clip(RoundedCornerShape(32.dp))
            .background(CardBackground)
            .border(
                width = 1.dp,
                color = if (artist.isHeadliner) PrimaryMagenta.copy(alpha = 0.4f) else Color.White.copy(alpha = 0.05f),
                shape = RoundedCornerShape(32.dp)
            )
            .clickable(interactionSource = interactionSource, indication = null) { haptic.lightTap(); onClick(artist.id) }
    ) {
        // Upper Visual Section (4:5 Aspect Ratio)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(4f / 5f)
                .background(MutedBackground)
        ) {
            // Artist Background Image
            if (artist.imageUrl != null) {
                AsyncImage(
                    model = artist.imageUrl,
                    contentDescription = artist.artist,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            // Tactical Gradient Blur Overlay (Tactical OLED)
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.2f),
                                Color.Black.copy(alpha = 0.95f)
                            ),
                            startY = 0f
                        )
                    )
            )

            // Overlays: Day Badge (Top Left)
            if (artist.day != null) {
                Box(
                    modifier = Modifier
                        .padding(16.dp)
                        .clip(RoundedCornerShape(100))
                        .background(Color.Black.copy(alpha = 0.6f))
                        .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(100))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = artist.day.uppercase(),
                        style = BrutalistTypography.labelSmall,
                        color = Color.White,
                        fontSize = 8.sp,
                        letterSpacing = 1.sp
                    )
                }
            }

            // Overlays: Favorite Star (Top Right)
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.6f))
                    .border(
                        1.dp,
                        if (isFavorite) PrimaryMagenta else Color.White.copy(alpha = 0.1f),
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
                    tint = if (isFavorite) PrimaryMagenta else Color.White.copy(alpha = 0.6f),
                    modifier = Modifier.size(24.dp)
                )
            }

            // Overlays: Artist Info (Bottom Overlay)
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(20.dp)
            ) {
                Text(
                    text = artist.artist.uppercase(),
                    style = BrutalistTypography.titleLarge,
                    color = if (artist.isHeadliner) PrimaryMagenta else Color.White,
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                // Genre Pills
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    artist.genres.filter { it != "MUSIC" }.take(2).forEach { genre ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(100))
                                .background(Color.White.copy(alpha = 0.1f))
                                .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(100))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = genre.uppercase(),
                                style = BrutalistTypography.labelSmall,
                                color = TextPrimary,
                                fontSize = 8.sp,
                                letterSpacing = 1.sp
                            )
                        }
                    }
                }
            }
        }

        // Bottom Vibe Section (Subtle Muted Area)
        if (artist.vibes.isNotEmpty()) {
            val mood = getMood(artist)
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
                        maxLines = 1
                    )
                }
            }
        }
    }
}
