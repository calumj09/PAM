//
//  AustralianChecklistItems.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-16.
//  Australian Immunisation Schedule and Key Milestones for 0-3 years
//  Source: Australian Government Department of Health
//

import Foundation

struct DefaultChecklistItem {
    let id: String
    let title: String
    let description: String
    let category: ChecklistCategory
    let dueAtMonths: Double
    let notifyDaysBefore: [Int]
    let links: [(title: String, url: String)]?
}

struct AustralianChecklist {
    static let items: [DefaultChecklistItem] = [
        // MARK: - Birth Registrations
        DefaultChecklistItem(
            id: "birth-certificate",
            title: "Apply for Birth Certificate",
            description: "Register your baby's birth with Births, Deaths and Marriages in your state/territory",
            category: .registration,
            dueAtMonths: 0.5,
            notifyDaysBefore: [7, 1],
            links: [(title: "Find your state registry", url: "https://www.australia.gov.au/information-and-services/family-and-community/births-deaths-and-marriages")]
        ),
        DefaultChecklistItem(
            id: "medicare-enrollment",
            title: "Enroll in Medicare",
            description: "Register your baby for Medicare to access healthcare benefits",
            category: .registration,
            dueAtMonths: 0.25,
            notifyDaysBefore: [3, 1],
            links: [(title: "Medicare enrollment", url: "https://www.servicesaustralia.gov.au/enrol-newborn-child-medicare")]
        ),
        DefaultChecklistItem(
            id: "centrelink-registration",
            title: "Register with Centrelink",
            description: "Apply for Family Tax Benefit and other parenting payments",
            category: .registration,
            dueAtMonths: 1,
            notifyDaysBefore: [14, 7],
            links: [(title: "Centrelink parenting payments", url: "https://www.servicesaustralia.gov.au/parenting-payment")]
        ),
        DefaultChecklistItem(
            id: "child-care-subsidy",
            title: "Apply for Child Care Subsidy",
            description: "If planning to use childcare, apply for subsidy to reduce costs",
            category: .registration,
            dueAtMonths: 3,
            notifyDaysBefore: [30, 14],
            links: [(title: "Child Care Subsidy", url: "https://www.servicesaustralia.gov.au/child-care-subsidy")]
        ),
        
        // MARK: - Immunisations - Birth
        DefaultChecklistItem(
            id: "imm-birth-hepb",
            title: "Hepatitis B (birth dose)",
            description: "First dose of Hepatitis B vaccine, usually given in hospital",
            category: .immunisation,
            dueAtMonths: 0,
            notifyDaysBefore: [1],
            links: nil
        ),
        
        // MARK: - Immunisations - 2 months
        DefaultChecklistItem(
            id: "imm-2m-dtpa-hepb-ipv-hib",
            title: "DTPa-hepB-IPV-Hib (6-in-1) vaccine",
            description: "Protects against diphtheria, tetanus, pertussis (whooping cough), hepatitis B, polio and Haemophilus influenzae type b",
            category: .immunisation,
            dueAtMonths: 2,
            notifyDaysBefore: [14, 7, 1],
            links: nil
        ),
        DefaultChecklistItem(
            id: "imm-2m-pneumococcal",
            title: "Pneumococcal vaccine",
            description: "Protects against pneumococcal disease",
            category: .immunisation,
            dueAtMonths: 2,
            notifyDaysBefore: [14, 7, 1],
            links: nil
        ),
        DefaultChecklistItem(
            id: "imm-2m-rotavirus",
            title: "Rotavirus vaccine",
            description: "Protects against rotavirus (severe gastroenteritis)",
            category: .immunisation,
            dueAtMonths: 2,
            notifyDaysBefore: [14, 7, 1],
            links: nil
        ),
        
        // MARK: - Immunisations - 4 months
        DefaultChecklistItem(
            id: "imm-4m-dtpa-hepb-ipv-hib",
            title: "DTPa-hepB-IPV-Hib (6-in-1) vaccine",
            description: "Second dose - Protects against diphtheria, tetanus, pertussis, hepatitis B, polio and Hib",
            category: .immunisation,
            dueAtMonths: 4,
            notifyDaysBefore: [14, 7, 1],
            links: nil
        ),
        DefaultChecklistItem(
            id: "imm-4m-pneumococcal",
            title: "Pneumococcal vaccine",
            description: "Second dose - Protects against pneumococcal disease",
            category: .immunisation,
            dueAtMonths: 4,
            notifyDaysBefore: [14, 7, 1],
            links: nil
        ),
        DefaultChecklistItem(
            id: "imm-4m-rotavirus",
            title: "Rotavirus vaccine",
            description: "Second dose - Protects against rotavirus",
            category: .immunisation,
            dueAtMonths: 4,
            notifyDaysBefore: [14, 7, 1],
            links: nil
        ),
        
        // MARK: - Immunisations - 6 months
        DefaultChecklistItem(
            id: "imm-6m-dtpa-hepb-ipv-hib",
            title: "DTPa-hepB-IPV-Hib (6-in-1) vaccine",
            description: "Third dose - Protects against diphtheria, tetanus, pertussis, hepatitis B, polio and Hib",
            category: .immunisation,
            dueAtMonths: 6,
            notifyDaysBefore: [14, 7, 1],
            links: nil
        ),
        
        // MARK: - Immunisations - 12 months
        DefaultChecklistItem(
            id: "imm-12m-mmr",
            title: "MMR vaccine",
            description: "Protects against measles, mumps and rubella",
            category: .immunisation,
            dueAtMonths: 12,
            notifyDaysBefore: [30, 14, 7, 1],
            links: nil
        ),
        DefaultChecklistItem(
            id: "imm-12m-meningococcal-acwy",
            title: "Meningococcal ACWY vaccine",
            description: "Protects against meningococcal disease (strains A, C, W and Y)",
            category: .immunisation,
            dueAtMonths: 12,
            notifyDaysBefore: [30, 14, 7, 1],
            links: nil
        ),
        DefaultChecklistItem(
            id: "imm-12m-pneumococcal",
            title: "Pneumococcal vaccine",
            description: "Third dose for all children",
            category: .immunisation,
            dueAtMonths: 12,
            notifyDaysBefore: [30, 14, 7, 1],
            links: nil
        ),
        
        // MARK: - Immunisations - 18 months
        DefaultChecklistItem(
            id: "imm-18m-mmrv",
            title: "MMRV vaccine",
            description: "Protects against measles, mumps, rubella and varicella (chickenpox)",
            category: .immunisation,
            dueAtMonths: 18,
            notifyDaysBefore: [30, 14, 7, 1],
            links: nil
        ),
        DefaultChecklistItem(
            id: "imm-18m-dtpa",
            title: "DTPa vaccine",
            description: "Fourth dose - Protects against diphtheria, tetanus and pertussis",
            category: .immunisation,
            dueAtMonths: 18,
            notifyDaysBefore: [30, 14, 7, 1],
            links: nil
        ),
        DefaultChecklistItem(
            id: "imm-18m-hib",
            title: "Hib vaccine",
            description: "Fourth dose - Protects against Haemophilus influenzae type b",
            category: .immunisation,
            dueAtMonths: 18,
            notifyDaysBefore: [30, 14, 7, 1],
            links: nil
        ),
        
        // MARK: - Health Checkups
        DefaultChecklistItem(
            id: "checkup-1-4-weeks",
            title: "1-4 Week Health Check",
            description: "First health check with GP or child health nurse",
            category: .checkup,
            dueAtMonths: 0.5,
            notifyDaysBefore: [7, 3],
            links: nil
        ),
        DefaultChecklistItem(
            id: "checkup-6-8-weeks",
            title: "6-8 Week Health Check",
            description: "Comprehensive health and development check",
            category: .checkup,
            dueAtMonths: 2,
            notifyDaysBefore: [14, 7],
            links: nil
        ),
        DefaultChecklistItem(
            id: "checkup-6-months",
            title: "6 Month Health Check",
            description: "Development assessment and growth check",
            category: .checkup,
            dueAtMonths: 6,
            notifyDaysBefore: [14, 7],
            links: nil
        ),
        DefaultChecklistItem(
            id: "checkup-12-months",
            title: "12 Month Health Check",
            description: "Comprehensive health, hearing, and development check",
            category: .checkup,
            dueAtMonths: 12,
            notifyDaysBefore: [30, 14],
            links: nil
        ),
        DefaultChecklistItem(
            id: "checkup-18-months",
            title: "18 Month Health Check",
            description: "Development, behavior, and growth assessment",
            category: .checkup,
            dueAtMonths: 18,
            notifyDaysBefore: [30, 14],
            links: nil
        ),
        DefaultChecklistItem(
            id: "checkup-2-years",
            title: "2 Year Health Check",
            description: "Comprehensive health and development review",
            category: .checkup,
            dueAtMonths: 24,
            notifyDaysBefore: [30, 14],
            links: nil
        ),
        DefaultChecklistItem(
            id: "checkup-3-years",
            title: "3 Year Health Check",
            description: "Pre-school health and development assessment",
            category: .checkup,
            dueAtMonths: 36,
            notifyDaysBefore: [30, 14],
            links: nil
        ),
        
        // MARK: - Key Milestones
        DefaultChecklistItem(
            id: "milestone-smile",
            title: "First Social Smile",
            description: "Most babies start smiling socially around 6-8 weeks",
            category: .milestone,
            dueAtMonths: 2,
            notifyDaysBefore: [7],
            links: nil
        ),
        DefaultChecklistItem(
            id: "milestone-rollover",
            title: "Rolling Over",
            description: "Most babies can roll from tummy to back by 4-6 months",
            category: .milestone,
            dueAtMonths: 5,
            notifyDaysBefore: [14],
            links: nil
        ),
        DefaultChecklistItem(
            id: "milestone-sitting",
            title: "Sitting Without Support",
            description: "Most babies sit without support by 6-8 months",
            category: .milestone,
            dueAtMonths: 7,
            notifyDaysBefore: [14],
            links: nil
        ),
        DefaultChecklistItem(
            id: "milestone-crawling",
            title: "Crawling",
            description: "Most babies start crawling between 7-10 months",
            category: .milestone,
            dueAtMonths: 9,
            notifyDaysBefore: [14],
            links: nil
        ),
        DefaultChecklistItem(
            id: "milestone-first-words",
            title: "First Words",
            description: "Most babies say their first words around 12 months",
            category: .milestone,
            dueAtMonths: 12,
            notifyDaysBefore: [30],
            links: nil
        ),
        DefaultChecklistItem(
            id: "milestone-walking",
            title: "First Steps",
            description: "Most babies take their first steps between 12-15 months",
            category: .milestone,
            dueAtMonths: 13,
            notifyDaysBefore: [30],
            links: nil
        )
    ]
    
    // Helper function to get checklist items for a child based on their age
    static func getChecklistForChild(birthDate: Date) -> [DefaultChecklistItem] {
        let now = Date()
        let calendar = Calendar.current
        let components = calendar.dateComponents([.month], from: birthDate, to: now)
        let ageInMonths = components.month ?? 0
        
        // Return items that are relevant for the child's age (not too far in the past)
        return items.filter { item in
            // Show items up to 3 months in the past and all future items
            return item.dueAtMonths >= Double(ageInMonths - 3)
        }
    }
    
    // Helper to calculate due date for a checklist item
    static func calculateDueDate(birthDate: Date, item: DefaultChecklistItem) -> Date {
        let calendar = Calendar.current
        let monthsToAdd = Int(item.dueAtMonths)
        let daysToAdd = Int((item.dueAtMonths - Double(monthsToAdd)) * 30)
        
        var dateComponents = DateComponents()
        dateComponents.month = monthsToAdd
        dateComponents.day = daysToAdd
        
        return calendar.date(byAdding: dateComponents, to: birthDate) ?? birthDate
    }
}