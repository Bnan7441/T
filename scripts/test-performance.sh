#!/bin/bash

# Performance and Load Testing Script for Tondino Platform
# Tests application performance under various load conditions

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

RESULTS_DIR="test-reports/performance"
mkdir -p "$RESULTS_DIR"

# Configuration
BASE_URL=${TEST_URL:-"http://localhost:3001"}
FRONTEND_URL=${FRONTEND_TEST_URL:-"http://localhost:3000"}
DURATION=${LOAD_TEST_DURATION:-"60s"}
CONCURRENT_USERS=${MAX_USERS:-"100"}

echo -e "${BLUE}🚀 Starting Performance Testing Suite${NC}"
echo "Base URL: $BASE_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Duration: $DURATION"
echo "Max Users: $CONCURRENT_USERS"
echo ""

# Test results tracking
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
    TESTS_RUN=$((TESTS_RUN + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ $2${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to check if a service is running
check_service() {
    local url=$1
    local service_name=$2
    
    if curl -f -s --max-time 10 "$url/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $service_name is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $service_name is not accessible at $url${NC}"
        return 1
    fi
}

# Pre-flight checks
echo -e "${BLUE}📋 Pre-flight Checks${NC}"

check_service "$BASE_URL" "Backend API"
BACKEND_STATUS=$?

if [ $BACKEND_STATUS -ne 0 ]; then
    echo -e "${RED}❌ Backend not available. Starting local server...${NC}"
    cd tondino-backend
    npm run build > /dev/null 2>&1 || echo "Build failed, trying with existing build"
    npm run start &
    BACKEND_PID=$!
    echo "Started backend with PID: $BACKEND_PID"
    sleep 5
    cd ..
fi

# Check for required tools
command -v curl >/dev/null 2>&1 || { echo "curl is required but not installed"; exit 1; }

# Check for optional tools
HAS_AB=$(command -v ab >/dev/null 2>&1 && echo "true" || echo "false")
HAS_WRK=$(command -v wrk >/dev/null 2>&1 && echo "true" || echo "false")
HAS_SIEGE=$(command -v siege >/dev/null 2>&1 && echo "true" || echo "false")

echo ""
echo -e "${BLUE}🔧 Available Tools:${NC}"
echo "curl: ✓ Available"
echo "Apache Bench (ab): $([ "$HAS_AB" = "true" ] && echo -e "${GREEN}✓ Available${NC}" || echo -e "${YELLOW}⚠ Not installed${NC}")"
echo "wrk: $([ "$HAS_WRK" = "true" ] && echo -e "${GREEN}✓ Available${NC}" || echo -e "${YELLOW}⚠ Not installed${NC}")"
echo "siege: $([ "$HAS_SIEGE" = "true" ] && echo -e "${GREEN}✓ Available${NC}" || echo -e "${YELLOW}⚠ Not installed${NC}")"
echo ""

# 1. Basic Response Time Test
echo -e "${BLUE}1️⃣ Basic Response Time Test${NC}"
RESPONSE_TIME_TEST() {
    local endpoint=$1
    local expected_ms=$2
    local name=$3
    
    local start_time=$(date +%s%N)
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL$endpoint")
    local end_time=$(date +%s%N)
    
    local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ "$status_code" = "200" ] && [ "$response_time" -lt "$expected_ms" ]; then
        test_result 0 "$name: ${response_time}ms (${status_code}) [Target: <${expected_ms}ms]"
        echo "$endpoint,$response_time,$status_code" >> "$RESULTS_DIR/response_times.csv"
    else
        test_result 1 "$name: ${response_time}ms (${status_code}) [Target: <${expected_ms}ms]"
        echo "$endpoint,$response_time,$status_code" >> "$RESULTS_DIR/response_times.csv"
    fi
}

echo "endpoint,response_time_ms,status_code" > "$RESULTS_DIR/response_times.csv"

RESPONSE_TIME_TEST "/api/health" 100 "Health Check"
RESPONSE_TIME_TEST "/api/health/full" 500 "Full Health Check"
RESPONSE_TIME_TEST "/api/courses" 300 "Course List"
RESPONSE_TIME_TEST "/api/courses/stats" 200 "Course Stats"

# 2. Concurrent User Simulation
echo ""
echo -e "${BLUE}2️⃣ Concurrent User Simulation${NC}"

if [ "$HAS_AB" = "true" ]; then
    echo "Running Apache Bench load test..."
    ab -n 1000 -c 10 -g "$RESULTS_DIR/ab_results.tsv" "$BASE_URL/api/health" > "$RESULTS_DIR/ab_summary.txt" 2>&1
    
    # Parse results
    local avg_time=$(grep "Time per request" "$RESULTS_DIR/ab_summary.txt" | head -1 | awk '{print $4}')
    local requests_per_sec=$(grep "Requests per second" "$RESULTS_DIR/ab_summary.txt" | awk '{print $4}')
    local failed_requests=$(grep "Failed requests" "$RESULTS_DIR/ab_summary.txt" | awk '{print $3}')
    
    if [ "${failed_requests:-0}" -eq 0 ] && [ "$(echo "$avg_time < 200" | bc -l 2>/dev/null || echo "1")" = "1" ]; then
        test_result 0 "Apache Bench: ${avg_time}ms avg, ${requests_per_sec} req/s, ${failed_requests} failures"
    else
        test_result 1 "Apache Bench: ${avg_time}ms avg, ${requests_per_sec} req/s, ${failed_requests} failures"
    fi
else
    # Fallback: Simple concurrent test with curl
    echo "Running simple concurrent test with curl..."
    
    start_time=$(date +%s)
    
    # Launch 20 concurrent requests
    for i in {1..20}; do
        (
            response_time=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL/api/health")
            echo "$response_time" >> "$RESULTS_DIR/concurrent_times.txt"
        ) &
    done
    
    wait # Wait for all background jobs to complete
    
    end_time=$(date +%s)
    total_time=$((end_time - start_time))
    
    if [ -f "$RESULTS_DIR/concurrent_times.txt" ]; then
        avg_time=$(awk '{sum+=$1} END {if(NR>0) print sum/NR*1000}' "$RESULTS_DIR/concurrent_times.txt")
        max_time=$(awk '{if($1>max) max=$1} END {print max*1000}' "$RESULTS_DIR/concurrent_times.txt")
        
        if [ "$(echo "$avg_time < 500" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
            test_result 0 "Concurrent test: ${avg_time}ms avg, ${max_time}ms max, ${total_time}s total"
        else
            test_result 1 "Concurrent test: ${avg_time}ms avg, ${max_time}ms max, ${total_time}s total"
        fi
    else
        test_result 1 "Concurrent test: Could not measure response times"
    fi
fi

# 3. Memory and CPU Usage Test
echo ""
echo -e "${BLUE}3️⃣ Resource Usage Test${NC}"

# Function to get process stats
get_process_stats() {
    local pid=$1
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        ps -p "$pid" -o pid,pcpu,pmem,rss,vsz --no-headers
    else
        echo "Process not running"
    fi
}

# Monitor resource usage during load
if [ -n "$BACKEND_PID" ]; then
    echo "Monitoring process $BACKEND_PID during load..."
    
    # Get initial stats
    initial_stats=$(get_process_stats $BACKEND_PID)
    echo "Initial stats: $initial_stats"
    
    # Apply some load and monitor
    for i in {1..50}; do
        curl -s "$BASE_URL/api/health" > /dev/null &
    done
    
    sleep 2
    
    # Get stats under load
    load_stats=$(get_process_stats $BACKEND_PID)
    echo "Stats under load: $load_stats"
    
    if echo "$load_stats" | awk '{if($2 < 50 && $3 < 80) exit 0; else exit 1}'; then
        test_result 0 "Resource usage within limits: $load_stats"
    else
        test_result 1 "Resource usage concerning: $load_stats"
    fi
    
    wait # Wait for background curl processes
else
    echo "No backend PID to monitor, skipping resource test"
    test_result 1 "Resource usage test: Backend not started by this script"
fi

# 4. Database Performance Test
echo ""
echo -e "${BLUE}4️⃣ Database Performance Test${NC}"

# Test database-heavy operations
DB_TEST() {
    local endpoint=$1
    local name=$2
    local max_time_ms=$3
    
    local start_time=$(date +%s%N)
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL$endpoint")
    local end_time=$(date +%s%N)
    
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$status_code" = "200" ] && [ "$response_time" -lt "$max_time_ms" ]; then
        test_result 0 "$name: ${response_time}ms (Target: <${max_time_ms}ms)"
    else
        test_result 1 "$name: ${response_time}ms (Target: <${max_time_ms}ms)"
    fi
}

DB_TEST "/api/courses" "Course List Query" 500
DB_TEST "/api/courses/stats" "Stats Query" 300

# 5. Frontend Performance Test (if available)
echo ""
echo -e "${BLUE}5️⃣ Frontend Performance Test${NC}"

if curl -f -s --max-time 10 "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "Testing frontend performance..."
    
    # Test main page load
    frontend_time=$(curl -s -w "%{time_total}" -o /dev/null "$FRONTEND_URL")
    frontend_time_ms=$(echo "$frontend_time * 1000" | bc -l 2>/dev/null || echo "0")
    
    if [ "$(echo "$frontend_time_ms < 2000" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
        test_result 0 "Frontend load time: ${frontend_time_ms}ms (Target: <2000ms)"
    else
        test_result 1 "Frontend load time: ${frontend_time_ms}ms (Target: <2000ms)"
    fi
else
    echo -e "${YELLOW}⚠ Frontend not available at $FRONTEND_URL${NC}"
    test_result 1 "Frontend performance test: Service not available"
fi

# Generate Performance Report
echo ""
echo -e "${BLUE}📊 Generating Performance Report${NC}"

cat > "$RESULTS_DIR/performance-report.md" << EOF
# Performance Test Report

**Test Date:** $(date)
**Base URL:** $BASE_URL
**Frontend URL:** $FRONTEND_URL
**Test Duration:** $DURATION
**Max Concurrent Users:** $CONCURRENT_USERS

## Test Results Summary

**Total Tests:** $TESTS_RUN  
**Passed:** $TESTS_PASSED  
**Failed:** $TESTS_FAILED  
**Success Rate:** $(echo "scale=2; $TESTS_PASSED * 100 / $TESTS_RUN" | bc -l 2>/dev/null || echo "N/A")%

## Performance Metrics

### Response Time Analysis
$(if [ -f "$RESULTS_DIR/response_times.csv" ]; then
    echo "| Endpoint | Response Time (ms) | Status Code |"
    echo "|----------|-------------------|-------------|"
    tail -n +2 "$RESULTS_DIR/response_times.csv" | while IFS=',' read -r endpoint time status; do
        echo "| $endpoint | $time | $status |"
    done
else
    echo "Response time data not available"
fi)

### Load Test Results
$(if [ -f "$RESULTS_DIR/ab_summary.txt" ]; then
    echo "**Apache Bench Results:**"
    echo "\`\`\`"
    grep -E "(Requests per second|Time per request|Transfer rate|Failed requests)" "$RESULTS_DIR/ab_summary.txt" | head -5
    echo "\`\`\`"
elif [ -f "$RESULTS_DIR/concurrent_times.txt" ]; then
    avg_time=$(awk '{sum+=$1} END {if(NR>0) print sum/NR*1000}' "$RESULTS_DIR/concurrent_times.txt")
    max_time=$(awk '{if($1>max) max=$1} END {print max*1000}' "$RESULTS_DIR/concurrent_times.txt")
    echo "**Concurrent Test Results:**"
    echo "- Average Response Time: ${avg_time}ms"
    echo "- Maximum Response Time: ${max_time}ms"
    echo "- Concurrent Requests: 20"
fi)

## Performance Targets vs Actual

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Health Check | <100ms | $(grep "/api/health," "$RESULTS_DIR/response_times.csv" 2>/dev/null | cut -d',' -f2 || echo "N/A")ms | $([ "$(grep "/api/health," "$RESULTS_DIR/response_times.csv" 2>/dev/null | cut -d',' -f2 || echo "999")" -lt 100 ] && echo "✅ Pass" || echo "❌ Fail") |
| Course List | <300ms | $(grep "/api/courses," "$RESULTS_DIR/response_times.csv" 2>/dev/null | cut -d',' -f2 || echo "N/A")ms | $([ "$(grep "/api/courses," "$RESULTS_DIR/response_times.csv" 2>/dev/null | cut -d',' -f2 || echo "999")" -lt 300 ] && echo "✅ Pass" || echo "❌ Fail") |
| Frontend Load | <2000ms | $(echo "$frontend_time_ms" 2>/dev/null || echo "N/A")ms | $([ "$(echo "$frontend_time_ms < 2000" | bc -l 2>/dev/null || echo "0")" = "1" ] && echo "✅ Pass" || echo "❌ Fail") |

## Recommendations

$(if [ $TESTS_FAILED -gt 0 ]; then
cat << REC
### ⚠️ Performance Issues Identified
- $TESTS_FAILED out of $TESTS_RUN tests failed
- Review slow endpoints and optimize database queries
- Consider implementing caching for frequently accessed data
- Monitor resource usage under production load

### Immediate Actions
1. Optimize slow database queries
2. Implement Redis caching
3. Add connection pooling
4. Set up performance monitoring

REC
else
cat << REC
### ✅ Performance Targets Met
All performance tests passed successfully!

### Continuous Monitoring
1. Set up regular performance testing in CI/CD
2. Monitor performance metrics in production
3. Establish performance budgets for new features
4. Plan for load testing with realistic user scenarios

REC
fi)

## Test Environment
- **Operating System:** $(uname -s)
- **CPU:** $(sysctl -n machdep.cpu.brand_string 2>/dev/null || grep "model name" /proc/cpuinfo | head -1 | cut -d':' -f2 | xargs || echo "Unknown")
- **Memory:** $(free -h 2>/dev/null | grep "Mem:" | awk '{print $2}' || sysctl hw.memsize | awk '{print $2/1024/1024/1024 " GB"}' 2>/dev/null || echo "Unknown")

## Next Steps
1. Run load tests with higher concurrent user counts
2. Test with realistic data volumes
3. Implement performance monitoring dashboard
4. Set up automated performance regression testing

---
*Report generated by Tondino performance testing suite*
EOF

# Cleanup
if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${YELLOW}Stopping backend process $BACKEND_PID...${NC}"
    kill "$BACKEND_PID" 2>/dev/null || true
    sleep 2
fi

echo ""
echo -e "${GREEN}✅ Performance testing completed!${NC}"
echo -e "📊 Results: ${GREEN}$TESTS_PASSED passed${NC}, ${RED}$TESTS_FAILED failed${NC} out of $TESTS_RUN tests"
echo -e "📄 Full report: $RESULTS_DIR/performance-report.md"

# Install recommendations
echo ""
echo -e "${BLUE}💡 For more comprehensive load testing, consider installing:${NC}"
[ "$HAS_AB" = "false" ] && echo "  • Apache Bench: brew install httpd (macOS) or apt-get install apache2-utils (Ubuntu)"
[ "$HAS_WRK" = "false" ] && echo "  • wrk: brew install wrk (macOS) or build from source"
[ "$HAS_SIEGE" = "false" ] && echo "  • Siege: brew install siege (macOS) or apt-get install siege (Ubuntu)"

exit $TESTS_FAILED