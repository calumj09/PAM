# PAM - Parent Admin Manager

A Progressive Web App designed to help overwhelmed Australian mums manage the mental load of early motherhood with personalised timelines, reminders, and government admin help - all in one beautiful, empathetic app.

> **🎯 Mission**: To be the trusted companion that reduces stress and brings confidence to Australian parents navigating the first three years of their child's life.

## 🌟 Key Features

### ✅ **Core Features Complete**
- **Smart Timeline System** - Auto-generated Australian checklist (immunizations, registrations, milestones)
- **Baby Tracker** - Voice-enabled activity tracking (feeding, sleep, nappies, tummy time)
- **Growth Tracking** - Height, weight, head circumference with Australian percentile charts
- **Analytics & Reports** - Pattern detection and healthcare reports for GP visits
- **Calendar Views** - Timeline can be viewed as list or calendar with milestone integration
- **AI Smart Helper** - Context-aware parenting assistant (freemium model)
- **Admin Hub** - State-based Australian government resources and links
- **Mobile-First PWA** - Offline support, install prompts, optimized for Australian parents

### 🎯 **Recently Completed**
- **Enhanced Timeline** - Weekly cards with developmental milestones and "What to Expect" bubbles
- **Tracker Analytics** - Comprehensive pattern analysis for sleep, feeding, and nappy tracking
- **Growth Tracker Integration** - Birth measurements automatically imported from setup
- **Premium Features** - Calendar sync, AI enhancements, family sharing foundation
- **Australian Compliance** - Full localization with metric units and healthcare standards

## 🎨 Design System

**Brand Colors**:
- **Primary Red**: #7D0820 (PAM brand)
- **Soft Pink**: #F9B1BC (gentle, nurturing)
- **Cream**: #FFFBF8 (calming)

**Typography**:
- **UI**: Inter, Montserrat (clean, accessible)
- **Headings**: The Seasons, Brown Sugar (warm, friendly)

**Design Philosophy**: Empathetic, gentle, reducing mental load with Apple-quality interactions.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Apple-quality components)
- **Icons**: Lucide React (consistent, beautiful)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI API (Smart Helper)
- **State**: Zustand
- **Styling**: Custom PAM design system with semantic colors

## 📁 Project Documentation

- **📋 [PAM-MASTER-PLAN.md](./PAM-MASTER-PLAN.md)** - Comprehensive planning and strategy (single source of truth)
- **🎨 [design.md](./design.md)** - UI/UX design guidelines and component specifications
- **💻 [claude.md](./claude.md)** - Technical implementation instructions
- **📦 [archive/](./archive/)** - Historical files and old documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### 1. Clone and Install
```bash
git clone <repository>
cd pam-app
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 3. Database Setup
Run the production schema in your Supabase SQL editor:
1. Execute `database/production-final.sql` (the working schema)
2. Execute `database/add-missing-column.sql` (final fix)

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Project Structure

```
/PAM/pam-app/
├── PAM-MASTER-PLAN.md      # 📋 Complete planning document
├── design.md               # 🎨 UI/UX guidelines  
├── claude.md               # 💻 Implementation guide
├── src/
│   ├── app/
│   │   ├── (auth)/         # Authentication flow
│   │   ├── (dashboard)/    # Main app pages
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── admin/         # Admin wizard components
│   │   ├── ai/            # AI helper components
│   │   └── documents/     # Document management
│   ├── lib/
│   │   ├── services/      # Business logic services
│   │   ├── data/          # Australian schedules & forms
│   │   └── supabase/      # Database client
├── database/              # Production database schema
│   ├── production-final.sql    # Working schema
│   └── add-missing-column.sql  # Final fix
└── archive/               # Historical files
```

## 🇦🇺 Australian Focus

- **Government Integration**: Direct links to Medicare, Centrelink, BDM services
- **Immunization Schedule**: Official Australian NIP schedule integration
- **Local Resources**: State-specific information and contacts
- **Date Format**: DD/MM/YYYY throughout
- **Privacy Compliance**: Australian Privacy Act 1988 ready

## 🎯 Business Model

**Freemium Approach**:
- **Free**: Complete timeline, admin help, 5 AI questions/month
- **Premium ($9.99/month)**: Unlimited AI, calendar sync, family sharing, multi-child support

## 🛡️ Security & Privacy

- Row Level Security on all database tables
- Australian privacy compliance ready
- Input validation and sanitization
- Authentication middleware on protected routes

## 🚀 Deployment

### Render (Current)
Connected via GitHub for automatic deployments.

### Manual Deployment
```bash
npm run build
npm run start
```

## 📊 Recent Achievements (July 2025)

✅ **Design System Overhaul**: Complete migration to shadcn/ui + Lucide React  
✅ **Today Page Optimization**: Empathetic UX with Me Time nudges  
✅ **Mobile-First Enhancement**: 44px+ touch targets, smooth animations  
✅ **Project Organization**: Consolidated planning into single source of truth  
✅ **Component Upgrades**: All major components follow world-class design standards  

## 🤝 Contributing

1. Read [PAM-MASTER-PLAN.md](./PAM-MASTER-PLAN.md) for context
2. Follow [design.md](./design.md) for UI guidelines
3. Use [claude.md](./claude.md) for technical standards
4. Create feature branch
5. Submit Pull Request

---

**Built with ❤️ for overwhelmed Australian mums**  
*Making the mental load of early motherhood a little lighter, one gentle reminder at a time.*