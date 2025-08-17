# PAM Mobile App

Native iOS and Android implementations of the PAM (Parent Admin Manager) app, designed to help Australian parents manage their children's administrative tasks from ages 0-3.

## Project Structure
```
pam-mobile-app/
├── ios/                    # iOS Native App (Swift/SwiftUI)
│   ├── PAMMobile/
│   │   ├── Views/         # SwiftUI Views
│   │   ├── Models/        # Data Models
│   │   ├── Services/      # API & Data Services
│   │   └── Assets.xcassets/
│   └── PAMMobile.xcodeproj
├── android/               # Android Native App (Kotlin/Compose)
│   ├── app/
│   │   └── src/main/java/com/pam/mobile/
│   │       ├── ui/       # Compose UI
│   │       ├── data/     # Data Layer
│   │       └── di/       # Dependency Injection
│   └── build.gradle
└── shared/               # Shared resources
```

## Features
- 🔐 **Authentication**: Secure sign-in/sign-up with demo mode
- 📱 **Native Performance**: Platform-specific optimizations
- 🎨 **PAM Design System**: Consistent branding across platforms
- 📊 **Offline Support**: Local data persistence
- 🔔 **Push Notifications**: Timely reminders for tasks
- 📅 **Calendar Integration**: Native calendar sync
- 🎯 **Smart Tracking**: Activity logging with voice input

## Getting Started

### iOS Development

#### Requirements
- macOS 13.0+
- Xcode 14.0+
- iOS 15.0+ deployment target

#### Setup
```bash
cd ios
open PAMMobile.xcodeproj
```

#### Running in Simulator
1. Select target device in Xcode
2. Press Cmd+R or click Run button
3. Use demo login: `demo@example.com` / `password`

### Android Development

#### Requirements
- Android Studio Flamingo+
- JDK 17
- Android SDK 24+ (Android 7.0+)

#### Setup
```bash
cd android
./gradlew build
```

#### Running in Emulator
1. Open project in Android Studio
2. Select AVD or create new virtual device
3. Click Run button
4. Use demo login: `demo@example.com` / `password`

## Architecture

### iOS Architecture
- **SwiftUI**: Modern declarative UI framework
- **Combine**: Reactive programming for data flow
- **CoreData**: Local persistence
- **URLSession**: Network requests

### Android Architecture
- **Jetpack Compose**: Modern UI toolkit
- **Kotlin Coroutines**: Asynchronous programming
- **Room**: SQLite abstraction for local storage
- **Retrofit**: Type-safe HTTP client
- **Hilt**: Dependency injection

## Design System
Following PAM brand guidelines:
- **Primary**: PAM Red (#7D0820)
- **Secondary**: PAM Pink (#F9B1BC)
- **Background**: PAM Cream (#FFFBF8)
- **Typography**: System fonts with custom weights
- **Spacing**: 8pt grid system

## API Integration
Both apps connect to the PAM backend API:
- Base URL: `https://api.pam-app.com/v1`
- Authentication: Bearer token
- Content-Type: `application/json`

## Testing

### iOS Testing
```bash
cd ios
xcodebuild test -scheme PAMMobile -destination 'platform=iOS Simulator,name=iPhone 15'
```

### Android Testing
```bash
cd android
./gradlew test
./gradlew connectedAndroidTest
```

## Building for Release

### iOS Release
1. Update version in Xcode project settings
2. Archive in Xcode (Product → Archive)
3. Upload to App Store Connect
4. Submit for review

### Android Release
1. Update version in `app/build.gradle`
2. Generate signed APK/AAB:
   ```bash
   ./gradlew assembleRelease
   ```
3. Upload to Google Play Console
4. Submit for review

## Environment Variables
Create `.env` files for each platform:

### iOS (.env)
```
API_BASE_URL=https://api.pam-app.com/v1
GOOGLE_MAPS_API_KEY=your_key_here
```

### Android (local.properties)
```
api.base.url=https://api.pam-app.com/v1
google.maps.api.key=your_key_here
```

## Contributing
1. Create feature branch
2. Implement changes following platform guidelines
3. Add tests
4. Submit PR with description

## Support
- iOS issues: Check Xcode console logs
- Android issues: Check Logcat in Android Studio
- API issues: Verify network connectivity and auth tokens

## License
Copyright © 2025 PAM Team. All rights reserved.