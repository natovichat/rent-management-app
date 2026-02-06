# Owner Entity

**Entity Type:** Core  
**Database Table:** `owners`  
**Purpose:** Represents property owners (individuals, companies, or partnerships)

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `accountId` | UUID | ✅ Yes | Account reference | Schema |
| `name` | String | ✅ Yes | Owner full name or company name | Schema |
| `idNumber` | String | ❌ No | ID number (תעודת זהות) or company registration | Schema |
| `type` | Enum | ✅ Yes | Owner type (INDIVIDUAL, COMPANY, PARTNERSHIP) | Schema |
| `email` | String | ❌ No | Contact email | Schema |
| `phone` | String | ❌ No | Contact phone | Schema |
| `address` | String | ❌ No | Owner's address | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `relationshipType` | String | ❌ No | Relationship (e.g., "spouse", "child", "partner") | Unstructured |
| `sharePercentage` | Decimal(5,2) | ❌ No | Default share percentage if not specified per property | Unstructured |
| `isActive` | Boolean | ✅ Yes | Is owner still active (for tracking past owners) | Unstructured |
| `familyRelation` | String | ❌ No | Family relationship (יצחק, אילנה, ליאת, אביעד, מיכל) | Unstructured |

---

## Relationships

### One-to-Many
- **ownerships** → `PropertyOwnership[]` - Properties owned by this owner

### Many-to-One
- **account** → `Account` - Belongs to an account

---

## Enums

### OwnerType
```typescript
enum OwnerType {
  INDIVIDUAL    // יחיד - Single person
  COMPANY       // חברה - Corporation
  PARTNERSHIP   // שותפות - Partnership entity
}
```

---

## Indexes

Current indexes:
- `accountId` - For querying owners by account
- `name` - For owner name searches

Recommended additional indexes:
- `type` - Filter by owner type
- `idNumber` - Unique identifier lookup
- `familyRelation` - Family member grouping

---

## Validation Rules

### Required Fields
- `name` - Must be at least 2 characters
- `accountId` - Must reference valid account
- `type` - Must be one of enum values

### Constraints
- `email` - If provided, must be valid email format
- `phone` - If provided, should match phone number pattern
- `idNumber` - If provided, should be unique within account
- `sharePercentage` - If set, must be between 0.01 and 100.00

---

## Business Rules

1. **Owner Type Determination**
   - If name contains "בע\"מ", "Ltd", "Inc" → `COMPANY`
   - If name contains "שותפות", "Partnership" → `PARTNERSHIP`
   - Otherwise → `INDIVIDUAL`

2. **Family Members**
   - Track family relationships for inheritance and reporting
   - Common names from data: יצחק נטוביץ, אילנה נטוביץ, ליאת, אביעד, מיכל

3. **Ownership Tracking**
   - Owner can own multiple properties
   - Owner can have different ownership percentages per property
   - Total ownership across properties calculated via PropertyOwnership

4. **Contact Information**
   - At least one contact method (email or phone) recommended
   - Important for legal notifications

---

## Migration Notes

### Data Sources
From unstructured data, owner names appear as:
- "יצחק נטוביץ" (individual)
- "יצחק נטוביץ ואילנה נטוביץ" (joint ownership)
- "ליאת" (family member)
- "י נטביץ ושות" (partnership)
- "חברת איילי" (company)

### Extraction Strategy

1. **Individual Owners**
   ```
   "יצחק נטוביץ" → 
   {
     name: "יצחק נטוביץ",
     type: INDIVIDUAL,
     familyRelation: "father"
   }
   ```

2. **Joint Ownership**
   ```
   "יצחק נטוביץ ואילנה נטוביץ" →
   Create two Owner records:
   - יצחק נטוביץ
   - אילנה נטוביץ
   Then create PropertyOwnership for each
   ```

3. **Partnership**
   ```
   "י נטביץ ושות" →
   {
     name: "י. נטוביץ ושות'",
     type: PARTNERSHIP
   }
   ```

4. **Company**
   ```
   "חברת איילי" →
   {
     name: "חברת איילי",
     type: COMPANY
   }
   ```

---

## Example Records

### Example 1: Individual Owner (Family Head)
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "יצחק נטוביץ",
  "idNumber": "123456789",
  "type": "INDIVIDUAL",
  "email": "yitzhak@example.com",
  "phone": "+972-50-1234567",
  "familyRelation": "father",
  "isActive": true,
  "notes": "Property portfolio owner"
}
```

### Example 2: Spouse
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "אילנה נטוביץ",
  "idNumber": "987654321",
  "type": "INDIVIDUAL",
  "email": "ilana@example.com",
  "phone": "+972-50-7654321",
  "familyRelation": "mother",
  "isActive": true
}
```

### Example 3: Child Owner
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "ליאת נטוביץ",
  "type": "INDIVIDUAL",
  "email": "liat@example.com",
  "familyRelation": "daughter",
  "isActive": true
}
```

### Example 4: Partnership
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "י. נטוביץ ושות'",
  "type": "PARTNERSHIP",
  "email": "partnership@example.com",
  "isActive": true,
  "notes": "Partnership for commercial properties"
}
```

### Example 5: Company
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "חברת איילי בע\"מ",
  "idNumber": "51-234567-8",
  "type": "COMPANY",
  "email": "info@ayali-company.com",
  "isActive": true,
  "notes": "Holdings company for German properties"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/owners` - Create owner
- `GET /api/owners` - List owners (with filters)
- `GET /api/owners/:id` - Get owner details
- `PUT /api/owners/:id` - Update owner
- `DELETE /api/owners/:id` - Delete owner (if no active ownerships)

### Filter Parameters
- `type` - Filter by owner type
- `familyRelation` - Filter by family member
- `search` - Search by name
- `isActive` - Filter active/inactive owners

---

## UI Components

### Owner List View
- Name (primary)
- Type badge
- Family relation
- Total properties owned (count)
- Total ownership value (calculated)
- Contact info
- Actions

### Owner Details View
- **Basic Info**: Name, ID number, type
- **Contact**: Email, phone, address
- **Properties Owned**: List with ownership percentages
- **Financial Summary**: Total property value, mortgages
- **Documents**: Related documents

### Owner Selection (Dropdown)
- Grouped by type (Individual, Company, Partnership)
- Show family relation if applicable
- Search by name
- Quick create option

---

## Notes

1. **Family Structure**
   - Common pattern: Father, mother, adult children all own properties
   - Important for estate planning and inheritance
   - Track relationships for reporting

2. **Joint Ownership**
   - "יצחק ואילנה" means both own property
   - Create separate Owner records
   - Link via PropertyOwnership with appropriate percentages

3. **Name Variations**
   - "יצחק נטוביץ" (full name)
   - "יצחק" (short form)
   - "י נטביץ" (abbreviated)
   - Normalize to full name in database

4. **Company Ownership**
   - Company can own multiple properties
   - Track company registration number
   - Company may be local or foreign

5. **Partnership Tracking**
   - "ושות" or "ושותפים" indicates partnership
   - Partnership is legal entity separate from individuals
   - Important for tax and liability

6. **Inactive Owners**
   - Keep historical records
   - Mark as inactive when ownership transferred
   - Useful for audit trail
