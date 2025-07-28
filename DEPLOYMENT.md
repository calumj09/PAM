# PAM App Deployment Guide

## Deployment on Render

### Prerequisites
1. A Render account (https://render.com)
2. A Supabase project (https://supabase.com)
3. Optional: API keys for enhanced features

### Environment Variables

Set these environment variables in your Render dashboard:

#### Required Variables
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App URL (Required)
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
```

#### Optional Variables (for enhanced features)
```bash
# Email Service (Optional - for family invitations)
RESEND_API_KEY=re_your_api_key_here

# AI Chatbot (Optional - for AI assistant)
OPENAI_API_KEY=sk-your-openai-api-key

# Calendar Sync (Optional - for Google Calendar)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Calendar Sync (Optional - for Outlook)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

### Build Settings

In your Render service settings:
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 22.16.0 (or latest LTS)

### Features Based on Configuration

#### Without Optional API Keys
The app will work with these core features:
- ✅ User authentication
- ✅ Baby profiles and tracking
- ✅ Growth tracking
- ✅ Medication management
- ✅ Checklists and milestones
- ✅ Basic analytics
- ✅ PWA functionality

#### With Optional API Keys
Additional features become available:
- 📧 **RESEND_API_KEY**: Email invitations for family sharing
- 🤖 **OPENAI_API_KEY**: AI chatbot assistant
- 📅 **GOOGLE/MICROSOFT**: Calendar synchronization

### Deployment Steps

1. **Fork/Clone the repository** to your GitHub account

2. **Create a new Web Service** on Render:
   - Connect your GitHub repository
   - Choose the main branch
   - Select "Node" as the environment

3. **Configure environment variables**:
   - Go to the "Environment" tab
   - Add all required variables
   - Add optional variables as needed

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for the build to complete

### Post-Deployment

1. **Database Setup**:
   - Run the Supabase migrations from `/supabase/migrations/`
   - Ensure all tables are created properly

2. **OAuth Setup** (if using calendar sync):
   - Add `https://your-app.onrender.com/api/auth/google/callback` to Google OAuth redirect URIs
   - Add `https://your-app.onrender.com/api/auth/outlook/callback` to Microsoft OAuth redirect URIs

3. **Email Domain Verification** (if using Resend):
   - Verify your sending domain in Resend dashboard
   - Update DNS records as instructed

### Troubleshooting

#### Build Fails with "Missing API key"
- The app is designed to work without optional API keys
- Ensure you're using the latest version with lazy-loaded services
- Check that environment variables are properly set

#### Features Not Working
- Check browser console for errors
- Verify API keys are correct and have proper permissions
- Ensure Supabase project is properly configured

#### Performance Issues
- Enable Render's auto-scaling if needed
- Consider upgrading to a paid plan for better performance
- Check Supabase connection pooling settings

### Security Notes

- Never commit `.env` files to git
- Use Render's environment variables for all secrets
- Regularly rotate API keys
- Enable Row Level Security (RLS) in Supabase

### Monitoring

- Use Render's built-in logs for debugging
- Set up Supabase dashboard for database monitoring
- Consider adding error tracking (e.g., Sentry) for production