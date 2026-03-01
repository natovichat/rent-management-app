# Epic 4: Lease & Contract Management

**Project:** Property Portfolio Management System  
**Created:** February 2, 2026  
**Status:** ✅ Implemented  
**Priority:** 🟠 High

---

## Overview

The Lease & Contract Management epic enables property owners to manage rental contracts throughout their entire lifecycle. This includes creating new leases, tracking lease status (FUTURE, ACTIVE, EXPIRED, TERMINATED), managing lease terms (dates, rent, payment recipient), linking leases to units and tenants, and receiving automated notifications for lease expirations. The system automatically calculates lease status based on dates and prevents overlapping leases for the same unit.

---

## User Stories

### US4.1: Create New Lease
**As a** property owner,  
**I can** create a new lease contract linking a unit to a tenant with start/end dates, monthly rent, and payment recipient information,  
**So that** I can document rental agreements and track contract terms.

**Acceptance Criteria:**
- User can access "Create Lease" functionality from the leases page
- Form includes dropdowns to select unit and tenant (with inline creation support)
- Form requires: unit, tenant, start date, end date, monthly rent, payment recipient
- Form optionally accepts: notes
- System validates that end date is after start date
- System prevents creating overlapping leases for the same unit
- System automatically sets initial status to FUTURE if start date is in the future
- System automatically sets initial status to ACTIVE if start date is today or in the past
- Success message displayed after creation
- New lease appears in the leases list

**Technical Requirements:**
- API endpoint: `POST /leases`
- DTO validation: `CreateLeaseDto`
- Service method: `LeasesService.create()`
- Frontend component: `LeaseForm.tsx`
- Validation: Date comparison, overlap detection

---

### US4.2: View All Leases
**As a** property owner,  
**I can** view a list of all my leases in a table format with key information,  
**So that** I can quickly see all rental contracts at a glance.

**Acceptance Criteria:**
- Leases displayed in a DataGrid table
- Table shows: unit address, apartment number, tenant name, start date, end date, monthly rent, status badge, actions
- Table supports column reordering (per DataGrid standards)
- Table supports sorting by any column
- Table supports pagination for large datasets
- Status badges are color-coded:
  - ACTIVE: Green
  - FUTURE: Blue
  - EXPIRED: Orange
  - TERMINATED: Red
- Table displays Hebrew RTL layout
- Only leases belonging to the authenticated user's account are shown

**Technical Requirements:**
- API endpoint: `GET /leases`
- Service method: `LeasesService.findAll()`
- Frontend component: `LeaseList.tsx`
- Includes relations: unit, property, tenant

---

### US4.3: View Lease Details
**As a** property owner,  
**I can** view detailed information about a specific lease including all contract terms and related information,  
**So that** I can review complete lease information when needed.

**Acceptance Criteria:**
- User can click on a lease row or "View" action to see details
- Details page shows:
  - Unit information (apartment number, property address)
  - Tenant information (name, email, phone)
  - Lease dates (start date, end date)
  - Financial terms (monthly rent, payment recipient)
  - Lease status (with badge)
  - Notes (if any)
  - Created/updated timestamps
- Details page includes action buttons: Edit, Terminate, Delete
- Details page displays Hebrew RTL layout

**Technical Requirements:**
- API endpoint: `GET /leases/:id`
- Service method: `LeasesService.findOne()`
- Frontend: Lease detail view/page
- Includes all relations: unit, property, tenant

---

### US4.4: Edit Lease
**As a** property owner,  
**I can** edit lease information including dates, rent amount, payment recipient, and notes,  
**So that** I can update contract terms when agreements change.

**Acceptance Criteria:**
- User can access "Edit" functionality from lease list or detail page
- Edit form pre-populates with existing lease data
- User can modify: start date, end date, monthly rent, payment recipient, notes
- User cannot modify: unit, tenant (would require creating new lease)
- System validates that end date is after start date
- System prevents creating overlapping leases (excluding current lease)
- System automatically recalculates status based on new dates
- Cannot edit terminated leases
- Success message displayed after update
- Updated lease information reflected in list

**Technical Requirements:**
- API endpoint: `PATCH /leases/:id`
- DTO validation: `UpdateLeaseDto`
- Service method: `LeasesService.update()`
- Frontend component: `LeaseForm.tsx` (edit mode)
- Validation: Date comparison, overlap detection, status recalculation

---

### US4.5: Delete Lease
**As a** property owner,  
**I can** delete a lease contract,  
**So that** I can remove incorrect or cancelled contracts from the system.

**Acceptance Criteria:**
- User can access "Delete" functionality from lease list or detail page
- System prompts for confirmation before deletion
- Deletion removes the lease from the database
- Success message displayed after deletion
- Deleted lease no longer appears in list
- Cannot delete lease if it has related notifications (if cascade rules apply)

**Technical Requirements:**
- API endpoint: `DELETE /leases/:id`
- Service method: `LeasesService.remove()`
- Frontend: Delete confirmation dialog
- Database: Cascade rules for related entities

---

### US4.6: Terminate Lease Early
**As a** property owner,  
**I can** terminate an active or future lease before its end date,  
**So that** I can document early contract terminations.

**Acceptance Criteria:**
- User can access "Terminate" functionality from lease list or detail page
- System prompts for confirmation before termination
- Terminating a lease sets status to TERMINATED
- Terminated lease cannot be edited
- Termination date recorded (updatedAt timestamp)
- Success message displayed after termination
- Status badge changes to TERMINATED (red)

**Technical Requirements:**
- API endpoint: `POST /leases/:id/terminate`
- Service method: `LeasesService.terminate()`
- Frontend: Terminate confirmation dialog
- Status update: Sets status to TERMINATED

---

### US4.7: Filter Leases by Status
**As a** property owner,  
**I can** filter the leases list by status (FUTURE, ACTIVE, EXPIRED, TERMINATED),  
**So that** I can focus on leases in a specific state.

**Acceptance Criteria:**
- Filter dropdown or buttons available in leases list
- Filter options: All, FUTURE, ACTIVE, EXPIRED, TERMINATED
- Selecting a filter shows only leases with that status
- Filter state persists during session
- Clear filter option available
- Filter count shows number of leases matching selected status

**Technical Requirements:**
- Frontend: Filter component in `LeaseList.tsx`
- Client-side filtering or API query parameter: `?status=ACTIVE`
- API endpoint: `GET /leases?status=ACTIVE` (optional enhancement)

---

### US4.8: Search Leases
**As a** property owner,  
**I can** search leases by tenant name, unit address, or apartment number,  
**So that** I can quickly find specific leases.

**Acceptance Criteria:**
- Search input field available in leases list
- Search works across: tenant name, property address, apartment number
- Search is case-insensitive
- Search results update as user types (debounced)
- Search clears when filter is cleared
- "No results" message displayed when no matches found

**Technical Requirements:**
- Frontend: Search input in `LeaseList.tsx`
- Client-side search or API query parameter: `?search=term`
- API endpoint: `GET /leases?search=term` (optional enhancement)

---

### US4.9: Automatic Lease Status Calculation
**As a** property owner,  
**I can** rely on the system to automatically calculate and update lease status based on dates,  
**So that** I don't need to manually track which leases are active or expired.

**Acceptance Criteria:**
- System automatically calculates status when lease is created:
  - FUTURE: Start date is in the future
  - ACTIVE: Start date is today or in the past, end date is in the future
- System automatically updates status when lease is viewed/updated:
  - EXPIRED: End date has passed (and not terminated)
  - ACTIVE: Currently within start/end date range
- Status recalculation happens on:
  - Lease creation
  - Lease update
  - Lease detail view (on-demand)
- Status is stored in database but can be recalculated

**Technical Requirements:**
- Service method: `LeasesService.calculateStatus()`
- Status calculation logic based on current date vs. startDate/endDate
- Enum: `LeaseStatus` (FUTURE, ACTIVE, EXPIRED, TERMINATED)
- Database field: `status` with default value FUTURE

---

### US4.10: View Lease History per Unit
**As a** property owner,  
**I can** view all historical leases for a specific unit,  
**So that** I can see the rental history and track tenant turnover.

**Acceptance Criteria:**
- User can access lease history from unit detail page
- History shows all leases (past and present) for that unit
- History list shows: tenant name, start date, end date, status, monthly rent
- History sorted by start date (newest first or oldest first)
- History includes active, expired, terminated, and future leases
- History shows duration of each lease
- History can be filtered by status

**Technical Requirements:**
- API endpoint: `GET /units/:id/leases` or `GET /leases?unitId=:id`
- Service method: Filter by unitId
- Frontend: Lease history component in unit detail page
- Includes tenant information for each lease

---

### US4.11: Receive Lease Expiration Notifications
**As a** property owner,  
**I can** receive automated notifications when leases are approaching expiration,  
**So that** I can proactively renew contracts or prepare for tenant turnover.

**Acceptance Criteria:**
- System checks for leases expiring within configured timeframe (e.g., 30 days)
- Notifications created in database for expiring leases
- Notification includes: lease ID, unit address, tenant name, expiration date
- Notifications appear in user's notification center
- User can view notification details and navigate to lease
- Notifications can be marked as read/dismissed
- Notifications prevent duplicate alerts for same lease

**Technical Requirements:**
- Database model: `Notification` with relation to `Lease`
- Background job/cron: Check leases with `endDate` approaching
- Notification creation: `NotificationService.createLeaseExpirationNotification()`
- Index on `endDate` for efficient querying
- Frontend: Notification center/bell icon

---

## Acceptance Criteria Summary

### Functional Requirements
- ✅ Create, read, update, delete leases
- ✅ Link leases to units and tenants
- ✅ Set and edit lease dates (start/end)
- ✅ Set and edit monthly rent amount
- ✅ Set and edit payment recipient information
- ✅ Track lease status (FUTURE, ACTIVE, EXPIRED, TERMINATED)
- ✅ Automatic status calculation based on dates
- ✅ Prevent overlapping leases for same unit
- ✅ Terminate leases early
- ✅ Filter leases by status
- ✅ Search leases by tenant/unit
- ✅ View lease history per unit
- ✅ Receive expiration notifications

### Technical Requirements
- ✅ All operations scoped to authenticated user's account
- ✅ Date validation (end date after start date)
- ✅ Overlap detection logic
- ✅ Status recalculation on create/update
- ✅ Cannot edit terminated leases
- ✅ Hebrew RTL interface support
- ✅ Responsive design

---

## Implementation Notes

### Database Schema

**Lease Model:**
```prisma
model Lease {
  id           String      @id @default(uuid())
  accountId    String      @map("account_id")
  unitId       String      @map("unit_id")
  tenantId     String      @map("tenant_id")
  startDate    DateTime    @map("start_date")
  endDate      DateTime    @map("end_date")
  monthlyRent  Decimal     @map("monthly_rent") @db.Decimal(10, 2)
  paymentTo    String      @map("payment_to")
  status       LeaseStatus @default(FUTURE)
  notes        String?
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")
  
  // Relations
  account      Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)
  unit         Unit        @relation(fields: [unitId], references: [id], onDelete: Restrict)
  tenant       Tenant      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  notifications Notification[]
  
  @@index([accountId])
  @@index([unitId])
  @@index([tenantId])
  @@index([status])
  @@index([endDate])
  @@map("leases")
}

enum LeaseStatus {
  FUTURE      // Not started yet
  ACTIVE      // Currently active
  EXPIRED     // Past end date
  TERMINATED  // Manually ended early
}
```

**Key Database Features:**
- Indexes on `accountId`, `unitId`, `tenantId`, `status`, and `endDate` for efficient querying
- `onDelete: Restrict` on unit and tenant relations (prevents deletion if leases exist)
- `onDelete: Cascade` on account relation (deletes leases when account deleted)
- `endDate` index critical for expiration notification queries

---

### API Endpoints

**Base Path:** `/leases`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/leases` | Create new lease | ✅ Yes |
| `GET` | `/leases` | Get all leases for account | ✅ Yes |
| `GET` | `/leases/:id` | Get lease by ID | ✅ Yes |
| `PATCH` | `/leases/:id` | Update lease | ✅ Yes |
| `POST` | `/leases/:id/terminate` | Terminate lease early | ✅ Yes |
| `DELETE` | `/leases/:id` | Delete lease | ✅ Yes |

**Query Parameters (Optional Enhancements):**
- `?status=ACTIVE` - Filter by status
- `?unitId=uuid` - Filter by unit
- `?tenantId=uuid` - Filter by tenant
- `?search=term` - Search by tenant/unit

**Request/Response Examples:**

```typescript
// Create Lease
POST /leases
Body: {
  unitId: "uuid",
  tenantId: "uuid",
  startDate: "2024-01-01",
  endDate: "2025-01-01",
  monthlyRent: 5000,
  paymentTo: "Bank transfer to account 123456",
  notes?: "Includes parking spot"
}

// Response
{
  id: "uuid",
  accountId: "uuid",
  unitId: "uuid",
  tenantId: "uuid",
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2025-01-01T00:00:00Z",
  monthlyRent: "5000.00",
  paymentTo: "Bank transfer to account 123456",
  status: "ACTIVE",
  notes: "Includes parking spot",
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-01T10:00:00Z",
  unit: { ... },
  tenant: { ... }
}
```

---

### Backend Implementation

**Files:**
- `/apps/backend/src/modules/leases/leases.module.ts` - Module definition
- `/apps/backend/src/modules/leases/leases.controller.ts` - API endpoints
- `/apps/backend/src/modules/leases/leases.service.ts` - Business logic
- `/apps/backend/src/modules/leases/dto/create-lease.dto.ts` - Create DTO
- `/apps/backend/src/modules/leases/dto/update-lease.dto.ts` - Update DTO

**Key Service Methods:**
- `create()` - Create lease with validation and status calculation
- `findAll()` - Get all leases for account with relations
- `findOne()` - Get single lease with relations
- `update()` - Update lease with validation and status recalculation
- `terminate()` - Set lease status to TERMINATED
- `remove()` - Delete lease
- `calculateStatus()` - Calculate status based on dates
- `checkOverlap()` - Check for overlapping leases

**Business Logic:**
- **Status Calculation:**
  ```typescript
  if (lease.status === 'TERMINATED') return 'TERMINATED';
  const now = new Date();
  if (lease.startDate > now) return 'FUTURE';
  if (lease.endDate < now) return 'EXPIRED';
  return 'ACTIVE';
  ```

- **Overlap Detection:**
  ```typescript
  // Check if new lease dates overlap with existing leases for same unit
  // Overlap exists if: (start1 < end2) && (end1 > start2)
  ```

---

### Frontend Implementation

**Files:**
- `/apps/frontend/src/app/leases/page.tsx` - Leases list page
- `/apps/frontend/src/components/leases/LeaseList.tsx` - Leases table component
- `/apps/frontend/src/components/leases/LeaseForm.tsx` - Create/Edit form component
- `/apps/frontend/src/lib/api/leases.ts` - API client

**Key Components:**

**LeaseList.tsx:**
- DataGrid with columns: Unit, Tenant, Start Date, End Date, Monthly Rent, Status, Actions
- Status badges with color coding
- Filter dropdown for status
- Search input for tenant/unit
- Action buttons: View, Edit, Terminate, Delete
- RTL Hebrew layout

**LeaseForm.tsx:**
- Multi-step form with unit and tenant selection
- Date pickers for start/end dates
- Number input for monthly rent
- Text input for payment recipient
- Textarea for notes
- Validation with Zod schema
- Inline creation support for unit/tenant (per inline-entity-creation rule)

**API Client:**
```typescript
export const leasesApi = {
  getAll: () => api.get<Lease[]>('/leases'),
  getById: (id: string) => api.get<Lease>(`/leases/${id}`),
  create: (data: CreateLeaseDto) => api.post<Lease>('/leases', data),
  update: (id: string, data: UpdateLeaseDto) => api.patch<Lease>(`/leases/${id}`, data),
  terminate: (id: string) => api.post<Lease>(`/leases/${id}/terminate`),
  delete: (id: string) => api.delete(`/leases/${id}`),
};
```

---

### Status Management

**Status Transitions:**
- **FUTURE → ACTIVE:** Automatically when start date arrives
- **ACTIVE → EXPIRED:** Automatically when end date passes
- **ACTIVE/FUTURE → TERMINATED:** Manually via terminate endpoint
- **TERMINATED:** Final state, cannot be changed

**Status Calculation Triggers:**
- On lease creation
- On lease update (dates changed)
- On lease detail view (optional, on-demand)
- Background job for bulk status updates (optional enhancement)

---

### Validation Rules

1. **Date Validation:**
   - End date must be after start date
   - Start date cannot be in distant past (configurable limit)
   - End date cannot be in distant future (configurable limit)

2. **Overlap Prevention:**
   - Cannot create lease if dates overlap with existing active/future lease for same unit
   - Overlap check excludes terminated and expired leases
   - Overlap check excludes current lease when updating

3. **Status Rules:**
   - Cannot edit terminated leases
   - Cannot terminate already terminated leases
   - Cannot terminate expired leases (already expired)

4. **Required Fields:**
   - unitId, tenantId, startDate, endDate, monthlyRent, paymentTo

5. **Optional Fields:**
   - notes

---

### Notifications Integration

**Lease Expiration Notifications:**
- Background job checks leases with `endDate` within configured timeframe (e.g., 30 days)
- Creates `Notification` records linked to `Lease`
- Notification type: `LEASE_EXPIRING`
- Notification includes lease details and expiration date
- User can view notifications in notification center
- Notifications can be dismissed/marked as read

**Implementation:**
- Database: `Notification` model with `leaseId` relation
- Service: `NotificationService.createLeaseExpirationNotification()`
- Background job: Cron job or scheduled task
- Query: `SELECT * FROM leases WHERE endDate BETWEEN NOW() AND NOW() + 30 DAYS AND status = 'ACTIVE'`

---

### Future Enhancements

**Potential Additional Features:**
- Lease renewal workflow (create new lease from expired one)
- Lease templates for common terms
- Automatic rent increase calculations
- Lease document generation (PDF contracts)
- Email notifications for lease expirations
- Lease statistics dashboard (average rent, occupancy rate)
- Export leases to CSV/Excel
- Lease payment tracking integration
- Multi-currency support for rent
- Lease amendments/history tracking

---

## Related Epics

- **Epic 2: Unit Management** - Leases are linked to units
- **Epic 3: Tenant Management** - Leases are linked to tenants
- **Epic 12: Notifications** - Lease expiration notifications
- **Epic 8: Financial Tracking** - Monthly rent tracking (future integration)

---

## Testing Requirements

### Unit Tests
- Status calculation logic
- Overlap detection logic
- Date validation
- Status transition rules

### Integration Tests
- Create lease with valid data
- Create lease with overlapping dates (should fail)
- Update lease dates (status recalculation)
- Terminate lease
- Delete lease
- Filter by status
- Search functionality

### E2E Tests
- Complete lease creation workflow
- Edit lease workflow
- Terminate lease workflow
- Filter and search workflows

---

## Dependencies

**Required:**
- Epic 2: Unit Management (units must exist)
- Epic 3: Tenant Management (tenants must exist)
- Epic 11: Authentication (user authentication)

**Optional:**
- Epic 12: Notifications (expiration alerts)

---

## Success Metrics

- ✅ All CRUD operations functional
- ✅ Status calculation accurate
- ✅ Overlap prevention working
- ✅ Hebrew RTL interface implemented
- ✅ Form validation comprehensive
- ✅ API endpoints secured with authentication
- ✅ Account isolation maintained

---

**Last Updated:** February 2, 2026  
**Version:** 1.0  
**Status:** ✅ Implemented
