# PAM Database Setup Instructions

## Quick Fix for Onboarding Error

The "An error occurred" message during onboarding is due to missing database columns. Here's how to fix it:

### Option 1: Safe Migration (Recommended for existing databases)

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy the entire contents of `/database/safe-migration.sql`
4. Paste and run it in the SQL editor
5. You should see "PAM safe migration complete!" message

This script safely adds only missing columns and tables without conflicts.

### Option 2: Complete Migration (For fresh databases)

1. Use `/database/complete-migration.sql` if starting fresh
2. This creates everything from scratch

### Option 2: Run Individual Migrations

If you want to run migrations incrementally:

1. First run `/database/schema.sql` (base schema)
2. Then run each file in `/supabase/migrations/` in order:
   - `20240125000006_add_chat_sessions.sql`
   - `20240125000007_add_subscriptions.sql`
   - `20240125000008_add_baby_profile_columns.sql`
   - `20240125000009_add_baby_tracker_tables.sql`

### What This Fixes

After running the migrations, you'll have:
- ✅ All baby profile fields saved (gender, measurements, feeding type, etc.)
- ✅ Checklist generation with full metadata
- ✅ AI chat functionality
- ✅ Subscription management
- ✅ Baby tracker features

### Verify Setup

After running migrations, test by:
1. Going through onboarding again
2. All fields should save without errors
3. Timeline should show personalized checklist items
4. AI Helper should work with premium features

### Troubleshooting

If you still see errors:
1. Check browser console (F12) for specific error messages
2. Verify all tables exist in Supabase Table Editor
3. Check that Row Level Security (RLS) policies are enabled

The app is designed to work with the full schema - cutting back features reduces the user experience!