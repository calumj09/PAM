Claude Code Instructions for PAM App Development
Project Context
You are building PAM (Parent Admin Manager), a Progressive Web App designed to help Australian parents with children aged 0-3 years. This is a mobile-first application with a freemium business model.
📋 IMPORTANT: Before implementing any UI/UX, refer to Design.md for world-class design guidelines, component specifications, and Apple-quality design principles.
Your Development Approach
BMAD-METHOD Principles

Build: Start with functional features, not perfect ones
Measure: Implement analytics from the beginning
Analyze: Use data to guide improvements
Deploy: Ship incrementally and often

Design-First Development

Always consult Design.md before creating any UI components
Use shadcn/ui as the primary component library (as specified in Design.md)
Follow the PAM design system defined in both documents
Implement accessibility from the start, not as an afterthought

Initial Setup Instructions
1. Project Initialization
bash# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest pam-app --typescript --tailwind --app
cd pam-app

# Install shadcn/ui (Design.md primary requirement)
npx shadcn-ui@latest init

# Install essential dependencies
npm install @supabase/supabase-js zustand react-hook-form
npm install lucide-react # Primary icon library (Design.md)
npm install date-fns react-calendar
npm install workbox-precaching workbox-window
npm install react-speech-recognition
npm install recharts # For data visualization (Design.md)
npm install framer-motion # For animations (Design.md)
npm install sonner # For notifications (Design.md)
npm install vaul # For mobile drawers (Design.md)
2. Project Structure
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── features/    # Feature-specific components
│   └── layout/      # Layout components
├── lib/
│   ├── supabase/
│   ├── hooks/
│   └── utils/
├── styles/
│   └── globals.css
├── types/
└── public/
    └── manifest.json
3. Design System Setup
PAM Brand Colors (Design.md Integration)
javascript// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // PAM Brand Colors
        'pam-red': '#7D0820',
        'pam-pink': '#F9B1BC', 
        'pam-cream': '#FFFBF8',
        
        // shadcn/ui semantic colors (from Design.md)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#7D0820', // PAM red
          foreground: '#FFFBF8', // PAM cream
        },
        secondary: {
          DEFAULT: '#F9B1BC', // PAM pink
          foreground: '#7D0820',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
      fontFamily: {
        'heading': ['The Seasons', 'Brown Sugar', 'serif'],
        'body': ['Montserrat', 'Canva Sans', 'sans-serif'],
        'sans': ['Inter', 'Montserrat', 'system-ui', 'sans-serif'], // Design.md primary
      },
      // Design.md spacing scale
      spacing: {
        'xs': '0.5rem',
        'sm': '1rem', 
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '3rem',
        '2xl': '4rem',
      }
    }
  }
}
Component Implementation Guidelines
Always Use shadcn/ui First
Before creating any custom component, check if shadcn/ui has it:
bash# Install commonly needed components
npx shadcn-ui@latest add button card input form
npx shadcn-ui@latest add sheet dialog toast
npx shadcn-ui@latest add calendar checkbox select
npx shadcn-ui@latest add table badge avatar
PAM-Specific Component Examples
Primary Button (Following Design.md)
typescriptimport { Button } from "@/components/ui/button"

// Primary PAM button
<Button className="bg-pam-red hover:bg-pam-red/90 text-pam-cream">
  Get Started
</Button>

// Secondary PAM button  
<Button variant="secondary" className="bg-pam-pink hover:bg-pam-pink/90 text-pam-red">
  Learn More
</Button>
PAM Card Component
typescriptimport { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PAMCard({ children, title, className = "" }) {
  return (
    <Card className={`border-pam-pink/20 shadow-sm ${className}`}>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-pam-red font-heading">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
Feature Implementation Order
Phase 1: Foundation (Start Here)
1. Authentication System

Design: Follow Design.md form guidelines for clean, accessible forms
Components: Use shadcn/ui Form, Input, Button components
UX: Implement loading states and error handling per Design.md

typescript// Example auth form structure
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Follow Design.md form patterns
2. Database Schema
sql-- Users extended profile
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  state_territory TEXT,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children profiles  
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  is_premium_feature BOOLEAN DEFAULT FALSE
);

-- Checklist items
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT CHECK (category IN ('immunization', 'registration', 'milestone', 'checkup')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ
);
3. Core UI Components
CRITICAL: All components must follow Design.md specifications:

Use shadcn/ui as foundation
Implement proper loading states
Follow PAM color scheme
Ensure mobile-first responsive design
Include proper accessibility attributes

Phase 2: Core Features
1. Automated Checklist
Design Requirements:

Clean, scannable list layout (Design.md principles)
Clear completion states with smooth animations
Mobile-friendly touch targets (44px minimum)
Use Lucide icons for consistency

typescript// Implementation approach following Design.md
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Use Design.md animation guidelines for completion states
2. Baby Tracker
Design Requirements:

Quick action buttons using PAM design system
Voice input with clear visual feedback
Smooth transitions between states
Offline indicators following Design.md patterns

3. Local Admin Info Hub
Design Requirements:

Clean information hierarchy
Search functionality with proper UX patterns
Emergency contacts prominently displayed
State-based content organization

Phase 3: Premium Features
1. Calendar Integration
Design Requirements:

Clean calendar UI using shadcn/ui Calendar component
PAM brand colors for events
Smooth loading states for sync operations

2. AI Chatbot
Design Requirements:

Chat interface following Design.md conversation patterns
Clear medical disclaimers
Typing indicators and message states
Mobile-optimized input methods

3. Advanced Analytics
Design Requirements:

Use Recharts with PAM color scheme
Clean data visualization following Design.md principles
Export functionality with proper loading states

Development Guidelines
Code Style & Quality
typescript// Always use TypeScript strict mode
"strict": true,
"noImplicitAny": true,

// Follow Design.md component patterns
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'secondary';
}

// Implement proper error boundaries
// Use React.memo for performance
// Follow accessibility guidelines from Design.md
Performance Optimization (Design.md Requirements)

Implement code splitting with React.lazy
Use next/image for optimized images
Virtual scrolling for long lists
Smooth animations using Framer Motion
Respect user motion preferences

PWA Implementation
javascript// Service worker for offline support
// App manifest for installability  
// Push notifications setup
// Background sync for data
// Cache strategies per Design.md performance guidelines
Testing Strategy
Component Testing
typescript// Test shadcn/ui customizations
// Test PAM design system implementation
// Test accessibility compliance
// Test mobile interactions
Integration Testing

API endpoints with proper error handling
Database operations
Third-party integrations
Design system consistency

E2E Testing

Critical user journeys
Payment flows
Responsive design across devices
Performance benchmarks

Deployment & Monitoring
Environment Setup
envNEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
Analytics (Design.md User Experience Focus)
Track design system effectiveness:

Component usage patterns
User flow completion rates
Mobile vs desktop interactions
Feature adoption metrics
Performance metrics (Core Web Vitals)

Australian Compliance & UX
Localization

Australian date format (DD/MM/YYYY)
Australian English spelling
Local contact information formatting
State-based content delivery

Mobile-First Design (Design.md Requirements)

Touch targets minimum 44x44px
Swipe gestures for common actions
Bottom navigation for thumb access
Minimize text input where possible
Voice input alternatives

Accessibility (Design.md Standards)

WCAG 2.1 AA compliance
Screen reader compatibility
Keyboard navigation
Color contrast compliance
Motion reduction preferences

Quality Assurance Checklist
Before any feature release, verify:
Design Compliance

 Follows Design.md specifications
 Uses shadcn/ui components correctly
 Implements PAM color scheme properly
 Responsive across all breakpoints
 Smooth animations and transitions

UX Standards

 Loading states for all async operations
 Error handling with helpful messages
 Accessibility features implemented
 Mobile-first functionality verified
 Performance metrics meet Design.md standards

Code Quality

 TypeScript strict mode compliance
 Unit tests for critical functions
 Integration tests for user flows
 Documentation updated
 Security measures implemented

Remember: Design-First Development

Always reference Design.md before implementing any UI
Use shadcn/ui as the foundation for all components
Follow PAM brand guidelines consistently
Test on mobile devices first and foremost
Implement accessibility from the beginning
Performance is part of design - optimize for smooth interactions

The goal: Create an app so polished and intuitive that Australian parents can't imagine using anything else. Every interaction should feel natural, helpful, and delightful - just like the best Apple products.

## Important Session Notes (July 27, 2025)

### Database Schema Compatibility
The onboarding wizard has been modified to work with the base schema only. Extended columns (baby_type, gender, measurements, etc.) require running migrations in `/supabase/migrations/`. Until migrations are run, only basic baby profile data is saved.

### Development Continuity
Always check `DEV-LOG.md` for the latest session notes and work completed. This ensures continuity between sessions if connection is lost.

### Next Priorities
1. Timeline Tab Enhancement (core differentiator - weekly cards)
2. PWA Optimization (offline support, install prompt)
3. Premium Feature Polish (calendar sync, AI enhancements)