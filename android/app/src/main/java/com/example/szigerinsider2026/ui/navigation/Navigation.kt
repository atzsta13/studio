package com.example.szigerinsider2026.ui.navigation

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.szigerinsider2026.ui.theme.AcidYellow
import com.example.szigerinsider2026.ui.theme.CardBackground
import com.example.szigerinsider2026.ui.theme.TextMuted
import com.example.szigerinsider2026.ui.home.HomeScreen
import com.example.szigerinsider2026.ui.discover.DiscoverScreen
import com.example.szigerinsider2026.ui.map.MapScreen
import com.example.szigerinsider2026.ui.passport.PassportScreen
import com.example.szigerinsider2026.ui.tools.ToolsScreen
import com.example.szigerinsider2026.ui.tools.SurvivalGuideScreen
import com.example.szigerinsider2026.ui.splash.SplashScreen
import com.example.szigerinsider2026.ui.artist.ArtistDetailScreen
import com.example.szigerinsider2026.ui.schedule.ScheduleScreen
import com.example.szigerinsider2026.ui.utils.rememberHapticManager
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.core.tween
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.quiz.VibeQuizScreen
import com.example.szigerinsider2026.ui.quiz.VibeQuizViewModel
import com.example.szigerinsider2026.ui.quiz.VibeResultScreen
import com.example.szigerinsider2026.ui.food.FoodScreen
import com.example.szigerinsider2026.ui.highlights.HighlightsScreen

sealed class Screen(val route: String, val label: String, val icon: ImageVector) {
    object Home : Screen("home", "HOME", Icons.Filled.Home)
    object Discover : Screen("discover", "ARTISTS", Icons.Filled.Search)
    object Map : Screen("map", "MAP", Icons.Filled.LocationOn)
    object Passport : Screen("passport", "PASSPORT", Icons.Filled.EmojiEvents)
    object Tools : Screen("tools", "TOOLS", Icons.Filled.Build)
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Map,
    Screen.Discover,
    Screen.Passport,
    Screen.Tools
)

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val quizViewModel: VibeQuizViewModel = viewModel(
        factory = VibeQuizViewModel.Factory(LineupRepository(context))
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute != "splash"
        && currentRoute?.startsWith("artist/") != true
        && currentRoute != "schedule"
        && currentRoute != "guide"
        && currentRoute != "vibe_quiz"
        && currentRoute != "vibe_results"
        && currentRoute != "highlights"
        && currentRoute != "food"

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                FluidBottomNavigation(navController = navController)
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "splash",
            modifier = Modifier.padding(innerPadding),
            enterTransition = { fadeIn(animationSpec = tween(300)) },
            exitTransition = { fadeOut(animationSpec = tween(200)) }
        ) {
            composable("splash") {
                SplashScreen(navController)
            }
            composable(Screen.Home.route) {
                HomeScreen(navController = navController)
            }
            composable(Screen.Discover.route) {
                DiscoverScreen(
                    onArtistClick = { id -> navController.navigate("artist/$id") },
                    navController = navController
                )
            }
            composable(Screen.Map.route) {
                MapScreen(navController = navController)
            }
            composable(Screen.Passport.route) {
                PassportScreen(navController = navController)
            }
            composable(Screen.Tools.route) {
                ToolsScreen(navController = navController)
            }
            composable("guide") {
                SurvivalGuideScreen(navController)
            }
            composable("schedule") {
                ScheduleScreen(onArtistClick = { id -> navController.navigate("artist/$id") })
            }
            composable("artist/{artistId}") { backStackEntry ->
                val artistId = backStackEntry.arguments?.getString("artistId") ?: return@composable
                ArtistDetailScreen(
                    artistId = artistId,
                    onBack = { navController.popBackStack() },
                    onArtistNavigate = { id -> navController.navigate("artist/$id") }
                )
            }
            composable("vibe_quiz") {
                VibeQuizScreen(navController = navController, quizViewModel = quizViewModel)
            }
            composable("vibe_results") {
                VibeResultScreen(navController = navController, quizViewModel = quizViewModel)
            }
            composable("food") {
                FoodScreen()
            }
            composable("highlights") {
                HighlightsScreen(onBack = { navController.popBackStack() })
            }
        }
    }
}

@Composable
fun FluidBottomNavigation(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val haptic = rememberHapticManager()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 16.dp, vertical = 10.dp)
    ) {
        NavigationBar(
            modifier = Modifier
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(28.dp)),
            containerColor = CardBackground,
            contentColor = AcidYellow,
            tonalElevation = 0.dp,
            windowInsets = androidx.compose.foundation.layout.WindowInsets(0)
        ) {
            bottomNavItems.forEach { screen ->
                val isSelected = currentRoute == screen.route
                NavigationBarItem(
                    icon = { Icon(screen.icon, contentDescription = screen.label) },
                    label = {
                        Text(
                            screen.label,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = if (isSelected) FontWeight.Black else FontWeight.Normal
                        )
                    },
                    selected = isSelected,
                    onClick = {
                        if (!isSelected) {
                            haptic.lightTap()
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.background,
                        selectedTextColor = AcidYellow,
                        indicatorColor = AcidYellow,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted
                    )
                )
            }
        }
    }
}
