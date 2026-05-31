package com.example.szigerinsider2026.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupDiffRepository
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LineupDiffSheet(
    onDismiss: () -> Unit,
    onArtistClick: (String) -> Unit
) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()

    var selectedTab by remember { mutableIntStateOf(0) }
    var diff by remember { mutableStateOf<LineupDiffRepository.LineupDiff?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        diff = LineupDiffRepository(context).computeDiff()
        isLoading = false
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = CardBackground,
        contentColor = TextPrimary,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 12.dp, bottom = 4.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Color.White.copy(alpha = 0.2f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 40.dp)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "LINEUP EVOLUTION",
                        color = TextPrimary,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-0.5).sp
                    )
                    Text(
                        text = "2025 → 2026",
                        color = AcidYellow,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }
                IconButton(onClick = { haptic.lightTap(); onDismiss() }) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                }
            }

            // Tabs
            val tabTitles = listOf(
                "NEW ${if (diff != null) "(${diff!!.newArtists.size})" else ""}",
                "RETURNING ${if (diff != null) "(${diff!!.returningArtists.size})" else ""}",
                "VIBE SHIFT"
            )

            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = CardBackground,
                contentColor = AcidYellow,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = AcidYellow
                    )
                }
            ) {
                tabTitles.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { haptic.lightTap(); selectedTab = index },
                        text = {
                            Text(
                                title,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 0.5.sp
                            )
                        }
                    )
                }
            }

            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = AcidYellow)
                }
            } else {
                diff?.let { d ->
                    when (selectedTab) {
                        0 -> DiffArtistList(artists = d.newArtists, label = "NEW THIS YEAR", accentColor = ToxicGreen, onArtistClick = { haptic.mediumTap(); onArtistClick(it); onDismiss() })
                        1 -> DiffArtistList(artists = d.returningArtists, label = "BACK AGAIN", accentColor = CyanPulse, onArtistClick = { haptic.mediumTap(); onArtistClick(it); onDismiss() })
                        2 -> VibeShiftTab(shifts = d.genreShifts)
                    }
                }
            }
        }
    }
}

@Composable
private fun DiffArtistList(
    artists: List<Artist>,
    label: String,
    accentColor: Color,
    onArtistClick: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(max = 420.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "${artists.size} $label",
                color = accentColor,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.5.sp,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }
        items(artists, key = { it.id }) { artist ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(OLEDBlack)
                    .clickable { onArtistClick(artist.id) }
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AsyncImage(
                    model = artist.imageUrl,
                    contentDescription = artist.artist,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = artist.artist,
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = buildString {
                            artist.countryCode?.let { append("$it · ") }
                            append(artist.genres.take(2).joinToString(", "))
                        },
                        color = TextMuted,
                        fontSize = 11.sp
                    )
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(accentColor.copy(alpha = 0.15f))
                        .padding(horizontal = 6.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = if (label.contains("NEW")) "NEW" else "↩",
                        color = accentColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }
    }
}

@Composable
private fun VibeShiftTab(shifts: List<Pair<String, Int>>) {
    val maxAbs = shifts.maxOfOrNull { kotlin.math.abs(it.second) }?.toFloat() ?: 1f

    LazyColumn(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(max = 420.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text(
                text = "GENRE LANDSCAPE SHIFT",
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.5.sp,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }
        items(shifts, key = { it.first }) { (genre, delta) ->
            val isPositive = delta > 0
            val barColor = if (isPositive) ToxicGreen else PrimaryMagenta
            val barFraction = kotlin.math.abs(delta) / maxAbs

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = genre,
                    color = TextPrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.width(120.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isPositive) "+$delta" else "$delta",
                    color = barColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier.width(36.dp)
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(CardBackground)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .fillMaxWidth(barFraction)
                            .clip(RoundedCornerShape(4.dp))
                            .background(barColor)
                    )
                }
            }
        }
    }
}
