package com.pam.mobile.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.pam.mobile.ui.screens.auth.AuthScreen
import com.pam.mobile.ui.screens.home.HomeScreen

@Composable
fun PAMNavHost(
    navController: NavHostController,
    startDestination: String = NavigationRoute.Auth.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(NavigationRoute.Auth.route) {
            AuthScreen(
                onAuthSuccess = {
                    navController.navigate(NavigationRoute.Home.route) {
                        popUpTo(NavigationRoute.Auth.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(NavigationRoute.Home.route) {
            HomeScreen(navController = navController)
        }
    }
}

sealed class NavigationRoute(val route: String) {
    object Auth : NavigationRoute("auth")
    object Home : NavigationRoute("home")
    object Today : NavigationRoute("today")
    object Timeline : NavigationRoute("timeline")
    object Calendar : NavigationRoute("calendar")
    object LocalInfo : NavigationRoute("local_info")
    object Tracker : NavigationRoute("tracker")
    object Growth : NavigationRoute("growth")
    object Settings : NavigationRoute("settings")
}