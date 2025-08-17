package com.pam.mobile.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// PAM Brand Colors
val PAMRed = Color(0xFF7D0820)
val PAMPink = Color(0xFFF9B1BC)
val PAMCream = Color(0xFFFFFBF8)

private val LightColorScheme = lightColorScheme(
    primary = PAMRed,
    onPrimary = PAMCream,
    primaryContainer = PAMPink,
    onPrimaryContainer = PAMRed,
    secondary = PAMPink,
    onSecondary = PAMRed,
    background = PAMCream,
    surface = Color.White,
    onBackground = Color(0xFF1C1B1F),
    onSurface = Color(0xFF1C1B1F),
)

private val DarkColorScheme = darkColorScheme(
    primary = PAMPink,
    onPrimary = PAMRed,
    primaryContainer = PAMRed,
    onPrimaryContainer = PAMCream,
    secondary = PAMCream,
    onSecondary = PAMRed,
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E),
    onBackground = PAMCream,
    onSurface = PAMCream,
)

@Composable
fun PAMMobileTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}