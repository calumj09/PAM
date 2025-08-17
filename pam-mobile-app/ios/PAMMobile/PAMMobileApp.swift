//
//  PAMMobileApp.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//

import SwiftUI

@main
struct PAMMobileApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var dataStore = DataStore()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(dataStore)
                .onAppear {
                    setupAppearance()
                }
        }
    }
    
    private func setupAppearance() {
        // PAM Brand Colors
        UINavigationBar.appearance().tintColor = UIColor(red: 125/255, green: 8/255, blue: 32/255, alpha: 1.0)
        UITabBar.appearance().tintColor = UIColor(red: 125/255, green: 8/255, blue: 32/255, alpha: 1.0)
    }
}