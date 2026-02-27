# Epic 3: Ownership (Many-to-Many Junction)

**Priority:** 🔴 Critical  
**Status:** 📋 Planning  
**Complexity:** Medium  
**Created:** February 12, 2026  
**Dependencies:** Epic 0, Epic 1 (Person), Epic 2 (Property)

---

## Overview

Ownership implements the many-to-many relationship between Person and Property via the Ownership junction entity. A Person can own multiple properties; a Property can have multiple owners. Each ownership record includes ownership percentage, type, date range, managementFee, and familyDivision.

**Business Value:**
- Track who owns each property
- Support partial ownership and partnerships
- Ownership percentage validation (total = 100%)
- Historical ownership tracking
- Management fee and family division tracking

---

## User Stories

### US3.1: Create Ownership Record
**As a** user,  
**I can** create an Ownership record linking a Person to a Property with percentage, type, dates, managementFee, and familyDivision,  
**So that** I can track property ownership.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** Epic 1, Epic 2

**Acceptance Criteria:**
- [ ] `POST /api/properties/:propertyId/ownerships` (or `POST /api/ownerships`)
- [ ] CreateOwnershipDto: personId, ownershipPercentage (0-100), ownershipType (FULL/PARTIAL/PARTNERSHIP/COMPANY), startDate, endDate (optional), managementFee (optional), familyDivision (optional)
- [ ] Unit tests for OwnershipsService.create
- [ ] API integration tests
- [ ] Validation: percentage 0-100, endDate after startDate if provided
- [ ] Person and Property must exist
- [ ] Optionally validate total ownership percentage = 100%

---

### US3.2: Read Ownership Records
**As a** user,  
**I can** list ownership records for a property and for a person,  
**So that** I can view ownership structure.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US3.1

**Acceptance Criteria:**
- [ ] `GET /api/properties/:propertyId/ownerships` - Ownerships for property
- [ ] `GET /api/persons/:personId/ownerships` - Ownerships for person
- [ ] `GET /api/ownerships/:id` - Single ownership
- [ ] Include Person and Property details in response
- [ ] Unit tests, API integration tests
- [ ] 404 when not found

---

### US3.3: Update & Delete Ownership
**As a** user,  
**I can** update and delete Ownership records,  
**So that** I can correct ownership data and remove historic records.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US3.2

**Acceptance Criteria:**
- [ ] `PATCH /api/ownerships/:id`
- [ ] `DELETE /api/ownerships/:id`
- [ ] UpdateOwnershipDto (all fields optional including managementFee, familyDivision)
- [ ] Unit tests, API integration tests
- [ ] After delete, optionally re-validate total ownership percentage

---

### US3.4: Validate Total Ownership Percentage
**As a** user,  
**I can** get validation that total ownership for a property equals 100%,  
**So that** I can ensure accurate ownership records.

**Priority:** 🟠 High  
**Complexity:** Medium  
**Dependencies:** US3.1

**Acceptance Criteria:**
- [ ] `GET /api/properties/:propertyId/ownerships/validate` returns { isValid, totalPercentage, message }
- [ ] Only active ownerships (endDate null or future) counted
- [ ] Unit tests for validation logic
- [ ] API integration tests
- [ ] Clear error message when total ≠ 100%

---

### US3.5: Inline Person Creation from Ownership Form
**As a** user,  
**I can** create a new Person from the ownership form without navigating away,  
**So that** I can add owners quickly.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US3.1, Epic 1 (Person API)

**Acceptance Criteria:**
- [ ] Ownership form includes "+ Create New Person" option in person dropdown
- [ ] Dialog opens for Person creation
- [ ] New Person auto-selected after creation
- [ ] Pattern follows inline-entity-creation rule
- [ ] API integration tests for flow

---

### US3.6: Complete Testing Coverage
**As a** development team,  
**I can** verify Ownership module has comprehensive tests,  
**So that** we ensure quality.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US3.1–US3.5

**Acceptance Criteria:**
- [ ] Service layer unit tests ≥80% coverage
- [ ] All controller endpoints have API integration tests
- [ ] Ownership percentage validation tests
- [ ] Error handling tests (404, 409, 400)

---

## Dependencies Between Stories

```
Epic 1, Epic 2
   │
   ├─► US3.1 ──► US3.2 ──► US3.3
   │      │
   │      └─► US3.4
   │      └─► US3.5 (depends on Epic 1)
   │
   └─► US3.6 (depends on all)
```

---

## DTOs

**CreateOwnershipDto:**
- personId (required, UUID)
- ownershipPercentage (required, 0-100)
- ownershipType (required, FULL | PARTIAL | PARTNERSHIP | COMPANY)
- startDate (required)
- endDate (optional)
- managementFee (optional)
- familyDivision (optional)

**OwnershipValidationResponse:**
- isValid (boolean)
- totalPercentage (number)
- message (string)

---

## Related Documentation

- [Epic 2: Property & 1:1 Relations](./EPIC_02_PROPERTY_1to1.md)
- [Inline Entity Creation Rule](../../.cursor/rules/inline-entity-creation.mdc)

---

**Last Updated:** February 12, 2026
