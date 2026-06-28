package com.example.szigerinsider2026.ui.quiz

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.ui.discover.ArtistViewModel
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VibeResultScreen(navController: NavController, quizViewModel: VibeQuizViewModel) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val db = remember { AppDatabase.getDatabase(context) }
    
    val artistViewModel: ArtistViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ArtistViewModel(db.userDao()) as T
            }
        }
    )

    val results by quizViewModel.results.collectAsStateWithLifecycle()
    val favoriteIds by artistViewModel.favoriteArtistIds.collectAsStateWithLifecycle()

    Scaffold(
        containerColor = OLEDBlack,
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("YOUR MATCHES", style = BrutalistTypography.headlineSmall, color = Color.White) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OLEDBlack)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "BASED ON YOUR VIBE...",
                    color = ToxicGreen,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            items(results) { artist ->
                val isFavorite = favoriteIds.contains(artist.id)
                
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { navController.navigate("artist/${artist.id}") },
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(artist.artist.uppercase(), color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black)
                            Text(artist.genres.joinToString(" · "), color = TextMuted, fontSize = 12.sp)
                        }
                        
                        IconButton(
                            onClick = {
                                haptic.mediumTap()
                                artistViewModel.toggleFavorite(artist.id)
                            }
                        ) {
                            Icon(
                                if (isFavorite) Icons.Filled.Star else Icons.Filled.AutoAwesome,
                                contentDescription = null,
                                tint = if (isFavorite) AcidYellow else Color.White.copy(alpha = 0.2f)
                            )
                        }
                    }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(32.dp))
                Button(
                    onClick = { navController.navigate("discover") },
                    modifier = Modifier.fillMaxWidth().height(64.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("EXPLORE ALL ARTISTS", fontWeight = FontWeight.Black)
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(Icons.Default.ChevronRight, contentDescription = null)
                }
            }
        }
    }
}
