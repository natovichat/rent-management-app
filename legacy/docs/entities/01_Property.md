# Property Entity

**Entity Type:** Core  
**Database Table:** `properties`  
**Purpose:** Central entity representing real estate properties in the portfolio

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `accountId` | UUID | ✅ Yes | Account owner reference | Schema |
| `address` | String | ✅ Yes | Full property address | Schema |
| `fileNumber` | String | ❌ No | Property file/reference number (מספר תיק) | Schema |
| `type` | Enum | ❌ No | Property type (RESIDENTIAL, COMMERCIAL, LAND, MIXED_USE) | Schema |
| `status` | Enum | ❌ No | Property status (OWNED, IN_CONSTRUCTION, IN_PURCHASE, SOLD, INVESTMENT) | Schema |
| `country` | String | ✅ Yes | Country (default: "Israel") | Schema |
| `city` | String | ❌ No | City name | Schema |
| `totalArea` | Decimal(10,2) | ❌ No | Total property area in m² | Schema |
| `landArea` | Decimal(10,2) | ❌ No | Land area in m² | Schema |
| `estimatedValue` | Decimal(12,2) | ❌ No | Current estimated value | Schema |
| `lastValuationDate` | DateTime | ❌ No | Date of last valuation | Schema |
| `gush` | String | ❌ No | גוש (land registry block) | Schema |
| `helka` | String | ❌ No | חלקה (land registry parcel) | Schema |
| `isMortgaged` | Boolean | ✅ Yes | Is property mortgaged? (משועבד) | Schema |
| `investmentCompanyId` | UUID | ❌ No | Link to investment company | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

These fields should be added to support full data migration:

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `ownershipPercentage` | Decimal(5,2) | ❌ No | Percentage owned (e.g., 50%, 36%) | Unstructured |
| `plotSize` | String | ❌ No | Plot size description (e.g., "730 מ\"ר") | Unstructured |
| `developmentStatus` | String | ❌ No | Development status (e.g., "בהליכי פינוי בינוי") | Unstructured |
| `developmentCompany` | String | ❌ No | Developer company (e.g., "חברת קרסו") | Unstructured |
| `expectedCompletionYears` | Integer | ❌ No | Years until completion (e.g., 6, 3) | Unstructured |
| `projectedValue` | Decimal(12,2) | ❌ No | Future projected value (צפי) | Unstructured |
| `rentalIncome` | Decimal(10,2) | ❌ No | Monthly rental income (דמי שכירות) | Unstructured |
| `isPartialOwnership` | Boolean | ❌ No | Flag for partial ownership properties | Unstructured |
| `coOwners` | Text | ❌ No | Names of co-owners (temporary, before Partner entity) | Unstructured |
| `buildingPotential` | String | ❌ No | Development potential (e.g., "7 יח\"ד") | Unstructured |
| `isSoldPending` | Boolean | ❌ No | Property sold but transaction incomplete | Unstructured |
| `salePrice` | Decimal(12,2) | ❌ No | Sale price if sold/pending | Unstructured |
| `propertyDetails` | Text | ❌ No | Detailed description (e.g., "דירת פנטהאוס 140 מ\"ר + מרפסת 50 מ\"ר") | Unstructured |
| `floor` | String | ❌ No | Floor information at property level | Unstructured |
| `balconyArea` | Decimal(6,2) | ❌ No | Balcony/terrace area (מרפסת) | Unstructured |
| `storage` | Boolean | ❌ No | Has storage unit | Unstructured |

---

## Relationships

### One-to-Many
- **units** → `Unit[]` - Property can have multiple units
- **ownerships** → `PropertyOwnership[]` - Multiple ownership records
- **mortgages** → `Mortgage[]` - Multiple mortgages on property
- **valuations** → `PropertyValuation[]` - Historical valuations
- **expenses** → `PropertyExpense[]` - Property expenses
- **income** → `PropertyIncome[]` - Property income records

### One-to-One
- **plotInfo** → `PlotInfo` - Detailed plot/land registry information

### Many-to-One
- **account** → `Account` - Belongs to an account
- **investmentCompany** → `InvestmentCompany` - Optional investment company

---

## Enums

### PropertyType
```typescript
enum PropertyType {
  RESIDENTIAL  // מגורים - Apartments, houses
  COMMERCIAL   // מסחרי - Offices, stores, warehouses
  LAND         // קרקע - Agricultural, development land
  MIXED_USE    // שימוש מעורב - Mixed residential/commercial
}
```

### PropertyStatus
```typescript
enum PropertyStatus {
  OWNED           // בבעלות - Fully owned
  IN_CONSTRUCTION // בבנייה - Under construction
  IN_PURCHASE     // בהליכי רכישה - Purchase in progress
  SOLD            // נמכר - Sold
  INVESTMENT      // השקעה - Investment property (via company)
}
```

---

## Indexes

Current indexes:
- `accountId` - For querying properties by account
- `type` - For filtering by property type
- `status` - For filtering by status
- `country` - For geographic queries
- `investmentCompanyId` - For investment company properties

Recommended additional indexes:
- `city` - Common filter
- `gush, helka` - Land registry queries
- `isMortgaged` - Financial filtering
- `isPartialOwnership` - Ownership type queries

---

## Validation Rules

### Required Fields
- `address` - Must be at least 3 characters
- `accountId` - Must reference valid account

### Constraints
- `ownershipPercentage` - If set, must be between 0.01 and 100.00
- `totalArea` - If set, must be positive
- `landArea` - If set, must be positive and ≤ totalArea
- `estimatedValue` - If set, must be positive
- `rentalIncome` - If set, must be positive or zero
- `isMortgaged` - Defaults to `false`

---

## Business Rules

1. **Partial Ownership Properties**
   - If `isPartialOwnership` is true, must have entries in `PropertyOwnership` table
   - Sum of ownership percentages should ideally equal 100%

2. **Mortgage Status**
   - If `isMortgaged` is true, should have at least one active mortgage in `Mortgage` table
   - System should validate consistency

3. **Development Properties**
   - Properties with `status = IN_CONSTRUCTION` should have `developmentStatus` field populated
   - `expectedCompletionYears` relevant only for development properties

4. **Foreign Properties**
   - Properties with `country != "Israel"` may have different land registry systems
   - Currency conversions needed for foreign property values

5. **Sold Properties**
   - Properties with `status = SOLD` should have `salePrice` populated
   - If `isSoldPending` is true, ownership may not have transferred yet

---

## Migration Notes

### Data Sources
- **Current Database**: Existing properties with basic fields
- **Unstructured Data**: HTML tables with detailed property information including:
  - Ownership percentages
  - Co-owner names
  - Development status
  - Projected values
  - Rental income

### Migration Strategy
1. **Phase 1**: Import basic property information (address, gush/helka, value)
2. **Phase 2**: Add ownership relationships (create Owner and PropertyOwnership records)
3. **Phase 3**: Import financial data (mortgages, valuations)
4. **Phase 4**: Link co-owner information (parse and create Partner relationships)
5. **Phase 5**: Import development and projection data

### Field Mapping Examples

From unstructured data:
```
"50% מזכויות בדירה ברח' לביא 6 רמת גן"
→ address: "לביא 6, רמת גן"
→ ownershipPercentage: 50.00
→ isPartialOwnership: true
→ coOwners: "אריאלה לאובר" (extract to Partner entity)
```

```
"גוש 6158 חלקות 371-376"
→ gush: "6158"
→ helka: "371-376"
```

```
"בהליכי פינוי בינוי מתקדמים חברת קרסו"
→ developmentStatus: "בהליכי פינוי בינוי מתקדמים"
→ developmentCompany: "חברת קרסו"
→ status: IN_CONSTRUCTION
```

---

## Example Records

### Example 1: Fully Owned Apartment
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "address": "שאול חרנ\"ם 10, פתח תקווה",
  "fileNumber": null,
  "type": "RESIDENTIAL",
  "status": "OWNED",
  "country": "Israel",
  "city": "פתח תקווה",
  "totalArea": 140.00,
  "balconyArea": 50.00,
  "landArea": null,
  "estimatedValue": 4000000.00,
  "lastValuationDate": "2021-12-14",
  "gush": "6393",
  "helka": "314/45",
  "isMortgaged": true,
  "isPartialOwnership": false,
  "propertyDetails": "דירת פנטהאוס 140 מ\"ר + מרפסת 50 מ\"ר",
  "floor": "Penthouse",
  "notes": "דירה מס' 45"
}
```

### Example 2: Partial Ownership with Development
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "address": "לביא 6, רמת גן",
  "type": "RESIDENTIAL",
  "status": "IN_CONSTRUCTION",
  "country": "Israel",
  "city": "רמת גן",
  "totalArea": 60.00,
  "estimatedValue": 800000.00,
  "projectedValue": 1600000.00,
  "gush": "6158",
  "helka": "371-376",
  "isMortgaged": false,
  "isPartialOwnership": true,
  "ownershipPercentage": 50.00,
  "coOwners": "אריאלה לאובר",
  "developmentStatus": "בהליכי פינוי בינוי מתקדמים",
  "developmentCompany": "חברת קרסו",
  "expectedCompletionYears": 6,
  "propertyDetails": "דירה 60 מטר שתוגדל ל100 מטר"
}
```

### Example 3: Agricultural Land
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "address": "קרקע חקלאית, ראשון לציון",
  "type": "LAND",
  "status": "OWNED",
  "country": "Israel",
  "city": "ראשון לציון",
  "totalArea": 30000.00,
  "landArea": 30000.00,
  "plotSize": "3 דונם",
  "estimatedValue": 2700000.00,
  "gush": "3943",
  "helka": "10",
  "isMortgaged": false,
  "coOwners": "יוסי וצביקה יש חלקים נוספים"
}
```

### Example 4: Commercial Property (Office)
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "address": "מגדל ב.ס.ר 3 קומה 26, תל אביב",
  "type": "COMMERCIAL",
  "status": "OWNED",
  "country": "Israel",
  "city": "תל אביב",
  "totalArea": 210.00,
  "balconyArea": 40.00,
  "estimatedValue": 3000000.00,
  "isMortgaged": true,
  "propertyDetails": "חצי משרד - 210 מ\"ר מתוך 420 (+ מרפסת בשטח 40 מ\"ר)",
  "floor": "26",
  "notes": "יחידה 103 + 105, שותף: יוסי גבילי"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/properties` - Create property
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Filter Parameters
- `type` - Filter by property type
- `status` - Filter by property status
- `city` - Filter by city
- `isMortgaged` - Filter mortgaged properties
- `isPartialOwnership` - Filter partial ownership
- `search` - Search by address or file number

---

## UI Components

### Property List View
- Address (primary)
- File number
- Type badge
- Status badge
- Estimated value
- City
- Mortgage indicator
- Actions (view, edit, delete)

### Property Details View
- **Basic Info**: Address, file number, type, status
- **Location**: City, country, gush/helka
- **Measurements**: Total area, land area, balcony area
- **Financial**: Estimated value, rental income, mortgages
- **Ownership**: Ownership percentage, co-owners
- **Development**: Status, company, completion timeline
- **Units**: List of units in property
- **History**: Valuations, expenses, income

---

## Notes

1. **Land Registry (Gush/Helka)**
   - Israeli system for property identification
   - Essential for legal documentation
   - Store as strings to support ranges (e.g., "371-376")

2. **Currency Handling**
   - All values in schema are in ILS (₪)
   - Foreign properties need currency field (future enhancement)
   - Conversions needed for foreign property import

3. **Partial Ownership**
   - Common in Israeli real estate
   - Requires PropertyOwnership table entries
   - Co-owners may be informal (stored as text) or formal (Owner entities)

4. **Development Properties**
   - Properties in פינוי בינוי (evacuation-construction)
   - Long timelines (2-6 years common)
   - Value increases over time

5. **Storage Units**
   - Sometimes separate properties
   - Sometimes linked to main properties
   - Consider StorageUnit entity for clarity
