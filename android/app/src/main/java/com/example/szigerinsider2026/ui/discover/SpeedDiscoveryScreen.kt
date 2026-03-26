package com.example.szigerinsider2026.ui.discover

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpeedDiscoveryScreen(
    artists: List<Artist>,
    favoriteIds: Set<String>,
    onToggleFavorite: (String) -> Unit,
    onArtistClick: (String) -> Unit,
    onBack: () -> Unit
) {
    val haptic = rememberHapticManager()
    val scope = rememberCoroutineScope()
    
    val pool = remember(artists, favoriteIds) {
        artists.filter { it.id !in favoriteIds }.shuffled()
    }
    
    var currentIndex by remember { mutableIntStateOf(0) }
    val currentArtist = pool.getOrNull(currentIndex)
    
    var offsetX by remember { mutableFloatStateOf(0f) }
    val rotation = offsetX / 20f
    
    val animatedOffsetX by animateFloatAsState(
        targetValue = offsetX,
        animationSpec = spring(stiffness = Spring.StiffnessLow),
        label = "offsetX"
    )

    fun handleSwipe(isRight: Boolean) {
        haptic.successBurst()
        if (isRight && currentArtist != null) {
            onToggleFavorite(currentArtist.id)
        }
        
        scope.launch {
            offsetX = if (isRight) 1000f else -1000f
            kotlinx.coroutines.delay(200)
            currentIndex++
            offsetX = 0f
        }
    }

    Scaffold(
        containerColor = Color.Black,
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            "SPEED DISCOVERY",
                            style = BrutalistTypography.labelSmall,
                            color = TextMuted,
                            fontSize = 10.sp,
                            letterSpacing = 2.sp
                        )
                        if (pool.isNotEmpty()) {
                            Text(
                                "${currentIndex + 1} / ${pool.size}",
                                style = BrutalistTypography.labelSmall,
                                color = AcidYellow,
                                fontSize = 12.sp
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ChevronLeft, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = Color.Black)
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            if (currentArtist == null || currentIndex >= pool.size) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        "YOU'VE SEEN IT ALL!",
                        style = BrutalistTypography.headlineLarge,
                        color = AcidYellow,
                        fontStyle = FontStyle.Italic
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onBack,
                        colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("BACK TO GRID", color = Color.Black, fontWeight = FontWeight.Black)
                    }
                }
            } else {
                // Background card (next one)
                pool.getOrNull(currentIndex + 1)?.let { nextArtist ->
                    ArtistSwipeCard(
                        artist = nextArtist,
                        modifier = Modifier
                            .padding(24.dp)
                            .fillMaxWidth()
                            .aspectRatio(3f / 4f)
                            .graphicsLayer { scaleX = 0.9f; scaleY = 0.9f; alpha = 0.5f }
                    )
                }

                // Foreground card (current)
                ArtistSwipeCard(
                    artist = currentArtist,
                    modifier = Modifier
                        .padding(24.dp)
                        .fillMaxWidth()
                        .aspectRatio(3f / 4f)
                        .offset { IntOffset(animatedOffsetX.roundToInt(), 0) }
                        .graphicsLayer { rotationZ = rotation }
                        .pointerInput(Unit) {
                            detectDragGestures(
                                onDragEnd = {
                                    if (offsetX > 300) handleSwipe(true)
                                    else if (offsetX < -300) handleSwipe(false)
                                    else offsetX = 0f
                                },
                                onDrag = { change, dragAmount ->
                                    change.consume()
                                    offsetX += dragAmount.x
                                }
                            )
                        }
                )
                
                // Indicators
                if (offsetX > 100) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .padding(end = 40.dp)
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(AcidYellow)
                            .graphicsLayer { alpha = (offsetX / 400f).coerceIn(0f, 1f) },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Favorite, contentDescription = null, tint = Color.Black, modifier = Modifier.size(40.dp))
                    }
                }
                
                if (offsetX < -100) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .padding(start = 40.dp)
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(Color.Red)
                            .graphicsLayer { alpha = (-offsetX / 400f).coerceIn(0f, 1f) },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Close, contentDescription = null, tint = Color.White, modifier = Modifier.size(40.dp))
                    }
                }

                // Controls
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 40.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { handleSwipe(false) },
                        modifier = Modifier
                            .size(64.dp)
                            .border(2.dp, Color.White.copy(alpha = 0.2f), CircleShape)
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Skip", tint = Color.White, modifier = Modifier.size(32.dp))
                    }
                    
                    IconButton(
                        onClick = { handleSwipe(true) },
                        modifier = Modifier
                            .size(80.dp)
                            .background(AcidYellow, CircleShape)
                    ) {
                        Icon(Icons.Default.Favorite, contentDescription = "Favorite", tint = Color.Black, modifier = Modifier.size(40.dp))
                    }
                    
                    IconButton(
                        onClick = { onArtistClick(currentArtist.id) },
                        modifier = Modifier
                            .size(64.dp)
                            .border(2.dp, Color.White.copy(alpha = 0.2f), CircleShape)
                    ) {
                        Icon(Icons.Default.Info, contentDescription = "Info", tint = Color.White, modifier = Modifier.size(32.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun ArtistSwipeCard(artist: Artist, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(CardBackground)
            .border(2.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
    ) {
        AsyncImage(
            model = artist.imageUrl,
            contentDescription = artist.artist,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.8f))
                    )
                )
        )
        
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(24.dp)
        ) {
            if (artist.returningHero) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(AcidYellow)
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text("RETURNING HERO", color = Color.Black, fontSize = 10.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic)
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            Text(
                text = artist.artist.uppercase(),
                style = BrutalistTypography.headlineLarge,
                color = Color.White,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                artist.genres.take(2).forEach { genre ->
                    Text(
                        text = genre.uppercase(),
                        style = BrutalistTypography.labelSmall,
                        color = AcidYellow,
                        fontSize = 10.sp
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = artist.description ?: "Ready for the Island of Freedom?",
                color = Color.White.copy(alpha = 0.7f),
                fontSize = 14.sp,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 18.sp,
                fontStyle = FontStyle.Italic
            )
        }
    }
}
