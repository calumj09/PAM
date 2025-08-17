package com.pam.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.rememberNavController
import com.pam.mobile.ui.navigation.PAMNavHost
import com.pam.mobile.ui.theme.PAMMobileTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PAMMobileTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    PAMApp()
                }
            }
        }
    }
}

@Composable
fun PAMApp() {
    val navController = rememberNavController()
    PAMNavHost(navController = navController)
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    PAMMobileTheme {
        PAMApp()
    }
}