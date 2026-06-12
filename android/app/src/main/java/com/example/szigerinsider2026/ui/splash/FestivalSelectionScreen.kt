package com.example.szigerinsider2026.ui.splash

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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

private data class FestivalEntry(val id: String, val label: String, val location: String)

private val FESTIVALS = listOf(
    FestivalEntry("sziget-2026",      "Sziget",      "Budapest, Hungary"),
    FestivalEntry("novarock-2026",    "Nova Rock",   "Nickelsdorf, Austria"),
    FestivalEntry("frequency-2026",   "Frequency",   "St. Pölten, Austria"),
    FestivalEntry("area53-2026",      "Area 53",     "Wiesen, Austria"),
    FestivalEntry("ernte-punk-2026",  "Ernte Punk",  "Güssing, Austria"),
    FestivalEntry("rock-am-ring-2026","Rock am Ring", "Nürburgring, Germany"),
)

@Composable
fun FestivalSelectionScreen(
    navController: NavController,
    isSwitch: Boolean = false,
) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
            .padding(WindowInsets.systemBars.asPaddingValues())
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp)) {
            Spacer(Modifier.height(48.dp))

            Text(
                text = if (isSwitch) "SWITCH\nFESTIVAL" else "CHOOSE\nYOUR\nFESTIVAL",
                fontSize = 56.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                color = Color.White,
                lineHeight = 52.sp,
                letterSpacing = (-2).sp
            )

            Spacer(Modifier.height(8.dp))

            Text(
                text = "FESTIVAL INSIDER · 2026",
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.primary,
                letterSpacing = 3.sp
            )

            Spacer(Modifier.height(40.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(FESTIVALS) { fest ->
                    val isActive = isSwitch && FestivalConfig.isSelected(context) &&
                            FestivalConfig.getSelectedId(context) == fest.id
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(
                                width = if (isActive) 2.dp else 1.dp,
                                color = if (isActive) MaterialTheme.colorScheme.primary
                                        else Color.White.copy(alpha = 0.12f)
                            )
                            .clickable {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                if (isSwitch) {
                                    FestivalConfig.switchFestival(context, fest.id)
                                } else {
                                    FestivalConfig.switchFestival(context, fest.id)
                                }
                            }
                            .padding(horizontal = 20.dp, vertical = 18.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = fest.label.uppercase(),
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                fontStyle = FontStyle.Italic,
                                color = if (isActive) MaterialTheme.colorScheme.primary else Color.White,
                                letterSpacing = (-0.5).sp
                            )
                            Text(
                                text = fest.location,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White.copy(alpha = 0.4f),
                                letterSpacing = 1.sp
                            )
                        }
                        if (isActive) {
                            Text(
                                text = "ACTIVE",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = MaterialTheme.colorScheme.primary,
                                letterSpacing = 2.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
