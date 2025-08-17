//
//  AuthenticationView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//  Updated with PAM Design System on 2025-08-15.
//

import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var isSignUp = false
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Gradient Background
                LinearGradient(
                    colors: [PAMColors.brandRed, PAMColors.brandDarkRed],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAMSpacing.xxl) {
                        // Logo Section
                        VStack(spacing: PAMSpacing.md) {
                            ZStack {
                                Circle()
                                    .fill(PAMColors.white)
                                    .frame(width: 100, height: 100)
                                    .shadow(
                                        color: PAMColors.brandRed.opacity(0.3),
                                        radius: 15,
                                        x: 0,
                                        y: 5
                                    )
                                
                                Image(systemName: "heart.fill")
                                    .font(.system(size: 50))
                                    .foregroundColor(PAMColors.brandRed)
                            }
                            
                            Text("PAM")
                                .font(PAMFonts.displayPrimary(size: 42, weight: .bold))
                                .foregroundColor(PAMColors.white)
                            
                            Text("Parent Admin Manager")
                                .font(PAMFonts.bodyPrimary(size: 16, weight: .medium))
                                .foregroundColor(PAMColors.brandPink)
                            
                            Text("Your parenting companion 💕")
                                .font(PAMFonts.caption)
                                .foregroundColor(PAMColors.white.opacity(0.8))
                        }
                        .padding(.top, 60)
                        
                        // Form Card
                        VStack(spacing: PAMSpacing.lg) {
                            Text(isSignUp ? "Create Account" : "Welcome Back")
                                .font(PAMFonts.title2)
                                .foregroundColor(PAMColors.brandRed)
                            
                            VStack(spacing: PAMSpacing.md) {
                                // Email Field
                                PAMTextField(
                                    placeholder: "Email",
                                    text: $email,
                                    icon: "envelope.fill",
                                    keyboardType: .emailAddress
                                )
                                
                                // Password Field
                                PAMSecureField(
                                    placeholder: "Password",
                                    text: $password,
                                    icon: "lock.fill"
                                )
                                
                                // Confirm Password (Sign Up only)
                                if isSignUp {
                                    PAMSecureField(
                                        placeholder: "Confirm Password",
                                        text: $confirmPassword,
                                        icon: "lock.fill"
                                    )
                                }
                            }
                            
                            // Main Action Button
                            Button(action: handleAuth) {
                                HStack {
                                    if isLoading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: PAMColors.white))
                                            .scaleEffect(0.8)
                                    } else {
                                        Text(isSignUp ? "Sign Up" : "Sign In")
                                            .font(PAMFonts.bodyPrimary(size: 16, weight: .semibold))
                                    }
                                }
                                .foregroundColor(PAMColors.white)
                                .frame(maxWidth: .infinity)
                                .padding(PAMSpacing.lg)
                                .background(PAMColors.brandRed)
                                .cornerRadius(PAMRadius.lg)
                                .shadow(
                                    color: PAMColors.brandRed.opacity(0.3),
                                    radius: 8,
                                    x: 0,
                                    y: 4
                                )
                            }
                            .disabled(isLoading)
                            
                            // Divider
                            HStack {
                                Rectangle()
                                    .fill(PAMColors.gray.opacity(0.3))
                                    .frame(height: 1)
                                Text("or")
                                    .font(PAMFonts.caption)
                                    .foregroundColor(PAMColors.gray)
                                Rectangle()
                                    .fill(PAMColors.gray.opacity(0.3))
                                    .frame(height: 1)
                            }
                            
                            // Secondary Actions
                            VStack(spacing: PAMSpacing.md) {
                                // Toggle Sign In/Up
                                Button(action: { 
                                    withAnimation(.easeInOut) {
                                        isSignUp.toggle()
                                        confirmPassword = ""
                                    }
                                }) {
                                    Text(isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                                        .font(PAMFonts.subheadline)
                                        .foregroundColor(PAMColors.brandRed)
                                }
                                
                                // Demo Mode
                                Button(action: handleDemoMode) {
                                    HStack {
                                        Image(systemName: "play.circle.fill")
                                        Text("Try Demo Mode")
                                    }
                                    .font(PAMFonts.subheadline)
                                    .foregroundColor(PAMColors.brandPink)
                                    .padding(.horizontal, PAMSpacing.lg)
                                    .padding(.vertical, PAMSpacing.sm)
                                    .background(PAMColors.brandPink.opacity(0.1))
                                    .cornerRadius(PAMRadius.md)
                                }
                            }
                        }
                        .padding(PAMSpacing.xxl)
                        .background(PAMColors.brandCream)
                        .cornerRadius(PAMRadius.xl)
                        .shadow(
                            color: Color.black.opacity(0.1),
                            radius: 20,
                            x: 0,
                            y: 10
                        )
                        .padding(.horizontal, PAMSpacing.lg)
                        
                        // Bottom Spacing
                        Color.clear.frame(height: 40)
                    }
                }
            }
            .navigationBarHidden(true)
            .alert("Notice", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private func handleAuth() {
        // Validation
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Please fill in all fields"
            showError = true
            return
        }
        
        if isSignUp && password != confirmPassword {
            errorMessage = "Passwords don't match"
            showError = true
            return
        }
        
        isLoading = true
        
        Task {
            do {
                if isSignUp {
                    try await authManager.signUp(email: email, password: password)
                } else {
                    try await authManager.signIn(email: email, password: password)
                }
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
            isLoading = false
        }
    }
    
    private func handleDemoMode() {
        isLoading = true
        Task {
            do {
                try await authManager.signIn(email: "demo@example.com", password: "password")
            } catch {
                errorMessage = "Demo mode unavailable. Please try again."
                showError = true
            }
            isLoading = false
        }
    }
}

// MARK: - PAM Text Field Component
struct PAMTextField: View {
    let placeholder: String
    @Binding var text: String
    let icon: String
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        HStack(spacing: PAMSpacing.md) {
            Image(systemName: icon)
                .foregroundColor(PAMColors.brandRed)
                .frame(width: 20)
            
            TextField(placeholder, text: $text)
                .font(PAMFonts.bodyPrimary(size: 16, weight: .regular))
                .foregroundColor(PAMColors.textBody)
                .autocapitalization(.none)
                .keyboardType(keyboardType)
        }
        .padding(PAMSpacing.lg)
        .background(PAMColors.white)
        .cornerRadius(PAMRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: PAMRadius.md)
                .stroke(PAMColors.brandPink.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - PAM Secure Field Component
struct PAMSecureField: View {
    let placeholder: String
    @Binding var text: String
    let icon: String
    @State private var isSecure = true
    
    var body: some View {
        HStack(spacing: PAMSpacing.md) {
            Image(systemName: icon)
                .foregroundColor(PAMColors.brandRed)
                .frame(width: 20)
            
            if isSecure {
                SecureField(placeholder, text: $text)
                    .font(PAMFonts.bodyPrimary(size: 16, weight: .regular))
                    .foregroundColor(PAMColors.textBody)
            } else {
                TextField(placeholder, text: $text)
                    .font(PAMFonts.bodyPrimary(size: 16, weight: .regular))
                    .foregroundColor(PAMColors.textBody)
                    .autocapitalization(.none)
            }
            
            Button(action: { isSecure.toggle() }) {
                Image(systemName: isSecure ? "eye.slash.fill" : "eye.fill")
                    .foregroundColor(PAMColors.gray)
                    .font(.caption)
            }
        }
        .padding(PAMSpacing.lg)
        .background(PAMColors.white)
        .cornerRadius(PAMRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: PAMRadius.md)
                .stroke(PAMColors.brandPink.opacity(0.2), lineWidth: 1)
        )
    }
}

struct AuthenticationView_Previews: PreviewProvider {
    static var previews: some View {
        AuthenticationView()
            .environmentObject(AuthenticationManager())
    }
}