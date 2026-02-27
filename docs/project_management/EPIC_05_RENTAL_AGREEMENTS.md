# Epic 5: Rental Agreements (Property ↔ Person)

**Priority:** 🔴 Critical  
**Status:** 📋 Planning  
**Complexity:** High  
**Created:** February 12, 2026  
**Dependencies:** Epic 0, Epic 1 (Person), Epic 2 (Property)

---

## Overview

Rental Agreements implements RentalAgreement (rental contracts between a Property and a Person as tenant). RentalAgreement connects directly to Property—there is no Unit entity. This epic covers the full lifecycle of rental management from creating rental agreements to managing lease status.

**Business Value:**
- Manage rental agreements per property
- Link tenants (Person) directly to properties
- Support lease status (FUTURE, ACTIVE, EXPIRED, TERMINATED)
- Extension options (hasExtensionOption, extensionUntilDate, extensionMonthlyRent)

---

## User Stories

### US5.1: Create RentalAgreement
**As a** user,  
**I can** create a RentalAgreement linking a Property to a Person (tenant) with start date, end date, monthly rent, payment details, hasExtensionOption, extensionUntilDate, extensionMonthlyRent, and status,  
**So that** I can record rental agreements.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** Epic 1, Epic 2

**Acceptance Criteria:**
- [ ] `POST /api/rental-agreements` endpoint
- [ ] CreateRentalAgreementDto: propertyId, personId (tenant), startDate, endDate, monthlyRent, paymentTo, status (optional, default FUTURE)
- [ ] Optional: hasExtensionOption, extensionUntilDate, extensionMonthlyRent
- [ ] Validation: endDate after startDate, property and person exist
- [ ] Unit tests for RentalAgreementsService.create
- [ ] API integration tests

---

### US5.2: Read Rental Agreements (List, Get, Filter)
**As a** user,  
**I can** list rental agreements with pagination and filter by status/property/person, and retrieve a single rental agreement by ID,  
**So that** I can browse and view rental agreement details.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US5.1

**Acceptance Criteria:**
- [ ] `GET /api/rental-agreements` with page, limit, status, propertyId, personId
- [ ] `GET /api/rental-agreements/:id` with property and person details
- [ ] `GET /api/properties/:propertyId/rental-agreements`
- [ ] `GET /api/persons/:personId/rental-agreements`
- [ ] Unit tests, API integration tests
- [ ] 404 when not found

---

### US5.3: Update & Delete Rental Agreement
**As a** user,  
**I can** update and delete RentalAgreement records,  
**So that** I can maintain accurate rental data.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US5.2

**Acceptance Criteria:**
- [ ] `PATCH /api/rental-agreements/:id`
- [ ] `DELETE /api/rental-agreements/:id`
- [ ] UpdateRentalAgreementDto (all fields optional including hasExtensionOption, extensionUntilDate, extensionMonthlyRent)
- [ ] Unit tests, API integration tests

---

### US5.4: Inline Person Creation from Rental Agreement Form
**As a** user,  
**I can** create a new Person (tenant) from the rental agreement form without navigating away,  
**So that** I can add tenants quickly.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US5.1, Epic 1 (Person API)

**Acceptance Criteria:**
- [ ] Rental agreement form includes "+ Create New Person" option in tenant dropdown
- [ ] Dialog opens for Person creation
- [ ] New Person auto-selected after creation
- [ ] Pattern follows inline-entity-creation rule
- [ ] API integration tests for flow

---

### US5.5: Rental Agreement Status Transitions
**As a** user,  
**I can** update rental agreement status (FUTURE → ACTIVE → EXPIRED/TERMINATED),  
**So that** I can track lease lifecycle.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US5.3

**Acceptance Criteria:**
- [ ] Status field: FUTURE, ACTIVE, EXPIRED, TERMINATED
- [ ] `PATCH /api/rental-agreements/:id` can update status
- [ ] Optional: scheduled job to auto-update EXPIRED based on endDate
- [ ] Unit tests for status updates
- [ ] API integration tests

---

### US5.6: Complete Testing Coverage
**As a** development team,  
**I can** verify Rental Agreements has comprehensive tests,  
**So that** we ensure quality.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** US5.1–US5.5

**Acceptance Criteria:**
- [ ] Service layer unit tests ≥80% coverage
- [ ] All controller endpoints have API integration tests
- [ ] DTO validation tests
- [ ] Error handling tests (404, 409, 400)

---

## Dependencies Between Stories

```
Epic 1, Epic 2
   │
   ├─► US5.1 ──► US5.2 ──► US5.3 ──► US5.5
   │      │
   │      └─► US5.4 (depends on Epic 1)
   │
   └─► US5.6 (depends on all)
```

---

## DTOs

**CreateRentalAgreementDto:**
- propertyId (required)
- personId (tenant, required)
- startDate, endDate (required)
- monthlyRent (required)
- paymentTo (optional)
- status (optional, default FUTURE)
- hasExtensionOption (optional)
- extensionUntilDate (optional)
- extensionMonthlyRent (optional)

**UpdateRentalAgreementDto:**
- All fields optional including hasExtensionOption, extensionUntilDate, extensionMonthlyRent

---

## Related Documentation

- [Epic 1: Core Entities](./EPIC_01_CORE_ENTITIES.md)
- [Epic 2: Property & 1:1 Relations](./EPIC_02_PROPERTY_1to1.md)
- [Inline Entity Creation Rule](../../.cursor/rules/inline-entity-creation.mdc)

---

**Last Updated:** February 12, 2026
