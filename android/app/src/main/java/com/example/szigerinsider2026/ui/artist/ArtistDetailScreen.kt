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
import androidx.compose.foundation.layout.ExperimentalLayoutApi
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
import com.example.szigerinsider2026.ui.components.*
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

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ArtistDetailScreen(
    artistId: String,
    onBack: () -> Unit,
    onArtistNavigate: (String) -> Unit = {},
    onScrollStateChanged: (Boolean) -> Unit = {},
    onGenreClick: (String) -> Unit = {},
    onVibeClick: (String) -> Unit = {}
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
                        contentDescription = a.name,
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
                            text = a.name.uppercase(),
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
                    a.day?.let { item { BrutalistBadge(it.uppercase(), AcidYellow) } }
                    a.stage?.let { item { BrutalistBadge(it.uppercase(), CyanPulse) } }
                    a.countryCode?.let { item { BrutalistBadge(it.uppercase(), ToxicGreen) } }
                    if (a.startTime != null && a.endTime != null) {
                        item { BrutalistBadge("${a.startTime} – ${a.endTime}", TextMuted, isOutlined = true) }
                    }
                }
            }

            // SAW THIS SET toggle (Moved higher for accessibility)
            item {
                val showSeenButton = remember(a) { com.example.szigerinsider2026.ui.utils.hasSetStarted(a) }
                
                if (showSeenButton || isSeen) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 8.dp)
                    ) {
                        if (isSeen) {
                            BrutalistButton(
                                text = "✓ SAW THIS SET",
                                onClick = {
                                    haptic.lightTap()
                                    isSeen = toggleSeenArtist(context, a.id)
                                },
                                color = ToxicGreen,
                                textColor = Color.Black,
                                modifier = Modifier.fillMaxWidth()
                            )
                        } else {
                            BrutalistButton(
                                text = "SAW THIS SET?",
                                onClick = {
                                    haptic.successBurst()
                                    isSeen = toggleSeenArtist(context, a.id)
                                },
                                color = AcidYellow.copy(alpha = 0.1f),
                                textColor = AcidYellow,
                                modifier = Modifier.fillMaxWidth()
                                    .border(1.dp, AcidYellow.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                            )
                        }
                    }
                }
            }

            // Genres (clickable)
            if (a.genres.filter { it != "MUSIC" }.isNotEmpty()) {
                item {
                    SectionBlock(title = "GENRES") {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            a.genres.filter { it != "MUSIC" }.forEach { genre ->
                                BrutalistBadge(
                                    text = genre,
                                    color = TextPrimary,
                                    isOutlined = true,
                                    modifier = Modifier.clickable {
                                        haptic.lightTap()
                                        onGenreClick(genre)
                                    }
                                )
                            }
                        }
                    }
                }
            }

            // Vibes (clickable)
            if (a.vibes.isNotEmpty()) {
                item {
                    SectionBlock(title = "VIBES") {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            a.vibes.forEach { vibe ->
                                BrutalistBadge(
                                    text = vibe,
                                    color = PrimaryMagenta,
                                    modifier = Modifier.clickable {
                                        haptic.mediumTap()
                                        onVibeClick(vibe)
                                    }
                                )
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
                            FlowRow( // Use FlowRow for more compact social buttons
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                for (link in links) {
                                    val name = link.first
                                    val url = link.second
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
                                            .wrapContentWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(platformColor.copy(alpha = 0.1f))
                                            .border(1.dp, platformColor.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                                            .clickable {
                                                haptic.lightTap()
                                                runCatching {
                                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                                                }
                                            }
                                            .padding(horizontal = 14.dp, vertical = 10.dp)
                                    ) {
                                        Text(name.uppercase(), style = BrutalistTypography.labelSmall, color = platformColor, letterSpacing = 1.sp, fontSize = 9.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Island Listen — Spotify embed (shows top songs)
            val spotifyId = a.socials?.spotify
                ?.split("/artist/")?.getOrNull(1)
                ?.split("?")?.firstOrNull()
            if (spotifyId != null) {
                item {
                    SpotifyIsland(
                        artistName = a.name,
                        spotifyId = spotifyId,
                        onOpenSpotify = {
                            haptic.successBurst()
                            runCatching {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("spotify:artist:$spotifyId")))
                            }.onFailure {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://open.spotify.com/artist/$spotifyId")))
                            }
                        }
                    )
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

            item { Spacer(modifier = Modifier.height(40.dp)) }
        }
    } ?: Box(modifier = Modifier.fillMaxSize().background(OLEDBlack), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = PrimaryMagenta)
    }
}

@Composable
private fun SpotifyIsland(
    artistName: String,
    spotifyId: String,
    onOpenSpotify: () -> Unit
) {
    SectionBlock(title = "ISLAND LISTEN") {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(Brush.horizontalGradient(listOf(Color(0xFF1DB954).copy(alpha = 0.15f), OLEDBlack)))
                .border(1.dp, Color(0xFF1DB954).copy(alpha = 0.3f), RoundedCornerShape(24.dp))
                .clickable { onOpenSpotify() }
                .padding(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Spotify Icon + Branding
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF1DB954)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "≈",
                        color = OLEDBlack,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.offset(y = (-2).dp)
                    )
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = artistName.uppercase(),
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "LISTEN ON SPOTIFY",
                        color = Color(0xFF1DB954).copy(alpha = 0.8f),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp
                    )
                }
                
                // Play Icon
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .border(1.dp, Color(0xFF1DB954).copy(alpha = 0.5f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text("▶", color = Color(0xFF1DB954), fontSize = 14.sp)
                }
            }
        }
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
private fun SimilarArtistCard(
    artist: Artist,
    sharedCount: Int,
    onClick: () -> Unit
) {
    val haptic = rememberHapticManager()
    Box(
        modifier = Modifier
            .width(130.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(16.dp))
            .clickable { haptic.mediumTap(); onClick() }
    ) {
        Column {
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = artist.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(16.dp)),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(8.dp)) {
                Text(
                    text = artist.name,
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
