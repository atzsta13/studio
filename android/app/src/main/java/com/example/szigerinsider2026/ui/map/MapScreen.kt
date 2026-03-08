package com.example.szigerinsider2026.ui.map

import androidx.compose.animation.core.InfiniteRepeatableSpec
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.szigerinsider2026.data.model.MapCoords
import com.example.szigerinsider2026.data.repository.FoodRepository
import com.example.szigerinsider2026.data.repository.POIRepository
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import androidx.compose.animation.AnimatedVisibility
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle

sealed class MapPin(
    val id: String,
    val name: String,
    val coords: MapCoords,
    val icon: ImageVector,
    val color: Color,
    val type: String
) {
    class Stage(id: String, name: String, coords: MapCoords) : MapPin(id, name, coords, Icons.Default.MusicNote, PrimaryMagenta, "music")
    class Food(id: String, name: String, coords: MapCoords) : MapPin(id, name, coords, Icons.Default.Restaurant, ToxicGreen, "food")
    class POI(id: String, name: String, coords: MapCoords, icon: ImageVector, color: Color, val subType: String) : MapPin(id, name, coords, icon, color, "util")
}

@Composable
fun MapScreen() {
    val context = LocalContext.current
    val viewModel: MapViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return MapViewModel(
                    POIRepository(context),
                    FoodRepository(context)
                ) as T
            }
        }
    )

    val haptic = rememberHapticManager()
    val activeCategory by viewModel.activeCategory.collectAsStateWithLifecycle()
    val filteredPois by viewModel.filteredPois.collectAsStateWithLifecycle()
    var selectedPin by remember { mutableStateOf<MapPin?>(null) }

    val pins = remember(filteredPois) {
        filteredPois.map { p ->
            when(p.type) {
                "stage" -> MapPin.Stage(p.id, p.name, p.mapCoords ?: MapCoords(0, 0))
                "food" -> MapPin.Food(p.id, p.name, p.mapCoords ?: MapCoords(0, 0))
                else -> {
                    val icon = when(p.type) {
                        "water" -> Icons.Default.WaterDrop
                        "first-aid" -> Icons.Default.Healing
                        "toilet" -> Icons.Default.Wc
                        else -> Icons.Default.Info
                    }
                    val color = when(p.type) {
                        "water" -> CyanPulse
                        "first-aid" -> Color.Red
                        else -> AcidYellow
                    }
                    MapPin.POI(p.id, p.name, p.mapCoords ?: MapCoords(0, 0), icon, color, p.type)
                }
            }
        }
    }

    val hydrationMode = activeCategory == "water"

    // Task 2 — infinite pulse animation for water pins
    val infiniteTransition = rememberInfiniteTransition(label = "water_pulse")
    val waterPulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = InfiniteRepeatableSpec(
            animation = tween(800),
            repeatMode = RepeatMode.Reverse
        ),
        label = "water_alpha"
    )

    // Task 3 — nearest water station
    val nearestWater = remember(filteredPois, activeCategory) {
        if (activeCategory != "water") return@remember null
        filteredPois
            .filter { it.type == "water" }
            .minByOrNull { p ->
                val dx = (p.mapCoords?.x ?: 50) - 50
                val dy = (p.mapCoords?.y ?: 50) - 50
                dx * dx + dy * dy
            }
    }
    val nearestWaterDistance = remember(nearestWater) {
        nearestWater?.mapCoords?.let { c ->
            val dx = c.x - 50
            val dy = c.y - 50
            kotlin.math.sqrt((dx * dx + dy * dy).toDouble()).toInt()
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(OLEDBlack)) {
        // Visual Map Area
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 80.dp) // Bottom Navigation offset
        ) {
            // Task 1 — BoxWithConstraints for proper coordinate scaling
            BoxWithConstraints(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp)
                    .clip(RoundedCornerShape(60.dp))
                    .background(MutedBackground.copy(alpha = 0.2f))
                    .border(2.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(60.dp))
            ) {
                val mapWidth = maxWidth
                val mapHeight = maxHeight
                pins.forEach { pin ->
                    val xFraction = pin.coords.x / 100f
                    val yFraction = pin.coords.y / 100f
                    // Task 2 — per-pin alpha based on hydration mode
                    val pinAlpha = when {
                        hydrationMode && pin.type == "water" -> waterPulseAlpha
                        hydrationMode -> 0.2f
                        else -> 1f
                    }
                    Box(
                        modifier = Modifier
                            .offset(
                                x = mapWidth * xFraction - 20.dp,
                                y = mapHeight * yFraction - 20.dp
                            )
                            .size(if (selectedPin == pin) 48.dp else 40.dp)
                            .graphicsLayer { alpha = pinAlpha }
                            .clip(CircleShape)
                            .background(if (selectedPin == pin) Color.White else pin.color)
                            .border(2.dp, Color.Black.copy(alpha = 0.5f), CircleShape)
                            .clickable { haptic.mediumTap(); selectedPin = pin },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = pin.icon,
                            contentDescription = pin.name,
                            tint = if (selectedPin == pin) pin.color else Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }

        // Header Interface
        Column(
            modifier = Modifier
                .padding(24.dp)
                .align(Alignment.TopStart)
        ) {
            Text(
                text = "ISLAND RADAR",
                style = BrutalistTypography.headlineLarge
            )
            Text(
                text = "TACTICAL NAVIGATION",
                style = BrutalistTypography.labelSmall,
                color = TextMuted
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Categories
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CategoryChip("ALL", activeCategory == "all") { viewModel.selectCategory("all") }
                CategoryChip("STAGES", activeCategory == "music") { viewModel.selectCategory("music") }
                CategoryChip("FOOD", activeCategory == "food") { viewModel.selectCategory("food") }
            }

            // Task 3 — nearest water indicator
            AnimatedVisibility(visible = nearestWater != null) {
                nearestWater?.let { poi ->
                    Column(modifier = Modifier.padding(top = 16.dp)) {
                        Text(
                            text = "NEAREST WATER",
                            style = BrutalistTypography.labelSmall,
                            color = CyanPulse
                        )
                        Text(
                            text = poi.name.uppercase(),
                            style = BrutalistTypography.titleLarge,
                            color = TextPrimary
                        )
                        Text(
                            text = "~${nearestWaterDistance} steps from center",
                            style = BrutalistTypography.labelSmall,
                            color = TextMuted
                        )
                    }
                }
            }
        }

        // Hydration FAB
        FloatingActionButton(
            onClick = {
                if (hydrationMode) viewModel.selectCategory("all")
                else viewModel.selectCategory("water")
            },
            modifier = Modifier
                .padding(24.dp)
                .align(Alignment.TopEnd)
                .size(64.dp),
            shape = CircleShape,
            containerColor = if (hydrationMode) CyanPulse else CardBackground,
            contentColor = if (hydrationMode) Color.White else CyanPulse
        ) {
            Icon(Icons.Default.WaterDrop, contentDescription = "Hydration Mode", modifier = Modifier.size(32.dp))
        }

        // Selected Pin Card
        AnimatedVisibility(
            visible = selectedPin != null,
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 100.dp, start = 24.dp, end = 24.dp)
        ) {
            selectedPin?.let { pin ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(32.dp),
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
                ) {
                    Row(modifier = Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier.size(64.dp).clip(RoundedCornerShape(16.dp)).background(pin.color),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(pin.icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(32.dp))
                        }
                        Spacer(modifier = Modifier.width(20.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = pin.name.uppercase(), style = BrutalistTypography.titleLarge)
                            Text(text = pin.type.uppercase(), style = BrutalistTypography.labelSmall, color = TextMuted)
                        }
                        IconButton(onClick = { selectedPin = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryChip(text: String, isSelected: Boolean, onClick: () -> Unit) {
    val haptic = rememberHapticManager()
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) AcidYellow else CardBackground)
            .clickable { haptic.lightTap(); onClick() }
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = text,
            style = BrutalistTypography.labelSmall,
            color = if (isSelected) Color.Black else TextPrimary
        )
    }
}
