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
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install golang.org/x/tools/cmd/goimports@latest
	@echo "✅ Go tools installed"