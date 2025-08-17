//
//  SettingsView.swift
//  PAMMobile
//
//  Created by PAM Team on 2025-08-02.
//  Updated with PAM Design System on 2025-08-16.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var dataStore: DataStore
    @State private var showingAddChild = false
    @State private var showingEditChild = false
    @State private var selectedChild: Child?
    @State private var showingDeleteConfirmation = false
    @State private var showingSignOutConfirmation = false
    
    @AppStorage("enableNotifications") private var enableNotifications = true
    @AppStorage("enableReminders") private var enableReminders = true
    @AppStorage("use24HourTime") private var use24HourTime = false
    @AppStorage("temperatureUnit") private var temperatureUnit = "Celsius"
    
    var body: some View {
        NavigationView {
            List {
                // User Section
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(PAMColors.brandRed)
                        
                        VStack(alignment: .leading) {
                            Text(authManager.currentUser?.email ?? "User")
                                .font(.headline)
                            Text("Parent Account")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }
                
                // Children Management
                Section("Children") {
                    ForEach(dataStore.children) { child in
                        ChildRow(child: child) {
                            selectedChild = child
                            showingEditChild = true
                        }
                    }
                    
                    Button(action: { showingAddChild = true }) {
                        Label("Add Child", systemImage: "plus.circle.fill")
                            .foregroundColor(PAMColors.brandRed)
                    }
                }
                
                // App Settings
                Section("App Settings") {
                    Toggle(isOn: $enableNotifications) {
                        Label("Push Notifications", systemImage: "bell.fill")
                    }
                    
                    Toggle(isOn: $enableReminders) {
                        Label("Task Reminders", systemImage: "alarm.fill")
                    }
                    
                    Toggle(isOn: $use24HourTime) {
                        Label("24-Hour Time", systemImage: "clock.fill")
                    }
                    
                    HStack {
                        Label("Temperature Unit", systemImage: "thermometer")
                        Spacer()
                        Picker("", selection: $temperatureUnit) {
                            Text("Celsius").tag("Celsius")
                            Text("Fahrenheit").tag("Fahrenheit")
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        .frame(width: 150)
                    }
                }
                
                // Data & Privacy
                Section("Data & Privacy") {
                    NavigationLink(destination: DataExportView()) {
                        Label("Export Data", systemImage: "square.and.arrow.up")
                    }
                    
                    NavigationLink(destination: PrivacyPolicyView()) {
                        Label("Privacy Policy", systemImage: "lock.shield.fill")
                    }
                    
                    NavigationLink(destination: TermsOfServiceView()) {
                        Label("Terms of Service", systemImage: "doc.text.fill")
                    }
                }
                
                // Support
                Section("Support") {
                    NavigationLink(destination: HelpCenterView()) {
                        Label("Help Center", systemImage: "questionmark.circle.fill")
                    }
                    
                    Button(action: sendFeedback) {
                        Label("Send Feedback", systemImage: "envelope.fill")
                            .foregroundColor(.primary)
                    }
                    
                    NavigationLink(destination: AboutView()) {
                        Label("About PAM", systemImage: "info.circle.fill")
                    }
                }
                
                // Account Actions
                Section {
                    Button(action: { showingSignOutConfirmation = true }) {
                        HStack {
                            Spacer()
                            Text("Sign Out")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showingAddChild) {
                AddChildView()
            }
            .sheet(isPresented: $showingEditChild) {
                if let child = selectedChild {
                    EditChildView(child: child)
                }
            }
            .alert("Sign Out", isPresented: $showingSignOutConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Sign Out", role: .destructive) {
                    authManager.signOut()
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
        }
    }
    
    func sendFeedback() {
        let email = "feedback@pam-app.com"
        let subject = "PAM App Feedback"
        let body = "Device: iOS\nApp Version: 1.0\n\nFeedback:\n"
        
        if let url = URL(string: "mailto:\(email)?subject=\(subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&body=\(body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") {
            UIApplication.shared.open(url)
        }
    }
}

struct ChildRow: View {
    let child: Child
    let onTap: () -> Void
    
    var ageString: String {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month], from: child.dateOfBirth, to: Date())
        
        if let years = components.year, years > 0 {
            let months = components.month ?? 0
            return "\(years)y \(months)m"
        } else if let months = components.month {
            return "\(months) months"
        } else {
            return "Newborn"
        }
    }
    
    var body: some View {
        Button(action: onTap) {
            HStack {
                Image(systemName: "person.circle.fill")
                    .font(.title2)
                    .foregroundColor(PAMColors.brandPink)
                
                VStack(alignment: .leading) {
                    Text(child.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    Text(ageString)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct AddChildView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var dataStore: DataStore
    
    @State private var name = ""
    @State private var dateOfBirth = Date()
    @State private var gender = Child.Gender.other
    
    var body: some View {
        NavigationView {
            Form {
                Section("Child Information") {
                    TextField("Name", text: $name)
                    
                    DatePicker("Date of Birth", selection: $dateOfBirth, displayedComponents: .date)
                        .datePickerStyle(CompactDatePickerStyle())
                    
                    Picker("Gender", selection: $gender) {
                        ForEach(Child.Gender.allCases, id: \.self) { gender in
                            Text(gender.rawValue).tag(gender)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
            }
            .navigationTitle("Add Child")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        dataStore.addChild(name: name, dateOfBirth: dateOfBirth)
                        if let child = dataStore.children.last {
                            var updatedChild = child
                            updatedChild.gender = gender
                            dataStore.updateChild(updatedChild)
                        }
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

struct EditChildView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var dataStore: DataStore
    
    let child: Child
    @State private var name: String
    @State private var dateOfBirth: Date
    @State private var gender: Child.Gender
    @State private var showingDeleteConfirmation = false
    
    init(child: Child) {
        self.child = child
        _name = State(initialValue: child.name)
        _dateOfBirth = State(initialValue: child.dateOfBirth)
        _gender = State(initialValue: child.gender ?? .other)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("Child Information") {
                    TextField("Name", text: $name)
                    
                    DatePicker("Date of Birth", selection: $dateOfBirth, displayedComponents: .date)
                        .datePickerStyle(CompactDatePickerStyle())
                    
                    Picker("Gender", selection: $gender) {
                        ForEach(Child.Gender.allCases, id: \.self) { gender in
                            Text(gender.rawValue).tag(gender)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section {
                    Button(action: { showingDeleteConfirmation = true }) {
                        HStack {
                            Spacer()
                            Text("Delete Child")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Edit Child")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        var updatedChild = child
                        updatedChild.name = name
                        updatedChild.dateOfBirth = dateOfBirth
                        updatedChild.gender = gender
                        dataStore.updateChild(updatedChild)
                        dismiss()
                    }
                }
            }
            .alert("Delete Child", isPresented: $showingDeleteConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    dataStore.deleteChild(child)
                    dismiss()
                }
            } message: {
                Text("Are you sure you want to delete \(child.name)? This will also delete all associated data.")
            }
        }
    }
}

// Supporting Views
struct DataExportView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "square.and.arrow.up.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(PAMColors.brandRed)
            
            Text("Export Your Data")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Download all your PAM data in a portable format")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
            
            Button(action: exportData) {
                Label("Export as CSV", systemImage: "doc.text")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(PAMColors.brandRed)
                    .foregroundColor(.white)
                    .cornerRadius(PAMRadius.lg)
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .padding(.top, 40)
        .navigationTitle("Export Data")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    func exportData() {
        // Export implementation
    }
}

struct PrivacyPolicyView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Privacy Policy")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Last updated: August 2, 2025")
                    .foregroundColor(.secondary)
                
                VStack(alignment: .leading, spacing: 16) {
                    Text("1. Information We Collect")
                        .font(.headline)
                    Text("PAM collects information you provide directly, such as when you create an account, add child information, or track activities.")
                    
                    Text("2. How We Use Information")
                        .font(.headline)
                    Text("We use the information to provide and improve our services, personalize your experience, and communicate with you.")
                    
                    Text("3. Data Security")
                        .font(.headline)
                    Text("We implement appropriate security measures to protect your personal information against unauthorized access.")
                    
                    Text("4. Data Sharing")
                        .font(.headline)
                    Text("We do not sell, trade, or rent your personal information to third parties.")
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct TermsOfServiceView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Terms of Service")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Last updated: August 2, 2025")
                    .foregroundColor(.secondary)
                
                VStack(alignment: .leading, spacing: 16) {
                    Text("1. Acceptance of Terms")
                        .font(.headline)
                    Text("By using PAM, you agree to be bound by these Terms of Service.")
                    
                    Text("2. Use of Service")
                        .font(.headline)
                    Text("PAM is designed to help parents manage administrative tasks. It is not a substitute for professional medical advice.")
                    
                    Text("3. User Accounts")
                        .font(.headline)
                    Text("You are responsible for maintaining the confidentiality of your account credentials.")
                    
                    Text("4. Content")
                        .font(.headline)
                    Text("You retain ownership of all content you submit to PAM.")
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct HelpCenterView: View {
    let helpTopics = [
        HelpTopic(title: "Getting Started", icon: "play.circle.fill", articles: ["Creating an account", "Adding your first child", "Understanding the dashboard"]),
        HelpTopic(title: "Timeline & Tasks", icon: "checkmark.circle.fill", articles: ["Managing timeline items", "Setting reminders", "Tracking completions"]),
        HelpTopic(title: "Tracking Activities", icon: "chart.bar.fill", articles: ["Quick entry guide", "Understanding statistics", "Exporting data"]),
        HelpTopic(title: "Growth Monitoring", icon: "arrow.up.right.circle.fill", articles: ["Recording measurements", "Understanding percentiles", "Milestone tracking"])
    ]
    
    var body: some View {
        List(helpTopics) { topic in
            NavigationLink(destination: HelpTopicView(topic: topic)) {
                Label(topic.title, systemImage: topic.icon)
            }
        }
        .navigationTitle("Help Center")
    }
}

struct HelpTopicView: View {
    let topic: HelpTopic
    
    var body: some View {
        List(topic.articles, id: \.self) { article in
            NavigationLink(destination: HelpArticleView(title: article)) {
                Text(article)
            }
        }
        .navigationTitle(topic.title)
    }
}

struct HelpArticleView: View {
    let title: String
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(title)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("This is a placeholder for the help article content. In a production app, this would contain detailed instructions and information.")
                    .foregroundColor(.secondary)
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AboutView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "heart.fill")
                .font(.system(size: 60))
                .foregroundColor(PAMColors.brandRed)
            
            Text("PAM")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("Parent Admin Manager")
                .font(.title3)
                .foregroundColor(.secondary)
            
            Text("Version 1.0")
                .foregroundColor(.secondary)
            
            Divider()
                .padding(.vertical)
            
            VStack(spacing: 12) {
                Text("PAM helps Australian parents manage the administrative side of parenting with ease.")
                    .multilineTextAlignment(.center)
                
                Text("Made with ❤️ in Australia")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Link("Visit our website", destination: URL(string: "https://pam-app.com")!)
                .foregroundColor(PAMColors.brandRed)
        }
        .padding()
        .navigationTitle("About")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// Models
struct HelpTopic: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let articles: [String]
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(AuthenticationManager())
            .environmentObject(DataStore())
    }
}