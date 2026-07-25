package org.openfestivalhub.ui.discover

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.utils.rememberHapticManager

@Composable
fun TagCloud(
    artists: List<Artist>,
    selectedGenre: String?,
    onGenreSelect: (String?) -> Unit,
    selectedVibe: String?,
    onVibeSelect: (String?) -> Unit
) {
    val haptic = rememberHapticManager()

    val topGenres = remember(artists) {
        artists.flatMap { it.genres }
            .filter { it != "MUSIC" }
            .groupingBy { it }
            .eachCount()
            .entries
            .sortedByDescending { it.value }
            .take(10)
    }

    val topVibes = remember(artists) {
        artists.flatMap { it.vibes }
            .groupingBy { it }
            .eachCount()
            .entries
            .sortedByDescending { it.value }
            .take(10)
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Genres Row
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "TOP GENRES",
                style = BrutalistTypography.labelSmall,
                color = TextMuted,
                fontSize = 9.sp,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(horizontal = 4.dp)
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 4.dp)
            ) {
                item {
                    TagChip(
                        text = "ALL",
                        isSelected = selectedGenre == null,
                        color = AcidYellow,
                        onClick = { haptic.lightTap(); onGenreSelect(null) }
                    )
                }
                items(topGenres) { (genre, count) ->
                    TagChip(
                        text = genre.uppercase(),
                        isSelected = selectedGenre == genre,
                        color = AcidYellow,
                        count = count,
                        onClick = { haptic.lightTap(); onGenreSelect(if (selectedGenre == genre) null else genre) }
                    )
                }
            }
        }

        // Vibes Row
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "TOP VIBES",
                style = BrutalistTypography.labelSmall,
                color = TextMuted,
                fontSize = 9.sp,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(horizontal = 4.dp)
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 4.dp)
            ) {
                item {
                    TagChip(
                        text = "ALL",
                        isSelected = selectedVibe == null,
                        color = ToxicGreen,
                        onClick = { haptic.lightTap(); onVibeSelect(null) }
                    )
                }
                items(topVibes) { (vibe, count) ->
                    TagChip(
                        text = vibe.uppercase(),
                        isSelected = selectedVibe == vibe,
                        color = ToxicGreen,
                        count = count,
                        onClick = { haptic.lightTap(); onVibeSelect(if (selectedVibe == vibe) null else vibe) }
                    )
                }
            }
        }
    }
}

@Composable
fun TagChip(
    text: String,
    isSelected: Boolean,
    color: Color,
    count: Int? = null,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(if (isSelected) color else Color.White.copy(alpha = 0.05f))
            .border(
                width = 1.dp,
                color = if (isSelected) color else Color.White.copy(alpha = 0.1f),
                shape = RoundedCornerShape(8.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = text,
                color = if (isSelected) Color.Black else Color.White,
                fontSize = 11.sp,
                fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold
            )
            if (count != null) {
                Text(
                    text = " $count",
                    color = if (isSelected) Color.Black.copy(alpha = 0.5f) else Color.White.copy(alpha = 0.3f),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Normal,
                    modifier = Modifier.padding(start = 2.dp)
                )
            }
        }
    }
}
