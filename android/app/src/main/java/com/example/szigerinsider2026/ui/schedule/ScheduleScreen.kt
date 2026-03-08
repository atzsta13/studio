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
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

// ─── Constants ───────────────────────────────────────────────────────────────

private val DAY_ORDER = listOf(
    "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday"
)
private val DAY_LABELS = mapOf(
    "Wednesday" to "WED", "Thursday" to "THU", "Friday" to "FRI",
    "Saturday" to "SAT", "Sunday" to "SUN", "Monday" to "MON", "Tuesday" to "TUE"
)

/** Festival calendar dates for 2026. */
private val DAY_TO_DATE: Map<String, LocalDate> = mapOf(
    "Wednesday" to LocalDate.of(2026, 8, 6),
    "Thursday"  to LocalDate.of(2026, 8, 7),
    "Friday"    to LocalDate.of(2026, 8, 8),
    "Saturday"  to LocalDate.of(2026, 8, 9),
    "Sunday"    to LocalDate.of(2026, 8, 10),
    "Monday"    to LocalDate.of(2026, 8, 11),
    "Tuesday"   to LocalDate.of(2026, 8, 12)
)

private val FESTIVAL_START = LocalDate.of(2026, 8, 6)
private val FESTIVAL_END   = LocalDate.of(2026, 8, 12)

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

private enum class ScheduleTab { ALL, MY_LINEUP }

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
        allArtists.mapNotNull { it.day }.distinct()
            .sortedBy { DAY_ORDER.indexOf(it).let { i -> if (i == -1) 99 else i } }
    }

    var selectedDay by remember(availableDays) { mutableStateOf(availableDays.firstOrNull() ?: "") }
    var activeTab  by remember { mutableStateOf(ScheduleTab.ALL) }

    // ── ALL tab data ─────────────────────────────────────────────────────────
    val dayArtists = remember(allArtists, selectedDay) {
        allArtists
            .filter { it.day?.equals(selectedDay, ignoreCase = true) == true }
            .sortedWith(
                compareByDescending<Artist> { it.isHeadliner }
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
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(top = 20.dp, bottom = 12.dp)
        ) {
            // Back button — floats top-left
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(CardBackground)
                    .border(1.dp, Color.White.copy(alpha = 0.10f), CircleShape)
                    .clickable { haptic.lightTap(); onBack() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Title — centred in box
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "SCHEDULE",
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    color = Color.White,
                    letterSpacing = (-1.5).sp,
                    lineHeight = 34.sp
                )
                Text(
                    text = "Aug 6 – 11 · Budapest · Óbudai-sziget",
                    color = TextMuted,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }

        // ── Day tabs ─────────────────────────────────────────────────────────
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.padding(bottom = 10.dp)
        ) {
            items(availableDays) { day ->
                val isSelected = day == selectedDay && activeTab == ScheduleTab.ALL
                val bgColor by animateColorAsState(
                    targetValue = if (isSelected) AcidYellow else Color.White.copy(alpha = 0.05f),
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
                        .clip(RoundedCornerShape(16.dp))
                        .background(bgColor)
                        .clickable {
                            haptic.lightTap()
                            selectedDay = day
                            activeTab = ScheduleTab.ALL
                        }
                        .padding(horizontal = 18.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = DAY_LABELS[day] ?: day.take(3).uppercase(),
                        fontWeight = FontWeight.Black,
                        color = textColor,
                        fontSize = 12.sp,
                        letterSpacing = 1.sp
                    )
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
            ScheduleTab.ALL -> {
                // Artist count label
                Text(
                    text = "${dayArtists.size} ARTISTS · $selectedDay".uppercase(),
                    color = TextMuted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 4.dp)
                )

                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    byStage.forEach { (stage, artists) ->
                        item(key = "header_$stage") {
                            StageHeader(stage = stage)
                        }
                        items(artists, key = { it.id }) { artist ->
                            ScheduleRow(
                                artist = artist,
                                isFavorite = favoriteIds.contains(artist.id),
                                onToggleFavorite = { artistViewModel.toggleFavorite(artist.id) },
                                onClick = { onArtistClick(artist.id) },
                                hapticTap = { haptic.lightTap() },
                                showClashBadge = false,
                                showDayBadge = false
                            )
                        }
                    }
                    item { Spacer(modifier = Modifier.height(100.dp)) }
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
                                    isFavorite = favoriteIds.contains(artist.id),
                                    onToggleFavorite = { artistViewModel.toggleFavorite(artist.id) },
                                    onClick = { onArtistClick(artist.id) },
                                    hapticTap = { haptic.lightTap() },
                                    showClashBadge = clashedArtistIds.contains(artist.id),
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
            listOf(ScheduleTab.ALL to "ALL", ScheduleTab.MY_LINEUP to "MY LINEUP").forEach { (tab, label) ->
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

// ─── Clash banner ─────────────────────────────────────────────────────────────

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
                            .background(ClashBannerBorder.copy(alpha = 0.6f))
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

// ─── Schedule row ─────────────────────────────────────────────────────────────

@Composable
private fun ScheduleRow(
    artist: Artist,
    isFavorite: Boolean,
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
                        alpha = if (nowPlaying || artist.isHeadliner || isFavorite) 0.35f else 0.04f
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
