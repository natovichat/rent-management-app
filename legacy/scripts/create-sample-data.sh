#!/bin/bash

# Create sample properties and expenses for testing
API_URL="https://rent-app-backend-6s337cqx6a-uc.a.run.app"
ACCOUNT_ID="061cf47d-f167-4f5d-8602-6f24792dc008"

echo "🏠 Creating sample properties and expenses..."
echo ""

# Create Property 1
echo "Creating Property 1: דירה בתל אביב..."
PROPERTY1=$(curl -s -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -d '{
    "address": "רחוב רוטשילד 1, תל אביב",
    "city": "תל אביב",
    "type": "RESIDENTIAL",
    "totalUnits": 1
  }')

PROPERTY1_ID=$(echo "$PROPERTY1" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "✅ Created property: $PROPERTY1_ID"
echo ""

# Create Property 2
echo "Creating Property 2: דירה בירושלים..."
PROPERTY2=$(curl -s -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -d '{
    "address": "רחוב יפו 10, ירושלים",
    "city": "ירושלים",
    "type": "RESIDENTIAL",
    "totalUnits": 1
  }')

PROPERTY2_ID=$(echo "$PROPERTY2" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "✅ Created property: $PROPERTY2_ID"
echo ""

# Wait a bit
sleep 1

# Create Expense 1 for Property 1
echo "Creating Expense 1: תחזוקה לנכס 1..."
curl -s -X POST "$API_URL/financials/expenses" \
  -H "Content-Type: application/json" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -d "{
    \"propertyId\": \"$PROPERTY1_ID\",
    \"expenseDate\": \"2026-02-01T00:00:00.000Z\",
    \"amount\": 1500,
    \"expenseType\": \"MAINTENANCE\",
    \"category\": \"תיקון צנרת\",
    \"description\": \"תיקון דליפה במטבח\",
    \"paymentMethod\": \"העברה בנקאית\"
  }" > /dev/null
echo "✅ Created expense: תחזוקה - 1,500 ₪"
echo ""

# Create Expense 2 for Property 1
echo "Creating Expense 2: ביטוח לנכס 1..."
curl -s -X POST "$API_URL/financials/expenses" \
  -H "Content-Type: application/json" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -d "{
    \"propertyId\": \"$PROPERTY1_ID\",
    \"expenseDate\": \"2026-01-15T00:00:00.000Z\",
    \"amount\": 2400,
    \"expenseType\": \"INSURANCE\",
    \"category\": \"ביטוח דירה\",
    \"description\": \"ביטוח שנתי\",
    \"paymentMethod\": \"כרטיס אשראי\"
  }" > /dev/null
echo "✅ Created expense: ביטוח - 2,400 ₪"
echo ""

# Create Expense 3 for Property 2
echo "Creating Expense 3: ארנונה לנכס 2..."
curl -s -X POST "$API_URL/financials/expenses" \
  -H "Content-Type: application/json" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -d "{
    \"propertyId\": \"$PROPERTY2_ID\",
    \"expenseDate\": \"2026-02-05T00:00:00.000Z\",
    \"amount\": 800,
    \"expenseType\": \"TAX\",
    \"category\": \"ארנונה\",
    \"description\": \"ארנונה חודשית\",
    \"paymentMethod\": \"העברה בנקאית\"
  }" > /dev/null
echo "✅ Created expense: ארנונה - 800 ₪"
echo ""

# Create Expense 4 for Property 2
echo "Creating Expense 4: חשמל לנכס 2..."
curl -s -X POST "$API_URL/financials/expenses" \
  -H "Content-Type: application/json" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -d "{
    \"propertyId\": \"$PROPERTY2_ID\",
    \"expenseDate\": \"2026-01-30T00:00:00.000Z\",
    \"amount\": 350,
    \"expenseType\": \"UTILITIES\",
    \"category\": \"חשמל\",
    \"description\": \"חשבון חשמל דו חודשי\",
    \"paymentMethod\": \"הוראת קבע\"
  }" > /dev/null
echo "✅ Created expense: חשמל - 350 ₪"
echo ""

echo "🎉 Done! Created:"
echo "  - 2 properties"
echo "  - 4 expenses"
echo ""
echo "Total expenses: 5,050 ₪"
echo ""
echo "View at: https://rent-management-app-frontend.vercel.app/expenses"
