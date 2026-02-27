# Epic 1: Core Entities (Person, BankAccount)

**Priority:** 🔴 Critical  
**Status:** 📋 Planning  
**Complexity:** Medium  
**Created:** February 12, 2026  
**Dependencies:** Epic 0 (Database Reset & Infrastructure)

---

## Overview

Core Entities establishes the Person and BankAccount entities that form the foundation for ownership, mortgages, and rental agreements. Person represents individuals or companies (owners, tenants); BankAccount represents bank accounts used for mortgage payments and rent collection.

**Business Value:**
- Reusable Person entity for owners and tenants
- Bank account management for financial tracking
- Foundation for Epic 3 (Ownership), Epic 4 (Mortgages), Epic 5 (Rental Agreements)

---

## User Stories

### US1.1: Person CRUD - Create
**As a** user,  
**I can** create a new Person with name, type (INDIVIDUAL/COMPANY/PARTNERSHIP), and optional contact details,  
**So that** I can track people who own or rent properties.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** Epic 0 complete

**Acceptance Criteria:**
- [ ] `POST /api/persons` endpoint
- [ ] CreatePersonDto with validation (name required, type required)
- [ ] Optional: idNumber, email, phone, address, notes
- [ ] Unit tests for PersonsService.create
- [ ] API integration tests for POST endpoint
- [ ] 400 on invalid/missing required fields
- [ ] 201 with created entity on success

---

### US1.2: Person CRUD - Read
**As a** user,  
**I can** list and retrieve Person records with pagination and search,  
**So that** I can find and view person details.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US1.1

**Acceptance Criteria:**
- [ ] `GET /api/persons` with pagination (page, limit)
- [ ] `GET /api/persons/:id` for single Person
- [ ] Search by name, email, phone (query param)
- [ ] Unit tests for findAll, findOne
- [ ] API integration tests for GET endpoints
- [ ] 404 when Person not found

---

### US1.3: Person CRUD - Update & Delete
**As a** user,  
**I can** update and delete Person records,  
**So that** I can maintain accurate person data.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US1.2

**Acceptance Criteria:**
- [ ] `PATCH /api/persons/:id` endpoint
- [ ] UpdatePersonDto (all fields optional)
- [ ] `DELETE /api/persons/:id` - block if has ownerships or rental agreements
- [ ] Unit tests for update, delete
- [ ] API integration tests
- [ ] 409 Conflict when delete blocked by relations
- [ ] 404 when Person not found

---

### US1.4: BankAccount CRUD - Create
**As a** user,  
**I can** create a BankAccount with bank name, account number, branch, and account type,  
**So that** I can link bank accounts to mortgages and payments.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** Epic 0 complete

**Acceptance Criteria:**
- [ ] `POST /api/bank-accounts` endpoint
- [ ] CreateBankAccountDto: bankName, accountNumber, branchNumber (optional), accountType (CHECKING/SAVINGS/BUSINESS)
- [ ] Optional: accountHolder, notes, isActive
- [ ] Unit tests for BankAccountsService.create
- [ ] API integration tests
- [ ] Uniqueness: (bankName, accountNumber) - 400 on duplicate

---

### US1.5: BankAccount CRUD - Read, Update, Delete
**As a** user,  
**I can** list, retrieve, update, and delete BankAccount records,  
**So that** I can manage my bank accounts.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US1.4

**Acceptance Criteria:**
- [ ] `GET /api/bank-accounts` with pagination
- [ ] `GET /api/bank-accounts/:id`
- [ ] `PATCH /api/bank-accounts/:id`
- [ ] `DELETE /api/bank-accounts/:id` - block if linked to mortgages
- [ ] Unit tests, API integration tests
- [ ] 409 when delete blocked

---

### US1.6: Complete Testing Coverage for Core Entities
**As a** development team,  
**I can** verify Person and BankAccount have comprehensive tests,  
**So that** we ensure quality and prevent regressions.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US1.1–US1.5

**Acceptance Criteria:**
- [ ] Service layer unit tests ≥80% coverage
- [ ] All controller endpoints have API integration tests
- [ ] DTO validation tests
- [ ] Error handling tests (404, 409, 400)

---

## Dependencies Between Stories

```
Epic 0
   │
   ├─► US1.1 ──► US1.2 ──► US1.3
   │
   ├─► US1.4 ──► US1.5
   │
   └─► US1.6 (depends on US1.1–US1.5)
```

---

## DTOs

**CreatePersonDto:**
- name (required, string)
- type (required, INDIVIDUAL | COMPANY | PARTNERSHIP)
- idNumber, email, phone, address, notes (optional)

**CreateBankAccountDto:**
- bankName (required)
- accountNumber (required)
- branchNumber (optional)
- accountType (required, CHECKING | SAVINGS | BUSINESS)
- accountHolder, notes, isActive (optional)

---

## Related Documentation

- [Epic 0: Database Reset](./EPIC_00_DATABASE_RESET.md)
- [Epic 2: Property & 1:1 Relations](./EPIC_02_PROPERTY_1to1.md)
- [Epic 3: Ownership](./EPIC_03_OWNERSHIP.md)

---

**Last Updated:** February 12, 2026
