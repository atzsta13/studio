package com.example.szigerinsider2026.ui.schedule

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.discover.ArtistViewModel
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

private val DAY_ORDER = listOf("Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday")
private val DAY_LABELS = mapOf(
    "Wednesday" to "WED", "Thursday" to "THU", "Friday" to "FRI",
    "Saturday" to "SAT", "Sunday" to "SUN", "Monday" to "MON", "Tuesday" to "TUE"
)

@Composable
fun ScheduleScreen(onArtistClick: (String) -> Unit = {}) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()

    val artistViewModel: ArtistViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                ArtistViewModel(AppDatabase.getDatabase(context).userDao()) as T
        }
    )
    val favoriteIds by artistViewModel.favoriteArtistIds.collectAsStateWithLifecycle()

    var allArtists by remember { mutableStateOf<List<Artist>>(emptyList()) }
    LaunchedEffect(Unit) {
        allArtists = LineupRepository(context).getLineup()
    }

    val availableDays = remember(allArtists) {
        allArtists.mapNotNull { it.day }.distinct()
            .sortedBy { DAY_ORDER.indexOf(it).let { i -> if (i == -1) 99 else i } }
    }

    var selectedDay by remember(availableDays) { mutableStateOf(availableDays.firstOrNull() ?: "") }

    val dayArtists = remember(allArtists, selectedDay) {
        allArtists
            .filter { it.day?.equals(selectedDay, ignoreCase = true) == true }
            .sortedWith(
                compareByDescending<Artist> { it.isHeadliner }
                    .thenBy { it.startTime ?: "99:99" }
                    .thenBy { it.artist }
            )
    }

    // Group by stage
    val byStage = remember(dayArtists) {
        dayArtists.groupBy { it.stage ?: "Other" }.entries
            .sortedBy { if (it.key.contains("main", ignoreCase = true)) 0 else 1 }
    }

    Column(
        modifier = Modifier.fillMaxSize().background(OLEDBlack)
    ) {
        // Header
        Column(
            modifier = Modifier.padding(horizontal = 24.dp, vertical = 20.dp)
        ) {
            Text(
                text = "SCHEDULE",
                fontSize = 36.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                color = Color.White,
                letterSpacing = (-1.5).sp,
                lineHeight = 34.sp
            )
            Text(
                text = "Aug 6 – 11 · Budapest · Óbudai-sziget",
                color = TextMuted,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 2.dp)
            )
        }

        // Day tabs
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.padding(bottom = 12.dp)
        ) {
            items(availableDays) { day ->
                val isSelected = day == selectedDay
                val bgColor by animateColorAsState(
                    targetValue = if (isSelected) AcidYellow else Color.White.copy(alpha = 0.05f),
                    animationSpec = tween(200),
                    label = "dayTab"
                )
                val textColor by animateColorAsState(
                    targetValue = if (isSelected) Color.Black else TextMuted,
                    animationSpec = tween(200),
                    label = "dayTabText"
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(bgColor)
                        .clickable { haptic.lightTap(); selectedDay = day }
                        .padding(horizontal = 18.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = DAY_LABELS[day] ?: day.take(3).uppercase(),
                        fontWeight = FontWeight.Black,
                        color = textColor,
                        fontSize = 12.sp,
                        letterSpacing = 1.sp
                    )
                }
            }
        }

        // Artist count
        Text(
            text = "${dayArtists.size} ARTISTS · $selectedDay".uppercase(),
            style = BrutalistTypography.labelSmall,
            color = TextMuted,
            fontSize = 9.sp,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(horizontal = 24.dp, vertical = 4.dp)
        )

        // Schedule list
        LazyColumn(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            byStage.forEach { (stage, artists) ->
                item(key = "header_$stage") {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp)
                            .padding(top = 16.dp, bottom = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(PrimaryMagenta.copy(alpha = 0.12f))
                                .border(1.dp, PrimaryMagenta.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = stage.uppercase(),
                                style = BrutalistTypography.labelSmall,
                                color = PrimaryMagenta,
                                fontSize = 9.sp
                            )
                        }
                    }
                }
                items(artists, key = { it.id }) { artist ->
                    ScheduleRow(
                        artist = artist,
                        isFavorite = favoriteIds.contains(artist.id),
                        onToggleFavorite = { artistViewModel.toggleFavorite(artist.id) },
                        onClick = { onArtistClick(artist.id) },
                        hapticTap = { haptic.lightTap() }
                    )
                }
            }
            item { Spacer(modifier = Modifier.height(100.dp)) }
        }
    }
}

@Composable
private fun ScheduleRow(
    artist: Artist,
    isFavorite: Boolean,
    onToggleFavorite: () -> Unit,
    onClick: () -> Unit,
    hapticTap: () -> Unit
) {
    val accentColor = when {
        artist.isHeadliner -> PrimaryMagenta
        isFavorite -> AcidYellow
        else -> Color.White.copy(alpha = 0.04f)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(CardBackground)
            .border(1.dp, accentColor.copy(alpha = if (artist.isHeadliner || isFavorite) 0.35f else 0.04f), RoundedCornerShape(20.dp))
            .clickable { hapticTap(); onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Time column
        Column(
            modifier = Modifier.width(52.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (artist.startTime != null) {
                Text(
                    text = artist.startTime,
                    fontWeight = FontWeight.Black,
                    color = if (artist.isHeadliner) PrimaryMagenta else Color.White,
                    fontSize = 14.sp,
                    letterSpacing = (-0.5).sp
                )
            }
            if (artist.endTime != null) {
                Text(
                    text = artist.endTime,
                    color = TextMuted,
                    fontSize = 10.sp
                )
            }
        }

        // Divider
        Box(
            modifier = Modifier
                .width(1.dp)
                .height(36.dp)
                .background(Color.White.copy(alpha = 0.07f))
        )
        Spacer(modifier = Modifier.width(14.dp))

        // Artist info
        Column(modifier = Modifier.weight(1f)) {
            if (artist.isHeadliner) {
                Text(
                    text = "HEADLINER",
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    color = PrimaryMagenta,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
            }
            Text(
                text = artist.artist.uppercase(),
                fontWeight = FontWeight.Black,
                color = Color.White,
                fontSize = 15.sp,
                letterSpacing = (-0.3).sp
            )
            if (artist.genres.filter { it != "MUSIC" }.isNotEmpty()) {
                Text(
                    text = artist.genres.filter { it != "MUSIC" }.take(2).joinToString(" · "),
                    color = TextMuted,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }

        // Favorite star
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(if (isFavorite) AcidYellow.copy(alpha = 0.12f) else Color.Transparent)
                .clickable { onToggleFavorite() }
                .padding(6.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Filled.Star,
                contentDescription = "Favorite",
                tint = if (isFavorite) AcidYellow else Color.White.copy(alpha = 0.2f),
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
