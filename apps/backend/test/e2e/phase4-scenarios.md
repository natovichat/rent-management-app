# Phase 4 Property Portfolio Management - End-to-End Test Scenarios

**Document Version:** 1.0  
**Created:** February 2, 2026  
**Status:** 📋 Test Scenarios Documented

---

## Overview

This document contains comprehensive end-to-end test scenarios for Phase 4 Property Portfolio Management features. Each scenario covers complete user workflows from property creation through financial tracking and ownership management.

**Test Coverage:**
- Multi-owner property management
- Mortgage lifecycle tracking
- Financial tracking (expenses & income)
- Property valuation over time
- Complex ownership changes and validation

---

## Test Environment Setup

### Pre-requisites
- ✅ Backend server running on `http://localhost:3000`
- ✅ Database migrated and seeded
- ✅ User authenticated with valid JWT token
- ✅ Account ID available for multi-tenancy isolation
- ✅ API client configured (Postman/Thunder Client/curl)

### Test Data Requirements
- Clean test account (isolated from production data)
- Test property IDs
- Test owner IDs
- Test mortgage IDs

---

## Scenario 1: Add Multi-Owner Property

### Description
Test the complete workflow of creating a property with multiple owners and verifying ownership percentage validation.

### Pre-conditions
1. User is authenticated and has valid JWT token
2. Account ID is available
3. No existing test property with name "Test Multi-Owner Property"
4. No existing test owners "John Doe" and "Jane Smith"

### Step-by-Step Actions

#### Step 1.1: Create Property
**Action:** Create a new property
```http
POST /properties
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "Test Multi-Owner Property",
  "address": "123 Test Street, Tel Aviv",
  "type": "RESIDENTIAL",
  "status": "OWNED",
  "country": "Israel",
  "city": "Tel Aviv",
  "totalArea": 120.5,
  "landArea": 200.0,
  "estimatedValue": 2500000
}
```

**Expected Result:**
- HTTP 201 Created
- Response contains property object with generated ID
- Property has correct fields populated
- Property is associated with user's account

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 1.2: Create First Owner (John)
**Action:** Create owner "John Doe"
```http
POST /owners
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@test.com",
  "phone": "+972-50-1234567",
  "type": "INDIVIDUAL"
}
```

**Expected Result:**
- HTTP 201 Created
- Response contains owner object with ID
- Owner type is INDIVIDUAL

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 1.3: Create Second Owner (Jane)
**Action:** Create owner "Jane Smith"
```http
POST /owners
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane.smith@test.com",
  "phone": "+972-50-7654321",
  "type": "INDIVIDUAL"
}
```

**Expected Result:**
- HTTP 201 Created
- Response contains owner object with ID
- Owner type is INDIVIDUAL

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 1.4: Add First Ownership (John - 60%)
**Action:** Assign 60% ownership to John
```http
POST /ownerships
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "ownerId": "{JOHN_OWNER_ID}",
  "percentage": 60,
  "ownershipType": "PARTIAL",
  "startDate": "2024-01-01T00:00:00Z"
}
```

**Expected Result:**
- HTTP 201 Created
- Ownership record created successfully
- Percentage is 60%

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 1.5: Add Second Ownership (Jane - 40%)
**Action:** Assign 40% ownership to Jane
```http
POST /ownerships
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "ownerId": "{JANE_OWNER_ID}",
  "percentage": 40,
  "ownershipType": "PARTIAL",
  "startDate": "2024-01-01T00:00:00Z"
}
```

**Expected Result:**
- HTTP 201 Created
- Ownership record created successfully
- Percentage is 40%
- Total ownership now equals 100%

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 1.6: Verify Ownership Pie Chart Data
**Action:** Retrieve all ownerships for the property
```http
GET /properties/{PROPERTY_ID}/ownerships
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Response contains array with 2 ownership records
- Each ownership includes owner details (name, email)
- Percentages sum to exactly 100%
- Data structure suitable for pie chart rendering:
  ```json
  [
    {
      "id": "...",
      "percentage": 60,
      "owner": {
        "name": "John Doe",
        "email": "john.doe@test.com"
      }
    },
    {
      "id": "...",
      "percentage": 40,
      "owner": {
        "name": "Jane Smith",
        "email": "jane.smith@test.com"
      }
    }
  ]
  ```

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 1.7: Verify 100% Validation Works (Negative Test)
**Action:** Attempt to add third owner with 30% (would exceed 100%)
```http
POST /ownerships
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "ownerId": "{THIRD_OWNER_ID}",
  "percentage": 30,
  "ownershipType": "PARTIAL",
  "startDate": "2024-01-01T00:00:00Z"
}
```

**Expected Result:**
- HTTP 400 Bad Request
- Error message indicates total ownership would exceed 100%
- Error message is clear and user-friendly
- No ownership record created
- Existing ownerships remain unchanged

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

### Scenario 1 Summary

| Step | Action | Expected Status | Actual Status | Pass/Fail |
|------|--------|----------------|---------------|-----------|
| 1.1 | Create Property | 201 Created | ⏳ | ⏳ |
| 1.2 | Create Owner (John) | 201 Created | ⏳ | ⏳ |
| 1.3 | Create Owner (Jane) | 201 Created | ⏳ | ⏳ |
| 1.4 | Add Ownership (60%) | 201 Created | ⏳ | ⏳ |
| 1.5 | Add Ownership (40%) | 201 Created | ⏳ | ⏳ |
| 1.6 | Verify Ownership Data | 200 OK, 100% total | ⏳ | ⏳ |
| 1.7 | Test Validation (30% fails) | 400 Bad Request | ⏳ | ⏳ |

**Overall Scenario Status:** ⏳ _Pending Execution_

---

## Scenario 2: Mortgage Lifecycle

### Description
Test the complete mortgage lifecycle from creation through payment tracking and balance calculation.

### Pre-conditions
1. User is authenticated and has valid JWT token
2. Account ID is available
3. Property exists (can reuse from Scenario 1 or create new)
4. No existing mortgage for test property

### Step-by-Step Actions

#### Step 2.1: Create Mortgage
**Action:** Add mortgage to property
```http
POST /mortgages
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "bank": "Bank Hapoalim",
  "loanAmount": 1000000,
  "interestRate": 3.5,
  "monthlyPayment": 5000,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2044-01-01T00:00:00Z",
  "status": "ACTIVE"
}
```

**Expected Result:**
- HTTP 201 Created
- Response contains mortgage object with ID
- All fields are correctly saved
- Mortgage is linked to property

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 2.2: Record First Monthly Payment
**Action:** Record payment for January 2024
```http
POST /mortgages/{MORTGAGE_ID}/payments
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "amount": 5000,
  "paymentDate": "2024-01-15T00:00:00Z",
  "principal": 3500,
  "interest": 1500,
  "notes": "January 2024 payment"
}
```

**Expected Result:**
- HTTP 201 Created
- Payment record created successfully
- Payment linked to mortgage
- Principal and interest correctly recorded

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 2.3: Record Second Monthly Payment
**Action:** Record payment for February 2024
```http
POST /mortgages/{MORTGAGE_ID}/payments
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "amount": 5000,
  "paymentDate": "2024-02-15T00:00:00Z",
  "principal": 3520,
  "interest": 1480,
  "notes": "February 2024 payment"
}
```

**Expected Result:**
- HTTP 201 Created
- Payment record created successfully
- Second payment recorded

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 2.4: View Remaining Balance
**Action:** Get remaining mortgage balance
```http
GET /mortgages/{MORTGAGE_ID}/balance
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Response contains remaining balance calculation:
  ```json
  {
    "mortgageId": "...",
    "originalAmount": 1000000,
    "totalPaid": 10000,
    "remainingBalance": 990000,
    "lastPaymentDate": "2024-02-15T00:00:00Z",
    "paymentsCount": 2
  }
  ```
- Balance calculation is accurate (original - total paid)
- Includes payment history summary

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 2.5: Get Mortgage with Payment History
**Action:** Retrieve mortgage with all payments
```http
GET /mortgages/{MORTGAGE_ID}
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Response includes mortgage details
- Response includes payments array with 2 payments
- Payments are ordered by date (oldest first)
- Each payment includes all fields (amount, date, principal, interest)

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 2.6: Verify Progress Bar Updates
**Action:** Calculate progress percentage for UI display

**Expected Calculation:**
- Original Amount: 1,000,000
- Total Paid: 10,000
- Progress: (10,000 / 1,000,000) * 100 = 1%

**Expected Result:**
- Progress percentage is 1%
- Data suitable for progress bar component
- Calculation handles edge cases (0 payments, fully paid)

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

### Scenario 2 Summary

| Step | Action | Expected Status | Actual Status | Pass/Fail |
|------|--------|----------------|---------------|-----------|
| 2.1 | Create Mortgage | 201 Created | ⏳ | ⏳ |
| 2.2 | Record Payment 1 | 201 Created | ⏳ | ⏳ |
| 2.3 | Record Payment 2 | 201 Created | ⏳ | ⏳ |
| 2.4 | View Remaining Balance | 200 OK, accurate | ⏳ | ⏳ |
| 2.5 | Get Mortgage with Payments | 200 OK, 2 payments | ⏳ | ⏳ |
| 2.6 | Verify Progress Calculation | 1% progress | ⏳ | ⏳ |

**Overall Scenario Status:** ⏳ _Pending Execution_

---

## Scenario 3: Financial Tracking

### Description
Test complete financial tracking workflow including expenses, income, summary calculations, and export functionality.

### Pre-conditions
1. User is authenticated and has valid JWT token
2. Account ID is available
3. Property exists (can reuse from previous scenarios)
4. Unit exists (optional, for unit-specific expenses/income)

### Step-by-Step Actions

#### Step 3.1: Add Property Expense - Maintenance
**Action:** Record maintenance expense
```http
POST /financials/expenses
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "category": "MAINTENANCE",
  "amount": 5000,
  "date": "2024-01-10T00:00:00Z",
  "description": "Plumbing repairs",
  "notes": "Fixed leak in main bathroom"
}
```

**Expected Result:**
- HTTP 201 Created
- Expense record created successfully
- Category is MAINTENANCE
- Amount correctly saved

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 3.2: Add Property Expense - Tax
**Action:** Record property tax expense
```http
POST /financials/expenses
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "category": "TAX",
  "amount": 12000,
  "date": "2024-01-15T00:00:00Z",
  "description": "Annual property tax",
  "notes": "2024 property tax payment"
}
```

**Expected Result:**
- HTTP 201 Created
- Expense record created successfully
- Category is TAX
- Amount correctly saved

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 3.3: Add Property Expense - Insurance
**Action:** Record insurance expense
```http
POST /financials/expenses
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "category": "INSURANCE",
  "amount": 3000,
  "date": "2024-01-20T00:00:00Z",
  "description": "Property insurance",
  "notes": "Annual insurance premium"
}
```

**Expected Result:**
- HTTP 201 Created
- Expense record created successfully
- Category is INSURANCE
- Amount correctly saved

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 3.4: Add Rental Income
**Action:** Record rental income
```http
POST /financials/income
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "unitId": "{UNIT_ID}",
  "source": "RENT",
  "amount": 8000,
  "date": "2024-01-01T00:00:00Z",
  "description": "Monthly rent",
  "notes": "January 2024 rent payment"
}
```

**Expected Result:**
- HTTP 201 Created
- Income record created successfully
- Source is RENT
- Amount correctly saved
- Linked to property and unit

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 3.5: View Financial Summary
**Action:** Get financial summary for date range
```http
GET /financials/summary?startDate=2024-01-01&endDate=2024-01-31&propertyId={PROPERTY_ID}
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Response contains financial summary:
  ```json
  {
    "totalIncome": 8000,
    "totalExpenses": 20000,
    "netIncome": -12000,
    "incomeBySource": {
      "RENT": 8000
    },
    "expensesByCategory": {
      "MAINTENANCE": 5000,
      "TAX": 12000,
      "INSURANCE": 3000
    },
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T00:00:00Z"
    }
  }
  ```
- Calculations are accurate
- Breakdowns by category/source are correct

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 3.6: Get Property-Specific Financials
**Action:** Retrieve all financials for specific property
```http
GET /properties/{PROPERTY_ID}/financials
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Response contains:
  - Expenses array (3 expenses)
  - Income array (1 income)
  - Summary calculations
- Data is filtered to property only
- Expenses and income are properly categorized

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 3.7: Export to Excel (Future Feature)
**Action:** Export financial data to Excel format
```http
GET /financials/export?format=excel&startDate=2024-01-01&endDate=2024-01-31&propertyId={PROPERTY_ID}
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- File download initiated
- Excel file contains:
  - Expenses sheet with all expense records
  - Income sheet with all income records
  - Summary sheet with totals
- Data is formatted correctly
- Dates are in readable format

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending (Feature may not be implemented yet)_

**Note:** If export endpoint doesn't exist, mark as "Not Implemented" and document requirement.

---

### Scenario 3 Summary

| Step | Action | Expected Status | Actual Status | Pass/Fail |
|------|--------|----------------|---------------|-----------|
| 3.1 | Add Maintenance Expense | 201 Created | ⏳ | ⏳ |
| 3.2 | Add Tax Expense | 201 Created | ⏳ | ⏳ |
| 3.3 | Add Insurance Expense | 201 Created | ⏳ | ⏳ |
| 3.4 | Add Rental Income | 201 Created | ⏳ | ⏳ |
| 3.5 | View Financial Summary | 200 OK, accurate | ⏳ | ⏳ |
| 3.6 | Get Property Financials | 200 OK, filtered | ⏳ | ⏳ |
| 3.7 | Export to Excel | 200 OK, file download | ⏳ | ⏳ |

**Overall Scenario Status:** ⏳ _Pending Execution_

---

## Scenario 4: Property Valuation Over Time

### Description
Test property valuation tracking over time, including multiple valuations and trend analysis.

### Pre-conditions
1. User is authenticated and has valid JWT token
2. Account ID is available
3. Property exists (can reuse from previous scenarios)

### Step-by-Step Actions

#### Step 4.1: Add Initial Valuation
**Action:** Record initial property valuation
```http
POST /valuations
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "value": 2000000,
  "valuationDate": "2022-01-15T00:00:00Z",
  "valuationType": "MARKET",
  "source": "Professional Appraiser",
  "notes": "Initial purchase valuation"
}
```

**Expected Result:**
- HTTP 201 Created
- Valuation record created successfully
- Value is 2,000,000
- Valuation type is MARKET
- Date is correctly saved

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 4.2: Add Market Assessment After 2 Years
**Action:** Record updated valuation 2 years later
```http
POST /valuations
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "value": 2500000,
  "valuationDate": "2024-01-15T00:00:00Z",
  "valuationType": "MARKET",
  "source": "Market Assessment",
  "notes": "2-year market assessment - property appreciated"
}
```

**Expected Result:**
- HTTP 201 Created
- Valuation record created successfully
- Value is 2,500,000
- Date is 2 years after initial valuation
- Both valuations exist for same property

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 4.3: Get All Valuations for Property
**Action:** Retrieve all valuation history
```http
GET /properties/{PROPERTY_ID}/valuations
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Response contains array with 2 valuations
- Valuations are ordered by date (oldest first):
  ```json
  [
    {
      "id": "...",
      "value": 2000000,
      "valuationDate": "2022-01-15T00:00:00Z",
      "valuationType": "MARKET",
      "source": "Professional Appraiser"
    },
    {
      "id": "...",
      "value": 2500000,
      "valuationDate": "2024-01-15T00:00:00Z",
      "valuationType": "MARKET",
      "source": "Market Assessment"
    }
  ]
  ```
- Data structure suitable for chart rendering

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 4.4: Get Latest Valuation
**Action:** Retrieve most recent valuation
```http
GET /properties/{PROPERTY_ID}/valuations/latest
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Response contains single valuation object
- Value is 2,500,000 (most recent)
- Date is 2024-01-15
- This matches the latest valuation from Step 4.2

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 4.5: View Value Trend Chart Data
**Action:** Verify data structure for trend chart

**Expected Chart Data Structure:**
```json
{
  "propertyId": "...",
  "propertyName": "Test Property",
  "valuations": [
    {
      "date": "2022-01-15",
      "value": 2000000,
      "type": "MARKET"
    },
    {
      "date": "2024-01-15",
      "value": 2500000,
      "type": "MARKET"
    }
  ],
  "trend": {
    "appreciation": 500000,
    "appreciationPercentage": 25,
    "annualAppreciation": 12.5
  }
}
```

**Expected Result:**
- Data is formatted for line chart rendering
- Dates are in chronological order
- Values are numeric
- Trend calculations are accurate:
  - Appreciation: 2,500,000 - 2,000,000 = 500,000
  - Appreciation %: (500,000 / 2,000,000) * 100 = 25%
  - Annual appreciation: 25% / 2 years = 12.5% per year

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 4.6: Calculate Appreciation
**Action:** Verify appreciation calculation logic

**Calculation:**
- Initial Value (2022): 2,000,000
- Current Value (2024): 2,500,000
- Time Period: 2 years
- Absolute Appreciation: 500,000
- Percentage Appreciation: 25%
- Annual Appreciation Rate: 12.5%

**Expected Result:**
- Calculations are accurate
- Handles edge cases (negative appreciation, single valuation)
- Results are suitable for display in UI

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

### Scenario 4 Summary

| Step | Action | Expected Status | Actual Status | Pass/Fail |
|------|--------|----------------|---------------|-----------|
| 4.1 | Add Initial Valuation | 201 Created | ⏳ | ⏳ |
| 4.2 | Add 2-Year Valuation | 201 Created | ⏳ | ⏳ |
| 4.3 | Get All Valuations | 200 OK, 2 records | ⏳ | ⏳ |
| 4.4 | Get Latest Valuation | 200 OK, latest | ⏳ | ⏳ |
| 4.5 | View Trend Chart Data | Proper format | ⏳ | ⏳ |
| 4.6 | Calculate Appreciation | 25% accurate | ⏳ | ⏳ |

**Overall Scenario Status:** ⏳ _Pending Execution_

---

## Scenario 5: Complex Ownership Change

### Description
Test complex ownership change scenarios including validation edge cases and percentage adjustments.

### Pre-conditions
1. User is authenticated and has valid JWT token
2. Account ID is available
3. Property exists
4. At least 2 owners exist (can reuse from Scenario 1)

### Step-by-Step Actions

#### Step 5.1: Start with 100% Ownership (Single Owner)
**Action:** Create property with single 100% owner
```http
POST /ownerships
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "ownerId": "{OWNER_1_ID}",
  "percentage": 100,
  "ownershipType": "FULL",
  "startDate": "2023-01-01T00:00:00Z"
}
```

**Expected Result:**
- HTTP 201 Created
- Ownership record created successfully
- Percentage is 100%
- Total ownership equals 100%

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 5.2: Add Second Owner (50%)
**Action:** Add second owner with 50% ownership
```http
POST /ownerships
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "ownerId": "{OWNER_2_ID}",
  "percentage": 50,
  "ownershipType": "PARTIAL",
  "startDate": "2024-01-01T00:00:00Z"
}
```

**Expected Result:**
- HTTP 400 Bad Request
- Error message indicates total ownership would exceed 100%
- Error: "Total ownership percentage would be 150%. Must equal exactly 100%."
- No ownership record created
- Original 100% ownership remains unchanged

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

**Note:** This is a negative test - we expect it to fail validation.

---

#### Step 5.3: Update First Owner to 50%
**Action:** Update first owner's percentage to 50%
```http
PATCH /ownerships/{OWNERSHIP_1_ID}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "percentage": 50
}
```

**Expected Result:**
- HTTP 200 OK
- Ownership updated successfully
- Percentage changed from 100% to 50%
- Total ownership now equals 50% (incomplete, but allows next step)

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 5.4: Add Second Owner (50%) - Should Succeed Now
**Action:** Add second owner with 50% ownership (total will be 100%)
```http
POST /ownerships
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "propertyId": "{PROPERTY_ID}",
  "ownerId": "{OWNER_2_ID}",
  "percentage": 50,
  "ownershipType": "PARTIAL",
  "startDate": "2024-01-01T00:00:00Z"
}
```

**Expected Result:**
- HTTP 201 Created
- Ownership record created successfully
- Percentage is 50%
- Total ownership now equals 100% (50% + 50%)

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 5.5: Try to Exceed 100% (Should Fail)
**Action:** Attempt to update second owner to 60% (would make total 110%)
```http
PATCH /ownerships/{OWNERSHIP_2_ID}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "percentage": 60
}
```

**Expected Result:**
- HTTP 400 Bad Request
- Error message indicates total ownership would exceed 100%
- Error: "Total ownership percentage would be 110%. Must equal exactly 100%."
- No ownership record updated
- Existing ownerships remain unchanged (50% + 50%)

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 5.6: Adjust to Valid Percentages (60% + 40%)
**Action:** Update both owners to valid percentages totaling 100%
```http
PATCH /ownerships/{OWNERSHIP_1_ID}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "percentage": 60
}
```

Then:
```http
PATCH /ownerships/{OWNERSHIP_2_ID}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "percentage": 40
}
```

**Expected Result:**
- Both requests return HTTP 200 OK
- First owner: 60%
- Second owner: 40%
- Total ownership equals exactly 100%

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

#### Step 5.7: Verify Final Ownership Structure
**Action:** Retrieve all ownerships and verify final state
```http
GET /properties/{PROPERTY_ID}/ownerships
Authorization: Bearer {JWT_TOKEN}
```

**Expected Result:**
- HTTP 200 OK
- Response contains array with 2 ownership records:
  ```json
  [
    {
      "id": "{OWNERSHIP_1_ID}",
      "percentage": 60,
      "owner": {
        "name": "Owner 1",
        "email": "..."
      }
    },
    {
      "id": "{OWNERSHIP_2_ID}",
      "percentage": 40,
      "owner": {
        "name": "Owner 2",
        "email": "..."
      }
    }
  ]
  ```
- Percentages sum to exactly 100%
- Both ownerships are active
- Data structure is correct

**Actual Result:** _[To be filled during test execution]_

**Pass/Fail:** ⏳ _Pending_

---

### Scenario 5 Summary

| Step | Action | Expected Status | Actual Status | Pass/Fail |
|------|--------|----------------|---------------|-----------|
| 5.1 | Create 100% Ownership | 201 Created | ⏳ | ⏳ |
| 5.2 | Try Add 50% (should fail) | 400 Bad Request | ⏳ | ⏳ |
| 5.3 | Update to 50% | 200 OK | ⏳ | ⏳ |
| 5.4 | Add 50% (should succeed) | 201 Created | ⏳ | ⏳ |
| 5.5 | Try 60% (should fail) | 400 Bad Request | ⏳ | ⏳ |
| 5.6 | Adjust to 60% + 40% | 200 OK both | ⏳ | ⏳ |
| 5.7 | Verify Final State | 200 OK, 100% total | ⏳ | ⏳ |

**Overall Scenario Status:** ⏳ _Pending Execution_

---

## Test Execution Checklist

### Before Running Tests
- [ ] Backend server is running
- [ ] Database is migrated
- [ ] Test account is created
- [ ] JWT token is obtained
- [ ] Test data is isolated from production
- [ ] API client is configured

### During Test Execution
- [ ] Execute scenarios in order (1-5)
- [ ] Record actual results for each step
- [ ] Capture error messages if any
- [ ] Take screenshots of UI (if applicable)
- [ ] Document any deviations from expected behavior
- [ ] Note any performance issues

### After Test Execution
- [ ] Review all results
- [ ] Update Pass/Fail status for each step
- [ ] Document any bugs found
- [ ] Create bug reports for failures
- [ ] Update this document with final results
- [ ] Clean up test data

---

## Known Issues & Notes

### API Endpoints Status
Based on Phase 4 implementation:

- ✅ **Owners API**: Fully implemented
- ✅ **Ownerships API**: Fully implemented with 100% validation
- ✅ **Mortgages API**: Fully implemented (balance endpoint may need verification)
- ✅ **Valuations API**: Fully implemented
- ⚠️ **Financials API**: Routes may need verification (some routes returned 404 in previous tests)
- ⚠️ **Export Functionality**: May not be implemented yet

### Test Data Management
- Use isolated test account to avoid affecting production data
- Clean up test data after execution
- Use consistent naming conventions for test entities
- Document test data dependencies between scenarios

### Validation Rules to Test
1. **Ownership Percentage**: Must total exactly 100%
2. **Mortgage Balance**: Calculated correctly from payments
3. **Financial Summary**: Accurate calculations
4. **Valuation Dates**: Chronological ordering
5. **Account Isolation**: Data from one account not visible to another

---

## Test Results Summary

| Scenario | Total Steps | Passed | Failed | Pending | Status |
|----------|------------|--------|--------|---------|--------|
| 1. Multi-Owner Property | 7 | 0 | 0 | 7 | ⏳ Pending |
| 2. Mortgage Lifecycle | 6 | 0 | 0 | 6 | ⏳ Pending |
| 3. Financial Tracking | 7 | 0 | 0 | 7 | ⏳ Pending |
| 4. Property Valuation | 6 | 0 | 0 | 6 | ⏳ Pending |
| 5. Complex Ownership | 7 | 0 | 0 | 7 | ⏳ Pending |
| **TOTAL** | **33** | **0** | **0** | **33** | **⏳ Pending** |

---

## Next Steps

1. **Execute Test Scenarios**: Run all 5 scenarios and fill in actual results
2. **Document Results**: Update Pass/Fail status for each step
3. **Report Bugs**: Create bug reports for any failures
4. **Update Documentation**: Keep this document current with test results
5. **Automate Tests**: Consider creating automated E2E tests based on these scenarios

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-02 | AI Assistant | Initial E2E test scenarios document created |

---

**End of Document**
