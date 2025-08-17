# PAM Services Status & Configuration Guide

## Current Service Implementation Status

### ✅ Fully Working (No Additional Setup Required)
These features work out of the box with just Supabase configured:

1. **Core App Features**
   - User authentication (via Supabase Auth)
   - Baby profiles and management
   - Activity tracking (feeding, sleep, nappies)
   - Growth tracking and charts
   - Medication management
   - Checklists and milestones
   - Local admin info
   - Basic analytics
   - PWA functionality (offline support, installable)
   - Voice input for activities

2. **Data Storage & Sync**
   - All data stored in Supabase
   - Real-time synchronization
   - Offline data caching

### 🔧 Optional Services (Require Configuration)

#### 1. **Email Notifications** - Partially Working
**Status**: Code is complete, needs Resend API key

**What it does**:
- Sends family sharing invitations via email
- Sends email reminders for checklist items
- Sends notification digests

**To enable**:
1. Sign up at [Resend.com](https://resend.com)
2. Get your API key
3. Add to environment: `RESEND_API_KEY=re_your_key`
4. Verify your sending domain

**Without it**: 
- App works fine, just no emails sent
- Invitations still created (users need to share invite link manually)
- In-app notifications still work

#### 2. **Push Notifications** - Requires Firebase Setup
**Status**: Code is complete, needs Firebase configuration

**What it does**:
- Browser/mobile push notifications
- Checklist reminders
- Activity reminders
- Family updates

**To enable**:
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Cloud Messaging
3. Get your configuration values
4. Add all Firebase environment variables (see below)
5. Generate VAPID key for web push

**Without it**:
- App works fine without push notifications
- Users can still use email reminders (if configured)
- All features accessible, just no push alerts

#### 3. **AI Chatbot** - Partially Working
**Status**: Code is complete, needs OpenAI API key

**What it does**:
- Intelligent parenting advice
- Context-aware suggestions based on baby data
- Quick action suggestions
- Australian-specific guidance

**To enable**:
1. Get OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add to environment: `OPENAI_API_KEY=sk_your_key`

**Without it**:
- Chatbot UI still appears but returns generic error message
- All other features work normally

#### 4. **Calendar Sync** - Requires OAuth Setup
**Status**: Code is complete, needs OAuth configuration

**What it does**:
- Syncs checklist items to Google Calendar
- Syncs to Outlook Calendar
- Two-way sync for appointments

**To enable**:
1. Set up OAuth apps in Google/Microsoft
2. Add client IDs and secrets to environment
3. Configure redirect URLs

**Without it**:
- Calendar feature is hidden from settings
- Manual entry still works

## Quick Setup Priority

If you want to enable optional services, here's the recommended order:

### 1. **Email (Easiest)** - 10 minutes
```bash
RESEND_API_KEY=re_your_key
```
- Most bang for buck
- Easy setup
- Improves family sharing experience

### 2. **AI Chatbot** - 5 minutes
```bash
OPENAI_API_KEY=sk_your_key
```
- Simple API key setup
- Huge value add for users
- No complex configuration

### 3. **Push Notifications** - 30 minutes
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```
- More complex setup
- Requires Firebase project
- Service worker configuration

### 4. **Calendar Sync** - 45 minutes
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
```
- Most complex setup
- Requires OAuth app configuration
- Domain verification

## Testing Without Services

To test the app without any optional services:

1. **Email Testing**: 
   - Check browser console for "Email sending is disabled" messages
   - Family invitations still created in database

2. **Push Notification Testing**:
   - Settings will show "Push notifications not available"
   - Email reminders option still visible (if email configured)

3. **AI Chatbot Testing**:
   - Chat bubble appears
   - Returns friendly error message

4. **Calendar Testing**:
   - Calendar sync option hidden in settings
   - Manual calendar management still works

## Production Recommendations

### Minimum Viable Product (MVP)
Just Supabase - all core features work!

### Enhanced MVP
Add:
- Resend (emails) - $0/month for 3000 emails
- OpenAI (AI chat) - Pay per use

### Full Featured
Add:
- Firebase (push notifications) - Free tier generous
- OAuth (calendar sync) - Free

## Environment Variables Summary

### Required (Core Functionality)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
```

### Optional (Enhanced Features)
```bash
# Email
RESEND_API_KEY=

# AI Chatbot
OPENAI_API_KEY=

# Push Notifications
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Calendar Sync
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```