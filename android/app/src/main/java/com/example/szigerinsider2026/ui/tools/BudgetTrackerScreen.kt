package com.example.szigerinsider2026.ui.tools

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.szigerinsider2026.data.config.FestivalConfig
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.min

@Composable
fun BudgetTrackerScreen(navController: NavController) {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val vm: BudgetTrackerViewModel = viewModel(factory = BudgetTrackerViewModel.Factory(context))

    val entries by vm.entries.collectAsStateWithLifecycle()
    val budget by vm.budget.collectAsStateWithLifecycle()
    val totalSpent by vm.totalSpent.collectAsStateWithLifecycle()

    val currencyCode = FestivalConfig.current.currency.localCode

    var customAmountText by remember { mutableStateOf("") }
    var customLabelText by remember { mutableStateOf("") }
    var showResetDialog by remember { mutableStateOf(false) }
    var showBudgetDialog by remember { mutableStateOf(false) }

    if (showResetDialog) {
        ResetDayDialog(
            onConfirm = {
                haptic.successBurst()
                vm.resetDay()
                showResetDialog = false
            },
            onDismiss = {
                haptic.lightTap()
                showResetDialog = false
            }
        )
    }

    if (showBudgetDialog) {
        SetBudgetDialog(
            currentBudget = budget,
            currencyCode = currencyCode,
            onConfirm = { newBudget ->
                haptic.mediumTap()
                vm.setBudget(newBudget)
                showBudgetDialog = false
            },
            onDismiss = {
                haptic.lightTap()
                showBudgetDialog = false
            }
        )
    }

    Scaffold(containerColor = OLEDBlack) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(OLEDBlack)
                .padding(padding),
            contentPadding = PaddingValues(bottom = 40.dp)
        ) {
            // ── Header ──────────────────────────────────────────────────────
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { haptic.lightTap(); navController.popBackStack() }) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "BUDGET TRACKER",
                            color = TextPrimary,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black,
                            fontStyle = FontStyle.Italic,
                            letterSpacing = (-1).sp
                        )
                        Text(
                            text = "DAILY SPENDING LEDGER · $currencyCode",
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 2.sp
                        )
                    }
                }
            }

            // ── Progress Ring ────────────────────────────────────────────────
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    BudgetRing(
                        spent = totalSpent,
                        budget = budget,
                        currencyCode = currencyCode,
                        ringSize = 220.dp,
                        onTap = { haptic.lightTap(); showBudgetDialog = true }
                    )
                }
            }

            // ── Quick-add chips ───────────────────────────────────────────────
            item {
                val quickAmounts = listOf(500, 1000, 2000, 5000)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    quickAmounts.forEach { amount ->
                        QuickAddChip(
                            label = "+$amount",
                            modifier = Modifier.weight(1f),
                            onClick = {
                                haptic.lightTap()
                                vm.addEntry(amount)
                            }
                        )
                    }
                }
            }

            // ── Custom amount row ─────────────────────────────────────────────
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Amount field
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(CardBackground)
                            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
                            .padding(horizontal = 14.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        BasicTextField(
                            value = customAmountText,
                            onValueChange = { customAmountText = it.filter { c -> c.isDigit() } },
                            singleLine = true,
                            textStyle = TextStyle(
                                color = TextPrimary,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black
                            ),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            decorationBox = { inner ->
                                if (customAmountText.isEmpty()) {
                                    Text(
                                        text = "AMOUNT",
                                        color = TextMuted,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 1.sp
                                    )
                                }
                                inner()
                            }
                        )
                    }

                    // Label field
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(CardBackground)
                            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
                            .padding(horizontal = 14.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        BasicTextField(
                            value = customLabelText,
                            onValueChange = { customLabelText = it },
                            singleLine = true,
                            textStyle = TextStyle(
                                color = TextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium
                            ),
                            decorationBox = { inner ->
                                if (customLabelText.isEmpty()) {
                                    Text(
                                        text = "LABEL (OPT.)",
                                        color = TextMuted,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 1.sp
                                    )
                                }
                                inner()
                            }
                        )
                    }

                    // ADD button
                    Box(
                        modifier = Modifier
                            .height(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(AcidYellow)
                            .clickable {
                                val amt = customAmountText.toIntOrNull() ?: 0
                                if (amt > 0) {
                                    haptic.mediumTap()
                                    vm.addEntry(amt, customLabelText.trim())
                                    customAmountText = ""
                                    customLabelText = ""
                                }
                            }
                            .padding(horizontal = 18.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "ADD",
                            color = OLEDBlack,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
                }
            }

            // ── Entries header ────────────────────────────────────────────────
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "ENTRIES",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                    Text(
                        text = "${entries.size} TRANSACTIONS",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }
                HorizontalDivider(
                    modifier = Modifier.padding(horizontal = 20.dp),
                    color = Color.White.copy(alpha = 0.06f)
                )
            }

            // ── Entry rows ────────────────────────────────────────────────────
            if (entries.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "NO ENTRIES YET\nTAP + TO LOG SPENDING",
                            color = TextMuted,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 22.sp
                        )
                    }
                }
            } else {
                items(entries) { entry ->
                    SpendingEntryRow(entry = entry, currencyCode = currencyCode)
                }
            }

            // ── Reset Day button ──────────────────────────────────────────────
            item {
                Spacer(modifier = Modifier.height(24.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(CardBackground)
                        .border(1.dp, RedWarning.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                        .clickable {
                            haptic.mediumTap()
                            showResetDialog = true
                        }
                        .padding(vertical = 20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "RESET DAY",
                        color = RedWarning,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

// ── Progress Ring ────────────────────────────────────────────────────────────

@Composable
private fun BudgetRing(
    spent: Int,
    budget: Int,
    currencyCode: String,
    ringSize: Dp,
    onTap: () -> Unit
) {
    val fraction = if (budget > 0) (spent.toFloat() / budget).coerceIn(0f, 1f) else 0f
    val ringColor = when {
        fraction < 0.5f -> ToxicGreen
        fraction < 0.8f -> AcidYellow
        else -> RedWarning
    }
    val trackColor = Color.White.copy(alpha = 0.06f)
    val strokeWidth = 18.dp

    Box(
        modifier = Modifier
            .size(ringSize)
            .clickable(onClick = onTap),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val sw = strokeWidth.toPx()
            val inset = sw / 2f
            val arcSize = Size(size.width - sw, size.height - sw)
            val topLeft = Offset(inset, inset)
            val startAngle = -90f
            val fullSweep = 360f

            // Track
            drawArc(
                color = trackColor,
                startAngle = startAngle,
                sweepAngle = fullSweep,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = sw, cap = StrokeCap.Round)
            )

            // Progress
            if (fraction > 0f) {
                drawArc(
                    color = ringColor,
                    startAngle = startAngle,
                    sweepAngle = fullSweep * fraction,
                    useCenter = false,
                    topLeft = topLeft,
                    size = arcSize,
                    style = Stroke(width = sw, cap = StrokeCap.Round)
                )
            }
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "${spent.formatAmount()} $currencyCode",
                color = AcidYellow,
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                letterSpacing = (-1).sp
            )
            Text(
                text = "of ${budget.formatAmount()}",
                color = TextMuted,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "${(fraction * 100).toInt()}%",
                color = ringColor,
                fontSize = 14.sp,
                fontWeight = FontWeight.Black
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "TAP TO SET BUDGET",
                color = TextMuted.copy(alpha = 0.5f),
                fontSize = 9.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.5.sp
            )
        }
    }
}

// ── Quick-add chip ────────────────────────────────────────────────────────────

@Composable
private fun QuickAddChip(
    label: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(44.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(CardBackground)
            .border(1.dp, AcidYellow.copy(alpha = 0.3f), RoundedCornerShape(22.dp))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = AcidYellow,
            fontSize = 13.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 0.5.sp
        )
    }
}

// ── Spending entry row ────────────────────────────────────────────────────────

private val timestampFmt = SimpleDateFormat("HH:mm  dd MMM", Locale.US)

@Composable
private fun SpendingEntryRow(entry: BudgetEntry, currencyCode: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 6.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(CardBackground)
            .border(1.dp, Color.White.copy(alpha = 0.04f), RoundedCornerShape(14.dp))
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            if (entry.label.isNotBlank()) {
                Text(
                    text = entry.label.uppercase(),
                    color = TextPrimary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
            }
            Text(
                text = timestampFmt.format(Date(entry.timestamp)),
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        }
        Text(
            text = "${entry.amount.formatAmount()} $currencyCode",
            color = AcidYellow,
            fontSize = 16.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = (-0.5).sp
        )
    }
}

// ── Dialogs ───────────────────────────────────────────────────────────────────

@Composable
private fun ResetDayDialog(onConfirm: () -> Unit, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CardBackground,
        titleContentColor = TextPrimary,
        textContentColor = TextMuted,
        title = {
            Text(
                text = "RESET DAY",
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                fontSize = 20.sp
            )
        },
        text = {
            Text(
                text = "This will clear all of today's spending entries. Are you sure?",
                fontSize = 14.sp
            )
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(
                    containerColor = RedWarning,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("CONFIRM", fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("CANCEL", color = TextMuted, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            }
        }
    )
}

@Composable
private fun SetBudgetDialog(
    currentBudget: Int,
    currencyCode: String,
    onConfirm: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    var inputText by remember { mutableStateOf(currentBudget.toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CardBackground,
        titleContentColor = TextPrimary,
        textContentColor = TextMuted,
        title = {
            Text(
                text = "SET DAILY BUDGET",
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                fontSize = 20.sp
            )
        },
        text = {
            Column {
                Text(
                    text = "Enter your daily limit in $currencyCode",
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(OLEDBlack)
                        .border(1.dp, AcidYellow.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                        .padding(horizontal = 16.dp),
                    contentAlignment = Alignment.CenterStart
                ) {
                    BasicTextField(
                        value = inputText,
                        onValueChange = { inputText = it.filter { c -> c.isDigit() } },
                        singleLine = true,
                        textStyle = TextStyle(
                            color = AcidYellow,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val v = inputText.toIntOrNull() ?: return@Button
                    onConfirm(v)
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = AcidYellow,
                    contentColor = OLEDBlack
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("SET BUDGET", fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("CANCEL", color = TextMuted, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            }
        }
    )
}

// ── Utils ─────────────────────────────────────────────────────────────────────

private fun Int.formatAmount(): String {
    return if (this >= 1000) {
        val thousands = this / 1000
        val remainder = this % 1000
        if (remainder == 0) "${thousands}k" else String.format(Locale.US, "%,d", this)
    } else {
        this.toString()
    }
}
