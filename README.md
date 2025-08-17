# PAM - Parent Admin Manager

A comprehensive ecosystem for helping Australian parents manage the administrative side of parenting.

## Project Structure

```
PAM/
├── pam-webapp/        # Main web application (Next.js)
├── pam-website/       # Marketing website (Next.js)
├── pam-mobile-app/    # Mobile apps (iOS/Android native)
├── pam-api/           # Shared API utilities and types
├── pam-functions/     # Serverless functions
└── documentation/     # Project documentation
```

## Quick Start

### Web Application (pam-webapp)
The main application for logged-in users.

```bash
cd pam-webapp
npm install
npm run dev
# Runs on http://localhost:3000
```

### Marketing Website (pam-website)
The public-facing marketing and information site.

```bash
cd pam-website
npm install
npm run dev
# Runs on http://localhost:3001
```

### Mobile Apps (pam-mobile-app)
Native iOS and Android applications.

#### iOS
```bash
cd pam-mobile-app/ios
open PAMMobile.xcodeproj
# Build and run in Xcode
```

#### Android
```bash
cd pam-mobile-app/android
./gradlew assembleDebug
# Or open in Android Studio
```

## Technology Stack

### Frontend
- **Web Apps**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **iOS**: Swift 5.0, SwiftUI
- **Android**: Kotlin, Jetpack Compose

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: RESTful endpoints
- **Storage**: Supabase Storage

### State Management
- **Web**: Zustand
- **iOS**: SwiftUI State Management
- **Android**: ViewModels with StateFlow

## Environment Setup

1. Copy `.env.example` to `.env.local` in each project
2. Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Deployment

- **Web App**: Deployed to Vercel
- **Marketing Site**: Deployed to Vercel
- **Mobile Apps**: App Store / Google Play

## Contributing

See individual project READMEs for specific contribution guidelines.