# Epic 2: Property & 1:1 Relations (Property, PlanningProcessState, UtilityInfo)

**Priority:** 🔴 Critical  
**Status:** 📋 Planning  
**Complexity:** High  
**Created:** February 12, 2026  
**Dependencies:** Epic 0, Epic 1

---

## Overview

Property & 1:1 Relations implements the core Property entity along with its two 1:1 related entities: PlanningProcessState (planning/permitting status) and UtilityInfo (utility connections). Property is the central entity in the system; all other entities (Ownership, Mortgage, RentalAgreement, PropertyEvent) relate to it.

**Business Value:**
- Complete property portfolio management
- Planning and permitting tracking
- Utility infrastructure tracking
- Foundation for Ownership, Mortgages, Rental Agreements, PropertyEvents

---

## User Stories

### US2.1: Property CRUD - Create
**As a** user,  
**I can** create a Property with address, fileNumber, type, status, city, country, and optional fields including balconySizeSqm, storageSizeSqm, parkingType, estimatedRent, saleProjectedTax,  
**So that** I can start tracking properties in my portfolio.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** Epic 0 (Property schema)

**Acceptance Criteria:**
- [ ] `POST /api/properties` endpoint
- [ ] CreatePropertyDto: address (required), fileNumber, type, status, city, country, totalArea, landArea, estimatedValue, balconySizeSqm, storageSizeSqm, parkingType, estimatedRent, saleProjectedTax, etc.
- [ ] Unit tests for PropertiesService.create
- [ ] API integration tests
- [ ] Validation: address required, enums valid

---

### US2.2: Property CRUD - Read (List, Get, Search, Filter)
**As a** user,  
**I can** list properties with pagination, search, and filter, and retrieve a single property by ID,  
**So that** I can browse and view property details.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** US2.1

**Acceptance Criteria:**
- [ ] `GET /api/properties` with page, limit, search, type, status, city, country
- [ ] `GET /api/properties/:id` with optional includes (planningProcessState, utilityInfo)
- [ ] Pagination metadata in response
- [ ] Unit tests, API integration tests
- [ ] 404 when Property not found

---

### US2.3: Property CRUD - Update & Delete
**As a** user,  
**I can** update and delete Property records,  
**So that** I can maintain accurate property data.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US2.2

**Acceptance Criteria:**
- [ ] `PATCH /api/properties/:id`
- [ ] `DELETE /api/properties/:id` - block if has ownerships, mortgages, rental agreements (or cascade per business rules)
- [ ] Unit tests, API integration tests
- [ ] 409 when delete blocked

---

### US2.4: PlanningProcessState CRUD (1:1 with Property)
**As a** user,  
**I can** create, read, update, and delete PlanningProcessState for a property,  
**So that** I can track planning/permitting status.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US2.1

**Acceptance Criteria:**
- [ ] `POST /api/properties/:propertyId/planning-process-state`
- [ ] `GET /api/properties/:propertyId/planning-process-state`
- [ ] `PATCH /api/properties/:propertyId/planning-process-state`
- [ ] `DELETE /api/properties/:propertyId/planning-process-state`
- [ ] One PlanningProcessState per Property (enforced)
- [ ] Unit tests, API integration tests
- [ ] 404 when Property not found or no state exists

---

### US2.5: UtilityInfo CRUD (1:1 with Property)
**As a** user,  
**I can** create, read, update, and delete UtilityInfo for a property with vaadBayitName, waterMeterNumber, electricityMeterNumber, arnonaAccountNumber, electricityAccountNumber, waterAccountNumber,  
**So that** I can track utility connections and account numbers.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US2.1

**Acceptance Criteria:**
- [ ] `POST /api/properties/:propertyId/utility-info`
- [ ] `GET /api/properties/:propertyId/utility-info`
- [ ] `PATCH /api/properties/:propertyId/utility-info`
- [ ] `DELETE /api/properties/:propertyId/utility-info`
- [ ] UtilityInfo fields: vaadBayitName, waterMeterNumber, electricityMeterNumber, arnonaAccountNumber, electricityAccountNumber, waterAccountNumber, plus electricity, water, gas status flags
- [ ] One UtilityInfo per Property (enforced)
- [ ] Unit tests, API integration tests
- [ ] 404 when Property not found or no info exists

---

### US2.6: Property with Embedded 1:1 Relations
**As a** user,  
**I can** retrieve a Property with its PlanningProcessState and UtilityInfo included in a single request,  
**So that** I can view complete property details efficiently.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US2.4, US2.5

**Acceptance Criteria:**
- [ ] `GET /api/properties/:id?include=planningProcessState,utilityInfo`
- [ ] Response includes nested objects when requested
- [ ] Unit tests verify included relations
- [ ] API integration tests for include parameter

---

### US2.7: Validation & Error Handling
**As a** API consumer,  
**I can** receive clear validation errors and proper HTTP status codes,  
**So that** I can handle errors correctly.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US2.1–US2.6

**Acceptance Criteria:**
- [ ] All DTOs use class-validator
- [ ] 400 for validation errors with field-level messages
- [ ] 404 for not found
- [ ] 409 for conflict (e.g., delete blocked)
- [ ] Unit tests for validation logic
- [ ] API integration tests for error responses

---

### US2.8: Complete Testing Coverage
**As a** development team,  
**I can** verify Property & 1:1 relations have comprehensive tests,  
**So that** we ensure quality.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** US2.1–US2.7

**Acceptance Criteria:**
- [ ] Service layer unit tests ≥80% coverage
- [ ] All controller endpoints have API integration tests
- [ ] DTO validation tests
- [ ] Error handling tests

---

## Dependencies Between Stories

```
Epic 0, Epic 1
   │
   ├─► US2.1 ──► US2.2 ──► US2.3
   │      │
   │      ├─► US2.4
   │      └─► US2.5
   │      │
   │      └─► US2.6 (depends on US2.4, US2.5)
   │
   ├─► US2.7 (depends on US2.1–US2.6)
   └─► US2.8 (depends on all)
```

---

## Entity Models (Conceptual)

**Property (additional fields):**
- balconySizeSqm, storageSizeSqm, parkingType, estimatedRent, saleProjectedTax

**PlanningProcessState:**
- status (e.g., PENDING, IN_PROGRESS, APPROVED, REJECTED)
- applicationDate, approvalDate
- permitNumber, notes

**UtilityInfo:**
- vaadBayitName, waterMeterNumber, electricityMeterNumber
- arnonaAccountNumber, electricityAccountNumber, waterAccountNumber
- electricity (boolean/status)
- water (boolean/status)
- gas (boolean/status)
- notes

---

## Related Documentation

- [Epic 1: Core Entities](./EPIC_01_CORE_ENTITIES.md)
- [Epic 3: Ownership](./EPIC_03_OWNERSHIP.md)
- [Epic 4: Mortgages & Loans](./EPIC_04_MORTGAGES_LOANS.md)

---

**Last Updated:** February 12, 2026
