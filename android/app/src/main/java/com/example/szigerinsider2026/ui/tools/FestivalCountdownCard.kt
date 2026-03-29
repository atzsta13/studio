package com.example.szigerinsider2026.ui.tools

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.szigerinsider2026.data.config.FestivalConfig
import com.example.szigerinsider2026.ui.theme.*
import kotlinx.coroutines.delay
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.LocalDate

private data class CountdownState(
    val days: Long,
    val hours: Long,
    val minutes: Long,
    val seconds: Long
)

private fun computeCountdown(): CountdownState {
    val config = FestivalConfig.current
    val startDate = LocalDate.parse(config.dates.startDate)
    val target = ZonedDateTime.of(startDate.atStartOfDay(), ZoneId.of(config.location.timezone))
    val now = ZonedDateTime.now(ZoneId.of(config.location.timezone))
    val totalSeconds = java.time.Duration.between(now, target).seconds.coerceAtLeast(0)
    val days = totalSeconds / 86400
    val hours = (totalSeconds % 86400) / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    return CountdownState(days, hours, minutes, seconds)
}

private fun isFestivalLive(): Boolean {
    val config = FestivalConfig.current
    val now = ZonedDateTime.now(ZoneId.of(config.location.timezone))
    val startDate = LocalDate.parse(config.dates.startDate)
    val endDate = LocalDate.parse(config.dates.endDate)
    val start = ZonedDateTime.of(startDate.atStartOfDay(), ZoneId.of(config.location.timezone))
    val end = ZonedDateTime.of(endDate.atTime(23, 59, 59), ZoneId.of(config.location.timezone))
    return now >= start && now < end
}

private fun isFestivalOver(): Boolean {
    val config = FestivalConfig.current
    val now = ZonedDateTime.now(ZoneId.of(config.location.timezone))
    val endDate = LocalDate.parse(config.dates.endDate)
    val end = ZonedDateTime.of(endDate.atTime(23, 59, 59), ZoneId.of(config.location.timezone))
    return now >= end
}

@Composable
fun FestivalCountdownCard() {
    var countdown by remember { mutableStateOf(computeCountdown()) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            countdown = computeCountdown()
        }
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, MaterialTheme.colorScheme.secondary, RoundedCornerShape(20.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Text(
                text = "COUNTDOWN TO ${FestivalConfig.NAME.uppercase()} ${FestivalConfig.current.dates.year}",
                color = MaterialTheme.colorScheme.secondary,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                letterSpacing = 0.5.sp,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            when {
                isFestivalLive() -> {
                    Text(
                        text = "FESTIVAL IS LIVE",
                        color = MaterialTheme.colorScheme.secondary,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-1).sp
                    )
                }
                isFestivalOver() -> {
                    val config = FestivalConfig.current
                    Text(
                        text = "SEE YOU AT ${config.name.uppercase()} ${config.dates.year + 1}",
                        color = TextMuted,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic
                    )
                }
                else -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CountdownBox(value = "%03d".format(countdown.days), label = "DAYS", modifier = Modifier.weight(1f))
                        CountdownBox(value = "%02d".format(countdown.hours), label = "HRS", modifier = Modifier.weight(1f))
                        CountdownBox(value = "%02d".format(countdown.minutes), label = "MIN", modifier = Modifier.weight(1f))
                        CountdownBox(value = "%02d".format(countdown.seconds), label = "SEC", modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun CountdownBox(value: String, label: String, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(OLEDBlack)
            .border(1.dp, MaterialTheme.colorScheme.secondary.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
            .padding(vertical = 12.dp, horizontal = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = value,
                color = MaterialTheme.colorScheme.secondary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                letterSpacing = (-1).sp
            )
            Text(
                text = label,
                color = TextMuted,
                fontSize = 10.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.5.sp
            )
        }
    }
}
