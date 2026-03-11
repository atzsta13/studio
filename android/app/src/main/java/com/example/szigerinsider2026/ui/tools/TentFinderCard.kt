package com.example.szigerinsider2026.ui.tools

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import kotlin.math.*

private const val PREFS_NAME = "sziget_tent"
private const val KEY_LAT = "tent_lat"
private const val KEY_LNG = "tent_lng"

private fun haversineMetres(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
    val R = 6371e3
    val phi1 = Math.toRadians(lat1)
    val phi2 = Math.toRadians(lat2)
    val dphi = Math.toRadians(lat2 - lat1)
    val dlambda = Math.toRadians(lon2 - lon1)
    val a = sin(dphi / 2).pow(2) + cos(phi1) * cos(phi2) * sin(dlambda / 2).pow(2)
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))
}

private fun bearing(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Float {
    val phi1 = Math.toRadians(lat1)
    val phi2 = Math.toRadians(lat2)
    val dl = Math.toRadians(lon2 - lon1)
    val y = sin(dl) * cos(phi2)
    val x = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(dl)
    return ((Math.toDegrees(atan2(y, x)) + 360) % 360).toFloat()
}

@Composable
fun TentFinderCard() {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val prefs = remember { context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE) }

    var tentLat by remember { mutableStateOf(prefs.getString(KEY_LAT, null)?.toDoubleOrNull()) }
    var tentLng by remember { mutableStateOf(prefs.getString(KEY_LNG, null)?.toDoubleOrNull()) }
    var currentLat by remember { mutableStateOf<Double?>(null) }
    var currentLng by remember { mutableStateOf<Double?>(null) }
    var permissionDenied by remember { mutableStateOf(false) }
    var isLocating by remember { mutableStateOf(false) }

    fun getLocation(): android.location.Location? {
        val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        return try {
            lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                ?: lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
        } catch (_: SecurityException) { null }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            isLocating = true
            getLocation()?.let { loc ->
                tentLat = loc.latitude
                tentLng = loc.longitude
                currentLat = loc.latitude
                currentLng = loc.longitude
                prefs.edit()
                    .putString(KEY_LAT, loc.latitude.toString())
                    .putString(KEY_LNG, loc.longitude.toString())
                    .apply()
                haptic.successBurst()
            }
            isLocating = false
        } else {
            permissionDenied = true
        }
    }

    val hasSaved = tentLat != null && tentLng != null
    val distText = remember(tentLat, tentLng, currentLat, currentLng) {
        if (tentLat != null && tentLng != null && currentLat != null && currentLng != null) {
            val d = haversineMetres(currentLat!!, currentLng!!, tentLat!!, tentLng!!)
            if (d < 1000) "${d.toInt()}m" else "${"%.1f".format(d / 1000)}km"
        } else null
    }
    val bearingDeg = remember(tentLat, tentLng, currentLat, currentLng) {
        if (tentLat != null && tentLng != null && currentLat != null && currentLng != null)
            bearing(currentLat!!, currentLng!!, tentLat!!, tentLng!!)
        else null
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(40.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, AcidYellow.copy(alpha = 0.15f), RoundedCornerShape(40.dp))
    ) {
        Column(modifier = Modifier.padding(28.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 16.dp)) {
                Box(
                    modifier = Modifier.size(52.dp).clip(RoundedCornerShape(16.dp)).background(AcidYellow.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.MyLocation, contentDescription = null, tint = AcidYellow, modifier = Modifier.size(28.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text("TENT FINDER", color = AcidYellow, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-0.5).sp)
                    Text(
                        if (hasSaved) "Spot saved — tap to refresh heading" else "Mark your camp location",
                        color = TextMuted, fontSize = 12.sp
                    )
                }
            }

            if (hasSaved) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 12.dp)) {
                    bearingDeg?.let { deg ->
                        Icon(
                            Icons.Default.Navigation,
                            contentDescription = "Direction to tent",
                            tint = AcidYellow,
                            modifier = Modifier.size(48.dp).rotate(deg)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                    }
                    Column {
                        distText?.let {
                            Text(it, color = TextPrimary, fontSize = 26.sp, fontWeight = FontWeight.Black)
                            Text("to your tent", color = TextMuted, fontSize = 12.sp)
                        } ?: Text("Get your location to see distance", color = TextMuted, fontSize = 13.sp)
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = {
                            haptic.lightTap()
                            val hasPermission = ContextCompat.checkSelfPermission(
                                context, Manifest.permission.ACCESS_FINE_LOCATION
                            ) == PackageManager.PERMISSION_GRANTED
                            if (hasPermission) {
                                getLocation()?.let { currentLat = it.latitude; currentLng = it.longitude }
                            } else {
                                permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AcidYellow.copy(alpha = 0.15f), contentColor = AcidYellow),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1f).height(52.dp)
                    ) {
                        Text("REFRESH", fontWeight = FontWeight.Black, fontSize = 12.sp, letterSpacing = 1.sp)
                    }
                    Button(
                        onClick = {
                            haptic.mediumTap()
                            tentLat = null; tentLng = null; currentLat = null; currentLng = null
                            prefs.edit().remove(KEY_LAT).remove(KEY_LNG).apply()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.1f), contentColor = Color.Red),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.height(52.dp)
                    ) {
                        Text("CLEAR", fontWeight = FontWeight.Black, fontSize = 12.sp, letterSpacing = 1.sp)
                    }
                }
            } else {
                if (permissionDenied) {
                    Text(
                        "Location permission denied. Enable in Settings to use this feature.",
                        color = Color.Red.copy(alpha = 0.8f), fontSize = 13.sp,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                }
                Button(
                    onClick = { haptic.mediumTap(); permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION) },
                    colors = ButtonDefaults.buttonColors(containerColor = AcidYellow, contentColor = OLEDBlack),
                    shape = RoundedCornerShape(20.dp),
                    enabled = !isLocating,
                    modifier = Modifier.fillMaxWidth().height(60.dp)
                ) {
                    if (isLocating) {
                        CircularProgressIndicator(color = OLEDBlack, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    } else {
                        Text("MARK MY SPOT", fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 2.sp)
                    }
                }
            }
        }
    }
}
