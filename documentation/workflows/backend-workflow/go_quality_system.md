# Go Quality System Setup

**Copy and paste this into Claude Code to configure the Go quality system:**

```
Configure comprehensive Go quality system equivalent to frontend npm scripts:

GO QUALITY SYSTEM COMMANDS:
Create these scripts in the backend project root as make targets:

```makefile
# Quality system for Go backend
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
```

GO QUALITY STANDARDS (9/10 Required):
Rate each API endpoint using backend-specific metrics:
✅ Code Quality (25%): go vet, staticcheck, golangci-lint compliance
✅ Test Coverage (25%): ≥80% coverage with go test
✅ Security (25%): gosec scanning, input validation, auth checks
✅ Performance (25%): Response times <200ms, efficient MongoDB queries

QUALITY SYSTEM INTEGRATION:
- All Lambda functions must pass `make quality-check`
- Use `make quality-fix` for automatic formatting/imports
- Reference `make quality-report` for scoring
- Enforce ≥80% test coverage with `make test-coverage`
- Validate performance with `make analyze-performance`

BACKEND PERFORMANCE BUDGETS:
- API Response Time: <200ms (99th percentile)
- MongoDB Query Time: <50ms average
- Lambda Cold Start: <500ms
- Memory Usage: <128MB per function
- Concurrent Connections: Handle 1000+ simultaneous requests
```