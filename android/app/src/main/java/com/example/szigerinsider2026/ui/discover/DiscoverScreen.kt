package com.example.szigerinsider2026.ui.discover

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.navigation.NavController
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.components.ArtistCard
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@Composable
fun DiscoverScreen(onArtistClick: (String) -> Unit = {}, navController: NavController? = null) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val db = remember { AppDatabase.getDatabase(context) }

    val discoverViewModel: DiscoverViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return DiscoverViewModel(LineupRepository(context)) as T
            }
        }
    )
    val artistViewModel: ArtistViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ArtistViewModel(db.userDao()) as T
            }
        }
    )

    val filteredArtists by discoverViewModel.filteredArtists.collectAsStateWithLifecycle()
    val availableDays by discoverViewModel.availableDays.collectAsStateWithLifecycle()
    val availableGenres by discoverViewModel.availableGenres.collectAsStateWithLifecycle()
    val availableVibes by discoverViewModel.availableVibes.collectAsStateWithLifecycle()
    val sortMode by discoverViewModel.sortMode.collectAsStateWithLifecycle()
    val selectedDay by discoverViewModel.selectedDay.collectAsStateWithLifecycle()
    val selectedGenre by discoverViewModel.selectedGenre.collectAsStateWithLifecycle()
    val selectedVibe by discoverViewModel.selectedVibe.collectAsStateWithLifecycle()
    val searchQuery by discoverViewModel.searchQuery.collectAsStateWithLifecycle()
    val isLoading by discoverViewModel.isLoading.collectAsStateWithLifecycle()
    val favoriteArtistIds by artistViewModel.favoriteArtistIds.collectAsStateWithLifecycle()
    val countryFilter by discoverViewModel.countryFilter.collectAsStateWithLifecycle()
    val allArtists by discoverViewModel.allArtists.collectAsStateWithLifecycle()
    val selectedYear by discoverViewModel.selectedYear.collectAsStateWithLifecycle()

    var showCountrySheet by remember { mutableStateOf(false) }
    var serendipityArtist by remember { mutableStateOf<com.example.szigerinsider2026.data.model.Artist?>(null) }
    val favoritedIds = remember(favoriteArtistIds) { favoriteArtistIds }

    val gridState = rememberLazyGridState()
    val isHeaderVisible by remember {
        derivedStateOf { gridState.firstVisibleItemIndex == 0 }
    }

    Box(modifier = Modifier.fillMaxSize()) {
    Column(
        modifier = Modifier.fillMaxSize().background(OLEDBlack)
    ) {
        // Collapsing hero header
        AnimatedVisibility(
            visible = isHeaderVisible,
            enter = fadeIn(tween(200)) + expandVertically(tween(200)),
            exit = fadeOut(tween(150)) + shrinkVertically(tween(150))
        ) {
            Column(
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .padding(top = 24.dp, bottom = 8.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(PrimaryMagenta.copy(alpha = 0.1f))
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Filled.Star, contentDescription = null, tint = PrimaryMagenta, modifier = Modifier.size(28.dp))
                }
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("MUSIC ", style = BrutalistTypography.headlineLarge, color = Color.White)
                    Text("FINDER", style = BrutalistTypography.headlineLarge, color = PrimaryMagenta)
                    IconButton(
                        onClick = {
                            haptic.lightTap()
                            navController?.navigate("vibe_quiz")
                        }
                    ) {
                        Icon(
                            Icons.Filled.AutoAwesome,
                            contentDescription = "Vibe Quiz",
                            tint = PrimaryMagenta,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    IconButton(onClick = { haptic.lightTap(); showCountrySheet = true }) {
                        Icon(
                            Icons.Default.Public,
                            contentDescription = "Country Explorer",
                            tint = CyanPulse
                        )
                    }
                }
                Text(
                    text = "Curate your personal journey.",
                    style = BrutalistTypography.bodyLarge,
                    color = Color.White.copy(alpha = 0.5f),
                    modifier = Modifier.padding(top = 6.dp, bottom = 4.dp)
                )
            }
        }

        // Search bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Color.White.copy(alpha = 0.06f))
                .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(20.dp))
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Search, contentDescription = null, tint = TextMuted, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(10.dp))
                BasicTextField(
                    value = searchQuery,
                    onValueChange = { discoverViewModel.setSearchQuery(it) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    textStyle = TextStyle(color = Color.White, fontSize = 14.sp),
                    decorationBox = { inner ->
                        if (searchQuery.isEmpty()) {
                            Text("Search artists…", color = TextMuted, fontSize = 14.sp)
                        }
                        inner()
                    },
                    modifier = Modifier.weight(1f)
                )
                if (searchQuery.isNotEmpty()) {
                    Icon(
                        Icons.Filled.Close,
                        contentDescription = "Clear",
                        tint = TextMuted,
                        modifier = Modifier
                            .size(18.dp)
                            .clickable { discoverViewModel.setSearchQuery("") }
                    )
                }
            }
        }

        // Sort mode row
        LazyRow(
            modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                FilterChip(
                    text = "HEADLINERS FIRST",
                    isSelected = sortMode == "headliners",
                    selectedColor = AcidYellow,
                    onClick = { haptic.lightTap(); discoverViewModel.setSortMode("headliners") }
                )
            }
            item {
                FilterChip(
                    text = "A – Z",
                    isSelected = sortMode == "az",
                    selectedColor = AcidYellow,
                    onClick = { haptic.lightTap(); discoverViewModel.setSortMode("az") }
                )
            }
        }

        // Year toggle row
        LazyRow(
            modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                FilterChip(
                    text = "2025",
                    isSelected = selectedYear == "2025",
                    selectedColor = CyanPulse,
                    onClick = { haptic.lightTap(); discoverViewModel.setYear("2025") }
                )
            }
            item {
                FilterChip(
                    text = "2026",
                    isSelected = selectedYear == "2026",
                    selectedColor = CyanPulse,
                    onClick = { haptic.lightTap(); discoverViewModel.setYear("2026") }
                )
            }
        }

        // Day filter row
        if (availableDays.isNotEmpty()) {
            LazyRow(
                modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        text = "ALL DAYS",
                        isSelected = selectedDay == null,
                        selectedColor = CyanPulse,
                        onClick = { haptic.lightTap(); discoverViewModel.selectDay(null) }
                    )
                }
                items(availableDays) { day ->
                    FilterChip(
                        text = day.take(3).uppercase(),
                        isSelected = selectedDay == day,
                        selectedColor = CyanPulse,
                        onClick = { haptic.lightTap(); discoverViewModel.selectDay(day) }
                    )
                }
            }
        }

        // Genre filter row
        if (availableGenres.isNotEmpty()) {
            LazyRow(
                modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        text = "ALL GENRES",
                        isSelected = selectedGenre == null,
                        selectedColor = ToxicGreen,
                        onClick = { haptic.lightTap(); discoverViewModel.selectGenre(null) }
                    )
                }
                items(availableGenres) { genre ->
                    FilterChip(
                        text = genre,
                        isSelected = selectedGenre == genre,
                        selectedColor = ToxicGreen,
                        onClick = { haptic.lightTap(); discoverViewModel.selectGenre(if (selectedGenre == genre) null else genre) }
                    )
                }
            }
        }

        // Vibe filter row
        if (availableVibes.isNotEmpty()) {
            LazyRow(
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        text = "ALL VIBES",
                        isSelected = selectedVibe == null,
                        selectedColor = PrimaryMagenta,
                        onClick = { haptic.lightTap(); discoverViewModel.selectVibe(null) }
                    )
                }
                items(availableVibes) { vibe ->
                    FilterChip(
                        text = vibe,
                        isSelected = selectedVibe == vibe,
                        selectedColor = PrimaryMagenta,
                        onClick = { haptic.lightTap(); discoverViewModel.selectVibe(if (selectedVibe == vibe) null else vibe) }
                    )
                }
            }
        }

        // Active country filter chip
        if (countryFilter != null) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(CyanPulse.copy(alpha = 0.15f))
                        .border(1.dp, CyanPulse.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("🌍", fontSize = 14.sp)
                        Text(
                            text = countryFilter!!.uppercase(),
                            color = CyanPulse,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "×",
                            color = CyanPulse,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            modifier = Modifier.clickable { haptic.lightTap(); discoverViewModel.setCountryFilter(null) }
                        )
                    }
                }
            }
        }

        // Result count
        if (!isLoading) {
            Text(
                text = "${filteredArtists.size} ARTISTS",
                style = BrutalistTypography.labelSmall,
                color = TextMuted,
                fontSize = 10.sp,
                letterSpacing = 2.sp,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
            )
        }

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize().padding(bottom = 100.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = PrimaryMagenta)
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                state = gridState,
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 32.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredArtists, key = { it.id }) { artist ->
                    ArtistCard(
                        artist = artist,
                        isFavorite = favoriteArtistIds.contains(artist.id),
                        onToggleFavorite = { artistViewModel.toggleFavorite(it) },
                        onClick = { onArtistClick(it) }
                    )
                }
            }
        }
    }

    // Serendipity FAB
    ExtendedFloatingActionButton(
        onClick = {
            haptic.mediumTap()
            val all = discoverViewModel.allArtists.value
            serendipityArtist = discoverViewModel.getRandomUnfavoritedArtist(all, favoritedIds)
        },
        modifier = Modifier
            .align(Alignment.BottomEnd)
            .padding(bottom = 100.dp, end = 20.dp),
        containerColor = CardBackground,
        contentColor = PrimaryMagenta,
        icon = { Icon(Icons.Default.Shuffle, contentDescription = null) },
        text = { Text("SURPRISE ME", fontWeight = FontWeight.Black, fontSize = 11.sp) }
    )

    } // end Box

    if (showCountrySheet) {
        CountryExplorerSheet(
            artists = allArtists,
            activeCountryFilter = countryFilter,
            onCountrySelected = { code -> discoverViewModel.setCountryFilter(code) },
            onDismiss = { showCountrySheet = false }
        )
    }

    serendipityArtist?.let { artist ->
        SerendipityScreen(
            artist = artist,
            onExplore = {
                serendipityArtist = null
                navController?.navigate("artist/${artist.id}")
            },
            onSpinAgain = {
                val all = discoverViewModel.allArtists.value
                serendipityArtist = discoverViewModel.getRandomUnfavoritedArtist(all, favoritedIds)
            },
            onDismiss = { serendipityArtist = null }
        )
    }
}

@Composable
fun FilterChip(
    text: String,
    isSelected: Boolean,
    selectedColor: Color = PrimaryMagenta,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(if (isSelected) selectedColor else Color.White.copy(alpha = 0.05f))
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 7.dp)
    ) {
        Text(
            text = text,
            style = BrutalistTypography.labelSmall,
            color = if (isSelected) Color.Black else Color.White.copy(alpha = 0.6f),
            fontWeight = if (isSelected) FontWeight.Black else FontWeight.Normal,
            fontSize = 10.sp
        )
    }
}
