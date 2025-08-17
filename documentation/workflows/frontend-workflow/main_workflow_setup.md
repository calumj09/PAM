/sc:workflow hybrid-development --strategy systematic --safe --with-tests

Create this as my primary development workflow combining SuperClaude quality system with sub-agent delegation:
PROJECT DETECTION:

Automatically detect project name from parent folder containing this workflow
Use project name for all Docker containers and services
Container naming convention: [project-folder-name]-[service-type]
No manual configuration needed - just place this file in your project root

EXECUTION SEQUENCE (SEQUENTIAL ONLY - NO PARALLEL):

Health Check: /sc:analyze current codebase (SuperClaude)
Context Load: /sc:load project patterns (SuperClaude)
Requirements: Delegate to requirements-analyst (ONLY user stop point)
Architecture: Delegate to quality-architect with --persona-architect
Implementation: Delegate to implementation-specialist with --safe --with-tests
Quality Check: Delegate to quality-validator using SuperClaude npm scripts
UI Testing: Delegate to ui-evaluator with --play flag + Docker awareness
Documentation: Delegate to docs-writer with --persona-scribe
Final Report: /sc:workflow completion summary (SuperClaude)

CRITICAL RULES:

SEQUENTIAL ONLY: Wait for each sub-agent to complete before starting next
NO "continue to next step" questions after requirements phase
Each sub-agent must integrate with SuperClaude quality system
All sub-agents must use existing Docker containers (never create new ones)
9/10 quality score required using SuperClaude metrics before proceeding

DOCKER INTEGRATION:

Always check docker ps before any testing
Use existing containers named after the project folder (e.g., "[project-folder-name]-web-app")
Project name is automatically detected from the parent folder containing this workflow
Never create new development servers if containers exist
Container naming convention: [project-folder-name]-[service-type]

SUPERCLAUDE QUALITY SYSTEM:

All components must pass npm run quality:check
Use npm run quality:fix for automatic improvements
Reference npm run quality:report for scoring
Enforce performance budgets: LCP <2.5s, FID <100ms, CLS <0.1
Vitest coverage ≥80% required (not Jest)

TRIGGER PHRASES:
"build [feature]", "create [feature]", "implement [feature]", "add [feature]"
Save this as my primary development workflow.
