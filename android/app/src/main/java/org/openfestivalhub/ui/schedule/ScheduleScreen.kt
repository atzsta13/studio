package org.openfestivalhub.ui.schedule

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.InfiniteRepeatableSpec
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import org.openfestivalhub.data.local.AppDatabase
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.data.repository.LineupRepository
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.components.*
import coil3.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale
import org.openfestivalhub.ui.utils.rememberHapticManager
import org.openfestivalhub.ui.utils.parseTime
import org.openfestivalhub.ui.utils.formatTime
import java.time.LocalDate
import java.time.LocalTime
import org.openfestivalhub.data.config.FestivalConfig

// ─── Constants (derived from FestivalConfig.current) ───────────────────────────

private val DAY_LABELS get() = FestivalConfig.current.dates.dayLabels

internal val DAY_TO_DATE: Map<String, LocalDate> get() {
    val config = FestivalConfig.current
    val start = LocalDate.parse(config.dates.startDate)
    return config.dates.days.mapIndexed { i, day ->
        day to start.plusDays(i.toLong())
    }.toMap()
}

private val ClashBannerBg     = Color(0xFF2A0A00)
private val ClashBannerBorder = Color(0xFFFF4500)
private val ClashBadgeColor   = Color(0xFFFF6B00)

// ─── Live-state ticker ──────────────────────────────────────────────────────────
@Composable
private fun rememberMinuteTick(): Long {
    var tick by remember { mutableStateOf(0L) }
    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(60_000L)
            tick++
        }
    }
    return tick
}

// ─── Now-playing helper ───────────────────────────────────────────────────────

internal fun isNowPlaying(artist: Artist): Boolean {
    val config = FestivalConfig.current
    val today = LocalDate.now()
    val startDate = LocalDate.parse(config.dates.startDate)
    val endDate   = LocalDate.parse(config.dates.endDate)
    
    if (today < startDate || today > endDate) return false
    
    val dayIndex = config.dates.days.indexOf(artist.day)
    if (dayIndex == -1) return false
    val targetDate = startDate.plusDays(dayIndex.toLong())
    if (targetDate != today) return false
    
    val start = parseTime(artist.startTime) ?: return false
    val end   = parseTime(artist.endTime)   ?: return false
    val now   = LocalTime.now()
    return if (end > start) now >= start && now < end
    else now >= start || now < end
}

@androidx.compose.material3.ExperimentalMaterial3Api
@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun ScheduleScreen(
    onArtistClick: (String) -> Unit = {},
    onBack: () -> Unit = {}
) {
    val context = LocalContext.current
    val haptic  = rememberHapticManager()
    val minuteTick = rememberMinuteTick()

    val viewModel: ScheduleViewModel = viewModel(
        factory = ScheduleViewModel.Factory(
            LineupRepository(context),
            AppDatabase.getDatabase(context).userDao()
        )
    )

    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val dayArtists by viewModel.dayArtists.collectAsStateWithLifecycle()
    val favoriteArtists by viewModel.favoriteArtists.collectAsStateWithLifecycle()
    val clashes by viewModel.clashes.collectAsStateWithLifecycle()

    var artistForDetail by remember { mutableStateOf<Artist?>(null) }
    var showShareQR by remember { mutableStateOf(false) }
    var showScanner by remember { mutableStateOf(false) }

    val availableDays = remember(uiState.allArtists) {
        val days = uiState.allArtists.mapNotNull { it.day }.distinct()
            .sortedBy { FestivalConfig.current.dates.days.indexOf(it).let { i -> if (i == -1) 99 else i } }
        listOf("WEEK") + days
    }

    val byDayFavorites = remember(favoriteArtists) {
        favoriteArtists.groupBy { it.day ?: "Unknown" }.entries
            .sortedBy { FestivalConfig.current.dates.days.indexOf(it.key).let { i -> if (i == -1) 99 else i } }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
    ) {
        BrutalistHeader(
            title = "TIMETABLE",
            subtitle = FestivalConfig.current.location.weatherDisplayName,
            modifier = Modifier.padding(top = 20.dp, bottom = 12.dp)
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp)
                .background(CardBackground.copy(alpha = 0.4f))
                .padding(vertical = 12.dp)
        ) {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(availableDays) { day ->
                    val isSelected = (day == uiState.selectedDay && uiState.activeTab == ScheduleTab.GRID)
                    val isWeekTab  = day == "WEEK"
                    
                    val bgColor by animateColorAsState(
                        targetValue = if (isSelected) {
                            if (isWeekTab) MaterialTheme.colorScheme.secondary else Color.White
                        } else {
                            Color.White.copy(alpha = 0.04f)
                        },
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
                            .clip(RoundedCornerShape(12.dp))
                            .background(bgColor)
                            .border(
                                1.dp, 
                                if (isSelected) Color.Transparent else Color.White.copy(alpha = 0.05f), 
                                RoundedCornerShape(12.dp)
                            )
                            .clickable {
                                haptic.lightTap()
                                viewModel.selectDay(day)
                                viewModel.setTab(ScheduleTab.GRID)
                            }
                            .padding(horizontal = 16.dp, vertical = 10.dp)
                    ) {
                        Text(
                            text = if (isWeekTab) "FULL WEEK" else (FestivalConfig.current.dates.dayLabels[day] ?: day.take(3).uppercase()),
                            fontWeight = FontWeight.Black,
                            color = textColor,
                            fontSize = 11.sp,
                            letterSpacing = 1.sp
                        )
                    }
                }
            }
        }

        ScheduleTabToggle(
            activeTab = uiState.activeTab,
            onTabSelected = { haptic.lightTap(); viewModel.setTab(it) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .padding(bottom = 10.dp)
        )

        if (FestivalConfig.FEATURES.dayparkNightpark && uiState.activeTab != ScheduleTab.MY_LINEUP) {
            TimeSlotToggle(
                selectedSlot = uiState.selectedTimeSlot,
                onSlotSelected = { haptic.lightTap(); viewModel.setTimeSlot(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 12.dp)
            )
        }

        if (uiState.activeTab != ScheduleTab.MY_LINEUP) {
            ScheduleSearchField(
                query = uiState.searchQuery,
                onQueryChange = { viewModel.setSearchQuery(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 12.dp)
            )
        }

        when (uiState.activeTab) {
            ScheduleTab.GRID -> {
                TimetableGrid(
                    dayArtists = dayArtists,
                    selectedDay = uiState.selectedDay,
                    searchQuery = uiState.searchQuery,
                    minuteTick = minuteTick,
                    favoriteIds = uiState.favoriteIds,
                    squadIds = uiState.squadFavoriteIds,
                    onArtistClick = { id -> 
                        artistForDetail = uiState.allArtists.find { it.id == id }
                    },
                    onToggleFavorite = { id ->
                        viewModel.toggleFavorite(id)
                    }
                )
            }
            ScheduleTab.BY_TIME -> {
                if (dayArtists.isEmpty() && uiState.searchQuery.isNotBlank()) {
                    Box(modifier = Modifier.fillMaxSize().padding(horizontal = 32.dp), contentAlignment = Alignment.Center) {
                        BrutalistHeader(title = "NO ARTISTS MATCH", subtitle = "No acts named \"${uiState.searchQuery.trim()}\" on this day.")
                    }
                    return@Column
                }
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(dayArtists) { artist ->
                        ScheduleRow(
                            artist = artist,
                            isFavorite = uiState.favoriteIds.contains(artist.id),
                            inSquad = uiState.squadFavoriteIds.contains(artist.id),
                            onToggleFavorite = {
                                viewModel.toggleFavorite(artist.id)
                                haptic.lightTap()
                            },
                            onClick = { artistForDetail = artist },
                            hapticTap = { haptic.lightTap() },
                            clashPair = clashes.firstOrNull { it.a.id == artist.id || it.b.id == artist.id },
                            showDayBadge = false,
                            minuteTick = minuteTick
                        )
                    }
                }
            }
            ScheduleTab.MY_LINEUP -> {
                if (favoriteArtists.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "★",
                                fontSize = 48.sp,
                                color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.4f)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            BrutalistHeader(
                                title = "YOUR LINEUP IS EMPTY",
                                subtitle = "Star artists in the Discover screen to build your personal lineup."
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        item(key = "squad_actions") {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 12.dp),
                                horizontalArrangement = Arrangement.End,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                BrutalistBadge(
                                    text = "LINK SQUAD",
                                    color = CyanPulse,
                                    modifier = Modifier.clickable { showScanner = true }
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                BrutalistBadge(
                                    text = "SHARE SQUAD QR",
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.clickable { showShareQR = true }
                                )
                            }
                        }

                        if (clashes.isNotEmpty()) {
                            item(key = "clash_banner") {
                                ClashBanner(clashes = clashes)
                                Spacer(modifier = Modifier.height(8.dp))
                            }
                        }

                        byDayFavorites.forEach { (day, artists) ->
                            item(key = "day_header_$day") { DayHeader(day = day) }
                            items(artists, key = { it.id }) { artist ->
                                ScheduleRow(
                                    artist = artist,
                                    isFavorite = true,
                                    inSquad = uiState.squadFavoriteIds.contains(artist.id),
                                    onToggleFavorite = {
                                        viewModel.toggleFavorite(artist.id)
                                        haptic.lightTap()
                                    },
                                    onClick = { artistForDetail = artist },
                                    hapticTap = { haptic.lightTap() },
                                    clashPair = clashes.firstOrNull { it.a.id == artist.id || it.b.id == artist.id },
                                    showDayBadge = true,
                                    minuteTick = minuteTick
                                )
                            }
                        }
                        item { Spacer(modifier = Modifier.height(100.dp)) }
                    }
                }
            }
        }
    }

    if (showShareQR) {
        SquadQRDialog(favoriteIds = uiState.favoriteIds, onDismiss = { showShareQR = false })
    }

    if (showScanner) {
        SquadLinkEntryDialog(
            onIdsDetected = { ids ->
                viewModel.updateSquadFavorites(ids)
                showScanner = false
                haptic.successBurst()
            },
            onDismiss = { showScanner = false }
        )
    }

    artistForDetail?.let { artist ->
        ArtistDetailSheet(
            artist = artist,
            isFavorite = uiState.favoriteIds.contains(artist.id),
            onToggleFavorite = { viewModel.toggleFavorite(artist.id) },
            onDismiss = { artistForDetail = null }
        )
    }
}

@Composable
private fun TimeSlotToggle(
    selectedSlot: String,
    onSlotSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(16.dp))
            .padding(4.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            val isDay = selectedSlot == "daypark"
            val dayBg by animateColorAsState(targetValue = if (isDay) MaterialTheme.colorScheme.primary else Color.Transparent, label = "dayBg")
            val dayText by animateColorAsState(targetValue = if (isDay) Color.White else TextMuted, label = "dayText")
            Box(
                modifier = Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(dayBg).clickable { onSlotSelected("daypark") }.padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("☀️ DAYPARK", fontWeight = FontWeight.Black, color = dayText, fontSize = 12.sp, letterSpacing = 1.sp)
            }

            val isNight = selectedSlot == "nightpark"
            val nightBg by animateColorAsState(targetValue = if (isNight) MaterialTheme.colorScheme.tertiary else Color.Transparent, label = "nightBg")
            val nightText by animateColorAsState(targetValue = if (isNight) Color.Black else TextMuted, label = "nightText")
            Box(
                modifier = Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(nightBg).clickable { onSlotSelected("nightpark") }.padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("🌙 NIGHTPARK", fontWeight = FontWeight.Black, color = nightText, fontSize = 12.sp, letterSpacing = 1.sp)
            }
        }
    }
}

@Composable
private fun ScheduleSearchField(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(14.dp))
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(Icons.Filled.Search, contentDescription = null, tint = TextMuted, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Box(modifier = Modifier.weight(1f)) {
            if (query.isEmpty()) {
                Text(
                    text = "Search artists…",
                    color = TextMuted.copy(alpha = 0.6f),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }
            BasicTextField(
                value = query,
                onValueChange = onQueryChange,
                singleLine = true,
                textStyle = TextStyle(color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold),
                cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                modifier = Modifier.fillMaxWidth()
            )
        }
        if (query.isNotEmpty()) {
            Icon(
                Icons.Filled.Close,
                contentDescription = "Clear search",
                tint = TextMuted,
                modifier = Modifier
                    .size(16.dp)
                    .clickable { onQueryChange("") }
            )
        }
    }
}

@Composable
private fun ScheduleTabToggle(
    activeTab: ScheduleTab,
    onTabSelected: (ScheduleTab) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(16.dp))
            .padding(4.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            listOf(ScheduleTab.GRID to "GRID", ScheduleTab.BY_TIME to "BY TIME", ScheduleTab.MY_LINEUP to "MY LINEUP").forEach { (tab, label) ->
                val isActive = activeTab == tab
                val bgColor by animateColorAsState(targetValue = if (isActive) MaterialTheme.colorScheme.primary else Color.Transparent, animationSpec = tween(220, easing = FastOutSlowInEasing), label = "tabBg_$label")
                val textColor by animateColorAsState(targetValue = if (isActive) Color.White else TextMuted, animationSpec = tween(220), label = "tabText_$label")
                Box(
                    modifier = Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(bgColor).clickable { onTabSelected(tab) }.padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = label, fontWeight = FontWeight.Black, color = textColor, fontSize = 12.sp, letterSpacing = 1.sp)
                }
            }
        }
    }
}

@Composable
private fun DayHeader(day: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp).padding(top = 16.dp, bottom = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        val label = (FestivalConfig.current.dates.dayLabels[day] ?: day.take(3).uppercase()) + " · " + day.uppercase()
        BrutalistBadge(text = label, color = MaterialTheme.colorScheme.secondary)
    }
}

@Composable
private fun ScheduleRow(
    artist: Artist,
    isFavorite: Boolean,
    inSquad: Boolean = false,
    onToggleFavorite: () -> Unit,
    onClick: () -> Unit,
    hapticTap: () -> Unit,
    clashPair: ClashPair?,
    showDayBadge: Boolean,
    minuteTick: Long = 0L
) {
    val nowPlaying = remember(artist.id, minuteTick) { isNowPlaying(artist) }
    val accentColor = when {
        nowPlaying    -> ToxicGreen
        artist.isHeadliner -> MaterialTheme.colorScheme.primary
        isFavorite    -> MaterialTheme.colorScheme.secondary
        inSquad       -> CyanPulse
        else          -> Color.White.copy(alpha = 0.04f)
    }
    val infiniteTransition = rememberInfiniteTransition(label = "pulse_${artist.id}")
    val pulsingAlpha by infiniteTransition.animateFloat(initialValue = 0.4f, targetValue  = 1.0f, animationSpec = InfiniteRepeatableSpec(animation  = tween(durationMillis = 900, easing = FastOutSlowInEasing), repeatMode = RepeatMode.Reverse), label = "pulsingAlpha_${artist.id}")

    NeonCard(onClick = onClick, accentColor = accentColor) {
        Box {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.width(52.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    if (nowPlaying) {
                        Box(modifier = Modifier.size(8.dp).graphicsLayer { alpha = pulsingAlpha }.clip(CircleShape).background(ToxicGreen))
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(text = "LIVE", fontWeight = FontWeight.Black, color = ToxicGreen, fontSize = 10.sp, letterSpacing = 1.sp)
                        Text(text = "NOW", fontWeight = FontWeight.Black, color = ToxicGreen, fontSize = 10.sp, letterSpacing = 1.sp)
                    } else if (showDayBadge) {
                        val dayShort = FestivalConfig.current.dates.dayLabels[artist.day] ?: artist.day?.take(3)?.uppercase() ?: ""
                        BrutalistBadge(text = dayShort, color = MaterialTheme.colorScheme.secondary)
                        if (artist.startTime != null) { Text(text = formatTime(artist.startTime), fontWeight = FontWeight.Black, color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp, letterSpacing = (-0.3).sp, modifier = Modifier.padding(top = 4.dp)) }
                    } else {
                        if (artist.startTime != null) { Text(text = formatTime(artist.startTime), fontWeight = FontWeight.Black, color = if (artist.isHeadliner) MaterialTheme.colorScheme.primary else Color.White, fontSize = 14.sp, letterSpacing = (-0.5).sp) }
                        if (artist.endTime != null) { Text(text = formatTime(artist.endTime), color = TextMuted, fontSize = 10.sp) }
                    }
                }
                Box(modifier = Modifier.width(1.dp).height(36.dp).background(Color.White.copy(alpha = 0.07f)))
                Spacer(modifier = Modifier.width(12.dp))
                Box(modifier = Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(MutedBackground), contentAlignment = Alignment.Center) {
                    if (artist.imageUrl != null) { AsyncImage(model = artist.imageUrl, contentDescription = artist.artist, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        if (artist.isHeadliner) { BrutalistBadge(text = "HEADLINER", color = MaterialTheme.colorScheme.primary) }
                        if (nowPlaying) { BrutalistBadge(text = "LIVE NOW", color = ToxicGreen) }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(text = artist.artist.uppercase(), fontWeight = FontWeight.Black, color = Color.White, fontSize = 15.sp, letterSpacing = (-0.3).sp, modifier = Modifier.weight(1f, fill = false))
                        if (nowPlaying) { Box(modifier = Modifier.size(8.dp).graphicsLayer { alpha = pulsingAlpha }.clip(CircleShape).background(ToxicGreen)) }
                    }
                    if (artist.genres.filter { it != "MUSIC" }.isNotEmpty()) { Text(text = artist.genres.filter { it != "MUSIC" }.take(2).joinToString(" · "), color = TextMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp)) }
                }
                Box(modifier = Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(if (isFavorite) MaterialTheme.colorScheme.secondary.copy(alpha = 0.12f) else Color.Transparent).clickable { onToggleFavorite() }.padding(6.dp), contentAlignment = Alignment.Center) {
                    Icon(Icons.Filled.Star, contentDescription = "Favorite", tint = if (isFavorite) MaterialTheme.colorScheme.secondary else Color.White.copy(alpha = 0.2f), modifier = Modifier.size(20.dp))
                }
            }
            if (clashPair != null) {
                val color = if (clashPair.type == ClashType.HARD) ClashBadgeColor else CyanPulse
                Box(modifier = Modifier.align(Alignment.TopEnd).padding(top = 0.dp, end = 0.dp).clip(RoundedCornerShape(6.dp)).background(color).padding(horizontal = 5.dp, vertical = 2.dp)) {
                    Text(text = if (clashPair.type == ClashType.HARD) "⚡" else "⚠️", fontSize = 10.sp, color = if (clashPair.type == ClashType.HARD) Color.White else Color.Black)
                }
            }
        }
    }
}

@Composable
private fun ClashBanner(clashes: List<ClashPair>) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = ClashBannerBg), border = androidx.compose.foundation.BorderStroke(1.dp, ClashBannerBorder.copy(alpha = 0.50f))) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(imageVector = Icons.Filled.LocalFireDepartment, contentDescription = null, tint = ClashBannerBorder, modifier = Modifier.size(18.dp))
                Text(text = "${clashes.size} CLASH${if (clashes.size > 1) "ES" else ""} DETECTED", fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, color = ClashBannerBorder, fontSize = 13.sp, letterSpacing = 0.5.sp)
            }
            Spacer(modifier = Modifier.height(8.dp))
            clashes.forEach { clash ->
                val isHard = clash.type == ClashType.HARD
                val color = if (isHard) ClashBadgeColor else CyanPulse
                Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    BrutalistBadge(text = if (isHard) "HARD CLASH" else "TIGHT TRANSITION", color = color, isOutlined = true)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = "${clash.a.artist} vs ${clash.b.artist}", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                    if (!isHard) { Text(text = "${clash.gapMinutes} MINS GAP", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Black) }
                }
            }
        }
    }
}

@Composable
private fun SquadQRDialog(favoriteIds: Set<String>, onDismiss: () -> Unit) {
    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(modifier = Modifier.fillMaxWidth().padding(24.dp), shape = RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(containerColor = MutedBackground), border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))) {
            Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                BrutalistHeader(title = "SQUAD LINK", subtitle = "Have a friend scan this to merge your lineups.")
                Spacer(modifier = Modifier.height(24.dp))
                val content = org.openfestivalhub.ui.utils.QRUtils.encodeSquad(favoriteIds)
                val qr = org.openfestivalhub.ui.utils.QRUtils.generateQRCode(content)
                if (qr != null) {
                    Box(modifier = Modifier.size(240.dp).clip(RoundedCornerShape(16.dp)).background(Color.White).padding(16.dp)) {
                        androidx.compose.foundation.Image(bitmap = qr.asImageBitmap(), contentDescription = "Squad QR Code", modifier = Modifier.fillMaxSize())
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
                BrutalistButton(text = "CLOSE", onClick = onDismiss, color = Color.White.copy(alpha = 0.05f), textColor = Color.White, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}

@androidx.compose.material3.ExperimentalMaterial3Api
@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
private fun ArtistDetailSheet(artist: Artist, isFavorite: Boolean, onToggleFavorite: () -> Unit, onDismiss: () -> Unit) {
    androidx.compose.material3.ModalBottomSheet(onDismissRequest = onDismiss, containerColor = OLEDBlack, dragHandle = { androidx.compose.material3.BottomSheetDefaults.DragHandle(color = Color.White.copy(alpha = 0.2f)) }) {
        Column(modifier = Modifier.fillMaxWidth().padding(24.dp).padding(bottom = 32.dp)) {
            if (artist.imageUrl != null) {
                AsyncImage(model = artist.imageUrl, contentDescription = artist.artist, modifier = Modifier.fillMaxWidth().height(240.dp).clip(RoundedCornerShape(20.dp)).background(Color.White.copy(alpha = 0.05f)), contentScale = ContentScale.Crop)
                Spacer(modifier = Modifier.height(20.dp))
            } else {
                 Box(modifier = Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(20.dp)).background(Color.White.copy(alpha = 0.05f)), contentAlignment = Alignment.Center) {
                     Text(artist.artist.take(1), color = TextMuted, fontSize = 48.sp, fontWeight = FontWeight.Black)
                 }
                 Spacer(modifier = Modifier.height(20.dp))
            }
            Text(text = artist.artist.uppercase(), color = if (artist.isHeadliner) MaterialTheme.colorScheme.primary else Color.White, fontWeight = FontWeight.Black, fontSize = 28.sp, letterSpacing = (-1).sp)
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
                 BrutalistBadge(text = (artist.stage ?: "MAIN STAGE").uppercase(), color = MaterialTheme.colorScheme.primary)
                 Spacer(modifier = Modifier.width(10.dp))
                 Text(text = "${artist.day?.uppercase()} · ${formatTime(artist.startTime)} - ${formatTime(artist.endTime)}", color = TextMuted, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
            if (artist.genres?.isNotEmpty() == true) {
                Row(modifier = Modifier.padding(top = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    artist.genres.take(3).forEach { genre -> BrutalistBadge(text = genre, color = Color.White, isOutlined = true) }
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
            BrutalistButton(text = if (isFavorite) "REMOVE FROM LINEUP" else "ADD TO MY LINEUP", onClick = onToggleFavorite, color = if (isFavorite) RedWarning.copy(alpha = 0.2f) else ToxicGreen, textColor = if (isFavorite) RedWarning else OLEDBlack, modifier = Modifier.fillMaxWidth())
        }
    }
}

@Composable
private fun SquadLinkEntryDialog(onIdsDetected: (List<String>) -> Unit, onDismiss: () -> Unit) {
    var input by remember { mutableStateOf("") }
    val haptic = rememberHapticManager()

    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth().padding(24.dp),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = MutedBackground),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
        ) {
            Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                BrutalistHeader(title = "LINK SQUAD", subtitle = "Paste your friend's squad link or code to show their schedule.")
                Spacer(modifier = Modifier.height(24.dp))
                
                OutlinedTextField(
                    value = input,
                    onValueChange = { input = it },
                    placeholder = { Text("Paste link or artist IDs...", color = TextMuted, fontSize = 13.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = CyanPulse,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                        focusedContainerColor = OLEDBlack.copy(alpha = 0.5f),
                        unfocusedContainerColor = OLEDBlack.copy(alpha = 0.3f)
                    ),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    BrutalistButton(
                        text = "CANCEL",
                        onClick = onDismiss,
                        color = Color.White.copy(alpha = 0.05f),
                        textColor = Color.White,
                        modifier = Modifier.weight(1f)
                    )
                    
                    BrutalistButton(
                        text = "LINK",
                        onClick = {
                            val decoded = org.openfestivalhub.ui.utils.QRUtils.decodeSquad(input.trim())
                            if (decoded != null) {
                                haptic.successBurst()
                                onIdsDetected(decoded)
                            }
                        },
                        color = CyanPulse,
                        textColor = OLEDBlack,
                        modifier = Modifier.weight(1f),
                        enabled = input.isNotBlank()
                    )
                }
            }
        }
    }
}
