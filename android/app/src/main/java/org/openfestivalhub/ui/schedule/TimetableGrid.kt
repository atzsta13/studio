package org.openfestivalhub.ui.schedule

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculateCentroid
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import org.openfestivalhub.data.config.FestivalConfig
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.ui.components.BrutalistHeader
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.utils.formatTime
import org.openfestivalhub.ui.utils.parseTime
import org.openfestivalhub.ui.utils.rememberHapticManager
import java.time.LocalDate
import java.time.LocalTime

// Hours before this are treated as "past midnight" and belong to the previous festival day.
private const val ROLLOVER_HOUR = 6
private val GUTTER_WIDTH = TimetableZoom.GUTTER_DP.dp
private val HEADER_HEIGHT = TimetableZoom.HEADER_DP.dp
// Height of the fixed bottom navigation bar (BottomNavigation, 72dp + border).
private val BOTTOM_NAV_INSET = 76.dp

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

/**
 * The zoomable timetable grid: time down the Y axis, stages across the X axis,
 * scrolling on both at once.
 *
 * Panning is done by real `verticalScroll`/`horizontalScroll` state rather than
 * hand-managed translation offsets — that buys correct clamping, fling physics
 * and overscroll for free, and lets the stage header and time gutter stay
 * pinned by sharing the board's scroll state. Zoom only ever changes dp sizes
 * (`dpPerMinute`, `colWidth`), never a `graphicsLayer` scale, so text stays
 * crisp and touch targets stay honest at every zoom level.
 */
@Composable
fun TimetableGrid(
    dayArtists: List<Artist>,
    selectedDay: String,
    favoriteIds: Set<String>,
    squadIds: Set<String> = emptySet(),
    searchQuery: String = "",
    minuteTick: Long = 0L,
    onArtistClick: (String) -> Unit,
    onToggleFavorite: (String) -> Unit
) {
    val haptic = rememberHapticManager()
    val byStage = remember(dayArtists) {
        dayArtists.filter { wallMinutes(it.startTime) != null && wallMinutes(it.endTime) != null }
            .groupBy { it.stage ?: "Other" }.entries
            // Main/blue stage first, then alphabetical — same order as the web grid.
            .sortedWith(
                compareBy(
                    { if (it.key.contains("main", true) || it.key.contains("blue", true)) 0 else 1 },
                    { it.key.lowercase() }
                )
            )
    }

    if (byStage.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize().padding(horizontal = 32.dp), contentAlignment = Alignment.Center) {
            if (searchQuery.isNotBlank()) {
                BrutalistHeader(title = "NO ARTISTS MATCH", subtitle = "No acts named \"${searchQuery.trim()}\" on this day.")
            } else {
                BrutalistHeader(title = "NO STAGE TIMES YET", subtitle = "The schedule for this day has not been published.")
            }
        }
        return
    }

    // Whole-hour bounds of the day, from a single pass over its slots.
    val (dayStart, dayEnd) = remember(byStage) {
        var first = Int.MAX_VALUE
        var last = Int.MIN_VALUE
        byStage.forEach { entry ->
            entry.value.forEach { artist ->
                wallMinutes(artist.startTime)?.let { if (it < first) first = it }
                wallMinutes(artist.endTime)?.let { if (it > last) last = it }
            }
        }
        if (first == Int.MAX_VALUE) 720 to 1440
        else (first / 60 * 60) to ((last + 59) / 60 * 60)
    }
    val totalMinutes = dayEnd - dayStart

    val context = LocalContext.current
    val festivalId = FestivalConfig.current.id
    val prefs = remember { context.getSharedPreferences("timetable_prefs", android.content.Context.MODE_PRIVATE) }
    val storedZoom = remember(festivalId) { TimetableZoom.load(prefs, festivalId) }

    var zoom by remember(festivalId) { mutableFloatStateOf(storedZoom ?: 1f) }
    // Until the user zooms deliberately, every day is fitted to the screen width.
    var userZoomed by remember(festivalId) { mutableStateOf(storedZoom != null) }

    val hScroll = rememberScrollState()
    val vScroll = rememberScrollState()
    val density = LocalDensity.current

    // Scroll positions that keep the content under the zoom focal point in
    // place. They can only be applied once the board has been re-laid out at
    // the new scale, so they are staged here and consumed a frame later.
    var pendingScroll by remember { mutableStateOf<IntOffset?>(null) }

    val dpPerMinute = TimetableZoom.BASE_DP_PER_MINUTE * zoom
    val boardHeight = (totalMinutes * dpPerMinute).dp

    val nowMinutes = remember(selectedDay, dayStart, dayEnd, minuteTick) {
        val now = LocalTime.now()
        val mins = now.hour * 60 + now.minute + if (now.hour < ROLLOVER_HOUR) 24 * 60 else 0
        val effectiveDate = if (now.hour < ROLLOVER_HOUR) LocalDate.now().minusDays(1) else LocalDate.now()
        if (DAY_TO_DATE[selectedDay] == effectiveDate && mins in dayStart..dayEnd) mins else null
    }

    BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val availableWidth = maxWidth
        val availableHeight = maxHeight
        val colWidth = TimetableZoom.columnWidthDp(zoom, byStage.size, availableWidth.value).dp
        val stagesWidth = colWidth * byStage.size
        val gutterPx = with(density) { GUTTER_WIDTH.toPx() }

        fun zoomTo(target: Float, focalXPx: Float, focalYPx: Float) {
            val next = TimetableZoom.clamp(target)
            if (next == zoom) return
            pendingScroll = IntOffset(
                TimetableZoom.anchoredScroll(zoom, next, focalXPx - gutterPx, hScroll.value.toFloat()).toInt(),
                TimetableZoom.anchoredScroll(zoom, next, focalYPx, vScroll.value.toFloat()).toInt()
            )
            zoom = next
            userZoomed = true
            TimetableZoom.save(prefs, festivalId, next)
        }

        LaunchedEffect(zoom) {
            val target = pendingScroll ?: return@LaunchedEffect
            pendingScroll = null
            // Wait for the frame that lays the board out at the new scale,
            // otherwise scrollTo clamps against the old content size.
            withFrameNanos { }
            hScroll.scrollTo(target.x)
            vScroll.scrollTo(target.y)
        }

        LaunchedEffect(selectedDay, byStage.size, availableWidth) {
            if (!userZoomed) {
                // Only ever zoom *out* to fit: a one-stage day would otherwise
                // fit to 230% and render a single five-hour card 1500dp tall.
                zoom = minOf(1f, TimetableZoom.fitWidth(availableWidth.value, byStage.size))
                hScroll.scrollTo(0)
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                // Pinch only. Single-pointer events are left unconsumed so the
                // scroll modifiers below keep handling pan and fling.
                .pointerInput(Unit) {
                    awaitEachGesture {
                        awaitFirstDown(requireUnconsumed = false)
                        do {
                            val event = awaitPointerEvent()
                            if (event.changes.count { it.pressed } >= 2) {
                                val gestureZoom = event.calculateZoom()
                                if (gestureZoom != 1f) {
                                    val centroid = event.calculateCentroid()
                                    zoomTo(zoom * gestureZoom, centroid.x, centroid.y)
                                    event.changes.forEach { it.consume() }
                                }
                            }
                        } while (event.changes.any { it.pressed })
                    }
                }
        ) {
            // Stage header — pinned vertically, and horizontally slaved to the
            // board's scroll state so the labels track their columns exactly.
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(HEADER_HEIGHT)
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
                Row(modifier = Modifier.horizontalScroll(hScroll, enabled = false)) {
                    byStage.forEach { entry ->
                        Box(
                            modifier = Modifier.width(colWidth).height(HEADER_HEIGHT).padding(horizontal = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                // A single ellipsis is noise: drop the label when
                                // the column is too narrow for any of it.
                                text = if (colWidth.value < 34f) "" else entry.key.uppercase(),
                                color = MaterialTheme.colorScheme.primary,
                                fontSize = if (colWidth.value < 110f) 8.sp else 11.sp,
                                fontWeight = FontWeight.Black,
                                fontStyle = FontStyle.Italic,
                                letterSpacing = 1.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            // Keep the board clear of the fixed bottom nav so the last sets of
            // the night are never hidden behind it.
            Box(modifier = Modifier.weight(1f).padding(bottom = BOTTOM_NAV_INSET)) {
                Row(modifier = Modifier.fillMaxSize().verticalScroll(vScroll)) {
                    // Time gutter — scrolls with the board vertically, pinned
                    // horizontally because it sits outside the horizontal scroller.
                    Box(
                        modifier = Modifier
                            .width(GUTTER_WIDTH)
                            .height(boardHeight)
                            .background(OLEDBlack)
                    ) {
                        val labelStep = TimetableZoom.labelStepHours(dpPerMinute)
                        var hourMark = dayStart
                        var index = 0
                        while (hourMark <= dayEnd) {
                            if (index % labelStep == 0) {
                                Text(
                                    text = formatWallMinutes(hourMark),
                                    color = TextMuted,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    modifier = Modifier.offset(
                                        x = 5.dp,
                                        y = ((hourMark - dayStart) * dpPerMinute).dp - 7.dp
                                    )
                                )
                            }
                            hourMark += 60
                            index++
                        }
                    }

                    Box(modifier = Modifier.horizontalScroll(hScroll)) {
                        Box(modifier = Modifier.width(stagesWidth).height(boardHeight)) {
                            var hourMark = dayStart
                            while (hourMark <= dayEnd) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(1.dp)
                                        .offset(y = ((hourMark - dayStart) * dpPerMinute).dp)
                                        .background(Color.White.copy(alpha = 0.08f))
                                )
                                hourMark += 60
                            }

                            Row(modifier = Modifier.fillMaxSize()) {
                                byStage.forEach { entry ->
                                    Box(modifier = Modifier.width(colWidth).fillMaxHeight()) {
                                        entry.value.forEach { artist ->
                                            val start = wallMinutes(artist.startTime) ?: return@forEach
                                            val end = wallMinutes(artist.endTime) ?: (start + 30)
                                            ArtistGridBlock(
                                                artist = artist,
                                                y = (start - dayStart) * dpPerMinute,
                                                blockHeight = ((end - start) * dpPerMinute).coerceAtLeast(6f),
                                                blockWidth = colWidth.value,
                                                isFavorite = favoriteIds.contains(artist.id),
                                                inSquad = squadIds.contains(artist.id),
                                                isPast = nowMinutes != null && end <= nowMinutes,
                                                minuteTick = minuteTick,
                                                onArtistClick = onArtistClick,
                                                haptic = haptic
                                            )
                                        }
                                    }
                                }
                            }

                            nowMinutes?.let { mins ->
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(2.dp)
                                        .offset(y = ((mins - dayStart) * dpPerMinute).dp - 1.dp)
                                        .background(ToxicGreen)
                                )
                            }
                        }
                    }
                }

                ZoomControls(
                    zoom = zoom,
                    onZoomIn = {
                        haptic.lightTap()
                        zoomTo(zoom * TimetableZoom.ZOOM_STEP, availableWidth.value * density.density / 2f, availableHeight.value * density.density / 2f)
                    },
                    onZoomOut = {
                        haptic.lightTap()
                        zoomTo(zoom / TimetableZoom.ZOOM_STEP, availableWidth.value * density.density / 2f, availableHeight.value * density.density / 2f)
                    },
                    onFit = {
                        haptic.lightTap()
                        pendingScroll = IntOffset.Zero
                        zoom = TimetableZoom.fit(
                            containerWidthDp = availableWidth.value,
                            containerHeightDp = availableHeight.value - BOTTOM_NAV_INSET.value,
                            stageCount = byStage.size,
                            totalMinutes = totalMinutes
                        )
                        userZoomed = true
                        TimetableZoom.save(prefs, festivalId, zoom)
                    },
                    modifier = Modifier.align(Alignment.BottomEnd).padding(end = 12.dp, bottom = 24.dp)
                )
            }
        }
    }
}

@Composable
private fun ZoomControls(
    zoom: Float,
    onZoomIn: () -> Unit,
    onZoomOut: () -> Unit,
    onFit: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(CardBackground.copy(alpha = 0.94f))
            .border(1.dp, Color.White.copy(alpha = 0.10f), RoundedCornerShape(14.dp))
            .padding(horizontal = 4.dp, vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        ZoomControlButton(label = "−", onClick = onZoomOut, contentDescription = "Zoom out")
        Text(
            text = "${(zoom * 100).toInt()}%",
            color = TextMuted,
            fontSize = 10.sp,
            fontWeight = FontWeight.Black,
            modifier = Modifier.width(38.dp),
            maxLines = 1
        )
        ZoomControlButton(label = "+", onClick = onZoomIn, contentDescription = "Zoom in")
        Box(
            modifier = Modifier
                .padding(start = 2.dp)
                .clip(RoundedCornerShape(10.dp))
                .clickable(onClickLabel = "Fit whole day on screen", onClick = onFit)
                .padding(horizontal = 10.dp, vertical = 8.dp)
        ) {
            Text("FIT", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        }
    }
}

@Composable
private fun ZoomControlButton(label: String, onClick: () -> Unit, contentDescription: String) {
    Box(
        modifier = Modifier
            .size(34.dp)
            .clip(CircleShape)
            .clickable(onClickLabel = contentDescription, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(label, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
private fun ArtistGridBlock(
    artist: Artist,
    y: Float,
    blockHeight: Float,
    blockWidth: Float,
    isFavorite: Boolean,
    inSquad: Boolean,
    isPast: Boolean = false,
    minuteTick: Long = 0L,
    onArtistClick: (String) -> Unit,
    haptic: org.openfestivalhub.ui.utils.HapticManager
) {
    val isLive = remember(artist, minuteTick) { isNowPlaying(artist) }
    val dimmed = isPast && !isFavorite && !inSquad && !isLive
    val accentColor = when {
        isFavorite -> MaterialTheme.colorScheme.secondary
        inSquad -> CyanPulse
        isLive -> ToxicGreen
        artist.isHeadliner -> MaterialTheme.colorScheme.primary
        else -> Color.White.copy(alpha = 0.2f)
    }
    val tier = TimetableZoom.densityTier(blockHeight)
    val isNarrow = blockWidth < 130f

    // Zoomed all the way out there is no room for a single readable character,
    // so the slot becomes a colour-coded block: the day's shape at a glance.
    if (TimetableZoom.isBlock(blockWidth, blockHeight)) {
        Box(
            modifier = Modifier
                .offset(y = y.dp)
                .fillMaxWidth()
                .height(blockHeight.dp)
                .padding(horizontal = 1.dp, vertical = 1.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(
                    if (isFavorite || inSquad || isLive || artist.isHeadliner) accentColor
                    else Color.White.copy(alpha = 0.22f)
                )
                .graphicsLayer { alpha = if (dimmed) 0.3f else 1f }
                .clickable { haptic.lightTap(); onArtistClick(artist.id) }
        )
        return
    }

    Box(
        modifier = Modifier
            .offset(y = y.dp)
            .fillMaxWidth()
            .height(blockHeight.dp)
            .graphicsLayer { alpha = if (dimmed) 0.45f else 1f }
            .padding(horizontal = 2.dp, vertical = 1.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(if (isLive) CardBackground.copy(alpha = 0.9f) else CardBackground)
            .border(
                width = if (isFavorite || isLive || artist.isHeadliner) 1.5.dp else 1.dp,
                color = accentColor.copy(alpha = if (isFavorite || isLive || artist.isHeadliner) 0.8f else 0.15f),
                shape = RoundedCornerShape(8.dp)
            )
            .clickable { haptic.lightTap(); onArtistClick(artist.id) }
    ) {
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

        if (artist.imageUrl != null && tier == TimetableZoom.Tier.FULL && !isNarrow &&
            (isFavorite || artist.isHeadliner)
        ) {
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = null,
                modifier = Modifier.fillMaxSize().graphicsLayer { alpha = 0.15f },
                contentScale = ContentScale.Crop
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = if (tier == TimetableZoom.Tier.TINY) 3.dp else 6.dp, vertical = 3.dp)
        ) {
            if (tier != TimetableZoom.Tier.TINY) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (isLive) {
                        Box(modifier = Modifier.padding(end = 4.dp).size(4.dp).clip(CircleShape).background(ToxicGreen))
                    }
                    Spacer(modifier = Modifier.weight(1f))
                    if (isFavorite) {
                        Icon(
                            Icons.Filled.Star,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
            }

            Text(
                text = artist.artist.uppercase(),
                color = if (isFavorite) MaterialTheme.colorScheme.secondary else Color.White,
                fontWeight = FontWeight.Black,
                fontSize = when (tier) {
                    TimetableZoom.Tier.TINY -> 9.sp
                    TimetableZoom.Tier.SMALL -> 11.sp
                    TimetableZoom.Tier.FULL -> 12.sp
                },
                // Wrapping beats "DAY OF BROD…" when a column is narrow, but a
                // slot only one line tall has to stay on one line.
                maxLines = when (tier) {
                    TimetableZoom.Tier.TINY -> 1
                    TimetableZoom.Tier.SMALL -> 2
                    TimetableZoom.Tier.FULL -> 3
                },
                overflow = TextOverflow.Ellipsis,
                lineHeight = 12.sp,
                letterSpacing = (-0.2).sp,
                fontStyle = FontStyle.Italic
            )

            if (tier == TimetableZoom.Tier.FULL && !isNarrow) {
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    text = "${formatTime(artist.startTime)} - ${formatTime(artist.endTime)}",
                    color = if (isLive) ToxicGreen.copy(alpha = 0.7f) else TextMuted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp,
                    maxLines = 1
                )
            }
        }
    }
}

