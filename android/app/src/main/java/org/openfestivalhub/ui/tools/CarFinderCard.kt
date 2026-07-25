package org.openfestivalhub.ui.tools

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
import androidx.compose.material.icons.filled.DirectionsCar
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
import org.openfestivalhub.ui.theme.*
import org.openfestivalhub.ui.utils.rememberHapticManager
import kotlin.math.*

import org.openfestivalhub.data.config.FestivalConfig

private val PREFS_NAME get() = "${FestivalConfig.current.id}_car"
private const val KEY_LAT = "car_lat"
private const val KEY_LNG = "car_lng"

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
fun CarFinderCard() {
    val context = LocalContext.current
    val haptic = rememberHapticManager()
    val prefs = remember { context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE) }

    var carLat by remember { mutableStateOf(prefs.getString(KEY_LAT, null)?.toDoubleOrNull()) }
    var carLng by remember { mutableStateOf(prefs.getString(KEY_LNG, null)?.toDoubleOrNull()) }
    var currentLat by remember { mutableStateOf<Double?>(null) }
    var currentLng by remember { mutableStateOf<Double?>(null) }
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
                carLat = loc.latitude
                carLng = loc.longitude
                currentLat = loc.latitude
                currentLng = loc.longitude
                prefs.edit()
                    .putString(KEY_LAT, loc.latitude.toString())
                    .putString(KEY_LNG, loc.longitude.toString())
                    .apply()
                haptic.successBurst()
            }
            isLocating = false
        }
    }

    val hasSaved = carLat != null && carLng != null
    val distText = remember(carLat, carLng, currentLat, currentLng) {
        if (carLat != null && carLng != null && currentLat != null && currentLng != null) {
            val d = haversineMetres(currentLat!!, currentLng!!, carLat!!, carLng!!)
            if (d < 1000) "${d.toInt()}m" else "${"%.1f".format(d / 1000)}km"
        } else null
    }
    val bearingDeg = remember(carLat, carLng, currentLat, currentLng) {
        if (carLat != null && carLng != null && currentLat != null && currentLng != null)
            bearing(currentLat!!, currentLng!!, carLat!!, carLng!!)
        else null
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = CardBackground.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 16.dp)) {
                Box(
                    modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(CyanPulse.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = CyanPulse, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Text("CAR FINDER", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp)
            }

            if (hasSaved) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 12.dp)) {
                    bearingDeg?.let { deg ->
                        Icon(
                            Icons.Default.Navigation,
                            contentDescription = "Direction to car",
                            tint = CyanPulse,
                            modifier = Modifier.size(40.dp).rotate(deg)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                    }
                    Column {
                        distText?.let {
                            Text(it, color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Black)
                            Text("to your car", color = TextMuted, fontSize = 12.sp)
                        } ?: Text("Location synced", color = TextMuted, fontSize = 13.sp)
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
                        colors = ButtonDefaults.buttonColors(containerColor = CyanPulse.copy(alpha = 0.15f), contentColor = CyanPulse),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text("REFRESH", fontWeight = FontWeight.Black, fontSize = 11.sp, letterSpacing = 1.sp)
                    }
                    Button(
                        onClick = {
                            haptic.mediumTap()
                            carLat = null; carLng = null; currentLat = null; currentLng = null
                            prefs.edit().remove(KEY_LAT).remove(KEY_LNG).apply()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.1f), contentColor = Color.Red),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.height(48.dp)
                    ) {
                        Text("CLEAR", fontWeight = FontWeight.Black, fontSize = 11.sp, letterSpacing = 1.sp)
                    }
                }
            } else {
                Text(text = "Save your parking spot to find your way back after the festival.", color = TextMuted, fontSize = 13.sp, lineHeight = 18.sp)
                Spacer(modifier = Modifier.height(20.dp))
                Button(
                    onClick = { haptic.mediumTap(); permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = OLEDBlack),
                    shape = RoundedCornerShape(16.dp),
                    enabled = !isLocating,
                    modifier = Modifier.fillMaxWidth().height(56.dp)
                ) {
                    if (isLocating) {
                        CircularProgressIndicator(color = OLEDBlack, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    } else {
                        Text("SAVE CURRENT LOCATION", fontWeight = FontWeight.Black)
                    }
                }
            }
        }
    }
}
