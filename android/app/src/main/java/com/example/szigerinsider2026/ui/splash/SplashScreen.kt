package com.example.szigerinsider2026.ui.splash

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.theme.AcidYellow
import com.example.szigerinsider2026.ui.theme.OLEDBlack
import com.example.szigerinsider2026.ui.theme.PrimaryMagenta
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(navController: NavController) {
    LaunchedEffect(Unit) {
        delay(2000)
        navController.navigate("home") {
            popUpTo("splash") { inclusive = true }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.Start,
            modifier = Modifier.padding(32.dp)
        ) {
            Text(
                text = "SZIGET",
                fontSize = 100.sp,
                fontWeight = FontWeight.Black,
                color = AcidYellow,
                lineHeight = 85.sp,
                letterSpacing = (-4).sp
            )
            Text(
                text = "INSIDER",
                fontSize = 100.sp,
                fontWeight = FontWeight.Black,
                color = PrimaryMagenta,
                lineHeight = 85.sp,
                letterSpacing = (-4).sp
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Box(
                modifier = Modifier
                    .background(Color.White)
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "EST. 2026 - ALPHA v2.0",
                    fontWeight = FontWeight.Black,
                    color = Color.Black,
                    fontSize = 12.sp,
                    letterSpacing = 2.sp
                )
            }
        }
        
        // Background decorative elements for brutalist look
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(150.dp)
                .padding(24.dp)
                .background(PrimaryMagenta)
        )
        
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth(0.4f)
                .height(8.dp)
                .background(AcidYellow)
        )
    }
}
