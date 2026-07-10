package com.example.szigerinsider2026.ui.tools

import android.content.Intent
import android.net.Uri
import kotlinx.coroutines.launch
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.CurrencyExchange
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.automirrored.filled.NoteAdd
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.szigerinsider2026.data.config.FestivalConfig
import com.example.szigerinsider2026.ui.theme.*
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import com.example.szigerinsider2026.ui.utils.t
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ToolsScreen(navController: NavController) {
    val haptic = rememberHapticManager()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val vm: ToolsViewModel = viewModel(factory = ToolsViewModel.Factory(context))
    val weather by vm.weather.collectAsStateWithLifecycle()
    val isLoadingWeather by vm.isLoadingWeather.collectAsStateWithLifecycle()
    val isSyncing by vm.isSyncing.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        vm.syncResult.collect { success ->
            snackbarHostState.showSnackbar(
                if (success) "Lineup updated from cloud!" else "Sync failed. Try again later."
            )
        }
    }
    
    val config = FestivalConfig.current
    var localAmount by remember { mutableStateOf(if (config.currency.localCode == "HUF") "1000" else "10") }
    var selectedTab by remember { mutableIntStateOf(0) }
    var toolMode by remember { mutableStateOf<ToolMode?>(null) }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = OLEDBlack
    ) { padding ->
        when (toolMode) {
            ToolMode.SOS -> {
                FlashOverlay(onDismiss = { toolMode = null })
            }
            ToolMode.COLOR_FLASH -> {
                ColorFlashOverlay(onDismiss = { toolMode = null })
            }
            ToolMode.BIG_TEXT -> {
                BigTextOverlay(onDismiss = { toolMode = null })
            }
            ToolMode.CANDLE -> {
                CandleOverlay(onDismiss = { toolMode = null })
            }
            null -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(OLEDBlack)
                        .padding(padding)
                        .padding(horizontal = 20.dp),
                    contentPadding = PaddingValues(top = 48.dp, bottom = 120.dp)
                ) {
            item {
                Text(
                    text = t("toolkit_title"),
                    color = TextPrimary,
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-2).sp,
                    lineHeight = 38.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Text(
                    text = "Elite tactical utilities for the ${config.tagline}. No signal required.",
                    color = TextMuted,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 22.sp,
                    modifier = Modifier.padding(bottom = 40.dp)
                )
            }

            if (config.currency.showConverter) {
                item {
                    LocalCurrencyConverterCard(
                        localAmount = localAmount,
                        onAmountChange = { localAmount = it }
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 32.dp)
                        .height(72.dp)
                        .clip(RoundedCornerShape(36.dp))
                        .background(MutedBackground.copy(alpha = 0.5f))
                        .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(36.dp))
                        .padding(6.dp)
                ) {
                    TabItem(text = t("toolkit_tactical"), isSelected = selectedTab == 0, onClick = { selectedTab = 0 }, modifier = Modifier.weight(1f))
                    TabItem(text = t("toolkit_safety"), isSelected = selectedTab == 1, onClick = { selectedTab = 1 }, modifier = Modifier.weight(1f))
                }
            }

            if (selectedTab == 0) {
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                        if (config.features.setCountdowns) {
                            FestivalCountdownCard()
                        }

                        if (isLoadingWeather) {
                            Box(modifier = Modifier.fillMaxWidth().height(120.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = CyanPulse, modifier = Modifier.size(32.dp))
                            }
                        } else {
                            weather?.let { WeatherCard(it) }
                        }

                        if (config.features.tentFinder) {
                            TentFinderCard()
                        }

                        if (config.features.carFinder) {
                            CarFinderCard()
                        }

                        if (config.features.hydrationTracker || config.features.waterCounter) {
                            HydrationTrackerCard()
                        }

                        if (config.features.batterySaver) {
                            BatterySaverCard()
                        }

                        // Packing list is usually always available but could be flagged
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(20.dp))
                                .background(CardBackground)
                                .border(1.dp, MaterialTheme.colorScheme.secondary, RoundedCornerShape(20.dp))
                                .clickable { haptic.mediumTap(); navController.navigate("packing_list") }
                                .padding(20.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("\uD83D\uDCE6", fontSize = 32.sp)
                                Spacer(modifier = Modifier.width(16.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("PACKING LIST", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
                                    Text("CHECK YOUR GEAR BEFORE YOU GO", color = TextMuted, fontSize = 12.sp, letterSpacing = 0.5.sp)
                                }
                                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(24.dp))
                            }
                        }

                        if (config.features.notesJournal) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(CardBackground)
                                    .border(1.dp, AcidYellow.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                                    .clickable { haptic.mediumTap(); navController.navigate("notes_journal") }
                                    .padding(20.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(48.dp)
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(AcidYellow.copy(alpha = 0.12f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.AutoMirrored.Filled.NoteAdd, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(26.dp))
                                    }
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("MY JOURNAL", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
                                        Text("PRIVATE OFFLINE MEMORY VAULT", color = TextMuted, fontSize = 12.sp, letterSpacing = 0.5.sp)
                                    }
                                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(24.dp))
                                }
                            }
                        }

                        if (config.features.budgetTracker) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(CardBackground)
                                    .border(1.dp, AcidYellow.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                                    .clickable { haptic.mediumTap(); navController.navigate("budget_tracker") }
                                    .padding(20.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(48.dp)
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(AcidYellow.copy(alpha = 0.12f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(26.dp))
                                    }
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("BUDGET TRACKER", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
                                        Text("DAILY SPENDING LEDGER · ${config.currency.localCode}", color = TextMuted, fontSize = 12.sp, letterSpacing = 0.5.sp)
                                    }
                                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(24.dp))
                                }
                            }
                        }

                        if (config.features.friendFinder) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(CardBackground)
                                    .border(1.dp, AcidYellow.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                                    .clickable { haptic.mediumTap(); navController.navigate("squad_link") }
                                    .padding(20.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(48.dp)
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(AcidYellow.copy(alpha = 0.12f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Group, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(26.dp))
                                    }
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("SQUAD LINK", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
                                        Text("QR CODE · SYNC LOCAL GROUP", color = TextMuted, fontSize = 12.sp, letterSpacing = 0.5.sp)
                                    }
                                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(24.dp))
                                }
                            }
                        }

                        if (config.features.sosMorseCode) {
                            SOSBeaconButton(onClick = { toolMode = ToolMode.SOS })
                        }

                        SafetyToolButton(
                            title = "COLOR SIGNAL",
                            icon = Icons.Default.Palette,
                            onClick = { toolMode = ToolMode.COLOR_FLASH }
                        )

                        SafetyToolButton(
                            title = "BIG TEXT MODE",
                            icon = Icons.Default.TextFormat,
                            onClick = { toolMode = ToolMode.BIG_TEXT }
                        )

                        SafetyToolButton(
                            title = "CANDLE MODE",
                            icon = Icons.Default.WbSunny,
                            onClick = { toolMode = ToolMode.CANDLE }
                        )

                        if (config.features.sunscreenAlert) {
                            SunscreenAlertCard()
                        }

                        if (config.features.quietZones) {
                            QuietZonesCard()
                        }

                        if (config.features.vibeOfTheHour) {
                            VibeOfTheHourCard()
                        }

                        if (config.features.highContrast) {
                            HighContrastCard()
                        }

                        if (config.features.audioMonitor) {
                            AudioMonitorCard()
                        }
                    }
                }
            } else {
                item {
                    val contacts = config.content?.emergencyContacts
                    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                        contacts?.security?.let { security ->
                            EmergencyCard(
                                title = "SECURITY ALERT",
                                description = "Tap to instantly dial the ${security.label}. Have your location ready.",
                                buttonText = "DIAL SECURITY",
                                phoneNumber = security.phone,
                                containerColor = Color(0xFFDC2626),
                                icon = Icons.Default.Shield
                            )
                        }

                        contacts?.medical?.let { medical ->
                            EmergencyCard(
                                title = "MEDICAL HELP",
                                description = "Tap to instantly dial the ${medical.label}. Available 24/7.",
                                buttonText = "DIAL MEDICAL",
                                phoneNumber = medical.phone,
                                containerColor = Color(0xFF2563EB),
                                icon = Icons.Default.MedicalServices
                            )
                        }

                        if (config.features.feedbackSystem) {
                            FeedbackSystemCard(snackbarHostState = snackbarHostState, scope = scope)
                        }

                        // Cloud Sync Card
                        Card(
                            colors = CardDefaults.cardColors(containerColor = CardBackground),
                            shape = RoundedCornerShape(24.dp),
                            modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(24.dp))
                        ) {
                            Column(modifier = Modifier.padding(20.dp)) {
                                Text("LINEUP CLOUD SYNC", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                                Text("Update artist data from production server.", color = TextMuted, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))
                                Button(
                                    onClick = { haptic.mediumTap(); vm.syncData() },
                                    enabled = !isSyncing,
                                    modifier = Modifier.fillMaxWidth().height(56.dp),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = if (isSyncing) MutedBackground else Color.White, contentColor = OLEDBlack)
                                ) {
                                    if (isSyncing) {
                                        CircularProgressIndicator(color = TextMuted, modifier = Modifier.size(24.dp))
                                    } else {
                                        Icon(Icons.Default.CloudDownload, contentDescription = null)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("REFRESH DATA", fontWeight = FontWeight.Black)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (config.features.survivalGuide) {
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(20.dp))
                            .background(CardBackground)
                            .border(1.dp, ToxicGreen.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                            .clickable { haptic.mediumTap(); navController.navigate("guide") }
                            .padding(20.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("♻️", fontSize = 32.sp)
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text("SURVIVAL GUIDE", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
                                Text("Camping · Phrases · Money · Safety", color = TextMuted, fontSize = 13.sp)
                                Text("ESSENTIAL INTELLIGENCE FOR ${config.name.uppercase()}", color = ToxicGreen, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, modifier = Modifier.padding(top = 4.dp))
                            }
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(20.dp))
                            .background(CardBackground)
                            .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                            .clickable { haptic.mediumTap(); navController.navigate("festival_switch") }
                            .padding(20.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🎪", fontSize = 32.sp)
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text("SWITCH FESTIVAL", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
                                Text("Currently: ${config.name}", color = TextMuted, fontSize = 13.sp)
                                Text("TAP TO CHANGE FESTIVAL", color = MaterialTheme.colorScheme.primary, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, modifier = Modifier.padding(top = 4.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
}
}

@Composable
fun TabItem(text: String, isSelected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val backgroundColor by animateColorAsState(targetValue = if (isSelected) CardBackground else Color.Transparent, label = "tabBg")
    val textColor by animateColorAsState(targetValue = if (isSelected) TextPrimary else TextMuted, label = "tabText")
    Box(modifier = modifier.fillMaxHeight().clip(RoundedCornerShape(30.dp)).background(backgroundColor).clickable(onClick = onClick).padding(horizontal = 16.dp), contentAlignment = Alignment.Center) {
        Text(text = text, color = textColor, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocalCurrencyConverterCard(localAmount: String, onAmountChange: (String) -> Unit) {
    val config = FestivalConfig.current
    val localValue = localAmount.toFloatOrNull() ?: 0f
    val eurValue = String.format(Locale.US, "%.2f", localValue / config.currency.eurRate.toFloat())
    val usdValue = String.format(Locale.US, "%.2f", localValue / config.currency.usdRate.toFloat())

    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(40.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(40.dp))
    ) {
        Column(modifier = Modifier.padding(32.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 24.dp)) {
                Icon(Icons.Default.CurrencyExchange, contentDescription = null, tint = ToxicGreen, modifier = Modifier.size(28.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Text(text = "${config.currency.localCode} CONVERTER", color = ToxicGreen, fontSize = 24.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
            }
            Text(text = "${config.currency.localName.uppercase()} (${config.currency.localCode})", color = TextMuted.copy(alpha = 0.6f), fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 4.sp, modifier = Modifier.padding(bottom = 12.dp))
            OutlinedTextField(
                value = localAmount, onValueChange = onAmountChange, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                colors = OutlinedTextFieldDefaults.colors(focusedContainerColor = MutedBackground.copy(alpha = 0.3f), unfocusedContainerColor = MutedBackground.copy(alpha = 0.3f), focusedBorderColor = Color.Transparent, unfocusedBorderColor = Color.Transparent, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary),
                textStyle = TextStyle(fontSize = 36.sp, fontWeight = FontWeight.Black, color = TextPrimary, letterSpacing = (-1).sp),
                singleLine = true, shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp).height(88.dp)
            )
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                ConversionResultBox(label = "EURO", value = "€$eurValue", modifier = Modifier.weight(1f))
                ConversionResultBox(label = "USD", value = "$$usdValue", modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
fun ConversionResultBox(label: String, value: String, modifier: Modifier = Modifier) {
    Box(modifier = modifier.clip(RoundedCornerShape(24.dp)).background(OLEDBlack).border(1.dp, Color.White.copy(alpha = 0.03f), RoundedCornerShape(24.dp)).padding(16.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, color = TextMuted.copy(alpha = 0.6f), fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 3.sp, modifier = Modifier.padding(bottom = 4.dp))
            Text(value, color = TextPrimary, fontSize = 26.sp, fontWeight = FontWeight.Black, letterSpacing = (-1).sp)
        }
    }
}

@Composable
fun EmergencyCard(title: String, description: String, buttonText: String, phoneNumber: String, containerColor: Color, icon: ImageVector) {
    val context = LocalContext.current
    val dialAction = { val intent = Intent(Intent.ACTION_DIAL).apply { data = Uri.parse("tel:$phoneNumber") }; context.startActivity(intent) }
    Card(colors = CardDefaults.cardColors(containerColor = containerColor), shape = RoundedCornerShape(48.dp), modifier = Modifier.fillMaxWidth().clickable(onClick = dialAction)) {
        Column(modifier = Modifier.padding(32.dp)) {
            Box(modifier = Modifier.size(64.dp).clip(RoundedCornerShape(20.dp)).background(Color.White.copy(alpha = 0.2f)), contentAlignment = Alignment.Center) { Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(32.dp)) }
            Spacer(modifier = Modifier.height(24.dp))
            Text(text = title, color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp, modifier = Modifier.padding(bottom = 12.dp))
            Text(text = description, color = Color.White.copy(alpha = 0.9f), fontSize = 17.sp, fontStyle = FontStyle.Italic, lineHeight = 24.sp, modifier = Modifier.padding(bottom = 32.dp))
            Button(onClick = dialAction, colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = containerColor), shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth().height(72.dp)) {
                Text(text = buttonText, fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp)
            }
        }
    }
}

@Composable
fun AudioMonitorCard() {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 16.dp)) {
                Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(Color.Red.copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
                    Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = null, tint = Color.Red, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Text(text = "AUDIO MONITOR", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
            }
            
            // Simulated Meter
            Box(modifier = Modifier.fillMaxWidth().height(12.dp).clip(RoundedCornerShape(6.dp)).background(OLEDBlack)) {
                Box(modifier = Modifier.fillMaxWidth(0.85f).fillMaxHeight().background(Brush.horizontalGradient(listOf(Color.Green, Color.Yellow, Color.Red))))
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text(text = "EST. EXPOSURE: 102dB", color = TextMuted, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Box(modifier = Modifier.clip(RoundedCornerShape(100)).background(Color.Red.copy(alpha = 0.15f)).border(1.dp, Color.Red.copy(alpha = 0.3f), RoundedCornerShape(100)).padding(horizontal = 10.dp, vertical = 4.dp)) {
                    Text(text = "WEAR PLUGS", color = Color.Red, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                }
            }
        }
    }
}

@Composable
fun SOSBeaconButton(onClick: () -> Unit) {
    Button(onClick = onClick, colors = ButtonDefaults.buttonColors(containerColor = Color.Red), shape = RoundedCornerShape(36.dp), modifier = Modifier.fillMaxWidth().height(96.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.FlashOn, contentDescription = null, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(text = "SOS BEACON", fontSize = 26.sp, fontWeight = FontWeight.Black, letterSpacing = 4.sp)
        }
    }
}

@Composable
fun HydrationTrackerCard() {
    var cups by remember { mutableIntStateOf(0) }
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 16.dp)) {
                Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(CyanPulse.copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.WaterDrop, contentDescription = null, tint = CyanPulse, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Text(text = "HYDRATION", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
            }
            
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Column {
                    Text(text = "$cups CUPS TODAY", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
                    Text(text = "GOAL: 8 CUPS", color = TextMuted, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                IconButton(
                    onClick = { cups++ },
                    modifier = Modifier.size(56.dp).clip(CircleShape).background(CyanPulse)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Water", tint = Color.Black)
                }
            }
        }
    }
}

@Composable
fun BatterySaverCard() {
    var isEnabled by remember { mutableStateOf(false) }
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(AcidYellow.copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.BatteryChargingFull, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "BATTERY SAVER", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
                    Text(text = "Reduce background sync", color = TextMuted, fontSize = 12.sp)
                }
                Switch(
                    checked = isEnabled,
                    onCheckedChange = { isEnabled = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = AcidYellow, checkedTrackColor = AcidYellow.copy(alpha = 0.3f))
                )
            }
        }
    }
}

enum class ToolMode {
    SOS, COLOR_FLASH, BIG_TEXT, CANDLE
}

@Composable
fun SafetyToolButton(title: String, icon: ImageVector, onClick: () -> Unit) {
    Button(
        onClick = {
            onClick()
        },
        colors = ButtonDefaults.buttonColors(containerColor = CardBackground),
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier.fillMaxWidth().height(72.dp).border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(24.dp))
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(text = title, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        }
    }
}

@Composable
fun ColorFlashOverlay(onDismiss: () -> Unit) {
    var selectedColor by remember { mutableStateOf(Color.Red) }
    val colors = listOf(Color.Red, Color.Green, Color.Blue, Color.Yellow, Color.Magenta, Color.Cyan, Color.White)
    
    Box(modifier = Modifier.fillMaxSize().background(selectedColor).clickable(onClick = onDismiss), contentAlignment = Alignment.BottomCenter) {
        Row(
            modifier = Modifier.padding(bottom = 48.dp).background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(32.dp)).padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            colors.forEach { color ->
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(color)
                        .border(if (selectedColor == color) 3.dp else 0.dp, Color.White, CircleShape)
                        .clickable { selectedColor = color }
                )
            }
        }
    }
}

@Composable
fun BigTextOverlay(onDismiss: () -> Unit) {
    var text by remember { mutableStateOf("FIND ME") }
    Box(modifier = Modifier.fillMaxSize().background(Color.White).clickable(onClick = onDismiss), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            BasicTextField(
                value = text,
                onValueChange = { text = it.uppercase() },
                textStyle = TextStyle(color = Color.Black, fontSize = 80.sp, fontWeight = FontWeight.Black, textAlign = androidx.compose.ui.text.style.TextAlign.Center),
                modifier = Modifier.fillMaxWidth().padding(24.dp)
            )
            Text("TAP TO CLOSE", color = Color.Black.copy(alpha = 0.3f), fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun CandleOverlay(onDismiss: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition(label = "candle")
    val flicker by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(animation = tween(150, easing = LinearEasing), repeatMode = RepeatMode.Reverse),
        label = "flicker"
    )
    
    Box(modifier = Modifier.fillMaxSize().background(OLEDBlack).clickable(onClick = onDismiss), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // The Flame
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .scale(flicker)
                    .background(
                        Brush.radialGradient(
                            listOf(Color(0xFFFFA500), Color(0xFFFF4500), Color.Transparent)
                        )
                    )
            )
            Spacer(modifier = Modifier.height(20.dp))
            // The Candle
            Box(modifier = Modifier.width(40.dp).height(150.dp).background(Color.White, RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp)))
        }
    }
}

@Composable
fun SunscreenAlertCard() {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(AcidYellow.copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.WbSunny, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "SUNSCREEN ALERT", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
                    Text(text = "UV Index: 7 (High)", color = TextMuted, fontSize = 12.sp)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(AcidYellow.copy(alpha = 0.15f))
                    .padding(12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "REAPPLY IN: 45 MIN", color = AcidYellow, fontWeight = FontWeight.Black, fontSize = 14.sp)
            }
        }
    }
}

@Composable
fun QuietZonesCard() {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(CyanPulse.copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.HeadsetOff, contentDescription = null, tint = CyanPulse, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "QUIET ZONES", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
                    Text(text = "Find a place to chill", color = TextMuted, fontSize = 12.sp)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = "Nearest: ArtZone Garden (5 min walk)", color = CyanPulse, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun VibeOfTheHourCard() {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(PrimaryMagenta.copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = PrimaryMagenta, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "VIBE OF THE HOUR", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
                    Text(text = "Current island energy", color = TextMuted, fontSize = 12.sp)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = "✨ UNHINGED TECHNO RAVE", color = PrimaryMagenta, fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
        }
    }
}

@Composable
fun HighContrastCard() {
    var isEnabled by remember { mutableStateOf(false) }
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(Color.White.copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.InvertColors, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "HIGH CONTRAST", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
                    Text(text = "Maximum legibility", color = TextMuted, fontSize = 12.sp)
                }
                Switch(
                    checked = isEnabled,
                    onCheckedChange = { isEnabled = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = Color.White.copy(alpha = 0.3f))
                )
            }
        }
    }
}

@Composable
fun FlashOverlay(onDismiss: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition(label = "flash")
    val alpha by infiniteTransition.animateFloat(initialValue = 0.5f, targetValue = 1f, animationSpec = infiniteRepeatable(animation = tween(100, easing = LinearEasing), repeatMode = RepeatMode.Reverse), label = "alpha")
    Box(modifier = Modifier.fillMaxSize().background(Color.White.copy(alpha = alpha)).clickable(onClick = onDismiss), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(modifier = Modifier.size(200.dp).border(16.dp, Color.Black, CircleShape).background(Color.Transparent, CircleShape).clickable(onClick = onDismiss), contentAlignment = Alignment.Center) { Text(text = "OFF", color = Color.Black, fontSize = 56.sp, fontWeight = FontWeight.Black) }
            Spacer(modifier = Modifier.height(48.dp))
            Text(text = "FIND ME!", color = Color.Black, fontSize = 72.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-4).sp)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackSystemCard(snackbarHostState: SnackbarHostState, scope: kotlinx.coroutines.CoroutineScope) {
    val haptic = rememberHapticManager()
    val config = FestivalConfig.current
    var text by remember { mutableStateOf("") }
    var sent by remember { mutableStateOf(false) }

    if (sent) {
        Card(
            colors = CardDefaults.cardColors(containerColor = ToxicGreen.copy(alpha = 0.1f)),
            shape = RoundedCornerShape(32.dp),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, ToxicGreen.copy(alpha = 0.2f), RoundedCornerShape(32.dp))
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(ToxicGreen.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Favorite,
                        contentDescription = null,
                        tint = ToxicGreen,
                        modifier = Modifier.size(32.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Transmission Success",
                    color = TextPrimary,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-1).sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "The Scouts thank you. Your feedback helps make ${config.name} even more legendary.",
                    color = TextMuted,
                    fontSize = 14.sp,
                    fontStyle = FontStyle.Italic,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = {
                        haptic.lightTap()
                        sent = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = ToxicGreen),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ToxicGreen.copy(alpha = 0.2f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "SEND ANOTHER",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                }
            }
        }
    } else {
        Card(
            colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(32.dp),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(PrimaryMagenta.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.Message,
                            contentDescription = null,
                            tint = PrimaryMagenta,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(
                        text = "HQ FEEDBACK",
                        color = PrimaryMagenta,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-1).sp
                    )
                }

                Text(
                    text = "Found a bug? Have a suggestion? Spotted a secret stage? Report it directly to the ${config.name} Insider team.",
                    color = TextMuted,
                    fontSize = 14.sp,
                    fontStyle = FontStyle.Italic,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                OutlinedTextField(
                    value = text,
                    onValueChange = { text = it },
                    placeholder = { Text("Report your findings...", color = TextMuted.copy(alpha = 0.5f)) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MutedBackground.copy(alpha = 0.3f),
                        unfocusedContainerColor = MutedBackground.copy(alpha = 0.3f),
                        focusedBorderColor = Color.Transparent,
                        unfocusedBorderColor = Color.Transparent,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    textStyle = TextStyle(fontSize = 16.sp, color = TextPrimary),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .padding(bottom = 16.dp)
                )

                Button(
                    onClick = {
                        if (text.trim().isNotEmpty()) {
                            haptic.successBurst()
                            scope.launch {
                                snackbarHostState.showSnackbar("INTEL RECEIVED: Your report has been transmitted to Island HQ.")
                            }
                            text = ""
                            sent = true
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryMagenta, contentColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "TRANSMIT INTEL",
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }
            }
        }
    }
}
