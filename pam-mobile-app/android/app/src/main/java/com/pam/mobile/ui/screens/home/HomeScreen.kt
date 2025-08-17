package com.pam.mobile.ui.screens.home

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.pam.mobile.ui.screens.home.tabs.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    val bottomNavController = rememberNavController()
    val navBackStackEntry by bottomNavController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                val items = listOf(
                    BottomNavItem.Today,
                    BottomNavItem.Timeline,
                    BottomNavItem.Calendar,
                    BottomNavItem.LocalInfo,
                    BottomNavItem.Tracker,
                    BottomNavItem.Growth,
                    BottomNavItem.Settings
                )
                
                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = currentDestination?.route == item.route,
                        onClick = {
                            bottomNavController.navigate(item.route) {
                                popUpTo(bottomNavController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = bottomNavController,
            startDestination = BottomNavItem.Today.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(BottomNavItem.Today.route) { TodayScreen() }
            composable(BottomNavItem.Timeline.route) { TimelineScreen() }
            composable(BottomNavItem.Calendar.route) { CalendarScreen() }
            composable(BottomNavItem.LocalInfo.route) { LocalInfoScreen() }
            composable(BottomNavItem.Tracker.route) { TrackerScreen() }
            composable(BottomNavItem.Growth.route) { GrowthScreen() }
            composable(BottomNavItem.Settings.route) { SettingsScreen() }
        }
    }
}

sealed class BottomNavItem(val route: String, val title: String, val icon: ImageVector) {
    object Today : BottomNavItem("today", "Today", Icons.Filled.Home)
    object Timeline : BottomNavItem("timeline", "Timeline", Icons.Filled.CheckCircle)
    object Calendar : BottomNavItem("calendar", "Calendar", Icons.Filled.DateRange)
    object LocalInfo : BottomNavItem("local_info", "Local", Icons.Filled.LocationOn)
    object Tracker : BottomNavItem("tracker", "Tracker", Icons.Filled.Face)
    object Growth : BottomNavItem("growth", "Growth", Icons.Filled.TrendingUp)
    object Settings : BottomNavItem("settings", "Settings", Icons.Filled.Settings)
}