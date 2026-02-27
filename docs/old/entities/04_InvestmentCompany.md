# Investment Company Entity

**Entity Type:** Financial/Partnership  
**Database Table:** `investment_companies`  
**Purpose:** Tracks investment companies and partnership entities that hold properties

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `accountId` | UUID | ✅ Yes | Account reference | Schema |
| `name` | String | ✅ Yes | Company/partnership name | Schema |
| `registrationNumber` | String | ❌ No | Company registration number | Schema |
| `country` | String | ✅ Yes | Country of registration (default: "Israel") | Schema |
| `investmentAmount` | Decimal(12,2) | ❌ No | Total investment amount | Schema |
| `ownershipPercentage` | Decimal(5,2) | ❌ No | Percentage owned by account holder | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `companyType` | String | ❌ No | Type: "holding", "partnership", "investment_fund" | Unstructured |
| `profitSharePercentage` | Decimal(5,2) | ❌ No | Share of profits from company operations | Unstructured |
| `partners` | Text | ❌ No | Names of other partners/shareholders | Unstructured |
| `investmentDate` | DateTime | ❌ No | Date of initial investment | Unstructured |
| `loanToCompany` | Decimal(12,2) | ❌ No | Amount loaned to the company | Unstructured |
| `expectedReturns` | Text | ❌ No | Description of expected returns | Unstructured |
| `managementFee` | Decimal(6,2) | ❌ No | Monthly/annual management fee | Unstructured |
| `shareholdingDetails` | Text | ❌ No | Detailed shareholding structure | Unstructured |
| `contactPerson` | String | ❌ No | Primary contact at company | Unstructured |
| `contactPhone` | String | ❌ No | Contact phone number | Unstructured |

---

## Relationships

### One-to-Many
- **properties** → `Property[]` - Properties held by this company

### Many-to-One
- **account** → `Account` - Account that has stake in company

---

## Investment Company Types from Data

### 1. Holding Company (חברת אחזקות)
```
"חברת איילי - 4 דירות בבעלות חברת איילי שאני מחזיק במניותיה"
```

- **Purpose**: Hold and manage property portfolio
- **Structure**: Owner holds shares in company, company owns properties
- **Benefits**: Tax advantages, liability separation

### 2. Partnership with Profit Sharing (שותפות עם חלוקת רווחים)
```
"אפ-הולדינג - 33% מהרווחים של הניהול - 1/8 נכס"
"38% מהרווחים שיהיו שייך לנטוביץ"
```

- **Purpose**: Co-investment with profit sharing
- **Structure**: Multiple partners invest, share profits based on agreement
- **Key Fields**: `profitSharePercentage`, `loanToCompany`

### 3. Building Company Investment (השקעה בחברת בנייה)
```
"השקעה בבניין דירות ברחוב דימפל לייפציג - באמצעות אפ-הולדינג"
Investment: 600,000 ₪
```

- **Purpose**: Invest in development projects
- **Structure**: Invest capital, receive units or profit share
- **Returns**: Units in building OR percentage of profits

### 4. Land Partnership (שותפות בקרקע)
```
"1/6 ממגרש בחדרה - שותפים יבולים - שוקי שרון + זיו שמור"
```

- **Purpose**: Joint land ownership and development
- **Structure**: Multiple owners hold fractional interests
- **Key Fields**: `partners`, `ownershipPercentage`

---

## Indexes

Current indexes:
- `accountId` - Account owner
- `name` - Company name searches

Recommended additional indexes:
- `country` - Geographic grouping
- `companyType` - Type filtering
- `registrationNumber` - Legal lookup

---

## Validation Rules

### Required Fields
- `name` - Must be at least 2 characters
- `accountId` - Must reference valid account

### Constraints
- `investmentAmount` - If set, must be positive
- `ownershipPercentage` - If set, must be between 0.01 and 100.00
- `profitSharePercentage` - If set, must be between 0.01 and 100.00
- `registrationNumber` - Should match country's format

---

## Business Rules

1. **Company Type Determination**
   - Name contains "בע\"מ", "Ltd" → Holding company
   - Name contains "שותפות" → Partnership
   - Name contains "הולדינג", "Holding" → Holding company

2. **Investment Tracking**
   - Track initial investment amount
   - Track loans to company separately
   - Calculate total exposure: investment + loans

3. **Profit Distribution**
   - Track profit share percentage
   - Document profit distribution terms in notes
   - May be based on: management fees, building profits, rental income

4. **Property Linkage**
   - Properties can be linked to investment company
   - Property ownership is via company (indirect ownership)
   - Important for tax and reporting

5. **Partner Information**
   - Store partner names for reference
   - Track partner contact information
   - Important for coordination

---

## Migration Notes

### Data Patterns in Unstructured Data

1. **Simple Holding Company**
   ```
   "חברת איילי בע\"מ - 4 דירות בבעלות"
   ```
   Extract:
   - name: "חברת איילי בע\"מ"
   - companyType: "holding"
   - country: Determine from property location (Germany)
   - notes: "4 apartments"

2. **Investment with Profit Share**
   ```
   "השקעה בבניין דירות ברחוב דימפל - באמצעות אפ-הולדינג
   ₪ 600,000.00 - 33% מהרווחים של הניהול - 1/8 נכס"
   ```
   Extract:
   - name: "אפ-הולדינג"
   - investmentAmount: 600000.00
   - profitSharePercentage: 33.00
   - ownershipPercentage: 12.50 (1/8 = 12.5%)
   - notes: "Building on Dimpfel St., Leipzig. 1/8 ownership + 33% management profits"

3. **Land Partnership**
   ```
   "1/6 ממגרש בחדרה - שותפים יבולים - שוקי שרון + זיו שמור"
   ```
   Extract:
   - name: "יבולים - שותפות חדרה"
   - companyType: "partnership"
   - partners: "שוקי שרון, זיו שמור"
   - ownershipPercentage: 16.67 (1/6)
   - contactPhone: "0509733355" (זיו שמור)

4. **Company with Loan**
   ```
   "הלוואה שניתנה לאפ הולדינג לרכישת הבניין 
   36% או 38% מהרווחים שיהיו שייך לנטוביץ"
   ```
   Extract:
   - name: "אפ-הולדינג"
   - loanToCompany: 1500000.00
   - profitSharePercentage: 38.00
   - expectedReturns: "36-38% of building profits"
   - notes: "Loan for building purchase. Two apartments on Liat's name."

---

## Example Records

### Example 1: German Holding Company
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "חברת איילי בע\"מ",
  "registrationNumber": "DE-12345678",
  "country": "Germany",
  "companyType": "holding",
  "investmentAmount": 350000.00,
  "notes": "Holds 4 apartments in Leipzig, Germany"
}
```

### Example 2: Partnership with Profit Share
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "אפ-הולדינג",
  "country": "Germany",
  "companyType": "investment_fund",
  "investmentAmount": 600000.00,
  "ownershipPercentage": 12.50,
  "profitSharePercentage": 33.00,
  "contactPerson": "יניב שפיץ",
  "contactPhone": "054-3120178",
  "notes": "Dimpfel St. building, Leipzig. 1/8 ownership of property + 33% management profits"
}
```

### Example 3: Land Development Partnership
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "יבולים - שותפות חדרה",
  "country": "Israel",
  "companyType": "partnership",
  "ownershipPercentage": 16.67,
  "partners": "שוקי שרון, זיו שמור",
  "contactPerson": "זיו שמור",
  "contactPhone": "0509733355",
  "notes": "1/6 ownership of plot in Hadera. Gush 1036, Chelka 181 + 60"
}
```

### Example 4: Investment with Loan + Profit Share
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "אפ-הולדינג גלפי",
  "country": "Israel",
  "companyType": "partnership",
  "investmentAmount": 1500000.00,
  "loanToCompany": 1500000.00,
  "profitSharePercentage": 38.00,
  "expectedReturns": "7% annual interest + 36-38% of profits",
  "notes": "Galif building. Loan agreement file 226/206. Michal to live in apartment. Repayment starts 16.11.2025. Personal guarantee + promissory note."
}
```

### Example 5: Real Estate Partnership
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "י. נטוביץ ושות'",
  "country": "Israel",
  "companyType": "partnership",
  "registrationNumber": "580-123456-7",
  "notes": "Partnership for commercial real estate investments"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/investment-companies` - Create company
- `GET /api/investment-companies` - List companies (with filters)
- `GET /api/investment-companies/:id` - Get company details
- `PUT /api/investment-companies/:id` - Update company
- `DELETE /api/investment-companies/:id` - Delete company (if no properties)

### Filter Parameters
- `companyType` - Filter by type
- `country` - Filter by country
- `search` - Search by name

### Analytics
- `GET /api/investment-companies/:id/returns` - Calculate returns
- `GET /api/investment-companies/:id/properties` - List properties
- `GET /api/investment-companies/summary` - Investment summary

---

## UI Components

### Investment Company List View
- Company name (primary)
- Type badge
- Country flag
- Investment amount
- Ownership %
- Profit share %
- Number of properties
- Total value (calculated)
- Actions

### Investment Company Details View
- **Basic Info**: Name, registration, type, country
- **Investment**: Amount invested, loans provided, ownership %
- **Returns**: Profit share %, expected returns, actual returns
- **Partners**: Partner names and contacts
- **Properties**: List of properties held by company
- **Documents**: Agreements, contracts, financial reports

---

## Notes

1. **German Investment Companies**
   - Leipzig building investments common in data
   - Track in EUR but convert to ILS
   - Different tax implications than Israeli properties

2. **Profit Share vs Ownership**
   - Ownership % = share of company equity
   - Profit share % = share of operational profits (management fees, rental income)
   - Both can exist simultaneously

3. **Loans to Companies**
   - Sometimes investor provides loan to company
   - Track separately from investment amount
   - Loan may have interest + profit sharing terms

4. **Partners/Co-Investors**
   - Important to track for coordination
   - Store contact information
   - Decisions may require partner consultation

5. **Property Linkage**
   - Properties can have `investmentCompanyId` field
   - Indicates indirect ownership via company
   - Important for consolidation and reporting

6. **Tax Implications**
   - Company structure affects taxation
   - Foreign companies have additional requirements
   - Consult with tax professional (note in system)

7. **Future Enhancements**
   - Track distributions/dividends received
   - Track management fees paid
   - Calculate ROI automatically
