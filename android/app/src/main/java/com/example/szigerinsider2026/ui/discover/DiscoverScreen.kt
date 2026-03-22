package com.example.szigerinsider2026.ui.discover

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
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
import androidx.compose.material.icons.outlined.MusicNote
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.data.repository.SpotifyRepository
import com.example.szigerinsider2026.ui.components.ArtistCard
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MediumTopAppBar
import android.content.Context
import android.content.Intent
import android.net.Uri

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiscoverScreen(
    onArtistClick: (String) -> Unit = {},
    navController: NavController? = null,
    onScrollStateChanged: (Boolean) -> Unit = {},
    viewModel: DiscoverViewModel? = null
) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val db = remember { AppDatabase.getDatabase(context) }

    val discoverViewModel: DiscoverViewModel = viewModel ?: viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return DiscoverViewModel(LineupRepository(context), context) as T
            }
        }
    )

    // Listen for filters from savedStateHandle (modern replacement for the static hack)
    LaunchedEffect(navController) {
        navController?.currentBackStackEntry?.savedStateHandle?.let { handle ->
            handle.get<String>("filter_genre")?.let { genre ->
                discoverViewModel.selectGenre(genre)
                handle.remove<String>("filter_genre")
            }
            handle.get<String>("filter_vibe")?.let { vibe ->
                discoverViewModel.selectVibe(vibe)
                handle.remove<String>("filter_vibe")
            }
        }
    }
    val artistViewModel: ArtistViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ArtistViewModel(db.userDao()) as T
            }
        }
    )
    val spotifyViewModel: SpotifyViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return SpotifyViewModel(SpotifyRepository(context)) as T
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
    val spotifyAuthState by spotifyViewModel.authState.collectAsStateWithLifecycle()
    val spotifyMatchedIds by spotifyViewModel.matchedArtistIds.collectAsStateWithLifecycle()
    val showSpotifyOnly by discoverViewModel.showSpotifyOnly.collectAsStateWithLifecycle()

    var showCountrySheet by remember { mutableStateOf(false) }
    var serendipityArtist by remember { mutableStateOf<com.example.szigerinsider2026.data.model.Artist?>(null) }
    var spotifyCodeVerifier by remember { mutableStateOf<String?>(null) }

    val favoritedIds = remember(favoriteArtistIds) { favoriteArtistIds }
    val gridState = rememberLazyGridState()
    
    // Material 3 Scroll Behavior for smooth collapsing title
    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior(rememberTopAppBarState())

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(scrollBehavior.nestedScrollConnection),
        containerColor = OLEDBlack,
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("MUSIC ", style = BrutalistTypography.headlineLarge, color = Color.White, fontSize = 20.sp, letterSpacing = 1.sp)
                        Text("FINDER", style = BrutalistTypography.headlineLarge, color = PrimaryMagenta, fontSize = 20.sp, letterSpacing = 1.sp)
                    }
                },
                actions = {
                    IconButton(onClick = { haptic.lightTap(); navController?.navigate("vibe_quiz") }) {
                        Icon(Icons.Filled.AutoAwesome, contentDescription = "Quiz", tint = PrimaryMagenta, modifier = Modifier.size(20.dp))
                    }
                    IconButton(onClick = { haptic.lightTap(); showCountrySheet = true }) {
                        Icon(Icons.Default.Public, contentDescription = "Country", tint = CyanPulse, modifier = Modifier.size(20.dp))
                    }
                },
                scrollBehavior = scrollBehavior,
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = OLEDBlack,
                    scrolledContainerColor = OLEDBlack,
                    titleContentColor = Color.White
                ),
                windowInsets = WindowInsets(0.dp) // Tighten to top
            )
        }
    ) { paddingValues ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            state = gridState,
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 0.dp, bottom = 32.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header: Ultra-compact Search + Consolidated Filters
            item(span = { GridItemSpan(2) }) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Slim Search bar
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.05f))
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Filled.Search, contentDescription = null, tint = TextMuted, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(10.dp))
                            BasicTextField(
                                value = searchQuery,
                                onValueChange = { discoverViewModel.setSearchQuery(it) },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                                textStyle = TextStyle(color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium),
                                decorationBox = { inner ->
                                    if (searchQuery.isEmpty()) {
                                        Text("SEARCH ARTISTS…", color = TextMuted, fontSize = 11.sp, letterSpacing = 1.sp)
                                    }
                                    inner()
                                },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Consolidated Scrollable Filters - Row 1
                    LazyRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        item {
                            FilterChip(
                                text = "HEADLINERS",
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
                        item {
                            FilterChip(
                                text = selectedDay ?: "ALL DAYS",
                                isSelected = selectedDay != null,
                                selectedColor = CyanPulse,
                                onClick = { haptic.lightTap(); discoverViewModel.selectDay(null) }
                            )
                        }
                        items(availableDays.take(3)) { day ->
                            FilterChip(
                                text = day.take(3).uppercase(),
                                isSelected = selectedDay == day,
                                selectedColor = CyanPulse,
                                onClick = { haptic.lightTap(); discoverViewModel.selectDay(if (selectedDay == day) null else day) }
                            )
                        }
                    }

                    // Consolidated Scrollable Filters - Row 2 (Genre & Year)
                    LazyRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        item {
                                FilterChip(
                                    text = "2026",
                                    isSelected = selectedYear == "2026",
                                    selectedColor = CyanPulse,
                                    onClick = { haptic.lightTap(); discoverViewModel.setYear("2026") }
                                )
                        }
                        item {
                            FilterChip(
                                text = "2025",
                                isSelected = selectedYear == "2025",
                                selectedColor = Color.White.copy(alpha = 0.2f),
                                onClick = { haptic.lightTap(); discoverViewModel.setYear("2025") }
                            )
                        }
                        item {
                            FilterChip(
                                text = selectedGenre ?: "ALL GENRES",
                                isSelected = selectedGenre != null,
                                selectedColor = ToxicGreen,
                                onClick = { haptic.lightTap(); discoverViewModel.selectGenre(null) }
                            )
                        }
                        items(availableGenres) { genre ->
                            FilterChip(
                                text = genre.uppercase(),
                                isSelected = selectedGenre == genre,
                                selectedColor = ToxicGreen,
                                onClick = { haptic.lightTap(); discoverViewModel.selectGenre(if (selectedGenre == genre) null else genre) }
                            )
                        }
                    }

                    // Spotify Match & Country Summary (Single Line)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = "${filteredArtists.size} ACTS",
                                style = BrutalistTypography.labelSmall,
                                color = TextMuted,
                                fontSize = 8.sp,
                                letterSpacing = 1.sp
                            )
                            if (countryFilter != null) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(CyanPulse.copy(alpha = 0.1f))
                                        .clickable { haptic.lightTap(); discoverViewModel.setCountryFilter(null) }
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text("${countryFilter?.uppercase()} ×", color = CyanPulse, fontSize = 8.sp, fontWeight = FontWeight.Black)
                                }
                            }
                            if (spotifyAuthState is SpotifyAuthState.Connected) {
                                Text(
                                    text = "· ${spotifyMatchedIds.size} MATCHES",
                                    color = AcidYellow,
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        
                        Button(
                            onClick = {
                                haptic.mediumTap()
                                serendipityArtist = discoverViewModel.getRandomUnfavoritedArtist(allArtists, favoritedIds)
                            },
                            modifier = Modifier.height(26.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryMagenta),
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp)
                        ) {
                            Text("SHUFFLE", fontSize = 8.sp, fontWeight = FontWeight.Black)
                        }
                    }
                }
            }

            if (isLoading) {
                item(span = { GridItemSpan(2) }) {
                    Box(modifier = Modifier.fillMaxWidth().padding(vertical = 100.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryMagenta)
                    }
                }
            } else {
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
