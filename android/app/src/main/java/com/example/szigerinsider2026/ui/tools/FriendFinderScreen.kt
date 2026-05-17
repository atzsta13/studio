package com.example.szigerinsider2026.ui.tools

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Group
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import java.util.UUID

private const val PREFS_NAME = "friend_finder_prefs"
private const val KEY_USER_ID = "friend_finder_user_id"
private const val KEY_LINKED = "friend_finder_linked"

private fun getOrCreateUserId(context: Context): String {
    val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val existing = prefs.getString(KEY_USER_ID, null)
    if (existing != null) return existing
    val newId = UUID.randomUUID().toString().replace("-", "").take(12)
    prefs.edit().putString(KEY_USER_ID, newId).apply()
    return newId
}

private fun loadLinkedFriends(context: Context): List<String> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_LINKED, null) ?: return emptyList()
    return try {
        Json.decodeFromString<List<String>>(raw)
    } catch (e: Exception) {
        emptyList()
    }
}

private fun saveLinkedFriends(context: Context, friends: List<String>) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_LINKED, Json.encodeToString(friends)).apply()
}

private fun generateQrBitmap(content: String, size: Int = 512): Bitmap? {
    return try {
        val writer = QRCodeWriter()
        val bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size)
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bitmap.setPixel(x, y, if (bitMatrix[x, y]) AndroidColor.BLACK else AndroidColor.WHITE)
            }
        }
        bitmap
    } catch (e: Exception) {
        null
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FriendFinderScreen(navController: NavController) {
    val haptic = rememberHapticManager()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    val userId = remember { getOrCreateUserId(context) }
    val squadCode = "sziget-squad-$userId"
    val qrBitmap = remember(squadCode) { generateQrBitmap(squadCode) }

    var linkedFriends by remember { mutableStateOf(loadLinkedFriends(context)) }
    var showScanDialog by remember { mutableStateOf(false) }
    var manualCodeInput by remember { mutableStateOf("") }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = OLEDBlack
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(OLEDBlack)
                .padding(padding)
                .padding(horizontal = 20.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 120.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top Bar
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { haptic.mediumTap(); navController.popBackStack() }
                    ) {
                        Icon(
                            Icons.Default.ChevronLeft,
                            contentDescription = "Back",
                            tint = TextPrimary,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "SQUAD FINDER",
                        color = AcidYellow,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = (-1).sp
                    )
                }
            }

            // Explanation
            item {
                Text(
                    text = "Share your Squad Code with friends. Scan theirs to sync up.",
                    color = TextMuted,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 32.dp)
                        .padding(horizontal = 8.dp)
                )
            }

            // QR Code
            item {
                Box(
                    modifier = Modifier
                        .size(200.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White)
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    if (qrBitmap != null) {
                        Image(
                            bitmap = qrBitmap.asImageBitmap(),
                            contentDescription = "Squad QR Code",
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Icon(
                            Icons.Default.Group,
                            contentDescription = null,
                            tint = Color.Black,
                            modifier = Modifier.size(80.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Squad Code label
            item {
                Text(
                    text = squadCode,
                    color = AcidYellow,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                    textAlign = TextAlign.Center,
                    letterSpacing = 0.5.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 20.dp)
                )
            }

            // COPY CODE button
            item {
                OutlinedButton(
                    onClick = {
                        haptic.mediumTap()
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Squad Code", squadCode))
                        scope.launch { snackbarHostState.showSnackbar("Code copied to clipboard!") }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, AcidYellow),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = AcidYellow)
                ) {
                    Text(
                        text = "COPY CODE",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Separator
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(modifier = Modifier.weight(1f), color = TextMuted.copy(alpha = 0.3f))
                    Text(
                        text = "  — or —  ",
                        color = TextMuted,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f), color = TextMuted.copy(alpha = 0.3f))
                }
            }

            // SCAN FRIEND'S CODE button
            item {
                Button(
                    onClick = {
                        haptic.mediumTap()
                        showScanDialog = true
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AcidYellow,
                        contentColor = OLEDBlack
                    )
                ) {
                    Text(
                        text = "SCAN FRIEND'S CODE",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                }
                Spacer(modifier = Modifier.height(32.dp))
            }

            // Linked friends header
            if (linkedFriends.isNotEmpty()) {
                item {
                    Text(
                        text = "LINKED SQUAD (${linkedFriends.size})",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    )
                }
            }

            // Linked friends list
            items(linkedFriends) { friendCode ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(CardBackground)
                        .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = friendCode,
                        color = TextPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(
                        onClick = {
                            haptic.mediumTap()
                            val updated = linkedFriends.filter { it != friendCode }
                            saveLinkedFriends(context, updated)
                            linkedFriends = updated
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Remove friend",
                            tint = TextMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }

    // Manual code entry dialog
    if (showScanDialog) {
        AlertDialog(
            onDismissRequest = {
                showScanDialog = false
                manualCodeInput = ""
            },
            containerColor = CardBackground,
            title = {
                Text(
                    text = "ENTER SQUAD CODE",
                    color = TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-0.5).sp
                )
            },
            text = {
                OutlinedTextField(
                    value = manualCodeInput,
                    onValueChange = { manualCodeInput = it },
                    placeholder = {
                        Text("sziget-squad-...", color = TextMuted, fontSize = 14.sp)
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = AcidYellow,
                        unfocusedBorderColor = TextMuted.copy(alpha = 0.3f),
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        cursorColor = AcidYellow
                    ),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val code = manualCodeInput.trim()
                        if (code.isNotBlank() && !linkedFriends.contains(code)) {
                            val updated = linkedFriends + code
                            saveLinkedFriends(context, updated)
                            linkedFriends = updated
                        }
                        showScanDialog = false
                        manualCodeInput = ""
                        haptic.successBurst()
                        scope.launch { snackbarHostState.showSnackbar("Squad linked! Stay close 🤙") }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AcidYellow,
                        contentColor = OLEDBlack
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("LINK UP", fontWeight = FontWeight.Black, fontSize = 14.sp)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showScanDialog = false
                        manualCodeInput = ""
                    }
                ) {
                    Text("CANCEL", color = TextMuted, fontWeight = FontWeight.Black, fontSize = 14.sp)
                }
            }
        )
    }
}
