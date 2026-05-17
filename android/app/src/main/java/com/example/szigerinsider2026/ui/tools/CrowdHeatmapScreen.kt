package com.example.szigerinsider2026.ui.tools

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

private data class HeatZone(val label: String, val col: Int, val row: Int, val density: Float)

private val HEAT_ZONES = listOf(
    HeatZone("MAIN STAGE", 1, 1, 1.0f),
    HeatZone("MAIN STAGE", 2, 1, 0.9f),
    HeatZone("MAIN STAGE", 3, 1, 0.95f),
    HeatZone("MAIN STAGE", 1, 2, 0.8f),
    HeatZone("MAIN STAGE", 2, 2, 0.85f),
    HeatZone("MAIN STAGE", 3, 2, 0.75f),
    HeatZone("A38 STAGE", 5, 1, 0.7f),
    HeatZone("A38 STAGE", 6, 1, 0.65f),
    HeatZone("A38 STAGE", 5, 2, 0.6f),
    HeatZone("A38 STAGE", 6, 2, 0.55f),
    HeatZone("ISLAND STAGE", 3, 4, 0.45f),
    HeatZone("ISLAND STAGE", 4, 4, 0.4f),
    HeatZone("FOOD COURT", 6, 4, 0.3f),
    HeatZone("FOOD COURT", 7, 4, 0.25f),
    HeatZone("CAMPING", 2, 5, 0.1f),
    HeatZone("CAMPING", 3, 5, 0.15f),
)

private fun densityColor(density: Float): Color = when {
    density >= 0.75f -> PrimaryMagenta
    density >= 0.4f -> AcidYellow
    else -> ToxicGreen
}

private fun densityLabel(density: Float) = when {
    density >= 0.75f -> "PACKED"
    density >= 0.4f -> "BUSY"
    else -> "COMFY"
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CrowdHeatmapScreen(navController: NavController) {
    val haptic = rememberHapticManager()

    Scaffold(
        containerColor = OLEDBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "CROWD HEATMAP",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-1).sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { haptic.lightTap(); navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OLEDBlack)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(OLEDBlack)
                .padding(padding)
                .padding(horizontal = 20.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            item {
                Text(
                    text = "ESTIMATED CROWD DENSITY · LIVE SIMULATION",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(bottom = 20.dp)
                )
            }

            item {
                // 8 columns x 6 rows grid
                val cols = 8
                val rows = 6
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(CardBackground)
                        .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(20.dp))
                        .padding(16.dp)
                ) {
                    for (row in 0 until rows) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            for (col in 0 until cols) {
                                val zone = HEAT_ZONES.find { it.col == col && it.row == row }
                                val bgColor = if (zone != null) densityColor(zone.density).copy(alpha = 0.35f + zone.density * 0.4f) else MutedBackground.copy(alpha = 0.2f)
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .aspectRatio(1f)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(bgColor),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (zone != null) {
                                        Text(
                                            text = "●",
                                            color = densityColor(zone.density),
                                            fontSize = 10.sp
                                        )
                                    }
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                // Legend
                Text(
                    text = "LEGEND",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    listOf(
                        PrimaryMagenta to "PACKED",
                        AcidYellow to "BUSY",
                        ToxicGreen to "COMFY"
                    ).forEach { (color, label) ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(12.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(color)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(label, color = color, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Zone summary cards
            val stageGroups = HEAT_ZONES.distinctBy { it.label }.map { z ->
                val zones = HEAT_ZONES.filter { it.label == z.label }
                val avgDensity = zones.map { it.density }.average().toFloat()
                z.label to avgDensity
            }.distinctBy { it.first }

            item {
                Text(
                    text = "ZONE STATUS",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    stageGroups.forEach { (name, density) ->
                        val color = densityColor(density)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(CardBackground)
                                .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(name, color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(100.dp))
                                    .background(color.copy(alpha = 0.15f))
                                    .border(1.dp, color.copy(alpha = 0.4f), RoundedCornerShape(100.dp))
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(densityLabel(density), color = color, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
