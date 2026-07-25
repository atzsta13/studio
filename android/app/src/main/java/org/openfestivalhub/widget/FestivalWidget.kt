package org.openfestivalhub.widget

import android.content.Context
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.clickable
import androidx.glance.action.actionStartActivity
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import org.openfestivalhub.MainActivity
import org.openfestivalhub.data.local.AppDatabase
import org.openfestivalhub.data.config.FestivalConfig
import kotlinx.coroutines.flow.first
import java.time.LocalDate
import java.time.temporal.ChronoUnit

class FestivalWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        // Ensure config is initialized even for widget process
        FestivalConfig.initialize(context)

        val db = AppDatabase.getDatabase(context)
        val favorites = db.userDao().getAllFavorites().first()

        val config = FestivalConfig.current
        val accentColor = Color(java.lang.Long.decode(config.theme.androidAccentLong))

        // Countdown calculation
        val today = LocalDate.now()
        val startDate = LocalDate.parse(config.dates.startDate)
        val endDate = LocalDate.parse(config.dates.endDate)
        val daysUntil = ChronoUnit.DAYS.between(today, startDate)

        val countdownText = when {
            today.isBefore(startDate) -> "${daysUntil} DAYS"
            today.isAfter(endDate) -> "SEE YOU NEXT YEAR"
            else -> "NOW 🔥" // NOW 🔥
        }
        val isLive = !today.isBefore(startDate) && !today.isAfter(endDate)
        val countdownColor = if (isLive || today.isBefore(startDate)) accentColor else Color(0xFFA1A1AA)

        provideContent {
            GlanceTheme {
                Column(
                    modifier = GlanceModifier
                        .fillMaxSize()
                        .background(ColorProvider(Color(0xFF000000)))
                        .clickable(actionStartActivity<MainActivity>())
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Festival name — small, muted, uppercase
                    Text(
                        text = config.fullName.uppercase(),
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFA1A1AA)),
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    )
                    Spacer(modifier = GlanceModifier.height(4.dp))
                    // Countdown — large, AcidYellow if future/live
                    Text(
                        text = countdownText,
                        style = TextStyle(
                            color = ColorProvider(countdownColor),
                            fontWeight = FontWeight.Bold,
                            fontSize = 22.sp
                        )
                    )
                    Spacer(modifier = GlanceModifier.height(6.dp))
                    // Favorites count
                    Text(
                        text = "♥ ${favorites.size} SAVED",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFFFFFFF)),
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                    Spacer(modifier = GlanceModifier.height(8.dp))
                    Text(
                        text = "TAP TO OPEN →",
                        style = TextStyle(
                            color = ColorProvider(accentColor),
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    )
                }
            }
        }
    }
}
