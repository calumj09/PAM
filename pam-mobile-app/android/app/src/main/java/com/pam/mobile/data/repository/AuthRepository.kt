package com.pam.mobile.data.repository

import com.pam.mobile.data.api.AuthApi
import com.pam.mobile.data.local.UserPreferences
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val userPreferences: UserPreferences
) {
    val authToken: Flow<String?> = userPreferences.authToken
    
    suspend fun signIn(email: String, password: String) {
        // For demo purposes, we'll simulate a successful login
        if (email == "demo@example.com" && password == "password") {
            userPreferences.saveAuthToken("demo_token_123")
        } else {
            // In production, this would call the API
            val response = authApi.signIn(email, password)
            userPreferences.saveAuthToken(response.token)
        }
    }
    
    suspend fun signUp(email: String, password: String) {
        // In production, this would call the API
        val response = authApi.signUp(email, password)
        userPreferences.saveAuthToken(response.token)
    }
    
    suspend fun signOut() {
        userPreferences.clearAuthToken()
    }
}