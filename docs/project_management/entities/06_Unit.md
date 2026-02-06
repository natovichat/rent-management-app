# Unit Entity

**Entity Type:** Core  
**Database Table:** `units`  
**Purpose:** Represents individual rental units within properties

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `propertyId` | UUID | ✅ Yes | Property reference | Schema |
| `accountId` | UUID | ✅ Yes | Account reference | Schema |
| `apartmentNumber` | String | ✅ Yes | Unit/apartment number | Schema |
| `floor` | Integer | ❌ No | Floor number | Schema |
| `roomCount` | Integer | ❌ No | Number of rooms | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `unitType` | String | ❌ No | Type: apartment, office, storage, parking | Unstructured |
| `area` | Decimal(6,2) | ❌ No | Unit area in m² | Unstructured |
| `balconyArea` | Decimal(6,2) | ❌ No | Balcony/terrace area | Unstructured |
| `bedrooms` | Integer | ❌ No | Number of bedrooms | Unstructured |
| `bathrooms` | Decimal(2,1) | ❌ No | Number of bathrooms (1.5, 2.0) | Unstructured |
| `hasBalcony` | Boolean | ❌ No | Has balcony | Unstructured |
| `hasStorage` | Boolean | ❌ No | Has storage (מחסן) | Unstructured |
| `hasParking` | Boolean | ❌ No | Has parking spot | Unstructured |
| `parkingSpots` | Integer | ❌ No | Number of parking spots | Unstructured |
| `unitDescription` | Text | ❌ No | Detailed description | Unstructured |
| `currentRent` | Decimal(10,2) | ❌ No | Current monthly rent (if rented) | Unstructured |
| `isRented` | Boolean | ❌ No | Currently rented | Unstructured |
| `furnitureStatus` | String | ❌ No | Furnished, unfurnished, partially furnished | Unstructured |

---

## Relationships

### Many-to-One
- **property** → `Property` - Belongs to a property
- **account** → `Account` - Account owner

### One-to-Many
- **leases** → `Lease[]` - Lease history for this unit

---

## Indexes

Current indexes:
- `propertyId` - Units in a property
- `accountId` - Account's units
- Unique constraint: `(propertyId, apartmentNumber)` - No duplicate unit numbers

Recommended additional indexes:
- `floor` - Floor-based queries
- `roomCount` - Filter by size
- `isRented` - Available vs rented units

---

## Validation Rules

### Required Fields
- `propertyId` - Must reference valid property
- `apartmentNumber` - Must be unique within property
- `accountId` - Must reference valid account

### Constraints
- `apartmentNumber` - Cannot be empty, must be unique per property
- `floor` - If set, typically between -2 and 50 (basement to high-rise)
- `roomCount` - If set, must be positive
- `area` - If set, must be positive
- `bedrooms` - If set, must be >= 0
- `bathrooms` - If set, must be >= 0
- `parkingSpots` - If set, must be >= 0
- `currentRent` - If set, must be positive

---

## Business Rules

1. **Unit Numbering**
   - Apartment numbers can be numeric (1, 2, 3) or alphanumeric (A1, B2)
   - Storage units: מחסן 1, מחסן 2
   - Office units: יחידה 103, 105

2. **Unit Types**
   - Residential: Regular apartments
   - Commercial: Offices, stores
   - Storage: Storage units (מחסן)
   - Parking: Parking spots (can be separate units)

3. **Rental Status**
   - If `isRented` = true, should have active lease in Lease table
   - System validates consistency
   - Rent amount should match lease monthly rent

4. **Multi-Unit Properties**
   - One property can have many units
   - Example: Building with 7 apartments
   - Office building with multiple office units

5. **Storage and Parking**
   - Can be separate units OR attributes of main unit
   - If separate: create Unit with `unitType` = "storage" or "parking"
   - If attribute: set `hasStorage`, `hasParking` flags

---

## Migration Notes

### Data Patterns in Unstructured Data

1. **Single Apartment**
   ```
   "דירה מס' 45, דירת פנטהאוס 140 מ\"ר + מרפסת 50 מ\"ר"
   ```
   Extract:
   - apartmentNumber: "45"
   - unitType: "apartment"
   - area: 140.00
   - balconyArea: 50.00
   - unitDescription: "דירת פנטהאוס"
   - floor: Calculate from "penthouse" keyword

2. **Multiple Units**
   ```
   "2 דירות בנות 1 חדר במנדלי 7, ת\"א"
   "גוש 6905 חלקה 39/17 + חלקה 39/16"
   ```
   Extract:
   - Create 2 separate Unit records
   - apartmentNumber: "17" and "16" (from chelka)
   - roomCount: 1 for each

3. **Office Unit**
   ```
   "משרד במגדל ב.ס.ר 3 קומה 26, חצי משרד - 210 מ\"ר"
   "יחידה 103 + 105"
   ```
   Extract:
   - Create Unit or two Units (103, 105)
   - unitType: "office"
   - area: 210.00 (total or split between 103+105)
   - floor: 26

4. **Storage Unit**
   ```
   "מחסן אלנבי 85 7 מטר"
   "גוש 6937 חלקה 14 תת חלקה 3"
   ```
   Extract:
   - apartmentNumber: "מחסן 1" or "3" (from sub-chelka)
   - unitType: "storage"
   - area: 7.00
   - currentRent: 1000.00 (from data)

---

## Example Records

### Example 1: Penthouse Apartment
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "apartmentNumber": "45",
  "floor": 8,
  "roomCount": 5,
  "area": 140.00,
  "balconyArea": 50.00,
  "bedrooms": 4,
  "bathrooms": 2.5,
  "hasBalcony": true,
  "hasStorage": true,
  "hasParking": true,
  "parkingSpots": 2,
  "unitType": "apartment",
  "unitDescription": "דירת פנטהאוס 140 מ\"ר + מרפסת 50 מ\"ר",
  "isRented": false,
  "notes": "Luxury penthouse with large terrace"
}
```

### Example 2: Office Unit
```json
{
  "id": "uuid",
  "propertyId": "office-building-uuid",
  "accountId": "account-uuid",
  "apartmentNumber": "103+105",
  "floor": 26,
  "roomCount": 8,
  "area": 210.00,
  "balconyArea": 40.00,
  "unitType": "office",
  "unitDescription": "חצי משרד - 210 מ\"ר מתוך 420",
  "isRented": false,
  "notes": "Combined units 103 and 105. Partner: Yossi Gavili"
}
```

### Example 3: Small Rental Apartment
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "apartmentNumber": "17",
  "floor": 3,
  "roomCount": 1,
  "area": 30.00,
  "bedrooms": 1,
  "bathrooms": 1.0,
  "unitType": "apartment",
  "isRented": true,
  "currentRent": 3500.00,
  "notes": "Studio apartment"
}
```

### Example 4: Storage Unit
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "apartmentNumber": "מחסן 3",
  "floor": -1,
  "area": 7.00,
  "unitType": "storage",
  "isRented": true,
  "currentRent": 1000.00,
  "notes": "Basement storage unit"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/properties/:propertyId/units` - Create unit
- `GET /api/properties/:propertyId/units` - List property units
- `GET /api/units/:id` - Get unit details
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit (if no leases)

### Filter Parameters
- `isRented` - Available vs rented
- `floor` - Filter by floor
- `roomCount` - Filter by size
- `unitType` - Filter by type

---

## UI Components

### Unit List View (Within Property)
- Apartment number (primary)
- Floor
- Room count
- Area
- Rental status badge
- Current rent (if rented)
- Tenant name (if rented)
- Actions

### Unit Details View
- **Basic Info**: Apartment number, floor, room count
- **Measurements**: Area, balcony area
- **Features**: Bedrooms, bathrooms, storage, parking
- **Rental Info**: Current rent, rental status, active lease
- **Lease History**: Past and current leases
- **Financial**: Total rental income, expenses

---

## Notes

1. **Multiple Unit Properties**
   - Common: Buildings with many apartments
   - Track each separately for rental management
   - Essential for lease management

2. **Storage as Units**
   - Storage can be property (standalone) or unit (within building)
   - If part of apartment: use flags (`hasStorage`)
   - If separate: create Unit with type "storage"

3. **Office Units**
   - Can be combined (103+105)
   - Track as single unit or multiple linked units
   - Important for commercial rent calculations

4. **Parking Spaces**
   - Can be included with unit or separate
   - If separate: create Unit with type "parking"
   - Track count if multiple spots

5. **Room Count vs Bedrooms**
   - `roomCount` = total rooms (Israeli definition)
   - `bedrooms` = sleeping rooms specifically
   - Both useful for different purposes
