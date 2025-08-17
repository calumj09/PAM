# PAM Project Structure

## Overview
PAM (Parent Admin Manager) is organized into multiple packages for better maintainability and separation of concerns.

## Directory Structure

```
PAM/
├── pam-webapp/              # Main web application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities and configurations
│   │   ├── stores/         # Zustand state management
│   │   └── types/          # TypeScript definitions
│   ├── public/             # Static assets
│   └── package.json
│
├── pam-website/            # Marketing website
│   ├── app/               # Next.js app router pages
│   ├── components/        # Marketing components
│   └── package.json
│
├── pam-mobile-app/         # Mobile applications
│   ├── ios/               # Native iOS app (Swift/SwiftUI)
│   │   └── PAMMobile/
│   ├── android/           # Native Android app (Kotlin)
│   │   └── app/
│   └── README.md
│
├── pam-api/               # Shared API utilities
│   ├── src/
│   │   ├── types/        # Shared TypeScript types
│   │   ├── utils/        # Shared utilities
│   │   ├── supabase/     # Supabase configurations
│   │   └── constants/    # Shared constants
│   └── package.json
│
├── pam-functions/         # Serverless functions
│   └── src/
│
├── documentation/         # Project documentation
│   ├── api/
│   ├── deployment/
│   └── development/
│
└── archive/              # Archived/deprecated code
```

## Package Descriptions

### pam-webapp
The main web application for authenticated users. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

**Key Features:**
- User authentication
- Dashboard
- Timeline/checklist management
- Calendar integration
- Activity tracking
- Growth monitoring
- Settings

**Port:** 3000

### pam-website
The public-facing marketing website. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

**Key Features:**
- Landing page
- Features overview
- Pricing
- About
- Support/contact

**Port:** 3001

### pam-mobile-app
Native mobile applications for iOS and Android.

**iOS:**
- Swift 5.0 + SwiftUI
- MVVM architecture
- Minimum iOS 16.0

**Android:**
- Kotlin + Jetpack Compose
- MVVM architecture
- Material Design 3

### pam-api
Shared utilities, types, and configurations used across all packages.

### pam-functions
Serverless functions for background tasks and API endpoints.

## Development Workflow

1. **Web App Development:**
   ```bash
   cd pam-webapp
   npm install
   npm run dev
   ```

2. **Marketing Site Development:**
   ```bash
   cd pam-website
   npm install
   npm run dev
   ```

3. **Mobile Development:**
   - iOS: Open `pam-mobile-app/ios/PAMMobile.xcodeproj` in Xcode
   - Android: Open `pam-mobile-app/android` in Android Studio

## Deployment

- **pam-webapp**: Deployed to Vercel (production)
- **pam-website**: Deployed to Vercel (production)
- **pam-mobile-app**: App Store / Google Play Store