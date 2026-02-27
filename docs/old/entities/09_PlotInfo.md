# Plot Info Entity

**Entity Type:** Detail/Registry  
**Database Table:** `plot_info`  
**Purpose:** Detailed Israeli land registry information (Gush/Chelka system)

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `propertyId` | UUID | ✅ Yes | Property reference (unique) | Schema |
| `accountId` | UUID | ✅ Yes | Account reference | Schema |
| `gush` | String | ❌ No | גוש - Land registry block | Schema |
| `chelka` | String | ❌ No | חלקה - Land registry parcel | Schema |
| `subChelka` | String | ❌ No | תת חלקה - Sub-parcel | Schema |
| `registryNumber` | String | ❌ No | Official registry number | Schema |
| `registryOffice` | String | ❌ No | Land registry office | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `multipleParcels` | Boolean | ❌ No | Property spans multiple parcels | Unstructured |
| `parcelList` | String[] | ❌ No | List of all parcels if multiple | Unstructured |
| `landUseType` | String | ❌ No | Zoning/land use type | Unstructured |
| `buildingRights` | String | ❌ No | Development rights description | Unstructured |
| `restrictions` | Text | ❌ No | Legal restrictions on land use | Unstructured |
| `surveyDate` | DateTime | ❌ No | Date of last survey | Unstructured |

---

## Relationships

### One-to-One
- **property** → `Property` - Belongs to one property

---

## Data Patterns from Unstructured Data

### 1. Simple Gush/Chelka
```
"גוש 6158 חלקות 371-376"
```
Extract:
- gush: "6158"
- chelka: "371-376" (range)
- multipleParcels: true
- parcelList: ["371", "372", "373", "374", "375", "376"]

### 2. Single Parcel with Sub-Parcel
```
"גוש 6393 חלקה 314/45"
```
Extract:
- gush: "6393"
- chelka: "314"
- subChelka: "45"
- multipleParcels: false

### 3. Multiple Separate Parcels
```
"גוש 6905 חלקה 39/17 + חלקה 39/16"
```
Extract:
- gush: "6905"
- chelka: "39" (base)
- subChelka: "17, 16" OR multipleParcels: true
- parcelList: ["39/17", "39/16"]

### 4. Complex Multi-Parcel
```
"גוש 1036 חלקות 181 ו- 60 (חלקה 60 1/6 מדירה/מחסן בקומת קרקע) + (חלקה 181 1/6 מגרש)"
```
Extract:
- gush: "1036"
- chelka: "181, 60"
- multipleParcels: true
- parcelList: ["181", "60"]
- notes: "Chelka 60: 1/6 ground floor apartment/storage. Chelka 181: 1/6 plot"

### 5. Missing Gush/Chelka
```
Some properties don't have land registry info in data
```
- Leave fields null
- Can be added later via "Edit Property"

---

## Indexes

Current indexes:
- `propertyId` - One-to-one relationship
- `accountId` - Account's plot info
- `(gush, chelka)` - Land registry queries

Recommended additional indexes:
- `gush` alone - Common search
- `multipleParcels` - Complex properties

---

## Validation Rules

- `gush` - Israeli land registry format (numeric or alphanumeric)
- `chelka` - Can be single number, range (371-376), or list
- `subChelka` - Sub-parcel identifier
- One property = one PlotInfo record (one-to-one)

---

## Business Rules

1. **Israeli Land Registry System**
   - Gush (גוש) = Block (group of parcels)
   - Chelka (חלקה) = Parcel (specific land plot)
   - Sub-chelka (תת חלקה) = Sub-parcel (division of parcel)
   - Essential for legal identification

2. **Multiple Parcels**
   - Property can span multiple parcels
   - Store as range (371-376) or comma-separated (181, 60)
   - Important for development projects

3. **Registry Office**
   - Different offices for different regions
   - Examples: טבריה, חיפה, תל אביב, ירושלים

4. **Missing Information**
   - Some properties don't have gush/chelka documented
   - Can operate without (use address instead)
   - Important to collect for legal transactions

---

## Example Records

### Example 1: Simple Single Parcel
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "gush": "6393",
  "chelka": "314",
  "subChelka": "45",
  "multipleParcels": false,
  "registryOffice": "תל אביב"
}
```

### Example 2: Multiple Parcel Range
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "gush": "6158",
  "chelka": "371-376",
  "multipleParcels": true,
  "parcelList": ["371", "372", "373", "374", "375", "376"],
  "notes": "Property spans 6 parcels for פינוי בינוי project"
}
```

### Example 3: Multiple Separate Parcels
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "gush": "6905",
  "chelka": "39",
  "subChelka": "17, 16",
  "multipleParcels": true,
  "parcelList": ["39/17", "39/16"],
  "notes": "Two adjacent studio apartments"
}
```

### Example 4: Complex Multi-Parcel with Details
```json
{
  "id": "uuid",
  "propertyId": "hadera-plot-uuid",
  "accountId": "account-uuid",
  "gush": "1036",
  "chelka": "181, 60",
  "multipleParcels": true,
  "parcelList": ["181", "60"],
  "notes": "Chelka 60: 1/6 ownership of ground floor apt/storage. Chelka 181: 1/6 ownership of plot"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/properties/:propertyId/plot-info` - Add plot info
- `GET /api/properties/:propertyId/plot-info` - Get plot info
- `PUT /api/plot-info/:id` - Update plot info
- `DELETE /api/plot-info/:id` - Delete plot info

### Search
- `GET /api/plot-info/search?gush=X&chelka=Y` - Find by gush/chelka

---

## UI Components

### Plot Info Display (in Property Details)
- Gush/Chelka formatted display
- Sub-chelka if applicable
- Multiple parcel indicator
- Registry office
- Edit button

### Plot Info Form
- Gush input (numeric)
- Chelka input (support ranges)
- Sub-chelka input (optional)
- Registry office dropdown
- Notes textarea

---

## Notes

1. **Critical for Legal Transactions**
   - Required for property sales
   - Required for mortgage applications
   - Required for inheritance transfers

2. **Format Flexibility**
   - Chelka can be: "314", "314/45", "371-376", "181, 60"
   - Store as string to support all formats
   - Parse for structured queries if needed

3. **Multiple Parcel Complexity**
   - Some properties naturally span multiple parcels
   - Development projects combine parcels
   - Track all parcels for completeness

4. **Registry Lookup**
   - Consider integration with official land registry API
   - Auto-populate if available
   - Validate gush/chelka combinations

5. **Future Enhancement**
   - Link to official land registry documents
   - Track ownership history via registry
   - Alert on registry changes
