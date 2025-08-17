//
//  TimelineView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//  Updated with PAM Design System on 2025-08-15.
//

import SwiftUI

struct TimelineView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var selectedFilter: ChecklistCategory?
    @State private var showingAddItem = false
    
    var filteredItems: [ChecklistItem] {
        if let filter = selectedFilter {
            return dataStore.checklistItems.filter { $0.category == filter }
        }
        return dataStore.checklistItems
    }
    
    var completionRate: Double {
        guard !dataStore.checklistItems.isEmpty else { return 0 }
        let completed = dataStore.checklistItems.filter { $0.isCompleted }.count
        return Double(completed) / Double(dataStore.checklistItems.count)
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // PAM Brand Background
                PAMColors.brandRed
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    PAMHeader(title: "Timeline", showProfile: true, showSettings: false)
                    
                    ScrollView {
                        VStack(spacing: PAMSpacing.lg) {
                            // Progress Card
                            ProgressCard(completionRate: completionRate)
                            
                            // Filter Pills
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: PAMSpacing.md) {
                                    FilterPill(title: "All", isSelected: selectedFilter == nil) {
                                        withAnimation(.easeInOut) {
                                            selectedFilter = nil
                                        }
                                    }
                                    
                                    ForEach(ChecklistCategory.allCases, id: \.self) { category in
                                        FilterPill(
                                            title: category.displayName,
                                            icon: categoryIcon(for: category),
                                            isSelected: selectedFilter == category
                                        ) {
                                            withAnimation(.easeInOut) {
                                                selectedFilter = category
                                            }
                                        }
                                    }
                                }
                                .padding(.horizontal, PAMSpacing.lg)
                            }
                            
                            // Timeline Items
                            VStack(spacing: PAMSpacing.md) {
                                if filteredItems.isEmpty {
                                    EmptyStateCard()
                                } else {
                                    ForEach(filteredItems) { item in
                                        TimelineItemCard(item: item) {
                                            withAnimation(.spring()) {
                                                dataStore.toggleChecklistItem(item)
                                            }
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, PAMSpacing.lg)
                            
                            // Bottom padding
                            Color.clear.frame(height: PAMSpacing.xxxl)
                        }
                        .padding(.top, PAMSpacing.lg)
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
                        Button(action: { showingAddItem = true }) {
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
            .sheet(isPresented: $showingAddItem) {
                AddChecklistItemView()
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
}

// MARK: - Progress Card
struct ProgressCard: View {
    let completionRate: Double
    
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
                    Text("Overall Progress")
                        .font(PAMFonts.headline)
                        .foregroundColor(PAMColors.brandRed)
                    
                    Spacer()
                    
                    Text("\(Int(completionRate * 100))%")
                        .font(PAMFonts.title2)
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
                        .frame(width: max(0, CGFloat(completionRate) * (UIScreen.main.bounds.width - PAMSpacing.lg * 4)), height: 12)
                }
                
                Text(progressMessage)
                    .font(PAMFonts.subheadline)
                    .foregroundColor(PAMColors.brandPink)
            }
        }
        .padding(.horizontal, PAMSpacing.lg)
    }
}

// MARK: - Filter Pill
struct FilterPill: View {
    let title: String
    var icon: String? = nil
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: PAMSpacing.xs) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.caption)
                }
                Text(title)
                    .font(PAMFonts.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .foregroundColor(isSelected ? PAMColors.white : PAMColors.brandRed)
            .padding(.horizontal, PAMSpacing.lg)
            .padding(.vertical, PAMSpacing.sm)
            .background(
                isSelected ? PAMColors.brandRed : PAMColors.white
            )
            .cornerRadius(PAMRadius.xxl)
            .overlay(
                RoundedRectangle(cornerRadius: PAMRadius.xxl)
                    .stroke(isSelected ? PAMColors.brandRed : PAMColors.brandPink.opacity(0.3), lineWidth: 1)
            )
            .scaleEffect(isSelected ? 1.05 : 1.0)
            .animation(.spring(response: 0.3), value: isSelected)
        }
    }
}

// MARK: - Timeline Item Card
struct TimelineItemCard: View {
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
                    Text(item.title)
                        .font(PAMFonts.bodyPrimary(size: 15, weight: .semibold))
                        .foregroundColor(PAMColors.textBody)
                        .strikethrough(item.isCompleted, color: PAMColors.gray)
                        .multilineTextAlignment(.leading)
                    
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
                        .padding(.horizontal, PAMSpacing.sm)
                        .padding(.vertical, PAMSpacing.xs)
                        .background(PAMColors.brandPink.opacity(0.1))
                        .cornerRadius(PAMRadius.sm)
                        
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
                
                Image(systemName: "chevron.right")
                    .font(.caption)
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

// MARK: - Empty State Card
struct EmptyStateCard: View {
    var body: some View {
        PAMCard {
            VStack(spacing: PAMSpacing.lg) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 48))
                    .foregroundColor(PAMColors.brandPink)
                
                Text("No items yet")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.brandRed)
                
                Text("Tap the + button to add your first timeline item")
                    .font(PAMFonts.subheadline)
                    .foregroundColor(PAMColors.gray)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, PAMSpacing.xl)
        }
    }
}

// MARK: - Add Checklist Item View
struct AddChecklistItemView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var dataStore: DataStore
    
    @State private var title = ""
    @State private var description = ""
    @State private var category = ChecklistCategory.milestone
    @State private var hasDueDate = false
    @State private var dueDate = Date()
    
    var body: some View {
        NavigationView {
            ZStack {
                PAMColors.brandCream
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAMSpacing.lg) {
                        // Title Section
                        PAMCard {
                            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                Label("Item Details", systemImage: "pencil.circle.fill")
                                    .font(PAMFonts.headline)
                                    .foregroundColor(PAMColors.brandRed)
                                
                                PAMTextField(
                                    placeholder: "Title",
                                    text: $title,
                                    icon: "text.cursor"
                                )
                                
                                VStack(alignment: .leading) {
                                    HStack {
                                        Image(systemName: "text.alignleft")
                                            .foregroundColor(PAMColors.brandRed)
                                            .frame(width: 20)
                                        Text("Description (optional)")
                                            .font(PAMFonts.caption)
                                            .foregroundColor(PAMColors.gray)
                                    }
                                    .padding(.horizontal, PAMSpacing.md)
                                    
                                    TextEditor(text: $description)
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
                        
                        // Category Section
                        PAMCard {
                            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                Label("Category", systemImage: "folder.fill")
                                    .font(PAMFonts.headline)
                                    .foregroundColor(PAMColors.brandRed)
                                
                                VStack(spacing: PAMSpacing.sm) {
                                    ForEach(ChecklistCategory.allCases, id: \.self) { cat in
                                        CategoryButton(
                                            category: cat,
                                            isSelected: category == cat,
                                            action: { category = cat }
                                        )
                                    }
                                }
                            }
                        }
                        
                        // Due Date Section
                        PAMCard {
                            VStack(alignment: .leading, spacing: PAMSpacing.md) {
                                Label("Due Date", systemImage: "calendar")
                                    .font(PAMFonts.headline)
                                    .foregroundColor(PAMColors.brandRed)
                                
                                Toggle(isOn: $hasDueDate) {
                                    Text("Set due date")
                                        .font(PAMFonts.bodyPrimary(size: 14, weight: .regular))
                                }
                                .tint(PAMColors.brandPink)
                                
                                if hasDueDate {
                                    DatePicker(
                                        "Due date",
                                        selection: $dueDate,
                                        displayedComponents: .date
                                    )
                                    .datePickerStyle(GraphicalDatePickerStyle())
                                    .accentColor(PAMColors.brandRed)
                                }
                            }
                        }
                        
                        // Bottom padding
                        Color.clear.frame(height: PAMSpacing.xxxl)
                    }
                    .padding(PAMSpacing.lg)
                }
            }
            .navigationTitle("Add Timeline Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(PAMColors.brandRed)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        if let firstChild = dataStore.children.first {
                            dataStore.addChecklistItem(
                                title: title,
                                description: description.isEmpty ? nil : description,
                                dueDate: hasDueDate ? dueDate : nil,
                                category: category,
                                childId: firstChild.id
                            )
                        }
                        dismiss()
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(PAMColors.brandRed)
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}

// MARK: - Category Button
struct CategoryButton: View {
    let category: ChecklistCategory
    let isSelected: Bool
    let action: () -> Void
    
    var icon: String {
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
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(isSelected ? PAMColors.white : PAMColors.brandRed)
                
                Text(category.displayName)
                    .font(PAMFonts.bodyPrimary(size: 14, weight: .medium))
                    .foregroundColor(isSelected ? PAMColors.white : PAMColors.textBody)
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(PAMColors.white)
                }
            }
            .padding(PAMSpacing.md)
            .background(isSelected ? PAMColors.brandRed : PAMColors.white)
            .cornerRadius(PAMRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: PAMRadius.md)
                    .stroke(isSelected ? PAMColors.brandRed : PAMColors.brandPink.opacity(0.2), lineWidth: 1)
            )
        }
    }
}

// MARK: - Checklist Category Extension
extension ChecklistCategory {
    var displayName: String {
        switch self {
        case .immunisation:
            return "Immunization"
        case .registration:
            return "Registration"
        case .milestone:
            return "Milestone"
        case .checkup:
            return "Check-up"
        }
    }
}

struct TimelineView_Previews: PreviewProvider {
    static var previews: some View {
        TimelineView()
            .environmentObject(DataStore())
    }
}