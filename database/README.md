# PAM Database Setup

This folder contains the essential database schema and migration files for the PAM (Parent Admin Manager) application.

## 🚀 Quick Setup

For a fresh PAM installation, run these files **in order**:

### 1. **Core Database Schema**
```sql
-- Run this first to set up the complete database
production-final.sql
```

### 2. **Add Missing Features** (if needed)
```sql
-- If checklist/timeline not working
add-checklist-table.sql

-- If growth tracker not working or missing birth measurements
add-growth-tracking-fixed.sql
```

## 📋 File Descriptions

| File | Purpose | When to Use |
|------|---------|-------------|
| `production-final.sql` | **Complete database schema** with all core features | Fresh installation |
| `add-checklist-table.sql` | Adds timeline/checklist functionality | If timeline shows "No items found" |
| `add-growth-tracking-fixed.sql` | Adds growth tracker + migrates birth measurements | If growth tracker missing or no birth data |
| `archive-deploy-fix.sql` | Historical deployment fix | Archive only - do not use |

## ✅ What's Included in Core Schema

The `production-final.sql` includes:

- **User Management**: `profiles`, `subscriptions`
- **Child Profiles**: `children` with birth measurements
- **Timeline System**: `checklist_items` with Australian immunization schedule
- **AI Chat**: `chat_sessions`, `chat_messages`  
- **Basic Tracker**: `tracker_entries`
- **Security**: Row-level security policies
- **Australian Features**: State-based content, metric units

## 🔧 Missing Features Setup

### Timeline/Checklist Issues
If users see "No timeline items found":
```sql
-- Run this to add checklist functionality
\i add-checklist-table.sql
```

### Growth Tracker Issues  
If growth tracker is missing or birth measurements don't show:
```sql
-- Run this to add growth tracking + migrate birth data
\i add-growth-tracking-fixed.sql
```

## 🇦🇺 Australian Compliance

All schemas include:
- **Metric measurements** (cm, kg)
- **Date format**: DD/MM/YYYY
- **Australian immunization schedule**
- **State-based content delivery**
- **Healthcare provider integration**

## 🔒 Security Features

- **Row Level Security (RLS)** on all tables
- **User isolation** - users can only access their own data
- **Secure policies** for family sharing (when enabled)
- **API key protection** for external services

## 📊 Database Health

To check if everything is working:

```sql
-- Check core tables exist
SELECT schemaname, tablename 
FROM pg_catalog.pg_tables 
WHERE tablename IN ('children', 'checklist_items', 'growth_measurements', 'simple_activities');

-- Check sample data
SELECT COUNT(*) as children_count FROM children;
SELECT COUNT(*) as checklist_count FROM checklist_items;
```

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "No timeline items found" | Run `add-checklist-table.sql` |
| Growth tracker empty | Run `add-growth-tracking-fixed.sql` |
| Birth measurements missing | Growth tracking migration will fix this |
| Permission errors | Check RLS policies are enabled |
| Tracker not working | Ensure `simple_activities` table exists |

---

**Need help?** Check the main project README or contact the development team.