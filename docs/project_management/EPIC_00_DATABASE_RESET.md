# Epic 0: Database Reset & Infrastructure

**Priority:** 🔴 Critical  
**Status:** 📋 Planning  
**Complexity:** Medium  
**Created:** February 12, 2026

---

## Overview

Database Reset & Infrastructure establishes the foundation for the rebuilt real estate backend. This epic handles database schema design, migration strategy, and development/testing infrastructure. All subsequent epics depend on this epic being complete.

**Business Value:**
- Clean slate for rebuilt backend
- Consistent schema design
- Reliable development and testing environment

---

## User Stories

### US0.1: Design Prisma Schema for 8 Entities
**As a** backend developer,  
**I can** have a complete Prisma schema defining all 8 main entities (Person, BankAccount, Property, PlanningProcessState, UtilityInfo, Ownership, Mortgage, RentalAgreement) with proper relations,  
**So that** the database structure is well-defined before implementation.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** None

**Acceptance Criteria:**
- [ ] Prisma schema includes Person, BankAccount, Property, PlanningProcessState, UtilityInfo, Ownership, Mortgage, RentalAgreement
- [ ] All relations correctly defined (1:1, 1:N, N:M)
- [ ] No Unit entity (RentalAgreement connects directly to Property)
- [ ] Appropriate indexes for query performance
- [ ] Enums defined for status/type fields
- [ ] Schema validates with `prisma validate`

---

### US0.2: Add PropertyEvent Polymorphic Model
**As a** backend developer,  
**I can** have a PropertyEvent base model with exactly 4 polymorphic subtypes (PlanningProcessEvent, PropertyDamageEvent, ExpenseEvent, RentalPaymentRequestEvent),  
**So that** property events are stored with proper type discrimination.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** US0.1

**Acceptance Criteria:**
- [ ] PropertyEvent base model with common fields (id, propertyId, eventDate, createdAt)
- [ ] Discriminator field (`eventType`) for polymorphic routing
- [ ] Exactly 4 subtypes: PlanningProcessEvent, PropertyDamageEvent, ExpenseEvent, RentalPaymentRequestEvent
- [ ] Schema supports querying by event type
- [ ] Migrations generate successfully

---

### US0.3: Reset Database and Run Migrations
**As a** developer,  
**I can** reset the database and apply all migrations from scratch,  
**So that** the development environment matches the new schema.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US0.1, US0.2

**Acceptance Criteria:**
- [ ] `prisma migrate reset` runs successfully
- [ ] All tables created with correct structure
- [ ] Seed script (if any) runs without errors
- [ ] Migration history is clean
- [ ] Documentation for reset procedure exists

---

### US0.4: Setup Test Database and CI Pipeline
**As a** developer,  
**I can** run tests against a dedicated test database with migrations applied,  
**So that** tests are isolated and reproducible.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US0.3

**Acceptance Criteria:**
- [ ] Test database configuration (DATABASE_URL_TEST or similar)
- [ ] Migrations run before test suite
- [ ] CI pipeline runs migrations and tests
- [ ] Test isolation (each test gets clean state or uses transactions)
- [ ] Documentation for running tests locally

---

## Acceptance Criteria Summary

### US0.1: Design Prisma Schema
- [ ] All 8 entities defined with correct relations (no Unit, no Account)
- [ ] Indexes for common query patterns
- [ ] `prisma validate` passes

### US0.2: PropertyEvent Model
- [ ] Base model + exactly 4 subtypes: PlanningProcessEvent, PropertyDamageEvent, ExpenseEvent, RentalPaymentRequestEvent
- [ ] Polymorphic discriminator
- [ ] Type-specific fields per subtype

### US0.3: Database Reset
- [ ] Migrations apply cleanly
- [ ] Reset procedure documented

### US0.4: Test Infrastructure
- [ ] Test DB configured
- [ ] CI runs migrations + tests

---

## Technical Notes

**Prisma Polymorphic Pattern (PropertyEvent):**
```prisma
model PropertyEvent {
  id         String   @id @default(uuid())
  propertyId String   @map("property_id")
  eventType  String   @map("event_type") // PLANNING_PROCESS | PROPERTY_DAMAGE | EXPENSE | RENTAL_PAYMENT_REQUEST
  eventDate  DateTime @map("event_date")
  createdAt  DateTime @default(now()) @map("created_at")
  
  property   Property @relation(...)
  @@index([propertyId, eventType])
  @@map("property_events")
}

// Or use Table Per Type (TPT) with separate tables per subtype
```

---

## Dependencies Between Stories

```
US0.1 ──► US0.2 ──► US0.3 ──► US0.4
```

---

## Related Documentation

- [Rebuild Epics Overview](./REBUILD_EPICS_OVERVIEW.md)
- [Epic 1: Core Entities](./EPIC_01_CORE_ENTITIES.md)

---

**Last Updated:** February 12, 2026
