//
//  LocalInfoView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//  Updated with new PAM Design System on 2025-08-15.
//

import SwiftUI
import MapKit

struct LocalInfoView: View {
    @State private var selectedFolder: String? = nil
    @State private var searchText = ""
    @State private var showingEmergencyNumbers = false
    @State private var showingDocuments = false
    
    let mainFolders = [
        FolderItem(id: "registrations", title: "Registrations", count: 1, icon: "doc.text.fill"),
        FolderItem(id: "health", title: "Health & Medicare", count: 4, icon: "heart.fill"),
        FolderItem(id: "essentials", title: "Newborn Essentials", count: 7, icon: "star.fill"),
        FolderItem(id: "centrelink", title: "Centrelink & Payments", count: 5, icon: "dollarsign.circle.fill"),
        FolderItem(id: "immunisations", title: "Immunisations", count: 5, icon: "syringe.fill"),
        FolderItem(id: "childcare", title: "Childcare & School Readiness", count: 4, icon: "building.2.fill"),
        FolderItem(id: "travel", title: "Travel & Identity", count: 2, icon: "airplane"),
        FolderItem(id: "support", title: "Parenting Support", count: 11, icon: "heart.circle.fill"),
        FolderItem(id: "documents", title: "My Documents", count: 0, icon: "folder.fill")
    ]
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background color
                PAMColors.brandRed
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header with Profile & Settings
                    CustomHeader()
                    
                    // Search Bar
                    SearchBar(searchText: $searchText)
                        .padding(.horizontal, PAMSpacing.lg)
                        .padding(.vertical, PAMSpacing.md)
                    
                    // Back Button (when folder selected)
                    if selectedFolder != nil {
                        HStack {
                            Button(action: { selectedFolder = nil }) {
                                HStack(spacing: PAMSpacing.sm) {
                                    Image(systemName: "chevron.left")
                                    Text("Back")
                                }
                                .font(PAMFonts.bodyPrimary(size: 14, weight: .medium))
                                .foregroundColor(PAMColors.brandRed)
                                .padding(.horizontal, PAMSpacing.lg)
                                .padding(.vertical, PAMSpacing.sm)
                                .background(PAMColors.brandPink)
                                .cornerRadius(PAMRadius.sm)
                            }
                            Spacer()
                        }
                        .padding(.horizontal, PAMSpacing.lg)
                        .padding(.bottom, PAMSpacing.md)
                    }
                    
                    // Content Area
                    ScrollView {
                        if selectedFolder == nil {
                            MainFoldersView(folders: mainFolders, selectedFolder: $selectedFolder)
                        } else {
                            FolderContentView(folderId: selectedFolder ?? "")
                        }
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingEmergencyNumbers) {
                ImportantContactsView()
            }
            .sheet(isPresented: $showingDocuments) {
                MyDocumentsView()
            }
        }
    }
}

// MARK: - Custom Header Component
struct CustomHeader: View {
    var body: some View {
        VStack(spacing: 0) {
            // Status Bar
            HStack {
                // Time
                Text("9:41")
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.white)
                
                Spacer()
                
                // Status Icons
                HStack(spacing: PAMSpacing.xs) {
                    Image(systemName: "wifi")
                    Image(systemName: "battery.100")
                }
                .font(.caption)
                .foregroundColor(PAMColors.white)
            }
            .padding(.horizontal, PAMSpacing.lg)
            .padding(.vertical, PAMSpacing.sm)
            
            // Navigation Bar
            HStack {
                // Profile Icon
                Button(action: {}) {
                    ZStack {
                        Circle()
                            .fill(PAMColors.white)
                            .frame(width: 24, height: 24)
                        Text("P")
                            .font(PAMFonts.caption)
                            .fontWeight(.bold)
                            .foregroundColor(PAMColors.brandRed)
                    }
                }
                
                Spacer()
                
                Text("Local Info")
                    .font(PAMFonts.headline)
                    .foregroundColor(PAMColors.white)
                
                Spacer()
                
                // Settings Icon
                Button(action: {}) {
                    ZStack {
                        RoundedRectangle(cornerRadius: PAMRadius.sm)
                            .fill(PAMColors.white)
                            .frame(width: 24, height: 24)
                        Image(systemName: "gearshape.fill")
                            .font(.caption2)
                            .foregroundColor(PAMColors.brandRed)
                    }
                }
            }
            .padding(.horizontal, PAMSpacing.lg)
            .padding(.vertical, PAMSpacing.md)
        }
        .background(PAMColors.brandRed)
    }
}

// MARK: - Search Bar Component
struct SearchBar: View {
    @Binding var searchText: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(PAMColors.brandRed.opacity(0.7))
            
            TextField("🔍 Search services...", text: $searchText)
                .font(PAMFonts.bodyPrimary(size: 14, weight: .regular))
                .foregroundColor(PAMColors.brandRed)
        }
        .padding(PAMSpacing.md)
        .background(PAMColors.white)
        .cornerRadius(PAMRadius.md)
    }
}

// MARK: - Main Folders View
struct MainFoldersView: View {
    let folders: [FolderItem]
    @Binding var selectedFolder: String?
    
    var body: some View {
        VStack(spacing: PAMSpacing.lg) {
            // First 8 folders in a 2x4 grid
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: PAMSpacing.lg) {
                ForEach(folders.prefix(8)) { folder in
                    FolderCard(folder: folder, action: {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            selectedFolder = folder.id
                        }
                    })
                }
            }
            
            // My Documents folder at the bottom, taking half width
            if folders.count > 8 {
                HStack(spacing: PAMSpacing.lg) {
                    FolderCard(folder: folders[8], action: {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            selectedFolder = folders[8].id
                        }
                    })
                    .frame(maxWidth: .infinity)
                    
                    // Empty space to maintain alignment
                    Color.clear
                        .frame(maxWidth: .infinity)
                        .frame(height: 100)
                }
            }
        }
        .padding(PAMSpacing.lg)
    }
}

// MARK: - Folder Card Component
struct FolderCard: View {
    let folder: FolderItem
    let action: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: PAMSpacing.lg) {
                Text(folder.title)
                    .font(PAMFonts.bodyPrimary(size: 16, weight: .semibold))
                    .foregroundColor(PAMColors.textBody)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(maxHeight: 40)
                
                Spacer()
                
                Text(folder.count == 0 ? "0 items" : folder.count == 1 ? "1 item" : "\(folder.count) items")
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.gray)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 120)
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
}

// MARK: - Folder Content View
struct FolderContentView: View {
    let folderId: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: PAMSpacing.lg) {
            // Content Header
            Text(getFolderTitle())
                .font(PAMFonts.title3)
                .foregroundColor(PAMColors.white)
                .padding(.horizontal, PAMSpacing.lg)
            
            // Subfolders or content based on selection
            if folderId == "health" {
                ImportantPhoneNumbersSection()
            } else {
                // Generic content for other folders
                ForEach(0..<5) { index in
                    ContentListItem(
                        title: "Item \(index + 1)",
                        description: "Description for this item",
                        link: "example.gov.au"
                    )
                }
                .padding(.horizontal, PAMSpacing.lg)
            }
        }
        .padding(.vertical, PAMSpacing.lg)
    }
    
    func getFolderTitle() -> String {
        switch folderId {
        case "registrations": return "Registrations"
        case "health": return "Health & Medicare"
        case "essentials": return "Newborn Essentials"
        case "centrelink": return "Centrelink & Payments"
        case "immunisations": return "Immunisations"
        case "childcare": return "Childcare & School Readiness"
        case "travel": return "Travel & Identity"
        case "support": return "Parenting Support"
        case "documents": return "My Documents"
        default: return "Information"
        }
    }
}

// MARK: - Important Phone Numbers Section
struct ImportantPhoneNumbersSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: PAMSpacing.lg) {
            ContentCard {
                VStack(alignment: .leading, spacing: PAMSpacing.md) {
                    Text("Important Contacts for New Parents")
                        .font(PAMFonts.headline)
                        .foregroundColor(PAMColors.brandRed)
                    
                    // Emergency Section
                    ContactSection(title: "Emergency", contacts: [
                        ContactItem(name: "Triple Zero", number: "000", description: "For ambulance, fire, or police emergencies"),
                        ContactItem(name: "Poisons Information Centre", number: "13 11 26", description: "24/7 poison advice")
                    ])
                    
                    // Health & Medical Section
                    ContactSection(title: "Health & Medical", contacts: [
                        ContactItem(name: "After Hours GP Helpline", number: "1800 022 222", description: "24/7 health advice"),
                        ContactItem(name: "Maternal & Child Health Line", number: "13 22 29", description: "24/7 nurse support"),
                        ContactItem(name: "Pregnancy, Birth & Baby Helpline", number: "1800 882 436", description: "7am-midnight daily"),
                        ContactItem(name: "Lifeline", number: "13 11 14", description: "Mental health & crisis support")
                    ])
                    
                    // Parenting Support Section
                    ContactSection(title: "Parenting & Baby Support", contacts: [
                        ContactItem(name: "Australian Breastfeeding Association", number: "1800 686 268", description: "Breastfeeding support"),
                        ContactItem(name: "Red Nose Safe Sleep Advice", number: "1300 998 698", description: "Safe sleeping guidance"),
                        ContactItem(name: "PANDA", number: "1300 726 306", description: "Perinatal anxiety & depression"),
                        ContactItem(name: "Parentline NSW", number: "1300 1300 52", description: "Parenting support")
                    ])
                    
                    // Government Services
                    ContactSection(title: "Government Services", contacts: [
                        ContactItem(name: "Medicare", number: "132 011", description: "Medicare enquiries"),
                        ContactItem(name: "Centrelink Families", number: "136 150", description: "Family payments"),
                        ContactItem(name: "Births, Deaths & Marriages", number: "13 77 88", description: "Birth registration"),
                        ContactItem(name: "National Immunisation Info", number: "1800 671 811", description: "Immunisation questions")
                    ])
                    
                    // Quick Tips
                    VStack(alignment: .leading, spacing: PAMSpacing.sm) {
                        Text("💡 Quick Tips:")
                            .font(PAMFonts.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(PAMColors.brandRed)
                        
                        VStack(alignment: .leading, spacing: PAMSpacing.xs) {
                            Text("• Save these numbers in your phone before baby arrives")
                            Text("• Keep a written copy on your fridge")
                            Text("• Share with your partner and support people")
                            Text("• Always call 000 for genuine emergencies")
                        }
                        .font(PAMFonts.caption)
                        .foregroundColor(PAMColors.textBody)
                        .padding(PAMSpacing.md)
                        .background(PAMColors.brandPinkLight)
                        .cornerRadius(PAMRadius.md)
                    }
                    
                    // Action Buttons
                    HStack(spacing: PAMSpacing.md) {
                        LinkButton(title: "Healthdirect", url: "https://www.healthdirect.gov.au")
                        LinkButton(title: "PANDA Support", url: "https://www.panda.org.au")
                    }
                }
            }
            .padding(.horizontal, PAMSpacing.lg)
        }
    }
}

// MARK: - Contact Section Component
struct ContactSection: View {
    let title: String
    let contacts: [ContactItem]
    
    var body: some View {
        VStack(alignment: .leading, spacing: PAMSpacing.sm) {
            Text(title)
                .font(PAMFonts.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(PAMColors.brandRed)
            
            ForEach(contacts) { contact in
                HStack(alignment: .top) {
                    Text("•")
                        .font(PAMFonts.body)
                        .foregroundColor(PAMColors.brandRed)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        HStack {
                            Text(contact.name)
                                .font(PAMFonts.bodyPrimary(size: 14, weight: .semibold))
                                .foregroundColor(PAMColors.brandRed)
                            
                            Text("— \(contact.number)")
                                .font(PAMFonts.bodyPrimary(size: 14, weight: .regular))
                                .foregroundColor(PAMColors.textBody)
                        }
                        
                        if !contact.description.isEmpty {
                            Text(contact.description)
                                .font(PAMFonts.caption)
                                .foregroundColor(PAMColors.gray)
                        }
                    }
                    
                    Spacer()
                }
            }
        }
    }
}

// MARK: - Content Card Component
struct ContentCard<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(PAMSpacing.lg)
            .background(PAMColors.brandCream)
            .cornerRadius(PAMRadius.lg)
            .shadow(
                color: PAMShadows.cardShadow.color,
                radius: PAMShadows.cardShadow.radius,
                x: PAMShadows.cardShadow.x,
                y: PAMShadows.cardShadow.y
            )
    }
}

// MARK: - Content List Item
struct ContentListItem: View {
    let title: String
    let description: String
    let link: String
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: PAMSpacing.xs) {
                Text(title)
                    .font(PAMFonts.bodyPrimary(size: 14, weight: .semibold))
                    .foregroundColor(PAMColors.brandRed)
                
                Text(link)
                    .font(PAMFonts.caption)
                    .foregroundColor(PAMColors.gray)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(PAMColors.brandRed)
        }
        .padding(PAMSpacing.md)
        .background(PAMColors.white)
        .cornerRadius(PAMRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: PAMRadius.md)
                .stroke(PAMColors.brandRed, lineWidth: 0)
                .overlay(
                    HStack {
                        Rectangle()
                            .fill(PAMColors.brandRed)
                            .frame(width: 4)
                        Spacer()
                    }
                )
        )
        .clipShape(RoundedRectangle(cornerRadius: PAMRadius.md))
    }
}

// MARK: - Link Button Component
struct LinkButton: View {
    let title: String
    let url: String
    
    var body: some View {
        Link(destination: URL(string: url)!) {
            Text(title)
                .font(PAMFonts.caption)
                .fontWeight(.semibold)
                .foregroundColor(PAMColors.white)
                .padding(.horizontal, PAMSpacing.lg)
                .padding(.vertical, PAMSpacing.sm)
                .background(PAMColors.brandRed)
                .cornerRadius(PAMRadius.md)
        }
    }
}

// MARK: - Important Contacts View (Full Screen)
struct ImportantContactsView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                PAMColors.brandRed.ignoresSafeArea()
                
                ScrollView {
                    ImportantPhoneNumbersSection()
                }
            }
            .navigationTitle("Important Contacts")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(PAMColors.white)
                }
            }
        }
    }
}

// MARK: - My Documents View
struct MyDocumentsView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                PAMColors.brandRed.ignoresSafeArea()
                
                VStack {
                    Text("My Documents")
                        .font(PAMFonts.largeTitle)
                        .foregroundColor(PAMColors.white)
                    
                    Text("Document management coming soon")
                        .font(PAMFonts.body)
                        .foregroundColor(PAMColors.brandPink)
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(PAMColors.white)
                }
            }
        }
    }
}

// MARK: - Data Models
struct FolderItem: Identifiable {
    let id: String
    let title: String
    let count: Int
    let icon: String
}

struct ContactItem: Identifiable {
    let id = UUID()
    let name: String
    let number: String
    let description: String
}

// MARK: - Existing Healthcare Models (keeping for compatibility)
struct HealthcareProvider: Identifiable {
    let id = UUID()
    let name: String
    let type: String
    let distance: String
    let rating: Double
    let phone: String
    let address: String
}

struct LocalService: Identifiable {
    let id = UUID()
    let name: String
    let type: String
    let description: String
    let phone: String
    let website: String
}

struct ParentGroup: Identifiable {
    let id = UUID()
    let name: String
    let members: Int
    let nextMeet: String
    let location: String
}

struct Resource: Identifiable {
    let id = UUID()
    let title: String
    let type: String
    let url: String
}

struct EmergencyNumber: Identifiable {
    let id = UUID()
    let name: String
    let number: String
    let description: String
}

struct LocalInfoView_Previews: PreviewProvider {
    static var previews: some View {
        LocalInfoView()
    }
}