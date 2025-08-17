# PAM - Parent Admin Manager

A Progressive Web App for Australian parents with children aged 0-3 years.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## 📱 Features

- **Timeline Management**: Track immunisations, milestones, and government tasks
- **Baby Tracker**: Log daily activities (feeding, sleep, nappies)
- **Growth Tracking**: Monitor height, weight, and development percentiles
- **Local Resources**: State-specific Australian parenting information
- **AI Assistant**: Context-aware parenting guidance
- **Family Sharing**: Multi-user access for partners and caregivers

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom PAM design system
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Deployment**: Render.com
- **PWA**: Offline support, installable on mobile/desktop

## 🎨 Design System

- **Primary Color**: `#7D2030` (Burgundy)
- **Success Color**: `#4CAF50` (Green)
- **Font**: Inter (sans-serif)
- **Mobile-First**: Optimized for 430px viewport

## 📁 Project Structure

```
pam-app/
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── lib/           # Utilities and services
│   └── types/         # TypeScript types
├── public/            # Static assets
├── database/          # SQL schemas and migrations
└── supabase/          # Supabase configuration
```

## 🚀 Deployment

The app is configured for deployment on Render.com:

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy using `render.yaml` configuration

## 🔐 Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Optional (for enhanced features):
- `OPENAI_API_KEY` - AI assistant
- `RESEND_API_KEY` - Email notifications
- Firebase credentials - Push notifications

## 📱 PWA Installation

### iOS
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Android
1. Open in Chrome
2. Tap menu (3 dots)
3. Select "Install app"

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📄 License

© 2025 PAM. All rights reserved.

## 🤝 Contributing

Please refer to the documentation folder for development workflows and guidelines.