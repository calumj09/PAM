//
//  OptionalItemsView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-16.
//  Browse and add PAM recommended optional tasks
//

import SwiftUI

struct OptionalItemsView: View {
    @Environment(\.dismiss) var dismiss
    @State private var selectedCategory: OptionalChecklistItem.OptionalCategory = .healthMedical
    @State private var selectedItems: Set<String> = []
    let onAdd: (OptionalChecklistItem) -> Void
    
    var body: some View {
        NavigationView {
            ZStack {
                PAMColors.brandCream
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Header
                    VStack(spacing: PAMSpacing.md) {
                        Text("PAM Recommendations")
                            .font(PAMFonts.displayPrimary(size: 28, weight: .bold))
                            .foregroundColor(PAMColors.brandRed)
                        
                        Text("Expert-curated tasks to help you stay organized")
                            .font(PAMFonts.subheadline)
                            .foregroundColor(PAMColors.gray)
                            .multilineTextAlignment(.center)
                        
                        if !selectedItems.isEmpty {
                            Text("\(selectedItems.count) items selected")
                                .font(PAMFonts.caption)
                                .foregroundColor(PAMColors.brandPink)
                                .padding(.horizontal, PAMSpacing.md)
                                .padding(.vertical, PAMSpacing.xs)
                                .background(PAMColors.brandPink.opacity(0.1))
                                .cornerRadius(PAMRadius.sm)
                        }
                    }
                    .padding(PAMSpacing.lg)
                    .background(PAMColors.white)
                    
                    // Category Selector
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: PAMSpacing.sm) {
                            ForEach(OptionalChecklistItem.OptionalCategory.allCases, id: \.self) { category in
                                CategoryButton(
                                    category: category,
                                    isSelected: selectedCategory == category,
                                    action: { selectedCategory = category }
                                )
                            }
                        }
                        .padding(.horizontal, PAMSpacing.lg)
                    }
                    .padding(.vertical, PAMSpacing.md)
                    .background(PAMColors.white)
                    
                    // Items List
                    ScrollView {
                        VStack(spacing: PAMSpacing.md) {
                            let items = PAMRecommendations.getItemsByCategory(selectedCategory)
                            
                            ForEach(items, id: \.id) { item in
                                OptionalItemCard(
                                    item: item,
                                    isSelected: selectedItems.contains(item.id),
                                    onToggle: {
                                        if selectedItems.contains(item.id) {
                                            selectedItems.remove(item.id)
                                        } else {
                                            selectedItems.insert(item.id)
                                        }
                                    }
                                )
                            }
                            
                            // Bottom padding
                            Color.clear.frame(height: PAMSpacing.xxxl)
                        }
                        .padding(PAMSpacing.lg)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(PAMColors.brandRed)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add Selected") {
                        addSelectedItems()
                        dismiss()
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(PAMColors.brandRed)
                    .disabled(selectedItems.isEmpty)
                }
            }
        }
    }
    
    private func addSelectedItems() {
        for itemId in selectedItems {
            if let item = PAMRecommendations.items.first(where: { $0.id == itemId }) {
                onAdd(item)
            }
        }
    }
}

// MARK: - Category Button
struct CategoryButton: View {
    let category: OptionalChecklistItem.OptionalCategory
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: PAMSpacing.xs) {
                ZStack {
                    Circle()
                        .fill(isSelected ? PAMColors.brandRed : PAMColors.brandPink.opacity(0.1))
                        .frame(width: 56, height: 56)
                    
                    Image(systemName: category.icon)
                        .font(.title2)
                        .foregroundColor(isSelected ? PAMColors.white : PAMColors.brandRed)
                }
                
                Text(category.displayName)
                    .font(PAMFonts.caption2)
                    .foregroundColor(isSelected ? PAMColors.brandRed : PAMColors.gray)
                    .multilineTextAlignment(.center)
                    .frame(width: 80)
            }
        }
    }
}

// MARK: - Optional Item Card
struct OptionalItemCard: View {
    let item: OptionalChecklistItem
    let isSelected: Bool
    let onToggle: () -> Void
    
    var typeColor: Color {
        switch item.type {
        case .checklist:
            return PAMColors.brandRed
        case .optional:
            return PAMColors.brandPink
        case .reminder:
            return Color.orange
        case .tracker:
            return Color.blue
        }
    }
    
    var typeIcon: String {
        switch item.type {
        case .checklist:
            return "checkmark.circle.fill"
        case .optional:
            return "questionmark.circle.fill"
        case .reminder:
            return "bell.fill"
        case .tracker:
            return "chart.bar.fill"
        }
    }
    
    var body: some View {
        Button(action: onToggle) {
            HStack(spacing: PAMSpacing.md) {
                // Selection Checkbox
                ZStack {
                    Circle()
                        .stroke(isSelected ? PAMColors.brandRed : PAMColors.gray, lineWidth: 2)
                        .frame(width: 24, height: 24)
                    
                    if isSelected {
                        Circle()
                            .fill(PAMColors.brandRed)
                            .frame(width: 24, height: 24)
                        
                        Image(systemName: "checkmark")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(PAMColors.white)
                    }
                }
                
                // Item Icon
                ZStack {
                    RoundedRectangle(cornerRadius: PAMRadius.md)
                        .fill(typeColor.opacity(0.1))
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: typeIcon)
                        .foregroundColor(typeColor)
                }
                
                VStack(alignment: .leading, spacing: PAMSpacing.xs) {
                    Text(item.title)
                        .font(PAMFonts.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(PAMColors.textBody)
                        .multilineTextAlignment(.leading)
                    
                    if let notes = item.notes {
                        Text(notes)
                            .font(PAMFonts.caption)
                            .foregroundColor(PAMColors.gray)
                            .lineLimit(2)
                            .multilineTextAlignment(.leading)
                    }
                    
                    HStack {
                        Label(item.type.rawValue, systemImage: typeIcon)
                            .font(PAMFonts.caption2)
                            .foregroundColor(typeColor)
                        
                        Text("•")
                            .foregroundColor(PAMColors.gray)
                        
                        Text(item.suggestedTiming)
                            .font(PAMFonts.caption2)
                            .foregroundColor(PAMColors.gray)
                    }
                }
                
                Spacer()
            }
            .padding(PAMSpacing.lg)
            .background(PAMColors.white)
            .cornerRadius(PAMRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: PAMRadius.lg)
                    .stroke(isSelected ? PAMColors.brandRed : Color.clear, lineWidth: 2)
            )
            .shadow(
                color: PAMShadows.cardShadow.color,
                radius: PAMShadows.cardShadow.radius,
                x: PAMShadows.cardShadow.x,
                y: PAMShadows.cardShadow.y
            )
        }
    }
}

// MARK: - Add Custom Item View
struct AddCustomItemView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var dataStore: DataStore
    
    @State private var title = ""
    @State private var description = ""
    @State private var category = ChecklistCategory.milestone
    @State private var hasDueDate = true
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
                                Label("Task Details", systemImage: "pencil.circle.fill")
                                    .font(PAMFonts.headline)
                                    .foregroundColor(PAMColors.brandRed)
                                
                                PAMTextField(
                                    placeholder: "Task title",
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
                                        CategorySelectionButton(
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
            .navigationTitle("Add Custom Task")
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
                                childId: firstChild.id,
                                source: "custom"
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

// MARK: - Category Selection Button
struct CategorySelectionButton: View {
    let category: ChecklistCategory
    let isSelected: Bool
    let action: () -> Void
    
    var icon: String {
        switch category {
        case .immunization:
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

struct OptionalItemsView_Previews: PreviewProvider {
    static var previews: some View {
        OptionalItemsView { _ in }
    }
}