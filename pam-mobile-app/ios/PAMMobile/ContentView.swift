//
//  ContentView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//  Updated with PAM Design System on 2025-08-15.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    
    var body: some View {
        if authManager.isAuthenticated {
            MainTabView()
        } else {
            AuthenticationView()
        }
    }
}

struct MainTabView: View {
    @State private var selectedTab = 0
    
    init() {
        // Customize tab bar appearance
        UITabBar.appearance().backgroundColor = UIColor.white
        UITabBar.appearance().unselectedItemTintColor = UIColor(PAMColors.gray)
    }
    
    var body: some View {
        TabView(selection: $selectedTab) {
            TodayView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            EnhancedChecklistView()
                .tabItem {
                    Label("Checklist", systemImage: "checkmark.circle.fill")
                }
                .tag(1)
            
            BabyTrackerView()
                .tabItem {
                    Label("Tracker", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(2)
            
            CalendarView()
                .tabItem {
                    Label("Calendar", systemImage: "calendar")
                }
                .tag(3)
            
            LocalInfoView()
                .tabItem {
                    Label("Local Info", systemImage: "mappin.circle.fill")
                }
                .tag(4)
        }
        .accentColor(PAMColors.brandRed)
    }
}

// MARK: - Today View with PAM Design
struct TodayView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var showProfile = false
    @State private var showSettings = false
    
    var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12:
            return "Good morning"
        case 12..<17:
            return "Good afternoon"
        default:
            return "Good evening"
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // PAM Brand Background
                PAMColors.brandRed
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    PAMHeader(title: "Today", showProfile: true, showSettings: true, onSettingsTap: {
                        showSettings = true
                    })
                    
                    ScrollView {
                        VStack(spacing: PAMSpacing.lg) {
                            // Welcome Card
                            PAMCard {
                                VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                    Text(greeting)
                                        .font(PAMFonts.displayPrimary(size: 34, weight: .bold))
                                        .foregroundColor(PAMColors.brandRed)
                                    
                                    if let firstChild = dataStore.children.first {
                                        Text("How's \(firstChild.name) doing today?")
                                            .font(PAMFonts.bodyPrimary(size: 16, weight: .regular))
                                            .foregroundColor(PAMColors.textBody)
                                    }
                                    
                                    // Motivational message
                                    Text("You're doing an amazing job!")
                                        .font(PAMFonts.bodyPrimary(size: 14, weight: .medium))
                                        .foregroundColor(PAMColors.accessibleTextSecondary)
                                        .padding(.top, PAMSpacing.xs)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            
                            UpcomingTasksCard()
                            QuickActionsCard()
                            DailyTrackerCard()
                            
                            // Add some bottom padding
                            Color.clear.frame(height: PAMSpacing.xxl)
                        }
                        .padding(.horizontal, PAMSpacing.lg)
                        .padding(.top, PAMSpacing.lg)
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
        }
    }
}

// MARK: - PAM Header Component
struct PAMHeader: View {
    let title: String
    let showProfile: Bool
    let showSettings: Bool
    var onSettingsTap: (() -> Void)?
    
    var body: some View {
        VStack(spacing: 0) {
            // Status Bar Simulation
            HStack {
                Text("9:41")
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.white)
                
                Spacer()
                
                HStack(spacing: PAMSpacing.xs) {
                    Image(systemName: "wifi")
                    Image(systemName: "battery.100")
                }
                .font(.caption)
                .foregroundColor(PAMColors.white)
            }
            .padding(.horizontal, PAMSpacing.lg)
            .padding(.vertical, PAMSpacing.sm)
            
            // Navigation Bar
            HStack {
                if showProfile {
                    Button(action: {}) {
                        ZStack {
                            Circle()
                                .fill(PAMColors.white)
                                .frame(width: 32, height: 32)
                            Text("P")
                                .font(PAMFonts.caption)
                                .fontWeight(.bold)
                                .foregroundColor(PAMColors.brandRed)
                        }
                    }
                } else {
                    Color.clear.frame(width: 32, height: 32)
                }
                
                Spacer()
                
                Text(title)
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.white)
                
                Spacer()
                
                if showSettings {
                    Button(action: { onSettingsTap?() }) {
                        ZStack {
                            RoundedRectangle(cornerRadius: PAMRadius.sm)
                                .fill(PAMColors.white)
                                .frame(width: 32, height: 32)
                            Image(systemName: "gearshape.fill")
                                .font(.caption)
                                .foregroundColor(PAMColors.brandRed)
                        }
                    }
                } else {
                    Color.clear.frame(width: 32, height: 32)
                }
            }
            .padding(.horizontal, PAMSpacing.lg)
            .padding(.vertical, PAMSpacing.md)
        }
        .background(PAMColors.brandRed)
    }
}

// MARK: - PAM Card Component
struct PAMCard<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(PAMSpacing.lg)
            .background(PAMColors.brandCream)
            .cornerRadius(PAMRadius.lg)
            .shadow(
                color: PAMShadows.cardShadow.color,
                radius: PAMShadows.cardShadow.radius,
                x: PAMShadows.cardShadow.x,
                y: PAMShadows.cardShadow.y
            )
    }
}

// MARK: - Quick Actions Card
struct QuickActionsCard: View {
    @State private var selectedAction: String? = nil
    
    var body: some View {
        PAMCard {
            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                Text("Quick Actions")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.brandRed)
                
                HStack(spacing: 0) {
                    TodayQuickActionButton(
                        icon: "drop.fill",
                        label: "Feed",
                        isSelected: selectedAction == "Feed",
                        action: { selectedAction = "Feed" }
                    )
                    .frame(maxWidth: .infinity)
                    
                    TodayQuickActionButton(
                        icon: "moon.fill",
                        label: "Sleep",
                        isSelected: selectedAction == "Sleep",
                        action: { selectedAction = "Sleep" }
                    )
                    .frame(maxWidth: .infinity)
                    
                    TodayQuickActionButton(
                        icon: "figure.child",
                        label: "Nappy",
                        isSelected: selectedAction == "Nappy",
                        action: { selectedAction = "Nappy" }
                    )
                    .frame(maxWidth: .infinity)
                    
                    TodayQuickActionButton(
                        icon: "heart.fill",
                        label: "Health",
                        isSelected: selectedAction == "Health",
                        action: { selectedAction = "Health" }
                    )
                    .frame(maxWidth: .infinity)
                    
                    TodayQuickActionButton(
                        icon: "figure.and.child.holdinghands",
                        label: "Activity",
                        isSelected: selectedAction == "Activity",
                        action: { selectedAction = "Activity" }
                    )
                    .frame(maxWidth: .infinity)
                }
            }
        }
    }
}

struct TodayQuickActionButton: View {
    let icon: String
    let label: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: PAMSpacing.sm) {
                ZStack {
                    RoundedRectangle(cornerRadius: PAMRadius.lg)
                        .fill(isSelected ? PAMColors.brandPink : PAMColors.brandPink.opacity(0.1))
                        .frame(width: max(50, 44), height: max(50, 44))
                    
                    Image(systemName: icon)
                        .font(.system(size: 22))
                        .foregroundColor(isSelected ? PAMColors.white : PAMColors.brandRed)
                }
                
                Text(label)
                    .font(PAMFonts.caption2)
                    .foregroundColor(PAMColors.textBody)
            }
        }
        .buttonStyle(PlainButtonStyle())
        .accessibilityLabel("Quick track \(label)")
        .accessibilityHint("Tap to quickly track \(label.lowercased()) for your baby")
        .accessibilityAddTraits(.isButton)
    }
}

// MARK: - Upcoming Tasks Card
struct UpcomingTasksCard: View {
    var body: some View {
        PAMCard {
            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                HStack {
                    Text("Upcoming Tasks")
                        .font(PAMFonts.headline)
                        .foregroundColor(PAMColors.brandRed)
                    
                    Spacer()
                    
                    Text("3 due soon")
                        .font(PAMFonts.caption)
                        .foregroundColor(PAMColors.subtleText)
                        .padding(.horizontal, PAMSpacing.md)
                        .padding(.vertical, PAMSpacing.xs)
                        .background(PAMColors.brandPink.opacity(0.1))
                        .cornerRadius(PAMRadius.xxl)
                }
                
                VStack(spacing: PAMSpacing.sm) {
                    TaskRow(
                        title: "2-month immunisations",
                        dueDate: "Tomorrow",
                        icon: "syringe.fill",
                        priority: .high
                    )
                    TaskRow(
                        title: "Pediatrician checkup",
                        dueDate: "Next week",
                        icon: "stethoscope",
                        priority: .medium
                    )
                    TaskRow(
                        title: "Baby passport application",
                        dueDate: "2 weeks",
                        icon: "doc.text.fill",
                        priority: .low
                    )
                }
            }
        }
    }
}

struct TaskRow: View {
    enum Priority {
        case high, medium, low
        
        var color: Color {
            switch self {
            case .high: return PAMColors.brandRed
            case .medium: return PAMColors.brandPink
            case .low: return PAMColors.gray
            }
        }
    }
    
    let title: String
    let dueDate: String
    let icon: String
    let priority: Priority
    
    var body: some View {
        HStack {
            // Priority indicator
            Rectangle()
                .fill(priority.color)
                .frame(width: 4)
                .cornerRadius(2)
            
            Image(systemName: icon)
                .foregroundColor(PAMColors.brandPink)
                .frame(width: 32)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(PAMFonts.subheadline)
                    .foregroundColor(PAMColors.textBody)
                Text(dueDate)
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.gray)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(PAMColors.gray)
                .font(.caption)
        }
        .padding(.vertical, PAMSpacing.sm)
        .padding(.horizontal, PAMSpacing.md)
        .background(PAMColors.white)
        .cornerRadius(PAMRadius.md)
    }
}

// MARK: - Daily Tracker Card
struct DailyTrackerCard: View {
    var body: some View {
        PAMCard {
            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                HStack {
                    Text("Today's Summary")
                        .font(PAMFonts.headline)
                        .foregroundColor(PAMColors.brandRed)
                    
                    Spacer()
                    
                    Text("Great progress!")
                        .font(PAMFonts.caption)
                        .foregroundColor(PAMColors.brandPink)
                }
                
                HStack(spacing: PAMSpacing.lg) {
                    TrackerStat(value: "3", label: "Feeds", icon: "drop.fill", color: PAMColors.brandPink)
                    TrackerStat(value: "5h", label: "Sleep", icon: "moon.fill", color: PAMColors.brandRed)
                    TrackerStat(value: "4", label: "Nappies", icon: "figure.child", color: PAMColors.brandPink)
                }
            }
        }
    }
}

struct TrackerStat: View {
    let value: String
    let label: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: PAMSpacing.xs) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.1))
                    .frame(width: 44, height: 44)
                
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
            }
            
            Text(value)
                .font(PAMFonts.title2)
                .fontWeight(.semibold)
                .foregroundColor(PAMColors.brandRed)
            
            Text(label)
                .font(PAMFonts.caption)
                .foregroundColor(PAMColors.gray)
        }
        .frame(maxWidth: .infinity)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AuthenticationManager())
            .environmentObject(DataStore())
    }
}