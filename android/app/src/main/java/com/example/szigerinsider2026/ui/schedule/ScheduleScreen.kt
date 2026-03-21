package com.example.szigerinsider2026.ui.schedule

import androidx.compose.foundation.ScrollState

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
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.HorizontalDivider
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.asImageBitmap
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
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import com.example.szigerinsider2026.data.config.FestivalConfig

// ─── Constants (from FestivalConfig) ─────────────────────────────────────────

private val DAY_ORDER  = FestivalConfig.DAYS
private val DAY_LABELS = FestivalConfig.DAY_LABELS

private val DAY_TO_DATE: Map<String, LocalDate> = FestivalConfig.DAYS
    .mapIndexed { i, day ->
        day to LocalDate.of(FestivalConfig.START_YEAR, FestivalConfig.START_MONTH, FestivalConfig.START_DAY + i)
    }.toMap()

private val FESTIVAL_START = LocalDate.of(FestivalConfig.START_YEAR, FestivalConfig.START_MONTH, FestivalConfig.START_DAY)
private val FESTIVAL_END   = LocalDate.of(FestivalConfig.START_YEAR, FestivalConfig.END_MONTH,   FestivalConfig.END_DAY)

private val ClashBannerBg     = Color(0xFF2A0A00)
private val ClashBannerBorder = Color(0xFFFF4500)
private val ClashBadgeColor   = Color(0xFFFF6B00)

// ─── Time helpers ─────────────────────────────────────────────────────────────

private fun parseTime(t: String?): LocalTime? {
    if (t == null) return null
    return try {
        LocalTime.parse(t, DateTimeFormatter.ofPattern("HH:mm"))
    } catch (_: Exception) { null }
}

private fun timesOverlap(
    start1: LocalTime, end1: LocalTime,
    start2: LocalTime, end2: LocalTime
): Boolean {
    // Treat times that wrap past midnight: if end < start it wraps.
    // Simple approach: compare minute-of-day, treating wrap as +1440.
    fun toMinutes(t: LocalTime) = t.hour * 60 + t.minute
    fun endMin(start: LocalTime, end: LocalTime): Int {
        val s = toMinutes(start); val e = toMinutes(end)
        return if (e <= s) e + 1440 else e
    }
    val s1 = toMinutes(start1); val e1 = endMin(start1, end1)
    val s2 = toMinutes(start2); val e2 = endMin(start2, end2)
    return s1 < e2 && s2 < e1
}

data class ClashPair(val a: Artist, val b: Artist)

private fun detectClashes(favorites: List<Artist>): List<ClashPair> {
    val clashes = mutableListOf<ClashPair>()
    val byDay = favorites.groupBy { it.day }
    byDay.values.forEach { dayArtists ->
        for (i in dayArtists.indices) {
            for (j in i + 1 until dayArtists.size) {
                val a = dayArtists[i]; val b = dayArtists[j]
                if (a.stage != null && b.stage != null && a.stage != b.stage) {
                    val as_ = parseTime(a.startTime); val ae = parseTime(a.endTime)
                    val bs  = parseTime(b.startTime); val be  = parseTime(b.endTime)
                    if (as_ != null && ae != null && bs != null && be != null) {
                        if (timesOverlap(as_, ae, bs, be)) {
                            clashes.add(ClashPair(a, b))
                        }
                    }
                }
            }
        }
    }
    return clashes
}

// ─── Now-playing helper ───────────────────────────────────────────────────────

private fun isNowPlaying(artist: Artist): Boolean {
    val today = LocalDate.now()
    if (today < FESTIVAL_START || today > FESTIVAL_END) return false
    val festDate = DAY_TO_DATE[artist.day] ?: return false
    if (festDate != today) return false
    val start = parseTime(artist.startTime) ?: return false
    val end   = parseTime(artist.endTime)   ?: return false
    val now   = LocalTime.now()
    // Handle overnight slots (e.g. 23:00 → 01:00)
    return if (end > start) now >= start && now < end
    else now >= start || now < end
}

// ─── Screen ──────────────────────────────────────────────────────────────────

private enum class ScheduleTab { GRID, BY_TIME, MY_LINEUP }

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun ScheduleScreen(
    onArtistClick: (String) -> Unit = {},
    onBack: () -> Unit = {}
) {
    val context = LocalContext.current
    val haptic  = rememberHapticManager()

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
        val days = allArtists.mapNotNull { it.day }.distinct()
            .sortedBy { DAY_ORDER.indexOf(it).let { i -> if (i == -1) 99 else i } }
        listOf("WEEK") + days
    }

    var selectedDay by remember(availableDays) { mutableStateOf(availableDays.firstOrNull() ?: "WEEK") }
    var activeTab  by remember { mutableStateOf(ScheduleTab.GRID) }
    var artistForDetail by remember { mutableStateOf<Artist?>(null) }
    
    // Squad State (Peer Favorites)
    var squadFavoriteIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    var showShareQR      by remember { mutableStateOf(false) }
    var showScanner      by remember { mutableStateOf(false) }

    // ── ALL tab data ─────────────────────────────────────────────────────────
    val dayArtists = remember(allArtists, selectedDay) {
        allArtists
            .filter { selectedDay == "WEEK" || it.day?.equals(selectedDay, ignoreCase = true) == true }
            .sortedWith(
                compareBy<Artist> { DAY_ORDER.indexOf(it.day ?: "").let { i -> if (i == -1) 99 else i } }
                    .thenBy { it.startTime ?: "99:99" }
                    .thenBy { it.artist }
            )
    }

    val byStage = remember(dayArtists) {
        dayArtists.groupBy { it.stage ?: "Other" }.entries
            .sortedBy { if (it.key.contains("main", ignoreCase = true)) 0 else 1 }
    }

    // ── MY LINEUP tab data ───────────────────────────────────────────────────
    val favoriteArtists = remember(allArtists, favoriteIds) {
        allArtists.filter { favoriteIds.contains(it.id) }
            .sortedWith(
                compareBy<Artist> { DAY_ORDER.indexOf(it.day ?: "").let { i -> if (i == -1) 99 else i } }
                    .thenBy { it.startTime ?: "99:99" }
                    .thenBy { it.artist }
            )
    }

    val byDayFavorites = remember(favoriteArtists) {
        favoriteArtists.groupBy { it.day ?: "Unknown" }.entries
            .sortedBy { DAY_ORDER.indexOf(it.key).let { i -> if (i == -1) 99 else i } }
    }

    val clashes = remember(favoriteArtists) { detectClashes(favoriteArtists) }
    val clashedArtistIds = remember(clashes) {
        clashes.flatMap { listOf(it.a.id, it.b.id) }.toSet()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
    ) {
        // ── Header ────────────────────────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(top = 20.dp, bottom = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "TIMETABLE",
                fontSize = 36.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                color = Color.White,
                letterSpacing = (-1.5).sp,
                lineHeight = 34.sp
            )
            Text(
                text = FestivalConfig.DATE_VENUE_DISPLAY,
                color = TextMuted,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 2.dp)
            )
        }

        // ── Day selector ─────────────────────────────────────────────────────────
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
                    val isSelected = (day == selectedDay && activeTab == ScheduleTab.GRID)
                    val isWeekTab  = day == "WEEK"
                    
                    val bgColor by animateColorAsState(
                        targetValue = if (isSelected) {
                            if (isWeekTab) AcidYellow else Color.White
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
                                selectedDay = day
                                activeTab = ScheduleTab.GRID
                            }
                            .padding(horizontal = 16.dp, vertical = 10.dp)
                    ) {
                        Text(
                            text = if (isWeekTab) "FULL WEEK" else (DAY_LABELS[day] ?: day.take(3).uppercase()),
                            fontWeight = FontWeight.Black,
                            color = textColor,
                            fontSize = 11.sp,
                            letterSpacing = 1.sp
                        )
                    }
                }
            }
        }

        // ── ALL / MY LINEUP segmented control ────────────────────────────────
        ScheduleTabToggle(
            activeTab = activeTab,
            onTabSelected = { haptic.lightTap(); activeTab = it },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .padding(bottom = 10.dp)
        )

        // ── Content ──────────────────────────────────────────────────────────
        when (activeTab) {
            ScheduleTab.GRID -> {
                TimetableGrid(
                    dayArtists = dayArtists,
                    selectedDay = selectedDay,
                    favoriteIds = favoriteIds,
                    squadIds = squadFavoriteIds,
                    onArtistClick = { id -> 
                        artistForDetail = allArtists.find { it.id == id }
                    },
                    onToggleFavorite = { id ->
                        artistViewModel.toggleFavorite(id)
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
                            isFavorite = favoriteIds.contains(artist.id),
                            inSquad = squadFavoriteIds.contains(artist.id),
                            onToggleFavorite = {
                                artistViewModel.toggleFavorite(artist.id)
                                haptic.lightTap()
                            },
                            onClick = { artistForDetail = artist },
                            hapticTap = { haptic.lightTap() },
                            showClashBadge = false,
                            showDayBadge = false
                        )
                    }
                }
            }
            ScheduleTab.MY_LINEUP -> {
                if (favoriteArtists.isEmpty()) {
                    // Empty state
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
                                color = AcidYellow.copy(alpha = 0.4f)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "YOUR LINEUP IS EMPTY",
                                fontWeight = FontWeight.Black,
                                fontStyle = FontStyle.Italic,
                                fontSize = 18.sp,
                                color = Color.White,
                                letterSpacing = (-0.5).sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Star artists in the Discover screen to build your personal lineup.",
                                color = TextMuted,
                                fontSize = 14.sp,
                                lineHeight = 20.sp,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        if (favoriteArtists.isNotEmpty()) {
                            item(key = "squad_actions") {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 12.dp),
                                    horizontalArrangement = Arrangement.End,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(CyanPulse.copy(alpha = 0.15f))
                                            .clickable { showScanner = true }
                                            .padding(horizontal = 14.dp, vertical = 10.dp)
                                    ) {
                                        Text(
                                            text = "SCAN SQUAD",
                                            fontWeight = FontWeight.Black,
                                            color = CyanPulse,
                                            fontSize = 11.sp,
                                            letterSpacing = 1.sp
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(PrimaryMagenta.copy(alpha = 0.15f))
                                            .clickable { showShareQR = true }
                                            .padding(horizontal = 14.dp, vertical = 10.dp)
                                    ) {
                                        Text(
                                            text = "SHARE SQUAD QR",
                                            fontWeight = FontWeight.Black,
                                            color = PrimaryMagenta,
                                            fontSize = 11.sp,
                                            letterSpacing = 1.sp
                                        )
                                    }
                                }
                            }
                        }

                        // Clash banner
                        if (clashes.isNotEmpty()) {
                            item(key = "clash_banner") {
                                ClashBanner(clashes = clashes)
                                Spacer(modifier = Modifier.height(8.dp))
                            }
                        }

                        // Grouped by day
                        byDayFavorites.forEach { (day, artists) ->
                            item(key = "day_header_$day") {
                                DayHeader(day = day)
                            }
                            items(artists, key = { it.id }) { artist ->
                                ScheduleRow(
                                    artist = artist,
                                    isFavorite = true,
                                    inSquad = squadFavoriteIds.contains(artist.id),
                                    onToggleFavorite = {
                                        artistViewModel.toggleFavorite(artist.id)
                                        haptic.lightTap()
                                    },
                                    onClick = { artistForDetail = artist },
                                    hapticTap = { haptic.lightTap() },
                                    showClashBadge = clashes.any { it.a.id == artist.id || it.b.id == artist.id },
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
        SquadQRDialog(
            favoriteIds = favoriteIds,
            onDismiss = { showShareQR = false }
        )
    }

    artistForDetail?.let { artist ->
        ArtistDetailSheet(
            artist = artist,
            isFavorite = favoriteIds.contains(artist.id),
            onToggleFavorite = {
                artistViewModel.toggleFavorite(artist.id)
                haptic.lightTap()
            },
            onDismiss = { artistForDetail = null }
        )
    }
}

// ─── Tab toggle ──────────────────────────────────────────────────────────────

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
                val bgColor by animateColorAsState(
                    targetValue = if (isActive) PrimaryMagenta else Color.Transparent,
                    animationSpec = tween(220, easing = FastOutSlowInEasing),
                    label = "tabBg_$label"
                )
                val textColor by animateColorAsState(
                    targetValue = if (isActive) Color.White else TextMuted,
                    animationSpec = tween(220),
                    label = "tabText_$label"
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(bgColor)
                        .clickable { onTabSelected(tab) }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        fontWeight = FontWeight.Black,
                        color = textColor,
                        fontSize = 12.sp,
                        letterSpacing = 1.sp
                    )
                }
            }
        }
    }
}

// ─── Stage header ─────────────────────────────────────────────────────────────

@Composable
private fun StageHeader(stage: String) {
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
                fontWeight = FontWeight.Black,
                color = PrimaryMagenta,
                fontSize = 9.sp,
                letterSpacing = 1.5.sp
            )
        }
    }
}

// ─── Day header ──────────────────────────────────────────────────────────────

@Composable
private fun DayHeader(day: String) {
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
                .background(AcidYellow.copy(alpha = 0.14f))
                .border(1.dp, AcidYellow.copy(alpha = 0.25f), RoundedCornerShape(6.dp))
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Text(
                text = (DAY_LABELS[day] ?: day.take(3).uppercase()) + " · " + day.uppercase(),
                fontWeight = FontWeight.Black,
                color = AcidYellow,
                fontSize = 9.sp,
                letterSpacing = 1.5.sp
            )
        }
    }
}

// ─── Timetable Grid ───────────────────────────────────────────────────────────

private const val START_HOUR = 13 // 1:00 PM
private const val END_HOUR   = 28 // 4:00 AM (Next Day)

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
        dayArtists.groupBy { it.stage ?: "Other" }.entries
            .sortedBy { if (it.key.contains("main", ignoreCase = true)) 0 else 1 }
    }

    // 2D Scroll & Zoom State
    var offsetX by remember { mutableStateOf(0f) }
    var offsetY by remember { mutableStateOf(0f) }
    val tabs = listOf("GRID", "BY TIME", "MY LINEUP")
    var selectedTab by remember { mutableStateOf("GRID") }
    var zoom    by remember { mutableStateOf(1f) }

    val baseHourWidth = 180f
    val hourWidth = baseHourWidth * zoom
    val trackHeight = 100f

    fun getX(time: String?): Float {
        if (time == null) return 0f
        val parts = time.split(":")
        if (parts.size < 2) return 0f
        val h = parts[0].toInt()
        val m = parts[1].toInt()
        val normalizedH = if (h < 10) h + 24 else h
        val offsetMinutes = (normalizedH - START_HOUR) * 60 + m
        return (offsetMinutes / 60f) * hourWidth
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
               detectTransformGestures { _, pan, zoomAmount, _ ->
                   zoom = (zoom * zoomAmount).coerceIn(0.5f, 2.5f)
                   offsetX += pan.x
                   offsetY += pan.y
               }
            }
    ) {
        // ─── Main Content (Artists + Lines) ──────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    translationX = offsetX
                    translationY = offsetY
                }
        ) {
            // Hour Lines
            (START_HOUR..END_HOUR).forEach { h ->
                val x = (h - START_HOUR) * hourWidth
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .width(1.dp)
                        .absoluteOffset(x = x.dp)
                        .background(Color.White.copy(alpha = 0.05f))
                )
            }

            // Artist Blocks
            byStage.forEachIndexed { stageIndex, entry ->
                val trackY = stageIndex * trackHeight + 40 // Offset for time header
                entry.value.forEach { artist ->
                    val x = getX(artist.startTime)
                    val endX = getX(artist.endTime)
                    val width = (endX - x).coerceAtLeast(60f)
                    
                    ArtistBlock(
                        artist = artist,
                        x = x,
                        y = trackY,
                        width = width,
                        height = trackHeight - 8,
                        isFavorite = favoriteIds.contains(artist.id),
                        inSquad = squadIds.contains(artist.id),
                        onArtistClick = onArtistClick,
                        haptic = haptic
                    )
                }
            }
        }

        // ─── FLOATING HEADERS ───────────────────────────────────────────────

        // Time Bar (Top)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(40.dp)
                .background(MutedBackground.copy(alpha = 0.95f))
        ) {
            Box(modifier = Modifier.graphicsLayer { translationX = offsetX }) {
                (START_HOUR..END_HOUR).forEach { h ->
                    val x = (h - START_HOUR) * hourWidth
                    Text(
                        text = if (h >= 24) "${h-24}:00" else "$h:00",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.absoluteOffset(x = (x + 8).dp, y = 14.dp)
                    )
                }
            }
        }

        // Stage Labels (Left)
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .padding(top = 40.dp)
                .width(80.dp)
        ) {
            Box(modifier = Modifier.graphicsLayer { translationY = offsetY }) {
                byStage.forEachIndexed { index, entry ->
                    val y = index * trackHeight
                    Box(
                        modifier = Modifier
                            .absoluteOffset(y = y.dp)
                            .size(width = 80.dp, height = trackHeight.dp)
                            .background(MutedBackground.copy(alpha = 0.9f))
                            .border(1.dp, Color.White.copy(alpha = 0.05f))
                            .padding(4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = entry.key.uppercase(),
                            color = Color.White,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            lineHeight = 11.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ArtistBlock(
    artist: Artist,
    x: Float,
    y: Float,
    width: Float,
    height: Float,
    isFavorite: Boolean,
    inSquad: Boolean,
    onArtistClick: (String) -> Unit,
    haptic: com.example.szigerinsider2026.ui.utils.HapticManager
) {
    Box(
        modifier = Modifier
            .absoluteOffset(x = x.dp, y = y.dp)
            .width(width.dp)
            .height(height.dp)
            .padding(4.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .border(
                1.dp,
                when {
                    isFavorite -> AcidYellow.copy(alpha = 0.5f)
                    inSquad    -> CyanPulse.copy(alpha = 0.5f)
                    else       -> Color.White.copy(alpha = 0.08f)
                },
                RoundedCornerShape(12.dp)
            )
            .clickable { haptic.lightTap(); onArtistClick(artist.id) }
            .padding(8.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            // Artist Image
            if (artist.imageUrl != null) {
                AsyncImage(
                    model = artist.imageUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.05f)),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(10.dp))
            } else if (artist.genres?.isNotEmpty() == true) {
                 // Fallback genre icon
                 Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(PrimaryMagenta.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                 ) {
                     Text(artist.artist.take(1), color = PrimaryMagenta, fontWeight = FontWeight.Bold)
                 }
                 Spacer(modifier = Modifier.width(10.dp))
            }

            Column {
                Text(
                    text = artist.artist.uppercase(),
                    color = when {
                        artist.isHeadliner -> PrimaryMagenta
                        inSquad && !isFavorite -> CyanPulse
                        else -> Color.White
                    },
                    fontWeight = FontWeight.Black,
                    fontSize = 11.sp,
                    maxLines = 1,
                    letterSpacing = (-0.2).sp
                )
                Text(
                    text = "${artist.startTime} - ${artist.endTime}",
                    color = TextMuted,
                    fontSize = 9.sp
                )
                if (isFavorite || inSquad) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (isFavorite) {
                            Text("★", color = AcidYellow, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                        }
                        if (inSquad) {
                            Text("👥", color = CyanPulse, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// ─── Schedule row ─────────────────────────────────────────────────────────────

@Composable
private fun ScheduleRow(
    artist: Artist,
    isFavorite: Boolean,
    inSquad: Boolean = false,
    onToggleFavorite: () -> Unit,
    onClick: () -> Unit,
    hapticTap: () -> Unit,
    showClashBadge: Boolean,
    showDayBadge: Boolean
) {
    val nowPlaying = remember { isNowPlaying(artist) }

    val accentColor = when {
        nowPlaying    -> ToxicGreen
        artist.isHeadliner -> PrimaryMagenta
        isFavorite    -> AcidYellow
        inSquad       -> CyanPulse
        else          -> Color.White.copy(alpha = 0.04f)
    }

    // Pulsing green dot for now-playing
    val infiniteTransition = rememberInfiniteTransition(label = "pulse_${artist.id}")
    val pulsingAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue  = 1.0f,
        animationSpec = InfiniteRepeatableSpec(
            animation  = tween(durationMillis = 900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulsingAlpha_${artist.id}"
    )

    Box(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(CardBackground)
                .border(
                    1.dp,
                    accentColor.copy(
                        alpha = if (nowPlaying || artist.isHeadliner || isFavorite || inSquad) 0.35f else 0.04f
                    ),
                    RoundedCornerShape(20.dp)
                )
                .clickable { hapticTap(); onClick() }
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Time / badge column
            Column(
                modifier = Modifier.width(52.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (nowPlaying) {
                    // Pulsing dot
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .graphicsLayer { alpha = pulsingAlpha }
                            .clip(CircleShape)
                            .background(ToxicGreen)
                    )
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(
                        text = "LIVE",
                        fontWeight = FontWeight.Black,
                        color = ToxicGreen,
                        fontSize = 10.sp,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "NOW",
                        fontWeight = FontWeight.Black,
                        color = ToxicGreen,
                        fontSize = 10.sp,
                        letterSpacing = 1.sp
                    )
                } else if (showDayBadge) {
                    // In MY LINEUP mode show day badge in place of time
                    val dayShort = DAY_LABELS[artist.day] ?: artist.day?.take(3)?.uppercase() ?: ""
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(AcidYellow.copy(alpha = 0.14f))
                            .padding(horizontal = 6.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = dayShort,
                            fontWeight = FontWeight.Black,
                            color = AcidYellow,
                            fontSize = 9.sp,
                            letterSpacing = 1.sp
                        )
                    }
                    if (artist.startTime != null) {
                        Text(
                            text = artist.startTime,
                            fontWeight = FontWeight.Black,
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 11.sp,
                            letterSpacing = (-0.3).sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                } else {
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
            }

            // Divider
            Box(
                modifier = Modifier
                    .width(1.dp)
                    .height(36.dp)
                    .background(Color.White.copy(alpha = 0.07f))
            )

            Spacer(modifier = Modifier.width(12.dp))

            // Artist Thumbnail
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MutedBackground),
                contentAlignment = Alignment.Center
            ) {
                if (artist.imageUrl != null) {
                    coil.compose.AsyncImage(
                        model = artist.imageUrl,
                        contentDescription = artist.artist,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = androidx.compose.ui.layout.ContentScale.Crop
                    )
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            // Artist info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
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
                    if (nowPlaying) {
                        Text(
                            text = "LIVE NOW",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp,
                            color = ToxicGreen,
                            modifier = Modifier.padding(bottom = 2.dp)
                        )
                    }
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = artist.artist.uppercase(),
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        fontSize = 15.sp,
                        letterSpacing = (-0.3).sp,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    if (nowPlaying) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .graphicsLayer { alpha = pulsingAlpha }
                                .clip(CircleShape)
                                .background(ToxicGreen)
                        )
                    }
                }
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

        // ⚡ Clash badge — top-right corner of the card
        if (showClashBadge) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 4.dp, end = 4.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(ClashBadgeColor)
                    .padding(horizontal = 5.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "⚡",
                    fontSize = 10.sp
                )
            }
        }
    }
}

@Composable
private fun ClashBanner(clashes: List<ClashPair>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = ClashBannerBg),
        border = androidx.compose.foundation.BorderStroke(1.dp, ClashBannerBorder.copy(alpha = 0.50f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.LocalFireDepartment,
                    contentDescription = null,
                    tint = ClashBannerBorder,
                    modifier = Modifier.size(18.dp)
                )
                Text(
                    text = "${clashes.size} CLASH${if (clashes.size > 1) "ES" else ""} DETECTED",
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    color = ClashBannerBorder,
                    fontSize = 13.sp,
                    letterSpacing = 0.5.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            clashes.forEach { clash ->
                val dayLabel = DAY_LABELS[clash.a.day] ?: clash.a.day?.take(3)?.uppercase() ?: ""
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(4.dp)
                            .clip(CircleShape)
                            .background(ClashBadgeColor)
                    )
                    Text(
                        text = "${clash.a.artist.uppercase()} vs ${clash.b.artist.uppercase()} · $dayLabel",
                        color = Color.White.copy(alpha = 0.80f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.2.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun SquadQRDialog(
    favoriteIds: Set<String>,
    onDismiss: () -> Unit
) {
    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = MutedBackground),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "SQUAD LINK",
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    fontSize = 20.sp,
                    letterSpacing = (-1).sp
                )
                Text(
                    text = "Have a friend scan this to merge your lineups.",
                    color = TextMuted,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                val content = com.example.szigerinsider2026.ui.utils.QRUtils.encodeSquad(favoriteIds)
                val qr = com.example.szigerinsider2026.ui.utils.QRUtils.generateQRCode(content)

                if (qr != null) {
                    Box(
                        modifier = Modifier
                            .size(240.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color.White)
                            .padding(16.dp)
                    ) {
                        androidx.compose.foundation.Image(
                            bitmap = qr.asImageBitmap(),
                            contentDescription = "Squad QR Code",
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White.copy(alpha = 0.05f))
                        .clickable { onDismiss() }
                        .padding(vertical = 14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "CLOSE",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 12.sp,
                        letterSpacing = 1.sp
                    )
                }
            }
        }
    }
}

@androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
@Composable
private fun Badge(text: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.12f))
            .border(1.dp, color.copy(alpha = 0.25f), RoundedCornerShape(4.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = text,
            color = color,
            fontSize = 8.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.sp
        )
    }
}
@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
private fun ArtistDetailSheet(
    artist: Artist,
    isFavorite: Boolean,
    onToggleFavorite: () -> Unit,
    onDismiss: () -> Unit
) {
    androidx.compose.material3.ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = OLEDBlack,
        dragHandle = { androidx.compose.material3.BottomSheetDefaults.DragHandle(color = Color.White.copy(alpha = 0.2f)) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
                .padding(bottom = 32.dp)
        ) {
            // Artist Image (Hero)
            if (artist.imageUrl != null) {
                AsyncImage(
                    model = artist.imageUrl,
                    contentDescription = artist.artist,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White.copy(alpha = 0.05f)),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.height(20.dp))
            } else {
                 Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White.copy(alpha = 0.05f)),
                    contentAlignment = Alignment.Center
                 ) {
                     Text(artist.artist.take(1), color = TextMuted, fontSize = 48.sp, fontWeight = FontWeight.Black)
                 }
                 Spacer(modifier = Modifier.height(20.dp))
            }

            Text(
                text = artist.artist.uppercase(),
                color = if (artist.isHeadliner) PrimaryMagenta else Color.White,
                fontWeight = FontWeight.Black,
                fontSize = 28.sp,
                letterSpacing = (-1).sp
            )

            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
                 Badge(text = (artist.stage ?: "MAIN STAGE").uppercase(), color = PrimaryMagenta)
                 Spacer(modifier = Modifier.width(10.dp))
                 Text(
                     text = "${artist.day?.uppercase()} · ${artist.startTime} - ${artist.endTime}",
                     color = TextMuted,
                     fontWeight = FontWeight.Bold,
                     fontSize = 12.sp
                 )
            }

            if (artist.genres?.isNotEmpty() == true) {
                Row(
                    modifier = Modifier.padding(top = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    artist.genres.take(3).forEach { genre ->
                        Box(
                            modifier = Modifier
                                .border(1.dp, Color.White.copy(alpha = 0.15f), CircleShape)
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(text = genre.uppercase(), color = Color.White.copy(alpha = 0.8f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Action Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(if (isFavorite) RedWarning.copy(alpha = 0.2f) else ToxicGreen)
                    .clickable { onToggleFavorite() }
                    .padding(vertical = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isFavorite) "REMOVE FROM LINEUP" else "ADD TO MY LINEUP",
                    color = if (isFavorite) RedWarning else OLEDBlack,
                    fontWeight = FontWeight.Black,
                    fontSize = 14.sp,
                    letterSpacing = 1.sp
                )
            }
        }
    }
}

@androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
@Composable
private fun SquadScannerDialog(
    onIdsDetected: (List<String>) -> Unit,
    onDismiss: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val lifecycleOwner = androidx.compose.ui.platform.LocalLifecycleOwner.current
    val cameraProviderFuture = remember { androidx.camera.lifecycle.ProcessCameraProvider.getInstance(context) }
    val scanner = remember { com.google.mlkit.vision.barcode.BarcodeScanning.getClient() }

    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(480.dp)
                .padding(24.dp),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = MutedBackground),
            border = androidx.compose.foundation.BorderStroke(1.dp, CyanPulse.copy(alpha = 0.2f))
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                Box(modifier = Modifier.weight(1f)) {
                    androidx.compose.ui.viewinterop.AndroidView(
                        factory = { ctx ->
                            androidx.camera.view.PreviewView(ctx).apply {
                                scaleType = androidx.camera.view.PreviewView.ScaleType.FILL_CENTER
                            }
                        },
                        modifier = Modifier.fillMaxSize(),
                        update = { previewView ->
                            cameraProviderFuture.addListener({
                                try {
                                    val cameraProvider = cameraProviderFuture.get()
                                    val preview = androidx.camera.core.Preview.Builder().build().apply {
                                        setSurfaceProvider(previewView.surfaceProvider)
                                    }

                                    val imageAnalysis = androidx.camera.core.ImageAnalysis.Builder()
                                        .setBackpressureStrategy(androidx.camera.core.ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                                        .build()

                                    imageAnalysis.setAnalyzer(java.util.concurrent.Executors.newSingleThreadExecutor()) { imageProxy ->
                                        val mediaImage = imageProxy.image
                                        if (mediaImage != null) {
                                            val image = com.google.mlkit.vision.common.InputImage.fromMediaImage(
                                                mediaImage,
                                                imageProxy.imageInfo.rotationDegrees
                                            )
                                            scanner.process(image)
                                                .addOnSuccessListener { barcodes ->
                                                    for (barcode in barcodes) {
                                                        barcode.rawValue?.let { raw ->
                                                            val ids = com.example.szigerinsider2026.ui.utils.QRUtils.decodeSquad(raw)
                                                            if (ids != null) {
                                                                onIdsDetected(ids)
                                                            }
                                                        }
                                                    }
                                                }
                                                .addOnCompleteListener { imageProxy.close() }
                                        } else {
                                            imageProxy.close()
                                        }
                                    }

                                    cameraProvider.unbindAll()
                                    cameraProvider.bindToLifecycle(
                                        lifecycleOwner,
                                        androidx.camera.core.CameraSelector.DEFAULT_BACK_CAMERA,
                                        preview,
                                        imageAnalysis
                                    )
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }
                            }, androidx.core.content.ContextCompat.getMainExecutor(context))
                        }
                    )

                    // Target overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(40.dp)
                            .border(2.dp, CyanPulse.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                    )
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MutedBackground)
                        .clickable { onDismiss() }
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("CANCEL", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}

