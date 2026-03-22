package com.example.szigerinsider2026.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.szigerinsider2026.ui.theme.*

/**
 * A reusable Brutalist-style button with neon accents and proper accessibility roles.
 */
@Composable
fun BrutalistButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    color: Color = ToxicGreen,
    textColor: Color = Color.Black,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    height: Dp = 56.dp
) {
    Surface(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier
            .height(height)
            .clip(RoundedCornerShape(16.dp))
            .semantics { role = Role.Button },
        color = if (enabled) color else color.copy(alpha = 0.3f),
        contentColor = if (enabled) textColor else textColor.copy(alpha = 0.5f)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 24.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (icon != null) {
                Icon(icon, contentDescription = null, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(10.dp))
            }
            Text(
                text = text.uppercase(),
                fontWeight = FontWeight.Black,
                fontSize = 14.sp,
                letterSpacing = 1.sp
            )
        }
    }
}

/**
 * A tactical badge used for genres, vibes, and status indicators.
 */
@Composable
fun BrutalistBadge(
    text: String,
    color: Color,
    modifier: Modifier = Modifier,
    isOutlined: Boolean = false
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .then(
                if (isOutlined) {
                    Modifier
                        .border(1.dp, color.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                        .background(Color.Transparent)
                } else {
                    Modifier.background(color.copy(alpha = 0.12f))
                }
            )
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = text.uppercase(),
            color = color,
            fontSize = 9.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.5.sp
        )
    }
}

/**
 * A neon-bordered card container for lists and grids.
 */
@Composable
fun NeonCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    accentColor: Color = Color.White.copy(alpha = 0.08f),
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .border(1.dp, accentColor.copy(alpha = 0.35f), RoundedCornerShape(20.dp)),
        color = CardBackground,
        contentColor = Color.White
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            content()
        }
    }
}

/**
 * A stylized section header for the Brutalist theme.
 */
@Composable
fun BrutalistHeader(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    color: Color = Color.White
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = title.uppercase(),
            style = BrutalistTypography.headlineLarge,
            color = color
        )
        if (subtitle != null) {
            Text(
                text = subtitle,
                color = TextMuted,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}
