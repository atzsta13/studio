package com.example.szigerinsider2026.ui.artist

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.discover.ArtistViewModel
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@Composable
fun ArtistDetailScreen(
    artistId: String,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    var artist by remember { mutableStateOf<Artist?>(null) }

    val artistViewModel: ArtistViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ArtistViewModel(AppDatabase.getDatabase(context).userDao()) as T
            }
        }
    )
    val favoriteArtistIds by artistViewModel.favoriteArtistIds.collectAsStateWithLifecycle()
    val isFavorite = favoriteArtistIds.contains(artistId)

    LaunchedEffect(artistId) {
        artist = LineupRepository(context).getLineup().find { it.id == artistId }
    }

    artist?.let { a ->
        LazyColumn(modifier = Modifier.fillMaxSize().background(OLEDBlack)) {

            // Hero
            item {
                Box(modifier = Modifier.fillMaxWidth().height(440.dp)) {
                    AsyncImage(
                        model = a.imageUrl,
                        contentDescription = a.artist,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                    Box(
                        modifier = Modifier.fillMaxSize().background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.35f),
                                    Color.Transparent,
                                    Color.Black.copy(alpha = 0.6f),
                                    OLEDBlack
                                )
                            )
                        )
                    )
                    // Back
                    Box(
                        modifier = Modifier
                            .padding(top = 48.dp, start = 16.dp)
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.55f))
                            .border(1.dp, Color.White.copy(alpha = 0.12f), CircleShape)
                            .clickable { haptic.lightTap(); onBack() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = Color.White, modifier = Modifier.size(22.dp))
                    }
                    // Favorite
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(top = 48.dp, end = 16.dp)
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.55f))
                            .border(1.dp, if (isFavorite) PrimaryMagenta else Color.White.copy(alpha = 0.12f), CircleShape)
                            .clickable {
                                if (isFavorite) haptic.mediumTap() else haptic.favoriteTap()
                                artistViewModel.toggleFavorite(a.id)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Filled.Star else Icons.Outlined.StarBorder,
                            contentDescription = "Favorite",
                            tint = if (isFavorite) PrimaryMagenta else Color.White.copy(alpha = 0.6f),
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    // Name
                    Column(modifier = Modifier.align(Alignment.BottomStart).padding(24.dp)) {
                        if (a.isHeadliner) {
                            Text(
                                text = "HEADLINER",
                                style = BrutalistTypography.labelSmall,
                                color = PrimaryMagenta,
                                letterSpacing = 3.sp,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )
                        }
                        Text(
                            text = a.artist.uppercase(),
                            fontSize = 40.sp,
                            style = BrutalistTypography.headlineLarge,
                            color = Color.White,
                            lineHeight = 42.sp
                        )
                    }
                }
            }

            // Meta pills
            item {
                LazyRow(
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    a.day?.let { item { MetaPill(it.uppercase(), AcidYellow) } }
                    a.stage?.let { item { MetaPill(it.uppercase(), CyanPulse) } }
                    a.countryCode?.let { item { MetaPill(it.uppercase(), ToxicGreen) } }
                    if (a.startTime != null && a.endTime != null) {
                        item { MetaPill("${a.startTime} – ${a.endTime}", TextMuted) }
                    }
                }
            }

            // Genres
            if (a.genres.filter { it != "MUSIC" }.isNotEmpty()) {
                item {
                    SectionBlock(title = "GENRES") {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            a.genres.filter { it != "MUSIC" }.forEach { genre ->
                                TagPill(genre, MutedBackground, TextPrimary)
                            }
                        }
                    }
                }
            }

            // Vibes
            if (a.vibes.isNotEmpty()) {
                item {
                    SectionBlock(title = "VIBES") {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            a.vibes.forEach { vibe ->
                                TagPill(vibe, PrimaryMagenta.copy(alpha = 0.1f), PrimaryMagenta, PrimaryMagenta.copy(alpha = 0.25f))
                            }
                        }
                    }
                }
            }

            // Description
            if (!a.description.isNullOrBlank()) {
                item {
                    SectionBlock(title = "ABOUT") {
                        Text(
                            text = a.description,
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 15.sp,
                            lineHeight = 24.sp
                        )
                    }
                }
            }

            // Social links
            a.socials?.let { socials ->
                val links = listOfNotNull(
                    socials.spotify?.let { "Spotify" to it },
                    socials.instagram?.let { "Instagram" to it },
                    socials.youtube?.let { "YouTube" to it },
                    socials.x?.let { "X / Twitter" to it },
                    socials.tiktok?.let { "TikTok" to it },
                    socials.appleMusic?.let { "Apple Music" to it },
                    socials.soundcloud?.let { "SoundCloud" to it },
                    socials.facebook?.let { "Facebook" to it },
                    socials.website?.let { "Website" to it }
                )
                if (links.isNotEmpty()) {
                    item {
                        SectionBlock(title = "LINKS") {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                links.forEach { (name, url) ->
                                    val platformColor = when (name) {
                                        "Spotify" -> Color(0xFF1DB954)
                                        "Instagram" -> Color(0xFFE1306C)
                                        "YouTube" -> Color(0xFFFF0000)
                                        "X / Twitter" -> Color(0xFFFFFFFF)
                                        "TikTok" -> Color(0xFFEE1D52)
                                        "Apple Music" -> Color(0xFFFC3C44)
                                        "SoundCloud" -> Color(0xFFFF5500)
                                        "Facebook" -> Color(0xFF1877F2)
                                        else -> TextMuted
                                    }
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(16.dp))
                                            .background(platformColor.copy(alpha = 0.08f))
                                            .border(1.dp, platformColor.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                                            .clickable {
                                                haptic.lightTap()
                                                runCatching {
                                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                                                }
                                            }
                                            .padding(horizontal = 20.dp, vertical = 16.dp)
                                    ) {
                                        Text(name.uppercase(), style = BrutalistTypography.labelSmall, color = platformColor, letterSpacing = 1.5.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(100.dp)) }
        }
    } ?: Box(modifier = Modifier.fillMaxSize().background(OLEDBlack), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = PrimaryMagenta)
    }
}

@Composable
private fun SectionBlock(title: String, content: @Composable () -> Unit) {
    Column(modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp)) {
        Text(
            text = title,
            style = BrutalistTypography.labelSmall,
            color = TextMuted,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        content()
    }
}

@Composable
private fun MetaPill(text: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(100))
            .background(color.copy(alpha = 0.1f))
            .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(100))
            .padding(horizontal = 14.dp, vertical = 6.dp)
    ) {
        Text(text, style = BrutalistTypography.labelSmall, color = color, fontSize = 11.sp)
    }
}

@Composable
private fun TagPill(text: String, bg: Color, textColor: Color, borderColor: Color = Color.White.copy(alpha = 0.08f)) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(100))
            .background(bg)
            .border(1.dp, borderColor, RoundedCornerShape(100))
            .padding(horizontal = 14.dp, vertical = 6.dp)
    ) {
        Text(text.uppercase(), style = BrutalistTypography.labelSmall, color = textColor, fontSize = 11.sp)
    }
}
