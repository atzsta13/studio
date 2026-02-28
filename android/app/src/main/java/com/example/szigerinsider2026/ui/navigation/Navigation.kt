package com.example.szigerinsider2026.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.szigerinsider2026.ui.theme.AcidYellow
import com.example.szigerinsider2026.ui.theme.CardBackground
import com.example.szigerinsider2026.ui.theme.MutedBackground
import com.example.szigerinsider2026.ui.theme.TextMuted

sealed class Screen(val route: String, val label: String, val icon: ImageVector) {
    object Home : Screen("home", "HOME", Icons.Filled.Home)
    object Discover : Screen("discover", "ARTISTS", Icons.Filled.Search)
    object Map : Screen("map", "MAP", Icons.Filled.LocationOn)
    object Guide : Screen("guide", "GUIDE", Icons.Filled.DateRange)
    object Tools : Screen("tools", "TOOLS", Icons.Filled.Build)
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Discover,
    Screen.Map,
    Screen.Guide,
    Screen.Tools
)

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            FluidBottomNavigation(navController = navController)
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                // Placeholder for Home View
                Text("HOME VIEW", color = MaterialTheme.colorScheme.onBackground)
            }
            composable(Screen.Discover.route) {
                // Placeholder for Discover View
                Text("DISCOVER VIEW", color = MaterialTheme.colorScheme.onBackground)
            }
            composable(Screen.Map.route) {
                // Placeholder for Map View
                Text("MAP VIEW", color = MaterialTheme.colorScheme.onBackground)
            }
            composable(Screen.Guide.route) {
                // Placeholder for Guide View
                Text("GUIDE VIEW", color = MaterialTheme.colorScheme.onBackground)
            }
            composable(Screen.Tools.route) {
                // Placeholder for Tools View
                Text("TOOLS VIEW", color = MaterialTheme.colorScheme.onBackground)
            }
        }
    }
}

@Composable
fun FluidBottomNavigation(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar(
        containerColor = CardBackground,
        contentColor = AcidYellow
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
