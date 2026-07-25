package org.openfestivalhub.ui.tools

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.openfestivalhub.data.model.DailyForecast
import org.openfestivalhub.data.model.WeatherData
import org.openfestivalhub.ui.theme.*

private fun weatherIcon(code: Int): ImageVector = when (code) {
    0 -> Icons.Default.WbSunny
    1, 2, 3 -> Icons.Default.WbCloudy
    in 51..65, in 80..82 -> Icons.Default.Umbrella
    in 71..77, 85, 86 -> Icons.Default.AcUnit
    in 95..99 -> Icons.Default.Thunderstorm
    else -> Icons.Default.Cloud
}

private fun weatherIconTint(code: Int): Color = when (code) {
    0 -> Color(0xFFF97316)
    1, 2, 3 -> Color(0xFFADB5BD)
    in 51..65, in 80..82 -> Color(0xFF60A5FA)
    in 95..99 -> Color(0xFFFFFF00)
    else -> Color(0xFFADB5BD)
}

@Composable
fun WeatherCard(weather: WeatherData) {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(48.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CyanPulse.copy(alpha = 0.15f), RoundedCornerShape(48.dp))
    ) {
        Column(modifier = Modifier.padding(28.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 16.dp)) {
                Box(
                    modifier = Modifier.size(52.dp).clip(RoundedCornerShape(16.dp)).background(CyanPulse.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.WbSunny, contentDescription = null, tint = CyanPulse, modifier = Modifier.size(28.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text("WEATHER", color = CyanPulse, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-0.5).sp)
                    Text("Budapest · Open-Meteo", color = TextMuted, fontSize = 11.sp)
                }
            }

            if (weather.rainAlert) {
                val infiniteTransition = rememberInfiniteTransition(label = "rain")
                val alpha by infiniteTransition.animateFloat(
                    initialValue = 0.7f, targetValue = 1f,
                    animationSpec = infiniteRepeatable(tween(800), RepeatMode.Reverse),
                    label = "rainAlpha"
                )
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF60A5FA).copy(alpha = 0.15f * alpha))
                        .border(1.dp, Color(0xFF60A5FA).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                        .padding(12.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Umbrella, contentDescription = null, tint = Color(0xFF60A5FA), modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Rain likely in the next 24h — pack a poncho!", color = Color(0xFF60A5FA), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            if (weather.daily.isEmpty()) {
                Text("Loading forecast...", color = TextMuted, fontSize = 14.sp)
            } else {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(weather.daily.take(5)) { day -> DayForecastItem(day) }
                }
            }
        }
    }
}

@Composable
private fun DayForecastItem(day: DailyForecast) {
    val shortDate = day.date.takeLast(5)
    val icon = weatherIcon(day.weatherCode)
    val tint = weatherIconTint(day.weatherCode)

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(OLEDBlack)
            .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(20.dp))
            .padding(12.dp)
            .width(64.dp)
    ) {
        Text(shortDate, color = TextMuted, fontSize = 10.sp, fontWeight = FontWeight.Black)
        Spacer(modifier = Modifier.height(8.dp))
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(28.dp))
        Spacer(modifier = Modifier.height(8.dp))
        Text("${day.maxTemp.toInt()}°", color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Black)
        Text("${day.minTemp.toInt()}°", color = TextMuted, fontSize = 12.sp)
        if (day.precipProbability > 0) {
            Spacer(modifier = Modifier.height(4.dp))
            Text("${day.precipProbability}%", color = Color(0xFF60A5FA), fontSize = 10.sp, fontWeight = FontWeight.Black)
        }
    }
}
