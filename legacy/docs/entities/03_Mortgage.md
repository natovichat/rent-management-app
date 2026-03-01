# Mortgage Entity

**Entity Type:** Financial  
**Database Table:** `mortgages`  
**Purpose:** Tracks loans secured by property collateral

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `propertyId` | UUID | ✅ Yes | Property reference (primary collateral) | Schema |
| `accountId` | UUID | ✅ Yes | Account reference | Schema |
| `bank` | String | ✅ Yes | Bank name | Schema |
| `loanAmount` | Decimal(12,2) | ✅ Yes | Original loan amount | Schema |
| `interestRate` | Decimal(5,2) | ❌ No | Annual interest rate (%) | Schema |
| `monthlyPayment` | Decimal(10,2) | ❌ No | Monthly payment amount | Schema |
| `bankAccountId` | UUID | ❌ No | Bank account for automatic payments | Schema |
| `startDate` | DateTime | ✅ Yes | Mortgage start date | Schema |
| `endDate` | DateTime | ❌ No | Expected end date | Schema |
| `status` | Enum | ✅ Yes | Mortgage status (ACTIVE, PAID_OFF, REFINANCED, DEFAULTED) | Schema |
| `linkedProperties` | String[] | ❌ No | Array of property IDs used as collateral | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `loanType` | String | ❌ No | Type of loan (משכנתא, הלוואה) | Unstructured |
| `currentBalance` | Decimal(12,2) | ❌ No | Current remaining balance | Unstructured |
| `monthlyInterestPayment` | Decimal(10,2) | ❌ No | Interest portion of monthly payment | Unstructured |
| `monthlyPrincipalPayment` | Decimal(10,2) | ❌ No | Principal portion of monthly payment | Unstructured |
| `totalExpectedRepayment` | Decimal(12,2) | ❌ No | Total amount to be repaid | Unstructured |
| `repaymentMonths` | Integer | ❌ No | Total repayment period in months | Unstructured |
| `linkedPropertiesDetails` | Text | ❌ No | Description of linked properties | Unstructured |
| `collateralDescription` | Text | ❌ No | Description of collateral arrangement | Unstructured |
| `repaymentStartDate` | DateTime | ❌ No | Date when repayment begins (may differ from start date) | Unstructured |
| `currency` | String | ❌ No | Currency code (ILS, EUR, USD) | Unstructured |
| `exchangeRate` | Decimal(10,4) | ❌ No | Exchange rate if foreign currency | Unstructured |

---

## Relationships

### Many-to-One
- **property** → `Property` - Primary collateral property
- **bankAccount** → `BankAccount` - Payment account
- **account** → `Account` - Account owner

### One-to-Many
- **payments** → `MortgagePayment[]` - Payment history

---

## Enums

### MortgageStatus
```typescript
enum MortgageStatus {
  ACTIVE      // פעיל - Currently being repaid
  PAID_OFF    // סולק - Fully repaid
  REFINANCED  // מימון מחדש - Refinanced to new mortgage
  DEFAULTED   // ברירת מחדל - In default
}
```

---

## Complex Mortgage Scenarios from Data

### 1. Single Mortgage on Multiple Properties
```
"משועבדת ביחד עם נכס מספר 8 ו11 לטובת הלוואה הגדולה של 6 מליון - לבנק לאומי"
```

- **One Mortgage**: 6,000,000 ₪
- **Collateral**: Properties #2, #8, #11
- **Bank**: Bank Leumi (לאומי)
- **Monthly Payment**: 57,000 ₪

Implementation:
- Create ONE Mortgage record with `propertyId` = primary property
- Store additional property IDs in `linkedProperties` array
- Note in `collateralDescription`: "משועבד עם נכסים 8 ו-11"

### 2. Foreign Currency Mortgage
```
"הלוואה של כ-100,000 אירו (350,000 ₪)"
```

- **Amount**: 100,000 EUR
- **Equivalent**: 350,000 ILS
- **Exchange Rate**: 3.50

Implementation:
- `loanAmount`: 350000.00 (always store in ILS)
- `currency`: "EUR"
- `exchangeRate`: 3.50
- `notes`: "Original amount: 100,000 EUR"

### 3. Future Repayment Start
```
"תחילת החזר הלוואה ב-16.11.2025"
```

Implementation:
- `startDate`: Loan origination date
- `repaymentStartDate`: "2025-11-16"
- `status`: ACTIVE
- `notes`: "Repayment starts 16.11.2025"

### 4. Loan with Equity/Profit Sharing
```
"הלוואה שניתנה לאפ הולדינג 36% או 38% מהרווחים שיהיו שייך לנטוביץ"
```

- **Type**: Investment loan with profit sharing
- **Amount**: 1,500,000 ₪
- **Profit Share**: 36-38% of future profits

Implementation:
- Consider separate `InvestmentLoan` entity OR
- Use Mortgage with special fields:
  - `loanType`: "investment_with_profit_share"
  - `profitSharePercentage`: 36.00
  - `notes`: "36-38% of profits from building"

---

## Indexes

Current indexes:
- `propertyId` - Main collateral property
- `accountId` - Account owner
- `status` - Filter by status
- `bank` - Group by bank
- `bankAccountId` - Payment account

Recommended additional indexes:
- `startDate` - Chronological queries
- `endDate` - Upcoming maturity
- `loanType` - Type of loan

---

## Validation Rules

### Required Fields
- `loanAmount` - Must be positive
- `propertyId` - Must reference valid property
- `bank` - Must not be empty
- `startDate` - Must be valid date

### Constraints
- `interestRate` - If set, must be between 0 and 100 (percent)
- `monthlyPayment` - If set, must be positive
- `currentBalance` - If set, must be >= 0 and <= loanAmount
- `endDate` - If set, must be after startDate
- `repaymentStartDate` - If set, must be >= startDate

---

## Business Rules

1. **Property Collateral**
   - Primary property stored in `propertyId`
   - Additional collateral properties in `linkedProperties` array
   - All collateral properties must have `isMortgaged = true`

2. **Monthly Payment Calculation**
   - If not provided, can calculate from: loan amount, interest rate, term
   - Formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
   - Where: P = payment, L = loan, c = monthly rate, n = months

3. **Current Balance Tracking**
   - Update via MortgagePayment records
   - Calculate: Original loan - sum(principal payments)
   - Important for net worth calculations

4. **Bank Relationships**
   - Common banks in data: לאומי, מרכנתיל, דיסקונט, בלמ"ש (Bank Leumi, Mercantile, Discount, Bank Leumi le-Mortgages)
   - Store normalized bank names
   - Link to BankAccount if available

5. **Linked Properties Logic**
   - Mortgage may secure multiple properties
   - If one property sold, mortgage may remain on others
   - Track which properties are released when paid

6. **Foreign Currency Handling**
   - Always store in ILS equivalent
   - Track original currency and exchange rate
   - Recalculate if exchange rate changes significantly

---

## Migration Notes

### Data Patterns in Unstructured Data

1. **Standard Mortgage**
   ```
   "משועבדת 1,400,000 ₪ בבנק מרכנתיל"
   → loanAmount: 1400000.00
   → bank: "מרכנתיל"
   → status: ACTIVE
   ```

2. **Multiple Property Collateral**
   ```
   "משועבדת ביחד עם נכס מספר 8 ו11"
   → Parse property IDs: 8, 11
   → Add to linkedProperties array
   ```

3. **Large Primary Loan**
   ```
   "הלוואה של 6 מליון בלאומי, החזר של 50 א' בחודש"
   → loanAmount: 6000000.00
   → bank: "לאומי"
   → monthlyPayment: 57000.00 (note says 50K but field shows 57K)
   ```

4. **Foreign Mortgage**
   ```
   "הלוואה של כ-100,000 אירו (350,000 ₪) משועבד מבנק גרמני"
   → loanAmount: 350000.00
   → currency: "EUR"
   → bank: "German Bank"
   → notes: "Original: 100,000 EUR"
   ```

### Extraction Rules

1. Look for keywords: משועבד, משועבדת, הלוואה, משכנתא
2. Extract amount: numbers followed by ₪, אירו, EUR, USD
3. Extract bank name after: בבנק, לבנק, מבנק
4. Extract monthly payment: החזר חודשי, בחודש
5. Check for linked properties: "ביחד עם נכס", "עם נכסים"

---

## Example Records

### Example 1: Standard Residential Mortgage
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "bank": "מרכנתיל",
  "loanAmount": 1400000.00,
  "interestRate": 3.5,
  "monthlyPayment": 6250.00,
  "startDate": "2020-01-15",
  "endDate": "2040-01-15",
  "status": "ACTIVE",
  "repaymentMonths": 240,
  "currentBalance": 1320000.00,
  "linkedProperties": [],
  "currency": "ILS"
}
```

### Example 2: Large Loan with Multiple Collateral
```json
{
  "id": "uuid",
  "propertyId": "property-2-uuid",
  "accountId": "account-uuid",
  "bank": "לאומי",
  "loanAmount": 6000000.00,
  "monthlyPayment": 57000.00,
  "startDate": "2019-06-01",
  "status": "ACTIVE",
  "linkedProperties": [
    "property-2-uuid",
    "property-8-uuid",
    "property-11-uuid"
  ],
  "collateralDescription": "משועבד עם נכסים מספר 8 ו-11",
  "currency": "ILS"
}
```

### Example 3: Foreign Currency Mortgage
```json
{
  "id": "uuid",
  "propertyId": "property-17-uuid",
  "accountId": "account-uuid",
  "bank": "German Bank",
  "loanAmount": 350000.00,
  "currency": "EUR",
  "exchangeRate": 3.50,
  "startDate": "2018-03-20",
  "status": "ACTIVE",
  "notes": "Original amount: 100,000 EUR. Foreign property in Leipzig, Germany."
}
```

### Example 4: Small Partial Mortgage
```json
{
  "id": "uuid",
  "propertyId": "property-7-uuid",
  "accountId": "account-uuid",
  "bank": "לאומי",
  "loanAmount": 400000.00,
  "startDate": "2021-05-10",
  "status": "ACTIVE",
  "currency": "ILS",
  "notes": "Partial mortgage on property value"
}
```

### Example 5: Investment Loan with Profit Share
```json
{
  "id": "uuid",
  "propertyId": "property-20-uuid",
  "accountId": "account-uuid",
  "bank": "אפ-הולדינג",
  "loanAmount": 1500000.00,
  "interestRate": 7.0,
  "startDate": "2022-11-01",
  "repaymentStartDate": "2025-11-16",
  "endDate": "2028-11-16",
  "repaymentMonths": 36,
  "status": "ACTIVE",
  "loanType": "investment_with_profit_share",
  "notes": "36-38% of profits from building. Collateral: personal guarantee + promissory note (שטר חוב)"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/mortgages` - Create mortgage
- `GET /api/mortgages` - List mortgages (with filters)
- `GET /api/mortgages/:id` - Get mortgage details
- `PUT /api/mortgages/:id` - Update mortgage
- `DELETE /api/mortgages/:id` - Delete mortgage (if no payments)

### Filter Parameters
- `status` - Filter by status
- `bank` - Filter by bank
- `propertyId` - Mortgages for specific property

### Calculations
- `GET /api/mortgages/:id/balance` - Current balance
- `GET /api/mortgages/:id/amortization` - Amortization schedule
- `GET /api/mortgages/total` - Total mortgage debt across portfolio

---

## UI Components

### Mortgage List View
- Property address
- Bank name
- Loan amount
- Monthly payment
- Current balance (calculated)
- Status badge
- Actions

### Mortgage Details View
- **Basic Info**: Bank, loan amount, status
- **Terms**: Interest rate, monthly payment, start/end dates
- **Collateral**: Primary property + linked properties
- **Balance**: Current balance, paid to date, remaining
- **Payments**: Payment history table
- **Amortization**: Schedule chart/table

---

## Notes

1. **Multiple Property Collateral**
   - Common in portfolio: one large loan secures multiple properties
   - Track carefully for property sale scenarios
   - Update when properties are released from mortgage

2. **Foreign Currency Loans**
   - Exchange rate fluctuations affect balance
   - Consider periodic recalculation
   - Store original currency for reference

3. **Profit-Sharing Loans**
   - Different from standard mortgages
   - May need separate entity or enhanced fields
   - Track expected vs actual profit shares

4. **Bank Names Normalization**
   - Standardize: "לאומי" (not "בנק לאומי", "Bank Leumi")
   - Create reference table for bank names
   - Support Hebrew and English names

5. **Balance Tracking**
   - Calculate from payment history
   - Manual adjustment capability for corrections
   - Important for net worth and equity calculations
