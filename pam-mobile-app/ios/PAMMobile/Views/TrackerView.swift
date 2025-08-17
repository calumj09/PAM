//
//  TrackerView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//  Updated with PAM Design System on 2025-08-15.
//

import SwiftUI

struct TrackerView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var selectedDate = Date()
    @State private var showingQuickEntry = false
    @State private var selectedTrackerType: TrackerType?
    
    var todayEntries: [TrackerEntry] {
        dataStore.trackerEntries.filter { entry in
            Calendar.current.isDate(entry.timestamp, inSameDayAs: selectedDate)
        }.sorted { $0.timestamp > $1.timestamp }
    }
    
    var dailyStats: DailyStats {
        calculateDailyStats(for: selectedDate)
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // PAM Brand Background
                PAMColors.brandRed
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    PAMHeader(title: "Baby Tracker", showProfile: true, showSettings: false)
                    
                    ScrollView {
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
                            Color.clear.frame(height: PAMSpacing.xxxl)
                        }
                        .padding(.top, PAMSpacing.lg)
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingQuickEntry) {
                if let type = selectedTrackerType {
                    QuickEntryView(trackerType: type, selectedDate: selectedDate)
                }
            }
        }
    }
    
    func calculateDailyStats(for date: Date) -> DailyStats {
        let dayEntries = dataStore.trackerEntries.filter { entry in
            Calendar.current.isDate(entry.timestamp, inSameDayAs: date)
        }
        
        let feeds = dayEntries.filter { $0.type == .feeding }.count
        let sleepMinutes = dayEntries.filter { $0.type == .sleep }.compactMap { $0.duration }.reduce(0, +) / 60
        let diapers = dayEntries.filter { $0.type == .diaper }.count
        let activities = dayEntries.filter { $0.type == .activity }.count
        
        let lastFeed = dayEntries.filter { $0.type == .feeding }.max { $0.timestamp < $1.timestamp }
        let lastSleep = dayEntries.filter { $0.type == .sleep }.max { $0.timestamp < $1.timestamp }
        let lastDiaper = dayEntries.filter { $0.type == .diaper }.max { $0.timestamp < $1.timestamp }
        let lastActivity = dayEntries.filter { $0.type == .activity }.max { $0.timestamp < $1.timestamp }
        
        return DailyStats(
            feeds: feeds,
            sleepHours: sleepMinutes / 60,
            sleepMinutes: Int(sleepMinutes) % 60,
            nappies: diapers,
            activities: activities,
            lastFeed: lastFeed?.timestamp,
            lastSleep: lastSleep?.timestamp,
            lastDiaper: lastDiaper?.timestamp,
            lastActivity: lastActivity?.timestamp
        )
    }
}

// MARK: - Date Selector Card
struct DateSelectorCard: View {
    @Binding var selectedDate: Date
    
    var dateString: String {
        if Calendar.current.isDateInToday(selectedDate) {
            return "Today"
        } else if Calendar.current.isDateInYesterday(selectedDate) {
            return "Yesterday"
        } else {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            return formatter.string(from: selectedDate)
        }
    }
    
    var body: some View {
        PAMCard {
            HStack {
                Button(action: previousDay) {
                    ZStack {
                        Circle()
                            .fill(PAMColors.brandPink.opacity(0.1))
                            .frame(width: 36, height: 36)
                        
                        Image(systemName: "chevron.left")
                            .foregroundColor(PAMColors.brandRed)
                            .font(.system(size: 14, weight: .semibold))
                    }
                }
                
                Spacer()
                
                VStack(spacing: 2) {
                    Text(dateString)
                        .font(PAMFonts.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(PAMColors.brandRed)
                    
                    Text(fullDateString())
                        .font(PAMFonts.caption)
                        .foregroundColor(PAMColors.gray)
                }
                
                Spacer()
                
                Button(action: nextDay) {
                    ZStack {
                        Circle()
                            .fill(PAMColors.brandPink.opacity(0.1))
                            .frame(width: 36, height: 36)
                        
                        Image(systemName: "chevron.right")
                            .foregroundColor(PAMColors.brandRed)
                            .font(.system(size: 14, weight: .semibold))
                    }
                }
                .disabled(Calendar.current.isDateInToday(selectedDate))
                .opacity(Calendar.current.isDateInToday(selectedDate) ? 0.3 : 1)
            }
        }
        .padding(.horizontal, PAMSpacing.lg)
    }
    
    func fullDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: selectedDate)
    }
    
    func previousDay() {
        withAnimation(.easeInOut) {
            selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
        }
    }
    
    func nextDay() {
        withAnimation(.easeInOut) {
            selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
        }
    }
}

// MARK: - Daily Summary Card
struct DailySummaryCard: View {
    let stats: DailyStats
    
    var body: some View {
        PAMCard {
            VStack(alignment: .leading, spacing: PAMSpacing.lg) {
                Text("Daily Summary")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.brandRed)
                
                HStack(spacing: PAMSpacing.sm) {
                    StatItem(
                        icon: "drop.fill",
                        value: "\(stats.feeds)",
                        label: "Feeds",
                        lastTime: stats.lastFeed,
                        color: PAMColors.brandPink
                    )
                    
                    StatItem(
                        icon: "moon.fill",
                        value: "\(stats.sleepHours)h \(stats.sleepMinutes)m",
                        label: "Sleep",
                        lastTime: stats.lastSleep,
                        color: PAMColors.brandRed
                    )
                    
                    StatItem(
                        icon: "figure.child",
                        value: "\(stats.nappies)",
                        label: "Nappies",
                        lastTime: stats.lastDiaper,
                        color: PAMColors.brandPink
                    )
                    
                    StatItem(
                        icon: "figure.play",
                        value: "\(stats.activities)",
                        label: "Activities",
                        lastTime: stats.lastActivity,
                        color: PAMColors.brandRed
                    )
                }
            }
        }
        .padding(.horizontal, PAMSpacing.lg)
    }
}

// MARK: - Stat Item
struct StatItem: View {
    let icon: String
    let value: String
    let label: String
    let lastTime: Date?
    let color: Color
    
    var lastTimeString: String {
        guard let time = lastTime else { return "Not yet" }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: time, relativeTo: Date())
    }
    
    var body: some View {
        VStack(spacing: PAMSpacing.sm) {
            ZStack {
                Circle()
                    .fill(PAMColors.gray.opacity(0.2))
                    .frame(width: 48, height: 48)
                
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(PAMColors.brandRed)
            }
            
            Text(value)
                .font(PAMFonts.title3)
                .fontWeight(.semibold)
                .foregroundColor(PAMColors.brandRed)
            
            Text(label)
                .font(PAMFonts.caption)
                .foregroundColor(PAMColors.gray)
            
            Text(lastTimeString)
                .font(PAMFonts.caption2)
                .foregroundColor(PAMColors.brandPink)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Quick Entry Section
struct QuickEntrySection: View {
    let onSelect: (TrackerType) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: PAMSpacing.md) {
            // 3x3 Grid for daily tracking items
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: PAMSpacing.md) {
                ForEach(TrackerType.dailyTracking, id: \.self) { type in
                    QuickEntryButton(type: type) {
                        onSelect(type)
                    }
                }
            }
            .padding(.horizontal, PAMSpacing.lg)
        }
    }
}

// MARK: - Quick Entry Button
struct QuickEntryButton: View {
    let type: TrackerType
    let action: () -> Void
    @State private var isPressed = false
    
    var buttonColor: Color {
        return PAMColors.brandRed // Use brand red for all tracker buttons
    }
    
    var iconName: String {
        switch type {
        case .feeding: return "drop.fill"
        case .sleep: return "moon.fill"
        case .diaper: return "figure.child"
        case .activity: return "figure.and.child.holdinghands"
        case .medication: return "pills.fill"
        case .temperature: return "thermometer"
        case .weight: return "scalemass.fill"
        case .height: return "ruler.fill"
        case .headCircumference: return "circle.dashed"
        }
    }
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: PAMSpacing.sm) {
                ZStack {
                    Circle()
                        .fill(PAMColors.gray.opacity(0.2))
                        .frame(width: max(60, 44), height: max(60, 44))
                        .shadow(
                            color: PAMColors.gray.opacity(0.2),
                            radius: 4,
                            x: 0,
                            y: 2
                        )
                    
                    Image(systemName: iconName)
                        .font(.system(size: 28))
                        .foregroundColor(PAMColors.brandRed)
                }
                
                Text(type.displayName)
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.textBody)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(height: 30)
            }
            .frame(maxWidth: .infinity)
            .padding(PAMSpacing.sm)
            .background(PAMColors.white)
            .cornerRadius(PAMRadius.lg)
            .shadow(
                color: PAMShadows.cardShadow.color,
                radius: PAMShadows.cardShadow.radius,
                x: PAMShadows.cardShadow.x,
                y: PAMShadows.cardShadow.y
            )
            .scaleEffect(isPressed ? 0.95 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .accessibilityLabel("Track \(type.displayName)")
        .accessibilityHint("Tap to add a new \(type.displayName.lowercased()) entry for your baby")
        .accessibilityAddTraits(.isButton)
        .onLongPressGesture(minimumDuration: 0.1, maximumDistance: .infinity, pressing: { pressing in
            withAnimation(.easeInOut(duration: 0.1)) {
                isPressed = pressing
            }
        }, perform: {})
    }
}

// MARK: - Activity Card
struct ActivityCard: View {
    let entry: TrackerEntry
    
    var icon: String {
        switch entry.type {
        case .feeding: return "drop.fill"
        case .sleep: return "moon.fill"
        case .diaper: return "figure.child"
        case .activity: return "figure.play"
        case .medication: return "pills.fill"
        case .temperature: return "thermometer"
        case .weight: return "scalemass.fill"
        case .height: return "ruler.fill"
        case .headCircumference: return "circle.dashed"
        }
    }
    
    var details: String {
        var text = ""
        
        switch entry.type {
        case .feeding:
            if let quantity = entry.quantity {
                text = "\(Int(quantity))ml"
            }
            if let duration = entry.duration {
                text += text.isEmpty ? "" : " • "
                text += "\(Int(duration/60)) min"
            }
        case .sleep:
            if let duration = entry.duration {
                let hours = Int(duration) / 3600
                let minutes = (Int(duration) % 3600) / 60
                text = hours > 0 ? "\(hours)h \(minutes)m" : "\(minutes)m"
            }
        case .diaper:
            text = entry.notes ?? "Changed"
        case .activity:
            if let duration = entry.duration {
                text = "\(Int(duration/60)) min"
            } else {
                text = entry.notes ?? "Activity"
            }
        case .temperature:
            if let temp = entry.quantity {
                text = String(format: "%.1f°C", temp)
            }
        case .weight:
            if let weight = entry.quantity {
                text = String(format: "%.2f kg", weight)
            }
        case .height:
            if let height = entry.quantity {
                text = String(format: "%.1f cm", height)
            }
        case .headCircumference:
            if let circumference = entry.quantity {
                text = String(format: "%.1f cm", circumference)
            }
        case .medication:
            text = entry.notes ?? "Given"
        }
        
        return text
    }
    
    var body: some View {
        HStack(spacing: PAMSpacing.lg) {
            ZStack {
                RoundedRectangle(cornerRadius: PAMRadius.md)
                    .fill(PAMColors.brandPink.opacity(0.1))
                    .frame(width: 44, height: 44)
                
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(PAMColors.brandPink)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.type.displayName)
                    .font(PAMFonts.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(PAMColors.textBody)
                
                Text(details)
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.gray)
            }
            
            Spacer()
            
            Text(timeString(for: entry.timestamp))
                .font(PAMFonts.caption)
                .foregroundColor(PAMColors.gray)
        }
        .padding(PAMSpacing.lg)
        .background(PAMColors.white)
        .cornerRadius(PAMRadius.lg)
        .shadow(
            color: PAMShadows.cardShadow.color,
            radius: PAMShadows.cardShadow.radius,
            x: PAMShadows.cardShadow.x,
            y: PAMShadows.cardShadow.y
        )
    }
    
    func timeString(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Empty Activities Card
struct EmptyActivitiesCard: View {
    var body: some View {
        PAMCard {
            VStack(spacing: PAMSpacing.lg) {
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: 48))
                    .foregroundColor(PAMColors.brandPink)
                
                Text("No activities yet")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.brandRed)
                
                Text("Tap any button above to start tracking")
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

// MARK: - Quick Entry View
struct QuickEntryView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var dataStore: DataStore
    
    let trackerType: TrackerType
    let selectedDate: Date
    
    @State private var quantity: String = ""
    @State private var duration: String = ""
    @State private var notes: String = ""
    @State private var feedingType = "Breast"
    @State private var nappyType = "Wet"
    @State private var timestamp = Date()
    
    var body: some View {
        NavigationView {
            ZStack {
                PAMColors.brandCream
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAMSpacing.lg) {
                        // Time Section
                        PAMCard {
                            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                Label("Time", systemImage: "clock.fill")
                                    .font(PAMFonts.headline)
                                    .foregroundColor(PAMColors.brandRed)
                                
                                DatePicker("Time", selection: $timestamp, displayedComponents: [.hourAndMinute])
                                    .datePickerStyle(WheelDatePickerStyle())
                                    .labelsHidden()
                            }
                        }
                        
                        // Type-specific fields
                        PAMCard {
                            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                Label("\(trackerType.displayName) Details", systemImage: icon(for: trackerType))
                                    .font(PAMFonts.headline)
                                    .foregroundColor(PAMColors.brandRed)
                                
                                typeSpecificFields()
                            }
                        }
                        
                        // Notes Section (if applicable)
                        if trackerType != .medication && trackerType != .diaper {
                            PAMCard {
                                VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                    Label("Notes (optional)", systemImage: "note.text")
                                        .font(PAMFonts.headline)
                                        .foregroundColor(PAMColors.brandRed)
                                    
                                    TextEditor(text: $notes)
                                        .font(PAMFonts.bodyPrimary(size: 14, weight: .regular))
                                        .frame(minHeight: 80)
                                        .padding(PAMSpacing.sm)
                                        .background(PAMColors.white)
                                        .cornerRadius(PAMRadius.md)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: PAMRadius.md)
                                                .stroke(PAMColors.brandPink.opacity(0.2), lineWidth: 1)
                                        )
                                }
                            }
                        }
                        
                        // Bottom padding
                        Color.clear.frame(height: PAMSpacing.xxxl)
                    }
                    .padding(PAMSpacing.lg)
                }
            }
            .navigationTitle("Add \(trackerType.displayName)")
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
                        saveEntry()
                        dismiss()
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(PAMColors.brandRed)
                }
            }
        }
    }
    
    @ViewBuilder
    func typeSpecificFields() -> some View {
        switch trackerType {
        case .feeding:
            VStack(spacing: PAMSpacing.md) {
                HStack(spacing: PAMSpacing.sm) {
                    ForEach(["Breast", "Bottle", "Solid"], id: \.self) { type in
                        Button(action: { feedingType = type }) {
                            Text(type)
                                .font(PAMFonts.subheadline)
                                .foregroundColor(feedingType == type ? PAMColors.white : PAMColors.brandRed)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, PAMSpacing.sm)
                                .background(feedingType == type ? PAMColors.brandRed : PAMColors.white)
                                .cornerRadius(PAMRadius.md)
                                .overlay(
                                    RoundedRectangle(cornerRadius: PAMRadius.md)
                                        .stroke(PAMColors.brandRed, lineWidth: 1)
                                )
                        }
                    }
                }
                
                if feedingType == "Bottle" {
                    PAMTextField(
                        placeholder: "Amount (ml)",
                        text: $quantity,
                        icon: "drop.fill",
                        keyboardType: .numberPad
                    )
                }
                
                if feedingType == "Breast" {
                    PAMTextField(
                        placeholder: "Duration (minutes)",
                        text: $duration,
                        icon: "clock.fill",
                        keyboardType: .numberPad
                    )
                }
            }
            
        case .sleep:
            PAMTextField(
                placeholder: "Duration (minutes)",
                text: $duration,
                icon: "moon.fill",
                keyboardType: .numberPad
            )
            
        case .diaper:
            HStack(spacing: PAMSpacing.sm) {
                ForEach(["Wet", "Dirty", "Both"], id: \.self) { type in
                    Button(action: { nappyType = type }) {
                        Text(type)
                            .font(PAMFonts.subheadline)
                            .foregroundColor(nappyType == type ? PAMColors.white : PAMColors.brandRed)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, PAMSpacing.sm)
                            .background(nappyType == type ? PAMColors.brandRed : PAMColors.white)
                            .cornerRadius(PAMRadius.md)
                            .overlay(
                                RoundedRectangle(cornerRadius: PAMRadius.md)
                                    .stroke(PAMColors.brandRed, lineWidth: 1)
                            )
                    }
                }
            }
            
        case .activity:
            VStack(spacing: PAMSpacing.md) {
                PAMTextField(
                    placeholder: "Activity description",
                    text: $notes,
                    icon: "figure.play"
                )
                PAMTextField(
                    placeholder: "Duration (minutes)",
                    text: $quantity,
                    icon: "clock.fill",
                    keyboardType: .numberPad
                )
            }
            
        case .temperature:
            PAMTextField(
                placeholder: "Temperature (°C)",
                text: $quantity,
                icon: "thermometer",
                keyboardType: .decimalPad
            )
            
        case .weight:
            PAMTextField(
                placeholder: "Weight (kg)",
                text: $quantity,
                icon: "scalemass.fill",
                keyboardType: .decimalPad
            )
            
        case .height:
            PAMTextField(
                placeholder: "Height (cm)",
                text: $quantity,
                icon: "ruler.fill",
                keyboardType: .decimalPad
            )
            
        case .headCircumference:
            PAMTextField(
                placeholder: "Head Circumference (cm)",
                text: $quantity,
                icon: "circle.dashed",
                keyboardType: .decimalPad
            )
            
        case .medication:
            PAMTextField(
                placeholder: "Medication name and dose",
                text: $notes,
                icon: "pills.fill"
            )
        }
    }
    
    func icon(for type: TrackerType) -> String {
        switch type {
        case .feeding: return "drop.fill"
        case .sleep: return "moon.fill"
        case .diaper: return "figure.child"
        case .activity: return "figure.play"
        case .medication: return "pills.fill"
        case .temperature: return "thermometer"
        case .weight: return "scalemass.fill"
        case .height: return "ruler.fill"
        case .headCircumference: return "circle.dashed"
        }
    }
    
    func saveEntry() {
        if let firstChild = dataStore.children.first {
            var finalNotes = notes
            
            if trackerType == .feeding {
                finalNotes = feedingType + (notes.isEmpty ? "" : " - \(notes)")
            } else if trackerType == .diaper {
                finalNotes = nappyType
            }
            
            let quantityValue = Double(quantity)
            let durationValue = Double(duration).map { $0 * 60 } // Convert minutes to seconds
            
            dataStore.addTrackerEntry(
                type: trackerType,
                childId: firstChild.id,
                notes: finalNotes.isEmpty ? nil : finalNotes
            )
            
            // Update the last entry with quantity/duration if needed
            if let lastEntry = dataStore.trackerEntries.last {
                var updatedEntry = lastEntry
                updatedEntry.quantity = quantityValue
                updatedEntry.duration = durationValue
                updatedEntry.timestamp = timestamp
                
                if let index = dataStore.trackerEntries.firstIndex(where: { $0.id == lastEntry.id }) {
                    dataStore.trackerEntries[index] = updatedEntry
                }
            }
        }
    }
}

// MARK: - TrackerType Extension
extension TrackerType {
    var displayName: String {
        switch self {
        case .feeding: return "Feeding"
        case .sleep: return "Sleep"
        case .diaper: return "Nappy"
        case .activity: return "Activity"
        case .medication: return "Medication"
        case .temperature: return "Temperature"
        case .weight: return "Weight"
        case .height: return "Height"
        case .headCircumference: return "Head"
        }
    }
}

// MARK: - Data Models
struct DailyStats {
    let feeds: Int
    let sleepHours: Double
    let sleepMinutes: Int
    let nappies: Int
    let activities: Int
    let lastFeed: Date?
    let lastSleep: Date?
    let lastDiaper: Date?
    let lastActivity: Date?
}

struct TrackerView_Previews: PreviewProvider {
    static var previews: some View {
        TrackerView()
            .environmentObject(DataStore())
    }
}