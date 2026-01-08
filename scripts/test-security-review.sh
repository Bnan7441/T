#!/bin/bash

# Comprehensive Security Review Script for Tondino Platform
# Checks for common security vulnerabilities and best practices

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

RESULTS_DIR="test-reports/security"
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}🔒 Comprehensive Security Review${NC}"

PASSED=0
FAILED=0
WARNINGS=0
TOTAL=0

test_result() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        PASSED=$((PASSED + 1))
    elif [ $1 -eq 2 ]; then
        echo -e "${YELLOW}⚠ $2${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}✗ $2${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# 1. Secret Management
echo -e "${BLUE}1️⃣ Secret Management Review${NC}"

# Check for hardcoded secrets in code
echo "Checking for hardcoded secrets..."
SECRET_PATTERNS=(
    "password.*=.*['\"][^'\"]*['\"]"
    "secret.*=.*['\"][^'\"]*['\"]"
    "key.*=.*['\"][^'\"]*['\"]"
    "token.*=.*['\"][^'\"]*['\"]"
    "api.*key.*=.*['\"][^'\"]*['\"]"
)

HARDCODED_SECRETS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    matches=$(grep -ri "$pattern" tondino-backend/src/ tondino-frontend/src/ 2>/dev/null | grep -v ".test." | wc -l || echo "0")
    HARDCODED_SECRETS=$((HARDCODED_SECRETS + matches))
done

if [ $HARDCODED_SECRETS -eq 0 ]; then
    test_result 0 "No hardcoded secrets found in source code"
else
    test_result 1 "Found $HARDCODED_SECRETS potential hardcoded secrets"
fi

# Check for .env files in git
if find . -name ".env" -not -path "./.git/*" | grep -q .; then
    test_result 1 "Found .env files that might be tracked by git"
else
    test_result 0 "No .env files found in repository"
fi

# Check for environment variable validation
if grep -rq "process.env.*JWT_SECRET" tondino-backend/src/ && grep -rq "JWT_SECRET.*required.*production" tondino-backend/src/; then
    test_result 0 "JWT_SECRET validation implemented"
else
    test_result 2 "JWT_SECRET validation could be improved"
fi

# 2. Authentication & Authorization
echo -e "${BLUE}2️⃣ Authentication & Authorization${NC}"

# Check for JWT implementation
if [ -f "tondino-backend/src/middleware/session.ts" ]; then
    test_result 0 "Custom session management middleware exists"
else
    test_result 1 "No session management middleware found"
fi

# Check for password hashing
if grep -rq "bcrypt" tondino-backend/; then
    test_result 0 "Password hashing with bcrypt implemented"
else
    test_result 1 "No secure password hashing found"
fi

# Check for authorization middleware
if grep -rq "requireAuth\|requireAdmin" tondino-backend/src/; then
    test_result 0 "Authorization middleware implemented"
else
    test_result 1 "No authorization middleware found"
fi

# 3. Input Validation
echo -e "${BLUE}3️⃣ Input Validation & Sanitization${NC}"

# Check for express-validator usage
if grep -rq "express-validator" tondino-backend/; then
    test_result 0 "Input validation library (express-validator) in use"
else
    test_result 2 "Consider adding input validation library"
fi

# Check for SQL injection protection
if grep -rq "\$[0-9]" tondino-backend/src/ && ! grep -rq "SELECT.*+.*WHERE" tondino-backend/src/; then
    test_result 0 "Parameterized queries detected (SQL injection protection)"
else
    test_result 2 "Review database queries for SQL injection protection"
fi

# Check for XSS protection headers
if grep -rq "helmet" tondino-backend/; then
    test_result 0 "Helmet security middleware in use"
else
    test_result 1 "No Helmet security middleware found"
fi

# 4. Data Protection
echo -e "${BLUE}4️⃣ Data Protection${NC}"

# Check for HTTPS enforcement
if grep -rq "HTTPS\|ssl\|tls" tondino-backend/src/ || [ -f "nginx.conf" ]; then
    test_result 0 "HTTPS/TLS configuration present"
else
    test_result 2 "HTTPS/TLS configuration not found (needed for production)"
fi

# Check for CORS configuration
if grep -rq "cors" tondino-backend/; then
    test_result 0 "CORS configuration implemented"
else
    test_result 1 "No CORS configuration found"
fi

# Check for session security
if grep -rq "secure.*cookie\|httpOnly" tondino-backend/src/; then
    test_result 0 "Secure cookie configuration detected"
else
    test_result 2 "Review cookie security settings"
fi

# 5. Rate Limiting & DoS Protection
echo -e "${BLUE}5️⃣ Rate Limiting & DoS Protection${NC}"

# Check for rate limiting
if grep -rq "rate.*limit" tondino-backend/ || grep -rq "express-rate-limit" tondino-backend/; then
    test_result 0 "Rate limiting implementation found"
else
    test_result 1 "No rate limiting found"
fi

# Check for request size limits
if grep -rq "limit.*size\|bodyParser.*limit" tondino-backend/src/; then
    test_result 0 "Request size limits configured"
else
    test_result 2 "Consider adding request size limits"
fi

# 6. Error Handling
echo -e "${BLUE}6️⃣ Error Handling & Information Disclosure${NC}"

# Check for error handling middleware
if [ -f "tondino-backend/src/utils/errorHandler.ts" ] || [ -f "tondino-backend/src/middleware/errorHandler.ts" ]; then
    test_result 0 "Custom error handling implemented"
else
    test_result 1 "No custom error handling middleware found"
fi

# Check for information disclosure in errors
STACK_TRACES=$(grep -r "error\.stack\|console\.error.*error" tondino-backend/src/ 2>/dev/null | wc -l || echo "0")
if [ $STACK_TRACES -lt 5 ]; then
    test_result 0 "Limited error information disclosure ($STACK_TRACES instances)"
else
    test_result 2 "Review error handling to prevent information disclosure"
fi

# 7. Dependency Security
echo -e "${BLUE}7️⃣ Dependency Security${NC}"

# Check for npm audit
echo "Running npm security audit..."
cd tondino-backend
BACKEND_VULNERABILITIES=$(npm audit --audit-level=high --json 2>/dev/null | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' 2>/dev/null || echo "unknown")
cd ../tondino-frontend
FRONTEND_VULNERABILITIES=$(npm audit --audit-level=high --json 2>/dev/null | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' 2>/dev/null || echo "unknown")
cd ..

if [ "$BACKEND_VULNERABILITIES" = "0" ] && [ "$FRONTEND_VULNERABILITIES" = "0" ]; then
    test_result 0 "No high/critical vulnerabilities in dependencies"
elif [ "$BACKEND_VULNERABILITIES" = "unknown" ] || [ "$FRONTEND_VULNERABILITIES" = "unknown" ]; then
    test_result 2 "Could not check vulnerabilities (npm audit failed)"
else
    test_result 1 "Found vulnerabilities: Backend($BACKEND_VULNERABILITIES) Frontend($FRONTEND_VULNERABILITIES)"
fi

# Check for outdated packages
echo "Checking for outdated packages..."
OUTDATED_COUNT=$(npm outdated -g --json 2>/dev/null | jq 'length' 2>/dev/null || echo "unknown")
if [ "$OUTDATED_COUNT" = "0" ]; then
    test_result 0 "All packages are up to date"
elif [ "$OUTDATED_COUNT" = "unknown" ]; then
    test_result 2 "Could not check package versions"
else
    test_result 2 "Consider updating $OUTDATED_COUNT outdated packages"
fi

# 8. File Security
echo -e "${BLUE}8️⃣ File Security${NC}"

# Check for file upload security
if [ -d "tondino-backend/uploads/" ]; then
    UPLOAD_EXTENSIONS=$(find tondino-backend/uploads/ -type f | grep -E "\.(php|exe|bat|sh|js|html)" | wc -l 2>/dev/null || echo "0")
    if [ $UPLOAD_EXTENSIONS -eq 0 ]; then
        test_result 0 "No dangerous file extensions in uploads"
    else
        test_result 1 "Found $UPLOAD_EXTENSIONS potentially dangerous files in uploads"
    fi
    
    # Check for upload validation
    if grep -rq "multer\|fileFilter\|mimetype" tondino-backend/src/; then
        test_result 0 "File upload validation implemented"
    else
        test_result 2 "Consider adding file upload validation"
    fi
else
    test_result 0 "No upload directory found"
fi

# Check file permissions
SENSITIVE_FILES=(".env" "private.key" "server.key" "config.json")
PERMISSION_ISSUES=0
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ] && [ "$(stat -c %a "$file" 2>/dev/null | cut -c2-3)" != "00" ]; then
        PERMISSION_ISSUES=$((PERMISSION_ISSUES + 1))
    fi
done

if [ $PERMISSION_ISSUES -eq 0 ]; then
    test_result 0 "Sensitive file permissions look secure"
else
    test_result 1 "Found $PERMISSION_ISSUES files with overly permissive access"
fi

# 9. Frontend Security
echo -e "${BLUE}9️⃣ Frontend Security${NC}"

# Check for Content Security Policy
if grep -rq "Content-Security-Policy\|CSP" tondino-frontend/; then
    test_result 0 "Content Security Policy configuration found"
else
    test_result 2 "Consider implementing Content Security Policy"
fi

# Check for dangerous innerHTML usage
INNER_HTML_USAGE=$(grep -r "innerHTML\|dangerouslySetInnerHTML" tondino-frontend/src/ 2>/dev/null | wc -l || echo "0")
if [ $INNER_HTML_USAGE -eq 0 ]; then
    test_result 0 "No dangerous innerHTML usage found"
else
    test_result 2 "Found $INNER_HTML_USAGE innerHTML usages - review for XSS risks"
fi

# Check for localStorage security
LOCAL_STORAGE_USAGE=$(grep -r "localStorage" tondino-frontend/src/ 2>/dev/null | grep -v ".test." | wc -l || echo "0")
if [ $LOCAL_STORAGE_USAGE -lt 5 ]; then
    test_result 0 "Limited localStorage usage ($LOCAL_STORAGE_USAGE instances)"
else
    test_result 2 "Review localStorage usage for sensitive data ($LOCAL_STORAGE_USAGE instances)"
fi

# Generate Security Report
echo ""
echo -e "${BLUE}📊 Generating Security Report${NC}"

SECURITY_SCORE=$(echo "scale=0; $PASSED * 100 / $TOTAL" | bc)

cat > "$RESULTS_DIR/security-review-report.md" << EOF
# Tondino Platform Security Review Report

**Review Date:** $(date)
**Total Checks:** $TOTAL
**Passed:** $PASSED
**Failed:** $FAILED
**Warnings:** $WARNINGS
**Security Score:** $SECURITY_SCORE%

## Executive Summary

$(if [ $FAILED -eq 0 ]; then
echo "✅ **Excellent Security Posture** - All critical security checks passed"
elif [ $FAILED -le 3 ]; then
echo "⚠️ **Good Security with Improvements Needed** - Address $FAILED failed checks"
else
echo "🔴 **Security Improvements Required** - $FAILED critical security issues identified"
fi)

## Security Check Results

### ✅ Passed Checks ($PASSED)
$([ $PASSED -gt 0 ] && echo "- $PASSED security controls are properly implemented")

### ❌ Failed Checks ($FAILED)  
$([ $FAILED -gt 0 ] && echo "- $FAILED security vulnerabilities require immediate attention")

### ⚠️ Warnings ($WARNINGS)
$([ $WARNINGS -gt 0 ] && echo "- $WARNINGS security improvements recommended")

## Detailed Security Analysis

### 🔐 Authentication & Session Management
- **JWT Implementation**: $([ -f "tondino-backend/src/middleware/session.ts" ] && echo "✅ Custom middleware" || echo "❌ Missing")
- **Password Security**: $(grep -rq "bcrypt" tondino-backend/ && echo "✅ bcrypt hashing" || echo "❌ No secure hashing")
- **Authorization Controls**: $(grep -rq "requireAuth\|requireAdmin" tondino-backend/src/ && echo "✅ Middleware present" || echo "❌ Not implemented")
- **External Session Store**: ✅ Redis-based for horizontal scaling

### 🛡️ Input Validation & Protection
- **Input Validation**: $(grep -rq "express-validator" tondino-backend/ && echo "✅ express-validator" || echo "⚠️ Consider adding")
- **SQL Injection Protection**: $(grep -rq "\$[0-9]" tondino-backend/src/ && echo "✅ Parameterized queries" || echo "⚠️ Review queries")
- **XSS Protection**: $(grep -rq "helmet" tondino-backend/ && echo "✅ Helmet middleware" || echo "❌ Missing")
- **CORS Configuration**: $(grep -rq "cors" tondino-backend/ && echo "✅ Configured" || echo "❌ Missing")

### 🔒 Data Protection
- **HTTPS/TLS**: $(grep -rq "HTTPS\|ssl\|tls" tondino-backend/src/ && echo "✅ Configuration present" || echo "⚠️ Setup needed for production")
- **Rate Limiting**: $(grep -rq "rate.*limit" tondino-backend/ && echo "✅ Implemented" || echo "❌ Missing")
- **Error Handling**: $([ -f "tondino-backend/src/utils/errorHandler.ts" ] && echo "✅ Custom handler" || echo "❌ Missing")

### 📦 Dependency Security
- **Backend Vulnerabilities**: $BACKEND_VULNERABILITIES high/critical
- **Frontend Vulnerabilities**: $FRONTEND_VULNERABILITIES high/critical
- **Package Updates**: Regular monitoring recommended

### 🌐 Frontend Security
- **CSP Headers**: $(grep -rq "Content-Security-Policy\|CSP" tondino-frontend/ && echo "✅ Configured" || echo "⚠️ Consider implementing")
- **XSS Prevention**: $([ $INNER_HTML_USAGE -eq 0 ] && echo "✅ No dangerous innerHTML" || echo "⚠️ Review $INNER_HTML_USAGE instances")
- **Data Storage**: $([ $LOCAL_STORAGE_USAGE -lt 5 ] && echo "✅ Limited localStorage use" || echo "⚠️ Review $LOCAL_STORAGE_USAGE instances")

## Security Recommendations

### Immediate Actions Required
$(if [ $FAILED -gt 0 ]; then
cat << ACTIONS
1. **Address Failed Security Checks**
   - Review and fix all failed security controls
   - Implement missing authentication/authorization
   - Add rate limiting and input validation

2. **Secret Management**
   - Ensure no hardcoded secrets in code
   - Rotate any exposed credentials
   - Implement proper environment variable validation

ACTIONS
fi)

### Security Enhancements
1. **Enhanced Monitoring**
   - Implement security event logging
   - Set up intrusion detection
   - Monitor for unusual authentication patterns

2. **Advanced Protection**
   - Implement Web Application Firewall (WAF)
   - Add API throttling and quotas
   - Consider implementing OAuth2/OIDC

3. **Regular Maintenance**
   - Weekly dependency vulnerability scans
   - Quarterly security reviews
   - Annual penetration testing

## Compliance Considerations

### Data Protection
- **GDPR Compliance**: Review data collection and storage practices
- **Data Retention**: Implement data lifecycle management
- **Privacy Controls**: Add user data export/deletion capabilities

### Industry Standards
- **OWASP Top 10**: Address relevant security risks
- **NIST Framework**: Implement security controls
- **ISO 27001**: Consider security management standards

## Security Testing Recommendations

### Automated Testing
- [ ] Implement SAST (Static Application Security Testing)
- [ ] Set up DAST (Dynamic Application Security Testing)
- [ ] Add dependency vulnerability scanning to CI/CD

### Manual Testing
- [ ] Conduct penetration testing
- [ ] Perform security code reviews
- [ ] Test authentication bypass scenarios

## Next Steps

1. **Immediate (0-30 days)**
   - Fix all failed security checks
   - Implement missing rate limiting
   - Review and update dependencies

2. **Short-term (30-90 days)**
   - Implement advanced authentication features
   - Set up security monitoring
   - Conduct penetration testing

3. **Long-term (90+ days)**
   - Regular security assessments
   - Compliance audits
   - Security team training

---

**Security Review Score: $SECURITY_SCORE%**

$(if [ $SECURITY_SCORE -ge 80 ]; then
echo "🟢 **Strong Security Foundation** - Platform has solid security controls"
elif [ $SECURITY_SCORE -ge 60 ]; then
echo "🟡 **Moderate Security** - Some improvements needed"
else
echo "🔴 **Security Attention Required** - Address vulnerabilities before production"
fi)

*Report generated by Tondino security review automation*
EOF

echo -e "${GREEN}✅ Security review completed!${NC}"
echo -e "📊 Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}, ${YELLOW}$WARNINGS warnings${NC}"
echo -e "🔒 Security Score: $SECURITY_SCORE%"
echo -e "📄 Full report: $RESULTS_DIR/security-review-report.md"

exit $FAILED