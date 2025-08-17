# PAM API

Shared API utilities, types, and configurations for the PAM ecosystem.

## Structure

```
pam-api/
├── src/
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Shared utilities
│   ├── supabase/        # Supabase client configurations
│   └── constants/       # Shared constants
├── package.json
└── tsconfig.json
```

## Usage

This package contains shared code used by:
- `pam-webapp` - The main web application
- `pam-mobile-app` - The mobile application
- `pam-website` - The marketing website

## Installation

From other packages:
```bash
npm install ../pam-api
```