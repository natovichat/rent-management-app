#!/bin/bash

# Phase 4 Backend API Testing Script
set +e  # Don't exit on error

BASE_URL="http://localhost:3001"
API_BASE="${BASE_URL}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

print_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" == "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $test_name"
        echo -e "  ${RED}Error:${NC} $details"
        ((FAILED++))
    fi
}

api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="${4:-200}"
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}Error: No auth token${NC}" >&2
        return 1
    fi
    
    local temp_file=$(mktemp)
    local status_code
    
    if [ -n "$data" ]; then
        status_code=$(curl -s -w "%{http_code}" -o "$temp_file" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data" \
            "${API_BASE}${endpoint}" 2>/dev/null)
    else
        status_code=$(curl -s -w "%{http_code}" -o "$temp_file" -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            "${API_BASE}${endpoint}" 2>/dev/null)
    fi
    
    local body=$(cat "$temp_file")
    rm -f "$temp_file"
    
    if [ "$status_code" == "$expected_status" ]; then
        echo "$body"
        return 0
    else
        echo "HTTP $status_code: $body" >&2
        return 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Phase 4 Backend API Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Get Auth Token
echo -e "${YELLOW}Step 1: Authentication${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}' \
    "${BASE_URL}/auth/dev-login" 2>/dev/null || echo "")

if [ -z "$LOGIN_RESPONSE" ] || ! echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${RED}Failed to get auth token${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to extract token${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo ""

# Step 2: Get Test Property
echo -e "${YELLOW}Step 2: Setup - Get Test Property${NC}"
PROPERTIES_RESPONSE=$(api_call "GET" "/properties?limit=1" "" 200)
if [ $? -ne 0 ] || [ -z "$PROPERTIES_RESPONSE" ]; then
    echo -e "${YELLOW}Creating test property...${NC}"
    PROPERTY_DATA='{"address":"123 Test St, Tel Aviv","city":"Tel Aviv","country":"Israel","type":"RESIDENTIAL","status":"OWNED"}'
    PROPERTY_RESPONSE=$(api_call "POST" "/properties" "$PROPERTY_DATA" 201)
    if [ $? -eq 0 ]; then
        PROPERTY_ID=$(echo "$PROPERTY_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    fi
else
    PROPERTY_ID=$(echo "$PROPERTIES_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

if [ -z "$PROPERTY_ID" ]; then
    echo -e "${RED}Failed to get/create property ID${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Using property ID: ${PROPERTY_ID:0:8}...${NC}"
echo ""

# Step 3: Test Owners API
echo -e "${YELLOW}Step 3: Testing Owners API${NC}"

OWNER1_DATA='{"name":"John Doe","type":"INDIVIDUAL","email":"john.doe@example.com","phone":"050-1234567","idNumber":"123456789"}'
OWNER1_RESPONSE=$(api_call "POST" "/owners" "$OWNER1_DATA" 201)
if [ $? -eq 0 ]; then
    OWNER1_ID=$(echo "$OWNER1_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_test "POST /owners - Create individual owner" "PASS" "Owner ID: ${OWNER1_ID:0:8}..."
else
    print_test "POST /owners - Create individual owner" "FAIL" "$OWNER1_RESPONSE"
    OWNER1_ID=""
fi

OWNER2_DATA='{"name":"ABC Real Estate Ltd","type":"COMPANY","email":"info@abcrealestate.com","phone":"03-1234567","taxId":"987654321"}'
OWNER2_RESPONSE=$(api_call "POST" "/owners" "$OWNER2_DATA" 201)
if [ $? -eq 0 ]; then
    OWNER2_ID=$(echo "$OWNER2_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_test "POST /owners - Create company owner" "PASS" "Owner ID: ${OWNER2_ID:0:8}..."
else
    print_test "POST /owners - Create company owner" "FAIL" "$OWNER2_RESPONSE"
    OWNER2_ID=""
fi

OWNERS_LIST=$(api_call "GET" "/owners" "" 200)
if [ $? -eq 0 ]; then
    OWNER_COUNT=$(echo "$OWNERS_LIST" | grep -o '"id"' | wc -l | tr -d ' ')
    print_test "GET /owners - List all owners" "PASS" "Found $OWNER_COUNT owners"
else
    print_test "GET /owners - List all owners" "FAIL" "$OWNERS_LIST"
fi

if [ -n "$OWNER1_ID" ]; then
    OWNER_GET=$(api_call "GET" "/owners/${OWNER1_ID}" "" 200)
    if [ $? -eq 0 ]; then
        print_test "GET /owners/:id - Get owner by ID" "PASS" "Retrieved owner details"
    else
        print_test "GET /owners/:id - Get owner by ID" "FAIL" "$OWNER_GET"
    fi
fi

echo ""

# Step 4: Test Ownerships API
echo -e "${YELLOW}Step 4: Testing Ownerships API${NC}"

if [ -n "$OWNER1_ID" ] && [ -n "$OWNER2_ID" ] && [ -n "$PROPERTY_ID" ]; then
    OWNERSHIP1_DATA="{\"propertyId\":\"$PROPERTY_ID\",\"ownerId\":\"$OWNER1_ID\",\"ownershipPercentage\":50,\"ownershipType\":\"PARTIAL\",\"startDate\":\"2024-01-01T00:00:00Z\"}"
    OWNERSHIP1_RESPONSE=$(api_call "POST" "/ownerships" "$OWNERSHIP1_DATA" 201)
    if [ $? -eq 0 ]; then
        OWNERSHIP1_ID=$(echo "$OWNERSHIP1_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        print_test "POST /ownerships - Create ownership (50%)" "PASS" "Ownership ID: ${OWNERSHIP1_ID:0:8}..."
    else
        print_test "POST /ownerships - Create ownership (50%)" "FAIL" "$OWNERSHIP1_RESPONSE"
        OWNERSHIP1_ID=""
    fi
    
    if [ -n "$OWNERSHIP1_ID" ]; then
        OWNERSHIP2_DATA="{\"propertyId\":\"$PROPERTY_ID\",\"ownerId\":\"$OWNER2_ID\",\"ownershipPercentage\":50,\"ownershipType\":\"PARTIAL\",\"startDate\":\"2024-01-01T00:00:00Z\"}"
        OWNERSHIP2_RESPONSE=$(api_call "POST" "/ownerships" "$OWNERSHIP2_DATA" 201)
        if [ $? -eq 0 ]; then
            print_test "POST /ownerships - Create ownership (50% - totals 100%)" "PASS" "Ownership created"
        else
            print_test "POST /ownerships - Create ownership (50% - totals 100%)" "FAIL" "$OWNERSHIP2_RESPONSE"
        fi
    fi
    
    INVALID_OWNERSHIP_DATA="{\"propertyId\":\"$PROPERTY_ID\",\"ownerId\":\"$OWNER1_ID\",\"ownershipPercentage\":60,\"ownershipType\":\"PARTIAL\",\"startDate\":\"2024-01-01T00:00:00Z\"}"
    INVALID_RESPONSE=$(api_call "POST" "/ownerships" "$INVALID_OWNERSHIP_DATA" 400)
    if [ $? -eq 0 ]; then
        print_test "POST /ownerships - Invalid ownership (>100%)" "PASS" "Correctly rejected"
    else
        print_test "POST /ownerships - Invalid ownership (>100%)" "FAIL" "Should reject >100%"
    fi
    
    OWNERSHIPS_LIST=$(api_call "GET" "/ownerships/property/${PROPERTY_ID}" "" 200)
    if [ $? -eq 0 ]; then
        OWNERSHIP_COUNT=$(echo "$OWNERSHIPS_LIST" | grep -o '"id"' | wc -l | tr -d ' ')
        print_test "GET /ownerships/property/:propertyId" "PASS" "Found $OWNERSHIP_COUNT ownerships"
    else
        print_test "GET /ownerships/property/:propertyId" "FAIL" "$OWNERSHIPS_LIST"
    fi
fi

echo ""

# Step 5: Test Mortgages API
echo -e "${YELLOW}Step 5: Testing Mortgages API${NC}"

if [ -n "$PROPERTY_ID" ]; then
    MORTGAGE_DATA="{\"propertyId\":\"$PROPERTY_ID\",\"bank\":\"Bank Hapoalim\",\"loanAmount\":1000000,\"interestRate\":3.5,\"monthlyPayment\":5000,\"startDate\":\"2024-01-01\",\"endDate\":\"2054-01-01\",\"status\":\"ACTIVE\",\"notes\":\"Test mortgage\"}"
    MORTGAGE_RESPONSE=$(api_call "POST" "/mortgages" "$MORTGAGE_DATA" 201)
    if [ $? -eq 0 ]; then
        MORTGAGE_ID=$(echo "$MORTGAGE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        print_test "POST /mortgages - Create mortgage" "PASS" "Mortgage ID: ${MORTGAGE_ID:0:8}..."
    else
        print_test "POST /mortgages - Create mortgage" "FAIL" "$MORTGAGE_RESPONSE"
        MORTGAGE_ID=""
    fi
    
    if [ -n "$MORTGAGE_ID" ]; then
        PAYMENT_DATA="{\"paymentDate\":\"2024-01-15\",\"amount\":5000,\"principal\":3000,\"interest\":2000,\"notes\":\"Test payment\"}"
        PAYMENT_RESPONSE=$(api_call "POST" "/mortgages/${MORTGAGE_ID}/payments" "$PAYMENT_DATA" 201)
        if [ $? -eq 0 ]; then
            print_test "POST /mortgages/:id/payments - Add payment" "PASS" "Payment added"
        else
            print_test "POST /mortgages/:id/payments - Add payment" "FAIL" "$PAYMENT_RESPONSE"
        fi
        
        BALANCE_RESPONSE=$(api_call "GET" "/mortgages/${MORTGAGE_ID}/balance" "" 200)
        if [ $? -eq 0 ]; then
            BALANCE=$(echo "$BALANCE_RESPONSE" | grep -o '"remainingBalance":[0-9.]*' | cut -d':' -f2)
            print_test "GET /mortgages/:id/balance - Get remaining balance" "PASS" "Balance: $BALANCE"
        else
            print_test "GET /mortgages/:id/balance - Get remaining balance" "FAIL" "$BALANCE_RESPONSE"
        fi
    fi
    
    MORTGAGES_LIST=$(api_call "GET" "/mortgages" "" 200)
    if [ $? -eq 0 ]; then
        MORTGAGE_COUNT=$(echo "$MORTGAGES_LIST" | grep -o '"id"' | wc -l | tr -d ' ')
        print_test "GET /mortgages - List all mortgages" "PASS" "Found $MORTGAGE_COUNT mortgages"
    else
        print_test "GET /mortgages - List all mortgages" "FAIL" "$MORTGAGES_LIST"
    fi
fi

echo ""

# Step 6: Test Valuations API
echo -e "${YELLOW}Step 6: Testing Valuations API${NC}"

if [ -n "$PROPERTY_ID" ]; then
    VALUATION1_DATA="{\"propertyId\":\"$PROPERTY_ID\",\"valuationDate\":\"2024-01-15\",\"estimatedValue\":1500000,\"valuationType\":\"MARKET\",\"notes\":\"Initial market valuation\"}"
    VALUATION1_RESPONSE=$(api_call "POST" "/valuations" "$VALUATION1_DATA" 201)
    if [ $? -eq 0 ]; then
        print_test "POST /valuations - Create valuation 1" "PASS" "Valuation created"
    else
        print_test "POST /valuations - Create valuation 1" "FAIL" "$VALUATION1_RESPONSE"
    fi
    
    VALUATION2_DATA="{\"propertyId\":\"$PROPERTY_ID\",\"valuationDate\":\"2024-06-15\",\"estimatedValue\":1600000,\"valuationType\":\"TAX_ASSESSMENT\",\"notes\":\"Tax assessment valuation\"}"
    VALUATION2_RESPONSE=$(api_call "POST" "/valuations" "$VALUATION2_DATA" 201)
    if [ $? -eq 0 ]; then
        print_test "POST /valuations - Create valuation 2" "PASS" "Valuation created"
    else
        print_test "POST /valuations - Create valuation 2" "FAIL" "$VALUATION2_RESPONSE"
    fi
    
    LATEST_VALUATION=$(api_call "GET" "/valuations/property/${PROPERTY_ID}/latest" "" 200)
    if [ $? -eq 0 ]; then
        VALUE=$(echo "$LATEST_VALUATION" | grep -o '"estimatedValue":[0-9.]*' | cut -d':' -f2)
        print_test "GET /valuations/property/:propertyId/latest" "PASS" "Latest value: $VALUE"
    else
        print_test "GET /valuations/property/:propertyId/latest" "FAIL" "$LATEST_VALUATION"
    fi
fi

echo ""

# Step 7: Test Financials API
echo -e "${YELLOW}Step 7: Testing Financials API${NC}"

if [ -n "$PROPERTY_ID" ]; then
    EXPENSE_DATA="{\"propertyId\":\"$PROPERTY_ID\",\"expenseDate\":\"2024-01-15T00:00:00Z\",\"amount\":1500.50,\"expenseType\":\"MAINTENANCE\",\"description\":\"Monthly maintenance fee\"}"
    EXPENSE_RESPONSE=$(api_call "POST" "/financials/expenses" "$EXPENSE_DATA" 201)
    if [ $? -eq 0 ]; then
        print_test "POST /financials/expenses - Create expense" "PASS" "Expense created"
    else
        print_test "POST /financials/expenses - Create expense" "FAIL" "$EXPENSE_RESPONSE"
    fi
    
    INCOME_DATA="{\"propertyId\":\"$PROPERTY_ID\",\"incomeDate\":\"2024-01-15T00:00:00Z\",\"amount\":5000.00,\"incomeType\":\"RENT\",\"description\":\"Monthly rent payment\"}"
    INCOME_RESPONSE=$(api_call "POST" "/financials/income" "$INCOME_DATA" 201)
    if [ $? -eq 0 ]; then
        print_test "POST /financials/income - Create income" "PASS" "Income created"
    else
        print_test "POST /financials/income - Create income" "FAIL" "$INCOME_RESPONSE"
    fi
    
    SUMMARY_RESPONSE=$(api_call "GET" "/financials/summary" "" 200)
    if [ $? -eq 0 ]; then
        TOTAL_INCOME=$(echo "$SUMMARY_RESPONSE" | grep -o '"totalIncome":[0-9.]*' | cut -d':' -f2)
        TOTAL_EXPENSES=$(echo "$SUMMARY_RESPONSE" | grep -o '"totalExpenses":[0-9.]*' | cut -d':' -f2)
        print_test "GET /financials/summary - Get financial summary" "PASS" "Income: $TOTAL_INCOME, Expenses: $TOTAL_EXPENSES"
    else
        print_test "GET /financials/summary - Get financial summary" "FAIL" "$SUMMARY_RESPONSE"
    fi
fi

echo ""

# Step 8: Test Properties Portfolio
echo -e "${YELLOW}Step 8: Testing Properties Portfolio${NC}"

PORTFOLIO_RESPONSE=$(api_call "GET" "/properties/portfolio/summary" "" 200)
if [ $? -eq 0 ]; then
    TOTAL_PROPERTIES=$(echo "$PORTFOLIO_RESPONSE" | grep -o '"totalProperties":[0-9]*' | cut -d':' -f2)
    TOTAL_VALUE=$(echo "$PORTFOLIO_RESPONSE" | grep -o '"totalEstimatedValue":[0-9.]*' | cut -d':' -f2)
    print_test "GET /properties/portfolio/summary - Get portfolio summary" "PASS" "Properties: $TOTAL_PROPERTIES, Value: $TOTAL_VALUE"
else
    print_test "GET /properties/portfolio/summary - Get portfolio summary" "FAIL" "$PORTFOLIO_RESPONSE"
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. See details above.${NC}"
    exit 1
fi
