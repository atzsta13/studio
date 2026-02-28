package com.example.szigerinsider2026.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Newspaper
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
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
import coil.compose.AsyncImage
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.theme.*

@Composable
fun HomeScreen() {
    val context = LocalContext.current
    val repository = remember { LineupRepository(context) }
    var nowPlaying by remember { mutableStateOf<List<Artist>>(emptyList()) }

    LaunchedEffect(Unit) {
        nowPlaying = repository.getLineup().filter { it.day == "Wednesday" }.take(3)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 48.dp, bottom = 100.dp)
    ) {
        // Hero Section
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(32.dp))
                        .background(PrimaryMagenta.copy(alpha = 0.05f))
                        .border(1.dp, PrimaryMagenta.copy(alpha = 0.1f), RoundedCornerShape(32.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.MusicNote, contentDescription = null, tint = PrimaryMagenta, modifier = Modifier.size(40.dp))
                }
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "SZIGET",
                    fontSize = 64.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    letterSpacing = (-4).sp,
                    lineHeight = 56.sp
                )
                Text(
                    text = "INSIDER",
                    fontSize = 64.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    color = PrimaryMagenta,
                    letterSpacing = (-4).sp,
                    lineHeight = 56.sp
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Elite Intelligence for the Island of Freedom",
                    color = TextMuted,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 0.5.sp
                )
            }
        }

        // Island Status
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 40.dp),
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Newspaper, contentDescription = null, tint = PrimaryMagenta, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "ISLAND STATUS",
                            style = BrutalistTypography.labelSmall,
                            color = PrimaryMagenta
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Vibe: Electric. Dust: High.",
                        style = BrutalistTypography.titleLarge,
                        color = Color.White
                    )
                    Text(
                        text = "Colosseum peak at 02:00. All water points active. UV index is peaking.",
                        color = TextMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }

        // Island Pulse
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 24.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(PrimaryMagenta)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "ISLAND PULSE",
                    style = BrutalistTypography.headlineLarge,
                    fontSize = 28.sp
                )
            }
        }

        items(nowPlaying) { artist ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MutedBackground.copy(alpha = 0.3f)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = artist.imageUrl,
                        contentDescription = artist.artist,
                        modifier = Modifier
                            .size(64.dp)
                            .clip(RoundedCornerShape(16.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = artist.artist.uppercase(),
                            style = BrutalistTypography.titleLarge,
                            fontSize = 18.sp
                        )
                        Text(
                            text = (artist.stage ?: "Main Stage").uppercase(),
                            style = BrutalistTypography.labelSmall,
                            color = PrimaryMagenta
                        )
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.White.copy(alpha = 0.2f))
                }
            }
        }
    }
}
