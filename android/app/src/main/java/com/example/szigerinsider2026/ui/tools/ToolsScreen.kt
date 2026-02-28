package com.example.szigerinsider2026.ui.tools

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.CurrencyExchange
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
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
import com.example.szigerinsider2026.ui.theme.*
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ToolsScreen() {
    val context = LocalContext.current
    var hufAmount by remember { mutableStateOf("1000") }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Tactical, 1: Safety
    var isFlashOn by remember { mutableStateOf(false) }

    if (isFlashOn) {
        FlashOverlay(onDismiss = { isFlashOn = false })
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(OLEDBlack)
                .padding(horizontal = 20.dp),
            contentPadding = PaddingValues(top = 48.dp, bottom = 120.dp)
        ) {
            // Page Header
            item {
                Text(
                    text = "SURVIVAL TOOLKIT",
                    color = TextPrimary,
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-2).sp,
                    lineHeight = 38.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Text(
                    text = "Elite tactical utilities for the Island of Freedom. No signal required.",
                    color = TextMuted,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 22.sp,
                    modifier = Modifier.padding(bottom = 40.dp)
                )
            }

            // HUF Converter Section (Persistent)
            item {
                HufConverterCard(
                    hufAmount = hufAmount,
                    onAmountChange = { hufAmount = it }
                )
            }

            // Tabs
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
                    TabItem(
                        text = "TACTICAL",
                        isSelected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        modifier = Modifier.weight(1f)
                    )
                    TabItem(
                        text = "SAFETY",
                        isSelected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Tab Content
            if (selectedTab == 0) {
                // TACTICAL TAB
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                        SurvivalCard(
                            title = "UV FORECAST",
                            value = "HIGH (8)",
                            description = "Peak burn: 11:00 - 15:00. Reapply sunscreen now.",
                            icon = Icons.Default.WbSunny,
                            accentColor = Color(0xFFF97316)
                        )

                        SOSBeaconButton(onClick = { isFlashOn = true })
                    }
                }
            } else {
                // SAFETY TAB
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                        EmergencyCard(
                            title = "SECURITY ALERT",
                            description = "Tap to instantly dial the festival main security dispatch. Have your location ready.",
                            buttonText = "DIAL SECURITY",
                            phoneNumber = "112",
                            containerColor = Color(0xFFDC2626),
                            icon = Icons.Default.Shield
                        )

                        EmergencyCard(
                            title = "MEDICAL HELP",
                            description = "Tap to instantly dial the on-site emergency medical responders. Available 24/7.",
                            buttonText = "DIAL MEDICAL",
                            phoneNumber = "104",
                            containerColor = Color(0xFF2563EB),
                            icon = Icons.Default.MedicalServices
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TabItem(text: String, isSelected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val backgroundColor by animateColorAsState(
        targetValue = if (isSelected) CardBackground else Color.Transparent, label = "tabBg"
    )
    val textColor by animateColorAsState(
        targetValue = if (isSelected) TextPrimary else TextMuted, label = "tabText"
    )

    Box(
        modifier = modifier
            .fillMaxHeight()
            .clip(RoundedCornerShape(30.dp))
            .background(backgroundColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = textColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 2.sp
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HufConverterCard(hufAmount: String, onAmountChange: (String) -> Unit) {
    val hufValue = hufAmount.toFloatOrNull() ?: 0f
    val eurValue = String.format(Locale.US, "%.2f", hufValue * 0.0025f)
    val usdValue = String.format(Locale.US, "%.2f", hufValue * 0.0027f)

    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(40.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(40.dp))
    ) {
        Column(modifier = Modifier.padding(32.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 24.dp)
            ) {
                Icon(Icons.Default.CurrencyExchange, contentDescription = null, tint = ToxicGreen, modifier = Modifier.size(28.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "HUF CONVERTER",
                    color = ToxicGreen,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-1).sp
                )
            }

            Text(
                text = "FORINTS (HUF)",
                color = TextMuted.copy(alpha = 0.6f),
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 4.sp,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            OutlinedTextField(
                value = hufAmount,
                onValueChange = onAmountChange,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MutedBackground.copy(alpha = 0.3f),
                    unfocusedContainerColor = MutedBackground.copy(alpha = 0.3f),
                    focusedBorderColor = Color.Transparent,
                    unfocusedBorderColor = Color.Transparent,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                ),
                textStyle = TextStyle(
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary,
                    letterSpacing = (-1).sp
                ),
                singleLine = true,
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp)
                    .height(88.dp)
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
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(OLEDBlack)
            .border(1.dp, Color.White.copy(alpha = 0.03f), RoundedCornerShape(24.dp))
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, color = TextMuted.copy(alpha = 0.6f), fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 3.sp, modifier = Modifier.padding(bottom = 4.dp))
            Text(value, color = TextPrimary, fontSize = 26.sp, fontWeight = FontWeight.Black, letterSpacing = (-1).sp)
        }
    }
}

@Composable
fun SurvivalCard(title: String, value: String, description: String, icon: ImageVector, accentColor: Color) {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(48.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(48.dp))
    ) {
        Row(modifier = Modifier.padding(32.dp), verticalAlignment = Alignment.Top) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(accentColor.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(32.dp))
            }
            Spacer(modifier = Modifier.width(24.dp))
            Column {
                Text(
                    text = title,
                    color = TextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-0.5).sp,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
                Text(
                    text = buildString {
                        append("Index: ")
                        append(value)
                    },
                    color = TextMuted,
                    fontSize = 16.sp,
                    lineHeight = 22.sp
                )
                Text(
                    text = description,
                    color = TextMuted.copy(alpha = 0.7f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }
    }
}

@Composable
fun EmergencyCard(title: String, description: String, buttonText: String, phoneNumber: String, containerColor: Color, icon: ImageVector) {
    val context = LocalContext.current
    val dialAction = {
        val intent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:$phoneNumber")
        }
        context.startActivity(intent)
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = containerColor),
        shape = RoundedCornerShape(48.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = dialAction)
    ) {
        Column(modifier = Modifier.padding(32.dp)) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(32.dp))
            }
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = title,
                color = Color.White,
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                letterSpacing = (-1).sp,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            Text(
                text = description,
                color = Color.White.copy(alpha = 0.9f),
                fontSize = 17.sp,
                fontStyle = FontStyle.Italic,
                lineHeight = 24.sp,
                modifier = Modifier.padding(bottom = 32.dp)
            )
            
            Button(
                onClick = dialAction,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White,
                    contentColor = containerColor
                ),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(72.dp)
            ) {
                Text(
                    text = buttonText,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp
                )
            }
        }
    }
}

@Composable
fun SOSBeaconButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
        shape = RoundedCornerShape(36.dp),
        modifier = Modifier
            .fillMaxWidth()
            .height(96.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.FlashOn, contentDescription = null, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "SOS BEACON",
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 4.sp
            )
        }
    }
}

@Composable
fun FlashOverlay(onDismiss: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition(label = "flash")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(100, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ), label = "alpha"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White.copy(alpha = alpha))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .border(16.dp, Color.Black, CircleShape)
                    .background(Color.Transparent, CircleShape)
                    .clickable(onClick = onDismiss),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "OFF",
                    color = Color.Black,
                    fontSize = 56.sp,
                    fontWeight = FontWeight.Black
                )
            }
            Spacer(modifier = Modifier.height(48.dp))
            Text(
                text = "FIND ME!",
                color = Color.Black,
                fontSize = 72.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic,
                letterSpacing = (-4).sp
            )
        }
    }
}
