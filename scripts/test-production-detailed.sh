#!/bin/bash

# Detailed Production API Testing Script
# Tests endpoints and shows sample responses

API_URL="https://rent-app-backend-6s337cqx6a-uc.a.run.app"
ACCOUNT_ID="061cf47d-f167-4f5d-8602-6f24792dc008"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Output file
OUTPUT_FILE="production-api-test-report-$(date +%Y%m%d-%H%M%S).md"

echo "# Production API Test Report" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "**Date:** $(date)" >> "$OUTPUT_FILE"
echo "**API URL:** $API_URL" >> "$OUTPUT_FILE"
echo "**Account ID:** $ACCOUNT_ID" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Detailed Production API Tests${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

PASSED=0
FAILED=0

test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  
  echo -e "${CYAN}Testing: $description${NC}"
  echo "## $description" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "**Endpoint:** \`$method $endpoint\`" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  response=$(curl -s -w "\n%{http_code}" -X "$method" \
    "$API_URL$endpoint" \
    -H "Content-Type: application/json" \
    -H "X-Account-Id: $ACCOUNT_ID")
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  echo "**Status Code:** $status_code" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
    PASSED=$((PASSED + 1))
    echo "**Result:** ✅ PASSED" >> "$OUTPUT_FILE"
    
    # Pretty print JSON
    echo "" >> "$OUTPUT_FILE"
    echo "**Response Sample:**" >> "$OUTPUT_FILE"
    echo "\`\`\`json" >> "$OUTPUT_FILE"
    echo "$body" | python3 -m json.tool 2>/dev/null | head -n 50 >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
  else
    echo -e "${RED}✗ FAILED${NC} (HTTP $status_code)"
    FAILED=$((FAILED + 1))
    echo "**Result:** ❌ FAILED" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "**Error Response:**" >> "$OUTPUT_FILE"
    echo "\`\`\`json" >> "$OUTPUT_FILE"
    echo "$body" | python3 -m json.tool 2>/dev/null >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
  fi
  
  echo "" >> "$OUTPUT_FILE"
  echo "---" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo ""
}

echo -e "${YELLOW}=== Core Entities ===${NC}"
echo "# Core Entities" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "GET" "/accounts" "Get All Accounts"
test_endpoint "GET" "/properties?page=1&limit=5" "Get Properties (First 5)"
test_endpoint "GET" "/tenants?page=1&limit=5" "Get Tenants (First 5)"
test_endpoint "GET" "/units?page=1&limit=5" "Get Units (First 5)"
test_endpoint "GET" "/leases?page=1&limit=5" "Get Leases (First 5)"
test_endpoint "GET" "/owners?page=1&limit=5" "Get Owners (First 5)"

echo -e "${YELLOW}=== Financial Data ===${NC}"
echo "# Financial Data" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "GET" "/financials/expenses" "Get All Expenses"
test_endpoint "GET" "/financials/income" "Get All Income"
test_endpoint "GET" "/bank-accounts?page=1&limit=5" "Get Bank Accounts"
test_endpoint "GET" "/mortgages?page=1&limit=5" "Get Mortgages"

echo -e "${YELLOW}=== Dashboard Analytics ===${NC}"
echo "# Dashboard Analytics" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "GET" "/dashboard/roi" "Get ROI Metrics"
test_endpoint "GET" "/dashboard/cash-flow?groupBy=month" "Get Monthly Cash Flow"
test_endpoint "GET" "/dashboard/widget-preferences" "Get Widget Preferences"

echo -e "${YELLOW}=== Additional Entities ===${NC}"
echo "# Additional Entities" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "GET" "/investment-companies?page=1&limit=5" "Get Investment Companies"
test_endpoint "GET" "/notifications?page=1&pageSize=5" "Get Notifications (pageSize instead of limit)"
test_endpoint "GET" "/notifications/upcoming" "Get Upcoming Notifications"
test_endpoint "GET" "/notifications/settings" "Get Notification Settings"

echo "" >> "$OUTPUT_FILE"
echo "# Summary" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "**Total Tests:** $((PASSED + FAILED))" >> "$OUTPUT_FILE"
echo "**Passed:** ✅ $PASSED" >> "$OUTPUT_FILE"
echo "**Failed:** ❌ $FAILED" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ $FAILED -eq 0 ]; then
  echo "**Overall Result:** ✅ All tests passed!" >> "$OUTPUT_FILE"
else
  echo "**Overall Result:** ❌ Some tests failed" >> "$OUTPUT_FILE"
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Results Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "Total: $((PASSED + FAILED))"
echo ""
echo -e "${YELLOW}Full report saved to: $OUTPUT_FILE${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
