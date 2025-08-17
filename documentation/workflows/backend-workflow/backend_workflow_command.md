# Backend Workflow - Main Command

**Copy and paste this into Claude Code to set up the main backend workflow:**

```
/sc:workflow backend-serverless-development --strategy systematic --safe --with-tests

Create this as my primary backend development workflow for Go Lambda functions with legacy integration:

EXECUTION SEQUENCE (SEQUENTIAL ONLY - NO PARALLEL):
1. Legacy Analysis: Delegate to legacy-analyzer (analyze existing 70% Go codebase)
2. Context Load: /sc:load backend patterns and MongoDB schemas (SuperClaude)
3. Requirements: Delegate to api-mapper (map frontend PRDs to backend APIs - ONLY user stop point)
4. Migration Design: Delegate to migration-architect (AngryPay → wallet migration strategy)
5. Implementation: Delegate to serverless-builder (Go Lambda functions with --safe --with-tests)
6. Quality Check: Delegate to backend-quality-validator (Go quality system)
   - If quality <9/10: Auto-delegate to code-optimizer → return to quality check
   - If performance <9/10: Auto-delegate to performance-optimizer → return to quality check
7. AWS Integration: Delegate to aws-deployer (Amplify deployment preparation)
8. Final Report: /sc:workflow completion summary (SuperClaude)

AUTO-IMPROVEMENT INTEGRATION:
- Quality gates MUST achieve 9/10 before proceeding
- Failed quality automatically triggers code-optimizer
- Failed performance automatically triggers performance-optimizer
- Improvement agents loop back to validation until 9/10 achieved
- No manual intervention required for quality improvements

CRITICAL RULES:
- SEQUENTIAL ONLY: Wait for each sub-agent to complete before starting next
- NO "continue to next step" questions after requirements phase
- All sub-agents must work with existing 70% Go codebase
- Always use MongoDB Atlas (never suggest RDS/DocumentDB)
- AWS Serverless-first approach: Lambda + API Gateway + Amplify
- 9/10 quality score required using Go quality system before proceeding

LEGACY INTEGRATION REQUIREMENTS:
- Analyze existing Go codebase patterns before any new development
- Extend existing MongoDB schemas (don't recreate)
- Map existing API patterns to new requirements
- Preserve working functionality while adding new features
- Migrate AngryPay integration systematically

AWS SERVERLESS STACK:
- Runtime: Go Lambda functions
- API: AWS API Gateway
- Database: MongoDB Atlas
- Auth: AWS Cognito integration with wallet system
- Email/SMS: AWS SES + SNS
- Storage: AWS S3
- Deployment: AWS Amplify (full-stack)

TRIGGER PHRASES:
"build backend for [feature]", "create API for [feature]", "implement backend [feature]", "add backend [feature]"

Save this as my primary backend development workflow.
```