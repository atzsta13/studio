package com.example.szigerinsider2026.ui.schedule

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
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalFireDepartment
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.components.*
import coil3.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import com.example.szigerinsider2026.ui.utils.parseTime
import com.example.szigerinsider2026.ui.utils.formatTime
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import com.example.szigerinsider2026.data.config.FestivalConfig

// ─── Constants (derived from FestivalConfig.current) ───────────────────────────

private val DAY_LABELS get() = FestivalConfig.current.dates.dayLabels

private val DAY_TO_DATE: Map<String, LocalDate> get() {
    val config = FestivalConfig.current
    val start = LocalDate.parse(config.dates.startDate)
    return config.dates.days.mapIndexed { i, day ->
        day to start.plusDays(i.toLong())
    }.toMap()
}

private val FESTIVAL_START get() = FestivalConfig.current.let { LocalDate.parse(it.dates.startDate) }
private val FESTIVAL_END   get() = FestivalConfig.current.let { LocalDate.parse(it.dates.endDate) }

private val ClashBannerBg     = Color(0xFF2A0A00)
private val ClashBannerBorder = Color(0xFFFF4500)
private val ClashBadgeColor   = Color(0xFFFF6B00)

// ─── Now-playing helper ───────────────────────────────────────────────────────

private fun isNowPlaying(artist: Artist): Boolean {
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

        when (uiState.activeTab) {
            ScheduleTab.GRID -> {
                TimetableGrid(
                    dayArtists = dayArtists,
                    selectedDay = uiState.selectedDay,
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
                            showDayBadge = false
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
                                    text = "SCAN SQUAD",
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
                                    showDayBadge = true
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
        SquadScannerDialog(
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

// Hours before this are treated as "past midnight" and belong to the previous festival day.
private const val ROLLOVER_HOUR = 6
private const val DP_PER_MINUTE = 1.7f
private val GUTTER_WIDTH = 44.dp

private fun wallMinutes(t: String?): Int? {
    val time = parseTime(t) ?: return null
    val mins = time.hour * 60 + time.minute
    return if (time.hour < ROLLOVER_HOUR) mins + 24 * 60 else mins
}

private fun formatWallMinutes(mins: Int): String {
    val h = (mins / 60) % 24
    val m = mins % 60
    return "%02d:%02d".format(h, m)
}

@Composable
fun TimetableGrid(
    dayArtists: List<Artist>,
    selectedDay: String,
    favoriteIds: Set<String>,
    squadIds: Set<String> = emptySet(),
    onArtistClick: (String) -> Unit,
    onToggleFavorite: (String) -> Unit
) {
    val haptic = rememberHapticManager()
    val byStage = remember(dayArtists) {
        dayArtists.filter { wallMinutes(it.startTime) != null && wallMinutes(it.endTime) != null }
            .groupBy { it.stage ?: "Other" }.entries
            .sortedBy { if (it.key.contains("main", true) || it.key.contains("blue", true)) 0 else 1 }
    }

    if (byStage.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize().padding(horizontal = 32.dp), contentAlignment = Alignment.Center) {
            BrutalistHeader(title = "NO STAGE TIMES YET", subtitle = "The schedule for this day has not been published.")
        }
        return
    }

    val dayStart = remember(byStage) {
        (byStage.flatMap { it.value }.mapNotNull { wallMinutes(it.startTime) }.min() / 60) * 60
    }
    val dayEnd = remember(byStage) {
        ((byStage.flatMap { it.value }.mapNotNull { wallMinutes(it.endTime) }.max() + 59) / 60) * 60
    }
    val boardHeight = ((dayEnd - dayStart) * DP_PER_MINUTE).dp

    val nowMinutes = remember(selectedDay, dayStart, dayEnd) {
        val now = LocalTime.now()
        val mins = now.hour * 60 + now.minute + if (now.hour < ROLLOVER_HOUR) 24 * 60 else 0
        val effectiveDate = if (now.hour < ROLLOVER_HOUR) LocalDate.now().minusDays(1) else LocalDate.now()
        if (DAY_TO_DATE[selectedDay] == effectiveDate && mins in dayStart..dayEnd) mins else null
    }

    val scrollState = rememberScrollState()
    val density = LocalDensity.current
    LaunchedEffect(selectedDay) {
        nowMinutes?.let { mins ->
            val targetPx = with(density) { (((mins - dayStart) * DP_PER_MINUTE) - 120f).dp.toPx() }
            scrollState.scrollTo(targetPx.toInt().coerceAtLeast(0))
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Sticky stage header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(40.dp)
                .background(OLEDBlack)
                .drawBehind {
                    drawLine(
                        color = Color.White.copy(alpha = 0.15f),
                        start = androidx.compose.ui.geometry.Offset(0f, size.height),
                        end = androidx.compose.ui.geometry.Offset(size.width, size.height),
                        strokeWidth = 1.dp.toPx()
                    )
                },
            verticalAlignment = Alignment.CenterVertically
        ) {
            Spacer(modifier = Modifier.width(GUTTER_WIDTH))
            byStage.forEach { entry ->
                Box(modifier = Modifier.weight(1f).fillMaxHeight(), contentAlignment = Alignment.Center) {
                    Text(
                        text = entry.key.uppercase(),
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = 1.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }

        // Vertical time board
        Box(modifier = Modifier.fillMaxSize().verticalScroll(scrollState)) {
            Box(modifier = Modifier.fillMaxWidth().height(boardHeight)) {
                // Hour gridlines + labels in the left gutter
                var hourMark = dayStart
                while (hourMark <= dayEnd) {
                    val y = ((hourMark - dayStart) * DP_PER_MINUTE).dp
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .offset(y = y)
                            .background(Color.White.copy(alpha = 0.08f))
                    )
                    Text(
                        text = formatWallMinutes(hourMark),
                        color = TextMuted,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.offset(x = 4.dp, y = y + 2.dp)
                    )
                    hourMark += 60
                }

                // Stage columns
                Row(modifier = Modifier.fillMaxSize()) {
                    Spacer(modifier = Modifier.width(GUTTER_WIDTH))
                    byStage.forEach { entry ->
                        Box(modifier = Modifier.weight(1f).fillMaxHeight()) {
                            entry.value.forEach { artist ->
                                val start = wallMinutes(artist.startTime) ?: return@forEach
                                val end = wallMinutes(artist.endTime) ?: (start + 30)
                                ArtistGridBlock(
                                    artist = artist,
                                    y = (start - dayStart) * DP_PER_MINUTE,
                                    blockHeight = ((end - start) * DP_PER_MINUTE).coerceAtLeast(52f),
                                    isFavorite = favoriteIds.contains(artist.id),
                                    inSquad = squadIds.contains(artist.id),
                                    onArtistClick = onArtistClick,
                                    haptic = haptic
                                )
                            }
                        }
                    }
                }

                // Now line
                nowMinutes?.let { mins ->
                    val y = ((mins - dayStart) * DP_PER_MINUTE).dp
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(12.dp)
                            .offset(y = y - 6.dp)
                            .background(Brush.verticalGradient(listOf(Color.Transparent, ToxicGreen.copy(alpha = 0.2f), Color.Transparent)))
                    )
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(2.dp)
                            .offset(y = y - 1.dp)
                            .background(ToxicGreen)
                    )
                    Text(
                        text = "NOW",
                        color = ToxicGreen,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp,
                        modifier = Modifier.offset(x = 4.dp, y = y - 14.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun ArtistGridBlock(
    artist: Artist,
    y: Float,
    blockHeight: Float,
    isFavorite: Boolean,
    inSquad: Boolean,
    onArtistClick: (String) -> Unit,
    haptic: com.example.szigerinsider2026.ui.utils.HapticManager
) {
    val isLive = remember(artist) { isNowPlaying(artist) }
    val accentColor = when {
        isFavorite -> MaterialTheme.colorScheme.secondary
        inSquad -> CyanPulse
        isLive -> ToxicGreen
        artist.isHeadliner -> MaterialTheme.colorScheme.primary
        else -> Color.White.copy(alpha = 0.2f)
    }
    val isCompact = blockHeight < 80f

    Box(
        modifier = Modifier
            .offset(y = y.dp)
            .fillMaxWidth()
            .height(blockHeight.dp)
            .padding(horizontal = 3.dp, vertical = 2.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(if (isLive) CardBackground.copy(alpha = 0.9f) else CardBackground)
            .border(
                width = if (isFavorite || isLive || artist.isHeadliner) 1.5.dp else 1.dp,
                color = accentColor.copy(alpha = if (isFavorite || isLive || artist.isHeadliner) 0.8f else 0.15f),
                shape = RoundedCornerShape(14.dp)
            )
            .clickable { haptic.lightTap(); onArtistClick(artist.id) }
    ) {
        // Subtle background glow for high-importance acts
        if (isFavorite || isLive || artist.isHeadliner) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .drawBehind {
                        drawRect(
                            brush = Brush.verticalGradient(
                                colors = listOf(accentColor.copy(alpha = 0.08f), Color.Transparent)
                            )
                        )
                    }
            )
        }

        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp, vertical = 6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (isLive) {
                    Box(
                        modifier = Modifier
                            .padding(end = 4.dp)
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(ToxicGreen)
                    )
                    if (!isCompact) {
                        Text(
                            text = "LIVE NOW",
                            color = ToxicGreen,
                            fontSize = 7.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
                } else if (artist.isHeadliner && !isCompact) {
                    Text(
                        text = "HEADLINER",
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                if (isFavorite) {
                    Icon(Icons.Filled.Star, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(12.dp))
                } else if (inSquad) {
                    Text("👥", fontSize = 10.sp)
                }
            }

            Text(
                text = artist.artist.uppercase(),
                color = if (isFavorite) MaterialTheme.colorScheme.secondary else Color.White,
                fontWeight = FontWeight.Black,
                fontSize = if (isCompact) 10.sp else 12.sp,
                maxLines = if (isCompact) 1 else 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 12.sp,
                letterSpacing = (-0.2).sp,
                fontStyle = FontStyle.Italic
            )

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = "${formatTime(artist.startTime)} - ${formatTime(artist.endTime)}",
                color = if (isLive) ToxicGreen.copy(alpha = 0.7f) else TextMuted,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp,
                maxLines = 1
            )
        }
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
    showDayBadge: Boolean
) {
    val nowPlaying = remember { isNowPlaying(artist) }
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
                val content = com.example.szigerinsider2026.ui.utils.QRUtils.encodeSquad(favoriteIds)
                val qr = com.example.szigerinsider2026.ui.utils.QRUtils.generateQRCode(content)
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

@androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
@Composable
private fun SquadScannerDialog(onIdsDetected: (List<String>) -> Unit, onDismiss: () -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val lifecycleOwner = androidx.compose.ui.platform.LocalLifecycleOwner.current
    val cameraProviderFuture = remember { androidx.camera.lifecycle.ProcessCameraProvider.getInstance(context) }
    val scanner = remember { com.google.mlkit.vision.barcode.BarcodeScanning.getClient() }

    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(modifier = Modifier.fillMaxWidth().height(480.dp).padding(24.dp), shape = RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(containerColor = MutedBackground), border = androidx.compose.foundation.BorderStroke(1.dp, CyanPulse.copy(alpha = 0.2f))) {
            Column(modifier = Modifier.fillMaxSize()) {
                Box(modifier = Modifier.weight(1f)) {
                    androidx.compose.ui.viewinterop.AndroidView(factory = { ctx -> androidx.camera.view.PreviewView(ctx).apply { scaleType = androidx.camera.view.PreviewView.ScaleType.FILL_CENTER } }, modifier = Modifier.fillMaxSize(), update = { previewView -> cameraProviderFuture.addListener({ try { val cameraProvider = cameraProviderFuture.get(); val preview = androidx.camera.core.Preview.Builder().build().apply { setSurfaceProvider(previewView.surfaceProvider) }; val imageAnalysis = androidx.camera.core.ImageAnalysis.Builder().setBackpressureStrategy(androidx.camera.core.ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build(); imageAnalysis.setAnalyzer(java.util.concurrent.Executors.newSingleThreadExecutor()) { imageProxy -> val mediaImage = imageProxy.image; if (mediaImage != null) { val image = com.google.mlkit.vision.common.InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees); scanner.process(image).addOnSuccessListener { barcodes -> for (barcode in barcodes) { barcode.rawValue?.let { raw -> val ids = com.example.szigerinsider2026.ui.utils.QRUtils.decodeSquad(raw); if (ids != null) { onIdsDetected(ids) } } } }.addOnCompleteListener { imageProxy.close() } } else { imageProxy.close() } }; cameraProvider.unbindAll(); cameraProvider.bindToLifecycle(lifecycleOwner, androidx.camera.core.CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis) } catch (e: Exception) { e.printStackTrace() } }, androidx.core.content.ContextCompat.getMainExecutor(context)) })
                    Box(modifier = Modifier.fillMaxSize().padding(40.dp).border(2.dp, CyanPulse.copy(alpha = 0.4f), RoundedCornerShape(12.dp)))
                }
                Box(modifier = Modifier.fillMaxWidth().background(MutedBackground).clickable { onDismiss() }.padding(16.dp), contentAlignment = Alignment.Center) { Text("CANCEL", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp) }
            }
        }
    }
}
