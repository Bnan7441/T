#!/bin/bash

# Mobile Optimization Test Script
# Tests UI on various device emulations and validates mobile features

set -e

echo "🔍 Running Mobile Optimization Tests..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

RESULTS_DIR="test-reports/mobile"
mkdir -p "$RESULTS_DIR"

# Test results tracking
PASSED=0
FAILED=0
TOTAL=0

test_result() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ $2${NC}"
        FAILED=$((FAILED + 1))
    fi
}

echo "📱 Starting mobile optimization validation..."

# 1. Viewport Meta Tag Check
echo "1️⃣ Checking viewport meta tag..."
if grep -q '<meta name="viewport"' tondino-frontend/index.html; then
    test_result 0 "Viewport meta tag present"
else
    test_result 1 "Viewport meta tag missing"
fi

# 2. Touch-friendly sizing check
echo "2️⃣ Checking touch-friendly button sizing..."
if grep -rq "min-w-\[48px\]" tondino-frontend/src/; then
    test_result 0 "Touch-friendly button sizing implemented"
else
    test_result 1 "Touch-friendly button sizing not found"
fi

# 3. Safe area support check
echo "3️⃣ Checking safe area support..."
if grep -rq "safe-area-inset" tondino-frontend/; then
    test_result 0 "Safe area support implemented"
else
    test_result 1 "Safe area support missing"
fi

# 4. Mobile navigation check
echo "4️⃣ Checking mobile navigation..."
if [ -f "tondino-frontend/src/components/MobileBottomNav.tsx" ]; then
    test_result 0 "Mobile bottom navigation exists"
else
    test_result 1 "Mobile bottom navigation missing"
fi

# 5. Responsive utilities check
echo "5️⃣ Checking responsive design utilities..."
if grep -rq "sm:\|md:\|lg:\|xl:" tondino-frontend/src/; then
    test_result 0 "Responsive design utilities in use"
else
    test_result 1 "Responsive design utilities missing"
fi

# 6. Touch feedback animations
echo "6️⃣ Checking touch feedback animations..."
if grep -rq "whileTap.*scale" tondino-frontend/src/; then
    test_result 0 "Touch feedback animations implemented"
else
    test_result 1 "Touch feedback animations missing"
fi

# 7. Performance optimizations
echo "7️⃣ Checking performance optimizations..."
if grep -rq "React.lazy\|React.memo" tondino-frontend/src/; then
    test_result 0 "Performance optimizations found"
else
    test_result 1 "Performance optimizations missing"
fi

# 8. PWA support
echo "8️⃣ Checking PWA support..."
if [ -f "tondino-frontend/public/manifest.json" ] && [ -f "tondino-frontend/public/sw.js" ]; then
    test_result 0 "PWA support files present"
else
    test_result 1 "PWA support incomplete"
fi

# 9. Offline support
echo "9️⃣ Checking offline support..."
if [ -f "tondino-frontend/public/offline.html" ]; then
    test_result 0 "Offline support page exists"
else
    test_result 1 "Offline support page missing"
fi

# 10. Build lighthouse test (if available)
echo "🔟 Running Lighthouse mobile audit (if available)..."
cd tondino-frontend
if command -v lighthouse &> /dev/null; then
    npm run build &> /dev/null || echo "Build failed, skipping lighthouse"
    if [ -d "dist" ]; then
        npx http-server dist -p 8080 -s &
        SERVER_PID=$!
        sleep 3
        
        lighthouse http://localhost:8080 \
            --only-categories=performance,accessibility,best-practices \
            --form-factor=mobile \
            --throttling-method=simulate \
            --output=json \
            --output-path="../$RESULTS_DIR/lighthouse-mobile.json" \
            --quiet &> /dev/null
        
        if [ $? -eq 0 ]; then
            test_result 0 "Lighthouse mobile audit completed"
        else
            test_result 1 "Lighthouse mobile audit failed"
        fi
        
        kill $SERVER_PID &> /dev/null || true
    else
        test_result 1 "Build output not found for lighthouse"
    fi
else
    echo -e "${YELLOW}⚠️ Lighthouse not installed, skipping audit${NC}"
fi
cd ..

# 11. Run existing cross-device tests
echo "1️⃣1️⃣ Running cross-device E2E tests..."
cd tondino-frontend
if npm test -- --run tests/cross-device.test.js &> "../$RESULTS_DIR/cross-device-test.log"; then
    test_result 0 "Cross-device E2E tests passed"
else
    test_result 1 "Cross-device E2E tests failed"
fi
cd ..

# Generate mobile test report
echo ""
echo "📊 Generating mobile optimization report..."

cat > "$RESULTS_DIR/mobile-optimization-report.md" << EOF
# Mobile Optimization Test Report

**Test Date:** $(date)
**Total Tests:** $TOTAL
**Passed:** $PASSED
**Failed:** $FAILED
**Pass Rate:** $(echo "scale=2; $PASSED * 100 / $TOTAL" | bc -l)%

## Test Results Summary

### ✅ Passing Tests
$([ $PASSED -gt 0 ] && echo "- $PASSED mobile optimization features working correctly")

### ❌ Failed Tests  
$([ $FAILED -gt 0 ] && echo "- $FAILED mobile optimization issues identified")

## Mobile Features Audit

### Core Mobile Features
- **Viewport Configuration**: $(grep -q '<meta name="viewport"' tondino-frontend/index.html && echo "✅ Configured" || echo "❌ Missing")
- **Touch Targets**: $(grep -rq "min-w-\[48px\]" tondino-frontend/src/ && echo "✅ Optimized" || echo "❌ Needs work")
- **Safe Area Support**: $(grep -rq "safe-area-inset" tondino-frontend/ && echo "✅ Implemented" || echo "❌ Missing")
- **Mobile Navigation**: $([ -f "tondino-frontend/src/components/MobileBottomNav.tsx" ] && echo "✅ Present" || echo "❌ Missing")

### Performance & UX
- **Responsive Design**: $(grep -rq "sm:\|md:\|lg:\|xl:" tondino-frontend/src/ && echo "✅ Responsive" || echo "❌ Static")
- **Touch Feedback**: $(grep -rq "whileTap.*scale" tondino-frontend/src/ && echo "✅ Animated" || echo "❌ No feedback")
- **Code Splitting**: $(grep -rq "React.lazy\|React.memo" tondino-frontend/src/ && echo "✅ Optimized" || echo "❌ Monolithic")

### PWA & Offline
- **PWA Support**: $([ -f "tondino-frontend/public/manifest.json" ] && [ -f "tondino-frontend/public/sw.js" ] && echo "✅ Enabled" || echo "❌ Disabled")
- **Offline Support**: $([ -f "tondino-frontend/public/offline.html" ] && echo "✅ Available" || echo "❌ Missing")

## Recommendations

$(if [ $FAILED -gt 0 ]; then
cat << REC
### Immediate Actions Required
1. Fix failed mobile optimization tests
2. Ensure all touch targets meet 48px minimum
3. Implement missing responsive breakpoints
4. Add touch feedback animations where missing

### Performance Improvements
- Consider implementing virtual scrolling for long lists
- Add image lazy loading optimizations
- Implement service worker caching strategies
- Optimize bundle size for mobile networks

REC
else
echo "### ✅ All mobile optimization tests passed!"
echo "Continue monitoring mobile performance metrics."
fi)

## Next Steps
1. Review detailed lighthouse report (if generated)
2. Test on actual devices when possible
3. Monitor Core Web Vitals for mobile users
4. Regular mobile optimization regression testing

---
*Report generated by Tondino mobile optimization test suite*
EOF

echo -e "${GREEN}✅ Mobile optimization testing completed!${NC}"
echo -e "📊 Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC} out of $TOTAL tests"
echo -e "📄 Full report: $RESULTS_DIR/mobile-optimization-report.md"

# Exit with error if any tests failed
exit $FAILED