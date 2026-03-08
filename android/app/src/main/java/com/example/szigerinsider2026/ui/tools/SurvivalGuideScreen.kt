package com.example.szigerinsider2026.ui.tools

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.data.content.SURVIVAL_SECTIONS
import com.example.szigerinsider2026.data.content.GuideSection
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import com.example.szigerinsider2026.ui.utils.HapticManager
import kotlinx.coroutines.launch

@Composable
fun SurvivalGuideScreen(navController: NavController) {
    val haptic = rememberHapticManager()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = OLEDBlack
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(OLEDBlack)
                .padding(padding),
            contentPadding = PaddingValues(bottom = 40.dp)
        ) {
            item {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { haptic.lightTap(); navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "SURVIVAL GUIDE",
                            color = TextPrimary,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black,
                            fontStyle = FontStyle.Italic,
                            letterSpacing = (-1).sp
                        )
                        Text(
                            text = "ISLAND INTELLIGENCE",
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 2.sp
                        )
                    }
                }
                // Summary stat
                Box(
                    modifier = Modifier
                        .padding(horizontal = 20.dp)
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(CardBackground)
                        .border(1.dp, AcidYellow.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Text(
                        text = "84 TIPS FOR ISLAND SURVIVAL",
                        color = AcidYellow,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            items(SURVIVAL_SECTIONS, key = { it.id }) { section ->
                GuideSectionCard(
                    section = section,
                    isHungarianSection = section.id == "hungarian",
                    haptic = haptic,
                    onCopyPhrase = { phrase ->
                        scope.launch {
                            snackbarHostState.showSnackbar(
                                message = "Copied to clipboard!",
                                duration = SnackbarDuration.Short
                            )
                        }
                    }
                )
            }
        }
    }
}

@Composable
private fun GuideSectionCard(
    section: GuideSection,
    isHungarianSection: Boolean,
    haptic: HapticManager,
    onCopyPhrase: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val chevronRotation by animateFloatAsState(
        targetValue = if (expanded) 180f else 0f,
        animationSpec = tween(200),
        label = "chevron"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(16.dp))
    ) {
        // Header row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { haptic.lightTap(); expanded = !expanded }
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = section.icon, fontSize = 28.sp)
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = section.title,
                color = TextPrimary,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp,
                modifier = Modifier.weight(1f)
            )
            Icon(
                imageVector = Icons.Default.ExpandMore,
                contentDescription = null,
                tint = TextMuted,
                modifier = Modifier.rotate(chevronRotation)
            )
        }

        AnimatedVisibility(
            visible = expanded,
            enter = fadeIn(tween(200)) + expandVertically(tween(200)),
            exit = fadeOut(tween(150)) + shrinkVertically(tween(150))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                HorizontalDivider(color = Color.White.copy(alpha = 0.06f))
                Spacer(modifier = Modifier.height(4.dp))
                section.items.forEach { item ->
                    if (isHungarianSection) {
                        HungarianPhraseRow(item, haptic, onCopyPhrase)
                    } else {
                        Row(verticalAlignment = Alignment.Top) {
                            Text(
                                "•",
                                color = AcidYellow,
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                modifier = Modifier.padding(top = 2.dp, end = 8.dp)
                            )
                            Text(
                                item,
                                color = Color.White.copy(alpha = 0.7f),
                                fontSize = 14.sp,
                                lineHeight = 20.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HungarianPhraseRow(
    item: String,
    haptic: HapticManager,
    onCopyPhrase: (String) -> Unit
) {
    val clipboard = LocalClipboardManager.current
    // item format: "Hungarian • pronunciation • English"
    val parts = item.split(" • ")
    val hungarian = parts.getOrElse(0) { item }
    val pronunciation = parts.getOrElse(1) { "" }
    val english = parts.getOrElse(2) { "" }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(OLEDBlack.copy(alpha = 0.5f))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(hungarian, color = AcidYellow, fontWeight = FontWeight.Black, fontSize = 15.sp)
            if (pronunciation.isNotEmpty()) {
                Text(pronunciation, color = TextMuted, fontSize = 11.sp, fontStyle = FontStyle.Italic)
            }
            if (english.isNotEmpty()) {
                Text(english, color = Color.White.copy(alpha = 0.7f), fontSize = 13.sp)
            }
        }
        IconButton(
            onClick = {
                haptic.successBurst()
                clipboard.setText(AnnotatedString(hungarian))
                onCopyPhrase(hungarian)
            },
            modifier = Modifier.size(36.dp)
        ) {
            Icon(
                Icons.Default.ContentCopy,
                contentDescription = "Copy",
                tint = CyanPulse,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}
