# Font Configuration Instructions for PAM Mobile App

## Required Fonts
The PAM mobile app now uses the following custom fonts:

### Headings & Titles
- **TAN Pearl** - Used for all headings, titles, and prominent text elements
  - Download from: [Font provider website]
  - Required weights: Regular, Semibold, Bold

### Body Text
- **Montserrat** - Used for all body text, descriptions, and UI elements
  - Download from: https://fonts.google.com/specimen/Montserrat
  - Required weights: Regular, Medium, Semibold, Bold

## Installation Steps

### 1. Add Font Files to Xcode Project
1. Create a "Fonts" folder in your Xcode project if it doesn't exist
2. Add the following font files to the Fonts folder:
   - TANPearl-Regular.ttf (or .otf)
   - TANPearl-Semibold.ttf (or .otf)
   - TANPearl-Bold.ttf (or .otf)
   - Montserrat-Regular.ttf
   - Montserrat-Medium.ttf
   - Montserrat-SemiBold.ttf
   - Montserrat-Bold.ttf

### 2. Configure Info.plist
Add the following to your Info.plist file:

```xml
<key>UIAppFonts</key>
<array>
    <string>TANPearl-Regular.ttf</string>
    <string>TANPearl-Semibold.ttf</string>
    <string>TANPearl-Bold.ttf</string>
    <string>Montserrat-Regular.ttf</string>
    <string>Montserrat-Medium.ttf</string>
    <string>Montserrat-SemiBold.ttf</string>
    <string>Montserrat-Bold.ttf</string>
</array>
```

### 3. Verify Font Names
In your Swift code, verify the exact font names by printing available fonts:

```swift
for family in UIFont.familyNames.sorted() {
    print("Family: \(family)")
    for name in UIFont.fontNames(forFamilyName: family) {
        print("  - \(name)")
    }
}
```

### 4. Update Font Names in Code
If the font names differ from what's in PAMDesignSystem.swift, update them accordingly:
- Replace "TANPearl" with the actual font family name
- Replace "Montserrat" with the actual font family name

## Color Update
The brand red color has been updated to: **#7D0820**

## Font Usage in the App

### Headings (TAN Pearl)
- Large titles (34pt bold)
- Section titles (28pt bold)
- Card headers (22pt bold)
- Subheadings (20pt semibold)
- Labels (17pt semibold)

### Body Text (Montserrat)
- Body text (17pt regular)
- Descriptions (16pt regular)
- Subheadlines (15pt regular)
- Footnotes (13pt regular)
- Captions (12pt regular)
- Small captions (11pt regular)

## Fallback Behavior
If custom fonts are not installed, the app will fall back to system fonts automatically. However, for the best user experience, please ensure custom fonts are properly installed.

## Testing
After installing fonts:
1. Clean build folder (Cmd+Shift+K)
2. Delete derived data
3. Rebuild the project
4. Verify fonts appear correctly in the app

## Notes
- Font files must be included in the app bundle (check "Target Membership" in Xcode)
- Font names in code must match exactly with the PostScript names of the fonts
- If fonts don't appear, check the build phases to ensure font files are copied to the bundle