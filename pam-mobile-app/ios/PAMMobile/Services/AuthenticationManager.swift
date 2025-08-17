//
//  AuthenticationManager.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//

import Foundation
import Combine

class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private var cancellables = Set<AnyCancellable>()
    private let apiService = APIService()
    
    init() {
        checkAuthenticationStatus()
    }
    
    func checkAuthenticationStatus() {
        // Check for stored auth token
        if let token = UserDefaults.standard.string(forKey: "authToken") {
            // Validate token with backend
            validateToken(token)
        }
    }
    
    func signIn(email: String, password: String) async throws {
        // Demo mode check
        if email == "demo@example.com" && password == "password" {
            await MainActor.run {
                self.isAuthenticated = true
                self.currentUser = User(id: "demo-user", email: "demo@example.com", createdAt: Date())
                UserDefaults.standard.set("demo-token", forKey: "authToken")
            }
            return
        }
        
        // Production API call
        let credentials = SignInRequest(email: email, password: password)
        let response = try await apiService.signIn(credentials: credentials)
        
        await MainActor.run {
            self.isAuthenticated = true
            self.currentUser = response.user
            UserDefaults.standard.set(response.token, forKey: "authToken")
        }
    }
    
    func signUp(email: String, password: String) async throws {
        let credentials = SignUpRequest(email: email, password: password)
        let response = try await apiService.signUp(credentials: credentials)
        
        await MainActor.run {
            self.isAuthenticated = true
            self.currentUser = response.user
            UserDefaults.standard.set(response.token, forKey: "authToken")
        }
    }
    
    func signOut() {
        isAuthenticated = false
        currentUser = nil
        UserDefaults.standard.removeObject(forKey: "authToken")
    }
    
    private func validateToken(_ token: String) {
        Task {
            // Check for demo token
            if token == "demo-token" {
                await MainActor.run {
                    self.isAuthenticated = true
                    self.currentUser = User(id: "demo-user", email: "demo@example.com", createdAt: Date())
                }
                return
            }
            
            // Production token validation
            do {
                let user = try await apiService.validateToken(token)
                await MainActor.run {
                    self.isAuthenticated = true
                    self.currentUser = user
                }
            } catch {
                await MainActor.run {
                    self.signOut()
                }
            }
        }
    }
}

// Models
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let createdAt: Date
}

struct SignInRequest: Codable {
    let email: String
    let password: String
}

struct SignUpRequest: Codable {
    let email: String
    let password: String
}

struct AuthResponse: Codable {
    let user: User
    let token: String
}