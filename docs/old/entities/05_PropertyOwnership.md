# Property Ownership Entity

**Entity Type:** Relationship/Junction  
**Database Table:** `property_ownerships`  
**Purpose:** Links owners to properties with ownership details

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `propertyId` | UUID | ✅ Yes | Property reference | Schema |
| `ownerId` | UUID | ✅ Yes | Owner reference | Schema |
| `accountId` | UUID | ✅ Yes | Account reference | Schema |
| `ownershipPercentage` | Decimal(5,2) | ✅ Yes | Ownership percentage (0.01-100.00) | Schema |
| `ownershipType` | Enum | ✅ Yes | Type of ownership (FULL, PARTIAL, PARTNERSHIP, COMPANY) | Schema |
| `startDate` | DateTime | ✅ Yes | Ownership start date | Schema |
| `endDate` | DateTime | ❌ No | Ownership end date (if transferred) | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `acquisitionMethod` | String | ❌ No | How ownership acquired (purchase, inheritance, gift) | Unstructured |
| `purchasePrice` | Decimal(12,2) | ❌ No | Price paid for this ownership share | Unstructured |
| `purchaseDate` | DateTime | ❌ No | Date of purchase | Unstructured |
| `isActualOwner` | Boolean | ❌ No | Actual vs legal owner (some properties "בפועל") | Unstructured |
| `legalDocumentRef` | String | ❌ No | Reference to legal ownership documents | Unstructured |
| `ownershipDescription` | Text | ❌ No | Detailed ownership arrangement | Unstructured |

---

## Relationships

### Many-to-One
- **property** → `Property` - The property being owned
- **owner** → `Owner` - The owner
- **account** → `Account` - Account owner

---

## Enums

### OwnershipType
```typescript
enum OwnershipType {
  FULL           // בעלות מלאה - 100% ownership
  PARTIAL        // בעלות חלקית - <100% ownership
  PARTNERSHIP    // שותפות - Partnership ownership
  COMPANY        // חברה - Company ownership
}
```

---

## Indexes

Current indexes:
- `propertyId` - All owners of a property
- `ownerId` - All properties of an owner
- `accountId` - Account's ownerships

Recommended additional indexes:
- `ownershipType` - Filter by type
- `startDate` - Chronological queries
- `endDate` - Active vs historical ownerships

---

## Validation Rules

### Required Fields
- `propertyId` - Must reference valid property
- `ownerId` - Must reference valid owner
- `ownershipPercentage` - Required, must be between 0.01 and 100.00
- `startDate` - Required

### Business Validation
- Sum of active ownership percentages for a property should equal 100% (warning if not)
- Cannot have overlapping ownership periods for same owner-property pair
- `endDate` must be after `startDate` if provided

---

## Business Rules

1. **Full Ownership (100%)**
   - `ownershipType` = FULL
   - `ownershipPercentage` = 100.00
   - Only one active ownership record for property

2. **Partial Ownership (<100%)**
   - `ownershipType` = PARTIAL
   - Multiple owners can have partial ownership
   - Common: 50/50, 36/64, 25/75

3. **Actual vs Legal Owner**
   - Some properties owned "בפועל" by one person but legally by another
   - Example: "1/4 של ליאת בפועל + 1/2 אילן אשר"
   - Track both for reporting and legal purposes

4. **Ownership Transfer**
   - Set `endDate` on old ownership record
   - Create new ownership record with new `startDate`
   - Property history preserved

5. **Partnership Ownership**
   - Partnership entity owns property
   - Track individual partners separately
   - Important for profit distribution

---

## Migration Notes

### Data Patterns in Unstructured Data

1. **Simple Partial Ownership**
   ```
   "50% מזכויות בדירה ברח' לביא 6"
   ```
   Extract:
   - ownershipPercentage: 50.00
   - ownershipType: PARTIAL
   - Create PropertyOwnership with 50%

2. **Complex Partial with Co-Owner**
   ```
   "36% מדירה מס' 6 - יחד עם צביקה נטוביץ"
   ```
   Extract:
   - Owner 1 (Liat): 36% ownership
   - Co-owner mention: צביקה נטוביץ (64% implied)
   - Create two PropertyOwnership records

3. **Fractional Ownership**
   ```
   "1/6 ממגרש בחדרה"
   ```
   Extract:
   - ownershipPercentage: 16.67 (1/6)
   - ownershipType: PARTIAL
   - notes: "1/6 ownership"

4. **Actual vs Legal Owner**
   ```
   "1/4 של ליאת בפועל + 1/2 אילן אשר"
   ```
   Extract:
   - Create Owner: ליאת (isActualOwner: true, percentage: 25%)
   - Create Owner: אילן אשר (isActualOwner: false, percentage: 50%)
   - Total: 75% documented (25% other owners)

5. **Joint Ownership**
   ```
   "יצחק ואילנה" or "יצחק נטוביץ ואילנה נטוביץ"
   ```
   Extract:
   - Create two PropertyOwnership records
   - Each owner: 50% (unless specified differently)
   - ownershipType: PARTIAL for each

---

## Example Records

### Example 1: Full Ownership
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "ownerId": "yitzhak-uuid",
  "accountId": "account-uuid",
  "ownershipPercentage": 100.00,
  "ownershipType": "FULL",
  "startDate": "2015-03-20",
  "endDate": null,
  "acquisitionMethod": "purchase",
  "purchasePrice": 2500000.00,
  "purchaseDate": "2015-03-20"
}
```

### Example 2: 50/50 Joint Ownership
```json
// Record 1
{
  "id": "uuid-1",
  "propertyId": "property-uuid",
  "ownerId": "yitzhak-uuid",
  "accountId": "account-uuid",
  "ownershipPercentage": 50.00,
  "ownershipType": "PARTIAL",
  "startDate": "2018-07-15",
  "endDate": null
}

// Record 2
{
  "id": "uuid-2",
  "propertyId": "property-uuid",
  "ownerId": "ilana-uuid",
  "accountId": "account-uuid",
  "ownershipPercentage": 50.00,
  "ownershipType": "PARTIAL",
  "startDate": "2018-07-15",
  "endDate": null
}
```

### Example 3: Partial with Co-Owner Outside System
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "ownerId": "liat-uuid",
  "accountId": "account-uuid",
  "ownershipPercentage": 36.00,
  "ownershipType": "PARTIAL",
  "startDate": "2020-02-10",
  "ownershipDescription": "36% ownership, co-owner: צביקה נטוביץ (64%)",
  "notes": "Co-owner Tzvi holds remaining 64%"
}
```

### Example 4: Fractional Land Ownership
```json
{
  "id": "uuid",
  "propertyId": "land-plot-uuid",
  "ownerId": "yitzhak-uuid",
  "accountId": "account-uuid",
  "ownershipPercentage": 16.67,
  "ownershipType": "PARTNERSHIP",
  "startDate": "2017-11-05",
  "ownershipDescription": "1/6 of plot. Partners: Yevulim, Shuki Sharon, Ziv Shmor"
}
```

### Example 5: Actual Owner (Different from Legal)
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "ownerId": "liat-uuid",
  "accountId": "account-uuid",
  "ownershipPercentage": 25.00,
  "ownershipType": "PARTIAL",
  "startDate": "2019-06-01",
  "isActualOwner": true,
  "notes": "Legal: 1/2 אילן אשר, Actual: ליאת בפועל (25%)"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/properties/:propertyId/ownerships` - Add ownership
- `GET /api/properties/:propertyId/ownerships` - List property ownerships
- `GET /api/owners/:ownerId/ownerships` - List owner's properties
- `PUT /api/ownerships/:id` - Update ownership
- `DELETE /api/ownerships/:id` - Remove ownership

### Analytics
- `GET /api/ownerships/validate/:propertyId` - Validate total = 100%
- `GET /api/ownerships/summary` - Ownership summary by owner

---

## UI Components

### Ownership Management (Property Details)
- List of current owners with percentages
- Visual pie chart of ownership distribution
- Add ownership button (with owner selection/creation)
- Edit ownership percentage
- Remove ownership
- Transfer ownership action

### Owner Portfolio View
- List of properties owned
- Ownership percentage per property
- Total value owned (calculated)
- Grouped by ownership type

---

## Notes

1. **Validation**
   - System should warn if total ownership ≠ 100%
   - Allow flexibility (some properties incompletely documented)
   - Calculate totals automatically

2. **Historical Tracking**
   - Never delete ownership records
   - Set `endDate` for transfer
   - Maintains property history

3. **Actual vs Legal**
   - "בפועל" means actual beneficial owner
   - Legal owner may be different (family, trust)
   - Important for financial reporting

4. **Partnership Complexity**
   - Some partnerships are informal (no legal entity)
   - Others are formal entities
   - Track accordingly

5. **Co-Owner References**
   - When co-owner not in system, store as text
   - Option to create Owner entity later
   - Important not to lose information
