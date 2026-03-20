package com.example.szigerinsider2026.ui.packing

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PackingListScreen(navController: NavController) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val vm: PackingListViewModel = viewModel(factory = PackingListViewModel.factory(context))

    val items by vm.items.collectAsStateWithLifecycle()
    val checkedIds by vm.checkedIds.collectAsStateWithLifecycle()
    val checkedCount by vm.checkedCount.collectAsStateWithLifecycle()
    val totalCount = vm.totalCount

    val allPacked = checkedCount == totalCount && totalCount > 0
    var successBurstFired by remember { mutableStateOf(false) }

    LaunchedEffect(allPacked) {
        if (allPacked && !successBurstFired) {
            haptic.successBurst()
            successBurstFired = true
        } else if (!allPacked) {
            successBurstFired = false
        }
    }

    val sections = remember(items) { items.map { it.section }.distinct() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "PACKING LIST",
                        color = AcidYellow,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-0.5).sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { haptic.lightTap(); navController.navigateUp() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OLEDBlack)
            )
        },
        containerColor = OLEDBlack
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 20.dp),
            contentPadding = PaddingValues(bottom = 120.dp)
        ) {
            // Sticky progress header
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                        .border(1.dp, AcidYellow.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        if (allPacked) {
                            Text(
                                text = "ALL PACKED — LET'S GO!",
                                color = ToxicGreen,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                fontStyle = FontStyle.Italic,
                                letterSpacing = 0.5.sp,
                                modifier = Modifier.padding(bottom = 12.dp)
                            )
                        } else {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "$checkedCount / $totalCount PACKED",
                                    color = TextPrimary,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 0.5.sp
                                )
                                val pct = if (totalCount > 0) (checkedCount * 100 / totalCount) else 0
                                Text(
                                    text = "$pct%",
                                    color = AcidYellow,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }
                        LinearProgressIndicator(
                            progress = { if (totalCount > 0) checkedCount.toFloat() / totalCount else 0f },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = if (allPacked) ToxicGreen else AcidYellow,
                            trackColor = MutedBackground
                        )
                    }
                }
            }

            // Sections
            sections.forEach { section ->
                // Section header
                item(key = "header_$section") {
                    Column(modifier = Modifier.padding(top = 20.dp, bottom = 4.dp)) {
                        Text(
                            text = section,
                            color = AcidYellow,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        HorizontalDivider(color = AcidYellow.copy(alpha = 0.2f), thickness = 1.dp)
                    }
                }

                // Items in section
                val sectionItems = items.filter { it.section == section }
                items(sectionItems, key = { it.id }) { item ->
                    val isChecked = item.id in checkedIds
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                haptic.lightTap()
                                vm.toggle(item.id)
                            }
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isChecked,
                            onCheckedChange = {
                                haptic.lightTap()
                                vm.toggle(item.id)
                            },
                            colors = CheckboxDefaults.colors(
                                checkedColor = AcidYellow,
                                uncheckedColor = TextMuted,
                                checkmarkColor = OLEDBlack
                            )
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = item.label,
                            color = if (isChecked) TextPrimary.copy(alpha = 0.5f) else TextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp,
                            textDecoration = if (isChecked) TextDecoration.LineThrough else TextDecoration.None
                        )
                    }
                }
            }

            // Reset All button
            item {
                Spacer(modifier = Modifier.height(24.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(CardBackground)
                        .border(1.dp, PrimaryMagenta, RoundedCornerShape(20.dp))
                        .clickable {
                            haptic.mediumTap()
                            vm.resetAll()
                        }
                        .padding(vertical = 18.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "RESET ALL",
                        color = PrimaryMagenta,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                }
            }
        }
    }
}
