package org.openfestivalhub.ui.discover

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.utils.rememberHapticManager

private val chartColors = listOf(AcidYellow, PrimaryMagenta, CyanPulse, ToxicGreen)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GenreBreakdownScreen(navController: NavController) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()

    val statsViewModel: LineupStatsViewModel = viewModel(
        factory = LineupStatsViewModel.Factory(context)
    )

    val genreStats by statsViewModel.genreStats.collectAsStateWithLifecycle()
    val totalArtists by statsViewModel.totalArtists.collectAsStateWithLifecycle()
    val countryGenreMap by statsViewModel.countryGenreMap.collectAsStateWithLifecycle()

    val top12 = remember(genreStats) { genreStats.take(12) }
    val maxCount = remember(top12) { top12.maxOfOrNull { it.second } ?: 1 }

    // "Most diverse" country: the one with the most distinct genres
    val mostDiverseCountry = remember(countryGenreMap) {
        countryGenreMap.entries.maxByOrNull { it.value.size }
    }

    val topGenre = top12.firstOrNull()

    // Animate bars in: each bar animates after screen opens
    var animate by remember { mutableStateOf(false) }
    LaunchedEffect(top12) {
        if (top12.isNotEmpty()) animate = true
    }

    Scaffold(
        containerColor = OLEDBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "GENRE DNA",
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        fontSize = 22.sp,
                        letterSpacing = (-0.5).sp,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { haptic.lightTap(); navController.popBackStack() }) {
                        Icon(Icons.Filled.ChevronLeft, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = OLEDBlack,
                    titleContentColor = Color.White
                ),
                windowInsets = WindowInsets(0.dp)
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(0.dp),
            contentPadding = PaddingValues(bottom = 40.dp)
        ) {
            // Subtitle
            item {
                Text(
                    text = "${totalArtists} ARTISTS · ${genreStats.size} GENRES",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
                )
            }

            // Bar chart rows
            itemsIndexed(top12) { index, (genre, count) ->
                val barColor = chartColors[index % chartColors.size]

                val targetFraction = if (animate) count.toFloat() / maxCount else 0f
                val animatedFraction by animateFloatAsState(
                    targetValue = targetFraction,
                    animationSpec = tween(durationMillis = 600, delayMillis = index * 50),
                    label = "bar_$index"
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .clickable {
                            haptic.lightTap()
                            navController.previousBackStackEntry
                                ?.savedStateHandle
                                ?.set("filter_genre", genre)
                            navController.popBackStack()
                        }
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Genre label
                    Text(
                        text = genre.uppercase(),
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 0.5.sp,
                        modifier = Modifier.width(110.dp)
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    // Animated bar
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(22.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color.White.copy(alpha = 0.07f))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxHeight()
                                .fillMaxWidth(animatedFraction)
                                .clip(RoundedCornerShape(4.dp))
                                .background(barColor)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    // Count
                    Text(
                        text = count.toString(),
                        color = AcidYellow,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.width(28.dp)
                    )
                }
            }

            // Stat cards
            item {
                Spacer(modifier = Modifier.height(28.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // TOP GENRE card
                    StatCard(
                        modifier = Modifier.weight(1f),
                        label = "TOP GENRE",
                        value = topGenre?.first?.uppercase() ?: "—",
                        subValue = topGenre?.let { "${it.second} artists" } ?: "",
                        accentColor = AcidYellow
                    )

                    // MOST DIVERSE card
                    StatCard(
                        modifier = Modifier.weight(1f),
                        label = "MOST DIVERSE",
                        value = mostDiverseCountry?.key?.uppercase() ?: "—",
                        subValue = mostDiverseCountry?.let { "${it.value.size} genres" } ?: "",
                        accentColor = CyanPulse
                    )
                }
            }
        }
    }
}

@Composable
private fun StatCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String,
    subValue: String,
    accentColor: Color
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(CardBackground)
            .border(1.dp, accentColor.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Text(
            text = label,
            color = TextMuted,
            fontSize = 9.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.5.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = value,
            color = accentColor,
            fontSize = 16.sp,
            fontWeight = FontWeight.Black,
            fontStyle = FontStyle.Italic,
            letterSpacing = (-0.5).sp
        )
        if (subValue.isNotEmpty()) {
            Text(
                text = subValue,
                color = TextMuted,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
