//
//  DataStore.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//

import Foundation
import Combine
import CoreData

class DataStore: ObservableObject {
    @Published var children: [Child] = []
    @Published var checklistItems: [ChecklistItem] = []
    @Published var trackerEntries: [TrackerEntry] = []
    
    private let container: NSPersistentContainer
    
    init() {
        container = NSPersistentContainer(name: "PAMData")
        container.loadPersistentStores { _, error in
            if let error = error {
                print("Core Data failed to load: \(error.localizedDescription)")
            }
        }
        
        loadData()
    }
    
    func loadData() {
        loadChildren()
        loadChecklistItems()
        loadTrackerEntries()
    }
    
    // MARK: - Children Management
    
    func addChild(name: String, dateOfBirth: Date) {
        let child = Child(name: name, dateOfBirth: dateOfBirth)
        children.append(child)
        saveContext()
    }
    
    func updateChild(_ child: Child) {
        if let index = children.firstIndex(where: { $0.id == child.id }) {
            children[index] = child
            saveContext()
        }
    }
    
    func deleteChild(_ child: Child) {
        children.removeAll { $0.id == child.id }
        saveContext()
    }
    
    // MARK: - Checklist Management
    
    func addChecklistItem(title: String, description: String?, dueDate: Date?, category: ChecklistCategory, childId: String, source: String = "custom") {
        let item = ChecklistItem(
            title: title,
            description: description,
            dueDate: dueDate,
            category: category,
            childId: childId,
            source: source
        )
        checklistItems.append(item)
        saveContext()
    }
    
    // Generate default checklist items for a child
    func generateDefaultChecklistForChild(_ child: Child) {
        let defaultItems = AustralianChecklist.getChecklistForChild(birthDate: child.dateOfBirth)
        
        for defaultItem in defaultItems {
            let dueDate = AustralianChecklist.calculateDueDate(birthDate: child.dateOfBirth, item: defaultItem)
            
            // Check if item already exists
            let exists = checklistItems.contains { item in
                item.childId == child.id && item.title == defaultItem.title
            }
            
            if !exists {
                addChecklistItem(
                    title: defaultItem.title,
                    description: defaultItem.description,
                    dueDate: dueDate,
                    category: defaultItem.category,
                    childId: child.id,
                    source: "default"
                )
            }
        }
    }
    
    // Add optional PAM recommendation
    func addOptionalChecklistItem(_ optionalItem: OptionalChecklistItem, for child: Child) {
        let dueDate = calculateDueDateForOptionalItem(optionalItem, birthDate: child.dateOfBirth)
        
        addChecklistItem(
            title: optionalItem.title,
            description: optionalItem.notes ?? optionalItem.suggestedTiming,
            dueDate: dueDate,
            category: .milestone, // Use milestone for optional items
            childId: child.id,
            source: "pam_recommendation"
        )
    }
    
    private func calculateDueDateForOptionalItem(_ item: OptionalChecklistItem, birthDate: Date) -> Date {
        let timing = item.suggestedTiming.lowercased()
        let calendar = Calendar.current
        
        // Parse timing string to calculate due date
        if timing.contains("week") {
            if let weeks = extractNumber(from: timing) {
                return calendar.date(byAdding: .weekOfYear, value: weeks, to: birthDate) ?? birthDate
            }
        } else if timing.contains("month") {
            if let months = extractNumber(from: timing) {
                return calendar.date(byAdding: .month, value: months, to: birthDate) ?? birthDate
            }
        } else if timing.contains("year") {
            if let years = extractNumber(from: timing) {
                return calendar.date(byAdding: .year, value: years, to: birthDate) ?? birthDate
            }
        } else if timing.contains("birth") || timing.contains("immediately") {
            return calendar.date(byAdding: .weekOfYear, value: 1, to: birthDate) ?? birthDate
        }
        
        // Default to 2 months if unable to parse
        return calendar.date(byAdding: .month, value: 2, to: birthDate) ?? birthDate
    }
    
    private func extractNumber(from string: String) -> Int? {
        let pattern = "\\d+"
        if let regex = try? NSRegularExpression(pattern: pattern),
           let match = regex.firstMatch(in: string, range: NSRange(string.startIndex..., in: string)),
           let range = Range(match.range, in: string) {
            return Int(string[range])
        }
        return nil
    }
    
    func toggleChecklistItem(_ item: ChecklistItem) {
        if let index = checklistItems.firstIndex(where: { $0.id == item.id }) {
            checklistItems[index].isCompleted.toggle()
            checklistItems[index].completedDate = checklistItems[index].isCompleted ? Date() : nil
            saveContext()
        }
    }
    
    // MARK: - Tracker Management
    
    func addTrackerEntry(type: TrackerType, childId: String, notes: String? = nil) {
        let entry = TrackerEntry(type: type, childId: childId, notes: notes)
        trackerEntries.append(entry)
        saveContext()
    }
    
    // MARK: - Private Methods
    
    private func loadChildren() {
        // Load from Core Data
        // For now, using demo data
        children = [
            Child(name: "Emma", dateOfBirth: Date().addingTimeInterval(-60*60*24*90))
        ]
    }
    
    private func loadChecklistItems() {
        // Load from Core Data
        // For now, using demo data
        checklistItems = [
            ChecklistItem(
                title: "2-month immunisations",
                description: "DTP, Polio, Hib, Hepatitis B",
                dueDate: Date().addingTimeInterval(60*60*24),
                category: .immunisation,
                childId: children.first?.id ?? ""
            ),
            ChecklistItem(
                title: "Birth certificate registration",
                description: "Register birth with Births, Deaths and Marriages",
                dueDate: Date().addingTimeInterval(60*60*24*7),
                category: .registration,
                childId: children.first?.id ?? ""
            )
        ]
    }
    
    private func loadTrackerEntries() {
        // Load from Core Data
        // For now, using demo data
        trackerEntries = []
    }
    
    private func saveContext() {
        do {
            try container.viewContext.save()
        } catch {
            print("Failed to save context: \(error.localizedDescription)")
        }
    }
}

// MARK: - Models

struct Child: Identifiable, Codable {
    let id: String
    var name: String
    var dateOfBirth: Date
    var gender: Gender?
    var profileImage: String?
    
    init(id: String = UUID().uuidString, name: String, dateOfBirth: Date, gender: Gender? = nil, profileImage: String? = nil) {
        self.id = id
        self.name = name
        self.dateOfBirth = dateOfBirth
        self.gender = gender
        self.profileImage = profileImage
    }
    
    enum Gender: String, Codable, CaseIterable {
        case male = "Male"
        case female = "Female"
        case other = "Other"
    }
}

struct ChecklistItem: Identifiable, Codable {
    let id: String
    var title: String
    var description: String?
    var dueDate: Date?
    var category: ChecklistCategory
    var childId: String
    var isCompleted: Bool
    var completedDate: Date?
    var source: String // "default", "pam_recommendation", or "custom"
    
    init(id: String = UUID().uuidString, title: String, description: String? = nil, dueDate: Date? = nil, category: ChecklistCategory, childId: String, isCompleted: Bool = false, completedDate: Date? = nil, source: String = "custom") {
        self.id = id
        self.title = title
        self.description = description
        self.dueDate = dueDate
        self.category = category
        self.childId = childId
        self.isCompleted = isCompleted
        self.completedDate = completedDate
        self.source = source
    }
}

enum ChecklistCategory: String, Codable, CaseIterable {
    case immunisation = "Immunisation"
    case registration = "Registration"
    case milestone = "Milestone"
    case checkup = "Checkup"
}

struct TrackerEntry: Identifiable, Codable {
    let id: String
    var type: TrackerType
    var timestamp: Date
    var childId: String
    var notes: String?
    var quantity: Double?
    var duration: TimeInterval?
    
    init(id: String = UUID().uuidString, type: TrackerType, timestamp: Date = Date(), childId: String, notes: String? = nil, quantity: Double? = nil, duration: TimeInterval? = nil) {
        self.id = id
        self.type = type
        self.timestamp = timestamp
        self.childId = childId
        self.notes = notes
        self.quantity = quantity
        self.duration = duration
    }
}

enum TrackerType: String, Codable, CaseIterable {
    case feeding = "Feeding"
    case sleep = "Sleep"
    case diaper = "Nappy"
    case activity = "Activity"
    case medication = "Medication"
    case temperature = "Temperature"
    case weight = "Weight"
    case height = "Height"
    case headCircumference = "Head Circumference"
    
    static var dailyTracking: [TrackerType] {
        [.feeding, .sleep, .diaper, .activity, .medication, .temperature]
    }
    
    static var growthMeasurements: [TrackerType] {
        [.weight, .height, .headCircumference]
    }
}