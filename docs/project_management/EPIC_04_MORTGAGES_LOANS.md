# Epic 4: Mortgages & Loans

**Priority:** 🔴 Critical  
**Status:** 📋 Planning  
**Complexity:** High  
**Created:** February 12, 2026  
**Dependencies:** Epic 0, Epic 1 (BankAccount, Person), Epic 2 (Property)

---

## Overview

Mortgages & Loans implements mortgage/loan tracking for properties. Mortgages can be linked to a primary property, optional bank account for payments, mortgageOwnerId (Person), payerId (Person), and optionally multiple properties as collateral. Mortgage payments are recorded with principal and interest breakdown. Early repayment penalty is trackable.

**Business Value:**
- Track mortgage obligations per property
- Record payment history
- Calculate remaining balance
- Link to bank accounts and persons (owner, payer)

---

## User Stories

### US4.1: Create Mortgage
**As a** user,  
**I can** create a Mortgage with bank, loan amount, interest rate, monthly payment, start date, status, mortgageOwnerId, payerId, earlyRepaymentPenalty, and optional bank account and linked properties,  
**So that** I can track mortgage obligations.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** Epic 1, Epic 2

**Acceptance Criteria:**
- [ ] `POST /api/mortgages` endpoint
- [ ] CreateMortgageDto: propertyId, bank, loanAmount, startDate, status (required)
- [ ] Optional: interestRate, monthlyPayment, endDate, bankAccountId, linkedProperties[], notes, mortgageOwnerId, payerId, earlyRepaymentPenalty
- [ ] Unit tests for MortgagesService.create
- [ ] API integration tests
- [ ] Validation: loanAmount > 0, property and bankAccount (if provided) exist
- [ ] mortgageOwnerId and payerId reference Person entities

---

### US4.2: Read Mortgages (List, Get, Filter)
**As a** user,  
**I can** list mortgages with pagination and filter by status/property, and retrieve a single mortgage by ID,  
**So that** I can browse and view mortgage details.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US4.1

**Acceptance Criteria:**
- [ ] `GET /api/mortgages` with page, limit, status, propertyId
- [ ] `GET /api/mortgages/:id` with payment history, mortgageOwner, payer
- [ ] `GET /api/properties/:propertyId/mortgages`
- [ ] Unit tests, API integration tests
- [ ] 404 when not found

---

### US4.3: Update & Delete Mortgage
**As a** user,  
**I can** update and delete Mortgage records,  
**So that** I can maintain accurate mortgage data.

**Priority:** 🔴 Critical  
**Complexity:** Low  
**Dependencies:** US4.2

**Acceptance Criteria:**
- [ ] `PATCH /api/mortgages/:id`
- [ ] `DELETE /api/mortgages/:id` - block if has payment history
- [ ] UpdateMortgageDto includes mortgageOwnerId, payerId, earlyRepaymentPenalty
- [ ] Unit tests, API integration tests
- [ ] 409 when delete blocked

---

### US4.4: Record Mortgage Payment
**As a** user,  
**I can** record a mortgage payment with date, amount, principal, and interest,  
**So that** I can track payment history.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** US4.1

**Acceptance Criteria:**
- [ ] `POST /api/mortgages/:id/payments`
- [ ] CreateMortgagePaymentDto: paymentDate, amount (required), principal, interest, notes (optional)
- [ ] Validation: principal + interest <= amount if both provided
- [ ] Unit tests for MortgagesService.recordPayment
- [ ] API integration tests
- [ ] 404 when mortgage not found

---

### US4.5: View Payment History
**As a** user,  
**I can** view payment history for a mortgage,  
**So that** I can track payments over time.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US4.4

**Acceptance Criteria:**
- [ ] `GET /api/mortgages/:id/payments` with pagination
- [ ] Returns paymentDate, amount, principal, interest, notes
- [ ] Sorted by paymentDate (newest first)
- [ ] Unit tests, API integration tests

---

### US4.6: Calculate Remaining Balance
**As a** user,  
**I can** view the calculated remaining balance for a mortgage (loan amount - sum of principal payments),  
**So that** I know how much is still owed.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US4.4

**Acceptance Criteria:**
- [ ] Remaining balance in `GET /api/mortgages/:id` response
- [ ] Formula: loanAmount - sum(principal)
- [ ] Unit tests for calculation logic
- [ ] API integration tests verify value

---

### US4.7: Link Mortgage to Bank Account
**As a** user,  
**I can** link a mortgage to a BankAccount for payment tracking,  
**So that** I know which account is used for payments.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US4.1, Epic 1 (BankAccount)

**Acceptance Criteria:**
- [ ] bankAccountId in CreateMortgageDto and UpdateMortgageDto
- [ ] BankAccount details in mortgage response when linked
- [ ] Link can be set, updated, or removed (null)
- [ ] Inline BankAccount creation in mortgage form (optional)
- [ ] Unit tests, API integration tests

---

### US4.8: Complete Testing Coverage
**As a** development team,  
**I can** verify Mortgages & Loans has comprehensive tests,  
**So that** we ensure quality.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** US4.1–US4.7

**Acceptance Criteria:**
- [ ] Service layer unit tests ≥80% coverage
- [ ] All controller endpoints have API integration tests
- [ ] Payment recording and remaining balance tests
- [ ] Error handling tests (404, 409, 400)

---

## Dependencies Between Stories

```
Epic 1, Epic 2
   │
   ├─► US4.1 ──► US4.2 ──► US4.3
   │      │
   │      ├─► US4.4 ──► US4.5
   │      │         └─► US4.6
   │      │
   │      └─► US4.7
   │
   └─► US4.8 (depends on all)
```

---

## DTOs

**CreateMortgageDto:**
- propertyId, bank, loanAmount, startDate, status (required)
- interestRate, monthlyPayment, endDate, bankAccountId, linkedProperties[], notes (optional)
- mortgageOwnerId, payerId, earlyRepaymentPenalty (optional)

---

## Related Documentation

- [Epic 1: Core Entities](./EPIC_01_CORE_ENTITIES.md)
- [Epic 2: Property & 1:1 Relations](./EPIC_02_PROPERTY_1to1.md)

---

**Last Updated:** February 12, 2026
