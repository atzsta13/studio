package com.example.szigerinsider2026.ui.home

import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.material.icons.filled.Search
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
import com.example.szigerinsider2026.ui.discover.ArtistViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.ui.utils.getFestivalDay

@Composable
fun HomeScreen(navController: NavController) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val repository = remember { LineupRepository(context) }
    val db = remember { AppDatabase.getDatabase(context) }

    val artistViewModel: ArtistViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ArtistViewModel(db.userDao()) as T
            }
        }
    )

    var allArtists by remember { mutableStateOf<List<Artist>>(emptyList()) }
    val favoriteArtistIds by artistViewModel.favoriteArtistIds.collectAsStateWithLifecycle()
    var newArtistPreview by remember { mutableStateOf<List<Artist>>(emptyList()) }

    LaunchedEffect(Unit) {
        allArtists = repository.getLineup()
    }

    LaunchedEffect(Unit) {
        val diff = LineupDiffRepository(context).computeDiff()
        newArtistPreview = diff.newArtists.take(4)
    }

    val festivalDay = remember(allArtists) { getFestivalDay() }
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

    Scaffold(
        containerColor = OLEDBlack
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 100.dp)
        ) {
            // Header
            item {
                HomeHeader(navController)
            }

            // Quick Actions
            item {
                QuickActionsRow(navController)
            }

            // Headliner Highlight
            headliner?.let {
                item {
                    HeadlinerCard(it) { navController.navigate("artist/${it.id}") }
                }
            }

            // Pulse / Now Playing
            if (nowPlaying.isNotEmpty()) {
                item {
                    PulseSection(nowPlaying) { navController.navigate("artist/${it.id}") }
                }
            }

            // Favorites Preview
            if (favoriteArtists.isNotEmpty()) {
                item {
                    FavoritesPreviewSection(favoriteArtists) { navController.navigate("artist/${it.id}") }
                }
            }

            // New Discovery
            if (newArtistPreview.isNotEmpty()) {
                item {
                    NewDiscoverySection(newArtistPreview) { navController.navigate("artist/${it.id}") }
                }
            }
        }
    }
}

@Composable
fun HomeHeader(navController: NavController) {
    Column(modifier = Modifier.padding(24.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "ISLAND",
                    style = BrutalistTypography.headlineLarge,
                    color = Color.White,
                    fontSize = 42.sp,
                    lineHeight = 38.sp
                )
                Text(
                    text = "PULSE",
                    style = BrutalistTypography.headlineLarge,
                    color = PrimaryMagenta,
                    fontSize = 42.sp,
                    lineHeight = 38.sp
                )
            }
            
            IconButton(
                onClick = { navController.navigate("search") },
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(CardBackground)
                    .border(1.dp, Color.White.copy(alpha = 0.1f), CircleShape)
            ) {
                Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
            }
        }
    }
}

@Composable
fun QuickActionsRow(navController: NavController) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        QuickActionChip(
            icon = Icons.Default.LocationOn,
            label = "MAP",
            color = CyanPulse,
            modifier = Modifier.weight(1f)
        ) { navController.navigate("map") }
        
        QuickActionChip(
            icon = Icons.Default.Build,
            label = "TOOLS",
            color = ToxicGreen,
            modifier = Modifier.weight(1f)
        ) { navController.navigate("tools") }
    }
}

@Composable
fun QuickActionChip(
    icon: ImageVector,
    label: String,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier.height(52.dp),
        shape = RoundedCornerShape(16.dp),
        color = CardBackground,
        border = BorderStroke(1.dp, color.copy(alpha = 0.2f))
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = label,
                color = Color.White,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp
            )
        }
    }
}

@Composable
fun HeadlinerCard(artist: Artist, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
            .height(200.dp),
        shape = RoundedCornerShape(32.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, OLEDBlack.copy(alpha = 0.8f))
                        )
                    )
            )
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(24.dp)
            ) {
                Text(
                    text = "TONIGHT'S HEADLINER",
                    color = PrimaryMagenta,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp
                )
                Text(
                    text = artist.artist.uppercase(),
                    color = Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic
                )
            }
        }
    }
}

@Composable
fun PulseSection(artists: List<Artist>, onArtistClick: (Artist) -> Unit) {
    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        SectionHeader(title = "LIVE PULSE", actionLabel = "FULL SCHEDULE") { }
        LazyRow(
            contentPadding = PaddingValues(horizontal = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(artists) { artist ->
                PulseCard(artist) { onArtistClick(artist) }
            }
        }
    }
}

@Composable
fun PulseCard(artist: Artist, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(140.dp)
            .clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(140.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(CardBackground)
        ) {
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            // Live indicator
            Box(
                modifier = Modifier
                    .padding(12.dp)
                    .align(Alignment.TopEnd)
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(Color.Red)
            )
        }
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = artist.artist.uppercase(),
            color = Color.White,
            fontSize = 14.sp,
            fontWeight = FontWeight.Black,
            maxLines = 1
        )
        Text(
            text = (artist.stage ?: "MAIN STAGE").uppercase(),
            color = TextMuted,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun FavoritesPreviewSection(artists: List<Artist>, onArtistClick: (Artist) -> Unit) {
    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        SectionHeader(title = "MY LINEUP", actionLabel = "SEE ALL") { }
        LazyRow(
            contentPadding = PaddingValues(horizontal = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(artists) { artist ->
                FavoriteCircle(artist) { onArtistClick(artist) }
            }
        }
    }
}

@Composable
fun FavoriteCircle(artist: Artist, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(80.dp).clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape)
                .background(CardBackground)
                .border(2.dp, PrimaryMagenta.copy(alpha = 0.5f), CircleShape)
        ) {
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = artist.artist.split(" ").first().uppercase(),
            color = Color.White,
            fontSize = 10.sp,
            fontWeight = FontWeight.Black,
            maxLines = 1
        )
    }
}

@Composable
fun NewDiscoverySection(artists: List<Artist>, onArtistClick: (Artist) -> Unit) {
    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        SectionHeader(title = "NEW ADDITIONS", actionLabel = "EXPLORE") { }
        Column(
            modifier = Modifier.padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            artists.forEach { artist ->
                DiscoveryRow(artist) { onArtistClick(artist) }
            }
        }
    }
}

@Composable
fun DiscoveryRow(artist: Artist, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().height(72.dp),
        shape = RoundedCornerShape(20.dp),
        color = CardBackground
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(OLEDBlack)
            ) {
                AsyncImage(
                    model = artist.imageUrl,
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = artist.artist.uppercase(),
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = artist.genres.firstOrNull()?.uppercase() ?: "PUNK",
                    color = ToxicGreen,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Icon(Icons.Default.Schedule, contentDescription = null, tint = TextMuted, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text(text = (artist.day ?: "FRI").take(3).uppercase(), color = TextMuted, fontSize = 10.sp, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
fun SectionHeader(title: String, actionLabel: String, onAction: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom
    ) {
        Text(
            text = title,
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.sp
        )
        Text(
            text = actionLabel,
            color = PrimaryMagenta,
            fontSize = 11.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.sp,
            modifier = Modifier.clickable { onAction() }
        )
    }
}
