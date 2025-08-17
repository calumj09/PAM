SuperClaude Frontend Workflow Setup Guide

For new developers joining the team
Overview
This guide sets up an automated frontend development workflow that enforces quality standards and uses AI agents to build components. The workflow ensures every component meets our 9/10 quality threshold before proceeding.
Prerequisites
Before starting, make sure you have:

✅ Claude Code installed and authenticated
✅ SuperClaude framework installed (pip install SuperClaude)
✅ Access to the project repository
✅ Node.js and npm/yarn installed

Step 1: Install SuperClaude
bash# Install SuperClaude
pip install SuperClaude

# Run the installer
SuperClaude install --quick

# Verify installation
claude --help | grep sc:
# You should see SuperClaude commands like /sc:analyze, /sc:build, etc.
Step 2: Configure the Hybrid Development Workflow
Copy and paste this ENTIRE block into Claude Code as one message:
/sc:workflow hybrid-development --strategy systematic --safe --with-tests

Create this as my primary development workflow combining SuperClaude quality system with sub-agent delegation:

PROJECT DETECTION:
- Automatically detect project name from parent folder containing this workflow
- Use project name for all Docker containers and services
- Container naming convention: [project-folder-name]-[service-type]
- No manual configuration needed - just place this file in your project root

EXECUTION SEQUENCE (SEQUENTIAL ONLY - NO PARALLEL):
1. Health Check: /sc:analyze current codebase (SuperClaude)
2. Context Load: /sc:load project patterns (SuperClaude)  
3. Requirements: Delegate to requirements-analyst (ONLY user stop point)
4. Architecture: Delegate to quality-architect with --persona-architect
5. Implementation: Delegate to implementation-specialist with --safe --with-tests
6. QUALITY GATE 1: Delegate to quality-validator - MUST LOOP UNTIL PASS
7. QUALITY GATE 2: Delegate to ui-evaluator - MUST LOOP UNTIL 9/10
8. Documentation: Delegate to docs-writer with --persona-scribe
9. Final Report: /sc:workflow completion summary (SuperClaude)

MANDATORY QUALITY GATE ENFORCEMENT:

QUALITY GATE 1 - Quality Validator Loop:
- quality-validator MUST achieve PASS status on npm run quality:check
- If quality-validator reports "critical issues" or "FAIL" status:
  - STOP the workflow
  - Loop back to implementation-specialist for fixes
  - Re-run quality-validator
  - Continue looping until quality:check PASSES
- DO NOT proceed to UI testing until quality validation PASSES

QUALITY GATE 2 - UI Evaluator Loop:  
- ui-evaluator MUST achieve 9/10 or higher score
- If ui-evaluator reports score below 9/10:
  - STOP the workflow
  - Loop back to implementation-specialist for UI improvements
  - Re-run ui-evaluator
  - Continue looping until 9/10 achieved
- DO NOT proceed to documentation until UI score ≥9/10

LOOP RULES:
- Maximum 3 improvement loops per quality gate
- After 3 failed loops, escalate to user with specific blocking issues
- Each loop must show measurable improvement
- Never continue with failing quality gates

WORKFLOW BLOCKING STATEMENTS:
- "Quality validator FAILED - Looping back for fixes"  
- "UI score X/10 BELOW THRESHOLD - Looping back for improvements"
- "Quality gates ENFORCED - Workflow cannot continue until resolved"

CRITICAL RULES:
- SEQUENTIAL ONLY: Wait for each sub-agent to complete before starting next
- NO "continue to next step" questions after requirements phase
- Each sub-agent must integrate with SuperClaude quality system
- All sub-agents must use existing Docker containers (never create new ones)
- 9/10 quality score required using SuperClaude metrics before proceeding
- ALWAYS include sign-out/logout functionality in navigation or user menu

DOCKER INTEGRATION:
- Always check `docker ps` before any testing
- Use existing containers named after the project folder (e.g., "[project-folder-name]-web-app")
- Project name is automatically detected from the parent folder containing this workflow
- Never create new development servers if containers exist
- Container naming convention: [project-folder-name]-[service-type]

SUPERCLAUDE QUALITY SYSTEM:
- All components must pass npm run quality:check
- Use npm run quality:fix for automatic improvements
- Reference npm run quality:report for scoring
- Enforce performance budgets: LCP <2.5s, FID <100ms, CLS <0.1
- Vitest coverage ≥80% required (not Jest)

TRIGGER PHRASES:
"build [feature]", "create [feature]", "implement [feature]", "add [feature]"

Save this as my primary development workflow.
Wait for confirmation that looks like this:
✅ Workflow Configuration Confirmed and Saved
Hybrid-Development Workflow Settings:
- Strategy: Systematic
- Quality Gates: ENFORCED (mandatory 9/10 UI + quality:check PASS)
- Execution Mode: Sequential with mandatory loops
- Safety Flags: --safe --with-tests enabled
- Project: [auto-detected from folder]
Step 3: Configure Sub-Agents (Optional Advanced Setup)
If you want to configure the individual sub-agents for better control, set up these specialized agents:
Requirements Analyst
Save this as requirements-analyst sub-agent:

You are the FIRST sub-agent in the development sequence. Take user feature requests and create detailed PRDs.

Process:
1. Read the user's feature request carefully
2. Ask clarifying questions if needed (ONLY stopping point for user input)
3. Create comprehensive PRD using this template:

# Feature: [Feature Name]

## Overview
[What this feature does and why it's needed]

## User Stories
- As a [user type], I want [goal] so that [benefit]

## Acceptance Criteria
- [ ] Specific, testable requirement 1
- [ ] Specific, testable requirement 2
- [ ] Must pass SuperClaude quality gates (9/10 score)
- [ ] Must achieve ≥80% Vitest test coverage

## Technical Requirements
- TypeScript strict mode
- Responsive design (mobile-first)
- Accessibility compliance (WCAG 2.1 AA)
- Performance budgets: LCP <2.5s, FID <100ms, CLS <0.1

When complete, state: "REQUIREMENTS COMPLETE - READY FOR ARCHITECTURE PHASE"
Continue with other sub-agents if desired, or use the main workflow which handles them automatically.
Step 4: Test the Setup
Test your setup with a simple component:
build user avatar component
You should see:

✅ Health check and context loading
⏸️ Stop for requirements (you provide feature details)
✅ Architecture design
✅ Implementation with tests
🔄 Quality validation (may loop if issues found)
🔄 UI testing (may loop if score < 9/10)
✅ Documentation generation
✅ Final report

Expected Workflow Behavior
✅ Correct Behavior:

Stops at requirements phase for your input
Loops at quality gates until they pass
Only proceeds when 9/10 quality achieved
Generates comprehensive tests and docs
Uses containers named after your project folder

❌ Wrong Behavior (If setup failed):

Continues past failing quality gates
Skips user requirements phase
Accepts scores below 9/10
Missing test coverage
Creates new containers instead of using existing ones

Quality Standards Enforced
Every component built will automatically include:

✅ TypeScript strict mode - No 'any' types allowed
✅ Vitest test suite - ≥80% coverage required
✅ Performance budgets - LCP <2.5s, FID <100ms, CLS <0.1
✅ Accessibility - WCAG 2.1 AA compliance
✅ Security - Input validation and XSS protection
✅ Mobile responsive - Works perfectly on all devices
✅ Error handling - Graceful failure states
✅ Documentation - Usage examples and API docs
✅ Authentication - Sign-out/logout functionality in navigation

Usage Examples
Once setup is complete, you can build features by saying:
bash# Simple components
"build loading spinner component"
"create user profile card"
"implement search input field"

# Complex features  
"build product carousel with lazy loading"
"create multi-step checkout flow"
"implement real-time chat widget"
The workflow will automatically:

Analyze your existing codebase
Ask you for specific requirements
Design the architecture
Build the component with tests
Validate quality (loop until 9/10)
Test UI functionality (loop until 9/10)
Generate documentation
Provide final summary

Troubleshooting
Common Issues:
"Workflow starts building without asking for requirements"

You pasted config instead of triggering workflow
Say: "Stop - I was configuring, not building. Wait for feature specification."

"Quality gates not enforcing (continues with failures)"

Re-run the workflow configuration from Step 2
Verify you see "Quality Gates: ENFORCED" in confirmation

"Can't find SuperClaude commands"

Re-install: SuperClaude install --quick
Restart Claude Code
Verify with: claude --help | grep sc:

"Docker containers not found"

Check container names with: docker ps
Ensure containers follow pattern: [project-folder-name]-[service-type]
Start containers if not running

"Sub-agents not following quality standards"

The main workflow handles this automatically
Manual sub-agent setup is optional/advanced

Team Standards
When to Use This Workflow:

✅ Building new UI components
✅ Implementing user-facing features
✅ Creating reusable design system elements
✅ Any frontend development requiring quality standards

When NOT to Use:

❌ Quick prototypes or throwaway code
❌ Simple configuration changes
❌ Bug fixes (unless adding new functionality)
❌ Backend-only changes

Project Setup Requirements
For this workflow to function properly, your project should have:

NPM Scripts in package.json:

json{
  "scripts": {
    "quality:check": "your-quality-check-command",
    "quality:fix": "your-quality-fix-command", 
    "quality:report": "your-quality-report-command"
  }
}

Docker Setup:


Containers named following the pattern: [project-folder-name]-[service-type]
Example: If your project folder is my-app, containers should be my-app-web-app, my-app-db, etc.


Test Framework:


Vitest configured with coverage reporting
Test files co-located with components or in __tests__ folders

Support
If you run into issues:

Check this guide first
Verify your project meets the setup requirements
Check Docker container names match the project folder pattern
Create GitHub issue with specific error messages
Include the exact commands you ran and error output

Summary
After setup, your development workflow becomes:

Say "build [feature name]"
Provide requirements when asked
Wait for high-quality component with tests and docs
Review and approve the 9/10 quality output

The system enforces quality standards automatically, so you can focus on product requirements rather than code quality concerns. The workflow automatically adapts to your project by detecting the folder name and using it for all Docker containers and services.
