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
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
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
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import com.example.szigerinsider2026.data.config.FestivalConfig

// ─── Constants (from FestivalConfig) ─────────────────────────────────────────

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
            .sortedBy { FestivalConfig.DAYS.indexOf(it).let { i -> if (i == -1) 99 else i } }
        listOf("WEEK") + days
    }

    // Grouping for the list view
    val byDayFavorites = remember(favoriteArtists) {
        favoriteArtists.groupBy { it.day ?: "Unknown" }.entries
            .sortedBy { FestivalConfig.DAYS.indexOf(it.key).let { i -> if (i == -1) 99 else i } }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
    ) {
        // ── Header ────────────────────────────────────────────────────────────
        BrutalistHeader(
            title = "TIMETABLE",
            subtitle = FestivalConfig.DATE_VENUE_DISPLAY,
            modifier = Modifier.padding(top = 20.dp, bottom = 12.dp)
        )

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
                    val isSelected = (day == uiState.selectedDay && uiState.activeTab == ScheduleTab.GRID)
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
                                viewModel.selectDay(day)
                                viewModel.setTab(ScheduleTab.GRID)
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
            activeTab = uiState.activeTab,
            onTabSelected = { haptic.lightTap(); viewModel.setTab(it) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .padding(bottom = 10.dp)
        )

        // ── DAYPARK / NIGHTPARK toggle (Frequency only) ──────────────────────
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

        // ── Content ──────────────────────────────────────────────────────────
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
                                    color = PrimaryMagenta,
                                    modifier = Modifier.clickable { showShareQR = true }
                                )
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
        SquadQRDialog(
            favoriteIds = uiState.favoriteIds,
            onDismiss = { showShareQR = false }
        )
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

// ─── TimeSlot toggle ────────────────────────────────────────────────────────

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
            // Daypark
            val isDay = selectedSlot == "daypark"
            val dayBg by animateColorAsState(
                targetValue = if (isDay) MaterialTheme.colorScheme.primary else Color.Transparent,
                label = "dayBg"
            )
            val dayText by animateColorAsState(
                targetValue = if (isDay) Color.White else TextMuted,
                label = "dayText"
            )
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(dayBg)
                    .clickable { onSlotSelected("daypark") }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("☀️ DAYPARK", fontWeight = FontWeight.Black, color = dayText, fontSize = 12.sp, letterSpacing = 1.sp)
            }

            // Nightpark
            val isNight = selectedSlot == "nightpark"
            val nightBg by animateColorAsState(
                targetValue = if (isNight) MaterialTheme.colorScheme.tertiary else Color.Transparent,
                label = "nightBg"
            )
            val nightText by animateColorAsState(
                targetValue = if (isNight) Color.Black else TextMuted,
                label = "nightText"
            )
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(nightBg)
                    .clickable { onSlotSelected("nightpark") }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("🌙 NIGHTPARK", fontWeight = FontWeight.Black, color = nightText, fontSize = 12.sp, letterSpacing = 1.sp)
            }
        }
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
        val label = (DAY_LABELS[day] ?: day.take(3).uppercase()) + " · " + day.uppercase()
        BrutalistBadge(text = label, color = AcidYellow)
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
    var zoom    by remember { mutableStateOf(1f) }

    val baseHourWidth = 160f
    val hourWidth = baseHourWidth * zoom
    val trackHeight = 110f

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

    BoxWithConstraints(
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
        val screenWidth = maxWidth.value
        val screenHeight = maxHeight.value

        // ─── Main Content (Artists + Lines) ──────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    translationX = offsetX
                    translationY = offsetY
                }
        ) {
            // Hour Lines (Culled)
            (START_HOUR..END_HOUR).forEach { h ->
                val x = (h - START_HOUR) * hourWidth
                val isVisible = (x + offsetX) in -hourWidth..screenWidth + hourWidth
                if (isVisible) {
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .width(1.dp)
                            .absoluteOffset(x = x.dp)
                            .background(
                                Brush.verticalGradient(
                                    listOf(Color.White.copy(alpha = 0.15f), Color.Transparent),
                                    startY = 0f,
                                    endY = 1000f
                                )
                            )
                    )
                }
            }

            // Current Time Line
            val now = LocalTime.now()
            val today = LocalDate.now()
            if (today >= FESTIVAL_START && today <= FESTIVAL_END) {
                val currentX = getX("${now.hour}:${now.minute}")
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .width(2.dp)
                        .absoluteOffset(x = currentX.dp)
                        .background(ToxicGreen.copy(alpha = 0.6f))
                )
            }

            // Artist Blocks (Culled)
            byStage.forEachIndexed { stageIndex, entry ->
                val trackY = stageIndex * trackHeight + 40 // Offset for time header
                
                // Culling: check if stage track is vertically visible
                val isTrackVisible = (trackY + offsetY) in -trackHeight..screenHeight + trackHeight
                
                if (isTrackVisible) {
                    entry.value.forEach { artist ->
                        val x = getX(artist.startTime)
                        val endX = getX(artist.endTime)
                        val width = (endX - x).coerceAtLeast(60f)
                        
                        // Culling: check if artist block is horizontally visible
                        val isArtistVisible = (x + offsetX + width) > 0 && (x + offsetX) < screenWidth
                        
                        if (isArtistVisible) {
                            ArtistGridBlock(
                                artist = artist,
                                x = x,
                                y = trackY,
                                width = width,
                                blockHeight = trackHeight - 12,
                                isFavorite = favoriteIds.contains(artist.id),
                                inSquad = squadIds.contains(artist.id),
                                onArtistClick = onArtistClick,
                                haptic = haptic
                            )
                        }
                    }
                }
            }
        }

        // ─── FLOATING HEADERS ───────────────────────────────────────────────

        // Time Bar (Top Header)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(40.dp)
                .background(OLEDBlack.copy(alpha = 0.85f))
                .drawBehind {
                   drawLine(
                       color = Color.White.copy(alpha = 0.1f),
                       start = androidx.compose.ui.geometry.Offset(0f, size.height),
                       end = androidx.compose.ui.geometry.Offset(size.width, size.height),
                       strokeWidth = 1.dp.toPx()
                   )
                }
        ) {
            Box(modifier = Modifier.graphicsLayer { translationX = offsetX }) {
                (START_HOUR..END_HOUR).forEach { h ->
                    val x = (h - START_HOUR) * hourWidth
                    val isVisible = (x + offsetX) in -hourWidth..screenWidth + hourWidth
                    if (isVisible) {
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
        }

        // Stage Labels (Left Sidebar)
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .padding(top = 40.dp)
                .width(90.dp)
                .background(OLEDBlack.copy(alpha = 0.8f))
                .drawBehind {
                    drawLine(
                        color = Color.White.copy(alpha = 0.1f),
                        start = androidx.compose.ui.geometry.Offset(size.width, 0f),
                        end = androidx.compose.ui.geometry.Offset(size.width, size.height),
                        strokeWidth = 1.dp.toPx()
                    )
                }
        ) {
            Box(modifier = Modifier.graphicsLayer { translationY = offsetY }) {
                byStage.forEachIndexed { index, entry ->
                    val y = index * trackHeight
                    val isVisible = (y + offsetY) in -trackHeight..screenHeight + trackHeight
                    if (isVisible) {
                        Box(
                            modifier = Modifier
                                .absoluteOffset(y = y.dp)
                                .size(width = 90.dp, height = trackHeight.dp)
                                .padding(horizontal = 8.dp, vertical = 6.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Column {
                                Text(
                                    text = "STAGE",
                                    color = PrimaryMagenta.copy(alpha = 0.6f),
                                    fontSize = 7.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = entry.key.uppercase(),
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    lineHeight = 12.sp,
                                    maxLines = 3,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ArtistGridBlock(
    artist: Artist,
    x: Float,
    y: Float,
    width: Float,
    blockHeight: Float,
    isFavorite: Boolean,
    inSquad: Boolean,
    onArtistClick: (String) -> Unit,
    haptic: com.example.szigerinsider2026.ui.utils.HapticManager
) {
    val accentColor = when {
        isFavorite -> AcidYellow
        inSquad -> CyanPulse
        artist.isHeadliner -> PrimaryMagenta
        else -> Color.White.copy(alpha = 0.4f)
    }

    Box(
        modifier = Modifier
            .absoluteOffset(x = x.dp, y = y.dp)
            .width(width.dp)
            .height(blockHeight.dp)
            .padding(4.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .border(
                1.dp,
                accentColor.copy(alpha = if (isFavorite || inSquad || artist.isHeadliner) 0.6f else 0.1f),
                RoundedCornerShape(12.dp)
            )
            .clickable { haptic.lightTap(); onArtistClick(artist.id) }
    ) {
        // Progress background for headliners
        if (artist.isHeadliner) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(0.1f)
                    .background(PrimaryMagenta.copy(alpha = 0.05f))
            )
        }

        Row(
            modifier = Modifier.fillMaxSize().padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Minimal Thumbnail
            if (width > 80f) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MutedBackground)
                ) {
                    if (artist.imageUrl != null) {
                        AsyncImage(
                            model = artist.imageUrl,
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(artist.artist.take(1), color = Color.White.copy(alpha = 0.2f), fontWeight = FontWeight.Black)
                        }
                    }
                }
                Spacer(modifier = Modifier.width(10.dp))
            }

            Column(modifier = Modifier.weight(1f)) {
                if (artist.isHeadliner) {
                    Text(
                        text = "MAIN STAGE HEADLINER",
                        color = PrimaryMagenta,
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }
                Text(
                    text = artist.artist.uppercase(),
                    color = if (isFavorite) AcidYellow else Color.White,
                    fontWeight = FontWeight.Black,
                    fontSize = if (artist.isHeadliner) 13.sp else 11.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 13.sp,
                    letterSpacing = (-0.2).sp
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "${artist.startTime} - ${artist.endTime}",
                        color = TextMuted,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Medium
                    )
                    if (isFavorite || inSquad) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isFavorite) "★" else "👥",
                            color = if (isFavorite) AcidYellow else CyanPulse,
                            fontSize = 8.sp
                        )
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
    clashPair: ClashPair?,
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

    NeonCard(
        onClick = onClick,
        accentColor = accentColor
    ) {
        Box {
            Row(verticalAlignment = Alignment.CenterVertically) {
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
                        BrutalistBadge(text = dayShort, color = AcidYellow)
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
                            BrutalistBadge(text = "HEADLINER", color = PrimaryMagenta)
                        }
                        if (nowPlaying) {
                            BrutalistBadge(text = "LIVE NOW", color = ToxicGreen)
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
            if (clashPair != null) {
                val color = if (clashPair.type == ClashType.HARD) ClashBadgeColor else CyanPulse
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(top = 0.dp, end = 0.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(color)
                        .padding(horizontal = 5.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = if (clashPair.type == ClashType.HARD) "⚡" else "⚠️",
                        fontSize = 10.sp,
                        color = if (clashPair.type == ClashType.HARD) Color.White else Color.Black
                    )
                }
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
                val isHard = clash.type == ClashType.HARD
                val color = if (isHard) ClashBadgeColor else CyanPulse
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    BrutalistBadge(
                        text = if (isHard) "HARD CLASH" else "TIGHT TRANSITION",
                        color = color,
                        isOutlined = true
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "${clash.a.artist} vs ${clash.b.artist}",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    if (!isHard) {
                        Text(
                            text = "${clash.gapMinutes} MINS GAP",
                            color = TextMuted,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
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
                BrutalistHeader(
                    title = "SQUAD LINK",
                    subtitle = "Have a friend scan this to merge your lineups."
                )
                
                Spacer(modifier = Modifier.height(24.dp))

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

                BrutalistButton(
                    text = "CLOSE",
                    onClick = onDismiss,
                    color = Color.White.copy(alpha = 0.05f),
                    textColor = Color.White,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

@androidx.compose.material3.ExperimentalMaterial3Api
@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
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
                 BrutalistBadge(text = (artist.stage ?: "MAIN STAGE").uppercase(), color = PrimaryMagenta)
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
                        BrutalistBadge(text = genre, color = Color.White, isOutlined = true)
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Action Button
            BrutalistButton(
                text = if (isFavorite) "REMOVE FROM LINEUP" else "ADD TO MY LINEUP",
                onClick = onToggleFavorite,
                color = if (isFavorite) RedWarning.copy(alpha = 0.2f) else ToxicGreen,
                textColor = if (isFavorite) RedWarning else OLEDBlack,
                modifier = Modifier.fillMaxWidth()
            )
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
