# Tenant Entity

**Entity Type:** Core  
**Database Table:** `tenants`  
**Purpose:** Represents individuals or companies renting properties

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `accountId` | UUID | ✅ Yes | Account reference | Schema |
| `name` | String | ✅ Yes | Tenant full name or company name | Schema |
| `email` | String | ❌ No | Contact email | Schema |
| `phone` | String | ❌ No | Contact phone | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `tenantType` | String | ❌ No | Individual or company | Unstructured |
| `idNumber` | String | ❌ No | ID number or company registration | Unstructured |
| `preferredLanguage` | String | ❌ No | Hebrew, English, Arabic, Russian, etc. | Unstructured |
| `emergencyContact` | String | ❌ No | Emergency contact person | Unstructured |
| `emergencyPhone` | String | ❌ No | Emergency phone number | Unstructured |
| `employerName` | String | ❌ No | Employer (for reference checks) | Unstructured |
| `previousAddress` | String | ❌ No | Previous residence | Unstructured |
| `referenceContact` | String | ❌ No | Reference person contact | Unstructured |
| `numberOfOccupants` | Integer | ❌ No | Number of people living in unit | Unstructured |
| `hasPets` | Boolean | ❌ No | Has pets | Unstructured |
| `creditScore` | String | ❌ No | Credit rating (for screening) | Unstructured |
| `isActive` | Boolean | ✅ Yes | Currently active tenant | Unstructured |

---

## Relationships

### Many-to-One
- **account** → `Account` - Account owner

### One-to-Many
- **leases** → `Lease[]` - Current and historical leases

---

## Indexes

Current indexes:
- `accountId` - Account's tenants
- `email` - Email lookup

Recommended additional indexes:
- `name` - Name searches
- `phone` - Phone lookup
- `isActive` - Active tenants only

---

## Validation Rules

- `name` - Must be at least 2 characters
- `email` - If provided, valid email format
- `phone` - If provided, valid phone format
- At least one contact method (email or phone) recommended

---

## Business Rules

1. **Active Status**
   - `isActive` = true if tenant has ACTIVE or FUTURE lease
   - Set to false when all leases expire/terminate
   - Keep inactive tenants for history

2. **Contact Information**
   - At least email or phone required
   - Important for lease communications
   - Emergency contact recommended

3. **Tenant Screening**
   - Track credit info, references
   - Employment verification
   - Previous landlord check
   - Document in notes

4. **Multiple Leases**
   - Tenant can rent multiple units
   - Track separately via Lease table
   - Historical leases preserved

---

## Example Records

### Example 1: Individual Tenant
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "דוד כהן",
  "tenantType": "individual",
  "email": "david.cohen@example.com",
  "phone": "+972-50-1234567",
  "idNumber": "123456789",
  "preferredLanguage": "Hebrew",
  "numberOfOccupants": 3,
  "hasPets": false,
  "isActive": true,
  "notes": "Family of 3. Clean rental history."
}
```

### Example 2: Company Tenant
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "TechStart Solutions Ltd.",
  "tenantType": "company",
  "email": "office@techstart.com",
  "phone": "+972-3-7654321",
  "idNumber": "51-234567-8",
  "preferredLanguage": "English",
  "numberOfOccupants": 15,
  "isActive": true,
  "notes": "Tech company renting office space"
}
```

---

## Migration Notes

Limited tenant data in unstructured files. Will need:
- Import from שכירות.html (lease file)
- Manual entry for current tenants
- Link to existing leases

---

## API Endpoints

- `POST /api/tenants` - Create tenant
- `GET /api/tenants` - List tenants
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant
- `GET /api/tenants/:id/leases` - Tenant's lease history
