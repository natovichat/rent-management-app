# Epic 6: Property Events (Polymorphic with 4 Subtypes)

**Priority:** 🟠 High  
**Status:** 📋 Planning  
**Complexity:** High  
**Created:** February 12, 2026  
**Dependencies:** Epic 0, Epic 2 (Property)

---

## Overview

Property Events implements a polymorphic event model for property-related records. The base PropertyEvent has common fields; exactly four subtypes add type-specific fields: PlanningProcessEvent, PropertyDamageEvent, ExpenseEvent, RentalPaymentRequestEvent.

**Business Value:**
- Unified property event history
- Type-specific data for planning, damage, expenses, and rental payment requests
- Flexible querying by event type
- Foundation for financial and operational reporting

---

## Subtype Summary

| Subtype | Purpose | Key Fields |
|---------|---------|------------|
| **PlanningProcessEvent** | Planning/permitting status changes | status, applicationDate, approvalDate, permitNumber |
| **PropertyDamageEvent** | Property damage reports | description, damageType, severity, repairCost, repairedDate |
| **ExpenseEvent** | Property expenses | amount, type, category, description, paymentMethod |
| **RentalPaymentRequestEvent** | Rental payment requests/tracking | amount, dueDate, paidDate, status, tenantId |

---

## User Stories

### US6.1: PropertyEvent Base Model & Create PlanningProcessEvent
**As a** user,  
**I can** create a PlanningProcessEvent for a property with date, status, application details, and permit info,  
**So that** I can track planning/permitting status changes.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** Epic 2 (Property)

**Acceptance Criteria:**
- [ ] `POST /api/properties/:propertyId/events/planning-process`
- [ ] CreatePlanningProcessEventDto: eventDate, status (PENDING/IN_PROGRESS/APPROVED/REJECTED), applicationDate, approvalDate, permitNumber, notes
- [ ] Unit tests for PropertyEventsService.createPlanningProcess
- [ ] API integration tests

---

### US6.2: Create PropertyDamageEvent
**As a** user,  
**I can** create a PropertyDamageEvent for a property with description, damage type, severity, repair cost, and dates,  
**So that** I can track property damage reports.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US6.1 (base event infrastructure)

**Acceptance Criteria:**
- [ ] `POST /api/properties/:propertyId/events/property-damage`
- [ ] CreatePropertyDamageEventDto: eventDate, description, damageType, severity, repairCost, repairedDate, notes
- [ ] Unit tests, API integration tests
- [ ] Validation: description required

---

### US6.3: Create ExpenseEvent
**As a** user,  
**I can** create an ExpenseEvent for a property with date, amount, type, category, and description,  
**So that** I can track property expenses.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US6.1

**Acceptance Criteria:**
- [ ] `POST /api/properties/:propertyId/events/expense`
- [ ] CreateExpenseEventDto: eventDate, amount, type (MAINTENANCE/TAX/INSURANCE/UTILITIES/RENOVATION/LEGAL/OTHER), category, description, paymentMethod
- [ ] Unit tests, API integration tests
- [ ] Validation: amount > 0

---

### US6.4: Create RentalPaymentRequestEvent
**As a** user,  
**I can** create a RentalPaymentRequestEvent for a property with amount, due date, paid date, and status,  
**So that** I can track rental payment requests.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US6.1

**Acceptance Criteria:**
- [ ] `POST /api/properties/:propertyId/events/rental-payment-request`
- [ ] CreateRentalPaymentRequestEventDto: eventDate, amount, dueDate, paidDate, status, tenantId, notes
- [ ] Unit tests, API integration tests
- [ ] Validation: amount > 0

---

### US6.5: Read Property Events (List, Filter by Type)
**As a** user,  
**I can** list all property events with pagination and filter by event type,  
**So that** I can view event history.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** US6.1–US6.4

**Acceptance Criteria:**
- [ ] `GET /api/properties/:propertyId/events` with page, limit, eventType (PLANNING_PROCESS/PROPERTY_DAMAGE/EXPENSE/RENTAL_PAYMENT_REQUEST)
- [ ] `GET /api/properties/:propertyId/events/:id` - single event with full subtype data
- [ ] Response includes discriminator (eventType) and type-specific fields
- [ ] Unit tests, API integration tests
- [ ] 404 when event not found

---

### US6.6: Update & Delete Property Events
**As a** user,  
**I can** update and delete property events by type,  
**So that** I can correct or remove event records.

**Priority:** 🟠 High  
**Complexity:** Medium  
**Dependencies:** US6.5

**Acceptance Criteria:**
- [ ] `PATCH /api/properties/:propertyId/events/:id` - validates event type matches body
- [ ] `DELETE /api/properties/:propertyId/events/:id`
- [ ] Update DTOs per subtype (UpdatePlanningProcessEventDto, UpdatePropertyDamageEventDto, UpdateExpenseEventDto, UpdateRentalPaymentRequestEventDto)
- [ ] Unit tests, API integration tests
- [ ] 404 when event not found

---

### US6.7: Complete Testing Coverage
**As a** development team,  
**I can** verify Property Events has comprehensive tests,  
**So that** we ensure quality.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** US6.1–US6.6

**Acceptance Criteria:**
- [ ] Service layer unit tests ≥80% coverage
- [ ] All controller endpoints have API integration tests
- [ ] Polymorphic create/read/update/delete tests for each of the 4 subtypes
- [ ] DTO validation tests per subtype
- [ ] Error handling tests (404, 400)

---

## Dependencies Between Stories

```
Epic 2
   │
   ├─► US6.1 ──┬─► US6.2
   │           ├─► US6.3
   │           └─► US6.4
   │           │
   │           └─► US6.5 ──► US6.6
   │
   └─► US6.7 (depends on all)
```

---

## Polymorphic API Design

**Option A: Type-specific endpoints**
```
POST /api/properties/:id/events/planning-process
POST /api/properties/:id/events/property-damage
POST /api/properties/:id/events/expense
POST /api/properties/:id/events/rental-payment-request
GET  /api/properties/:id/events?eventType=PLANNING_PROCESS/PROPERTY_DAMAGE/EXPENSE/RENTAL_PAYMENT_REQUEST
```

**Option B: Unified endpoint with discriminator**
```
POST /api/properties/:id/events
Body: { "eventType": "EXPENSE", "eventDate": "...", "amount": 500, ... }
GET  /api/properties/:id/events?eventType=EXPENSE
```

Recommended: Option A for clearer validation and type safety.

---

## Related Documentation

- [Epic 0: Database Reset](./EPIC_00_DATABASE_RESET.md) - PropertyEvent schema
- [Epic 2: Property & 1:1 Relations](./EPIC_02_PROPERTY_1to1.md)

---

**Last Updated:** February 12, 2026
