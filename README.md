# PAM - Parenting Assistance Mobile

A Progressive Web App designed to help Australian parents with children aged 0-3 years track important appointments, milestones, and daily activities.

## 🚀 Features

### Phase 1 (MVP)
- ✅ **Authentication System** - Secure signup/login with Australian location detection
- ✅ **Child Profile Management** - Add and manage children's profiles with Australian date formats
- ✅ **Dashboard** - Overview of important tasks and activities
- ✅ **Mobile-First Design** - Optimized for Australian parents on-the-go
- ✅ **Local Info Hub** - Australian government services and parenting resources

### Coming Soon
- 📋 **Automated Checklist** - Immunization schedules and milestone tracking
- 📱 **Baby Tracker** - Feeding, sleep, and daily activity logging
- 📅 **Calendar Integration** - Sync with Google Calendar, Apple Calendar
- 🤖 **AI Chatbot** - 24/7 parenting support with Australian compliance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Styling**: Tailwind CSS with custom PAM design system
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Icons**: Heroicons

## 🎨 Design System

- **Primary Red**: #7D0820
- **Pink**: #F9B1BC  
- **Cream**: #FFFBF8
- **Fonts**: Montserrat (body), The Seasons/Brown Sugar (headings)

## 📱 Mobile-First Design

- Max container width: 430px
- Bottom navigation for easy thumb access
- Touch targets minimum 44x44px
- Australian date format (DD/MM/YYYY)
- Australian English spelling

## 🏗️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install
```bash
cd pam-app
npm install
```

### 2. Set up Supabase
1. Create a new Supabase project
2. Run the SQL commands from `database/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📊 Database Schema

The app uses three main tables:

- **profiles** - Extended user information (state/territory, postcode)
- **children** - Child profiles with birth dates
- **checklist_items** - Automated tasks and milestones

All tables include Row Level Security (RLS) for data protection.

## 🔐 Security

- Row Level Security on all database tables
- Authentication middleware protecting dashboard routes
- Input validation and sanitization
- Australian privacy compliance ready

## 🇦🇺 Australian Compliance

- DD/MM/YYYY date format throughout
- Australian English spelling
- State/territory detection
- Links to Australian government services
- Privacy Act 1988 compliance ready

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Protected dashboard pages
│   └── api/            # API routes
├── components/
│   ├── ui/             # Reusable UI components
│   ├── features/       # Feature-specific components
│   └── layout/         # Layout components
├── lib/
│   ├── supabase/       # Supabase client configuration
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
└── types/              # TypeScript type definitions
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment
```bash
npm run build
npm run start
```

## 🧪 Development Guidelines

- Mobile-first responsive design
- Australian date formats (DD/MM/YYYY)
- Error boundaries and loading states
- TypeScript strict mode
- ESLint and Prettier configuration

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ for Australian parents
