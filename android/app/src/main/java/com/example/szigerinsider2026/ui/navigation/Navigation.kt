package com.example.szigerinsider2026.ui.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Event
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import com.example.szigerinsider2026.ui.discover.DiscoverViewModel
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
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.core.tween
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalConfiguration
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.ui.quiz.VibeQuizScreen
import com.example.szigerinsider2026.ui.quiz.VibeQuizViewModel
import com.example.szigerinsider2026.ui.quiz.VibeResultScreen
import com.example.szigerinsider2026.ui.food.FoodScreen
import com.example.szigerinsider2026.ui.highlights.HighlightsScreen
import com.example.szigerinsider2026.ui.packing.PackingListScreen

sealed class Screen(val route: String, val label: String, val icon: ImageVector) {
    object Home : Screen("home", "HOME", Icons.Filled.Home)
    object Discover : Screen("discover", "BROWSE", Icons.Filled.Search)
    object Schedule : Screen("schedule", "TIMETABLE", Icons.Filled.Event)
    object Map : Screen("map", "MAP", Icons.Filled.LocationOn)
    object Tools : Screen("tools", "TOOLS", Icons.Filled.Build)
    object Passport : Screen("passport", "PASSPORT", Icons.Filled.EmojiEvents) // Keep route for links, but remove from bar
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Map,
    Screen.Discover,
    Screen.Schedule,
    Screen.Tools
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavigation(
) {
    val navController = rememberNavController()
    val context = LocalContext.current
    val quizViewModel: VibeQuizViewModel = viewModel(
        factory = VibeQuizViewModel.Factory(LineupRepository(context))
    )
    val showBottomNavBar = remember { mutableStateOf(true) }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute != "splash"
        && currentRoute?.startsWith("artist/") != true
        && currentRoute != "guide"
        && currentRoute != "vibe_quiz"
        && currentRoute != "vibe_results"
        && currentRoute != "highlights"
        && currentRoute != "food"
        && currentRoute != "packing_list"

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                AnimatedVisibility(
                    visible = showBottomNavBar.value,
                    enter = slideInVertically(
                        initialOffsetY = { it },
                        animationSpec = tween(300)
                    ),
                    exit = slideOutVertically(
                        targetOffsetY = { it },
                        animationSpec = tween(300)
                    )
                ) {
                    FluidBottomNavigation(navController = navController)
                }
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
                val discoverViewModel: DiscoverViewModel = viewModel(
                    factory = object : ViewModelProvider.Factory {
                        override fun <T : ViewModel> create(modelClass: Class<T>): T {
                            return DiscoverViewModel(LineupRepository(context), context) as T
                        }
                    }
                )
                DiscoverScreen(
                    onArtistClick = { id -> navController.navigate("artist/$id") },
                    navController = navController,
                    onScrollStateChanged = { isScrolling -> showBottomNavBar.value = !isScrolling },
                    viewModel = discoverViewModel
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
                    onArtistNavigate = { id -> navController.navigate("artist/$id") },
                    onScrollStateChanged = { isScrolling -> showBottomNavBar.value = !isScrolling },
                    onGenreClick = { genre ->
                        // Better: Navigate with args, but for this refactor we can use a shared ViewModel if we were using Hilt.
                        // For now, let's at least stop using the static hack and use the NavController properly if possible.
                        navController.previousBackStackEntry?.savedStateHandle?.set("filter_genre", genre)
                        navController.popBackStack(Screen.Discover.route, false)
                    },
                    onVibeClick = { vibe ->
                        navController.previousBackStackEntry?.savedStateHandle?.set("filter_vibe", vibe)
                        navController.popBackStack(Screen.Discover.route, false)
                    }
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
            composable("packing_list") {
                PackingListScreen(navController)
            }
        }
    }
}

@Composable
fun FluidBottomNavigation(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val haptic = rememberHapticManager()

    NavigationBar(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        containerColor = CardBackground,
        contentColor = AcidYellow,
        tonalElevation = 3.dp,
        windowInsets = androidx.compose.foundation.layout.WindowInsets(0)
    ) {
        bottomNavItems.forEach { screen ->
            val isSelected = currentRoute == screen.route
            val fontScale = LocalConfiguration.current.fontScale
            val labelFontSize = if (fontScale > 1.2f) 8.sp else 10.sp

            NavigationBarItem(
                icon = { Icon(screen.icon, contentDescription = screen.label, modifier = Modifier.size(22.dp)) },
                label = {
                    Text(
                        screen.label,
                        style = MaterialTheme.typography.labelSmall,
                        fontSize = labelFontSize,
                        fontWeight = if (isSelected) FontWeight.Black else FontWeight.Normal,
                        maxLines = 1,
                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                        letterSpacing = if (fontScale > 1.2f) (-0.5).sp else 0.sp
                    )
                },
                selected = isSelected,
                alwaysShowLabel = true,
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
                    selectedIconColor = AcidYellow,
                    selectedTextColor = AcidYellow,
                    indicatorColor = AcidYellow.copy(alpha = 0.12f),
                    unselectedIconColor = TextMuted,
                    unselectedTextColor = TextMuted
                )
            )
        }
    }
}
