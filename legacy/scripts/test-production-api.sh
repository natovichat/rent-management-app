#!/bin/bash

# Production API Testing Script
# Tests all main endpoints against live production API

API_URL="https://rent-app-backend-6s337cqx6a-uc.a.run.app"
ACCOUNT_ID="061cf47d-f167-4f5d-8602-6f24792dc008"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Production API Test Suite${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "API URL: $API_URL"
echo "Account ID: $ACCOUNT_ID"
echo ""

PASSED=0
FAILED=0

test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  local expected_status=$4
  local data=$5
  
  echo -n "Testing: $description ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET \
      "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "X-Account-Id: $ACCOUNT_ID")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST \
      "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "X-Account-Id: $ACCOUNT_ID" \
      -d "$data")
  fi
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $status_code)"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

echo -e "${YELLOW}=== Core Endpoints ===${NC}"
test_endpoint "GET" "/accounts" "Get All Accounts" "200"
test_endpoint "GET" "/properties?page=1&limit=10" "Get Properties (Paginated)" "200"
test_endpoint "GET" "/tenants?page=1&limit=10" "Get Tenants (Paginated)" "200"
test_endpoint "GET" "/units?page=1&limit=10" "Get Units (Paginated)" "200"
test_endpoint "GET" "/leases?page=1&limit=10" "Get Leases (Paginated)" "200"
test_endpoint "GET" "/owners?page=1&limit=10" "Get Owners (Paginated)" "200"

echo ""
echo -e "${YELLOW}=== Financial Endpoints ===${NC}"
test_endpoint "GET" "/financials/expenses" "Get Expenses" "200"
test_endpoint "GET" "/financials/income" "Get Income" "200"
test_endpoint "GET" "/bank-accounts?page=1&limit=10" "Get Bank Accounts (Paginated)" "200"
test_endpoint "GET" "/mortgages?page=1&limit=10" "Get Mortgages (Paginated)" "200"

echo ""
echo -e "${YELLOW}=== Dashboard Endpoints ===${NC}"
test_endpoint "GET" "/dashboard/roi" "Get ROI Metrics" "200"
test_endpoint "GET" "/dashboard/cash-flow?groupBy=month" "Get Cash Flow" "200"
test_endpoint "GET" "/dashboard/widget-preferences" "Get Widget Preferences" "200"

echo ""
echo -e "${YELLOW}=== Investment Companies ===${NC}"
test_endpoint "GET" "/investment-companies?page=1&limit=10" "Get Investment Companies" "200"

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Results Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
