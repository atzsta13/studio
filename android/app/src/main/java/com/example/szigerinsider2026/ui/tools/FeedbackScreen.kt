package com.example.szigerinsider2026.ui.tools

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class FeedbackEntry(
    val category: String,
    val text: String,
    val timestamp: Long
)

private fun saveFeedback(context: Context, entry: FeedbackEntry) {
    val prefs = context.getSharedPreferences("festival_feedback", Context.MODE_PRIVATE)
    val existing = prefs.getString("feedback_entries", "[]") ?: "[]"
    val list = try {
        Json.decodeFromString<List<FeedbackEntry>>(existing).toMutableList()
    } catch (e: Exception) {
        mutableListOf()
    }
    list.add(entry)
    prefs.edit().putString("feedback_entries", Json.encodeToString(list)).apply()
}

private val FEEDBACK_CATEGORIES = listOf("Bug", "Suggestion", "Safety")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackScreen(navController: NavController) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val snackbarHostState = remember { SnackbarHostState() }

    var feedbackText by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Suggestion") }
    var submitted by remember { mutableStateOf(false) }

    LaunchedEffect(submitted) {
        if (submitted) {
            snackbarHostState.showSnackbar("Feedback saved locally. Thank you!")
            submitted = false
            feedbackText = ""
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = OLEDBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "FEEDBACK",
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
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "SHARE YOUR THOUGHTS",
                    color = TextMuted,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(bottom = 20.dp)
                )
            }

            item {
                Text(
                    text = "CATEGORY",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(bottom = 24.dp)) {
                    FEEDBACK_CATEGORIES.forEach { cat ->
                        val isSelected = selectedCategory == cat
                        val chipColor = when (cat) {
                            "Bug" -> RedWarning
                            "Safety" -> PrimaryMagenta
                            else -> CyanPulse
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(100.dp))
                                .background(if (isSelected) chipColor.copy(alpha = 0.2f) else CardBackground)
                                .border(1.dp, if (isSelected) chipColor else Color.White.copy(alpha = 0.1f), RoundedCornerShape(100.dp))
                                .clickable { haptic.lightTap(); selectedCategory = cat }
                                .padding(horizontal = 16.dp, vertical = 10.dp)
                        ) {
                            Text(
                                text = cat.uppercase(),
                                color = if (isSelected) chipColor else TextMuted,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            )
                        }
                    }
                }
            }

            item {
                Text(
                    text = "YOUR MESSAGE",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(CardBackground)
                        .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    BasicTextField(
                        value = feedbackText,
                        onValueChange = { feedbackText = it },
                        modifier = Modifier.fillMaxSize(),
                        textStyle = TextStyle(color = TextPrimary, fontSize = 15.sp, lineHeight = 22.sp),
                        cursorBrush = SolidColor(CyanPulse),
                        decorationBox = { inner ->
                            if (feedbackText.isEmpty()) {
                                Text(
                                    "Describe the issue or suggestion…",
                                    color = TextMuted.copy(alpha = 0.5f),
                                    fontSize = 15.sp
                                )
                            }
                            inner()
                        }
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Button(
                    onClick = {
                        if (feedbackText.isNotBlank()) {
                            haptic.successBurst()
                            saveFeedback(
                                context,
                                FeedbackEntry(selectedCategory, feedbackText.trim(), System.currentTimeMillis())
                            )
                            submitted = true
                        } else {
                            haptic.mediumTap()
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(64.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (feedbackText.isNotBlank()) CyanPulse else MutedBackground,
                        contentColor = if (feedbackText.isNotBlank()) Color.Black else TextMuted
                    )
                ) {
                    Text(
                        "SUBMIT FEEDBACK",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                }
            }
        }
    }
}
