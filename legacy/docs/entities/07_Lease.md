# Lease Entity

**Entity Type:** Contract  
**Database Table:** `leases`  
**Purpose:** Tracks rental contracts between tenants and units

---

## Current Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | Schema |
| `accountId` | UUID | ✅ Yes | Account reference | Schema |
| `unitId` | UUID | ✅ Yes | Unit being rented | Schema |
| `tenantId` | UUID | ✅ Yes | Tenant reference | Schema |
| `startDate` | DateTime | ✅ Yes | Lease start date | Schema |
| `endDate` | DateTime | ✅ Yes | Lease end date | Schema |
| `monthlyRent` | Decimal(10,2) | ✅ Yes | Monthly rent amount | Schema |
| `paymentTo` | String | ✅ Yes | Payment recipient | Schema |
| `status` | Enum | ✅ Yes | Lease status (FUTURE, ACTIVE, EXPIRED, TERMINATED) | Schema |
| `notes` | Text | ❌ No | General notes | Schema |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | Schema |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | Schema |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `securityDeposit` | Decimal(10,2) | ❌ No | Security deposit amount (ערבון) | Unstructured |
| `rentPaymentDay` | Integer | ❌ No | Day of month rent is due (1-31) | Unstructured |
| `indexationLinked` | Boolean | ❌ No | Linked to CPI index (הצמדה למדד) | Unstructured |
| `indexationRate` | Decimal(5,2) | ❌ No | Annual indexation rate if not CPI | Unstructured |
| `rentIncreaseSchedule` | Text | ❌ No | Scheduled rent increases | Unstructured |
| `utilities` | String | ❌ No | Utilities included (electricity, water, gas) | Unstructured |
| `maintenanceResponsibility` | String | ❌ No | Who handles maintenance (tenant/landlord) | Unstructured |
| `cancellationTerms` | Text | ❌ No | Early termination terms | Unstructured |
| `renewalOption` | Boolean | ❌ No | Tenant has renewal option | Unstructured |
| `signedDate` | DateTime | ❌ No | Contract signing date | Unstructured |
| `contractDocument` | String | ❌ No | Link to contract PDF/document | Unstructured |

---

## Relationships

### Many-to-One
- **account** → `Account` - Account owner
- **unit** → `Unit` - Rented unit
- **tenant** → `Tenant` - Tenant renting

### One-to-Many
- **notifications** → `Notification[]` - Expiration notifications

---

## Enums

### LeaseStatus
```typescript
enum LeaseStatus {
  FUTURE      // חוזה עתידי - Start date in future
  ACTIVE      // פעיל - Currently active
  EXPIRED     // פג תוקף - End date passed
  TERMINATED  // הופסק - Terminated early
}
```

---

## Indexes

Current indexes:
- `accountId` - Account's leases
- `unitId` - Leases for specific unit
- `tenantId` - Tenant's leases
- `status` - Filter by status
- `endDate` - Upcoming expirations

Recommended additional indexes:
- `startDate` - Chronological queries
- `monthlyRent` - Financial queries
- `rentPaymentDay` - Payment reminder queries

---

## Validation Rules

### Required Fields
- `unitId` - Must reference valid unit
- `tenantId` - Must reference valid tenant
- `startDate` - Required
- `endDate` - Required
- `monthlyRent` - Must be positive
- `paymentTo` - Must not be empty

### Business Validation
- `endDate` must be after `startDate`
- No overlapping active leases for same unit
- Tenant cannot have multiple ACTIVE leases for same unit
- `securityDeposit` typically 1-3 months rent
- `rentPaymentDay` between 1 and 31

---

## Business Rules

1. **Lease Status Automation**
   - `FUTURE` → `ACTIVE` when startDate reached
   - `ACTIVE` → `EXPIRED` when endDate passed
   - Manual termination sets `TERMINATED`

2. **Rent Payment Tracking**
   - Monthly rent due on `rentPaymentDay`
   - Track via separate PaymentTracking entity (future)
   - Late payments trigger notifications

3. **Indexation (הצמדה למדד)**
   - Common in Israeli leases
   - Annual adjustment based on CPI
   - Track base rent vs current adjusted rent

4. **Renewal Process**
   - 30-90 days before expiration: notify about renewal
   - If renewed: create new Lease record
   - Link to previous lease in notes

5. **Security Deposit**
   - Held throughout lease
   - Returned at end (minus damages)
   - Track in separate transactions

6. **Payment Routing**
   - `paymentTo` specifies recipient
   - May be property owner or different entity
   - Important for income tracking

---

## Migration Notes

### Data Sources
Limited lease data in unstructured files (mostly property-focused).

Expected lease information:
- Rental income amounts (דמי שכירות columns)
- Some properties show current rent

### Extraction Strategy

1. **From Property Data**
   ```
   Property: מחסן אלנבי 85
   Rental income: 1,000 ₪
   ```
   Extract:
   - Create Unit for storage
   - Create Lease with monthlyRent: 1000.00
   - Status: ACTIVE (if currently rented)
   - Need tenant info (may need to collect separately)

2. **From Lease HTML File**
   - Read שכירות.html for detailed lease data
   - Extract tenant names, dates, amounts
   - Create Tenant and Lease records

---

## Example Records

### Example 1: Standard Residential Lease
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "unitId": "unit-uuid",
  "tenantId": "tenant-uuid",
  "startDate": "2024-01-01",
  "endDate": "2025-12-31",
  "monthlyRent": 5500.00,
  "securityDeposit": 11000.00,
  "rentPaymentDay": 1,
  "paymentTo": "יצחק נטוביץ",
  "status": "ACTIVE",
  "indexationLinked": true,
  "utilities": "Tenant pays electricity, water, gas",
  "maintenanceResponsibility": "Landlord handles major repairs",
  "renewalOption": true,
  "signedDate": "2023-12-15"
}
```

### Example 2: Commercial Office Lease
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "unitId": "office-unit-uuid",
  "tenantId": "company-tenant-uuid",
  "startDate": "2023-06-01",
  "endDate": "2028-05-31",
  "monthlyRent": 15000.00,
  "securityDeposit": 45000.00,
  "rentPaymentDay": 5,
  "paymentTo": "י. נטוביץ ושות'",
  "status": "ACTIVE",
  "indexationLinked": true,
  "indexationRate": 2.5,
  "utilities": "Tenant pays all utilities + building management fees",
  "notes": "5-year lease with annual 2.5% increase"
}
```

### Example 3: Storage Unit Lease
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "unitId": "storage-unit-uuid",
  "tenantId": "tenant-uuid",
  "startDate": "2024-03-01",
  "endDate": "2025-02-28",
  "monthlyRent": 1000.00,
  "securityDeposit": 2000.00,
  "rentPaymentDay": 1,
  "paymentTo": "אביעד נטוביץ",
  "status": "ACTIVE",
  "utilities": "None"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/leases` - Create lease
- `GET /api/leases` - List leases (with filters)
- `GET /api/leases/:id` - Get lease details
- `PUT /api/leases/:id` - Update lease
- `DELETE /api/leases/:id` - Delete lease (if FUTURE status)
- `POST /api/leases/:id/terminate` - Terminate lease early

### Filter Parameters
- `status` - Filter by status
- `unitId` - Leases for specific unit
- `tenantId` - Leases for specific tenant
- `expiringIn` - Leases expiring in X days

### Actions
- `POST /api/leases/:id/renew` - Renew lease (create new one)
- `GET /api/leases/expiring` - Get leases expiring soon

---

## UI Components

### Lease List View
- Unit (property + apartment number)
- Tenant name
- Start date
- End date
- Days remaining (if ACTIVE)
- Monthly rent
- Status badge
- Actions

### Lease Details View
- **Contract Info**: Dates, rent, deposit, payment terms
- **Parties**: Tenant details, payment recipient
- **Terms**: Indexation, utilities, maintenance, renewal
- **Financial**: Total paid, outstanding, income generated
- **Documents**: Contract, amendments, correspondence
- **Notifications**: Scheduled reminders

### Lease Timeline
- Visual timeline showing lease periods
- Gaps between leases (vacancy periods)
- Historical leases for unit

---

## Notes

1. **Status Management**
   - Automated status updates via cron job
   - FUTURE → ACTIVE on start date
   - ACTIVE → EXPIRED on end date
   - Manual TERMINATED status

2. **Indexation (הצמדה)**
   - Very common in Israel
   - Annual CPI-based adjustment
   - Calculate new rent automatically
   - Record rent changes in separate table

3. **Notifications**
   - Alert 90, 60, 30 days before expiration
   - Configurable per account preferences
   - Email/SMS notifications

4. **Renewal Process**
   - Don't update existing lease
   - Create new lease with new dates
   - Link to old lease via notes or separate relation

5. **Income Tracking**
   - Monthly rent tracked via lease
   - Actual payments tracked via PropertyIncome
   - Calculate expected vs actual income
