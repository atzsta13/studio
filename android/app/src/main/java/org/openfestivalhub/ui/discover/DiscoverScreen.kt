package org.openfestivalhub.ui.discover

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.BubbleChart
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import org.openfestivalhub.data.config.FestivalConfig
import org.openfestivalhub.data.local.AppDatabase
import org.openfestivalhub.data.repository.LineupRepository
import org.openfestivalhub.ui.components.ArtistCard
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.utils.rememberHapticManager
import org.openfestivalhub.ui.utils.t
import java.util.Locale

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
    
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            viewModel?.startLocationScout()
        }
    }
    val db = remember { AppDatabase.getDatabase(context) }

    val discoverViewModel: DiscoverViewModel = viewModel ?: viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return DiscoverViewModel(LineupRepository(context), context) as T
            }
        }
    )

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
    
    val filteredArtists by discoverViewModel.filteredArtists.collectAsStateWithLifecycle()
    val availableDays by discoverViewModel.availableDays.collectAsStateWithLifecycle()
    val availableGenres by discoverViewModel.availableGenres.collectAsStateWithLifecycle()
    val availableVibes by discoverViewModel.availableVibes.collectAsStateWithLifecycle()
    val sortMode by discoverViewModel.sortMode.collectAsStateWithLifecycle()
    val selectedDay by discoverViewModel.selectedDay.collectAsStateWithLifecycle()
    val selectedGenre by discoverViewModel.selectedGenre.collectAsStateWithLifecycle()
    val selectedVibe by discoverViewModel.selectedVibe.collectAsStateWithLifecycle()
    val selectedStage by discoverViewModel.selectedStage.collectAsStateWithLifecycle()
    val searchQuery by discoverViewModel.searchQuery.collectAsStateWithLifecycle()
    
    val isLocalAiDownloaded by discoverViewModel.isLocalAiDownloaded.collectAsStateWithLifecycle()
    val localAiDownloadProgress by discoverViewModel.downloadProgress.collectAsStateWithLifecycle()
    val localAiResponse by discoverViewModel.localAiResponse.collectAsStateWithLifecycle()
    val isLocalAiLoading by discoverViewModel.isLocalAiLoading.collectAsStateWithLifecycle()
    val isListening by discoverViewModel.isListening.collectAsStateWithLifecycle()
    
    val config = FestivalConfig.current
    val isLoading by discoverViewModel.isLoading.collectAsStateWithLifecycle()
    val favoriteArtistIds by artistViewModel.favoriteArtistIds.collectAsStateWithLifecycle()
    val countryFilter by discoverViewModel.countryFilter.collectAsStateWithLifecycle()
    val allArtists by discoverViewModel.allArtists.collectAsStateWithLifecycle()
    val selectedYear by discoverViewModel.selectedYear.collectAsStateWithLifecycle()
    var showCountrySheet by remember { mutableStateOf(false) }
    var serendipityArtist by remember { mutableStateOf<org.openfestivalhub.data.model.Artist?>(null) }
    
    val favoritedIds = remember(favoriteArtistIds) { favoriteArtistIds }
    val gridState = rememberLazyGridState()
    
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
                        Text("FINDER", style = BrutalistTypography.headlineLarge, color = MaterialTheme.colorScheme.primary, fontSize = 20.sp, letterSpacing = 1.sp)
                    }
                },
                actions = {
                    IconButton(onClick = { haptic.lightTap(); navController?.navigate("genre_breakdown") }) {
                        Icon(Icons.Filled.BarChart, contentDescription = "Genre DNA", tint = AcidYellow, modifier = Modifier.size(20.dp))
                    }
                    IconButton(onClick = { haptic.lightTap(); navController?.navigate("vibe_radar") }) {
                        Icon(Icons.Filled.BubbleChart, contentDescription = "Vibe Radar", tint = PrimaryMagenta, modifier = Modifier.size(20.dp))
                    }
                    IconButton(onClick = { haptic.lightTap(); navController?.navigate("vibe_quiz") }) {
                        Icon(Icons.Filled.AutoAwesome, contentDescription = "Quiz", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
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
                windowInsets = WindowInsets(0.dp)
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
            item(span = { GridItemSpan(2) }) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "RADAR FOCUS",
                        color = TextMuted.copy(alpha = 0.6f),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp,
                        modifier = Modifier.padding(start = 4.dp)
                    )
                    
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(horizontal = 4.dp)
                    ) {
                        val focusOptions = mutableListOf<Pair<String?, String>>()
                        focusOptions.add(null to "GLOBAL RADAR")
                        FestivalConfig.current.content?.radarFocuses?.forEach {
                            focusOptions.add(it.id to it.label)
                        }
                        
                        items(focusOptions) { (id, label) ->
                            val isSelected = selectedStage == id
                            FilterChip(
                                selected = isSelected,
                                onClick = { haptic.lightTap(); discoverViewModel.selectStage(id) },
                                label = { Text(label, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp) },
                                shape = RoundedCornerShape(12.dp),
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color.White,
                                    selectedLabelColor = OLEDBlack,
                                    containerColor = Color.White.copy(alpha = 0.05f),
                                    labelColor = TextMuted
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = isSelected,
                                    borderColor = Color.White.copy(alpha = 0.1f),
                                    selectedBorderColor = Color.White
                                )
                            )
                        }
                    }

                    LocalAiScoutCard(
                        state = LocalAiScoutUiState(
                            isDownloaded = isLocalAiDownloaded,
                            canDownload = config.productionUrl != null,
                            progress = localAiDownloadProgress,
                            isLoading = isLocalAiLoading,
                            isListening = isListening,
                            response = localAiResponse
                        ),
                        actions = LocalAiScoutActions(
                            onDownload = {
                                val base = config.productionUrl
                                if (base != null) {
                                    discoverViewModel.downloadModel("$base/ai/gemma4-2b-android.bin")
                                }
                            },
                            onScanLocal = { discoverViewModel.scanForLocalModel() },
                            onSearch = { discoverViewModel.runLocalScout(it) },
                            onListen = { 
                                 if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                                     discoverViewModel.startLocationScout() 
                                 } else {
                                     permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                                 }
                             },
                            onClear = { discoverViewModel.clearLocalScout() }
                        )
                    )
                }
            }

            item(span = { GridItemSpan(2) }) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(MutedBackground.copy(alpha = 0.5f))
                        .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(20.dp))
                        .padding(16.dp)
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
                                    Text("SEARCH ARTISTS...", color = TextMuted, fontSize = 11.sp, letterSpacing = 1.sp)
                                }
                                inner()
                            },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            item(span = { GridItemSpan(2) }) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    LazyRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        item {
                            FilterChip(
                                selected = sortMode == "headliners",
                                onClick = { haptic.lightTap(); discoverViewModel.setSortMode("headliners") },
                                label = { Text("HEADLINERS", fontSize = 10.sp, fontWeight = FontWeight.Black) }
                            )
                        }
                        item {
                            FilterChip(
                                selected = sortMode == "az",
                                onClick = { haptic.lightTap(); discoverViewModel.setSortMode("az") },
                                label = { Text("A – Z", fontSize = 10.sp, fontWeight = FontWeight.Black) }
                            )
                        }
                        item {
                            FilterChip(
                                selected = selectedYear == "2026",
                                onClick = { haptic.lightTap(); discoverViewModel.setYear("2026") },
                                label = { Text("2026", fontSize = 10.sp, fontWeight = FontWeight.Black) }
                            )
                        }
                        item {
                            FilterChip(
                                selected = selectedYear == "2025",
                                onClick = { haptic.lightTap(); discoverViewModel.setYear("2025") },
                                label = { Text("2025", fontSize = 10.sp, fontWeight = FontWeight.Black) }
                            )
                        }
                    }

                    LazyRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        item {
                            FilterChip(
                                selected = selectedDay == null,
                                onClick = { haptic.lightTap(); discoverViewModel.selectDay(null) },
                                label = { Text("ALL DAYS", fontSize = 10.sp, fontWeight = FontWeight.Black) }
                            )
                        }
                        items(availableDays) { day ->
                            FilterChip(
                                selected = selectedDay == day,
                                onClick = { haptic.lightTap(); discoverViewModel.selectDay(if (selectedDay == day) null else day) },
                                label = { Text(day.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Black) }
                            )
                        }
                    }

                    LazyRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        item {
                            FilterChip(
                                selected = selectedGenre == null,
                                onClick = { haptic.lightTap(); discoverViewModel.selectGenre(null) },
                                label = { Text("ALL GENRES", fontSize = 10.sp, fontWeight = FontWeight.Black) }
                            )
                        }
                        items(availableGenres) { genre ->
                            FilterChip(
                                selected = selectedGenre == genre,
                                onClick = { haptic.lightTap(); discoverViewModel.selectGenre(if (selectedGenre == genre) null else genre) },
                                label = { Text(genre.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Black) }
                            )
                        }
                    }

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
                        }
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = {
                                    haptic.successBurst()
                                    navController?.navigate("speed_discovery")
                                },
                                modifier = Modifier.height(26.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ToxicGreen),
                                shape = RoundedCornerShape(6.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp)
                            ) {
                                Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color.Black)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("SPEED", fontSize = 8.sp, fontWeight = FontWeight.Black, color = Color.Black)
                            }

                            Button(
                                onClick = {
                                    haptic.mediumTap()
                                    serendipityArtist = discoverViewModel.getRandomUnfavoritedArtist(allArtists, favoritedIds)
                                },
                                modifier = Modifier.height(26.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                shape = RoundedCornerShape(6.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp)
                            ) {
                                Text("SHUFFLE", fontSize = 8.sp, fontWeight = FontWeight.Black)
                            }
                        }
                    }
                }
            }

            if (isLoading) {
                item(span = { GridItemSpan(2) }) {
                    Box(modifier = Modifier.fillMaxWidth().padding(vertical = 100.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
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

data class LocalAiScoutUiState(
    val isDownloaded: Boolean,
    val canDownload: Boolean,
    val progress: Float,
    val isLoading: Boolean,
    val isListening: Boolean,
    val response: String?
)

data class LocalAiScoutActions(
    val onDownload: () -> Unit,
    val onScanLocal: () -> Unit,
    val onSearch: (String) -> Unit,
    val onListen: () -> Unit,
    val onClear: () -> Unit
)

@Composable
fun LocalAiScoutCard(
    state: LocalAiScoutUiState,
    actions: LocalAiScoutActions
) {
    var prompt by remember { mutableStateOf("") }
    
    Card(
        colors = CardDefaults.cardColors(containerColor = if (state.isDownloaded) Color(0xFF1A1A1D) else CardBackground),
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .border(
                width = 1.dp,
                brush = if (state.isDownloaded) Brush.linearGradient(listOf(CyanPulse, ToxicGreen)) else SolidColor(Color.White.copy(alpha = 0.05f)),
                shape = RoundedCornerShape(24.dp)
            )
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = if (state.isDownloaded) ToxicGreen else TextMuted,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = if (state.isDownloaded) t("scout_title") else "${t("scout_title")} (OFFLINE)",
                    color = TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp,
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            if (!state.isDownloaded) {
                Text(
                    text = "Download the Gemma 4 intelligence model to find artists without any signal. (~1.2GB)",
                    color = TextMuted,
                    fontSize = 12.sp,
                    lineHeight = 18.sp
                )
                if (!state.canDownload) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "AI model unavailable for this festival build.",
                        color = TextMuted.copy(alpha = 0.5f),
                        fontSize = 11.sp,
                        fontStyle = FontStyle.Italic
                    )
                    return@Column
                }
                Spacer(modifier = Modifier.height(16.dp))

                if (state.progress != 0f) {
                    Column {
                        if (state.progress > 0f) {
                            LinearProgressIndicator(
                                progress = { state.progress },
                                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                color = ToxicGreen,
                                trackColor = OLEDBlack
                            )
                            Text(
                                text = "DOWNLOADING: ${(state.progress * 100).toInt()}%",
                                color = ToxicGreen,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        } else {
                            // Indeterminate state
                            LinearProgressIndicator(
                                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                color = ToxicGreen,
                                trackColor = OLEDBlack
                            )
                            Text(
                                text = "DOWNLOADING...",
                                color = ToxicGreen,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                } else {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                actions.onDownload()
                            },
                            modifier = Modifier.weight(1.3f).height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black)
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp), tint = Color.Black)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("PREPARE AI", fontWeight = FontWeight.Black, fontSize = 11.sp, color = Color.Black)
                        }
                        
                        OutlinedButton(
                            onClick = actions.onScanLocal,
                            modifier = Modifier.weight(1f).height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
                        ) {
                            Text("SCAN LOCAL", fontWeight = FontWeight.Black, fontSize = 11.sp)
                        }
                    }
                }
            } else {
                if (state.response == null) {
                    if (state.isListening) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(CyanPulse.copy(alpha = 0.1f))
                                .border(1.dp, CyanPulse, RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                CircularProgressIndicator(color = CyanPulse, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                                Spacer(modifier = Modifier.width(12.dp))
                                Text("RESOLVING GPS POSITION...", color = CyanPulse, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                            }
                        }
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            OutlinedTextField(
                                value = prompt,
                                onValueChange = { prompt = it },
                                placeholder = { Text(t("scout_placeholder"), color = TextMuted, fontSize = 13.sp) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(16.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = CyanPulse,
                                    unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                                    focusedContainerColor = OLEDBlack.copy(alpha = 0.5f),
                                    unfocusedContainerColor = OLEDBlack.copy(alpha = 0.3f)
                                ),
                                textStyle = BrutalistTypography.bodyMedium.copy(fontSize = 14.sp, color = Color.White),
                                trailingIcon = {
                                    if (state.isLoading) {
                                        CircularProgressIndicator(color = CyanPulse, modifier = Modifier.size(20.dp))
                                    } else {
                                        IconButton(onClick = { actions.onSearch(prompt) }, enabled = prompt.isNotBlank()) {
                                            Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Search", tint = if (prompt.isNotBlank()) ToxicGreen else TextMuted)
                                        }
                                    }
                                }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            IconButton(
                                onClick = actions.onListen,
                                modifier = Modifier
                                    .size(56.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(ToxicGreen.copy(alpha = 0.1f))
                                    .border(1.dp, ToxicGreen.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                            ) {
                                Icon(Icons.Default.MyLocation, contentDescription = "GPS Scout", tint = ToxicGreen, modifier = Modifier.size(24.dp))
                            }
                        }
                    }
                } else {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(OLEDBlack.copy(alpha = 0.5f))
                            .padding(16.dp)
                    ) {
                        Text(
                            text = state.response,
                            color = Color.White.copy(alpha = 0.9f),
                            fontSize = 13.sp,
                            lineHeight = 20.sp,
                            fontStyle = FontStyle.Italic
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = actions.onClear,
                            modifier = Modifier.height(36.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.1f))
                        ) {
                            Text("CLEAR", fontSize = 10.sp, fontWeight = FontWeight.Black)
                        }
                    }
                }
            }
        }
    }
}
