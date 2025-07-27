# PAM Archive

This folder contains historical files from PAM development that are no longer actively used but preserved for reference.

## 📁 Archive Contents

### `database-experiments/`
Various database schema attempts before the final working version:
- `production-schema.sql` - Initial attempt
- `production-schema-fixed.sql` - Fixed version attempt  
- `complete-migration.sql` - Comprehensive attempt
- `safe-migration.sql` - Safe migration attempt
- Other experimental schemas

**✅ Current working schema:** `/database/production-final.sql`

### `database-fixes/`
Emergency fixes applied during development:
- `cleanup-recursion.sql` - Fixed infinite recursion in policies
- `fix-children-table.sql` - Added missing columns
- `quick-fix.sql` - Fast cleanup scripts

### `old-docs/`
Previous documentation versions:
- `DATABASE-SETUP.md` - Original setup instructions
- `PRODUCTION-SETUP.md` - Initial production guide

**✅ Current docs:** Root level markdown files

### `old-migrations/`
Previous migration approaches:
- `supabase-migrations/` - Old Supabase migration files
- `lib-migrations/` - Application-level migrations

**✅ Current approach:** Direct SQL execution of production schema

### Existing Archives
- `demo-files/` - Demo and prototype files
- `old-database-files/` - Early database experiments
- `old-deployment-configs/` - Previous deployment configurations
- `planning-docs/` - Initial planning documents

## 🎯 Archive Purpose

These files document the development journey and can be referenced for:
- Understanding past technical decisions
- Recovering specific solutions if needed
- Learning from what didn't work
- Historical context for code reviews

**Active development should use files in the root directory only.**