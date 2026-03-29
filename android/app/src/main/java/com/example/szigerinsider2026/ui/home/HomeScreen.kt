package com.example.szigerinsider2026.ui.home

import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
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
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import androidx.compose.material3.TextButton
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupDiffRepository
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import kotlinx.coroutines.delay
import java.util.Calendar
import java.util.TimeZone
import com.example.szigerinsider2026.data.config.FestivalConfig

private val FESTIVAL_START_MS: Long by lazy {
    Calendar.getInstance(TimeZone.getTimeZone(FestivalConfig.TIMEZONE)).apply {
        set(FestivalConfig.START_YEAR, FestivalConfig.CALENDAR_START_MONTH, FestivalConfig.START_DAY, 12, 0, 0)
        set(Calendar.MILLISECOND, 0)
    }.timeInMillis
}

private data class CountdownState(val days: Long, val hours: Long, val minutes: Long, val seconds: Long)

private fun calcCountdown(): CountdownState {
    val diff = (FESTIVAL_START_MS - System.currentTimeMillis()).coerceAtLeast(0L)
    val days = diff / 86_400_000L
    val hours = (diff % 86_400_000L) / 3_600_000L
    val minutes = (diff % 3_600_000L) / 60_000L
    val seconds = (diff % 60_000L) / 1_000L
    return CountdownState(days, hours, minutes, seconds)
}

/**
 * Returns the relevant festival day name based on the current date:
 * - Before Aug 6 2026  -> "Wednesday"
 * - During festival    -> today's matching day name
 * - After Aug 12 2026  -> "Tuesday"
 */
private fun getFestivalDay(): String {
    val now = Calendar.getInstance(TimeZone.getTimeZone(FestivalConfig.TIMEZONE))
    val year = now.get(Calendar.YEAR)
    val month = now.get(Calendar.MONTH)   // 0-indexed
    val dom = now.get(Calendar.DAY_OF_MONTH)

    if (year < FestivalConfig.START_YEAR || (year == FestivalConfig.START_YEAR && month < FestivalConfig.CALENDAR_START_MONTH)) return FestivalConfig.DAYS.first()
    if (year > FestivalConfig.START_YEAR || (year == FestivalConfig.START_YEAR && month > FestivalConfig.CALENDAR_START_MONTH)) return FestivalConfig.DAYS.last()
    return when {
        dom < FestivalConfig.START_DAY -> FestivalConfig.DAYS.first()
        dom > FestivalConfig.END_DAY   -> FestivalConfig.DAYS.last()
        else -> FestivalConfig.DAYS[dom - FestivalConfig.START_DAY]
    }
}

/**
 * Returns true if the artist is currently live based on device clock vs festival dates/times.
 */
private fun isArtistLive(artist: Artist): Boolean {
    val day = artist.day ?: return false
    val startTime = artist.startTime ?: return false
    val endTime = artist.endTime ?: return false

    val festDate = FestivalConfig.DAY_CALENDAR_DATES[day] ?: return false

    val now = Calendar.getInstance(TimeZone.getTimeZone(FestivalConfig.TIMEZONE))
    val year = now.get(Calendar.YEAR)
    val month = now.get(Calendar.MONTH)
    val dom = now.get(Calendar.DAY_OF_MONTH)
    val currentHour = now.get(Calendar.HOUR_OF_DAY)
    val currentMin = now.get(Calendar.MINUTE)

    if (year != FestivalConfig.START_YEAR || month != festDate.first || dom != festDate.second) return false

    // Parse "HH:MM" strings
    return try {
        val (startH, startM) = startTime.split(":").map { it.toInt() }
        val (endH, endM) = endTime.split(":").map { it.toInt() }
        val nowMinutes = currentHour * 60 + currentMin
        val startMinutes = startH * 60 + startM
        val endMinutes = endH * 60 + endM
        nowMinutes in startMinutes until endMinutes
    } catch (e: Exception) {
        false
    }
}

@Composable
fun HomeScreen(navController: NavController? = null) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val repository = remember { LineupRepository(context) }
    val db = remember { AppDatabase.getDatabase(context) }

    var countdown by remember { mutableStateOf(calcCountdown()) }
    var allArtists by remember { mutableStateOf<List<Artist>>(emptyList()) }
    var favoriteArtistIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    var showDiffSheet by remember { mutableStateOf(false) }
    var newArtistPreview by remember { mutableStateOf<List<Artist>>(emptyList()) }

    LaunchedEffect(Unit) {
        allArtists = repository.getLineup()
    }

    LaunchedEffect(Unit) {
        db.userDao().getAllFavorites().collect { favs ->
            favoriteArtistIds = favs.map { it.artistId }.toSet()
        }
    }

    LaunchedEffect(Unit) {
        while (true) {
            countdown = calcCountdown()
            delay(1000L)
        }
    }

    LaunchedEffect(Unit) {
        val diff = LineupDiffRepository(context).computeDiff()
        newArtistPreview = diff.newArtists.take(4)
    }

    val festivalDay = remember { getFestivalDay() }

    val headliner = remember(allArtists) { allArtists.firstOrNull { it.isHeadliner } }
    val nowPlaying = remember(allArtists, festivalDay) {
        allArtists.filter { it.day == festivalDay }.take(3)
    }
    val favoriteArtists = remember(allArtists, favoriteArtistIds) {
        allArtists.filter { favoriteArtistIds.contains(it.id) }
    }

    // Animated gradient for countdown card
    val countdownGradientTransition = rememberInfiniteTransition(label = "countdownGradient")
    val countdownAnimFloat by countdownGradientTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "countdownGradientFloat"
    )

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(OLEDBlack),
        contentPadding = PaddingValues(bottom = 120.dp)
    ) {
        // Top label
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "${FestivalConfig.NAME.uppercase()} ${FestivalConfig.current.year}",
                        style = BrutalistTypography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        letterSpacing = 3.sp
                    )
                    Text(
                        text = FestivalConfig.current.tagline,
                        color = TextMuted,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Row(modifier = Modifier.padding(top = 4.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "L-LEVEL: ALPHA_2.3",
                            color = PrimaryMagenta.copy(alpha = 0.5f),
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "SYS_AUTH: APPROVED",
                            color = ToxicGreen.copy(alpha = 0.5f),
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
                }
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(PrimaryMagenta.copy(alpha = 0.1f))
                        .border(1.dp, PrimaryMagenta.copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = PrimaryMagenta, modifier = Modifier.size(18.dp))
                }
            }
        }

        // Countdown card — animated shimmer gradient
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 16.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(Color(0xFF6C3CE1), PrimaryMagenta, Color(0xFF6C3CE1)),
                            start = Offset(countdownAnimFloat * 500f, 0f),
                            end = Offset(countdownAnimFloat * 500f + 500f, 500f)
                        )
                    )
                    .padding(28.dp)
            ) {
                Column {
                    Text(
                        text = "COUNTDOWN TO ${FestivalConfig.NAME.uppercase()}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 3.sp,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        CountdownUnit(countdown.days, "DAYS")
                        CountdownUnit(countdown.hours, "HRS")
                        CountdownUnit(countdown.minutes, "MIN")
                        CountdownUnit(countdown.seconds, "SEC")
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = FestivalConfig.DATE_DISPLAY,
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // Weather widget — between countdown and lineup
        item {
            WeatherCard()
        }

        // Favorites strip
        item {
            SectionHeader(title = "YOUR LINEUP", count = favoriteArtists.size.takeIf { it > 0 })
        }
        item {
            if (favoriteArtists.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(CardBackground)
                        .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(20.dp))
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Star artists to build your lineup",
                        color = TextMuted,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            } else {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.padding(bottom = 8.dp)
                ) {
                    items(favoriteArtists) { artist ->
                        FavoriteArtistChip(artist)
                    }
                }
            }
        }

        // Headliner spotlight
        headliner?.let { artist ->
            item { SectionHeader(title = "HEADLINER SPOTLIGHT") }
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .padding(bottom = 16.dp)
                        .height(240.dp)
                        .clip(RoundedCornerShape(32.dp))
                ) {
                    AsyncImage(
                        model = artist.imageUrl,
                        contentDescription = artist.artist,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                    Box(
                        modifier = Modifier.fillMaxSize().background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f))
                            )
                        )
                    )
                    Column(
                        modifier = Modifier.align(Alignment.BottomStart).padding(24.dp)
                    ) {
                        Text(
                            text = "HEADLINER",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 3.sp,
                            color = AcidYellow
                        )
                        Text(
                            text = artist.artist.uppercase(),
                            fontSize = 30.sp,
                            fontWeight = FontWeight.Black,
                            fontStyle = FontStyle.Italic,
                            color = Color.White,
                            lineHeight = 32.sp
                        )
                        if (artist.day != null) {
                            Text(
                                text = artist.day.uppercase(),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White.copy(alpha = 0.6f),
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }
                    }
                }
            }
        }

        // Island Pulse — dynamic day
        item {
            val stage = nowPlaying.firstOrNull()?.stage ?: "Main Stage"
            SectionHeader(
                title = "${FestivalConfig.NAME.uppercase()} PULSE",
                subtitle = "$festivalDay · $stage"
            )
        }
        items(nowPlaying) { artist ->
            IslandPulseRow(artist)
        }

        // NEW THIS YEAR section
        if (newArtistPreview.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(24.dp))
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("NEW THIS YEAR", color = ToxicGreen, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp)
                        Text("2026 ARRIVALS", color = TextMuted, fontSize = 13.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic)
                    }
                    TextButton(onClick = { haptic.lightTap(); showDiffSheet = true }) {
                        Text("SEE ALL →", color = AcidYellow, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 20.dp)
                ) {
                    items(newArtistPreview) { artist ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(CardBackground)
                                .border(1.dp, ToxicGreen.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                                .clickable { haptic.lightTap(); navController?.navigate("artist/${artist.id}") }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = artist.countryCode?.let { code ->
                                        val offset = 0x1F1E6 - 'A'.code
                                        code.uppercase().map { String(Character.toChars(it.code + offset)) }.joinToString("")
                                    } ?: "🌐",
                                    fontSize = 14.sp
                                )
                                Text(artist.artist, color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Black)
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(ToxicGreen.copy(alpha = 0.2f))
                                        .padding(horizontal = 4.dp, vertical = 1.dp)
                                ) {
                                    Text("NEW", color = ToxicGreen, fontSize = 9.sp, fontWeight = FontWeight.Black)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Quick nav
        item {
            Spacer(modifier = Modifier.height(8.dp))
            SectionHeader(title = "EXPLORE")
        }
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                QuickNavCard("MAP", Icons.Default.LocationOn, CyanPulse, Modifier.weight(1f)) { navController?.navigate("map") }
                QuickNavCard("PASSPORT", Icons.Default.EmojiEvents, PrimaryMagenta, Modifier.weight(1f)) { navController?.navigate("passport") }
            }
        }
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                QuickNavCard("TOOLS", Icons.Default.Build, ToxicGreen, Modifier.weight(1f)) { navController?.navigate("tools") }
                QuickNavCard("SCHEDULE", Icons.Default.Schedule, AcidYellow, Modifier.weight(1f)) { navController?.navigate("schedule") }
            }
        }
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                QuickNavCard("VIBE QUIZ", Icons.Default.AutoAwesome, PrimaryMagenta, Modifier.fillMaxWidth()) { navController?.navigate("vibe_quiz") }
            }
        }
    }

    if (showDiffSheet) {
        LineupDiffSheet(
            onDismiss = { showDiffSheet = false },
            onArtistClick = { id -> navController?.navigate("artist/$id") }
        )
    }
}

@Composable
private fun WeatherCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(bottom = 4.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(Color(0xFF1A1A1A), OLEDBlack)
                )
            )
            .border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(24.dp))
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        Column {
            // Top label
            Text(
                text = "${FestivalConfig.current.city.uppercase()} FORECAST",
                fontSize = 8.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 3.sp,
                color = TextMuted
            )
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left — temperature + icon
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "28°C",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black,
                            color = AcidYellow
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.WbSunny,
                            contentDescription = "Sunny",
                            tint = AcidYellow,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Sunny · Perfect festival weather",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextMuted
                    )
                }

                // Right — stats column
                Column(horizontalAlignment = Alignment.End) {
                    WeatherStat("UV INDEX", "8")
                    Spacer(modifier = Modifier.height(4.dp))
                    WeatherStat("HUMIDITY", "45%")
                    Spacer(modifier = Modifier.height(4.dp))
                    WeatherStat("WIND", "12 KM/H")
                }
            }
        }
    }
}

@Composable
private fun WeatherStat(label: String, value: String) {
    Text(
        text = "$label · $value",
        fontSize = 9.sp,
        fontWeight = FontWeight.Black,
        letterSpacing = 1.sp,
        color = TextMuted
    )
}

@Composable
private fun CountdownUnit(value: Long, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value.toString().padStart(2, '0'),
            fontSize = 40.sp,
            fontWeight = FontWeight.Black,
            fontStyle = FontStyle.Italic,
            color = Color.White,
            lineHeight = 40.sp
        )
        Text(
            text = label,
            fontSize = 9.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 2.sp,
            color = Color.White.copy(alpha = 0.6f)
        )
    }
}

@Composable
private fun SectionHeader(title: String, subtitle: String? = null, count: Int? = null) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .padding(top = 24.dp, bottom = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(
                text = title,
                style = BrutalistTypography.labelSmall,
                color = TextMuted,
                letterSpacing = 3.sp
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    color = Color.White.copy(alpha = 0.4f),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
        if (count != null) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(100))
                    .background(PrimaryMagenta.copy(alpha = 0.15f))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "$count",
                    color = PrimaryMagenta,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black
                )
            }
        }
    }
}

@Composable
private fun FavoriteArtistChip(artist: Artist) {
    val shape = RoundedCornerShape(topStart = 20.dp, bottomEnd = 20.dp)
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(72.dp)
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(shape)
                .background(MutedBackground)
                .border(2.dp, PrimaryMagenta.copy(alpha = 0.4f), shape)
        ) {
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = artist.artist,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        }
        Text(
            text = artist.artist.uppercase(),
            style = BrutalistTypography.labelSmall,
            color = TextPrimary,
            fontSize = 8.sp,
            maxLines = 1,
            modifier = Modifier.padding(top = 6.dp)
        )
    }
}

@Composable
private fun IslandPulseRow(artist: Artist) {
    val live = remember(artist) { isArtistLive(artist) }

    // Pulsing alpha for the LIVE badge
    val liveTransition = rememberInfiniteTransition(label = "livePulse")
    val pulseAlpha by liveTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "livePulseAlpha"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 5.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(4.dp)
                    .clip(CircleShape)
                    .background(if (live) ToxicGreen else PrimaryMagenta)
            )
            Spacer(modifier = Modifier.width(12.dp))
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = artist.artist,
                modifier = Modifier.size(52.dp).clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = artist.artist.uppercase(),
                    style = BrutalistTypography.titleLarge,
                    fontSize = 16.sp
                )
                Text(
                    text = (artist.stage ?: "Main Stage").uppercase(),
                    style = BrutalistTypography.labelSmall,
                    color = PrimaryMagenta,
                    fontSize = 9.sp
                )
            }
            // Right badge: LIVE (pulsing) or day abbreviation
            if (live) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(ToxicGreen.copy(alpha = pulseAlpha))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "● LIVE",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp,
                        color = Color.White
                    )
                }
            } else if (artist.day != null) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(AcidYellow.copy(alpha = 0.1f))
                        .border(1.dp, AcidYellow.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = artist.day.take(3).uppercase(),
                        style = BrutalistTypography.labelSmall,
                        color = AcidYellow,
                        fontSize = 9.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun QuickNavCard(label: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier, onClick: () -> Unit = {}) {
    Box(
        modifier = modifier
            .height(80.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(color.copy(alpha = 0.08f))
            .border(1.dp, color.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(22.dp))
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = label,
                style = BrutalistTypography.labelSmall,
                color = color,
                fontSize = 11.sp
            )
        }
    }
}
