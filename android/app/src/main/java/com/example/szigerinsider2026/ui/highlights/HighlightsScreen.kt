package com.example.szigerinsider2026.ui.highlights

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@Composable
fun HighlightsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val vm: HighlightsViewModel = viewModel(factory = HighlightsViewModel.Factory(context))
    val summary by vm.summary.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(OLEDBlack),
        contentPadding = PaddingValues(bottom = 60.dp)
    ) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(PrimaryMagenta.copy(alpha = 0.15f), Color.Transparent)))
                    .padding(top = 48.dp, start = 20.dp, end = 20.dp, bottom = 32.dp)
            ) {
                Column {
                    IconButton(onClick = { haptic.lightTap(); onBack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("MY SZIGET", color = TextMuted, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 3.sp)
                    Text("2026", color = PrimaryMagenta, fontSize = 80.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-4).sp, lineHeight = 72.sp)
                    Text("HIGHLIGHTS", color = TextPrimary, fontSize = 40.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-2).sp, lineHeight = 38.sp)
                }
            }
        }

        summary?.let { s ->
            item {
                Row(
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    StatBox("RANK", s.rank.uppercase(), AcidYellow, modifier = Modifier.weight(1f))
                    StatBox("XP", "${s.xp}", ToxicGreen, modifier = Modifier.weight(1f))
                    StatBox("SAVED", "${s.favoriteCount}", CyanPulse, modifier = Modifier.weight(1f))
                    StatBox("STAMPS", "${s.stampsCount}", PrimaryMagenta, modifier = Modifier.weight(1f))
                }
            }

            if (s.topGenres.isNotEmpty()) {
                item { HighlightSection("TOP GENRES", s.topGenres, PrimaryMagenta) }
            }
            if (s.topVibes.isNotEmpty()) {
                item { HighlightSection("YOUR VIBES", s.topVibes, AcidYellow) }
            }

            if (s.favoriteNames.isNotEmpty()) {
                item {
                    Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) {
                        Text("YOUR LINEUP", color = TextMuted, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp, modifier = Modifier.padding(bottom = 12.dp))
                        s.favoriteNames.forEach { name ->
                            Text(
                                name.uppercase(),
                                color = TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Black,
                                fontStyle = FontStyle.Italic, letterSpacing = (-1).sp, lineHeight = 28.sp,
                                modifier = Modifier.padding(vertical = 2.dp)
                            )
                        }
                        if (s.favoriteCount > 10) {
                            Text("+${s.favoriteCount - 10} MORE", color = TextMuted, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, modifier = Modifier.padding(top = 4.dp))
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = {
                        haptic.successBurst()
                        val text = buildString {
                            append("🎪 My Sziget 2026 Highlights\n\n")
                            append("🏆 Rank: ${s.rank}\n")
                            append("⚡ XP: ${s.xp}\n")
                            append("❤️ Saved: ${s.favoriteCount} artists\n")
                            if (s.topGenres.isNotEmpty()) append("🎵 Genres: ${s.topGenres.joinToString(", ")}\n")
                            if (s.topVibes.isNotEmpty()) append("✨ Vibes: ${s.topVibes.joinToString(", ")}\n")
                            if (s.favoriteNames.isNotEmpty()) {
                                append("\n🎤 My lineup:\n")
                                s.favoriteNames.take(5).forEach { append("• $it\n") }
                            }
                            append("\n#SzigetFestival #Sziget2026")
                        }
                        context.startActivity(
                            Intent.createChooser(
                                Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, text) },
                                "Share your highlights"
                            )
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryMagenta, contentColor = Color.White),
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier.fillMaxWidth().height(72.dp).padding(horizontal = 20.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("SHARE MY HIGHLIGHTS", fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 2.sp)
                    }
                }
            }
        } ?: item {
            Box(modifier = Modifier.fillMaxWidth().padding(top = 80.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PrimaryMagenta)
            }
        }
    }
}

@Composable
private fun StatBox(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(color.copy(alpha = 0.08f))
            .border(1.dp, color.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(label, color = color.copy(alpha = 0.7f), fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        Text(value, color = color, fontSize = 16.sp, fontWeight = FontWeight.Black, letterSpacing = (-0.5).sp)
    }
}

@Composable
private fun HighlightSection(title: String, items: List<String>, color: Color) {
    Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) {
        Text(title, color = TextMuted, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp, modifier = Modifier.padding(bottom = 10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items.forEach { item ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(100))
                        .background(color.copy(alpha = 0.1f))
                        .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(100))
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Text(item.uppercase(), color = color, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                }
            }
        }
    }
}
