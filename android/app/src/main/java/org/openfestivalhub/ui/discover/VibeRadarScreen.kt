package org.openfestivalhub.ui.discover

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.*
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.utils.rememberHapticManager
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.PI

private val radarChartColors = listOf(AcidYellow, PrimaryMagenta, CyanPulse, ToxicGreen)
private const val RADAR_N = 8
private const val RADAR_RINGS = 3

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VibeRadarScreen(navController: NavController) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()

    val statsViewModel: LineupStatsViewModel = viewModel(
        factory = LineupStatsViewModel.Factory(context)
    )

    val vibeStats by statsViewModel.vibeStats.collectAsStateWithLifecycle()

    val top8 = remember(vibeStats) { vibeStats.take(RADAR_N) }
    val totalVibeCount = remember(vibeStats) { vibeStats.sumOf { it.second } }
    val maxVibeCount = remember(top8) { top8.maxOfOrNull { it.second } ?: 1 }

    // Animate radar scale from 0 to 1
    var animate by remember { mutableStateOf(false) }
    LaunchedEffect(top8) {
        if (top8.isNotEmpty()) animate = true
    }
    val animatedScale by animateFloatAsState(
        targetValue = if (animate) 1f else 0f,
        animationSpec = tween(durationMillis = 700),
        label = "radar_scale"
    )

    val density = LocalDensity.current
    val textMeasurer = rememberTextMeasurer()

    Scaffold(
        containerColor = OLEDBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "VIBE RADAR",
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
                    text = "$totalVibeCount TOTAL VIBE TAGS",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
                )
            }

            // Radar chart
            item {
                if (top8.isNotEmpty()) {
                    val normalizedValues = top8.map { it.second.toFloat() / maxVibeCount }
                    val labels = top8.map { it.first }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(1f)
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val cx = size.width / 2f
                            val cy = size.height / 2f
                            // Leave margin for labels
                            val labelMargin = 48.dp.toPx()
                            val maxR = (minOf(cx, cy) - labelMargin) * animatedScale

                            val n = top8.size.coerceAtLeast(3)

                            // Helper: vertex position for index i at radius r
                            fun vertexAt(i: Int, r: Float): Offset {
                                val angle = (2.0 * PI * i / n - PI / 2).toFloat()
                                return Offset(cx + r * cos(angle), cy + r * sin(angle))
                            }

                            // Draw concentric ring grid
                            for (ring in 1..RADAR_RINGS) {
                                val ringR = maxR * ring / RADAR_RINGS
                                val gridPath = Path()
                                for (i in 0 until n) {
                                    val v = vertexAt(i, ringR)
                                    if (i == 0) gridPath.moveTo(v.x, v.y) else gridPath.lineTo(v.x, v.y)
                                }
                                gridPath.close()
                                drawPath(
                                    path = gridPath,
                                    color = Color.White.copy(alpha = 0.12f),
                                    style = Stroke(width = 1.dp.toPx())
                                )
                            }

                            // Draw spokes
                            for (i in 0 until n) {
                                val v = vertexAt(i, maxR)
                                drawLine(
                                    color = Color.White.copy(alpha = 0.1f),
                                    start = Offset(cx, cy),
                                    end = v,
                                    strokeWidth = 1.dp.toPx()
                                )
                            }

                            // Draw filled data polygon
                            if (maxR > 0f) {
                                val dataPath = Path()
                                for (i in 0 until n) {
                                    val r = normalizedValues.getOrElse(i) { 0f } * maxR * animatedScale
                                    val v = vertexAt(i, r)
                                    if (i == 0) dataPath.moveTo(v.x, v.y) else dataPath.lineTo(v.x, v.y)
                                }
                                dataPath.close()

                                // Fill
                                drawPath(
                                    path = dataPath,
                                    color = AcidYellow.copy(alpha = 0.3f)
                                )
                                // Stroke
                                drawPath(
                                    path = dataPath,
                                    color = AcidYellow,
                                    style = Stroke(width = 2.dp.toPx())
                                )

                                // Data dots
                                for (i in 0 until n) {
                                    val r = normalizedValues.getOrElse(i) { 0f } * maxR * animatedScale
                                    val v = vertexAt(i, r)
                                    drawCircle(color = AcidYellow, radius = 4.dp.toPx(), center = v)
                                }
                            }

                            // Draw vertex labels (using drawText requires textMeasurer)
                            val labelRadius = maxR / animatedScale.coerceAtLeast(0.01f) + labelMargin * 0.9f
                            for (i in 0 until n) {
                                val angle = (2.0 * PI * i / n - PI / 2).toFloat()
                                val lx = cx + labelRadius * cos(angle)
                                val ly = cy + labelRadius * sin(angle)

                                val labelText = labels.getOrElse(i) { "" }.uppercase()
                                val measuredText = textMeasurer.measure(
                                    AnnotatedString(labelText),
                                    style = TextStyle(
                                        color = Color.White,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Black,
                                        letterSpacing = 0.5.sp
                                    )
                                )
                                drawText(
                                    textLayoutResult = measuredText,
                                    topLeft = Offset(
                                        lx - measuredText.size.width / 2f,
                                        ly - measuredText.size.height / 2f
                                    )
                                )
                            }
                        }
                    }
                }
            }

            // Section header
            item {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "ALL VIBES",
                    color = TextMuted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }

            // Vibe rows sorted descending
            itemsIndexed(vibeStats) { index, (vibe, count) ->
                val barColor = radarChartColors[index % radarChartColors.size]
                val fraction = if (maxVibeCount > 0) count.toFloat() / maxVibeCount else 0f

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = vibe.uppercase(),
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 0.3.sp,
                        modifier = Modifier.width(120.dp)
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    // Inline bar
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(10.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color.White.copy(alpha = 0.07f))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxHeight()
                                .fillMaxWidth(fraction)
                                .clip(RoundedCornerShape(3.dp))
                                .background(barColor.copy(alpha = 0.7f))
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Text(
                        text = count.toString(),
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.width(28.dp)
                    )
                }
            }
        }
    }
}
