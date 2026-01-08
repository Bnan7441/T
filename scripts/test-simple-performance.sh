#!/bin/bash

# Simple Performance Validation Script
# Tests basic performance metrics without requiring full database setup

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

RESULTS_DIR="test-reports/performance"
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}🚀 Simple Performance Validation${NC}"

# Test build performance
echo -e "${BLUE}1️⃣ Build Performance Test${NC}"
cd tondino-backend

echo "Testing backend build..."
BUILD_START=$(date +%s%N)
npm run build > /dev/null 2>&1
BUILD_END=$(date +%s%N)
BUILD_TIME=$((($BUILD_END - $BUILD_START) / 1000000))

if [ $BUILD_TIME -lt 10000 ]; then
    echo -e "${GREEN}✓ Backend build: ${BUILD_TIME}ms (Target: <10s)${NC}"
    BACKEND_BUILD_PASS=1
else
    echo -e "${RED}✗ Backend build: ${BUILD_TIME}ms (Target: <10s)${NC}"
    BACKEND_BUILD_PASS=0
fi

cd ../tondino-frontend
echo "Testing frontend build..."
FRONTEND_BUILD_START=$(date +%s%N)
npm run build > /dev/null 2>&1
FRONTEND_BUILD_END=$(date +%s%N)
FRONTEND_BUILD_TIME=$((($FRONTEND_BUILD_END - $FRONTEND_BUILD_START) / 1000000))

if [ $FRONTEND_BUILD_TIME -lt 30000 ]; then
    echo -e "${GREEN}✓ Frontend build: ${FRONTEND_BUILD_TIME}ms (Target: <30s)${NC}"
    FRONTEND_BUILD_PASS=1
else
    echo -e "${RED}✗ Frontend build: ${FRONTEND_BUILD_TIME}ms (Target: <30s)${NC}"
    FRONTEND_BUILD_PASS=0
fi

cd ..

# Test bundle sizes
echo ""
echo -e "${BLUE}2️⃣ Bundle Size Analysis${NC}"

# Backend bundle size (TypeScript compilation)
BACKEND_SIZE=$(du -sk tondino-backend/dist/ 2>/dev/null | cut -f1 || echo "0")
if [ $BACKEND_SIZE -lt 1024 ]; then # Less than 1MB
    echo -e "${GREEN}✓ Backend bundle: ${BACKEND_SIZE}KB (Target: <1MB)${NC}"
    BACKEND_SIZE_PASS=1
else
    echo -e "${YELLOW}⚠ Backend bundle: ${BACKEND_SIZE}KB (Target: <1MB)${NC}"
    BACKEND_SIZE_PASS=0
fi

# Frontend bundle size
FRONTEND_SIZE=$(du -sk tondino-frontend/dist/ 2>/dev/null | cut -f1 || echo "0")
if [ $FRONTEND_SIZE -lt 5120 ]; then # Less than 5MB
    echo -e "${GREEN}✓ Frontend bundle: ${FRONTEND_SIZE}KB (Target: <5MB)${NC}"
    FRONTEND_SIZE_PASS=1
else
    echo -e "${YELLOW}⚠ Frontend bundle: ${FRONTEND_SIZE}KB (Target: <5MB)${NC}"
    FRONTEND_SIZE_PASS=0
fi

# Test startup time
echo ""
echo -e "${BLUE}3️⃣ Application Startup Test${NC}"

echo "Testing backend startup time..."
STARTUP_START=$(date +%s%N)
timeout 10s npm --prefix tondino-backend start > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

# Check if process is still running (indicates successful start)
if kill -0 $SERVER_PID 2>/dev/null; then
    STARTUP_END=$(date +%s%N)
    STARTUP_TIME=$((($STARTUP_END - $STARTUP_START) / 1000000))
    echo -e "${GREEN}✓ Backend startup: ${STARTUP_TIME}ms (Successfully started)${NC}"
    STARTUP_PASS=1
    kill $SERVER_PID 2>/dev/null || true
else
    echo -e "${RED}✗ Backend startup: Failed to start within 3 seconds${NC}"
    STARTUP_PASS=0
fi

# Code complexity analysis
echo ""
echo -e "${BLUE}4️⃣ Code Complexity Analysis${NC}"

# Count lines of code
BACKEND_LOC=$(find tondino-backend/src -name "*.ts" -exec wc -l {} \; | awk '{sum+=$1} END {print sum}')
FRONTEND_LOC=$(find tondino-frontend/src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print $1}')

echo "Backend LOC: $BACKEND_LOC"
echo "Frontend LOC: $FRONTEND_LOC"

# Test count analysis
BACKEND_TESTS=$(find tondino-backend -name "*.test.*" | wc -l)
FRONTEND_TESTS=$(find tondino-frontend -name "*.test.*" | wc -l)

TEST_RATIO=$(echo "scale=2; ($BACKEND_TESTS + $FRONTEND_TESTS) / 2" | bc -l)

if [ "$(echo "$TEST_RATIO >= 3" | bc -l)" = "1" ]; then
    echo -e "${GREEN}✓ Test coverage: $BACKEND_TESTS backend + $FRONTEND_TESTS frontend tests${NC}"
    TEST_COVERAGE_PASS=1
else
    echo -e "${YELLOW}⚠ Test coverage: $BACKEND_TESTS backend + $FRONTEND_TESTS frontend tests (Consider more tests)${NC}"
    TEST_COVERAGE_PASS=0
fi

# Performance profiling (basic)
echo ""
echo -e "${BLUE}5️⃣ Static Performance Analysis${NC}"

# Check for performance anti-patterns
echo "Scanning for performance anti-patterns..."

# Check for console.log in production code
CONSOLE_LOGS=$(grep -r "console\." tondino-backend/src/ tondino-frontend/src/ 2>/dev/null | grep -v ".test." | wc -l || echo "0")
if [ $CONSOLE_LOGS -lt 5 ]; then
    echo -e "${GREEN}✓ Console statements: $CONSOLE_LOGS found (Target: <5)${NC}"
    CONSOLE_CHECK_PASS=1
else
    echo -e "${YELLOW}⚠ Console statements: $CONSOLE_LOGS found (Consider removing for production)${NC}"
    CONSOLE_CHECK_PASS=0
fi

# Check for TODO/FIXME comments
TODO_COUNT=$(grep -r "TODO\|FIXME" tondino-backend/src/ tondino-frontend/src/ 2>/dev/null | wc -l || echo "0")
echo "TODO/FIXME comments: $TODO_COUNT"

# Generate performance report
echo ""
echo -e "${BLUE}📊 Generating Performance Report${NC}"

TOTAL_TESTS=7
PASSED_TESTS=$((BACKEND_BUILD_PASS + FRONTEND_BUILD_PASS + BACKEND_SIZE_PASS + FRONTEND_SIZE_PASS + STARTUP_PASS + TEST_COVERAGE_PASS + CONSOLE_CHECK_PASS))

cat > "$RESULTS_DIR/simple-performance-report.md" << EOF
# Simple Performance Validation Report

**Test Date:** $(date)
**Total Tests:** $TOTAL_TESTS
**Passed:** $PASSED_TESTS
**Success Rate:** $(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)%

## Performance Metrics

### Build Performance
- **Backend Build Time**: ${BUILD_TIME}ms $([ $BACKEND_BUILD_PASS -eq 1 ] && echo "✅" || echo "❌")
- **Frontend Build Time**: ${FRONTEND_BUILD_TIME}ms $([ $FRONTEND_BUILD_PASS -eq 1 ] && echo "✅" || echo "❌")

### Bundle Analysis
- **Backend Bundle Size**: ${BACKEND_SIZE}KB $([ $BACKEND_SIZE_PASS -eq 1 ] && echo "✅" || echo "⚠️")
- **Frontend Bundle Size**: ${FRONTEND_SIZE}KB $([ $FRONTEND_SIZE_PASS -eq 1 ] && echo "✅" || echo "⚠️")

### Application Performance
- **Startup Time**: Successfully started $([ $STARTUP_PASS -eq 1 ] && echo "✅" || echo "❌")

### Code Quality
- **Backend Lines of Code**: $BACKEND_LOC
- **Frontend Lines of Code**: $FRONTEND_LOC
- **Test Files**: $BACKEND_TESTS backend + $FRONTEND_TESTS frontend $([ $TEST_COVERAGE_PASS -eq 1 ] && echo "✅" || echo "⚠️")
- **Console Statements**: $CONSOLE_LOGS $([ $CONSOLE_CHECK_PASS -eq 1 ] && echo "✅" || echo "⚠️")
- **TODO/FIXME**: $TODO_COUNT

## Performance Targets vs Actual

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Backend Build | <10s | ${BUILD_TIME}ms | $([ $BACKEND_BUILD_PASS -eq 1 ] && echo "✅ Pass" || echo "❌ Fail") |
| Frontend Build | <30s | ${FRONTEND_BUILD_TIME}ms | $([ $FRONTEND_BUILD_PASS -eq 1 ] && echo "✅ Pass" || echo "❌ Fail") |
| Backend Bundle | <1MB | ${BACKEND_SIZE}KB | $([ $BACKEND_SIZE_PASS -eq 1 ] && echo "✅ Pass" || echo "⚠️ Review") |
| Frontend Bundle | <5MB | ${FRONTEND_SIZE}KB | $([ $FRONTEND_SIZE_PASS -eq 1 ] && echo "✅ Pass" || echo "⚠️ Review") |
| Startup | <3s | Success | $([ $STARTUP_PASS -eq 1 ] && echo "✅ Pass" || echo "❌ Fail") |

## Recommendations

$(if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
echo "### ✅ All Performance Checks Passed!"
echo "- Build times are optimal"
echo "- Bundle sizes are reasonable"
echo "- Application starts successfully"
echo "- Code quality metrics look good"
else
echo "### ⚠️ Performance Improvements Needed"
[ $BACKEND_BUILD_PASS -eq 0 ] && echo "- Optimize backend build process"
[ $FRONTEND_BUILD_PASS -eq 0 ] && echo "- Optimize frontend build process"
[ $BACKEND_SIZE_PASS -eq 0 ] && echo "- Consider reducing backend bundle size"
[ $FRONTEND_SIZE_PASS -eq 0 ] && echo "- Optimize frontend bundle size (code splitting, tree shaking)"
[ $STARTUP_PASS -eq 0 ] && echo "- Fix application startup issues"
[ $TEST_COVERAGE_PASS -eq 0 ] && echo "- Add more test coverage"
[ $CONSOLE_CHECK_PASS -eq 0 ] && echo "- Remove console statements from production code"
fi)

## Next Steps for Full Performance Testing
1. Set up database for complete load testing
2. Run load tests with tools like Apache Bench or wrk
3. Implement performance monitoring
4. Test with realistic user scenarios
5. Optimize based on profiling results

---
*Report generated by Tondino simple performance validation*
EOF

echo -e "${GREEN}✅ Performance validation completed!${NC}"
echo -e "📊 Results: ${GREEN}$PASSED_TESTS passed${NC}, ${RED}$((TOTAL_TESTS - PASSED_TESTS)) failed${NC} out of $TOTAL_TESTS tests"
echo -e "📄 Report saved: $RESULTS_DIR/simple-performance-report.md"

exit $((TOTAL_TESTS - PASSED_TESTS))