Backend Developer Setup Guide - SuperClaude + Go Workflow
Complete setup instructions for backend developers to get the SuperClaude Go Lambda workflow running on any project.
🎯 What You're Setting Up
This workflow will analyze your existing Go codebase (if any), build production-ready AWS Lambda functions, and enforce 9/10 quality standards with automatic improvements.
Key Features:

✅ Works with both new projects and existing codebases
✅ Supports multiple databases (MongoDB, PostgreSQL, DynamoDB, etc.)
✅ Optional migration from legacy systems
✅ Go Lambda functions with your chosen database
✅ Auto-improvement when quality gates fail
✅ AWS Amplify deployment ready


Step 1: SuperClaude Installation
Install SuperClaude Package
bash# Option A: From PyPI (Recommended)
pip install SuperClaude

# Option B: From Source  
git clone https://github.com/SuperClaude-Org/SuperClaude_Framework.git
cd SuperClaude
pip install .
Run SuperClaude Installer
bash# Quick setup (recommended for most users)
SuperClaude install --quick

# Or interactive selection if you want to choose components
SuperClaude install --interactive

# Verify installation
ls ~/.claude/
# Should show: CLAUDE.md, COMMANDS.md, settings.json, etc.
Test SuperClaude Installation
bash# In Claude Code, try:
/sc:help                    # See available commands
/sc:analyze README.md       # Test basic functionality

Step 2: Go Development Environment Setup
Install Required Go Tools
bash# Install Go quality tools
go install honnef.co/go/tools/cmd/staticcheck@latest
go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest  
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go install golang.org/x/tools/cmd/goimports@latest

# Install AWS SAM CLI (for Lambda deployment)
pip install aws-sam-cli

# Verify installations
staticcheck --version
gosec --version
golangci-lint --version
sam --version
Install Testing Dependencies
bash# Install testify for comprehensive testing
go mod tidy
# Add to your go.mod if not present:
# github.com/stretchr/testify v1.8.4
Create Go Quality System
Create a Makefile in your backend project root:
makefile# Quality system for Go backend
.PHONY: quality-check quality-fix quality-report test-coverage analyze-performance

quality-check:
    @echo "🔍 Running Go quality checks..."
    go vet ./...
    staticcheck ./...
    gosec ./...
    go test -race ./...
    golangci-lint run
    @echo "✅ Quality checks complete"

quality-fix:
    @echo "🔧 Applying Go quality fixes..."
    go fmt ./...
    go mod tidy
    goimports -w .
    @echo "✅ Quality fixes applied"

quality-report:
    @echo "📊 Generating Go quality report..."
    go test -coverprofile=coverage.out ./...
    go tool cover -html=coverage.out -o coverage.html
    go test -bench=. -benchmem ./...
    @echo "✅ Quality report generated"

test-coverage:
    @echo "🧪 Checking test coverage..."
    go test -coverprofile=coverage.out ./...
    go tool cover -func=coverage.out
    @coverage=$$(go tool cover -func=coverage.out | grep total | awk '{print $$3}' | sed 's/%//'); \
    if [ $$(echo "$$coverage < 80" | bc -l) -eq 1 ]; then \
        echo "❌ Coverage $$coverage% below 80% threshold"; \
        exit 1; \
    else \
        echo "✅ Coverage $$coverage% meets 80% threshold"; \
    fi

analyze-performance:
    @echo "⚡ Analyzing API performance..."
    go test -bench=. -benchmem ./...
    @echo "✅ Performance analysis complete"

install-tools:
    go install honnef.co/go/tools/cmd/staticcheck@latest
    go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
    go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
    go install golang.org/x/tools/cmd/goimports@latest
Test Go Quality System
bash# Run quality checks on existing code (if any)
make quality-check

# Fix any auto-fixable issues
make quality-fix

# Check test coverage
make test-coverage

Step 3: Project Configuration
Create Project Configuration File
Create a project.config file in your backend root:
bash# PROJECT CONFIGURATION
# Customize these values for your specific project

# Project Type: greenfield (new) or brownfield (existing code)
PROJECT_TYPE=brownfield

# Database Type: mongodb, postgresql, dynamodb, mysql
DATABASE_TYPE=mongodb

# Migration Settings
NEEDS_MIGRATION=false
MIGRATION_FROM=none  # Options: stripe, paypal, custom, none

# Project Details
PROJECT_DOMAIN=your-domain.com
PROJECT_NAME=[auto-detected from folder]

# AWS Settings
AWS_REGION=us-east-1
DEPLOYMENT_TYPE=serverless  # Options: serverless, container, ec2

Step 4: Backend Workflow Setup in Claude Code
Copy and paste each section into Claude Code, one at a time. Wait for confirmation before moving to the next.
4.1 Main Backend Workflow Command
/sc:workflow backend-serverless-development --strategy systematic --safe --with-tests

Create this as my primary backend development workflow for Go Lambda functions:

PROJECT DETECTION:
- Automatically detect project name from parent folder containing this workflow
- Use project name for all AWS resources and services
- Resource naming convention: [project-folder-name]-[resource-type]
- Read project.config for database type and migration needs

EXECUTION SEQUENCE (SEQUENTIAL ONLY - NO PARALLEL):
1. Project Analysis: 
   - If PROJECT_TYPE=brownfield: Delegate to legacy-analyzer (analyze existing Go codebase)
   - If PROJECT_TYPE=greenfield: Skip to Context Load
2. Context Load: /sc:load backend patterns and database schemas (SuperClaude)
3. Requirements: Delegate to api-mapper (map frontend PRDs to backend APIs - ONLY user stop point)
4. Migration Design (if NEEDS_MIGRATION=true): Delegate to migration-architect
5. Implementation: Delegate to serverless-builder (Go Lambda functions with --safe --with-tests)
6. Quality Check: Delegate to backend-quality-validator (Go quality system)
   - If quality <9/10: Auto-delegate to code-optimizer → return to quality check
   - If performance <9/10: Auto-delegate to performance-optimizer → return to quality check
7. AWS Integration: Delegate to aws-deployer (deployment preparation)
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
- All sub-agents must work with existing codebase (if present)
- Use database type from project.config
- AWS Serverless-first approach: Lambda + API Gateway + Amplify
- 9/10 quality score required using Go quality system before proceeding

PROJECT INTEGRATION REQUIREMENTS:
- Detect and use configured database type
- Analyze existing Go codebase patterns (if brownfield)
- Extend existing database schemas (don't recreate)
- Map existing API patterns to new requirements
- Preserve working functionality while adding new features
- Handle migration based on project.config settings

AWS SERVERLESS STACK:
- Runtime: Go Lambda functions
- API: AWS API Gateway
- Database: As configured in project.config
- Auth: AWS Cognito integration
- Email/SMS: AWS SES + SNS
- Storage: AWS S3
- Deployment: AWS Amplify (full-stack)

TRIGGER PHRASES:
"build backend for [feature]", "create API for [feature]", "implement backend [feature]", "add backend [feature]"

Save this as my primary backend development workflow.
4.2 Go Quality System Configuration
Configure comprehensive Go quality system equivalent to frontend npm scripts:

GO QUALITY SYSTEM COMMANDS:
All backend validation uses Makefile targets in project root:

```makefile
# Quality system for Go backend (already created above)
make quality-check    # Main quality validation
make quality-fix      # Apply automatic fixes  
make quality-report   # Generate detailed report
make test-coverage    # Verify ≥80% coverage
make analyze-performance # Performance metrics
make install-tools    # Install required tools
GO QUALITY STANDARDS (9/10 Required):
Rate each API endpoint using backend-specific metrics:
✅ Code Quality (25%): go vet, staticcheck, golangci-lint compliance
✅ Test Coverage (25%): ≥80% coverage with go test
✅ Security (25%): gosec scanning, input validation, auth checks
✅ Performance (25%): Response times <200ms, efficient database queries
BACKEND PERFORMANCE BUDGETS:

API Response Time: <200ms (99th percentile)
Database Query Time: <50ms average
Lambda Cold Start: <500ms
Memory Usage: <128MB per function
Concurrent Connections: Handle 1000+ simultaneous requests

QUALITY SYSTEM INTEGRATION:

All Lambda functions must pass make quality-check
Use make quality-fix for automatic formatting/imports
Reference make quality-report for scoring
Enforce ≥80% test coverage with make test-coverage
Validate performance with make analyze-performance


### 4.3 Sub-Agent Setup
Configure specialized sub-agents for better control. Each handles a specific part of the development workflow.

**Note:** Copy each sub-agent configuration into Claude Code one at a time.

---

## Step 5: AWS Environment Setup

### Configure AWS CLI
```bash
# Install AWS CLI if not present
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region, Output format (json)

# Test AWS connection
aws sts get-caller-identity
Set Up Environment Variables
Create .env file in your backend project:
bash# Project Configuration
PROJECT_NAME=[your-project-name]
ENVIRONMENT=dev
DEBUG=true
API_VERSION=v1

# Database Configuration (adjust based on your database type)
# For MongoDB:
DATABASE_URL=mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database-name]

# For PostgreSQL:
# DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database-name]

# For DynamoDB:
# AWS_REGION=us-east-1
# (DynamoDB uses IAM roles, no connection string needed)

# AWS Configuration  
AWS_REGION=us-east-1

# Authentication
JWT_SECRET=[generate-a-secure-secret-key]
COGNITO_USER_POOL_ID=[will-be-set-during-deployment]
COGNITO_CLIENT_ID=[will-be-set-during-deployment]

# Email Configuration (AWS SES)
FROM_EMAIL=noreply@[your-domain].com
ADMIN_EMAIL=admin@[your-domain].com

# Instructions for getting database connection strings:
# MongoDB Atlas:
# 1. Go to your Atlas dashboard
# 2. Click "Connect" on your cluster
# 3. Choose "Connect your application"
# 4. Copy the connection string and replace placeholders

# PostgreSQL:
# Use format: postgresql://username:password@host:port/database

# MySQL:
# Use format: mysql://username:password@host:port/database
Create AWS Resources (if needed)
bash# Get project name from current directory
PROJECT_NAME=$(basename "$PWD")

# Create S3 bucket for SAM deployments
aws s3 mb s3://${PROJECT_NAME}-sam-deployments

# Create Cognito User Pool (if not exists)
aws cognito-idp create-user-pool --pool-name "${PROJECT_NAME}-users"

Step 6: Project Structure Setup
Recommended Directory Structure
backend/
├── project.config             # Project configuration (created above)
├── Makefile                   # Quality system commands (created above)
├── template.yaml              # SAM template (generated by workflow)
├── samconfig.toml             # SAM configuration (generated by workflow)
├── .env                       # Environment variables (created above)
├── .env.example               # Template for environment variables
├── functions/                 # Lambda functions (generated by workflow)
│   ├── auth/
│   ├── [your-features]/
│   └── shared/
├── shared/                    # Shared Go modules
│   ├── auth/
│   ├── database/
│   └── utils/
├── [existing-code]/           # Your existing codebase (if brownfield)
└── docs/                      # API documentation

Step 7: Test the Workflow
Test SuperClaude Backend Workflow
bash# In Claude Code, test the workflow:
build backend for user authentication

# This should trigger:
# 1. Project detection (reads project.config)
# 2. Legacy analysis (if brownfield project)
# 3. Request for detailed PRD (this is where you provide requirements)
# 4. Architecture design (skip migration if not needed)
# 5. Implementation with your chosen database
# 6. Quality validation with auto-improvement
# 7. AWS deployment preparation
Expected Workflow Behavior
For Greenfield Projects:

Skip Legacy Analysis - No existing code to analyze
Context Loading - Loads patterns for your database type
Requirements Gathering - STOPS HERE for your PRD
Implementation - Builds from scratch
Quality Loop - Auto-improves until 9/10

For Brownfield Projects:

Legacy Analysis - Analyzes existing Go codebase
Context Loading - Loads existing patterns
Requirements Gathering - STOPS HERE for your PRD
Migration Design - Only if NEEDS_MIGRATION=true
Implementation - Extends existing code
Quality Loop - Auto-improves until 9/10


Step 8: Ongoing Usage
Daily Workflow Commands
bash# Build new backend features
build backend for [feature-name]
create API for [feature-name]  
implement backend [feature-name]

# All will trigger the same comprehensive workflow
Quality System Usage
bash# Run quality checks manually
make quality-check

# Fix issues automatically  
make quality-fix

# Check test coverage
make test-coverage

# Generate performance report
make analyze-performance
Deployment Commands
bash# Deploy to development
sam build
sam deploy --config-env dev

# Deploy to staging
sam deploy --config-env staging

# Deploy to production
sam deploy --config-env production

Database-Specific Notes
MongoDB

Use connection string from MongoDB Atlas
NoSQL patterns will be applied automatically
Good for flexible schemas

PostgreSQL

Use standard PostgreSQL connection string
SQL migrations will be generated
Good for relational data

DynamoDB

No connection string needed (uses AWS IAM)
Serverless-optimized patterns
Good for key-value storage

Custom Database

Add connection details to .env
Workflow will adapt patterns accordingly


Troubleshooting
Common Issues
"SuperClaude commands not found"
bash# Verify SuperClaude installation
SuperClaude --version

# Check Claude Code integration
ls ~/.claude/
"Go quality tools not found"
bash# Re-install tools
make install-tools

# Check PATH includes Go bin
echo $PATH | grep go
"AWS credentials not configured"
bash# Reconfigure AWS
aws configure

# Test connection
aws sts get-caller-identity
"Database connection failed"
bash# Check connection string format in .env
# Verify database is accessible
# Check firewall/security group settings
Getting Help
SuperClaude Issues:

Check GitHub: https://github.com/NomenAK/SuperClaude/issues
Verify installation with SuperClaude --version

Go Quality Issues:

Run make quality-check to see specific errors
Use make quality-fix for auto-fixes

AWS Deployment Issues:

Check sam logs for Lambda function logs
Verify AWS credentials with aws sts get-caller-identity


Success Criteria
✅ SuperClaude installed and responding to commands
✅ Go quality system passing on existing codebase (if any)
✅ Project configuration set up correctly
✅ Backend workflow triggers and detects project type
✅ Workflow stops at requirements phase for PRD input
✅ Quality gates enforce 9/10 score with auto-improvement
✅ AWS deployment configurations generated successfully
You're ready to use the backend workflow! 🚀
Just say "build backend for [feature]" in Claude Code and provide your detailed PRD when prompted.
