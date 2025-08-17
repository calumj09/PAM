//
//  CalendarView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//

import SwiftUI

struct CalendarView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var selectedDate = Date()
    @State private var currentMonth = Date()
    @State private var showingItemDetails = false
    @State private var selectedItem: ChecklistItem?
    
    var calendar = Calendar.current
    
    var monthYearString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: currentMonth)
    }
    
    var daysInMonth: [Date?] {
        guard let monthRange = calendar.range(of: .day, in: .month, for: currentMonth),
              let firstOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: currentMonth)) else {
            return []
        }
        
        let firstWeekday = calendar.component(.weekday, from: firstOfMonth) - 1
        var days: [Date?] = Array(repeating: nil, count: firstWeekday)
        
        for day in monthRange {
            if let date = calendar.date(byAdding: .day, value: day - 1, to: firstOfMonth) {
                days.append(date)
            }
        }
        
        while days.count % 7 != 0 {
            days.append(nil)
        }
        
        return days
    }
    
    func items(for date: Date) -> [ChecklistItem] {
        // Filter for first child and specific date
        guard let firstChild = dataStore.children.first else { return [] }
        
        return dataStore.checklistItems.filter { item in
            guard let dueDate = item.dueDate,
                  item.childId == firstChild.id else { return false }
            return calendar.isDate(dueDate, inSameDayAs: date)
        }.sorted { (item1, item2) in
            // Sort by completion status, then by due time
            if item1.isCompleted != item2.isCompleted {
                return !item1.isCompleted
            }
            return (item1.dueDate ?? Date()) < (item2.dueDate ?? Date())
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // PAM Brand Background
                PAMColors.brandCream
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    PAMHeader(title: "Calendar", showProfile: true, showSettings: false)
                    
                    ScrollView {
                        VStack(spacing: PAMSpacing.lg) {
                            // Month Navigation
                            HStack {
                                Button(action: previousMonth) {
                                    ZStack {
                                        Circle()
                                            .fill(PAMColors.white)
                                            .frame(width: 44, height: 44)
                                            .shadow(
                                                color: PAMShadows.cardShadow.color,
                                                radius: 4,
                                                x: 0,
                                                y: 2
                                            )
                                        
                                        Image(systemName: "chevron.left")
                                            .font(.title2)
                                            .foregroundColor(PAMColors.brandRed)
                                    }
                                }
                                
                                Spacer()
                                
                                Text(monthYearString)
                                    .font(PAMFonts.displayPrimary(size: 24, weight: .bold))
                                    .foregroundColor(PAMColors.brandRed)
                                
                                Spacer()
                                
                                Button(action: nextMonth) {
                                    ZStack {
                                        Circle()
                                            .fill(PAMColors.white)
                                            .frame(width: 44, height: 44)
                                            .shadow(
                                                color: PAMShadows.cardShadow.color,
                                                radius: 4,
                                                x: 0,
                                                y: 2
                                            )
                                        
                                        Image(systemName: "chevron.right")
                                            .font(.title2)
                                            .foregroundColor(PAMColors.brandRed)
                                    }
                                }
                            }
                            .padding(.horizontal, PAMSpacing.lg)
                
                            // Calendar Grid
                            PAMCard {
                                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: PAMSpacing.md) {
                                    // Day headers
                                    ForEach(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], id: \.self) { day in
                                        Text(day)
                                            .font(PAMFonts.caption)
                                            .fontWeight(.semibold)
                                            .foregroundColor(PAMColors.brandPink)
                                    }
                                    
                                    // Calendar days
                                    ForEach(Array(daysInMonth.enumerated()), id: \.offset) { _, date in
                                        if let date = date {
                                            EnhancedDayCell(
                                                date: date,
                                                isSelected: calendar.isDate(date, inSameDayAs: selectedDate),
                                                items: items(for: date)
                                            ) {
                                                selectedDate = date
                                            }
                                        } else {
                                            Color.clear
                                                .frame(height: 50)
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, PAMSpacing.lg)
                
                            // Selected Date Items
                            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                HStack {
                                    Text("\(selectedDate, formatter: dateFormatter)")
                                        .font(PAMFonts.headline)
                                        .foregroundColor(PAMColors.brandRed)
                                    
                                    Spacer()
                                    
                                    let selectedItems = items(for: selectedDate)
                                    if !selectedItems.isEmpty {
                                        Text("\(selectedItems.count) items")
                                            .font(PAMFonts.caption)
                                            .foregroundColor(PAMColors.brandPink)
                                            .padding(.horizontal, PAMSpacing.sm)
                                            .padding(.vertical, PAMSpacing.xs)
                                            .background(PAMColors.brandPink.opacity(0.1))
                                            .cornerRadius(PAMRadius.sm)
                                    }
                                }
                                .padding(.horizontal, PAMSpacing.lg)
                                
                                let selectedItems = items(for: selectedDate)
                                if selectedItems.isEmpty {
                                    EmptyCalendarCard()
                                        .padding(.horizontal, PAMSpacing.lg)
                                } else {
                                    ForEach(selectedItems) { item in
                                        EnhancedCalendarItemCard(item: item) {
                                            selectedItem = item
                                            showingItemDetails = true
                                        }
                                        .padding(.horizontal, PAMSpacing.lg)
                                    }
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
            .sheet(isPresented: $showingItemDetails) {
                if let item = selectedItem {
                    ItemDetailSheet(item: item)
                }
            }
        }
    }
    
    func previousMonth() {
        currentMonth = calendar.date(byAdding: .month, value: -1, to: currentMonth) ?? currentMonth
    }
    
    func nextMonth() {
        currentMonth = calendar.date(byAdding: .month, value: 1, to: currentMonth) ?? currentMonth
    }
    
    var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter
    }
}

// MARK: - Enhanced Day Cell
struct EnhancedDayCell: View {
    let date: Date
    let isSelected: Bool
    let items: [ChecklistItem]
    let action: () -> Void
    
    var isToday: Bool {
        Calendar.current.isDateInToday(date)
    }
    
    var hasOverdueItems: Bool {
        items.contains { !$0.isCompleted && ($0.dueDate ?? Date()) < Date() }
    }
    
    var hasCompletedItems: Bool {
        items.contains { $0.isCompleted }
    }
    
    var indicatorColor: Color {
        if hasOverdueItems {
            return PAMColors.errorRed
        } else if hasCompletedItems {
            return PAMColors.successPink
        } else if !items.isEmpty {
            return PAMColors.brandPink
        }
        return Color.clear
    }
    
    var body: some View {
        Button(action: action) {
            ZStack {
                RoundedRectangle(cornerRadius: PAMRadius.md)
                    .fill(isSelected ? PAMColors.brandRed : PAMColors.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: PAMRadius.md)
                            .stroke(isToday ? PAMColors.brandPink : Color.clear, lineWidth: 2)
                    )
                    .shadow(
                        color: isSelected ? PAMShadows.cardShadow.color : Color.clear,
                        radius: isSelected ? 4 : 0,
                        x: 0,
                        y: 2
                    )
                
                VStack(spacing: PAMSpacing.xs) {
                    Text("\(Calendar.current.component(.day, from: date))")
                        .font(PAMFonts.bodyPrimary(size: 16, weight: .medium))
                        .foregroundColor(isSelected ? PAMColors.white : PAMColors.textBody)
                    
                    HStack(spacing: 2) {
                        if !items.isEmpty {
                            Circle()
                                .fill(indicatorColor)
                                .frame(width: 6, height: 6)
                            
                            if items.count > 1 {
                                Text("\(items.count)")
                                    .font(PAMFonts.caption2)
                                    .foregroundColor(isSelected ? PAMColors.white.opacity(0.8) : PAMColors.gray)
                            }
                        }
                    }
                }
            }
            .frame(height: 50)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Enhanced Calendar Item Card
struct EnhancedCalendarItemCard: View {
    let item: ChecklistItem
    let onTap: () -> Void
    
    var statusColor: Color {
        if item.isCompleted {
            return PAMColors.successPink
        } else if let dueDate = item.dueDate, dueDate < Date() {
            return PAMColors.errorRed
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
        Button(action: onTap) {
            HStack(spacing: PAMSpacing.md) {
                // Status indicator
                VStack {
                    ZStack {
                        Circle()
                            .stroke(statusColor, lineWidth: 2)
                            .frame(width: 24, height: 24)
                        
                        if item.isCompleted {
                            Circle()
                                .fill(statusColor)
                                .frame(width: 24, height: 24)
                            
                            Image(systemName: "checkmark")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .foregroundColor(PAMColors.white)
                        }
                    }
                    Spacer()
                }
                
                VStack(alignment: .leading, spacing: PAMSpacing.xs) {
                    HStack {
                        Text(item.title)
                            .font(PAMFonts.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(PAMColors.textBody)
                            .strikethrough(item.isCompleted, color: PAMColors.gray)
                            .multilineTextAlignment(.leading)
                        
                        Spacer()
                        
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
                        Label {
                            Text(item.category.displayName)
                        } icon: {
                            Image(systemName: categoryIcon(for: item.category))
                        }
                        .font(PAMFonts.caption2)
                        .foregroundColor(PAMColors.brandPink)
                        .padding(.horizontal, PAMSpacing.sm)
                        .padding(.vertical, PAMSpacing.xs)
                        .background(PAMColors.brandPink.opacity(0.1))
                        .cornerRadius(PAMRadius.sm)
                        
                        Spacer()
                        
                        if let dueDate = item.dueDate {
                            Text(timeString(for: dueDate))
                                .font(PAMFonts.caption2)
                                .fontWeight(.medium)
                                .foregroundColor(statusColor)
                        }
                    }
                }
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
        .buttonStyle(PlainButtonStyle())
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
    
    func timeString(for date: Date) -> String {
        if Calendar.current.isDateInToday(date) {
            let formatter = DateFormatter()
            formatter.timeStyle = .short
            return "Today \(formatter.string(from: date))"
        } else {
            let formatter = RelativeDateTimeFormatter()
            formatter.unitsStyle = .abbreviated
            return formatter.localizedString(for: date, relativeTo: Date())
        }
    }
}

// MARK: - Empty Calendar Card
struct EmptyCalendarCard: View {
    var body: some View {
        PAMCard {
            VStack(spacing: PAMSpacing.md) {
                Image(systemName: "calendar")
                    .font(.system(size: 48))
                    .foregroundColor(PAMColors.brandPink.opacity(0.6))
                
                Text("No events scheduled")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.brandRed)
                
                Text("Select a different date to view scheduled tasks")
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.gray)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, PAMSpacing.lg)
        }
    }
}

// MARK: - Item Detail Sheet
struct ItemDetailSheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var dataStore: DataStore
    let item: ChecklistItem
    
    var body: some View {
        NavigationView {
            ZStack {
                PAMColors.brandCream
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAMSpacing.lg) {
                        // Item details card
                        PAMCard {
                            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                HStack {
                                    Text(item.title)
                                        .font(PAMFonts.headline)
                                        .foregroundColor(PAMColors.brandRed)
                                    
                                    Spacer()
                                    
                                    Button(action: {
                                        dataStore.toggleChecklistItem(item)
                                        dismiss()
                                    }) {
                                        Image(systemName: item.isCompleted ? "checkmark.circle.fill" : "circle")
                                            .font(.title2)
                                            .foregroundColor(item.isCompleted ? PAMColors.successPink : PAMColors.brandPink)
                                    }
                                }
                                
                                if let description = item.description {
                                    Text(description)
                                        .font(PAMFonts.bodyPrimary(size: 14, weight: .regular))
                                        .foregroundColor(PAMColors.textBody)
                                }
                                
                                HStack {
                                    Label(item.category.displayName, systemImage: categoryIcon(for: item.category))
                                        .font(PAMFonts.caption)
                                        .foregroundColor(PAMColors.brandPink)
                                    
                                    Spacer()
                                    
                                    if let dueDate = item.dueDate {
                                        Text("Due: \(dueDate, formatter: dateFormatter)")
                                            .font(PAMFonts.caption)
                                            .foregroundColor(PAMColors.gray)
                                    }
                                }
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(PAMSpacing.lg)
                }
            }
            .navigationTitle("Task Details")
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
    
    var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }
}

struct CalendarView_Previews: PreviewProvider {
    static var previews: some View {
        CalendarView()
            .environmentObject(DataStore())
    }
}