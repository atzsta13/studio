package com.example.szigerinsider2026.ui.home

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
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.theme.*
import kotlinx.coroutines.delay
import java.util.Calendar
import java.util.TimeZone

private val FESTIVAL_START_MS: Long by lazy {
    Calendar.getInstance(TimeZone.getTimeZone("Europe/Budapest")).apply {
        set(2026, Calendar.AUGUST, 6, 12, 0, 0)
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

@Composable
fun HomeScreen(navController: NavController? = null) {
    val context = LocalContext.current
    val repository = remember { LineupRepository(context) }
    val db = remember { AppDatabase.getDatabase(context) }

    var countdown by remember { mutableStateOf(calcCountdown()) }
    var allArtists by remember { mutableStateOf<List<Artist>>(emptyList()) }
    var favoriteArtistIds by remember { mutableStateOf<Set<String>>(emptySet()) }

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

    val headliner = remember(allArtists) { allArtists.firstOrNull { it.isHeadliner } }
    val nowPlaying = remember(allArtists) { allArtists.filter { it.day == "Wednesday" }.take(3) }
    val favoriteArtists = remember(allArtists, favoriteArtistIds) {
        allArtists.filter { favoriteArtistIds.contains(it.id) }
    }

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
                        text = "SZIGET 2026",
                        style = BrutalistTypography.labelSmall,
                        color = PrimaryMagenta,
                        letterSpacing = 3.sp
                    )
                    Text(
                        text = "Island of Freedom",
                        color = TextMuted,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
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

        // Countdown card
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 16.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(Color(0xFF6C3CE1), PrimaryMagenta)
                        )
                    )
                    .padding(28.dp)
            ) {
                Column {
                    Text(
                        text = "COUNTDOWN TO ISLAND",
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
                        text = "Aug 6 – 11, Budapest",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
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

        // Island Pulse
        item { SectionHeader(title = "ISLAND PULSE", subtitle = "Now on the island") }
        items(nowPlaying) { artist ->
            IslandPulseRow(artist)
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
    }
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
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(72.dp)
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape)
                .background(MutedBackground)
                .border(2.dp, PrimaryMagenta.copy(alpha = 0.4f), CircleShape)
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
                    .background(PrimaryMagenta)
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
            if (artist.day != null) {
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
