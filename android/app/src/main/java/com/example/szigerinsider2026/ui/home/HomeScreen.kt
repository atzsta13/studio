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
import androidx.compose.material3.*
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
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupDiffRepository
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import com.example.szigerinsider2026.ui.tools.FestivalCountdownCard
import kotlinx.coroutines.delay
import java.util.Calendar
import java.util.TimeZone
import java.time.LocalDate
import com.example.szigerinsider2026.data.config.FestivalConfig

private fun getFestivalDay(): String {
    val config = FestivalConfig.current
    val now = Calendar.getInstance(TimeZone.getTimeZone(config.location.timezone))
    val year = now.get(Calendar.YEAR)
    val month = now.get(Calendar.MONTH)
    val dom = now.get(Calendar.DAY_OF_MONTH)

    val start = LocalDate.parse(config.dates.startDate)
    if (year < start.year || (year == start.year && month < (start.monthValue - 1))) return config.dates.days.first()
    
    // Simple offset-based day picker
    val currentLocalDate = LocalDate.of(year, month + 1, dom)
    val diff = java.time.temporal.ChronoUnit.DAYS.between(start, currentLocalDate).toInt()
    
    return config.dates.days.getOrNull(diff) ?: config.dates.days.first()
}

private fun isArtistLive(artist: Artist): Boolean {
    val config = FestivalConfig.current
    val day = artist.day ?: return false
    val startTime = artist.startTime ?: return false
    val endTime = artist.endTime ?: return false

    val dayIndex = config.dates.days.indexOf(day)
    if (dayIndex == -1) return false

    val start = LocalDate.parse(config.dates.startDate)
    val targetDate = start.plusDays(dayIndex.toLong())
    val now = Calendar.getInstance(TimeZone.getTimeZone(config.location.timezone))
    val currentLocalDate = LocalDate.of(now.get(Calendar.YEAR), now.get(Calendar.MONTH) + 1, now.get(Calendar.DAY_OF_MONTH))

    if (currentLocalDate != targetDate) return false

    return try {
        val (startH, startM) = startTime.split(":").map { it.toInt() }
        val (endH, endM) = endTime.split(":").map { it.toInt() }
        val nowH = now.get(Calendar.HOUR_OF_DAY)
        val nowM = now.get(Calendar.MINUTE)
        
        val nowMinutes = nowH * 60 + nowM
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

    var allArtists by remember { mutableStateOf<List<Artist>>(emptyList()) }
    var favoriteArtistIds by remember { mutableStateOf<Set<String>>(emptySet()) }
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
                        text = "${FestivalConfig.NAME.uppercase()} ${FestivalConfig.current.dates.year}",
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
                }
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
                        .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                }
            }
        }

        item {
            Box(modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 16.dp)) {
                FestivalCountdownCard()
            }
        }

        item { WeatherCard() }

        item { SectionHeader(title = "YOUR LINEUP", count = favoriteArtists.size.takeIf { it > 0 }) }
        item {
            if (favoriteArtists.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)
                        .clip(RoundedCornerShape(20.dp)).background(CardBackground)
                        .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(20.dp))
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "Star artists to build your lineup", color = TextMuted, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                }
            } else {
                LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.padding(bottom = 8.dp)) {
                    items(favoriteArtists) { artist -> FavoriteArtistChip(artist) }
                }
            }
        }

        headliner?.let { artist ->
            item { SectionHeader(title = "HEADLINER SPOTLIGHT") }
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(bottom = 16.dp).height(240.dp).clip(RoundedCornerShape(32.dp))) {
                    AsyncImage(model = artist.imageUrl, contentDescription = artist.artist, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    Box(modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f)))))
                    Column(modifier = Modifier.align(Alignment.BottomStart).padding(24.dp)) {
                        Text(text = "HEADLINER", fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 3.sp, color = MaterialTheme.colorScheme.secondary)
                        Text(text = artist.artist.uppercase(), fontSize = 30.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, color = Color.White, lineHeight = 32.sp)
                        if (artist.day != null) { Text(text = artist.day.uppercase(), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.6f), modifier = Modifier.padding(top = 2.dp)) }
                    }
                }
            }
        }

        item {
            val stage = nowPlaying.firstOrNull()?.stage ?: "Main Stage"
            SectionHeader(title = "${FestivalConfig.NAME.uppercase()} PULSE", subtitle = "$festivalDay · $stage")
        }
        items(nowPlaying) { artist -> IslandPulseRow(artist) }

        item {
            Spacer(modifier = Modifier.height(8.dp))
            SectionHeader(title = "EXPLORE")
        }
        item {
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                QuickNavCard("MAP", Icons.Default.LocationOn, CyanPulse, Modifier.weight(1f)) { navController?.navigate("map") }
                QuickNavCard("PASSPORT", Icons.Default.EmojiEvents, MaterialTheme.colorScheme.primary, Modifier.weight(1f)) { navController?.navigate("passport") }
            }
        }
        item {
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                QuickNavCard("TOOLS", Icons.Default.Build, ToxicGreen, Modifier.weight(1f)) { navController?.navigate("tools") }
                QuickNavCard("SCHEDULE", Icons.Default.Schedule, MaterialTheme.colorScheme.secondary, Modifier.weight(1f)) { navController?.navigate("schedule") }
            }
        }
    }
}

@Composable
private fun WeatherCard() {
    Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(bottom = 4.dp).clip(RoundedCornerShape(24.dp)).background(Brush.linearGradient(colors = listOf(Color(0xFF1A1A1A), OLEDBlack))).border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(24.dp)).padding(horizontal = 20.dp, vertical = 16.dp)) {
        Column {
            Text(text = "${FestivalConfig.current.location.city.uppercase()} FORECAST", fontSize = 8.sp, fontWeight = FontWeight.Black, letterSpacing = 3.sp, color = TextMuted)
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "28°C", fontSize = 28.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.secondary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(Icons.Default.WbSunny, contentDescription = "Sunny", tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(24.dp))
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "Sunny · Perfect festival weather", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = TextMuted)
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String, subtitle: String? = null, count: Int? = null) {
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp).padding(top = 24.dp, bottom = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Column {
            Text(text = title, style = BrutalistTypography.labelSmall, color = TextMuted, letterSpacing = 3.sp)
            if (subtitle != null) { Text(text = subtitle, color = Color.White.copy(alpha = 0.4f), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp)) }
        }
        if (count != null) {
            Box(modifier = Modifier.clip(RoundedCornerShape(100)).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)).padding(horizontal = 10.dp, vertical = 4.dp)) {
                Text(text = "$count", color = MaterialTheme.colorScheme.primary, fontSize = 11.sp, fontWeight = FontWeight.Black)
            }
        }
    }
}

@Composable
private fun FavoriteArtistChip(artist: Artist) {
    val shape = RoundedCornerShape(topStart = 20.dp, bottomEnd = 20.dp)
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(72.dp)) {
        Box(modifier = Modifier.size(64.dp).clip(shape).background(MutedBackground).border(2.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.4f), shape)) {
            AsyncImage(model = artist.imageUrl, contentDescription = artist.artist, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        }
        Text(text = artist.artist.uppercase(), style = BrutalistTypography.labelSmall, color = TextPrimary, fontSize = 8.sp, maxLines = 1, modifier = Modifier.padding(top = 6.dp))
    }
}

@Composable
private fun IslandPulseRow(artist: Artist) {
    val live = remember(artist) { isArtistLive(artist) }
    Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 5.dp), shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = CardBackground), border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))) {
        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(4.dp).clip(CircleShape).background(if (live) ToxicGreen else MaterialTheme.colorScheme.primary))
            Spacer(modifier = Modifier.width(12.dp))
            AsyncImage(model = artist.imageUrl, contentDescription = artist.artist, modifier = Modifier.size(52.dp).clip(RoundedCornerShape(12.dp)), contentScale = ContentScale.Crop)
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = artist.artist.uppercase(), style = BrutalistTypography.titleLarge, fontSize = 16.sp)
                Text(text = (artist.stage ?: "Main Stage").uppercase(), style = BrutalistTypography.labelSmall, color = MaterialTheme.colorScheme.primary, fontSize = 9.sp)
            }
        }
    }
}

@Composable
private fun QuickNavCard(label: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier, onClick: () -> Unit = {}) {
    Box(modifier = modifier.height(80.dp).clip(RoundedCornerShape(20.dp)).background(color.copy(alpha = 0.08f)).border(1.dp, color.copy(alpha = 0.2f), RoundedCornerShape(20.dp)).clickable(onClick = onClick).padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(22.dp))
            Spacer(modifier = Modifier.width(10.dp))
            Text(text = label, style = BrutalistTypography.labelSmall, color = color, fontSize = 11.sp)
        }
    }
}
