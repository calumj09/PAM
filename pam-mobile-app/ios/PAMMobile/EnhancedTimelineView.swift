//
//  EnhancedChecklistView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-16.
//  Enhanced checklist with default items, PAM recommendations, and custom items
//

import SwiftUI

struct EnhancedChecklistView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var showingAddItem = false
    @State private var showingOptionalItems = false
    @State private var showingCustomItem = false
    @State private var selectedOptionalCategory: OptionalChecklistItem.OptionalCategory?
    @State private var showOnlyUpcoming = true
    @State private var selectedWeekDate = Date()
    @State private var currentWeekDates: [Date] = []
    
    var filteredItems: [ChecklistItem] {
        var items = dataStore.checklistItems
        
        // Filter by selected child
        if let firstChild = dataStore.children.first {
            items = items.filter { $0.childId == firstChild.id }
        }
        
        // Filter by current week
        let calendar = Calendar.current
        let weekStart = calendar.dateInterval(of: .weekOfYear, for: selectedWeekDate)?.start ?? selectedWeekDate
        let weekEnd = calendar.date(byAdding: .day, value: 6, to: weekStart) ?? selectedWeekDate
        
        items = items.filter { item in
            guard let dueDate = item.dueDate else { return false }
            
            // If task is overdue and not completed, move it to current week
            if !item.isCompleted && dueDate < weekStart {
                // Move overdue uncompleted tasks to this week
                return calendar.isDate(dueDate, inSameDayAs: selectedWeekDate) || 
                       (weekStart...weekEnd).contains(Date())
            }
            
            // Otherwise show tasks for the selected week
            return (weekStart...weekEnd).contains(dueDate)
        }
        
        // Filter by upcoming status
        if showOnlyUpcoming {
            items = items.filter { !$0.isCompleted }
        }
        
        // Sort by due date
        return items.sorted { (item1, item2) in
            if let date1 = item1.dueDate, let date2 = item2.dueDate {
                return date1 < date2
            }
            return false
        }
    }
    
    var upcomingCount: Int {
        filteredItems.filter { item in
            guard let dueDate = item.dueDate else { return false }
            return dueDate <= Date().addingTimeInterval(7 * 24 * 60 * 60) && !item.isCompleted
        }.count
    }
    
    var completionRate: Double {
        let allItems = dataStore.checklistItems
        guard !allItems.isEmpty else { return 0 }
        let completed = allItems.filter { $0.isCompleted }.count
        return Double(completed) / Double(allItems.count)
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // PAM Brand Background
                PAMColors.brandRed
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    PAMHeader(title: "Checklist", showProfile: true, showSettings: false)
                    
                    // 7-Day Calendar Scroll
                    WeeklyCalendarScroll(
                        selectedDate: $selectedWeekDate,
                        currentWeekDates: $currentWeekDates
                    )
                    
                    ScrollView {
                        VStack(spacing: PAMSpacing.lg) {
                            // Progress Overview
                            ProgressOverviewCard(
                                completionRate: completionRate,
                                upcomingCount: upcomingCount
                            )
                            
                            // Combined Options Button
                            CombinedOptionsSection(
                                showingOptionalItems: $showingOptionalItems,
                                showingCustomItem: $showingCustomItem,
                                onGenerateDefaults: generateDefaultItems
                            )
                            
                            // Timeline Items
                            TimelineItemsSection(
                                items: filteredItems,
                                onToggle: { item in
                                    withAnimation(.spring()) {
                                        dataStore.toggleChecklistItem(item)
                                    }
                                }
                            )
                            
                            // Bottom padding
                            Color.clear.frame(height: PAMSpacing.xxxl)
                        }
                        .padding(.top, PAMSpacing.lg)
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingOptionalItems) {
                OptionalItemsView { optionalItem in
                    if let child = dataStore.children.first {
                        dataStore.addOptionalChecklistItem(optionalItem, for: child)
                    }
                }
            }
            .sheet(isPresented: $showingCustomItem) {
                AddCustomItemView()
            }
        }
        .onAppear {
            checkAndGenerateDefaultItems()
            setupWeeklyCalendar()
        }
    }
    
    private func checkAndGenerateDefaultItems() {
        guard let firstChild = dataStore.children.first else { return }
        
        // Check if default items have been generated
        let hasDefaultItems = dataStore.checklistItems.contains { item in
            item.childId == firstChild.id && item.source == "default"
        }
        
        if !hasDefaultItems {
            generateDefaultItems()
        }
    }
    
    private func generateDefaultItems() {
        guard let firstChild = dataStore.children.first else { return }
        dataStore.generateDefaultChecklistForChild(firstChild)
    }
    
    private func setupWeeklyCalendar() {
        let calendar = Calendar.current
        guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: selectedWeekDate) else { return }
        
        var dates: [Date] = []
        var currentDate = weekInterval.start
        
        for _ in 0..<7 {
            dates.append(currentDate)
            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
        }
        
        currentWeekDates = dates
    }
}

// MARK: - Weekly Calendar Scroll
struct WeeklyCalendarScroll: View {
    @Binding var selectedDate: Date
    @Binding var currentWeekDates: [Date]
    @EnvironmentObject var dataStore: DataStore
    
    private let calendar = Calendar.current
    
    func hasDueItems(for date: Date) -> Bool {
        // Check if there are any uncompleted checklist items due on this date
        return dataStore.checklistItems.contains { item in
            guard let dueDate = item.dueDate, !item.isCompleted else { return false }
            return calendar.isDate(dueDate, inSameDayAs: date)
        }
    }
    
    var body: some View {
        VStack(spacing: PAMSpacing.sm) {
            // Week Navigation Header
            HStack {
                Button(action: previousWeek) {
                    Image(systemName: "chevron.left")
                        .font(.title2)
                        .foregroundColor(PAMColors.white)
                        .padding(PAMSpacing.sm)
                        .background(PAMColors.brandPink.opacity(0.2))
                        .cornerRadius(PAMRadius.sm)
                }
                
                Spacer()
                
                Text(weekTitle)
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.white)
                
                Spacer()
                
                Button(action: nextWeek) {
                    Image(systemName: "chevron.right")
                        .font(.title2)
                        .foregroundColor(PAMColors.white)
                        .padding(PAMSpacing.sm)
                        .background(PAMColors.brandPink.opacity(0.2))
                        .cornerRadius(PAMRadius.sm)
                }
            }
            .padding(.horizontal, PAMSpacing.lg)
            
            // 7-Day Calendar Scroll
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: PAMSpacing.sm) {
                    ForEach(currentWeekDates, id: \.self) { date in
                        WeekDayCard(
                            date: date,
                            isSelected: calendar.isDate(date, inSameDayAs: selectedDate),
                            isToday: calendar.isDateInToday(date),
                            hasDueItems: hasDueItems(for: date)
                        ) {
                            selectedDate = date
                        }
                    }
                }
                .padding(.horizontal, PAMSpacing.lg)
            }
        }
        .padding(.vertical, PAMSpacing.md)
        .background(PAMColors.brandRed)
    }
    
    private var weekTitle: String {
        guard let firstDate = currentWeekDates.first,
              let lastDate = currentWeekDates.last else { return "" }
        
        let formatter = DateFormatter()
        
        if calendar.isDate(firstDate, equalTo: lastDate, toGranularity: .month) {
            formatter.dateFormat = "MMMM yyyy"
            return formatter.string(from: firstDate)
        } else {
            formatter.dateFormat = "MMM d"
            let startString = formatter.string(from: firstDate)
            formatter.dateFormat = "MMM d, yyyy"
            let endString = formatter.string(from: lastDate)
            return "\(startString) - \(endString)"
        }
    }
    
    private func previousWeek() {
        let newDate = calendar.date(byAdding: .weekOfYear, value: -1, to: selectedDate) ?? selectedDate
        selectedDate = newDate
        updateWeekDates()
    }
    
    private func nextWeek() {
        let newDate = calendar.date(byAdding: .weekOfYear, value: 1, to: selectedDate) ?? selectedDate
        selectedDate = newDate
        updateWeekDates()
    }
    
    private func updateWeekDates() {
        guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: selectedDate) else { return }
        
        var dates: [Date] = []
        var currentDate = weekInterval.start
        
        for _ in 0..<7 {
            dates.append(currentDate)
            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
        }
        
        currentWeekDates = dates
    }
}

// MARK: - Week Day Card
struct WeekDayCard: View {
    let date: Date
    let isSelected: Bool
    let isToday: Bool
    let hasDueItems: Bool
    let action: () -> Void
    
    private let calendar = Calendar.current
    
    var dayName: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "E"
        return formatter.string(from: date)
    }
    
    var dayNumber: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: date)
    }
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: PAMSpacing.xs) {
                Text(dayName)
                    .font(PAMFonts.caption2)
                    .foregroundColor(isSelected ? PAMColors.brandRed : PAMColors.white.opacity(0.8))
                
                Text(dayNumber)
                    .font(PAMFonts.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(isSelected ? PAMColors.brandRed : PAMColors.white)
                
                // Show pink dot if there are due items on this day
                if hasDueItems && !isSelected {
                    Circle()
                        .fill(PAMColors.brandPink)
                        .frame(width: 6, height: 6)
                } else if isToday && !isSelected && !hasDueItems {
                    Circle()
                        .stroke(PAMColors.brandPink, lineWidth: 1)
                        .frame(width: 6, height: 6)
                } else {
                    Circle()
                        .fill(Color.clear)
                        .frame(width: 6, height: 6)
                }
            }
            .frame(width: 44, height: 70)
            .background(isSelected ? PAMColors.white : Color.clear)
            .cornerRadius(PAMRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: PAMRadius.md)
                    .stroke(isToday && !isSelected ? PAMColors.brandPink : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}


// MARK: - Progress Overview Card
struct ProgressOverviewCard: View {
    let completionRate: Double
    let upcomingCount: Int
    
    var progressMessage: String {
        switch completionRate {
        case 0..<0.25:
            return "Just getting started! 🌱"
        case 0.25..<0.5:
            return "Making good progress! 💪"
        case 0.5..<0.75:
            return "You're doing amazing! 🌟"
        case 0.75..<1:
            return "Almost there! 🎯"
        default:
            return "All done! Superstar parent! 🏆"
        }
    }
    
    var body: some View {
        PAMCard {
            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Overall Progress")
                            .font(PAMFonts.headline)
                            .foregroundColor(PAMColors.brandRed)
                        
                        Text(progressMessage)
                            .font(PAMFonts.caption)
                            .foregroundColor(PAMColors.accessibleTextSecondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing) {
                        Text("\(Int(completionRate * 100))%")
                            .font(PAMFonts.title2)
                            .fontWeight(.bold)
                            .foregroundColor(PAMColors.brandRed)
                        
                        if upcomingCount > 0 {
                            Text("\(upcomingCount) due soon")
                                .font(PAMFonts.caption)
                                .foregroundColor(PAMColors.subtleText)
                                .padding(.horizontal, PAMSpacing.md)
                                .padding(.vertical, PAMSpacing.xs)
                                .background(PAMColors.brandPink.opacity(0.1))
                                .cornerRadius(PAMRadius.xxl)
                        }
                    }
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
                        .frame(width: max(0, CGFloat(completionRate) * (UIScreen.main.bounds.width - PAMSpacing.lg * 4)), height: 12)
                }
            }
        }
        .padding(.horizontal, PAMSpacing.lg)
    }
}

// MARK: - Combined Options Section
struct CombinedOptionsSection: View {
    @Binding var showingOptionalItems: Bool
    @Binding var showingCustomItem: Bool
    let onGenerateDefaults: () -> Void
    @State private var showingActionSheet = false
    
    var body: some View {
        PAMCard {
            Button(action: { showingActionSheet = true }) {
                HStack {
                    VStack(alignment: .leading, spacing: PAMSpacing.xs) {
                        Text("Manage Checklist")
                            .font(PAMFonts.headline)
                            .foregroundColor(PAMColors.brandRed)
                        
                        Text("Add tasks, explore recommendations, or reset defaults")
                            .font(PAMFonts.caption)
                            .foregroundColor(PAMColors.accessibleTextSecondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "ellipsis.circle.fill")
                        .font(.title2)
                        .foregroundColor(PAMColors.brandRed)
                }
                .frame(minHeight: 44)
            }
            .buttonStyle(PlainButtonStyle())
            .accessibilityLabel("Manage Checklist")
            .accessibilityHint("Opens options to add custom tasks, explore PAM recommendations, or reset to default items")
            .accessibilityAddTraits(.isButton)
        }
        .padding(.horizontal, PAMSpacing.lg)
        .actionSheet(isPresented: $showingActionSheet) {
            ActionSheet(
                title: Text("Checklist Options"),
                message: Text("Choose an option to manage your checklist"),
                buttons: [
                    .default(Text("PAM Picks - Recommended Tasks")) {
                        showingOptionalItems = true
                    },
                    .default(Text("Add Custom Task")) {
                        showingCustomItem = true
                    },
                    .default(Text("Reset to Defaults")) {
                        onGenerateDefaults()
                    },
                    .cancel()
                ]
            )
        }
    }
}



// MARK: - Checklist Items Section
struct TimelineItemsSection: View {
    let items: [ChecklistItem]
    let onToggle: (ChecklistItem) -> Void
    
    var groupedItems: [(String, [ChecklistItem])] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: items) { item -> String in
            guard let dueDate = item.dueDate else { return "No Due Date" }
            
            if calendar.isDateInToday(dueDate) {
                return "Today"
            } else if calendar.isDateInTomorrow(dueDate) {
                return "Tomorrow"  
            } else if dueDate < Date() {
                return "Overdue (Moved to This Week)"
            } else {
                let formatter = DateFormatter()
                formatter.dateFormat = "EEEE, MMM d"
                return formatter.string(from: dueDate)
            }
        }
        
        let order = ["Overdue (Moved to This Week)", "Today", "Tomorrow"]
        return grouped.sorted { (first, second) in
            if let firstIndex = order.firstIndex(of: first.key),
               let secondIndex = order.firstIndex(of: second.key) {
                return firstIndex < secondIndex
            }
            // For specific days, sort by date
            if let firstDate = first.value.first?.dueDate,
               let secondDate = second.value.first?.dueDate {
                return firstDate < secondDate
            }
            return first.key < second.key
        }
    }
    
    var body: some View {
        VStack(spacing: PAMSpacing.lg) {
            if items.isEmpty {
                EmptyStateCard()
            } else {
                ForEach(groupedItems, id: \.0) { section in
                    VStack(alignment: .leading, spacing: PAMSpacing.md) {
                        Text(section.0)
                            .font(PAMFonts.headline)
                            .foregroundColor(section.0.contains("Overdue") ? PAMColors.errorRed : PAMColors.white)
                            .padding(.horizontal, PAMSpacing.lg)
                        
                        ForEach(section.1) { item in
                            EnhancedTimelineItemCard(item: item, toggleAction: {
                                onToggle(item)
                            })
                            .padding(.horizontal, PAMSpacing.lg)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Enhanced Timeline Item Card
struct EnhancedTimelineItemCard: View {
    let item: ChecklistItem
    let toggleAction: () -> Void
    @State private var isPressed = false
    
    var statusColor: Color {
        if item.isCompleted {
            return PAMColors.successPink
        } else if let dueDate = item.dueDate, dueDate < Date() {
            return PAMColors.errorRed
        } else if let dueDate = item.dueDate, dueDate < Date().addingTimeInterval(7 * 24 * 60 * 60) {
            return Color.orange
        }
        return PAMColors.brandRed
    }
    
    var sourceIcon: String {
        switch item.source {
        case "default":
            return "checkmark.seal.fill"
        case "pam_recommendation":
            return "sparkles"
        default:
            return "person.fill"
        }
    }
    
    var sourceColor: Color {
        switch item.source {
        case "default":
            return PAMColors.brandRed
        case "pam_recommendation":
            return PAMColors.brandPink
        default:
            return PAMColors.gray
        }
    }
    
    var body: some View {
        Button(action: toggleAction) {
            HStack(spacing: PAMSpacing.lg) {
                // Checkbox
                ZStack {
                    Circle()
                        .stroke(statusColor, lineWidth: 2)
                        .frame(width: 28, height: 28)
                    
                    if item.isCompleted {
                        Circle()
                            .fill(statusColor)
                            .frame(width: 28, height: 28)
                        
                        Image(systemName: "checkmark")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(PAMColors.white)
                    }
                }
                
                VStack(alignment: .leading, spacing: PAMSpacing.xs) {
                    HStack {
                        Text(item.title)
                            .font(PAMFonts.bodyPrimary(size: 15, weight: .semibold))
                            .foregroundColor(PAMColors.textBody)
                            .strikethrough(item.isCompleted, color: PAMColors.gray)
                            .multilineTextAlignment(.leading)
                        
                        Image(systemName: sourceIcon)
                            .font(.caption)
                            .foregroundColor(sourceColor)
                    }
                    
                    if let description = item.description {
                        Text(description)
                            .font(PAMFonts.caption)
                            .foregroundColor(PAMColors.gray)
                            .lineLimit(2)
                            .multilineTextAlignment(.leading)
                    }
                    
                    HStack {
                        // Category Badge
                        Label {
                            Text(item.category.displayName)
                        } icon: {
                            Image(systemName: categoryIcon(for: item.category))
                        }
                        .font(PAMFonts.caption2)
                        .foregroundColor(PAMColors.brandPink)
                        .padding(.horizontal, PAMSpacing.md)
                        .padding(.vertical, PAMSpacing.xs)
                        .background(PAMColors.brandPink.opacity(0.1))
                        .cornerRadius(PAMRadius.xxl)
                        
                        Spacer()
                        
                        if let dueDate = item.dueDate {
                            Text(dueDateText(for: dueDate))
                                .font(PAMFonts.caption2)
                                .fontWeight(.medium)
                                .foregroundColor(statusColor)
                        }
                    }
                }
                
                Spacer()
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
            .scaleEffect(isPressed ? 0.98 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0.1, maximumDistance: .infinity, pressing: { pressing in
            withAnimation(.easeInOut(duration: 0.1)) {
                isPressed = pressing
            }
        }, perform: {})
    }
    
    func categoryIcon(for category: ChecklistCategory) -> String {
        switch category {
        case .immunisation:
            return "syringe.fill"
        case .registration:
            return "doc.text.fill"
        case .milestone:
            return "star.fill"
        case .checkup:
            return "stethoscope"
        }
    }
    
    func dueDateText(for date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}


struct EnhancedChecklistView_Previews: PreviewProvider {
    static var previews: some View {
        EnhancedChecklistView()
            .environmentObject(DataStore())
    }
}