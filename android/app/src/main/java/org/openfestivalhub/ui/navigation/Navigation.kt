package org.openfestivalhub.ui.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Event
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import org.openfestivalhub.ui.theme.CardBackground
import org.openfestivalhub.ui.theme.TextMuted
import org.openfestivalhub.ui.home.HomeScreen
import org.openfestivalhub.ui.discover.DiscoverScreen
import org.openfestivalhub.ui.discover.DiscoverViewModel
import org.openfestivalhub.ui.discover.ArtistViewModel
import org.openfestivalhub.ui.discover.SpeedDiscoveryScreen
import org.openfestivalhub.ui.map.MapScreen
import org.openfestivalhub.ui.tools.ToolsScreen
import org.openfestivalhub.ui.tools.SurvivalGuideScreen
import org.openfestivalhub.ui.splash.SplashScreen
import org.openfestivalhub.ui.splash.FestivalSelectionScreen
import org.openfestivalhub.ui.artist.ArtistDetailScreen
import org.openfestivalhub.ui.schedule.ScheduleScreen
import org.openfestivalhub.ui.utils.rememberHapticManager
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.core.tween
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalConfiguration
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import org.openfestivalhub.data.repository.LineupRepository
import org.openfestivalhub.data.config.FestivalConfig
import org.openfestivalhub.ui.quiz.VibeQuizScreen
import org.openfestivalhub.ui.quiz.VibeQuizViewModel
import org.openfestivalhub.ui.quiz.VibeResultScreen
import org.openfestivalhub.ui.food.FoodScreen
import org.openfestivalhub.ui.packing.PackingListScreen
import org.openfestivalhub.ui.tools.FriendFinderScreen
import org.openfestivalhub.ui.tools.NotesJournalScreen
import org.openfestivalhub.ui.tools.BudgetTrackerScreen
import org.openfestivalhub.ui.discover.GenreBreakdownScreen
import org.openfestivalhub.ui.discover.VibeRadarScreen

sealed class Screen(val route: String, val label: String, val icon: ImageVector, val featureCheck: ((org.openfestivalhub.data.config.FestivalFeatures) -> Boolean)? = null) {
    object Home : Screen("home", "HOME", Icons.Filled.Home)
    object Discover : Screen("discover", "BROWSE", Icons.Filled.Search, { it.vibeQuiz || it.aiRecommendations })
    object Schedule : Screen("schedule", "TIMETABLE", Icons.Filled.Event, { it.timetable })
    object Map : Screen("map", "MAP", Icons.Filled.LocationOn, { it.weatherRadar })
    object Tools : Screen("tools", "TOOLS", Icons.Filled.Build)
}

val allBottomNavItems = listOf(
    Screen.Home,
    Screen.Map,
    Screen.Discover,
    Screen.Schedule,
    Screen.Tools
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val quizViewModel: VibeQuizViewModel = viewModel(
        factory = VibeQuizViewModel.Factory(LineupRepository(context))
    )
    val showBottomNavBar = remember { mutableStateOf(true) }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute != "splash"
        && currentRoute != "festival_select"
        && currentRoute != "festival_switch"
        && currentRoute?.startsWith("artist/") != true
        && currentRoute != "guide"
        && currentRoute != "vibe_quiz"
        && currentRoute != "vibe_results"
        && currentRoute != "highlights"
        && currentRoute != "food"
        && currentRoute != "packing_list"
        && currentRoute != "notes_journal"
        && currentRoute != "budget_tracker"
        && currentRoute != "speed_discovery"
        && currentRoute != "genre_breakdown"
        && currentRoute != "vibe_radar"
        && currentRoute != "squad_link"

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
        },
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = innerPadding.calculateBottomPadding())
        ) {
            org.openfestivalhub.ui.components.OfflineBanner()
            NavHost(
                navController = navController,
                startDestination = "splash",
                modifier = Modifier.weight(1f),
                enterTransition = { fadeIn(animationSpec = tween(300)) },
                exitTransition = { fadeOut(animationSpec = tween(200)) }
            ) {
                composable("splash") {
                    SplashScreen(navController)
                }
                composable("festival_select") {
                    FestivalSelectionScreen(navController, isSwitch = false)
                }
                composable("festival_switch") {
                    FestivalSelectionScreen(navController, isSwitch = true)
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
                composable(Screen.Tools.route) {
                    ToolsScreen(navController = navController)
                }
                composable("guide") {
                    SurvivalGuideScreen(navController)
                }
                composable(Screen.Schedule.route) {
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
                            navController.previousBackStackEntry?.savedStateHandle?.set("filter_genre", genre)
                            navController.popBackStack(Screen.Discover.route, false)
                        },
                        onVibeClick = { vibe ->
                            navController.previousBackStackEntry?.savedStateHandle?.set("filter_vibe", vibe)
                            navController.popBackStack(Screen.Discover.route, false)
                        }
                    )
                }
                composable("speed_discovery") {
                    val discoverViewModel: DiscoverViewModel = viewModel(
                        factory = object : ViewModelProvider.Factory {
                            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                                return DiscoverViewModel(LineupRepository(context), context) as T
                            }
                        }
                    )
                    val artistViewModel: ArtistViewModel = viewModel(
                        factory = object : ViewModelProvider.Factory {
                            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                                val db = org.openfestivalhub.data.local.AppDatabase.getDatabase(context)
                                return ArtistViewModel(db.userDao()) as T
                            }
                        }
                    )
                    val artists by discoverViewModel.allArtists.collectAsStateWithLifecycle()
                    val favorites by artistViewModel.favoriteArtistIds.collectAsStateWithLifecycle()
                    
                    SpeedDiscoveryScreen(
                        artists = artists,
                        favoriteIds = favorites,
                        onToggleFavorite = { artistViewModel.toggleFavorite(it) },
                        onArtistClick = { id -> navController.navigate("artist/$id") },
                        onBack = { navController.popBackStack() }
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
                composable("packing_list") {
                    PackingListScreen(navController)
                }
                composable("notes_journal") {
                    NotesJournalScreen(navController)
                }
                composable("budget_tracker") {
                    BudgetTrackerScreen(navController)
                }
                composable("genre_breakdown") {
                    GenreBreakdownScreen(navController)
                }
                composable("vibe_radar") {
                    VibeRadarScreen(navController)
                }
                composable("squad_link") {
                    FriendFinderScreen(navController)
                }
            }
        }
    }
}

@Composable
fun FluidBottomNavigation(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val haptic = rememberHapticManager()
    val accentColor = MaterialTheme.colorScheme.secondary
    val config = FestivalConfig.current
    val features = config.features

    val activeNavItems = remember(features) {
        allBottomNavItems.filter { it.featureCheck?.invoke(features) ?: true }
    }

    NavigationBar(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        containerColor = CardBackground,
        contentColor = accentColor,
        tonalElevation = 3.dp,
        windowInsets = androidx.compose.foundation.layout.WindowInsets(0)
    ) {
        activeNavItems.forEach { screen ->
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
                    selectedIconColor = accentColor,
                    selectedTextColor = accentColor,
                    indicatorColor = accentColor.copy(alpha = 0.12f),
                    unselectedIconColor = TextMuted,
                    unselectedTextColor = TextMuted
                )
            )
        }
    }
}
