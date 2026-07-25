package com.example.szigerinsider2026.ui.splash

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Festival
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.ArrowForwardIos
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.data.config.FestivalConfig
import com.example.szigerinsider2026.ui.theme.OLEDBlack

private data class FestivalEntry(
    val id: String, 
    val label: String, 
    val location: String,
    val primaryColor: Color,
    val tagline: String
)

@Composable
fun FestivalSelectionScreen(
    navController: NavController,
    isSwitch: Boolean = false,
) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val festivals = remember {
        FestivalConfig.AVAILABLE_IDS.mapNotNull { id ->
            FestivalConfig.load(context, id)?.let { config ->
                FestivalEntry(
                    id = id, 
                    label = config.name, 
                    location = "${config.location.city}, ${config.location.country}",
                    primaryColor = Color(java.lang.Long.decode(config.theme.androidPrimaryLong)),
                    tagline = config.tagline
                )
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
    ) {
        // Dynamic background glow based on first festival or current theme
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.08f),
                            OLEDBlack
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(WindowInsets.systemBars.asPaddingValues())
                .padding(horizontal = 24.dp)
        ) {
            Spacer(Modifier.height(32.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Festival,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(Modifier.width(12.dp))
                Text(
                    text = "INSIDER PLATFORM",
                    style = MaterialTheme.typography.labelMedium.copy(
                        letterSpacing = 3.sp,
                        fontWeight = FontWeight.Black
                    ),
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Spacer(Modifier.height(24.dp))

            Text(
                text = if (isSwitch) "SWITCH\nFESTIVAL" else "SELECT\nSTATION",
                style = MaterialTheme.typography.displayLarge.copy(
                    fontSize = 54.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    lineHeight = 50.sp,
                    letterSpacing = (-3).sp
                ),
                color = Color.White
            )

            Text(
                text = "CHOOSE YOUR OPERATIONAL THEATER FOR THE 2026 SEASON",
                style = MaterialTheme.typography.bodySmall.copy(
                    letterSpacing = 1.sp,
                    fontWeight = FontWeight.Bold
                ),
                color = Color.White.copy(alpha = 0.5f),
                modifier = Modifier.padding(top = 12.dp)
            )

            Spacer(Modifier.height(40.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(bottom = 32.dp)
            ) {
                items(festivals) { fest ->
                    val isActive = isSwitch && FestivalConfig.isSelected(context) &&
                            FestivalConfig.getSelectedId(context) == fest.id
                    
                    FestivalCard(
                        fest = fest,
                        isActive = isActive,
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            FestivalConfig.switchFestival(context, fest.id)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun FestivalCard(
    fest: FestivalEntry,
    isActive: Boolean,
    onClick: () -> Unit
) {
    val borderColor = if (isActive) fest.primaryColor else Color.White.copy(alpha = 0.15f)
    val containerColor = if (isActive) fest.primaryColor.copy(alpha = 0.05f) else Color.White.copy(alpha = 0.02f)

    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        color = containerColor,
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(
            width = if (isActive) 2.dp else 1.dp,
            color = borderColor
        )
    ) {
        Row(
            modifier = Modifier
                .padding(24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = fest.label.uppercase(),
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-1).sp
                    ),
                    color = if (isActive) fest.primaryColor else Color.White
                )
                
                Text(
                    text = fest.tagline.uppercase(),
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = if (isActive) fest.primaryColor.copy(alpha = 0.7f) else Color.White.copy(alpha = 0.3f),
                    modifier = Modifier.padding(top = 2.dp)
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = Color.White.copy(alpha = 0.4f),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = fest.location.uppercase(),
                        style = MaterialTheme.typography.labelSmall.copy(
                            letterSpacing = 1.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        color = Color.White.copy(alpha = 0.4f)
                    )
                }
            }

            if (isActive) {
                Surface(
                    color = fest.primaryColor,
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier.padding(start = 16.dp)
                ) {
                    Text(
                        text = "ACTIVE",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Black,
                            color = Color.Black
                        )
                    )
                }
            } else {
                Icon(
                    imageVector = Icons.Default.ArrowForwardIos,
                    contentDescription = null,
                    tint = Color.White.copy(alpha = 0.2f),
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}
