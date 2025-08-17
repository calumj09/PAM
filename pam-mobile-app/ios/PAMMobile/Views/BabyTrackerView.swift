//
//  BabyTrackerView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-16.
//  Combined Tracker and Growth view for cleaner navigation
//

import SwiftUI

struct BabyTrackerView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var selectedTab = 0
    @State private var showingQuickEntry = false
    @State private var selectedTrackerType: TrackerType?
    @State private var showingAddMeasurement = false
    @State private var showingAddMilestone = false
    @State private var selectedDate = Date()
    
    var body: some View {
        NavigationView {
            ZStack {
                // PAM Brand Background
                PAMColors.brandRed
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    PAMHeader(title: "Baby Tracker", showProfile: true, showSettings: false)
                    
                    // Tab Selector
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: PAMSpacing.md) {
                            TabButton(title: "Daily Tracking", icon: "clock.fill", isSelected: selectedTab == 0) {
                                withAnimation { selectedTab = 0 }
                            }
                            TabButton(title: "Growth", icon: "chart.line.uptrend.xyaxis", isSelected: selectedTab == 1) {
                                withAnimation { selectedTab = 1 }
                            }
                            TabButton(title: "Milestones", icon: "star.fill", isSelected: selectedTab == 2) {
                                withAnimation { selectedTab = 2 }
                            }
                        }
                        .padding(.horizontal, PAMSpacing.lg)
                    }
                    .padding(.vertical, PAMSpacing.md)
                    .background(PAMColors.brandRed)
                    
                    // Content
                    ScrollView {
                        switch selectedTab {
                        case 0:
                            DailyTrackingSection(
                                selectedDate: $selectedDate,
                                showingQuickEntry: $showingQuickEntry,
                                selectedTrackerType: $selectedTrackerType
                            )
                        case 1:
                            GrowthTrackingSection(showingAddMeasurement: $showingAddMeasurement)
                        case 2:
                            MilestonesTrackingSection(showingAddMilestone: $showingAddMilestone)
                        default:
                            EmptyView()
                        }
                    }
                }
            }
            .navigationBarHidden(true)
            .overlay(
                // Floating Add Button
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Button(action: {
                            switch selectedTab {
                            case 0:
                                showingQuickEntry = true
                            case 1:
                                showingAddMeasurement = true
                            case 2:
                                showingAddMilestone = true
                            default:
                                break
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .fill(PAMColors.brandPink)
                                    .frame(width: 56, height: 56)
                                    .shadow(
                                        color: PAMColors.brandRed.opacity(0.3),
                                        radius: 8,
                                        x: 0,
                                        y: 4
                                    )
                                
                                Image(systemName: "plus")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                    .foregroundColor(PAMColors.white)
                            }
                        }
                        .padding(PAMSpacing.lg)
                    }
                }
            )
            .sheet(isPresented: $showingQuickEntry) {
                if let type = selectedTrackerType {
                    QuickEntryView(trackerType: type, selectedDate: selectedDate)
                }
            }
            .sheet(isPresented: $showingAddMeasurement) {
                AddMeasurementView()
            }
            .sheet(isPresented: $showingAddMilestone) {
                AddMilestoneView()
            }
        }
    }
}

// MARK: - Daily Tracking Section
struct DailyTrackingSection: View {
    @EnvironmentObject var dataStore: DataStore
    @Binding var selectedDate: Date
    @Binding var showingQuickEntry: Bool
    @Binding var selectedTrackerType: TrackerType?
    
    var todayEntries: [TrackerEntry] {
        dataStore.trackerEntries.filter { entry in
            Calendar.current.isDate(entry.timestamp, inSameDayAs: selectedDate)
        }.sorted { $0.timestamp > $1.timestamp }
    }
    
    var dailyStats: DailyStats {
        calculateDailyStats(for: selectedDate)
    }
    
    var body: some View {
        VStack(spacing: PAMSpacing.lg) {
            // Date Selector
            DateSelectorCard(selectedDate: $selectedDate)
            
            // Daily Summary
            DailySummaryCard(stats: dailyStats)
            
            // Quick Entry Buttons
            QuickEntrySection { type in
                selectedTrackerType = type
                showingQuickEntry = true
            }
            
            // Today's Activities
            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                Text("Today's Activities")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.white)
                    .padding(.horizontal, PAMSpacing.lg)
                
                if todayEntries.isEmpty {
                    EmptyActivitiesCard()
                } else {
                    ForEach(todayEntries) { entry in
                        ActivityCard(entry: entry)
                    }
                    .padding(.horizontal, PAMSpacing.lg)
                }
            }
            
            // Bottom padding
            Color.clear.frame(height: PAMSpacing.xxxl * 2)
        }
        .padding(.top, PAMSpacing.lg)
    }
    
    func calculateDailyStats(for date: Date) -> DailyStats {
        let dayEntries = dataStore.trackerEntries.filter { entry in
            Calendar.current.isDate(entry.timestamp, inSameDayAs: date)
        }
        
        let feeds = dayEntries.filter { $0.type == .feeding }.count
        let sleepMinutes = dayEntries.filter { $0.type == .sleep }.compactMap { $0.duration }.reduce(0, +) / 60
        let diapers = dayEntries.filter { $0.type == .diaper }.count
        
        let lastFeed = dayEntries.filter { $0.type == .feeding }.max { $0.timestamp < $1.timestamp }
        let lastSleep = dayEntries.filter { $0.type == .sleep }.max { $0.timestamp < $1.timestamp }
        let lastDiaper = dayEntries.filter { $0.type == .diaper }.max { $0.timestamp < $1.timestamp }
        
        return DailyStats(
            feeds: feeds,
            sleepHours: sleepMinutes / 60,
            sleepMinutes: Int(sleepMinutes) % 60,
            diapers: diapers,
            lastFeed: lastFeed?.timestamp,
            lastSleep: lastSleep?.timestamp,
            lastDiaper: lastDiaper?.timestamp
        )
    }
}

// MARK: - Growth Tracking Section
struct GrowthTrackingSection: View {
    @EnvironmentObject var dataStore: DataStore
    @Binding var showingAddMeasurement: Bool
    
    var weightEntries: [TrackerEntry] {
        dataStore.trackerEntries
            .filter { $0.type == .weight }
            .sorted { $0.timestamp < $1.timestamp }
    }
    
    var heightEntries: [TrackerEntry] {
        dataStore.trackerEntries
            .filter { $0.type == .height }
            .sorted { $0.timestamp < $1.timestamp }
    }
    
    var latestWeight: Double? {
        weightEntries.last?.quantity
    }
    
    var latestHeight: Double? {
        heightEntries.last?.quantity
    }
    
    var body: some View {
        VStack(spacing: PAMSpacing.lg) {
            // Current Stats
            HStack(spacing: PAMSpacing.md) {
                MeasurementCard(
                    title: "Weight",
                    value: latestWeight.map { String(format: "%.2f kg", $0) } ?? "No data",
                    icon: "scalemass.fill",
                    color: PAMColors.brandPink,
                    trend: calculateTrend(for: weightEntries)
                )
                
                MeasurementCard(
                    title: "Height",
                    value: latestHeight.map { String(format: "%.1f cm", $0) } ?? "No data",
                    icon: "ruler.fill",
                    color: PAMColors.brandRed,
                    trend: calculateTrend(for: heightEntries)
                )
            }
            .padding(.horizontal, PAMSpacing.lg)
            
            // Charts
            if !weightEntries.isEmpty {
                ChartCard(
                    title: "Weight Progress",
                    entries: weightEntries,
                    unit: "kg",
                    color: PAMColors.brandPink
                )
            }
            
            if !heightEntries.isEmpty {
                ChartCard(
                    title: "Height Progress",
                    entries: heightEntries,
                    unit: "cm",
                    color: PAMColors.brandRed
                )
            }
            
            // Percentiles Placeholder
            PAMCard {
                VStack(spacing: PAMSpacing.lg) {
                    Image(systemName: "chart.xyaxis.line")
                        .font(.system(size: 48))
                        .foregroundColor(PAMColors.brandPink)
                    
                    Text("Growth Percentiles")
                        .font(PAMFonts.headline)
                        .foregroundColor(PAMColors.brandRed)
                    
                    Text("WHO growth standards coming soon")
                        .font(PAMFonts.subheadline)
                        .foregroundColor(PAMColors.gray)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, PAMSpacing.xl)
            }
            .padding(.horizontal, PAMSpacing.lg)
            
            // Recent Measurements
            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                Text("Recent Measurements")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.white)
                    .padding(.horizontal, PAMSpacing.lg)
                
                let recentEntries = (weightEntries + heightEntries)
                    .sorted { $0.timestamp > $1.timestamp }
                    .prefix(5)
                
                if recentEntries.isEmpty {
                    EmptyMeasurementsCard()
                } else {
                    ForEach(Array(recentEntries)) { entry in
                        MeasurementRow(entry: entry)
                    }
                    .padding(.horizontal, PAMSpacing.lg)
                }
            }
            
            // Bottom padding
            Color.clear.frame(height: PAMSpacing.xxxl * 2)
        }
        .padding(.top, PAMSpacing.lg)
    }
    
    func calculateTrend(for entries: [TrackerEntry]) -> Double? {
        guard entries.count >= 2,
              let recent = entries.last?.quantity,
              let previous = entries.dropLast().last?.quantity else {
            return nil
        }
        return recent - previous
    }
}

// MARK: - Milestones Tracking Section
struct MilestonesTrackingSection: View {
    @State private var selectedCategory = "All"
    @Binding var showingAddMilestone: Bool
    
    let categories = ["All", "Motor", "Language", "Social", "Cognitive"]
    
    let milestones = [
        Milestone(title: "First smile", category: "Social", ageMonths: 2, isAchieved: true, achievedDate: Date().addingTimeInterval(-60*60*24*30)),
        Milestone(title: "Holds head up", category: "Motor", ageMonths: 3, isAchieved: true, achievedDate: Date().addingTimeInterval(-60*60*24*14)),
        Milestone(title: "Rolls over", category: "Motor", ageMonths: 4, isAchieved: false, achievedDate: nil),
        Milestone(title: "Sits without support", category: "Motor", ageMonths: 6, isAchieved: false, achievedDate: nil),
        Milestone(title: "First words", category: "Language", ageMonths: 12, isAchieved: false, achievedDate: nil),
        Milestone(title: "Responds to name", category: "Social", ageMonths: 6, isAchieved: false, achievedDate: nil),
        Milestone(title: "Object permanence", category: "Cognitive", ageMonths: 8, isAchieved: false, achievedDate: nil)
    ]
    
    var filteredMilestones: [Milestone] {
        if selectedCategory == "All" {
            return milestones
        }
        return milestones.filter { $0.category == selectedCategory }
    }
    
    var body: some View {
        VStack(spacing: PAMSpacing.lg) {
            // Progress Overview
            MilestoneProgressCard(milestones: milestones)
            
            // Category Filter
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: PAMSpacing.sm) {
                    ForEach(categories, id: \.self) { category in
                        CategoryPill(
                            title: category,
                            isSelected: selectedCategory == category,
                            action: {
                                withAnimation {
                                    selectedCategory = category
                                }
                            }
                        )
                    }
                }
                .padding(.horizontal, PAMSpacing.lg)
            }
            
            // Milestones List
            VStack(spacing: PAMSpacing.md) {
                ForEach(filteredMilestones) { milestone in
                    MilestoneCard(milestone: milestone)
                }
            }
            .padding(.horizontal, PAMSpacing.lg)
            
            // Bottom padding
            Color.clear.frame(height: PAMSpacing.xxxl * 2)
        }
        .padding(.top, PAMSpacing.lg)
    }
}

struct BabyTrackerView_Previews: PreviewProvider {
    static var previews: some View {
        BabyTrackerView()
            .environmentObject(DataStore())
    }
}