package com.example.szigerinsider2026.ui.quiz

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.local.FavoriteArtist
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import kotlinx.coroutines.launch

@Composable
fun VibeResultScreen(navController: NavController, quizViewModel: VibeQuizViewModel) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val scope = rememberCoroutineScope()
    val results by quizViewModel.results.collectAsStateWithLifecycle()
    val userDao = remember { AppDatabase.getDatabase(context).userDao() }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack),
        contentPadding = PaddingValues(bottom = 120.dp)
    ) {
        item {
            // Header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 48.dp)
            ) {
                Text(
                    text = "YOUR SOUND",
                    color = TextMuted,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 4.sp
                )
                Text(
                    text = "UNLOCKED",
                    color = AcidYellow,
                    fontSize = 52.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-2).sp,
                    lineHeight = 50.sp
                )
                Text(
                    text = "${results.size} artists matched your DNA",
                    color = TextMuted,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }

        itemsIndexed(results) { index, artist ->
            ResultArtistCard(
                artist = artist,
                index = index,
                onArtistClick = { navController.navigate("artist/${artist.id}") },
                onFavorite = {
                    scope.launch {
                        haptic.favoriteTap()
                        userDao.addFavorite(FavoriteArtist(artistId = artist.id))
                    }
                }
            )
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Save all button
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(PrimaryMagenta)
                        .clickable {
                            haptic.successBurst()
                            scope.launch {
                                results.forEach { artist ->
                                    userDao.addFavorite(FavoriteArtist(artistId = artist.id))
                                }
                            }
                        }
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "★  SAVE ALL AS FAVORITES",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }

                TextButton(onClick = {
                    haptic.lightTap()
                    quizViewModel.reset()
                    navController.popBackStack()
                }) {
                    Text("RETAKE QUIZ", color = TextMuted, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                }
            }
        }
    }
}

@Composable
private fun ResultArtistCard(
    artist: Artist,
    index: Int,
    onArtistClick: () -> Unit,
    onFavorite: () -> Unit
) {
    var favorited by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(20.dp))
            .clickable(onClick = onArtistClick)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Rank number
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(OLEDBlack),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "#${index + 1}",
                    color = AcidYellow,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            // Artist image
            AsyncImage(
                model = artist.imageUrl,
                contentDescription = artist.artist,
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(14.dp))
            // Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = artist.artist.uppercase(),
                    color = TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 0.3.sp
                )
                if (artist.genres.isNotEmpty()) {
                    Text(
                        text = artist.genres.take(3).joinToString(" · "),
                        color = TextMuted,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(top = 3.dp)
                    )
                }
                if (artist.day != null) {
                    Text(
                        text = artist.day.uppercase(),
                        color = CyanPulse,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
            // Favorite button
            IconButton(
                onClick = {
                    favorited = true
                    onFavorite()
                }
            ) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = "Favorite",
                    tint = if (favorited) AcidYellow else TextMuted,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
    }
}
