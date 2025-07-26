# PAM (Parent Admin Manager) - Revised Planning

## Our Why & Purpose 
To help overwhelmed new mums manage the mental load of early motherhood with personalised timelines, reminders, government admin help (all in one simple app).

Mums often lack organisational support, are busy, tired, and stressed. We want this app to be their one-stop companion.

## Project Overview
- **Project Name**: PAM (Parent Admin Manager)  
- **Target Audience**: New mums in Australia with babies aged 0-3 years
- **Platform**: Progressive Web App (Mobile-first responsive design)
- **Business Model**: Freemium with premium AI assistant

## Brand Guidelines (Updated from Founder Vision)
### Visual Identity
- **Primary Colors**: 
  - Primary Red: #7D0820 (existing PAM red)
  - Soft pastels: Buttermilk yellow, peach accents
  - Muted, calm color palette for overwhelmed mums
- **Typography**: Large, round sans-serif fonts (SF Rounded style)
- **Design**: Minimalist, gentle, empathetic for new mums

### Design Philosophy (Founder-Aligned)
- **Mum-centric**: Language and features focused on reducing mental load
- **Timeline-based**: Weekly timeline as default view (not lists)
- **Empathetic**: "Me Time" nudges and self-care reminders
- **Gentle**: Soft animations, calming colors, no overwhelming interfaces
- **One-stop**: Everything a new mum needs in one place

## Core App Structure (Based on Founder.md)

### 1. **Today Tab (Default Home View)** 🆕
**Purpose**: Gentle, scrollable timeline view of the day
- Visual: Smooth vertical scroll with icons + subtle color coding
- Shows today's tasks, upcoming items, and "Me Time" nudges
- Empathetic language: "You're doing great!" messages
- Quick stats: progress on weekly tasks

### 2. **Timeline Tab (Core Feature)**
**Purpose**: Baby-focused timeline of "to-dos" to reduce mental load
- **Weekly Timeline Format** (Card-based, not list)
- Auto-generated based on baby's DOB + Australian requirements
- Collapsible weekly cards with grouped tasks
- Task types: 📌 Sticky | ⏰ Time-based | 🔗 Linked
- **Key Features**:
  - Birth registration, Medicare, Centrelink, immunizations
  - Maternal health nurse checkups
  - Custom tasks (photo shoots, thank you cards)
  - "What to expect" bubbles for each milestone
  - Partner sync capability
  - Upload appointment letters/documents

### 3. **Local Info Tab (Australian Admin)**
**Purpose**: Localised step-by-step admin wizards
- **Categories**:
  - 🗂️ Registrations (Birth cert, BRS form)
  - 💳 Health & Medicare (Medicare, My Health Record)
  - 💰 Centrelink & Payments (FTB, Parental Leave Pay)
  - 💉 Immunisations (Schedule + state-specific info)
  - 🧸 Childcare & School (CCS, daycare prep)
  - ✈️ Travel & Identity (Passport applications)
  - ❤️ Support Services (PANDA, Beyond Blue, MHN contacts)
- **Smart Features**:
  - Step-by-step wizards for complex processes
  - PDF upload/save documents
  - Reminder follow-ups for incomplete processes

### 4. **Calendar Tab**
**Purpose**: Sync with mum's existing calendar
- Auto-generated from timeline tasks
- Views: Week (default), Month, List
- Sync with Google/Apple/Outlook calendars
- Shareable with partner/co-parent
- "Me Time" blocks for self-care
- Milestone tracking events

### 5. **AI Smart Helper Tab (Premium)** 🆕
**Purpose**: Personal assistant for overwhelmed mums
- Context-aware chat based on baby's age + user profile
- Example queries:
  - "Is 5 dirty nappies normal for 3-week-old?"
  - "Where do I send Centrelink proof of birth?"
  - "What pump parts need replacing?"
- Document scanner: Photo forms → AI guidance
- Smart suggestions based on due tasks
- **Monetization**: 5 questions/month free → Premium unlimited

## Essential Features (Phase 1 - MVP)

### 1. **Onboarding & Baby Profile Setup** 🆕
**Purpose**: Personalised from the start
- Account creation (email, Apple ID, Google)
- Baby's due date or date of birth
- Single baby or twins
- Gender, height, weight, head circumference
- Feeding method (breastfeeding, bottle, mixed)
- Birth type (vaginal, c-section)
- Australian state (for localised tasks)
- Optional: Partner/co-parent info for sharing

### 2. **Smart Timeline Generation**
Based on baby's DOB + state + profile:
- **Week 1**: Register birth, submit to Centrelink, MHN appointment
- **Week 4**: MHN appointment
- **Week 6**: Immunisations, mum's GP check
- **Week 8**: MHN appointment, 2-month immunisations
- **Week 16**: MHN appointment, 4-month immunisations
- **Month 6**: 6-month immunisations
- Auto-populates with Australian immunisation schedule

### 3. **Mum-Focused UX Enhancements** 🆕
- **"Me Time" Nudges**: 
  - "You haven't logged rest today — take 10 mins 💆‍♀️"
  - "You're doing great — remember to hydrate"
  - Weekly self-care summaries
- **Smart Suggestions**:
  - "You're due for 6-week GP check — book now?"
  - "Baby turns 4 months next week — plan immunisations"
- **Empathetic Language**: Calm, supportive, encouraging tone

## Technical Architecture (Updated)

### Frontend Stack
- **Framework**: Next.js 15 with TypeScript (App Router)
- **UI**: Tailwind CSS with soft, mum-friendly design system
- **State**: Zustand for global state
- **Animations**: Gentle, calming transitions (Framer Motion)
- **Icons**: Heroicons with custom mum/baby icons

### Backend & Data
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth with family sharing
- **AI**: OpenAI API for Smart Helper (premium feature)
- **Calendar**: Google/Apple/Outlook API integration
- **Notifications**: Gentle push notifications for tasks

### Australian Data Integration
- **Immunisation Schedule**: Official Australian Government schedule
- **State Resources**: Government links by state/territory  
- **Forms & Processes**: Step-by-step wizards for admin tasks

## Business Model (Freemium)

### Free Tier (Customer Acquisition)
- Complete timeline checklist
- Local admin info access  
- Basic calendar sync
- 5 AI Smart Helper questions/month
- Single baby profile

### Premium Tier ($9.99/month)
- Unlimited AI Smart Helper access
- Multiple baby profiles
- Advanced calendar features
- Document scanning & storage
- Partner/family sharing
- Priority support
- "Me Time" analytics & insights

## Development Roadmap

### Phase 1: MVP Foundation (Weeks 1-6)
1. **Week 1-2**: Onboarding flow + baby profile setup
2. **Week 3**: Today tab with timeline view
3. **Week 4**: Weekly timeline checklist (card format)
4. **Week 5**: Local info categories with admin wizards
5. **Week 6**: Basic calendar integration

### Phase 2: Enhanced UX (Weeks 7-12)  
1. **Week 7-8**: "Me Time" nudges + smart suggestions
2. **Week 9-10**: Document upload + form assistance
3. **Week 11-12**: Partner sharing + family sync

### Phase 3: Premium Features (Weeks 13-18)
1. **Week 13-14**: AI Smart Helper integration
2. **Week 15-16**: Document scanner + AI guidance
3. **Week 17-18**: Advanced analytics + insights

## Success Metrics (Mum-Focused)

### User Engagement
- **Mental Load Reduction**: Tasks completed per week
- **Stress Indicators**: "Me Time" logging frequency
- **Admin Completion**: Government tasks finished on time
- **Self-Care**: Usage of wellness features

### Business Metrics  
- **Free-to-Paid Conversion**: Target 15-20%
- **Retention**: Focus on mums in 0-6 month phase
- **Support Reduction**: Fewer admin-related help requests

## Key Differentiators

1. **Mum-Centric Design**: Built specifically for overwhelmed new mothers
2. **Timeline-Based**: Weekly view reduces cognitive load
3. **Australian Admin**: Deep integration with government processes
4. **Empathetic AI**: Context-aware assistance for parenting questions
5. **Mental Load Focus**: Features designed to reduce stress, not add to it

## Immediate Changes Needed

1. **Update app branding** to be more mum-focused
2. **Change default view** from dashboard to "Today" timeline
3. **Redesign checklist** as weekly timeline cards (not lists)
4. **Add onboarding flow** for baby profile setup
5. **Include "Me Time" nudges** throughout the app
6. **Soften design** with pastels and gentle animations

This revised planning aligns with the founder's vision of reducing the mental load for overwhelmed new mums through personalised, timeline-based organisation.