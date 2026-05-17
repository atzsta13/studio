package com.example.szigerinsider2026.ui.tools

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class NewsItem(
    val title: String,
    val body: String? = null,
    val timestamp: String? = null
)

private val FALLBACK_NEWS = listOf(
    NewsItem("Festival gates open at 10:00", "All entry gates will open at 10:00 AM. Have your wristband ready for scanning.", "Day 1 · 10:00"),
    NewsItem("Free water stations at all stages", "Hydration points are located at every stage entrance. Bring a reusable bottle.", "All Days · 24h"),
    NewsItem("Lost & Found at main entrance", "Lost items can be claimed at the main entrance tent. Open 8:00–22:00 daily.", "All Days"),
    NewsItem("Silent Disco opens tonight at 23:00", "The silent disco tent hosts 3 channels until 5 AM. Headphones provided.", "Tonight · 23:00"),
    NewsItem("No re-entry after midnight", "Wristband scanning is required for all re-entry. Night taxis available outside gate A.", "Security Notice")
)

private fun loadNews(context: Context): List<NewsItem> {
    return try {
        val stream = context.assets.open("survival.json")
        val json = stream.bufferedReader().readText()
        val parsed = Json { ignoreUnknownKeys = true }.parseToJsonElement(json)
        val newsArr = parsed.let {
            (it as? kotlinx.serialization.json.JsonObject)?.get("news")
        } as? kotlinx.serialization.json.JsonArray
        newsArr?.mapNotNull { element ->
            try {
                Json { ignoreUnknownKeys = true }.decodeFromJsonElement(NewsItem.serializer(), element)
            } catch (e: Exception) { null }
        } ?: FALLBACK_NEWS
    } catch (e: Exception) {
        FALLBACK_NEWS
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewsBulletinScreen(navController: NavController) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val news = remember { loadNews(context) }

    Scaffold(
        containerColor = OLEDBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "NEWS BULLETIN",
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
            contentPadding = PaddingValues(bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Text(
                    text = "FESTIVAL UPDATES & ANNOUNCEMENTS",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }
            items(news) { item ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(CardBackground)
                        .border(1.dp, CyanPulse.copy(alpha = 0.15f), RoundedCornerShape(16.dp))
                        .padding(18.dp)
                ) {
                    Column {
                        item.timestamp?.let { ts ->
                            Text(
                                text = ts.uppercase(),
                                color = CyanPulse,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.5.sp,
                                modifier = Modifier.padding(bottom = 6.dp)
                            )
                        }
                        Text(
                            text = item.title,
                            color = TextPrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            lineHeight = 22.sp,
                            modifier = Modifier.padding(bottom = if (item.body != null) 8.dp else 0.dp)
                        )
                        item.body?.let { body ->
                            Text(
                                text = body,
                                color = TextMuted,
                                fontSize = 13.sp,
                                lineHeight = 20.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
