//
//  PAMDesignSystem.swift
//  PAMMobile
//
//  PAM Brand Design System - Board Approved Colors & Typography
//  Created by PAM Team on 2025-08-15
//

import SwiftUI

// MARK: - PAM Brand Colors
struct PAMColors {
    // Primary Brand Palette
    static let brandRed = Color(hex: "#630116")        // Primary brand red
    static let brandDarkRed = Color(hex: "#7D0820")    // Darker red for CTAs
    static let brandPink = Color(hex: "#fbc3a1")       // Secondary pink accent (improved readability)
    static let brandCream = Color(hex: "#FFFBF8")      // Background cream
    
    // UI State Colors
    static let brandRedHover = Color(hex: "#7d0820")
    static let brandPinkHover = Color(hex: "#F7A0AC")
    static let brandPinkLight = Color(hex: "#FCE8EC")
    
    // Text Colors
    static let textOnRed = Color(hex: "#FFFBF8")       // Cream text on red
    static let textOnPink = Color(hex: "#630116")      // Red text on pink
    static let textOnCream = Color(hex: "#630116")     // Red text on cream
    static let textBody = Color(hex: "#2C0A0F")        // Darkened red for readability
    
    // Supporting Colors
    static let white = Color.white
    static let gray = Color(hex: "#4A4A4A")            // Dark gray for excellent contrast (AAA compliant)
    static let errorRed = Color(hex: "#dc3545")
    static let successPink = brandPink
    
    // Accessibility Colors - AAA Compliant
    static let accessibleTextOnLight = Color(hex: "#2C0A0F")   // High contrast for readability
    static let accessibleTextSecondary = Color(hex: "#8B4A5C") // Warm muted red for secondary text (AAA compliant)
    static let subtleText = Color(hex: "#6B5B73")      // Rich taupe for subtle text elements
}

// MARK: - PAM Typography
struct PAMFonts {
    // Display Fonts - Use for headings, titles, CTAs
    static func displayPrimary(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        // The Seasons font with fallback
        return Font.custom("TheSeasons", size: size)
            .weight(weight)
    }
    
    static func displaySecondary(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        // Brown Sugar font with fallback
        return Font.custom("BrownSugar", size: size)
            .weight(weight)
    }
    
    // Body Fonts - Use for all body text, UI elements
    static func bodyPrimary(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        // Montserrat font with system fallback
        return Font.custom("Montserrat", size: size)
            .weight(weight)
    }
    
    static func bodySecondary(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        // Canva Sans font with system fallback
        return Font.custom("CanvaSans", size: size)
            .weight(weight)
    }
    
    // System Fallbacks
    static let largeTitle = Font.system(size: 34, weight: .bold, design: .default)
    static let title = Font.system(size: 28, weight: .bold, design: .default)
    static let title2 = Font.system(size: 22, weight: .bold, design: .default)
    static let title3 = Font.system(size: 20, weight: .semibold, design: .default)
    static let headline = Font.system(size: 17, weight: .semibold, design: .default)
    static let body = Font.system(size: 17, weight: .regular, design: .default)
    static let callout = Font.system(size: 16, weight: .regular, design: .default)
    static let subheadline = Font.system(size: 15, weight: .regular, design: .default)
    static let footnote = Font.system(size: 13, weight: .regular, design: .default)
    static let caption = Font.system(size: 12, weight: .regular, design: .default)
    static let caption2 = Font.system(size: 11, weight: .regular, design: .default)
}

// MARK: - PAM Spacing
struct PAMSpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
    static let xxxl: CGFloat = 32
}

// MARK: - PAM Corner Radius
struct PAMRadius {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 6
    static let md: CGFloat = 8
    static let lg: CGFloat = 12
    static let xl: CGFloat = 16
    static let xxl: CGFloat = 25
}

// MARK: - PAM Shadows
struct PAMShadows {
    static let cardShadow = (color: Color.black.opacity(0.05), radius: CGFloat(5), x: CGFloat(0), y: CGFloat(2))
    static let buttonShadow = (color: PAMColors.brandRed.opacity(0.12), radius: CGFloat(3), x: CGFloat(0), y: CGFloat(1))
    static let elevatedShadow = (color: Color.black.opacity(0.1), radius: CGFloat(8), x: CGFloat(0), y: CGFloat(4))
}

// MARK: - View Modifiers
struct PAMCardStyle: ViewModifier {
    var backgroundColor: Color = PAMColors.brandCream
    var isHovered: Bool = false
    
    func body(content: Content) -> some View {
        content
            .background(isHovered ? PAMColors.brandPink : backgroundColor)
            .cornerRadius(PAMRadius.lg)
            .shadow(
                color: PAMShadows.cardShadow.color,
                radius: PAMShadows.cardShadow.radius,
                x: PAMShadows.cardShadow.x,
                y: PAMShadows.cardShadow.y
            )
            .scaleEffect(isHovered ? 1.02 : 1.0)
            .offset(y: isHovered ? -2 : 0)
            .animation(.easeInOut(duration: 0.3), value: isHovered)
    }
}

struct PAMButtonStyle: ButtonStyle {
    var isPrimary: Bool = true
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, PAMSpacing.lg)
            .padding(.vertical, PAMSpacing.md)
            .background(
                isPrimary ? PAMColors.brandRed : PAMColors.brandPink
            )
            .foregroundColor(
                isPrimary ? PAMColors.textOnRed : PAMColors.textOnPink
            )
            .cornerRadius(PAMRadius.md)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .opacity(configuration.isPressed ? 0.9 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Extensions
extension View {
    func pamCard(backgroundColor: Color = PAMColors.brandCream, isHovered: Bool = false) -> some View {
        modifier(PAMCardStyle(backgroundColor: backgroundColor, isHovered: isHovered))
    }
}