package org.openfestivalhub.ui.discover

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.utils.rememberHapticManager

private fun countryCodeToFlag(code: String): String {
    if (code.length != 2) return "🌐"
    val offset = 0x1F1E6 - 'A'.code
    return code.uppercase().map { char ->
        String(Character.toChars(char.code + offset))
    }.joinToString("")
}

private fun countryCodeToName(code: String): String = when (code.uppercase()) {
    "GB" -> "United Kingdom"
    "FR" -> "France"
    "DE" -> "Germany"
    "BR" -> "Brazil"
    "JP" -> "Japan"
    "HU" -> "Hungary"
    "AT" -> "Austria"
    "US" -> "United States"
    "AU" -> "Australia"
    "BE" -> "Belgium"
    "NL" -> "Netherlands"
    "SE" -> "Sweden"
    "NO" -> "Norway"
    "DK" -> "Denmark"
    "FI" -> "Finland"
    "IT" -> "Italy"
    "ES" -> "Spain"
    "PL" -> "Poland"
    "RU" -> "Russia"
    "CA" -> "Canada"
    "NZ" -> "New Zealand"
    "IE" -> "Ireland"
    "CH" -> "Switzerland"
    "PT" -> "Portugal"
    "ZA" -> "South Africa"
    "MX" -> "Mexico"
    "AR" -> "Argentina"
    "KR" -> "South Korea"
    "CN" -> "China"
    "IN" -> "India"
    "NG" -> "Nigeria"
    "GH" -> "Ghana"
    "CM" -> "Cameroon"
    "TR" -> "Turkey"
    "IL" -> "Israel"
    "LB" -> "Lebanon"
    "EG" -> "Egypt"
    "MA" -> "Morocco"
    "TN" -> "Tunisia"
    "CO" -> "Colombia"
    "CL" -> "Chile"
    "PE" -> "Peru"
    "UA" -> "Ukraine"
    "CZ" -> "Czech Republic"
    "SK" -> "Slovakia"
    "RO" -> "Romania"
    "GR" -> "Greece"
    "HR" -> "Croatia"
    "RS" -> "Serbia"
    else -> code.uppercase()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CountryExplorerSheet(
    artists: List<Artist>,
    activeCountryFilter: String?,
    onCountrySelected: (String?) -> Unit,
    onDismiss: () -> Unit
) {
    val haptic = rememberHapticManager()

    // Build country → artist count map, sorted descending
    val countryCounts = remember(artists) {
        artists
            .mapNotNull { it.countryCode }
            .groupingBy { it }
            .eachCount()
            .entries
            .sortedByDescending { it.value }
    }
    val topCountry = countryCounts.firstOrNull()

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = CardBackground,
        contentColor = TextPrimary,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 12.dp, bottom = 4.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Color.White.copy(alpha = 0.2f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 40.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "GLOBAL LINEUP",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-0.5).sp
                    )
                    Text(
                        text = "${countryCounts.size} NATIONS · ${artists.size} ARTISTS",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    )
                }
                IconButton(onClick = { haptic.lightTap(); onDismiss() }) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                }
            }

            // Stats bar
            if (topCountry != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(OLEDBlack)
                        .border(1.dp, AcidYellow.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = "MOST REPRESENTED: ${countryCodeToFlag(topCountry.key)} ${countryCodeToName(topCountry.key).uppercase()} · ${topCountry.value} ARTISTS",
                        color = AcidYellow,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 0.5.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // "Show All" row
            CountryRow(
                flag = "🌐",
                name = "ALL COUNTRIES",
                count = artists.size,
                isSelected = activeCountryFilter == null,
                onClick = {
                    haptic.mediumTap()
                    onCountrySelected(null)
                    onDismiss()
                }
            )

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 8.dp),
                color = Color.White.copy(alpha = 0.06f)
            )

            // Country list
            LazyColumn(
                modifier = Modifier.heightIn(max = 400.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(countryCounts, key = { it.key }) { entry ->
                    CountryRow(
                        flag = countryCodeToFlag(entry.key),
                        name = countryCodeToName(entry.key).uppercase(),
                        count = entry.value,
                        isSelected = activeCountryFilter == entry.key,
                        onClick = {
                            haptic.mediumTap()
                            onCountrySelected(entry.key)
                            onDismiss()
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun CountryRow(
    flag: String,
    name: String,
    count: Int,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) AcidYellow.copy(alpha = 0.1f) else Color.Transparent)
            .border(
                width = if (isSelected) 1.dp else 0.dp,
                color = if (isSelected) AcidYellow.copy(alpha = 0.4f) else Color.Transparent,
                shape = RoundedCornerShape(12.dp)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(flag, fontSize = 22.sp)
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = name,
            color = if (isSelected) AcidYellow else TextPrimary,
            fontSize = 14.sp,
            fontWeight = if (isSelected) FontWeight.Black else FontWeight.Medium,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = "$count",
            color = if (isSelected) AcidYellow else TextMuted,
            fontSize = 13.sp,
            fontWeight = FontWeight.Black
        )
    }
}
