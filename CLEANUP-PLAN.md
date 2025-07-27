# PAM Project Cleanup Plan

## 🎯 Goal: Clean, organized project structure for production

## ✅ Files to KEEP (Active/Production)

### Core Documentation
- `PAM-MASTER-PLAN.md` - Master planning document
- `design.md` - Design system guidelines  
- `claude.md` - Development instructions
- `README.md` - Project overview
- `DEV-LOG.md` - Session tracking

### Production Database
- `database/production-final.sql` - **THE working schema**
- `database/add-missing-column.sql` - Final fix that worked

### Core Application
- `src/` - All application code (keep entire folder)
- `public/` - Static assets
- `package.json`, `package-lock.json` - Dependencies
- `next.config.ts`, `tailwind.config.ts`, `tsconfig.json` - Config
- `eslint.config.mjs`, `postcss.config.mjs` - Build tools

## 🗂️ Files to ARCHIVE (Move to archive folder)

### Failed/Experimental Database Files
- `database/schema.sql` → `archive/database-experiments/`
- `database/complete-migration.sql` → `archive/database-experiments/`
- `database/complete-schema.sql` → `archive/database-experiments/`
- `database/production-schema.sql` → `archive/database-experiments/`
- `database/production-schema-fixed.sql` → `archive/database-experiments/`
- `database/safe-migration.sql` → `archive/database-experiments/`
- `database/baby-tracker-schema.sql` → `archive/database-experiments/`
- `database/calendar-schema.sql` → `archive/database-experiments/`
- `database/check-schema.sql` → `archive/database-experiments/`

### Emergency Fixes (Historical Record)
- `database/cleanup-recursion.sql` → `archive/database-fixes/`
- `database/fix-children-table.sql` → `archive/database-fixes/`
- `database/fix-policy-recursion.sql` → `archive/database-fixes/`
- `database/quick-fix.sql` → `archive/database-fixes/`

### Documentation Archives
- `DATABASE-SETUP.md` → `archive/old-docs/`
- `PRODUCTION-SETUP.md` → `archive/old-docs/`

### Old Migration Files
- `supabase/migrations/` → `archive/old-migrations/`
- `src/lib/supabase/migrations/` → `archive/old-migrations/`

## 🗑️ Files to DELETE (Unused/Redundant)

### Render Deployment (if not using Render)
- `render.yaml` - Delete if using different deployment

### Empty/Unused Folders
- `src/lib/firebase/` - If not using Firebase
- `src/lib/utils/` - If empty

## 📁 Final Clean Structure

```
pam-app/
├── README.md
├── PAM-MASTER-PLAN.md
├── design.md
├── claude.md
├── DEV-LOG.md
├── database/
│   ├── production-final.sql         # THE working schema
│   └── add-missing-column.sql       # Final fix
├── archive/                         # All old/experimental files
│   ├── database-experiments/
│   ├── database-fixes/
│   ├── old-docs/
│   ├── old-migrations/
│   └── [existing archive content]
├── src/                             # Application code
├── public/                          # Static assets
└── [config files]
```

## 🎯 Benefits of Cleanup

1. **Clear production schema** - Only `production-final.sql` + fix
2. **Organized history** - All experiments archived, not deleted
3. **Faster development** - No confusion about which files to use
4. **Clean repository** - Professional structure for team collaboration
5. **Easy maintenance** - Clear separation of active vs archived code

Ready to execute this cleanup plan?