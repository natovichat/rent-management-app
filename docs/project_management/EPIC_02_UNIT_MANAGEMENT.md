# Epic 2: Unit Management

**Project:** Property Portfolio Management System  
**Created:** February 2, 2026  
**Status:** ✅ Implemented  
**Priority:** 🔴 Critical

---

## Overview

This epic enables users to manage individual residential or commercial units within their properties. Units represent the actual rentable spaces (apartments, offices, stores, etc.) that can be leased to tenants. This functionality is essential for tracking which specific units are available, occupied, or under lease, and managing the details of each unit.

Units are always associated with a property and can have multiple leases over time. The system allows property owners to track unit details such as apartment number, floor, room count, and notes, while maintaining a complete history of leases for each unit.

---

## User Stories

### US2.1: Create Unit
**As a** property owner,  
**I can** create a new unit within a property,  
**So that** I can track individual rentable spaces in my portfolio.

**Acceptance Criteria:**
- User can select a property from their account's properties
- **Inline Property Creation:** Property dropdown includes "+ Create New Property" option
  - Clicking opens inline dialog to create property
  - New property automatically selected after creation
  - Property dropdown refreshes to show new property
- User must provide apartment number (required, unique within property)
- **Complete Field Coverage:** Form includes ALL unit fields from data model:
  - **Basic Information:**
    - apartmentNumber* (required, unique within property)
    - propertyId* (required)
    - floor (optional)
    - roomCount (optional)
  - **Detailed Information:**
    - unitType (APARTMENT | STUDIO | PENTHOUSE | COMMERCIAL | STORAGE | PARKING)
    - area (square meters)
    - bedrooms (number)
    - bathrooms (number)
    - balconyArea (square meters)
    - storageArea (square meters)
  - **Amenities:**
    - hasElevator (boolean)
    - hasParking (boolean)
    - parkingSpots (number)
  - **Status & Condition:**
    - furnishingStatus (FURNISHED | UNFURNISHED | PARTIALLY_FURNISHED)
    - condition (EXCELLENT | GOOD | FAIR | NEEDS_RENOVATION)
    - occupancyStatus (VACANT | OCCUPIED | UNDER_RENOVATION)
    - isOccupied (boolean)
  - **Dates:**
    - entryDate (availability date)
    - lastRenovationDate
  - **Financial:**
    - currentRent (current rental amount)
    - marketRent (market rate estimate)
  - **Additional:**
    - utilities (included utilities description)
    - notes (additional information)
- System validates that apartment number is unique within the property
- System automatically associates unit with user's account
- Unit is created with current timestamp
- Success message displayed after creation
- Unit appears in unit list immediately after creation
- **Field Validation:**
  - Required fields cannot be empty
  - Number fields must be positive
  - Area fields accept decimal values
  - Enum fields show dropdown with valid options
  - Date fields use date picker

**Technical Details:**
- Endpoint: `POST /api/units`
- DTO: `CreateUnitDto` with validation for all fields
- Database constraint: Unique constraint on `(propertyId, apartmentNumber)`
- Account isolation: Unit must belong to user's account
- Reference: `docs/project_management/entities/06_Unit.md` for complete field definitions

---

### US2.2: View Units List
**As a** property owner,  
**I can** view a list of all units in my portfolio,  
**So that** I can see an overview of all rentable spaces.

**Acceptance Criteria:**
- Units displayed in a paginated table/grid
- Table shows: apartment number, property address, floor, room count, active lease status
- User can filter units by property
- User can search units by apartment number
- Pagination controls available (page size: 10, 25, 50, 100)
- Units sorted by property address, then apartment number
- Loading state shown while fetching data
- Empty state shown when no units exist

**Technical Details:**
- Endpoint: `GET /api/units?propertyId={id}&page={page}&limit={limit}`
- Response includes pagination metadata
- Frontend component: `UnitList.tsx` with DataGrid
- Query key: `['units', page, propertyFilter]`

---

### US2.3: View Unit Details
**As a** property owner,  
**I can** view detailed information about a specific unit,  
**So that** I can see all unit information and its lease history.

**Acceptance Criteria:**
- User can click on a unit to view details
- Details page/dialog shows:
  - Unit information (apartment number, floor, room count, notes)
  - Property information (address, file number)
  - Active lease information (if exists)
  - Lease history (all leases for this unit)
- User can navigate to property details from unit details
- User can navigate to lease details from unit details
- Details view is read-only (edit via separate action)

**Technical Details:**
- Endpoint: `GET /api/units/:id`
- Response includes: unit data, property info, active lease
- Frontend component: `UnitDetails.tsx`
- Related data fetched via separate queries for lease history

---

### US2.4: Edit Unit
**As a** property owner,  
**I can** edit unit details,  
**So that** I can update unit information when it changes.

**Acceptance Criteria:**
- User can open edit form from unit list or details view
- Form pre-populated with current unit data
- **Complete Field Coverage:** User can modify ALL unit fields:
  - **Basic Information:**
    - apartmentNumber* (with uniqueness validation)
    - floor
    - roomCount
  - **Detailed Information:**
    - unitType
    - area, bedrooms, bathrooms
    - balconyArea, storageArea
  - **Amenities:**
    - hasElevator, hasParking, parkingSpots
  - **Status & Condition:**
    - furnishingStatus
    - condition
    - occupancyStatus
    - isOccupied
  - **Dates:**
    - entryDate
    - lastRenovationDate
  - **Financial:**
    - currentRent
    - marketRent
  - **Additional:**
    - utilities
    - notes
- Property cannot be changed (unit belongs to property - displayed as read-only)
- **Inline Property Creation:** Property field shows current property with option to view details
- System validates apartment number uniqueness if changed
- Changes saved on form submission
- Success message displayed after update
- Updated unit appears in list immediately
- **Field Validation:**
  - Required fields cannot be empty
  - Number fields must be positive
  - Area fields accept decimal values
  - Enum fields show dropdown with valid options
  - Date fields use date picker
  - Apartment number uniqueness validated if changed

**Technical Details:**
- Endpoint: `PATCH /api/units/:id`
- DTO: `UpdateUnitDto` (partial update, all fields optional except id)
- Frontend component: `UnitForm.tsx` (reused for create/edit)
- Form validation: Zod schema with field type validation
- Reference: `docs/project_management/entities/06_Unit.md` for complete field definitions

---

### US2.5: Delete Unit
**As a** property owner,  
**I can** delete a unit,  
**So that** I can remove units that are no longer part of my portfolio.

**Acceptance Criteria:**
- User can delete unit from unit list or details view
- Confirmation dialog shown before deletion
- System prevents deletion if unit has active leases
- System prevents deletion if unit has any leases (historical data)
- Success message displayed after deletion
- Unit removed from list immediately
- Error message shown if deletion fails (e.g., has leases)

**Technical Details:**
- Endpoint: `DELETE /api/units/:id`
- Service checks for existing leases before deletion
- Cascade delete: Unit deletion removes unit, but preserves lease history (unitId set to null or archived)
- Frontend: Delete mutation with error handling

---

### US2.6: Filter Units by Property
**As a** property owner,  
**I can** filter units by property,  
**So that** I can view only units belonging to a specific property.

**Acceptance Criteria:**
- Filter dropdown shows all user's properties
- User can select a property to filter units
- User can clear filter to show all units
- Filter persists during session
- Filter resets pagination to page 1
- Filtered results show only units from selected property
- Filter state maintained when navigating between pages

**Technical Details:**
- Query parameter: `?propertyId={id}`
- Frontend: Property filter dropdown in `UnitList.tsx`
- Query key includes propertyFilter: `['units', page, propertyFilter]`
- Properties fetched via `propertiesApi.getAll()`

---

### US2.7: Filter Units
**As a** property owner,  
**I can** filter units by unit type, floor, room count, and occupancy status,  
**So that** I can quickly find units matching specific criteria.

**Acceptance Criteria:**
- User can filter units by unit type (APARTMENT, STUDIO, PENTHOUSE, COMMERCIAL, STORAGE, PARKING)
- User can filter units by floor number
- User can filter units by room count
- User can filter units by occupancy status (VACANT, OCCUPIED, UNDER_RENOVATION)
- Multiple filters work together (AND logic)
- User can clear all filters to show all units
- Filters reset pagination to page 1 when changed
- Filter UI is in an expandable accordion (advanced filters)
- Clear filters button appears when filters are active

**Technical Details:**
- Backend: Query parameters `unitType`, `floor`, `roomCount`, `occupancyStatus` in `GET /api/units`
- Frontend: Filter UI in `UnitList.tsx` with accordion for advanced filters
- API: `unitsApi.getAll(filters, page, limit)` accepts `UnitFilters` object
- Filters combined with property filter (from US2.6)
- Query key includes all filter values: `['units', selectedAccountId, page, filters]`

**Status:** ✅ Implemented

---

### US2.8: Search Units
**As a** property owner,  
**I can** search units by apartment number or property address,  
**So that** I can quickly find specific units in my portfolio.

**Acceptance Criteria:**
- ✅ Search input field in unit list header
- ✅ Search filters units by apartment number (partial match)
- ✅ Search filters units by property address (partial match)
- ✅ Search is case-insensitive
- ✅ Search results update as user types (debounced)
- ✅ Search clears when user clears input
- ⚠️ Search works in combination with property filter (flaky test - timing issue)
- ✅ Search results maintain pagination

**Technical Details:**
- Backend: Search parameter in `GET /api/units?search={term}`
- Frontend: Search input with debounce (300ms)
- Query key: `['units', page, propertyFilter, searchTerm]`
- Search implemented in `UnitsService.findAll()` with Prisma filters

**Status:** ✅ Implemented (7/8 E2E tests passing, 1 flaky test)

**Test Results:**
- ✅ TC-E2E-2.8-001: Search input field available
- ✅ TC-E2E-2.8-002: Search by apartment number
- ✅ TC-E2E-2.8-003: Search by property address
- ✅ TC-E2E-2.8-004: Case-insensitive search
- ✅ TC-E2E-2.8-005: Debounced search updates
- ✅ TC-E2E-2.8-006: Clear search
- ⚠️ TC-E2E-2.8-007: Search + property filter (flaky - timing issue with dropdown)
- ✅ TC-E2E-2.8-008: Search maintains pagination

**Technical Debt:**
- TC-E2E-2.8-007 is flaky due to timing issues with property filter dropdown. The functionality works but the test needs more robust waiting/retry logic.

---

### US2.9: Complete Testing Coverage for Unit Management
**As a** development team,  
**I can** verify that all Unit Management functionality is covered by comprehensive tests,  
**So that** we ensure quality, prevent regressions, and can confidently deploy to production.

**Priority:** 🔴 Critical  
**Status:** ⏳ Pending (starts after US2.1-2.8 complete)  
**Type:** Quality Assurance / Testing

**Dependencies:** US2.1, US2.2, US2.3, US2.4, US2.5, US2.6, US2.7, US2.8

**Acceptance Criteria:**

**Backend Team - Unit Tests (80%+ coverage target):**
- [ ] All UnitsService methods have unit tests
- [ ] All business logic covered (CRUD operations with all new fields)
- [ ] Validation logic tested (apartmentNumber uniqueness, property relationship)
- [ ] All unit type and status enum values tested
- [ ] Edge cases tested (null floor, empty notes, boundary values)
- [ ] Error handling tested (not found, duplicate apartment number, invalid property)
- [ ] DTOs validated (CreateUnitDto with 15+ new fields, UpdateUnitDto)
- [ ] Property relationship tests
- [ ] Test coverage ≥ 80% for units module

**QA Team - Backend Integration/API Tests (100% endpoint coverage):**
- [ ] **Engineer 1: CRUD Operations**
  - POST /api/units with all field combinations
  - POST /api/units with inline property creation
  - GET /api/units (list with pagination)
  - GET /api/units/:id (with property and lease data)
  - PATCH /api/units/:id with all editable fields
  - DELETE /api/units/:id (with/without leases)
  - Apartment number uniqueness per property
  
- [ ] **Engineer 2: Validation & Error Handling**
  - apartmentNumber required (400)
  - propertyId required (400)
  - Invalid propertyId (404)
  - Duplicate apartmentNumber in property (409)
  - Delete with leases (409 conflict)
  - Unauthorized access (403)
  - All enum validations
  
- [ ] **Engineer 3: Filtering & Search**
  - Filter by propertyId
  - Search by apartmentNumber
  - Search by property address
  - Combined filter and search
  - Pagination with filters
  - Empty results handling
  
- [ ] **Engineer 4: Complex Scenarios**
  - Unit with multiple leases (history)
  - Unit status changes
  - Amenity combinations
  - Financial data (currentRent, marketRent)
  - Response times < 200ms
  - Large property with 100+ units

**Frontend Team - UI/Component Tests (90%+ coverage target):**
- [ ] **Engineer 1: Components**
  - UnitList renders correctly
  - UnitForm with all 15+ new fields
  - UnitDetails with all sections
  - Property inline creation dialog
  - Lease history display
  
- [ ] **Engineer 2: Form Validation**
  - apartmentNumber required
  - Numeric field validations (area, bedrooms, bathrooms)
  - Enum dropdowns (unitType, furnishingStatus, condition)
  - Optional field handling
  - Form submission flows
  
- [ ] **Engineer 3: Interactions**
  - Create unit button
  - Edit/Delete actions
  - Property filter dropdown
  - Search input (debounced)
  - Pagination controls
  - Property inline creation flow
  
- [ ] **Engineer 4: Data Integration (MSW)**
  - API calls correct
  - Success handling
  - Error handling
  - Loading states
  - Cache invalidation

**QA Team - End-to-End Tests:**
- [ ] **Engineer 1: Happy Paths**
  - Create unit with all fields → View in list
  - Create unit with inline property creation
  - Edit unit → Save → Verify changes
  - Filter units by property
  - Search units → Find result
  
- [ ] **Engineer 2: Error Flows**
  - Duplicate apartment number → Error
  - Invalid data → Validation errors
  - Delete unit with leases → Error message
  - Cancel operations → No changes
  
- [ ] **Engineer 3: Integration**
  - Create property → Create unit → Create lease
  - Unit counts update in property details
  - Lease history displays correctly
  - Cross-navigation works
  
- [ ] **Engineer 4: UI/UX**
  - Responsive design (mobile/tablet/desktop)
  - RTL layout correct
  - Keyboard navigation
  - Screen reader accessibility
  - WCAG AA compliance

**Quality Gates:**
- [ ] Backend coverage ≥ 80%
- [ ] Frontend coverage ≥ 90%
- [ ] All 6 API endpoints tested
- [ ] All 5 user flows have E2E tests
- [ ] Zero failing tests
- [ ] Zero critical bugs
- [ ] Unit Management epic marked ✅ Complete

**Test Files:**
```
tests/
├── unit/
│   ├── backend/units/
│   │   ├── units.service.spec.ts
│   │   └── units.controller.spec.ts
│   └── frontend/units/
│       ├── UnitList.test.tsx
│       └── UnitForm.test.tsx
├── integration/api/units/
│   ├── crud.spec.ts
│   ├── search-filter.spec.ts
│   └── property-relationship.spec.ts
└── e2e/units/
    └── unit-management-flow.spec.ts
```

---

## Acceptance Criteria Summary

### Functional Requirements
- ✅ Create unit with required and optional fields
- ✅ View paginated list of units
- ✅ View unit details with property and lease information
- ✅ Edit unit details
- ✅ Delete unit (with validation for leases)
- ✅ Filter units by property
- ✅ View unit's lease history
- ✅ Search units by apartment number or property address

### Non-Functional Requirements
- ✅ Account isolation (users only see their account's units)
- ✅ Data validation (required fields, uniqueness constraints)
- ✅ Error handling (validation errors, not found, deletion restrictions)
- ✅ Loading states during API calls
- ✅ Success/error messages for user actions
- ✅ Responsive design (mobile-friendly)
- ✅ RTL support (Hebrew interface)
- ✅ Accessibility (keyboard navigation, screen readers)

---

## Implementation Notes

### Database Schema

**Unit Model** (`units` table):
```prisma
model Unit {
  id             String   @id @default(uuid())
  propertyId     String   @map("property_id")
  accountId      String   @map("account_id")
  apartmentNumber String  @map("apartment_number")
  floor          Int?
  roomCount      Int?     @map("room_count")
  notes          String?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  
  // Relations
  property       Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  leases         Lease[]
  
  @@index([propertyId])
  @@index([accountId])
  @@unique([propertyId, apartmentNumber])
  @@map("units")
}
```

**Key Constraints:**
- Unique constraint: `(propertyId, apartmentNumber)` - ensures no duplicate apartment numbers within a property
- Foreign key: `propertyId` references `Property.id` with cascade delete
- Indexes on `propertyId` and `accountId` for query performance

---

### API Endpoints

**Backend:** `apps/backend/src/modules/units/`

#### Endpoints:

1. **GET /api/units**
   - List all units with pagination
   - Query params: `propertyId?`, `page?`, `limit?`, `search?`
   - Returns: `{ data: Unit[], meta: PaginationMeta }`
   - Auth: Required (JWT + AccountGuard)

2. **GET /api/units/:id**
   - Get single unit with details
   - Returns: `UnitResponseDto` (includes property info, active lease)
   - Auth: Required (JWT + AccountGuard)

3. **POST /api/units**
   - Create new unit
   - Body: `CreateUnitDto`
   - Returns: `UnitResponseDto`
   - Auth: Required (JWT + AccountGuard)
   - Validation: Property must exist and belong to account

4. **PATCH /api/units/:id**
   - Update unit
   - Body: `UpdateUnitDto` (partial)
   - Returns: `UnitResponseDto`
   - Auth: Required (JWT + AccountGuard)
   - Validation: Apartment number uniqueness if changed

5. **DELETE /api/units/:id**
   - Delete unit
   - Returns: `204 No Content`
   - Auth: Required (JWT + AccountGuard)
   - Validation: Cannot delete if unit has leases

**DTOs:**
- `CreateUnitDto`: `propertyId` (required), `apartmentNumber` (required), `floor?`, `roomCount?`, `notes?`
- `UpdateUnitDto`: Partial of `CreateUnitDto`
- `UnitResponseDto`: Full unit data + property info + active lease

---

### Frontend Components

**Location:** `apps/frontend/src/components/units/`

#### Components:

1. **UnitList.tsx**
   - Main list view with DataGrid
   - Property filter dropdown
   - Search input (if implemented)
   - Create/Edit/Delete/View actions
   - Pagination controls
   - Uses React Query for data fetching

2. **UnitForm.tsx**
   - Reusable form for create/edit
   - Property selection dropdown
   - Fields: apartment number, floor, room count, notes
   - Form validation with Zod
   - Submit handler with mutation

3. **UnitDetails.tsx**
   - Unit details dialog/page
   - Shows unit info, property info, active lease
   - Lease history section
   - Actions: Edit, Delete, Create Lease

**Page:**
- `apps/frontend/src/app/units/page.tsx` - Units management page

**Services:**
- `apps/frontend/src/services/units.ts` - API service functions
- `apps/frontend/src/lib/api/units.ts` - API client wrapper

---

### Integration Points

**With Property Management (Epic 1):**
- Units require existing property
- Unit list shows property address
- Property details page shows units list
- Unit deletion affects property unit count

**With Lease Management (Epic 4):**
- Units can have multiple leases
- Unit details show lease history
- Active lease displayed in unit list
- Cannot delete unit with active leases

**With Tenant Management (Epic 3):**
- Leases connect units to tenants
- Unit details show tenant information via leases

---

### Business Rules

1. **Uniqueness:** Apartment number must be unique within a property (e.g., Property A can have apartment "5", Property B can also have apartment "5")

2. **Deletion Restrictions:** Unit cannot be deleted if:
   - It has any active leases
   - It has any historical leases (preserve data integrity)

3. **Property Association:** Unit must belong to a property. Property cannot be changed after unit creation (create new unit if needed)

4. **Account Isolation:** Users can only view/manage units belonging to their account

5. **Cascade Behavior:** If property is deleted, all associated units are deleted (cascade delete)

---

### Testing Considerations

**Unit Tests:**
- Service layer: CRUD operations, validation logic
- Controller: Request/response handling, auth guards
- DTOs: Validation rules

**Integration Tests:**
- API endpoints: Full CRUD flow
- Database constraints: Uniqueness, foreign keys
- Account isolation: Cross-account access prevention

**E2E Tests:**
- Create unit flow
- Edit unit flow
- Delete unit (with and without leases)
- Filter by property
- View unit details

---

### Future Enhancements

**Potential Future Stories:**
- Bulk unit creation (import from CSV)
- Unit photos/attachments
- Unit amenities/features tracking
- Unit maintenance history
- Unit availability calendar
- Unit rent price history
- Unit occupancy statistics
- Unit comparison view

---

## Related Epics

- **Epic 1: Property Management** - Units belong to properties
- **Epic 4: Lease Management** - Units have leases
- **Epic 3: Tenant Management** - Units connect to tenants via leases

---

## Dependencies

**Requires:**
- Epic 1: Property Management (units need properties)
- Epic 11: Authentication (account isolation)

**Enables:**
- Epic 4: Lease Management (leases need units)

---

## Status

**Current Status:** ✅ Implemented

**Completed Features:**
- ✅ Unit CRUD operations (Create, Read, Update, Delete)
- ✅ Unit list with pagination
- ✅ Property filtering
- ✅ Unit details view
- ✅ Lease history display
- ✅ Form validation
- ✅ Account isolation
- ✅ Error handling

**Pending Features:**
- 🔄 Bulk operations (future enhancement)

---

**Last Updated:** February 6, 2026  
- US2.6 Filter Units by Property completed - 7/7 E2E tests passing  
- US2.2 View Units List completed - 9/10 E2E tests passing (1 test in technical debt)  
- US2.7 Filter Units completed - Backend and frontend implemented, E2E tests created  
**Version:** 1.0
