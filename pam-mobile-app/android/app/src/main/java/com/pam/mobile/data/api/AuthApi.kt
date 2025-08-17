package com.pam.mobile.data.api

import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("auth/signin")
    suspend fun signIn(
        @Body email: String,
        @Body password: String
    ): AuthResponse
    
    @POST("auth/signup")
    suspend fun signUp(
        @Body email: String,
        @Body password: String
    ): AuthResponse
}

data class AuthResponse(
    val token: String,
    val user: User
)

data class User(
    val id: String,
    val email: String
)