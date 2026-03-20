package com.example.szigerinsider2026.ui.artist

import android.content.Intent
import android.net.Uri
import android.webkit.WebView
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
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
import com.example.szigerinsider2026.ui.utils.getSeenArtistIds
import com.example.szigerinsider2026.ui.utils.toggleSeenArtist

private fun findSimilarArtists(current: Artist, all: List<Artist>): List<Pair<Artist, Int>> {
    return all
        .filter { it.id != current.id }
        .map { candidate ->
            val sharedGenres = current.genres.intersect(candidate.genres.toSet()).size
            val sharedVibes = current.vibes.intersect(candidate.vibes.toSet()).size
            Pair(candidate, sharedGenres * 2 + sharedVibes)
        }
        .filter { it.second > 0 }
        .sortedByDescending { it.second }
        .take(5)
}

@Composable
fun ArtistDetailScreen(
    artistId: String,
    onBack: () -> Unit,
    onArtistNavigate: (String) -> Unit = {},
    onScrollStateChanged: (Boolean) -> Unit = {}
) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    var artist by remember { mutableStateOf<Artist?>(null) }
    var allArtists by remember { mutableStateOf<List<Artist>>(emptyList()) }
    val scrollState = androidx.compose.foundation.lazy.rememberLazyListState()

    val artistViewModel: ArtistViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ArtistViewModel(AppDatabase.getDatabase(context).userDao()) as T
            }
        }
    )
    val favoriteArtistIds by artistViewModel.favoriteArtistIds.collectAsStateWithLifecycle()
    val mustSeeArtistIds by artistViewModel.mustSeeArtistIds.collectAsStateWithLifecycle()
    val interestedArtistIds by artistViewModel.interestedArtistIds.collectAsStateWithLifecycle()

    val isFavorite = favoriteArtistIds.contains(artistId)
    val currentTier = when {
        mustSeeArtistIds.contains(artistId) -> "must_see"
        interestedArtistIds.contains(artistId) -> "interested"
        else -> null
    }

    var isSeen by remember {
        mutableStateOf(getSeenArtistIds(context).contains(artistId))
    }

    LaunchedEffect(artistId) {
        val lineup = LineupRepository(context).getLineup()
        artist = lineup.find { it.id == artistId }
        allArtists = lineup
    }

    LaunchedEffect(scrollState.isScrollInProgress) {
        onScrollStateChanged(scrollState.isScrollInProgress)
    }

    artist?.let { a ->
        val similarArtists = remember(a, allArtists) {
            if (allArtists.isEmpty()) emptyList()
            else findSimilarArtists(a, allArtists)
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().background(OLEDBlack),
            state = scrollState
        ) {

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
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White, modifier = Modifier.size(22.dp))
                    }
                    // Favorite (tiered: None → Interested → Must See → None)
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(top = 48.dp, end = 16.dp)
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.55f))
                            .border(
                                1.dp,
                                when (currentTier) {
                                    "must_see" -> PrimaryMagenta
                                    "interested" -> CyanPulse
                                    else -> Color.White.copy(alpha = 0.12f)
                                },
                                CircleShape
                            )
                            .clickable {
                                // Cycle through tiers: None → Interested → Must See → None
                                when (currentTier) {
                                    null -> {
                                        haptic.favoriteTap()
                                        artistViewModel.setFavoriteTier(a.id, "interested")
                                    }
                                    "interested" -> {
                                        haptic.successBurst()
                                        artistViewModel.setFavoriteTier(a.id, "must_see")
                                    }
                                    "must_see" -> {
                                        haptic.lightTap()
                                        artistViewModel.removeFavorite(a.id)
                                    }
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = when (currentTier) {
                                "must_see" -> Icons.Filled.Star
                                "interested" -> Icons.Filled.Star
                                else -> Icons.Outlined.StarBorder
                            },
                            contentDescription = when (currentTier) {
                                "must_see" -> "Must See"
                                "interested" -> "Interested"
                                else -> "Add to Favorites"
                            },
                            tint = when (currentTier) {
                                "must_see" -> PrimaryMagenta
                                "interested" -> CyanPulse
                                else -> Color.White.copy(alpha = 0.6f)
                            },
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

            // Island Listen — Spotify open button (per Spotify official mobile guidelines)
            a.socials?.spotify?.let { spotifyUrl ->
                item {
                    SectionBlock(title = "ISLAND LISTEN") {
                        Button(
                            onClick = {
                                haptic.successBurst()
                                runCatching {
                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(spotifyUrl)))
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF1DB954),
                                contentColor = Color.White
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Star,
                                    contentDescription = null,
                                    modifier = Modifier.size(20.dp),
                                    tint = Color.White
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "LISTEN ON SPOTIFY",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 14.sp,
                                    letterSpacing = 1.sp
                                )
                            }
                        }
                    }
                }
            }

            // SAW THIS SET toggle
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 12.dp)
                ) {
                    if (isSeen) {
                        Button(
                            onClick = {
                                haptic.lightTap()
                                isSeen = toggleSeenArtist(context, a.id)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = ToxicGreen,
                                contentColor = Color.Black
                            ),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Text(
                                text = "✓ SAW THIS SET",
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                letterSpacing = 1.5.sp,
                                color = Color.Black
                            )
                        }
                    } else {
                        OutlinedButton(
                            onClick = {
                                haptic.successBurst()
                                isSeen = toggleSeenArtist(context, a.id)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = CardBackground,
                                contentColor = AcidYellow
                            ),
                            border = BorderStroke(1.dp, AcidYellow.copy(alpha = 0.5f)),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Text(
                                text = "SAW THIS SET?",
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                letterSpacing = 1.5.sp,
                                color = AcidYellow
                            )
                        }
                    }
                }
            }

            // More Like This
            if (similarArtists.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(32.dp))
                    Text(
                        text = "MORE LIKE THIS",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                    )
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(horizontal = 20.dp)
                    ) {
                        items(similarArtists, key = { it.first.id }) { (similar, sharedCount) ->
                            SimilarArtistCard(
                                artist = similar,
                                sharedCount = sharedCount,
                                onClick = { onArtistNavigate(similar.id) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(24.dp))
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

@Composable
private fun SimilarArtistCard(
    artist: Artist,
    sharedCount: Int,
    onClick: () -> Unit
) {
    val haptic = rememberHapticManager()
    Box(
        modifier = Modifier
            .width(110.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(16.dp))
            .clickable { haptic.mediumTap(); onClick() }
    ) {
        Column {
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = artist.artist,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
                    .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(8.dp)) {
                Text(
                    text = artist.artist,
                    color = TextPrimary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    maxLines = 2,
                    lineHeight = 14.sp
                )
                Text(
                    text = "$sharedCount SHARED",
                    color = AcidYellow,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 0.5.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
    }
}
