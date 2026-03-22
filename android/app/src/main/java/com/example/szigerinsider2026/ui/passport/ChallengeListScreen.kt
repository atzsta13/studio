package com.example.szigerinsider2026.ui.passport

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.components.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@Composable
fun ChallengeListComposable(challenges: List<Challenge>) {
    LazyColumn(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp)
    ) {
        items(challenges, key = { it.id }) { challenge ->
            ChallengeCard(challenge)
        }
    }
}

@Composable
private fun ChallengeCard(challenge: Challenge) {
    val haptic = rememberHapticManager()
    
    NeonCard(
        onClick = { haptic.lightTap() },
        accentColor = if (challenge.isCompleted) AcidYellow else Color.White.copy(alpha = 0.05f),
        modifier = Modifier.alpha(if (challenge.isCompleted) 1f else 0.6f)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon box
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (challenge.isCompleted) AcidYellow.copy(alpha = 0.15f) else OLEDBlack),
                contentAlignment = Alignment.Center
            ) {
                Text(challenge.icon, fontSize = 26.sp)
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = challenge.title,
                    color = TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = challenge.description,
                    color = TextMuted,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                if (challenge.isCompleted) {
                    Icon(Icons.Default.CheckCircle, contentDescription = "Done", tint = AcidYellow, modifier = Modifier.size(24.dp))
                } else {
                    Icon(Icons.Default.Lock, contentDescription = "Locked", tint = TextMuted, modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.height(4.dp))
                BrutalistBadge(
                    text = "+${challenge.xpReward}",
                    color = if (challenge.isCompleted) AcidYellow else TextMuted
                )
            }
        }
    }
}
