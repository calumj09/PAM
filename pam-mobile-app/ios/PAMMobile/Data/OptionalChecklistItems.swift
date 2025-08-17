//
//  OptionalChecklistItems.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-16.
//  Optional admin checklist - PAM recommendations
//

import Foundation

struct OptionalChecklistItem {
    let id: String
    let category: OptionalCategory
    let title: String
    let suggestedTiming: String
    let type: TaskType
    let notes: String?
    let link: String?
    
    enum TaskType: String, CaseIterable {
        case checklist = "Checklist"
        case optional = "Optional Checklist"
        case reminder = "Reminder"
        case tracker = "Tracker"
    }
    
    enum OptionalCategory: String, CaseIterable {
        case healthMedical = "Health & Medical"
        case feedingSleep = "Feeding & Sleep"
        case developmentLearning = "Development & Learning"
        case documentationMemories = "Documentation & Memories"
        case safetyPreparation = "Safety & Preparation"
        case financialInsurance = "Financial & Insurance"
        case supportNetwork = "Support Network"
        case lifestyleWellbeing = "Lifestyle & Wellbeing"
        case returnToWork = "Return to Work"
        case legalDocumentation = "Legal & Documentation"
        
        var displayName: String {
            return self.rawValue
        }
        
        var icon: String {
            switch self {
            case .healthMedical: return "heart.fill"
            case .feedingSleep: return "moon.fill"
            case .developmentLearning: return "brain.head.profile"
            case .documentationMemories: return "photo.fill"
            case .safetyPreparation: return "shield.fill"
            case .financialInsurance: return "dollarsign.circle.fill"
            case .supportNetwork: return "person.2.fill"
            case .lifestyleWellbeing: return "figure.walk"
            case .returnToWork: return "briefcase.fill"
            case .legalDocumentation: return "doc.text.fill"
            }
        }
    }
}

struct PAMRecommendations {
    static let items: [OptionalChecklistItem] = [
        // MARK: - Health & Medical
        OptionalChecklistItem(
            id: "private-health-insurance",
            category: .healthMedical,
            title: "Add baby to private health insurance",
            suggestedTiming: "Within 30 days of birth",
            type: .optional,
            notes: "Call your health fund to add baby to your policy",
            link: nil
        ),
        OptionalChecklistItem(
            id: "baby-chiropractor",
            category: .healthMedical,
            title: "Book baby chiropractor",
            suggestedTiming: "6-8 weeks",
            type: .optional,
            notes: "Craniosacral therapy can help with feeding and sleeping issues",
            link: nil
        ),
        OptionalChecklistItem(
            id: "osteopath-visit",
            category: .healthMedical,
            title: "Visit osteopath for birth trauma",
            suggestedTiming: "2-6 weeks",
            type: .optional,
            notes: "Can help with reflux, colic, and feeding difficulties",
            link: nil
        ),
        OptionalChecklistItem(
            id: "dentist-checkup",
            category: .healthMedical,
            title: "Book first dentist visit",
            suggestedTiming: "6 months or first tooth",
            type: .optional,
            notes: "Early dental health assessment and advice",
            link: nil
        ),
        OptionalChecklistItem(
            id: "paediatrician-visit",
            category: .healthMedical,
            title: "Book paediatrician visit",
            suggestedTiming: "6-8 weeks",
            type: .optional,
            notes: "For ongoing specialist care if needed",
            link: nil
        ),
        
        // MARK: - Feeding & Sleep
        OptionalChecklistItem(
            id: "lactation-consultant",
            category: .feedingSleep,
            title: "Book a lactation consultant",
            suggestedTiming: "Within first 2 weeks",
            type: .optional,
            notes: "Professional breastfeeding support if needed",
            link: nil
        ),
        OptionalChecklistItem(
            id: "milk-supply-tracker",
            category: .feedingSleep,
            title: "Track milk supply",
            suggestedTiming: "First 6 weeks",
            type: .tracker,
            notes: "Monitor feeding patterns and milk production",
            link: nil
        ),
        OptionalChecklistItem(
            id: "sleep-consultant",
            category: .feedingSleep,
            title: "Consider sleep consultant",
            suggestedTiming: "4-6 months",
            type: .optional,
            notes: "Professional help with sleep training if needed",
            link: nil
        ),
        OptionalChecklistItem(
            id: "feeding-schedule",
            category: .feedingSleep,
            title: "Establish feeding routine",
            suggestedTiming: "2-4 weeks",
            type: .reminder,
            notes: "Work towards consistent feeding times",
            link: nil
        ),
        OptionalChecklistItem(
            id: "solid-food-prep",
            category: .feedingSleep,
            title: "Prepare for solid foods",
            suggestedTiming: "5-6 months",
            type: .checklist,
            notes: "High chair, bibs, first foods, baby-led weaning resources",
            link: nil
        ),
        
        // MARK: - Development & Learning
        OptionalChecklistItem(
            id: "baby-massage-class",
            category: .developmentLearning,
            title: "Attend baby massage class",
            suggestedTiming: "6-12 weeks",
            type: .optional,
            notes: "Bonding and developmental benefits",
            link: nil
        ),
        OptionalChecklistItem(
            id: "swimming-lessons",
            category: .developmentLearning,
            title: "Book baby swimming lessons",
            suggestedTiming: "3-6 months",
            type: .optional,
            notes: "Water safety and development",
            link: nil
        ),
        OptionalChecklistItem(
            id: "reading-routine",
            category: .developmentLearning,
            title: "Start daily reading routine",
            suggestedTiming: "From birth",
            type: .reminder,
            notes: "Language development and bonding",
            link: nil
        ),
        OptionalChecklistItem(
            id: "tummy-time-schedule",
            category: .developmentLearning,
            title: "Establish tummy time routine",
            suggestedTiming: "From 2 weeks",
            type: .reminder,
            notes: "Start with 2-3 minutes, increase gradually",
            link: nil
        ),
        OptionalChecklistItem(
            id: "music-class",
            category: .developmentLearning,
            title: "Join baby music class",
            suggestedTiming: "3-6 months",
            type: .optional,
            notes: "Sensory development and social interaction",
            link: nil
        ),
        
        // MARK: - Documentation & Memories
        OptionalChecklistItem(
            id: "baby-book",
            category: .documentationMemories,
            title: "Start baby book/journal",
            suggestedTiming: "From birth",
            type: .optional,
            notes: "Record milestones, firsts, and memories",
            link: nil
        ),
        OptionalChecklistItem(
            id: "monthly-photos",
            category: .documentationMemories,
            title: "Take monthly milestone photos",
            suggestedTiming: "Monthly",
            type: .reminder,
            notes: "Document growth and development",
            link: nil
        ),
        OptionalChecklistItem(
            id: "handprint-footprint",
            category: .documentationMemories,
            title: "Create handprint/footprint keepsakes",
            suggestedTiming: "1 month, 6 months, 1 year",
            type: .optional,
            notes: "Precious memories as baby grows",
            link: nil
        ),
        OptionalChecklistItem(
            id: "video-diary",
            category: .documentationMemories,
            title: "Record video diary",
            suggestedTiming: "Weekly/Monthly",
            type: .optional,
            notes: "Capture baby's development and your journey",
            link: nil
        ),
        
        // MARK: - Safety & Preparation
        OptionalChecklistItem(
            id: "car-seat-check",
            category: .safetyPreparation,
            title: "Car seat safety check",
            suggestedTiming: "Before hospital discharge",
            type: .checklist,
            notes: "Professional installation check at service centre",
            link: nil
        ),
        OptionalChecklistItem(
            id: "baby-proofing",
            category: .safetyPreparation,
            title: "Baby-proof the house",
            suggestedTiming: "4-6 months",
            type: .checklist,
            notes: "Before baby becomes mobile",
            link: nil
        ),
        OptionalChecklistItem(
            id: "first-aid-course",
            category: .safetyPreparation,
            title: "Complete baby first aid course",
            suggestedTiming: "Before birth or first 3 months",
            type: .optional,
            notes: "Essential safety knowledge for parents",
            link: nil
        ),
        OptionalChecklistItem(
            id: "emergency-contacts",
            category: .safetyPreparation,
            title: "Create emergency contact list",
            suggestedTiming: "First week",
            type: .checklist,
            notes: "Doctor, hospital, poison control, family",
            link: nil
        ),
        OptionalChecklistItem(
            id: "baby-monitor-setup",
            category: .safetyPreparation,
            title: "Set up baby monitor",
            suggestedTiming: "Before 3 months",
            type: .optional,
            notes: "For peace of mind during sleep",
            link: nil
        ),
        
        // MARK: - Financial & Insurance
        OptionalChecklistItem(
            id: "baby-savings-account",
            category: .financialInsurance,
            title: "Open baby savings account",
            suggestedTiming: "First 3 months",
            type: .optional,
            notes: "Start saving for baby's future",
            link: nil
        ),
        OptionalChecklistItem(
            id: "education-fund",
            category: .financialInsurance,
            title: "Consider education fund/investment",
            suggestedTiming: "First year",
            type: .optional,
            notes: "Long-term education savings plan",
            link: nil
        ),
        OptionalChecklistItem(
            id: "life-insurance-review",
            category: .financialInsurance,
            title: "Review life insurance coverage",
            suggestedTiming: "First 3 months",
            type: .optional,
            notes: "Ensure adequate family protection",
            link: nil
        ),
        OptionalChecklistItem(
            id: "will-update",
            category: .financialInsurance,
            title: "Update will and beneficiaries",
            suggestedTiming: "First 6 months",
            type: .checklist,
            notes: "Include baby in estate planning",
            link: nil
        ),
        
        // MARK: - Support Network
        OptionalChecklistItem(
            id: "mothers-group",
            category: .supportNetwork,
            title: "Join local mothers group",
            suggestedTiming: "6-12 weeks",
            type: .optional,
            notes: "Connect with other new parents",
            link: nil
        ),
        OptionalChecklistItem(
            id: "playgroup-research",
            category: .supportNetwork,
            title: "Research local playgroups",
            suggestedTiming: "6-12 months",
            type: .optional,
            notes: "Social development for baby and support for you",
            link: nil
        ),
        OptionalChecklistItem(
            id: "babysitter-network",
            category: .supportNetwork,
            title: "Build babysitter network",
            suggestedTiming: "3-6 months",
            type: .optional,
            notes: "Reliable childcare for date nights and emergencies",
            link: nil
        ),
        OptionalChecklistItem(
            id: "grandparent-support",
            category: .supportNetwork,
            title: "Establish grandparent routines",
            suggestedTiming: "First 3 months",
            type: .optional,
            notes: "Regular visits and support arrangements",
            link: nil
        ),
        
        // MARK: - Lifestyle & Wellbeing
        OptionalChecklistItem(
            id: "postnatal-exercise",
            category: .lifestyleWellbeing,
            title: "Start postnatal exercise program",
            suggestedTiming: "6-8 weeks",
            type: .optional,
            notes: "Get medical clearance first",
            link: nil
        ),
        OptionalChecklistItem(
            id: "mental-health-check",
            category: .lifestyleWellbeing,
            title: "Mental health check-in",
            suggestedTiming: "6 weeks, 3 months, 6 months",
            type: .reminder,
            notes: "Monitor postnatal depression and anxiety",
            link: nil
        ),
        OptionalChecklistItem(
            id: "couple-time",
            category: .lifestyleWellbeing,
            title: "Schedule regular couple time",
            suggestedTiming: "From 3 months",
            type: .reminder,
            notes: "Maintain relationship during transition",
            link: nil
        ),
        OptionalChecklistItem(
            id: "self-care-routine",
            category: .lifestyleWellbeing,
            title: "Establish self-care routine",
            suggestedTiming: "Ongoing",
            type: .reminder,
            notes: "Your wellbeing matters too",
            link: nil
        ),
        
        // MARK: - Return to Work
        OptionalChecklistItem(
            id: "childcare-research",
            category: .returnToWork,
            title: "Research childcare options",
            suggestedTiming: "3-6 months before return",
            type: .checklist,
            notes: "Childcare centres, family daycare, nannies",
            link: nil
        ),
        OptionalChecklistItem(
            id: "childcare-waitlists",
            category: .returnToWork,
            title: "Join childcare waitlists",
            suggestedTiming: "During pregnancy or early infancy",
            type: .checklist,
            notes: "Popular centres have long waiting lists",
            link: nil
        ),
        OptionalChecklistItem(
            id: "work-transition-plan",
            category: .returnToWork,
            title: "Plan return to work transition",
            suggestedTiming: "1-2 months before return",
            type: .checklist,
            notes: "Gradual introduction to childcare, pumping schedule",
            link: nil
        ),
        OptionalChecklistItem(
            id: "breastfeeding-work-prep",
            category: .returnToWork,
            title: "Prepare for breastfeeding at work",
            suggestedTiming: "1 month before return",
            type: .optional,
            notes: "Pump, storage bags, workplace facilities",
            link: nil
        ),
        
        // MARK: - Legal & Documentation
        OptionalChecklistItem(
            id: "emergency-care-authorisation",
            category: .legalDocumentation,
            title: "Complete emergency care authorisation",
            suggestedTiming: "Before leaving baby with others",
            type: .optional,
            notes: "Medical consent for caregivers",
            link: nil
        )
    ]
    
    static func getItemsByCategory(_ category: OptionalChecklistItem.OptionalCategory) -> [OptionalChecklistItem] {
        return items.filter { $0.category == category }
    }
}