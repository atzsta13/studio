package com.example.szigerinsider2026.ui.discover

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.components.ArtistCard
import com.example.szigerinsider2026.ui.theme.AcidYellow
import com.example.szigerinsider2026.ui.theme.BrutalistTypography
import com.example.szigerinsider2026.ui.theme.OLEDBlack
import com.example.szigerinsider2026.ui.theme.PrimaryMagenta

@Composable
fun DiscoverScreen() {
    val context = LocalContext.current
    val repository = remember { LineupRepository(context) }
    
    var artists by remember { mutableStateOf(emptyList<Artist>()) }
    var selectedVibe by remember { mutableStateOf<String?>(null) }
    var allVibes by remember { mutableStateOf(emptyList<String>()) }

    LaunchedEffect(Unit) {
        val lineup = repository.getLineup()
        artists = lineup
        allVibes = lineup.flatMap { it.vibes }.distinct().sorted()
    }

    val filteredArtists = remember(artists, selectedVibe) {
        if (selectedVibe == null) {
            artists
        } else {
            artists.filter { it.vibes.contains(selectedVibe) }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
    ) {
        // Header (Music Finder Style)
        Column(
            modifier = Modifier
                .padding(horizontal = 16.dp, vertical = 24.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(PrimaryMagenta.copy(alpha = 0.1f))
                    .padding(12.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Star,
                    contentDescription = null,
                    tint = PrimaryMagenta,
                    modifier = Modifier.size(32.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "MUSIC ",
                    style = BrutalistTypography.headlineLarge,
                    color = Color.White
                )
                Text(
                    text = "FINDER",
                    style = BrutalistTypography.headlineLarge,
                    color = PrimaryMagenta
                )
            }
            
            Text(
                text = "Curate your personal journey.",
                style = BrutalistTypography.bodyLarge,
                color = Color.White.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        // Vibe Filters
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                VibeChip(
                    text = "ALL MOODS",
                    isSelected = selectedVibe == null,
                    onClick = { selectedVibe = null }
                )
            }
            items(allVibes) { vibe ->
                VibeChip(
                    text = vibe.uppercase(),
                    isSelected = selectedVibe == vibe,
                    onClick = { selectedVibe = vibe }
                )
            }
        }

        // Artist Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 32.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(filteredArtists) { artist ->
                ArtistCard(artist = artist)
            }
        }
    }
}

@Composable
fun VibeChip(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(if (isSelected) PrimaryMagenta else Color.White.copy(alpha = 0.05f))
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = text,
            style = BrutalistTypography.labelSmall,
            color = if (isSelected) Color.White else Color.White.copy(alpha = 0.6f)
        )
    }
}

