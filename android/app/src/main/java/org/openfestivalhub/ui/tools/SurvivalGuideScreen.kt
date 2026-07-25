package org.openfestivalhub.ui.tools

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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.utils.rememberHapticManager
import org.openfestivalhub.ui.utils.HapticManager
import kotlinx.coroutines.launch

import org.openfestivalhub.data.model.GuideData
import org.openfestivalhub.data.model.GuideSection
import org.openfestivalhub.data.model.GuideItem
import org.openfestivalhub.data.repository.GuideRepository

@Composable
fun SurvivalGuideScreen(navController: NavController) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val repository = remember { GuideRepository(context) }
    var guideData by remember { mutableStateOf<GuideData?>(null) }

    LaunchedEffect(Unit) {
        guideData = repository.getGuideData()
    }

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
                            text = guideData?.title?.uppercase() ?: "SURVIVAL GUIDE",
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
                
                guideData?.description?.let { desc ->
                    Text(
                        text = desc,
                        color = TextMuted,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
            }

            guideData?.let { data ->
                items(data.sections) { section ->
                    GuideSectionCard(
                        section = section,
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
}

@Composable
private fun GuideSectionCard(
    section: GuideSection,
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
            // Check if icon is an emoji or should be mapped to an icon
            val displayIcon = section.icon.let { if (it.length <= 2) it else "ℹ️" }
            Text(text = displayIcon, fontSize = 28.sp)
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
                    GuideItemRow(item, haptic, onCopyPhrase)
                }
            }
        }
    }
}

@Composable
private fun GuideItemRow(
    item: GuideItem,
    haptic: HapticManager,
    onCopyPhrase: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(OLEDBlack.copy(alpha = 0.5f))
            .padding(12.dp)
    ) {
        Text(item.title, color = AcidYellow, fontWeight = FontWeight.Black, fontSize = 15.sp)
        Spacer(modifier = Modifier.height(4.dp))
        Text(item.content, color = Color.White.copy(alpha = 0.7f), fontSize = 13.sp, lineHeight = 18.sp)
    }
}
