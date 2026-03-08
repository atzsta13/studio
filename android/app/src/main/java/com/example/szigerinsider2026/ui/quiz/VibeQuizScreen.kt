package com.example.szigerinsider2026.ui.quiz

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.szigerinsider2026.ui.theme.*
import com.example.szigerinsider2026.ui.utils.HapticManager
import com.example.szigerinsider2026.ui.utils.rememberHapticManager

@Composable
fun VibeQuizScreen(navController: NavController, quizViewModel: VibeQuizViewModel) {
    val haptic = rememberHapticManager()

    val stepTitles = listOf(
        "WHAT'S\nYOUR ENERGY?",
        "PICK YOUR\nGENRE WORLD",
        "WHAT'S YOUR\nCROWD VIBE?",
        "CURRENT\nMOOD TAG",
        "WILDCARDS\nWELCOME?"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(OLEDBlack)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .padding(top = 48.dp, bottom = 120.dp)
        ) {
            // Top bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = {
                    haptic.lightTap()
                    if (quizViewModel.step > 0) quizViewModel.step-- else navController.popBackStack()
                }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                }
                Spacer(modifier = Modifier.weight(1f))
                // Step indicator dots
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    repeat(5) { i ->
                        Box(
                            modifier = Modifier
                                .size(if (i == quizViewModel.step) 12.dp else 8.dp)
                                .clip(CircleShape)
                                .background(if (i == quizViewModel.step) AcidYellow else CardBackground)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Step label
            Text(
                text = "STEP ${quizViewModel.step + 1} / 5",
                color = TextMuted,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 3.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Animated question
            AnimatedContent(
                targetState = quizViewModel.step,
                transitionSpec = {
                    (slideInHorizontally { it } + fadeIn()) togetherWith (slideOutHorizontally { -it } + fadeOut())
                },
                label = "quiz_step"
            ) { step ->
                Text(
                    text = stepTitles.getOrElse(step) { "" },
                    color = TextPrimary,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-1).sp,
                    lineHeight = 38.sp
                )
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Step content
            when (quizViewModel.step) {
                0 -> EnergyStep(quizViewModel, haptic)
                1 -> GenreStep(quizViewModel, haptic)
                2 -> CrowdVibeStep(quizViewModel, haptic)
                3 -> MoodTagStep(quizViewModel, haptic)
                4 -> WildcardStep(quizViewModel, haptic)
            }
        }

        // NEXT button
        val canProceed = when (quizViewModel.step) {
            0 -> quizViewModel.energy.isNotEmpty()
            1 -> quizViewModel.selectedGenres.isNotEmpty()
            2 -> quizViewModel.crowdVibe.isNotEmpty()
            3 -> quizViewModel.moodTag.isNotEmpty()
            4 -> true
            else -> false
        }

        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(24.dp)
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(if (canProceed) AcidYellow else CardBackground)
                .clickable(enabled = canProceed) {
                    haptic.mediumTap()
                    if (quizViewModel.step < 4) {
                        quizViewModel.step++
                    } else {
                        quizViewModel.computeResults()
                        navController.navigate("vibe_results")
                    }
                }
                .padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (quizViewModel.step < 4) "NEXT →" else "FIND MY ARTISTS →",
                color = if (canProceed) Color.Black else TextMuted,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp
            )
        }
    }
}

@Composable
private fun EnergyStep(vm: VibeQuizViewModel, haptic: HapticManager) {
    val options = listOf(
        Triple("CHILL", "Laid-back, flowing, atmospheric", "😌"),
        Triple("BALANCED", "Mix of everything, open to surprises", "🎯"),
        Triple("UNHINGED", "Maximum energy, hard drops, chaos", "🔥")
    )
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        options.forEach { (value, desc, emoji) ->
            QuizOptionCard(
                label = "$emoji  $value",
                description = desc,
                isSelected = vm.energy == value,
                onClick = { haptic.mediumTap(); vm.energy = value }
            )
        }
    }
}

@Composable
private fun GenreStep(vm: VibeQuizViewModel, haptic: HapticManager) {
    val options = listOf("ELECTRONIC", "ROCK", "HIP-HOP", "INDIE", "TECHNO", "POP", "METAL", "EXPERIMENTAL")
    Column {
        Text("Pick up to 2", color = TextMuted, fontSize = 13.sp, modifier = Modifier.padding(bottom = 16.dp))
        androidx.compose.foundation.lazy.grid.LazyVerticalGrid(
            columns = androidx.compose.foundation.lazy.grid.GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.heightIn(max = 400.dp)
        ) {
            items(options.size) { i ->
                val genre = options[i]
                val isSelected = genre in vm.selectedGenres
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (isSelected) AcidYellow else CardBackground)
                        .border(1.dp, if (isSelected) AcidYellow else Color.White.copy(alpha = 0.08f), RoundedCornerShape(16.dp))
                        .clickable {
                            haptic.mediumTap()
                            val current = vm.selectedGenres.toMutableSet()
                            if (isSelected) current.remove(genre)
                            else if (current.size < 2) current.add(genre)
                            vm.selectedGenres = current
                        }
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = genre,
                        color = if (isSelected) Color.Black else TextPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun CrowdVibeStep(vm: VibeQuizViewModel, haptic: HapticManager) {
    val options = listOf(
        Triple("DANCE FLOOR", "Eyes closed, lost in the bass", "💃"),
        Triple("MOSH PIT", "Sweat, elbows, pure chaos", "🤘"),
        Triple("FESTIVAL FIELD", "Sitting on grass, singing along", "🌿"),
        Triple("INTIMATE STAGE", "Small crowd, special moments", "🕯️")
    )
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        options.forEach { (value, desc, emoji) ->
            QuizOptionCard(
                label = "$emoji  $value",
                description = desc,
                isSelected = vm.crowdVibe == value,
                onClick = { haptic.mediumTap(); vm.crowdVibe = value }
            )
        }
    }
}

@Composable
private fun MoodTagStep(vm: VibeQuizViewModel, haptic: HapticManager) {
    val options = listOf(
        Triple("EUPHORIC", "Pure joy, arms in the air", "✨"),
        Triple("DARK", "Brooding, intense, underground", "🖤"),
        Triple("NOSTALGIC", "That feeling you can't name", "🌙"),
        Triple("FRESH", "New sounds, open ears", "🌊"),
        Triple("HARD", "Volume at maximum", "⚡")
    )
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        options.forEach { (value, desc, emoji) ->
            QuizOptionCard(
                label = "$emoji  $value",
                description = desc,
                isSelected = vm.moodTag == value,
                onClick = { haptic.mediumTap(); vm.moodTag = value }
            )
        }
    }
}

@Composable
private fun WildcardStep(vm: VibeQuizViewModel, haptic: HapticManager) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        QuizOptionCard(
            label = "🎲  YES, SURPRISE ME",
            description = "Throw in random acts I'd never normally pick",
            isSelected = vm.wildcards,
            onClick = { haptic.mediumTap(); vm.wildcards = true }
        )
        QuizOptionCard(
            label = "🎯  KEEP IT SAFE",
            description = "Stick close to my taste profile",
            isSelected = !vm.wildcards,
            onClick = { haptic.mediumTap(); vm.wildcards = false }
        )
    }
}

@Composable
private fun QuizOptionCard(
    label: String,
    description: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(if (isSelected) AcidYellow.copy(alpha = 0.12f) else CardBackground)
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) AcidYellow else Color.White.copy(alpha = 0.08f),
                shape = RoundedCornerShape(20.dp)
            )
            .clickable(onClick = onClick)
            .padding(18.dp)
    ) {
        Column {
            Text(
                text = label,
                color = if (isSelected) AcidYellow else TextPrimary,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 0.5.sp
            )
            if (description.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = description,
                    color = TextMuted,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )
            }
        }
    }
}
