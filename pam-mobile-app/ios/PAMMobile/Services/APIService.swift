//
//  APIService.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//

import Foundation

class APIService {
    private let baseURL = "https://api.pam-app.com/v1"
    private let session = URLSession.shared
    
    private var authToken: String? {
        UserDefaults.standard.string(forKey: "authToken")
    }
    
    func signIn(credentials: SignInRequest) async throws -> AuthResponse {
        let url = URL(string: "\(baseURL)/auth/signin")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(credentials)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        return try JSONDecoder().decode(AuthResponse.self, from: data)
    }
    
    func signUp(credentials: SignUpRequest) async throws -> AuthResponse {
        let url = URL(string: "\(baseURL)/auth/signup")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(credentials)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw APIError.invalidResponse
        }
        
        return try JSONDecoder().decode(AuthResponse.self, from: data)
    }
    
    func validateToken(_ token: String) async throws -> User {
        let url = URL(string: "\(baseURL)/auth/validate")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidToken
        }
        
        return try JSONDecoder().decode(User.self, from: data)
    }
}

enum APIError: Error {
    case invalidResponse
    case invalidToken
    case networkError
    case decodingError
    
    var localizedDescription: String {
        switch self {
        case .invalidResponse:
            return "Invalid response from server"
        case .invalidToken:
            return "Invalid authentication token"
        case .networkError:
            return "Network connection error"
        case .decodingError:
            return "Failed to decode response"
        }
    }
}