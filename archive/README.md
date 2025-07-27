# PAM Archive

This directory contains historical files that have been cleaned up from the main project to maintain clarity and focus.

## Archive Contents:

### `/planning-docs/`
- Historical planning documents (Planning.md, planning-revised.md, Founder.md)
- **Replaced by**: `PAM-MASTER-PLAN.md` in root directory

### `/demo-files/`
- Demo HTML files and documentation
- *_DEMO.md files for various features
- simple-server.js and other demo utilities
- **Status**: Demos served their purpose during development

### `/old-deployment-configs/`
- Legacy deployment configurations
- Firebase, Vercel, and Render setup files
- Migration instructions from old setups
- **Status**: Replaced by current deployment pipeline

### `/old-database-files/`
- Duplicate database schema files
- Old migration scripts
- **Status**: Consolidated into main database/ directory

## Current Active Structure:

```
/PAM/pam-app/
├── PAM-MASTER-PLAN.md      # 📋 Single source of truth for planning
├── design.md               # 🎨 UI/UX design guidelines
├── claude.md               # 💻 Technical implementation guide
├── README.md               # 📖 Project overview
├── src/                    # 💡 Clean, organized source code
├── database/               # 🗄️ Active database schemas
└── archive/                # 📦 This directory
```

## Cleanup Benefits:
- ✅ Reduced cognitive load when navigating project
- ✅ Single source of truth for planning (PAM-MASTER-PLAN.md)
- ✅ Cleaner development environment
- ✅ Faster file searches and IDE performance
- ✅ Clear separation of active vs historical files

*Archived on: July 2025*
*Cleanup performed as part of project organization phase*