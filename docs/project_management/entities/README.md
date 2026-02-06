# Entity Documentation

Complete entity reference for the Property Portfolio Management System. This folder contains detailed documentation for each entity, including current schema, additional fields from unstructured data, and migration guidance.

---

## Entity Overview

### Core Entities (Primary Business Objects)

| # | Entity | Status | Description | File |
|---|--------|--------|-------------|------|
| 1 | **Property** | ✅ Exists | Core entity - Real estate properties | [01_Property.md](01_Property.md) |
| 2 | **Owner** | ✅ Exists | Property owners (individuals, companies) | [02_Owner.md](02_Owner.md) |
| 3 | **Unit** | ✅ Exists | Rentable units within properties | [06_Unit.md](06_Unit.md) |
| 4 | **Tenant** | ✅ Exists | Individuals/companies renting units | [10_Tenant.md](10_Tenant.md) |
| 5 | **Lease** | ✅ Exists | Rental contracts | [07_Lease.md](07_Lease.md) |

### Financial Entities

| # | Entity | Status | Description | File |
|---|--------|--------|-------------|------|
| 6 | **Mortgage** | ✅ Exists | Loans secured by property | [03_Mortgage.md](03_Mortgage.md) |
| 7 | **InvestmentCompany** | ✅ Exists | Investment holdings & partnerships | [04_InvestmentCompany.md](04_InvestmentCompany.md) |
| 8 | **BankAccount** | ✅ Exists | Bank accounts for transactions | [11_BankAccount.md](11_BankAccount.md) |
| 9 | **PropertyValuation** | ✅ Exists | Property value history | [12_PropertyValuation.md](12_PropertyValuation.md) |
| 10 | **PropertyExpense** | ✅ Exists | Property expenses | [13_PropertyExpense.md](13_PropertyExpense.md) |
| 11 | **PropertyIncome** | ✅ Exists | Property income | (Schema only) |
| 12 | **MortgagePayment** | ✅ Exists | Mortgage payment history | (Schema only) |

### Relationship Entities

| # | Entity | Status | Description | File |
|---|--------|--------|-------------|------|
| 13 | **PropertyOwnership** | ✅ Exists | Links owners to properties | [05_PropertyOwnership.md](05_PropertyOwnership.md) |
| 14 | **Partner** | ⚠️ Proposed | Informal co-owners & partners | [08_Partner.md](08_Partner.md) |

### Supporting Entities

| # | Entity | Status | Description | File |
|---|--------|--------|-------------|------|
| 15 | **PlotInfo** | ✅ Exists | Israeli land registry (Gush/Chelka) | [09_PlotInfo.md](09_PlotInfo.md) |
| 16 | **Notification** | ✅ Exists | Lease expiration notifications | (Schema only) |
| 17 | **Account** | ✅ Exists | User account container | (Schema only) |
| 18 | **User** | ✅ Exists | System users | (Schema only) |

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         PROPERTY (Core)                              │
│  - address, fileNumber, type, status                                 │
│  - city, country, area, value                                        │
│  - gush/helka (quick access)                                         │
│  - isMortgaged, isPartialOwnership                                   │
└────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬────────────────────┘
     │     │     │     │     │     │     │     │
     │     │     │     │     │     │     │     └─→ InvestmentCompany
     │     │     │     │     │     │     │         (optional holding)
     │     │     │     │     │     │     │
     │     │     │     │     │     │     └───────→ PlotInfo (1:1)
     │     │     │     │     │     │               (gush/chelka details)
     │     │     │     │     │     │
     │     │     │     │     │     └─────────────→ PropertyValuation (1:N)
     │     │     │     │     │                     (value history)
     │     │     │     │     │
     │     │     │     │     └───────────────────→ PropertyExpense (1:N)
     │     │     │     │                           (expense tracking)
     │     │     │     │
     │     │     │     └─────────────────────────→ PropertyIncome (1:N)
     │     │     │                                 (income tracking)
     │     │     │
     │     │     └───────────────────────────────→ Mortgage (1:N)
     │     │                                       (loans on property)
     │     │                                       (can link multiple properties)
     │     │
     │     └─────────────────────────────────────→ PropertyOwnership (1:N)
     │                                             (links to Owner)
     │                                                    │
     │                                                    └→ Owner (1:N)
     │                                                       (property owners)
     │
     └───────────────────────────────────────────→ Unit (1:N)
                                                   (rentable units)
                                                        │
                                                        └→ Lease (1:N)
                                                           (rental contracts)
                                                                │
                                                                └→ Tenant (N:1)
                                                                   (renters)
```

---

## Data Migration Overview

### Data Sources

1. **Current Database** (PostgreSQL via Prisma)
   - Existing properties with basic information
   - Some units, tenants, leases already created

2. **Unstructured Data** (HTML Files)
   - **רשימת נכסים איציק (2).html** - Main property list
   - **הלווואה.html** - Mortgage/loan details
   - **שכירות.html** - Lease information
   - Plus files in `existing_unstructure_data2/` folder

---

## Key Findings from Unstructured Data

### Properties
- **~25+ properties** in unstructured data
- Mix of: residential, commercial, land, offices, storage
- Locations: Israel (majority), Germany (Leipzig)
- Value range: 147,200 ₪ to 8,000,000 ₪

### Ownership Patterns
- **Multiple owners**: יצחק, אילנה, ליאת, אביעד, מיכל
- **Partial ownership common**: 50%, 36%, 25%, 16.67%, etc.
- **Co-owners mentioned**: ~10+ external partners/co-owners

### Mortgages
- **Major loan**: 6,000,000 ₪ securing 3 properties (properties #2, #8, #11)
- **Total mortgage debt**: ~15,699,447 ₪ across portfolio
- **Multiple banks**: לאומי, מרכנתיל, דיסקונט, בלמ"ש, German banks

### Special Property Types
- **Development projects**: פינוי בינוי (evacuation-construction)
- **Investment holdings**: Via אפ-הולדינג, חברת איילי
- **Land parcels**: Agricultural land, development land
- **Foreign properties**: Leipzig, Germany (EUR-denominated)

---

## New Fields Discovered

### Property Enhancements

| Field | Why Needed | Example from Data |
|-------|------------|-------------------|
| `ownershipPercentage` | Partial ownership tracking | "50%", "36%", "1/6" |
| `developmentStatus` | Construction progress | "בהליכי פינוי בינוי מתקדמים" |
| `developmentCompany` | Track developer | "חברת קרסו" |
| `expectedCompletionYears` | Timeline tracking | 6 years, 2-3 years |
| `projectedValue` | Future value estimate | After development completion |
| `coOwners` | Informal partners | "אריאלה לאובר", "צביקה נטוביץ" |
| `buildingPotential` | Development capacity | "קרקע ל-7 יח\"ד" |
| `balconyArea` | Additional area | "מרפסת 50 מ\"ר", "מרפסת 150 מ\"ר" |
| `currency` | Foreign properties | "EUR", "USD" for German properties |

### Mortgage Enhancements

| Field | Why Needed | Example from Data |
|-------|------------|-------------------|
| `linkedPropertiesDetails` | Multi-property collateral | "משועבדת ביחד עם נכס מספר 8 ו11" |
| `currency` | Foreign loans | "100,000 אירו" |
| `exchangeRate` | Currency conversion | 3.50 ILS per EUR |
| `repaymentStartDate` | Delayed repayment | "תחילת החזר ב-16.11.2025" |
| `loanType` | Special loan types | "investment_with_profit_share" |
| `profitSharePercentage` | Investment loans | "36-38% מהרווחים" |

### InvestmentCompany Enhancements

| Field | Why Needed | Example from Data |
|-------|------------|-------------------|
| `profitSharePercentage` | Profit distribution | "33% מהרווחים של הניהול" |
| `loanToCompany` | Loans provided | 1,500,000 ₪ to אפ-הולדינג |
| `partners` | Partner tracking | "שוקי שרון + זיו שמור" |
| `contactPerson` | Primary contact | "יניב שפיץ 054-3120178" |

---

## Proposed New Entities

### 1. Partner Entity (NEW) ⭐
**Purpose**: Track informal co-owners and business partners

**Why Needed**:
- Many co-owners mentioned in data: "אריאלה לאובר", "צביקה נטוביץ", "משה בורשטיין"
- Not full Owner entities (no separate properties)
- Need contact info for coordination
- Important for shared property decisions

**See**: [08_Partner.md](08_Partner.md)

---

### 2. DevelopmentProject Entity (NEW - Future)
**Purpose**: Track construction/development projects

**Why Needed**:
- Several properties in פינוי בינוי
- Track: developer, timeline, expected units, progress
- Examples: "חברת קרסו", "2-3 years", "7 יח\"ד potential"

**Fields**:
- propertyId (reference)
- projectType (evacuation_construction, new_building, renovation)
- developerCompany
- expectedCompletionDate
- unitsPlanned
- currentStatus
- timeline notes

---

### 3. StorageUnit Entity (NEW - Future)
**Purpose**: Track storage units separately from apartments

**Alternative**: Use Unit entity with `unitType = "storage"`

**Why Consider Separate**:
- Storage often separate from residential units
- Different rental rates
- Different lease terms
- Can be standalone properties

---

## Migration Priority

### Phase 1: Core Data (HIGHEST PRIORITY)
1. **Properties** - Import all ~25 properties
   - Address, type, status, gush/helka, value
   - Ownership percentages where clear

2. **Owners** - Create owner records
   - Family members: יצחק, אילנה, ליאת, אביעד, מיכל
   - Parse joint ownership ("יצחק ואילנה")

3. **PropertyOwnership** - Link owners to properties
   - Extract percentages (50%, 36%, 25%, 16.67%)
   - Handle partial vs full ownership

### Phase 2: Financial Data (HIGH PRIORITY)
4. **Mortgages** - Import all mortgage data
   - Create mortgage records (~10-15 mortgages)
   - Link multiple properties to 6M loan
   - Foreign currency mortgages

5. **PropertyValuation** - Create valuation records
   - One valuation per property (from שווי column)
   - Date: 2021-12-14 (document date)

### Phase 3: Partners & Investments (MEDIUM PRIORITY)
6. **Partners** (NEW ENTITY) - Create partner records
   - Extract mentioned co-owners
   - Business partners
   - Track contact information

7. **InvestmentCompany** - Import investment holdings
   - אפ-הולדינג investments
   - חברת איילי (German properties)
   - Partnership entities

8. **PlotInfo** - Detailed land registry
   - Extract gush/chelka for all properties
   - Handle multiple parcels

### Phase 4: Units & Leases (LOWER PRIORITY)
9. **Units** - Create units where identified
   - Multi-unit properties
   - Storage units
   - Office units

10. **Tenants & Leases** - Import from שכירות.html
    - Current tenants
    - Active leases
    - Rental income

### Phase 5: Historical Data (LOWEST PRIORITY)
11. **PropertyExpense** - If available
12. **PropertyIncome** - If available
13. **MortgagePayment** - If available

---

## Data Quality Observations

### Excellent Quality ✅
- Property addresses (mostly complete)
- Gush/Chelka data (very detailed)
- Valuation data (all properties have values)
- Mortgage amounts (clear and detailed)
- Ownership structure (well-documented)

### Good Quality ⚠️
- Ownership percentages (some inferred)
- Co-owner names (mentioned but not detailed)
- Property types (can be inferred from descriptions)
- Area measurements (some properties have, others don't)

### Limited Quality ⚠️
- Unit-level data (properties show unit counts but not details)
- Tenant information (minimal in property list)
- Lease terms (need separate file)
- Payment history (not in property list)
- Expense tracking (not in property list)

---

## Entity Statistics from Unstructured Data

### Properties by Owner
- **יצחק נטוביץ**: ~15 properties (largest portfolio)
- **אילנה נטוביץ**: ~3-4 properties
- **ליאת**: ~4 properties
- **אביעד**: ~3 properties
- **מיכל**: ~2 properties
- **Joint (יצחק ואילנה)**: ~3 properties

### Properties by Type (Estimated)
- **Residential**: ~18 properties (apartments, houses)
- **Commercial**: ~3 properties (offices)
- **Land**: ~4 properties (agricultural, development)
- **Mixed**: ~2 properties

### Properties by Location
- **Ramat Gan (רמת גן)**: ~6 properties
- **Petach Tikva (פתח תקווה)**: ~5 properties
- **Tel Aviv (תל אביב)**: ~3 properties
- **Givatayim (גבעתיים)**: ~2 properties
- **Germany (Leipzig)**: ~3 properties
- **Others**: Hadera, Rehovot, Rishon LeZion, Jerusalem, etc.

### Properties by Status (Estimated)
- **Owned**: ~20 properties
- **In Construction/Development**: ~3 properties
- **Investment (via company)**: ~3 properties
- **Sold (pending)**: ~1 property

### Financial Summary from Data
- **Total Property Value**: 75,681,000 ₪
- **Total Mortgages**: 15,699,447 ₪
- **Net Value**: 48,629,403 ₪ (after tax and mortgages)
- **Largest Mortgage**: 6,000,000 ₪ (3 properties collateral)

---

## Field Enhancement Summary

### Fields to Add to Existing Entities

#### Property (15 new fields)
- `ownershipPercentage`, `developmentStatus`, `developmentCompany`
- `expectedCompletionYears`, `projectedValue`, `rentalIncome`
- `isPartialOwnership`, `coOwners`, `buildingPotential`
- `isSoldPending`, `salePrice`, `propertyDetails`
- `floor`, `balconyArea`, `storage`

#### Mortgage (11 new fields)
- `loanType`, `currentBalance`, `monthlyInterestPayment`
- `monthlyPrincipalPayment`, `totalExpectedRepayment`, `repaymentMonths`
- `linkedPropertiesDetails`, `collateralDescription`, `repaymentStartDate`
- `currency`, `exchangeRate`

#### InvestmentCompany (10 new fields)
- `companyType`, `profitSharePercentage`, `partners`
- `investmentDate`, `loanToCompany`, `expectedReturns`
- `managementFee`, `shareholdingDetails`, `contactPerson`, `contactPhone`

#### Owner (4 new fields)
- `relationshipType`, `sharePercentage`, `isActive`, `familyRelation`

#### Unit (12 new fields)
- `unitType`, `area`, `balconyArea`, `bedrooms`, `bathrooms`
- `hasBalcony`, `hasStorage`, `hasParking`, `parkingSpots`
- `unitDescription`, `currentRent`, `isRented`, `furnitureStatus`

#### Lease (10 new fields)
- `securityDeposit`, `rentPaymentDay`, `indexationLinked`
- `indexationRate`, `rentIncreaseSchedule`, `utilities`
- `maintenanceResponsibility`, `cancellationTerms`, `renewalOption`, `signedDate`

---

## Recommended Schema Changes

### 1. Add Partner Entity (NEW)
```prisma
model Partner {
  id           String   @id @default(uuid())
  accountId    String   @map("account_id")
  name         String
  email        String?
  phone        String?
  partnerType  PartnerType
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  // Relations
  account      Account  @relation(fields: [accountId], references: [id])
  properties   PropertyPartner[]
  
  @@index([accountId])
  @@map("partners")
}

model PropertyPartner {
  id              String   @id @default(uuid())
  propertyId      String   @map("property_id")
  partnerId       String   @map("partner_id")
  accountId       String   @map("account_id")
  sharePercentage Decimal? @db.Decimal(5, 2)
  role            String?
  notes           String?
  createdAt       DateTime @default(now()) @map("created_at")
  
  // Relations
  property        Property @relation(fields: [propertyId], references: [id])
  partner         Partner  @relation(fields: [partnerId], references: [id])
  
  @@index([propertyId])
  @@index([partnerId])
  @@map("property_partners")
}

enum PartnerType {
  CO_OWNER
  INVESTOR
  DEVELOPER
  CONSULTANT
  OTHER
}
```

### 2. Extend Property Model
Add recommended fields from [01_Property.md](01_Property.md)

### 3. Extend Mortgage Model
Add recommended fields from [03_Mortgage.md](03_Mortgage.md)

### 4. Extend Other Models
Add fields as documented in individual entity files

---

## Migration Workflow

### Step 1: Schema Updates
1. Review entity documentation files
2. Identify fields to add to existing models
3. Create migrations for schema changes
4. Create Partner entity and relations

### Step 2: Data Extraction Scripts
1. **Property Parser** - Extract properties from HTML
   - Parse property list table
   - Extract: address, gush/chelka, value, ownership
   
2. **Ownership Parser** - Extract ownership data
   - Identify owner names
   - Calculate ownership percentages
   - Create Owner and PropertyOwnership records

3. **Mortgage Parser** - Extract mortgage data
   - Parse mortgage amounts
   - Link to properties (including multi-property mortgages)
   - Handle foreign currency

4. **Partner Parser** - Extract partner mentions
   - Identify co-owner names from text
   - Extract contact information where available
   - Create Partner records

### Step 3: Data Import
1. Import owners first (create Owner entities)
2. Import properties with enhanced fields
3. Create PropertyOwnership links
4. Import mortgages with property links
5. Import partners and property_partners links
6. Import investment companies
7. Import plot info
8. Import valuations

### Step 4: Validation
1. Verify ownership percentages sum to 100% (where possible)
2. Verify mortgage-property links
3. Verify gush/chelka format
4. Check for missing critical data
5. Validate foreign currency conversions

---

## Usage Guide

### For Developers

**When implementing a feature**:
1. Check relevant entity documentation file
2. Review current schema fields
3. Consider additional fields if needed
4. Follow relationship definitions
5. Apply validation rules

**When designing API**:
1. Reference entity documentation for DTOs
2. Use documented field names and types
3. Apply documented validation rules
4. Consider relationships for queries

### For Data Migration Team

**When migrating unstructured data**:
1. Review entity documentation for field mappings
2. Follow extraction examples
3. Use provided data patterns
4. Validate after import
5. Document any discrepancies

---

## Quick Reference

### Entity Selection Guide

**Need to track...**
- A building/apartment/land? → **Property**
- Who owns it? → **Owner** + **PropertyOwnership**
- Informal co-owner? → **Partner**
- A unit within building? → **Unit**
- A rental contract? → **Lease** + **Tenant**
- A loan on property? → **Mortgage** + **BankAccount**
- Investment holding? → **InvestmentCompany**
- Land registry info? → **PlotInfo**
- Property value history? → **PropertyValuation**
- Expenses/income? → **PropertyExpense**/**PropertyIncome**

---

## Next Steps

### 1. Review Entity Documentation
Read through each entity file to understand:
- Current schema fields
- Additional fields from data
- Relationships
- Validation rules
- Example records

### 2. Plan Schema Changes
Decide which additional fields to implement:
- High priority: Fields critical for data migration
- Medium priority: Fields that improve functionality
- Low priority: Nice-to-have enhancements

### 3. Create Migration Scripts
Using entity documentation as guide:
- Parse HTML files
- Extract data per entity
- Transform to database format
- Handle relationships and links

### 4. Validate Imported Data
After migration:
- Check data completeness
- Verify relationships
- Validate financial totals
- Review edge cases

---

## Document Index

1. [Property](01_Property.md) - Core property entity
2. [Owner](02_Owner.md) - Property owners
3. [Mortgage](03_Mortgage.md) - Loans and financing
4. [InvestmentCompany](04_InvestmentCompany.md) - Investment holdings
5. [PropertyOwnership](05_PropertyOwnership.md) - Ownership relationships
6. [Unit](06_Unit.md) - Rentable units
7. [Lease](07_Lease.md) - Rental contracts
8. [Partner](08_Partner.md) - Informal partners (NEW)
9. [PlotInfo](09_PlotInfo.md) - Land registry details
10. [Tenant](10_Tenant.md) - Tenants/renters
11. [BankAccount](11_BankAccount.md) - Bank accounts
12. [PropertyValuation](12_PropertyValuation.md) - Valuation history
13. [PropertyExpense](13_PropertyExpense.md) - Expense tracking

---

## Contact

For questions about entity structure or migration:
- Review entity documentation files
- Check Prisma schema: `apps/backend/prisma/schema.prisma`
- Reference unstructured data: `docs/project_management/existing_unstructure_data/`

---

**Last Updated**: February 2, 2026  
**Status**: Documentation complete, ready for implementation  
**Entities Documented**: 13 entities (10 existing + 3 proposed)  
**Total Fields Documented**: 200+ fields across all entities
