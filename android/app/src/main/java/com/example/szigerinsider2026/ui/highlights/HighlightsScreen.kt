package com.example.szigerinsider2026.ui.highlights

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.szigerinsider2026.ui.theme.OLEDBlack
import com.example.szigerinsider2026.ui.theme.TextPrimary
import com.example.szigerinsider2026.ui.theme.BrutalistTypography

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HighlightsScreen(onBack: () -> Unit) {
    Scaffold(
        containerColor = OLEDBlack,
        topBar = {
            TopAppBar(
                title = { Text("FESTIVAL WINS", style = BrutalistTypography.headlineSmall, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OLEDBlack)
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
            Text("Your achievements will appear here.", color = Color.Gray, fontSize = 16.sp)
        }
    }
}
