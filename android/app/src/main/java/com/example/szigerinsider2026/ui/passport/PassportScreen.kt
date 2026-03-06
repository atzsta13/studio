package com.example.szigerinsider2026.ui.passport

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Whatshot
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.szigerinsider2026.data.local.AppDatabase
import androidx.lifecycle.compose.collectAsStateWithLifecycle

data class Stamp(
    val id: String,
    val title: String,
    val icon: ImageVector,
    val description: String,
    val category: String,
    val color: Color
)

val STAMPS = listOf(
    Stamp("s1", "Main Stage Legend", Icons.Default.Star, "Visit the Main Stage during a headliner set.", "stage", Color(0xFFFFD700)),
    Stamp("s2", "Colosseum Raver", Icons.Default.Whatshot, "Dance at the Colosseum for at least 1 hour.", "stage", Color(0xFFFF4500)),
    Stamp("s3", "Water Finder", Icons.Default.WaterDrop, "Locate 3 different water refill points on your map.", "utility", Color(0xFF00BFFF)),
    Stamp("s4", "Global Gourmet", Icons.Default.Restaurant, "Eat at 3 different international stalls.", "food", Color(0xFF50C878)),
    Stamp("s5", "Art Garden Dreamer", Icons.Default.LocationOn, "Visit the Art Garden at midnight.", "secret", Color(0xFF9370DB)),
    Stamp("s6", "Bridge Crosser", Icons.Default.Place, "Cross the K-Bridge at dawn.", "secret", Color(0xFFFF69B4)),
    Stamp("s7", "Early Bird", Icons.Default.Schedule, "Be the first at a stage before 4 PM.", "utility", Color(0xFF00CED1)),
    Stamp("s8", "Scout Master", Icons.Default.AutoAwesome, "Follow 3 AI Scout recommendations.", "secret", Color(0xFF4B0082))
)

@Composable
fun PassportScreen() {
    val context = LocalContext.current
    val viewModel: PassportViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val db = AppDatabase.getDatabase(context)
                @Suppress("UNCHECKED_CAST")
                return PassportViewModel(db.userDao()) as T
            }
        }
    )

    val haptic = rememberHapticManager()
    val userProgress by viewModel.userProgress.collectAsStateWithLifecycle()
    val unlockedStamps = userProgress.stampsCollected.toSet()
    val progress = (unlockedStamps.size.toFloat() / STAMPS.size.toFloat() * 100).toInt()
    val totalXP = userProgress.legendXp
    val currentRank = userProgress.currentRank
    
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 32.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
            Column {
                Text(
                    text = "ISLAND PASSPORT",
                    style = BrutalistTypography.headlineLarge,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Text(
                    text = "Collect stamps, level up, and become a Sziget Legend.",
                    color = TextMuted,
                    fontSize = 16.sp,
                    lineHeight = 22.sp,
                    modifier = Modifier.padding(bottom = 32.dp)
                )
            }
        }

        // Progress Card
        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(Color(0xFF6366F1), PrimaryMagenta)
                            )
                        )
                        .padding(24.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Bottom
                        ) {
                            Column {
                                Text(
                                    text = "LEVEL STATUS",
                                    color = Color.White.copy(alpha = 0.7f),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 2.sp
                                )
                                Text(
                                    text = "$progress%",
                                    color = Color.White,
                                    fontSize = 48.sp,
                                    fontWeight = FontWeight.Black,
                                    fontStyle = FontStyle.Italic
                                )
                            }
                            Text(
                                text = "${unlockedStamps.size} / ${STAMPS.size} STAMPS",
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        LinearProgressIndicator(
                            progress = progress / 100f,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(100)),
                            color = Color.White,
                            trackColor = Color.White.copy(alpha = 0.2f)
                        )
                    }
                }
            }
        }

        // Stamp Grid
        items(STAMPS) { stamp ->
            val isUnlocked = unlockedStamps.contains(stamp.id)
            
            Box(
                modifier = Modifier
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(24.dp))
                    .background(if (isUnlocked) CardBackground else MutedBackground.copy(alpha = 0.3f))
                    .border(
                        width = 2.dp,
                        color = if (isUnlocked) PrimaryMagenta else Color.White.copy(alpha = 0.05f),
                        shape = RoundedCornerShape(24.dp)
                    )
                    .clickable {
                        if (isUnlocked) haptic.mediumTap() else haptic.successBurst()
                        viewModel.toggleStamp(stamp.id)
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(if (isUnlocked) Color.White else Color.White.copy(alpha = 0.05f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isUnlocked) stamp.icon else Icons.Default.Lock,
                            contentDescription = stamp.title,
                            tint = if (isUnlocked) stamp.color else TextMuted,
                            modifier = Modifier.size(if (isUnlocked) 32.dp else 24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = stamp.title.uppercase(),
                        style = BrutalistTypography.labelSmall,
                        color = if (isUnlocked) TextPrimary else TextMuted,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        lineHeight = 12.sp
                    )
                }

                if (isUnlocked) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Unlocked",
                        tint = PrimaryMagenta,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(12.dp)
                            .size(16.dp)
                    )
                }
            }
        }

        // Rank Card
        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
            ) {
                Row(
                    modifier = Modifier.padding(24.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(PrimaryMagenta.copy(alpha = 0.1f))
                            .border(2.dp, PrimaryMagenta.copy(alpha = 0.2f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.EmojiEvents,
                            contentDescription = "Rank",
                            tint = PrimaryMagenta,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(20.dp))
                    Column {
                        Text(
                            text = "CURRENT RANK",
                            color = TextMuted,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp
                        )
                        Text(
                            text = currentRank.uppercase(),
                            style = BrutalistTypography.titleLarge,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "$totalXP XP",
                            color = PrimaryMagenta,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            fontStyle = FontStyle.Italic
                        )
                    }
                }
            }
        }
    }
}
