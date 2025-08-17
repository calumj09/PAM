package com.pam.mobile.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pam.mobile.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    fun signIn(email: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                authRepository.signIn(email, password)
                onSuccess()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun signUp(email: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                authRepository.signUp(email, password)
                onSuccess()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}