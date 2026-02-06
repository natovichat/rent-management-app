# Epic 3: Tenant Management

**Project:** Property Portfolio Management System  
**Created:** February 2, 2026  
**Status:** ✅ Complete - All User Stories Implemented  
**Priority:** 🟠 High  
**Completed:** February 6, 2026

---

## Overview

Tenant Management enables property owners to maintain comprehensive tenant information, track tenant relationships, and manage contact details. This epic provides the foundation for managing tenant data that is essential for lease management and property operations.

Tenants are individuals or entities that rent units within properties. The system allows property owners to store tenant contact information (name, email, phone), add notes, and track the tenant's lease history across multiple properties and units.

---

## User Stories

### US3.1: Create Tenant
**As a** property owner,  
**I can** create a new tenant record with basic information (name, email, phone),  
**So that** I can track tenant details and associate them with leases.

**Priority:** 🔴 Critical  
**Story Points:** 3

**Acceptance Criteria:**
- [x] User can navigate to "Tenants" section from main navigation
- [x] User can click "Add New Tenant" button
- [x] Form displays fields: Name (required), Email (optional), Phone (optional), Notes (optional)
- [x] Name field is validated (required, minimum 2 characters)
- [x] Email field is validated (if provided, must be valid email format)
- [x] Phone field accepts Israeli phone format (if provided)
- [x] User can save tenant and receive success confirmation
- [x] New tenant appears in tenant list immediately after creation
- [x] Tenant is automatically associated with the user's account
- [x] Form validation shows clear error messages for invalid inputs
- [x] User can cancel creation and return to tenant list

**Status:** ✅ Complete

**Technical Requirements:**
- Backend: POST `/api/tenants` endpoint
- Frontend: Tenant creation form component
- Validation: Name required, email format validation, phone format validation
- Database: Create record in `tenants` table with `accountId` from authenticated user

---

### US3.2: View All Tenants
**As a** property owner,  
**I can** view a list of all tenants in my account,  
**So that** I can quickly access tenant information and see an overview of all tenants.

**Priority:** 🔴 Critical  
**Story Points:** 2

**Acceptance Criteria:**
- [x] User can navigate to "Tenants" section
- [x] Tenant list displays all tenants associated with the user's account
- [x] Each tenant row shows: Name, Email, Phone, Number of Active Leases
- [x] List is sorted alphabetically by name by default
- [x] User can see total count of tenants
- [x] List supports pagination if there are many tenants (20+ items)
- [x] Each tenant row has action buttons (View, Edit, Delete)
- [x] User can click on tenant name to view tenant details
- [x] Empty state displays when no tenants exist with "Add First Tenant" CTA
- [x] List updates in real-time when tenants are added/edited/deleted

**Status:** ✅ Complete

**Technical Requirements:**
- Backend: GET `/api/tenants` endpoint with account filtering
- Frontend: Tenant list component with DataGrid
- Database: Query `tenants` table filtered by `accountId`
- Include lease count aggregation in query
- Support sorting and pagination

---

### US3.3: Edit Tenant Details
**As a** property owner,  
**I can** edit tenant information (name, email, phone, notes),  
**So that** I can keep tenant records up-to-date when contact information changes.

**Priority:** 🟠 High  
**Story Points:** 3

**Acceptance Criteria:**
- [x] User can click "Edit" button on any tenant row
- [x] Edit form opens with current tenant data pre-filled
- [x] User can modify: Name, Email, Phone, Notes
- [x] All validation rules apply (same as creation)
- [x] User can save changes and receive success confirmation
- [x] Updated tenant information reflects immediately in tenant list
- [x] User can cancel editing and return to tenant list without saving
- [x] Form shows "Last Updated" timestamp after successful edit
- [x] Changes are tracked with `updatedAt` timestamp in database

**Status:** ✅ Complete

**Technical Requirements:**
- Backend: PUT `/api/tenants/:id` endpoint
- Frontend: Tenant edit form component (reusable with create form)
- Validation: Same as creation form
- Database: Update record in `tenants` table, update `updatedAt` timestamp
- Authorization: Verify tenant belongs to user's account before allowing edit

---

### US3.4: Delete Tenant
**As a** property owner,  
**I can** delete a tenant record,  
**So that** I can remove tenants that are no longer relevant (e.g., after all leases expired and tenant moved out).

**Priority:** 🟡 Medium  
**Story Points:** 2

**Acceptance Criteria:**
- [x] User can click "Delete" button on tenant row
- [x] Confirmation dialog appears asking "Are you sure you want to delete [Tenant Name]?"
- [x] Dialog shows warning if tenant has active leases: "This tenant has active leases. Please end or delete leases first."
- [x] User can confirm deletion or cancel
- [x] If tenant has active leases, deletion is prevented with clear error message
- [x] If tenant has no active leases, deletion proceeds
- [x] Deleted tenant is removed from tenant list immediately
- [x] Success message confirms deletion: "[Tenant Name] has been deleted"
- [x] Deletion is permanent (soft delete not required for MVP)

**Status:** ✅ Complete

**Technical Requirements:**
- Backend: DELETE `/api/tenants/:id` endpoint
- Frontend: Delete confirmation dialog component
- Database: Check for active leases before deletion
- Validation: Prevent deletion if tenant has active leases (status = ACTIVE or FUTURE)
- Database: Cascade delete or restrict based on lease relationship (schema uses `onDelete: Restrict`)

---

### US3.5: Search Tenants
**As a** property owner,  
**I can** search tenants by name, email, or phone number,  
**So that** I can quickly find specific tenants in a large list.

**Priority:** 🟠 High  
**Story Points:** 2

**Acceptance Criteria:**
- [x] Search input field is visible at top of tenant list
- [x] User can type search query in search field
- [x] Search filters tenants in real-time as user types
- [x] Search matches: Name (partial match), Email (partial match), Phone (partial match)
- [x] Search is case-insensitive
- [x] Search results update immediately (debounced for performance)
- [x] Empty search shows all tenants
- [x] "No results found" message displays when search yields no matches
- [x] Search query persists when navigating away and returning to tenant list
- [x] User can clear search with "X" button or by clearing input

**Status:** ✅ Complete

**Technical Requirements:**
- Backend: GET `/api/tenants?search=query` endpoint with search parameter
- Frontend: Search input component with debouncing
- Database: Query with ILIKE or similar case-insensitive pattern matching
- Search across: `name`, `email`, `phone` fields
- Performance: Index on searchable fields for fast queries

---

### US3.6: View Tenant's Lease History
**As a** property owner,  
**I can** view all leases associated with a tenant,  
**So that** I can see the tenant's rental history and track their relationship with my properties.

**Priority:** 🟠 High  
**Story Points:** 3

**Acceptance Criteria:**
- [x] User can click on tenant name or "View Details" button
- [x] Tenant detail page displays tenant information (name, email, phone, notes)
- [x] "Lease History" section shows all leases for this tenant
- [x] Lease list displays: Property Address, Unit Number, Start Date, End Date, Monthly Rent, Status
- [x] Leases are sorted by start date (most recent first)
- [x] Active leases are highlighted or shown first
- [x] User can click on lease to navigate to lease details page
- [x] Empty state shows "No leases found" if tenant has no lease history
- [x] Lease count badge shows total number of leases (active and historical)
- [x] User can navigate back to tenant list

**Status:** ✅ Complete

**Technical Requirements:**
- Backend: GET `/api/tenants/:id` endpoint with lease relationships included
- Frontend: Tenant detail page component
- Database: Query `tenants` with `leases` relation included
- Include nested `unit` and `property` data in lease objects
- Format dates appropriately for display

---

## Acceptance Criteria Summary

### Functional Requirements
- ✅ Create tenant with name, email, phone, notes
- ✅ View all tenants in account
- ✅ Edit tenant information
- ✅ Delete tenant (with lease validation)
- ✅ Search tenants by name, email, phone
- ✅ View tenant's lease history

### Non-Functional Requirements
- ✅ All operations are account-scoped (users only see their tenants)
- ✅ Form validation with clear error messages
- ✅ Responsive design for mobile and desktop
- ✅ Real-time updates after create/edit/delete
- ✅ Loading states during API calls
- ✅ Error handling with user-friendly messages

### Data Requirements
- ✅ Tenant name is required
- ✅ Email must be valid format (if provided)
- ✅ Phone accepts Israeli format (if provided)
- ✅ Notes are optional text field
- ✅ All tenants linked to account via `accountId`
- ✅ Timestamps (`createdAt`, `updatedAt`) tracked automatically

---

## Implementation Notes

### Database Schema

**Table:** `tenants`

```prisma
model Tenant {
  id        String   @id @default(uuid())
  accountId String   @map("account_id")
  name      String
  email     String?
  phone     String?
  notes     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  leases    Lease[]
  
  @@index([accountId])
  @@index([email])
  @@map("tenants")
}
```

**Key Points:**
- `accountId` ensures multi-tenancy (users only see their tenants)
- `email` is indexed for fast search
- Relationship with `Lease` model (one-to-many)
- `onDelete: Cascade` on account relation (if account deleted, tenants deleted)
- `onDelete: Restrict` on lease relation (cannot delete tenant with active leases)

---

### API Endpoints

#### Backend Routes

```typescript
// Tenant routes
POST   /api/tenants              // Create tenant
GET    /api/tenants              // List all tenants (with search)
GET    /api/tenants/:id          // Get tenant details (with leases)
PUT    /api/tenants/:id          // Update tenant
DELETE /api/tenants/:id          // Delete tenant (with validation)
```

#### Request/Response Examples

**Create Tenant:**
```typescript
POST /api/tenants
Body: {
  name: "John Doe",
  email: "john@example.com",
  phone: "050-1234567",
  notes: "Preferred contact method: email"
}

Response: {
  id: "uuid",
  accountId: "uuid",
  name: "John Doe",
  email: "john@example.com",
  phone: "050-1234567",
  notes: "Preferred contact method: email",
  createdAt: "2026-02-02T10:00:00Z",
  updatedAt: "2026-02-02T10:00:00Z"
}
```

**List Tenants (with search):**
```typescript
GET /api/tenants?search=john&page=1&limit=20

Response: {
  data: [
    {
      id: "uuid",
      name: "John Doe",
      email: "john@example.com",
      phone: "050-1234567",
      leaseCount: 2,
      createdAt: "2026-02-02T10:00:00Z"
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1
  }
}
```

**Get Tenant Details:**
```typescript
GET /api/tenants/:id

Response: {
  id: "uuid",
  name: "John Doe",
  email: "john@example.com",
  phone: "050-1234567",
  notes: "Preferred contact method: email",
  createdAt: "2026-02-02T10:00:00Z",
  updatedAt: "2026-02-02T10:00:00Z",
  leases: [
    {
      id: "uuid",
      unit: {
        id: "uuid",
        apartmentNumber: "3A",
        property: {
          id: "uuid",
          address: "123 Main St, Tel Aviv"
        }
      },
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      monthlyRent: 5000,
      status: "ACTIVE"
    }
  ]
}
```

---

### Frontend Components

#### Component Structure

```
apps/frontend/src/
├── app/
│   └── tenants/
│       ├── page.tsx                    # Tenant list page
│       └── [id]/
│           └── page.tsx                # Tenant detail page
├── components/
│   └── tenants/
│       ├── TenantList.tsx             # Tenant list component
│       ├── TenantForm.tsx             # Create/Edit form
│       ├── TenantCard.tsx             # Tenant row/card component
│       ├── TenantDetail.tsx           # Tenant detail view
│       ├── TenantSearch.tsx            # Search input component
│       └── DeleteTenantDialog.tsx      # Delete confirmation dialog
```

#### Key Components

**TenantList Component:**
- DataGrid displaying tenants
- Search functionality
- Action buttons (View, Edit, Delete)
- Pagination support
- Empty state handling

**TenantForm Component:**
- Reusable for create and edit
- Form validation
- Field components: Name, Email, Phone, Notes
- Submit and cancel handlers

**TenantDetail Component:**
- Display tenant information
- Lease history section
- Navigation to lease details
- Edit and delete actions

---

### Validation Rules

**Name:**
- Required field
- Minimum 2 characters
- Maximum 100 characters
- Trim whitespace

**Email:**
- Optional field
- If provided, must be valid email format
- Case-insensitive
- Maximum 255 characters

**Phone:**
- Optional field
- If provided, validate Israeli phone format
- Accept formats: 050-1234567, 0501234567, +972-50-1234567
- Remove formatting for storage

**Notes:**
- Optional field
- Maximum 1000 characters
- Plain text (no HTML)

---

### Business Rules

1. **Account Isolation:** All tenant operations are scoped to the authenticated user's account. Users cannot see or modify tenants from other accounts.

2. **Tenant Deletion:** A tenant cannot be deleted if they have active leases (status = ACTIVE or FUTURE). Users must first end or delete all active leases.

3. **Email Uniqueness:** Email addresses are not required to be unique across the system (multiple tenants can share an email), but should be unique within an account for data quality.

4. **Lease History:** When viewing tenant details, all leases (past, present, and future) are displayed, sorted by start date.

5. **Search Functionality:** Search is performed across name, email, and phone fields with case-insensitive partial matching.

---

### Integration Points

**With Lease Management (Epic 4):**
- Tenants are referenced in lease creation
- Tenant detail page shows lease history
- Cannot delete tenant with active leases

**With Property Management (Epic 1):**
- Tenant lease history shows property addresses
- Navigation from tenant to property via lease

**With Unit Management (Epic 2):**
- Tenant lease history shows unit numbers
- Navigation from tenant to unit via lease

---

### Testing Considerations

**Unit Tests:**
- Form validation logic
- Search filtering logic
- Date formatting utilities

**Integration Tests:**
- API endpoint tests (create, read, update, delete)
- Database query tests
- Account isolation verification

**E2E Tests:**
- Complete tenant creation flow
- Tenant search functionality
- Tenant deletion with lease validation
- Tenant detail page with lease history

---

### Future Enhancements (Out of Scope for MVP)

- Tenant photo upload
- Tenant document storage
- Tenant communication history
- Tenant rating/review system
- Bulk tenant import from CSV
- Tenant tags/categories
- Tenant notes with rich text formatting
- Tenant activity timeline
- Export tenant list to PDF/Excel

---

## Dependencies

**Prerequisites:**
- ✅ Epic 11: Authentication & Multi-Tenancy (for account isolation)
- ✅ Database schema with Tenant model

**Dependent Epics:**
- Epic 4: Lease Management (requires tenants for lease creation)

---

## Related Documents

- [Epics Overview](./EPICS_OVERVIEW.md)
- [Epic 4: Lease Management](./EPIC_04_LEASE_MANAGEMENT.md)
- [Database Schema](../../apps/backend/prisma/schema.prisma)
- [API Documentation](../../docs/API.md)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0
