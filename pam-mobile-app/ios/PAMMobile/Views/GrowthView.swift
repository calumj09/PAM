//
//  GrowthView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//  Updated with PAM Design System on 2025-08-15.
//

import SwiftUI
import Charts

struct GrowthView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var selectedTab = 0
    @State private var showingAddMeasurement = false
    @State private var showingAddMilestone = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // PAM Brand Background
                PAMColors.brandRed
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    PAMHeader(title: "Growth Tracking", showProfile: true, showSettings: false)
                    
                    // Tab Selector
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: PAMSpacing.md) {
                            TabButton(title: "Measurements", icon: "ruler.fill", isSelected: selectedTab == 0) {
                                withAnimation { selectedTab = 0 }
                            }
                            TabButton(title: "Milestones", icon: "star.fill", isSelected: selectedTab == 1) {
                                withAnimation { selectedTab = 1 }
                            }
                            TabButton(title: "Percentiles", icon: "chart.line.uptrend.xyaxis", isSelected: selectedTab == 2) {
                                withAnimation { selectedTab = 2 }
                            }
                        }
                        .padding(.horizontal, PAMSpacing.lg)
                    }
                    .padding(.vertical, PAMSpacing.md)
                    
                    // Content
                    ScrollView {
                        switch selectedTab {
                        case 0:
                            MeasurementsSection()
                        case 1:
                            MilestonesSection()
                        case 2:
                            PercentilesSection()
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
                        if selectedTab < 2 {
                            Button(action: {
                                if selectedTab == 0 {
                                    showingAddMeasurement = true
                                } else if selectedTab == 1 {
                                    showingAddMilestone = true
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
                }
            )
            .sheet(isPresented: $showingAddMeasurement) {
                AddMeasurementView()
            }
            .sheet(isPresented: $showingAddMilestone) {
                AddMilestoneView()
            }
        }
    }
}

// MARK: - Tab Button
struct TabButton: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: PAMSpacing.sm) {
                Image(systemName: icon)
                    .font(.caption)
                Text(title)
                    .font(PAMFonts.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .foregroundColor(isSelected ? PAMColors.white : PAMColors.brandRed)
            .padding(.horizontal, PAMSpacing.lg)
            .padding(.vertical, PAMSpacing.sm)
            .background(isSelected ? PAMColors.brandRed : PAMColors.white)
            .cornerRadius(PAMRadius.xxl)
            .overlay(
                RoundedRectangle(cornerRadius: PAMRadius.xxl)
                    .stroke(isSelected ? PAMColors.brandRed : PAMColors.brandPink.opacity(0.3), lineWidth: 1)
            )
            .scaleEffect(isSelected ? 1.05 : 1.0)
        }
    }
}

// MARK: - Measurements Section
struct MeasurementsSection: View {
    @EnvironmentObject var dataStore: DataStore
    
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

// MARK: - Measurement Card
struct MeasurementCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    let trend: Double?
    
    var body: some View {
        PAMCard {
            VStack(alignment: .leading, spacing: PAMSpacing.sm) {
                HStack {
                    Image(systemName: icon)
                        .foregroundColor(color)
                    Text(title)
                        .font(PAMFonts.caption)
                        .foregroundColor(PAMColors.gray)
                }
                
                Text(value)
                    .font(PAMFonts.title2)
                    .fontWeight(.bold)
                    .foregroundColor(PAMColors.brandRed)
                
                if let trend = trend {
                    HStack(spacing: 4) {
                        Image(systemName: trend > 0 ? "arrow.up.right" : "arrow.down.right")
                            .font(.caption2)
                        Text(String(format: "%+.1f", trend))
                            .font(PAMFonts.caption2)
                    }
                    .foregroundColor(trend > 0 ? .green : .orange)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// MARK: - Chart Card
struct ChartCard: View {
    let title: String
    let entries: [TrackerEntry]
    let unit: String
    let color: Color
    
    var body: some View {
        PAMCard {
            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                Text(title)
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.brandRed)
                
                if #available(iOS 16.0, *) {
                    Chart(entries) { entry in
                        LineMark(
                            x: .value("Date", entry.timestamp),
                            y: .value("Value", entry.quantity ?? 0)
                        )
                        .foregroundStyle(color)
                        
                        PointMark(
                            x: .value("Date", entry.timestamp),
                            y: .value("Value", entry.quantity ?? 0)
                        )
                        .foregroundStyle(color)
                    }
                    .frame(height: 200)
                } else {
                    // Fallback for iOS 15
                    Text("Chart requires iOS 16+")
                        .foregroundColor(PAMColors.gray)
                        .frame(height: 200)
                }
            }
        }
        .padding(.horizontal, PAMSpacing.lg)
    }
}

// MARK: - Measurement Row
struct MeasurementRow: View {
    let entry: TrackerEntry
    
    var body: some View {
        HStack {
            ZStack {
                RoundedRectangle(cornerRadius: PAMRadius.md)
                    .fill(PAMColors.brandPink.opacity(0.1))
                    .frame(width: 44, height: 44)
                
                Image(systemName: entry.type == .weight ? "scalemass.fill" : "ruler.fill")
                    .foregroundColor(PAMColors.brandPink)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.type == .weight ? "Weight" : "Height")
                    .font(PAMFonts.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(PAMColors.textBody)
                
                if let quantity = entry.quantity {
                    Text(entry.type == .weight ? 
                         String(format: "%.2f kg", quantity) : 
                         String(format: "%.1f cm", quantity))
                        .font(PAMFonts.caption)
                        .foregroundColor(PAMColors.gray)
                }
            }
            
            Spacer()
            
            Text(dateString(for: entry.timestamp))
                .font(PAMFonts.caption)
                .foregroundColor(PAMColors.gray)
        }
        .padding(PAMSpacing.md)
        .background(PAMColors.white)
        .cornerRadius(PAMRadius.lg)
        .shadow(
            color: PAMShadows.cardShadow.color,
            radius: PAMShadows.cardShadow.radius,
            x: PAMShadows.cardShadow.x,
            y: PAMShadows.cardShadow.y
        )
    }
    
    func dateString(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

// MARK: - Empty Measurements Card
struct EmptyMeasurementsCard: View {
    var body: some View {
        PAMCard {
            VStack(spacing: PAMSpacing.lg) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 48))
                    .foregroundColor(PAMColors.brandPink)
                
                Text("No measurements yet")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.brandRed)
                
                Text("Tap + to add your first measurement")
                    .font(PAMFonts.subheadline)
                    .foregroundColor(PAMColors.gray)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, PAMSpacing.xl)
        }
        .padding(.horizontal, PAMSpacing.lg)
    }
}

// MARK: - Milestones Section
struct MilestonesSection: View {
    @State private var selectedCategory = "All"
    
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

// MARK: - Milestone Progress Card
struct MilestoneProgressCard: View {
    let milestones: [Milestone]
    
    var achievedCount: Int {
        milestones.filter { $0.isAchieved }.count
    }
    
    var progress: Double {
        guard !milestones.isEmpty else { return 0 }
        return Double(achievedCount) / Double(milestones.count)
    }
    
    var body: some View {
        PAMCard {
            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                HStack {
                    Text("Milestone Progress")
                        .font(PAMFonts.headline)
                        .foregroundColor(PAMColors.brandRed)
                    
                    Spacer()
                    
                    Text("\(achievedCount)/\(milestones.count)")
                        .font(PAMFonts.title3)
                        .fontWeight(.bold)
                        .foregroundColor(PAMColors.brandRed)
                }
                
                // Progress Bar
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: PAMRadius.sm)
                        .fill(PAMColors.brandPink.opacity(0.2))
                        .frame(height: 12)
                    
                    RoundedRectangle(cornerRadius: PAMRadius.sm)
                        .fill(
                            LinearGradient(
                                colors: [PAMColors.brandPink, PAMColors.brandRed],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: max(0, CGFloat(progress) * (UIScreen.main.bounds.width - PAMSpacing.lg * 4)), height: 12)
                }
                
                Text("Keep tracking those special moments! 🌟")
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.brandPink)
            }
        }
        .padding(.horizontal, PAMSpacing.lg)
    }
}

// MARK: - Category Pill
struct CategoryPill: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(PAMFonts.caption)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? PAMColors.white : PAMColors.brandRed)
                .padding(.horizontal, PAMSpacing.md)
                .padding(.vertical, PAMSpacing.xs)
                .background(isSelected ? PAMColors.brandRed : PAMColors.white)
                .cornerRadius(PAMRadius.xxl)
                .overlay(
                    RoundedRectangle(cornerRadius: PAMRadius.xxl)
                        .stroke(isSelected ? PAMColors.brandRed : PAMColors.brandPink.opacity(0.3), lineWidth: 1)
                )
        }
    }
}

// MARK: - Milestone Card
struct MilestoneCard: View {
    let milestone: Milestone
    
    var body: some View {
        HStack {
            ZStack {
                Circle()
                    .stroke(milestone.isAchieved ? PAMColors.successPink : PAMColors.gray, lineWidth: 2)
                    .frame(width: 28, height: 28)
                
                if milestone.isAchieved {
                    Circle()
                        .fill(PAMColors.successPink)
                        .frame(width: 28, height: 28)
                    
                    Image(systemName: "checkmark")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(PAMColors.white)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(milestone.title)
                    .font(PAMFonts.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(PAMColors.textBody)
                    .strikethrough(milestone.isAchieved, color: PAMColors.gray)
                
                HStack {
                    Label(milestone.category, systemImage: categoryIcon(for: milestone.category))
                        .font(PAMFonts.caption2)
                        .foregroundColor(PAMColors.brandPink)
                    
                    Text("• \(milestone.ageMonths) months")
                        .font(PAMFonts.caption2)
                        .foregroundColor(PAMColors.gray)
                    
                    if let date = milestone.achievedDate {
                        Text("• \(dateString(for: date))")
                            .font(PAMFonts.caption2)
                            .foregroundColor(PAMColors.successPink)
                    }
                }
            }
            
            Spacer()
        }
        .padding(PAMSpacing.md)
        .background(PAMColors.white)
        .cornerRadius(PAMRadius.lg)
        .shadow(
            color: PAMShadows.cardShadow.color,
            radius: PAMShadows.cardShadow.radius,
            x: PAMShadows.cardShadow.x,
            y: PAMShadows.cardShadow.y
        )
    }
    
    func categoryIcon(for category: String) -> String {
        switch category {
        case "Motor": return "figure.walk"
        case "Language": return "bubble.left.fill"
        case "Social": return "person.2.fill"
        case "Cognitive": return "brain"
        default: return "star.fill"
        }
    }
    
    func dateString(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

// MARK: - Percentiles Section
struct PercentilesSection: View {
    var body: some View {
        VStack(spacing: PAMSpacing.lg) {
            PAMCard {
                VStack(spacing: PAMSpacing.lg) {
                    Image(systemName: "chart.xyaxis.line")
                        .font(.system(size: 48))
                        .foregroundColor(PAMColors.brandPink)
                    
                    Text("Percentile Charts")
                        .font(PAMFonts.headline)
                        .foregroundColor(PAMColors.brandRed)
                    
                    Text("WHO growth standards coming soon")
                        .font(PAMFonts.subheadline)
                        .foregroundColor(PAMColors.gray)
                        .multilineTextAlignment(.center)
                    
                    Text("Track how your baby's growth compares to healthy development standards")
                        .font(PAMFonts.caption)
                        .foregroundColor(PAMColors.gray)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, PAMSpacing.xl)
            }
            .padding(.horizontal, PAMSpacing.lg)
            
            // Bottom padding
            Color.clear.frame(height: PAMSpacing.xxxl)
        }
        .padding(.top, PAMSpacing.lg)
    }
}

// MARK: - Add Measurement View
struct AddMeasurementView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var dataStore: DataStore
    
    @State private var measurementType = "Weight"
    @State private var value = ""
    @State private var date = Date()
    
    var body: some View {
        NavigationView {
            ZStack {
                PAMColors.brandCream
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAMSpacing.lg) {
                        PAMCard {
                            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                Label("Measurement Type", systemImage: "ruler.fill")
                                    .font(PAMFonts.headline)
                                    .foregroundColor(PAMColors.brandRed)
                                
                                HStack(spacing: PAMSpacing.sm) {
                                    ForEach(["Weight", "Height"], id: \.self) { type in
                                        Button(action: { measurementType = type }) {
                                            Text(type)
                                                .font(PAMFonts.subheadline)
                                                .foregroundColor(measurementType == type ? PAMColors.white : PAMColors.brandRed)
                                                .frame(maxWidth: .infinity)
                                                .padding(.vertical, PAMSpacing.sm)
                                                .background(measurementType == type ? PAMColors.brandRed : PAMColors.white)
                                                .cornerRadius(PAMRadius.md)
                                                .overlay(
                                                    RoundedRectangle(cornerRadius: PAMRadius.md)
                                                        .stroke(PAMColors.brandRed, lineWidth: 1)
                                                )
                                        }
                                    }
                                }
                                
                                PAMTextField(
                                    placeholder: measurementType == "Weight" ? "Weight (kg)" : "Height (cm)",
                                    text: $value,
                                    icon: measurementType == "Weight" ? "scalemass.fill" : "ruler.fill",
                                    keyboardType: .decimalPad
                                )
                                
                                DatePicker("Date", selection: $date, displayedComponents: .date)
                                    .datePickerStyle(GraphicalDatePickerStyle())
                                    .accentColor(PAMColors.brandRed)
                            }
                        }
                        
                        // Bottom padding
                        Color.clear.frame(height: PAMSpacing.xxxl)
                    }
                    .padding(PAMSpacing.lg)
                }
            }
            .navigationTitle("Add Measurement")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(PAMColors.brandRed)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveMeasurement()
                        dismiss()
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(PAMColors.brandRed)
                    .disabled(value.isEmpty)
                }
            }
        }
    }
    
    func saveMeasurement() {
        guard let firstChild = dataStore.children.first,
              let quantity = Double(value) else { return }
        
        // Add the tracker entry
        dataStore.addTrackerEntry(
            type: measurementType == "Weight" ? .weight : .height,
            childId: firstChild.id,
            notes: String(format: measurementType == "Weight" ? "%.2f kg" : "%.1f cm", quantity)
        )
        
        // Update the last entry with quantity and timestamp
        if let lastEntry = dataStore.trackerEntries.last {
            var updatedEntry = lastEntry
            updatedEntry.quantity = quantity
            updatedEntry.timestamp = date
            
            if let index = dataStore.trackerEntries.firstIndex(where: { $0.id == lastEntry.id }) {
                dataStore.trackerEntries[index] = updatedEntry
            }
        }
    }
}

// MARK: - Add Milestone View
struct AddMilestoneView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                PAMColors.brandCream
                    .ignoresSafeArea()
                
                VStack {
                    Text("Milestone tracking coming soon!")
                        .font(PAMFonts.headline)
                        .foregroundColor(PAMColors.brandRed)
                }
            }
            .navigationTitle("Add Milestone")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(PAMColors.brandRed)
                }
            }
        }
    }
}

// MARK: - Data Models
struct Milestone: Identifiable {
    let id = UUID()
    let title: String
    let category: String
    let ageMonths: Int
    let isAchieved: Bool
    let achievedDate: Date?
}

struct GrowthView_Previews: PreviewProvider {
    static var previews: some View {
        GrowthView()
            .environmentObject(DataStore())
    }
}