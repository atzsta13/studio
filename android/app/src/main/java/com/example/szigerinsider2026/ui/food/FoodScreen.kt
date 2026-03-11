package com.example.szigerinsider2026.ui.food

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.data.model.FoodVendor
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FoodScreen() {
    val context = LocalContext.current
    val vm: FoodViewModel = viewModel(factory = FoodViewModel.Factory(context))
    val haptic = rememberHapticManager()

    val vendors by vm.filtered.collectAsStateWithLifecycle()
    val query by vm.searchQuery.collectAsStateWithLifecycle()
    val activeCategory by vm.activeCategory.collectAsStateWithLifecycle()
    val activeTags by vm.activeTags.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(OLEDBlack),
        contentPadding = PaddingValues(bottom = 120.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 48.dp, bottom = 8.dp)) {
                Text(
                    "FOOD & DRINK",
                    color = TextPrimary, fontSize = 40.sp, fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic, letterSpacing = (-2).sp, lineHeight = 38.sp
                )
                Text(
                    "${vendors.size} vendors on the Island",
                    color = TextMuted, fontSize = 14.sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                )
                OutlinedTextField(
                    value = query,
                    onValueChange = { vm.searchQuery.value = it },
                    placeholder = { Text("Search food, cuisine...", color = TextMuted, fontSize = 14.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                    trailingIcon = {
                        if (query.isNotEmpty()) {
                            IconButton(onClick = { vm.searchQuery.value = "" }) {
                                Icon(Icons.Default.Close, contentDescription = "Clear", tint = TextMuted)
                            }
                        }
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color.Transparent,
                        unfocusedBorderColor = Color.Transparent,
                        focusedContainerColor = MutedBackground.copy(alpha = 0.4f),
                        unfocusedContainerColor = MutedBackground.copy(alpha = 0.4f),
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    shape = RoundedCornerShape(20.dp),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    modifier = Modifier.fillMaxWidth().height(60.dp)
                )
            }
        }

        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 20.dp),
                modifier = Modifier.padding(vertical = 8.dp)
            ) {
                val categories = listOf("ALL", "Food", "Drink")
                items(categories) { cat ->
                    val isSelected = activeCategory == cat
                    FilterChip(
                        selected = isSelected,
                        onClick = { haptic.lightTap(); vm.activeCategory.value = cat },
                        label = { Text(cat.uppercase(), fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ToxicGreen,
                            selectedLabelColor = OLEDBlack,
                            containerColor = MutedBackground.copy(alpha = 0.4f),
                            labelColor = TextMuted
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true, selected = isSelected,
                            borderColor = Color.White.copy(alpha = 0.08f),
                            selectedBorderColor = ToxicGreen
                        )
                    )
                }

                val tagDefs = listOf(
                    Triple("vegan", "VEGAN", ToxicGreen),
                    Triple("gluten-free", "GLUTEN-FREE", CyanPulse),
                    Triple("budget", "BUDGET HERO", AcidYellow)
                )
                items(tagDefs) { (tag, label, color) ->
                    val isActive = activeTags.contains(tag)
                    FilterChip(
                        selected = isActive,
                        onClick = {
                            haptic.lightTap()
                            vm.activeTags.value = if (isActive) activeTags - tag else activeTags + tag
                        },
                        label = { Text(label, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = color.copy(alpha = 0.15f),
                            selectedLabelColor = color,
                            containerColor = MutedBackground.copy(alpha = 0.4f),
                            labelColor = TextMuted
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true, selected = isActive,
                            borderColor = Color.White.copy(alpha = 0.08f),
                            selectedBorderColor = color.copy(alpha = 0.4f)
                        )
                    )
                }
            }
        }

        if (vendors.isEmpty()) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(top = 80.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("NO MATCHES", color = TextMuted, fontSize = 24.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic)
                        Text("Try relaxing your filters", color = TextMuted.copy(alpha = 0.5f), fontSize = 14.sp, modifier = Modifier.padding(top = 8.dp))
                    }
                }
            }
        } else {
            items(vendors, key = { it.id }) { vendor ->
                FoodVendorCard(vendor = vendor, modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp))
            }
        }
    }
}

@Composable
private fun FoodVendorCard(vendor: FoodVendor, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(28.dp))
            .padding(20.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column(modifier = Modifier.weight(1f)) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(bottom = 6.dp)) {
                    vendor.cuisine?.let { VendorBadge(it.uppercase(), PrimaryMagenta) }
                    vendor.priceRange?.let { VendorBadge(it, ToxicGreen) }
                }
                Text(vendor.name, color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, lineHeight = 22.sp)
                vendor.location?.let {
                    Text(it, color = CyanPulse, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp, modifier = Modifier.padding(top = 2.dp))
                }
            }
        }

        vendor.description?.takeIf { it.isNotBlank() }?.let { desc ->
            Text(desc, color = TextMuted, fontSize = 14.sp, lineHeight = 20.sp, modifier = Modifier.padding(top = 8.dp))
        }

        val dietaryTags = vendor.tags.filter { it in listOf("vegan", "gluten-free", "vegetarian", "halal") }
        if (dietaryTags.isNotEmpty()) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 10.dp)) {
                dietaryTags.forEach { tag ->
                    val color = when (tag) {
                        "vegan" -> ToxicGreen
                        "gluten-free" -> CyanPulse
                        "vegetarian" -> Color(0xFF4ADE80)
                        else -> AcidYellow
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(100))
                            .background(color.copy(alpha = 0.1f))
                            .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(100))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(tag.uppercase(), color = color, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                    }
                }
            }
        }

        vendor.budgetOption?.let { budgetName ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(ToxicGreen.copy(alpha = 0.08f))
                    .border(1.dp, ToxicGreen.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                    .padding(12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("💚", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("BUDGET HERO", color = ToxicGreen, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                        Text(
                            buildString { append(budgetName); vendor.budgetPrice?.let { append(" — $it") } },
                            color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun VendorBadge(text: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(100))
            .background(color.copy(alpha = 0.1f))
            .border(1.dp, color.copy(alpha = 0.25f), RoundedCornerShape(100))
            .padding(horizontal = 10.dp, vertical = 3.dp)
    ) {
        Text(text, color = color, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
    }
}
