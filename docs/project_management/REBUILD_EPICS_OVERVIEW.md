# Real Estate Backend Rebuild - Epics Overview

**Status:** 📋 Planning  
**Created:** February 12, 2026  
**Purpose:** Comprehensive epic and user story structure for rebuilding the real estate backend from scratch

---

## Entity Model Summary

### 8 Main Entities

| # | Entity | Description | Relations |
|---|--------|-------------|-----------|
| 1 | **Person** | Individuals/companies that can own properties or be tenants | Properties (via Ownership), RentalAgreements (as tenant) |
| 2 | **BankAccount** | Bank accounts for mortgage payments, rent collection | Mortgages |
| 3 | **Property** | Real estate properties with core attributes | 1:1 PlanningProcessState, UtilityInfo; 1:N Ownerships, Mortgages, RentalAgreements, Events |
| 4 | **PlanningProcessState** | Planning/permitting status (1:1 with Property) | Property |
| 5 | **UtilityInfo** | Utility connections and infrastructure (1:1 with Property) | Property |
| 6 | **Ownership** | Junction: Person ↔ Property (many-to-many) | Person, Property |
| 7 | **Mortgage** | Loans secured by properties | Property, BankAccount, Person (mortgageOwner, payer) |
| 8 | **RentalAgreement** | Rental agreements (Property ↔ Person) | Property, Person (tenant) |

**Note:** There is no Unit entity. RentalAgreement connects directly to Property.

### PropertyEvent Polymorphic Subtypes (4)

| Subtype | Description |
|---------|-------------|
| **PlanningProcessEvent** | Planning/permitting status change records |
| **PropertyDamageEvent** | Property damage reports and repairs |
| **ExpenseEvent** | Property expense records (maintenance, tax, insurance) |
| **RentalPaymentRequestEvent** | Rental payment request/tracking records |

---

## Entity Field Additions

### Property
- balconySizeSqm, storageSizeSqm, parkingType, estimatedRent, saleProjectedTax

### UtilityInfo
- vaadBayitName, waterMeterNumber, electricityMeterNumber
- arnonaAccountNumber, electricityAccountNumber, waterAccountNumber

### Ownership
- managementFee, familyDivision

### Mortgage
- mortgageOwnerId, payerId, earlyRepaymentPenalty

### RentalAgreement
- hasExtensionOption, extensionUntilDate, extensionMonthlyRent

---

## Epic Dependency Graph

```
Epic 0: Database Reset & Infrastructure
    │
    ├─► Epic 1: Core Entities (Person, BankAccount)
    │       │
    │       ├─► Epic 2: Property & 1:1 Relations
    │       │       │
    │       │       ├─► Epic 3: Ownership (junction)
    │       │       │
    │       │       ├─► Epic 4: Mortgages & Loans
    │       │       │
    │       │       ├─► Epic 5: Rental Agreements (Property ↔ Person)
    │       │       │
    │       │       └─► Epic 6: Property Events (polymorphic)
    │       │
    │       └─► Epic 7: API Documentation (parallel)
```

---

## Epic Summary

| Epic | Title | Complexity | Est. Stories |
|------|-------|------------|--------------|
| 0 | Database Reset & Infrastructure | Medium | 4 |
| 1 | Core Entities (Person, BankAccount) | Medium | 6 |
| 2 | Property & 1:1 Relations | High | 8 |
| 3 | Ownership (many-to-many junction) | Medium | 6 |
| 4 | Mortgages & Loans | High | 8 |
| 5 | Rental Agreements | High | 6 |
| 6 | Property Events (polymorphic) | High | 7 |
| 7 | API Documentation | Low | 4 |

---

## Implementation Order

1. **Epic 0** - Foundation (database, migrations, base setup)
2. **Epic 1** - Person and BankAccount (no dependencies)
3. **Epic 2** - Property + PlanningProcessState + UtilityInfo
4. **Epic 3** - Ownership junction (requires Person, Property)
5. **Epic 4** - Mortgages (requires Property, BankAccount, Person)
6. **Epic 5** - RentalAgreements (requires Property, Person) — no Unit
7. **Epic 6** - PropertyEvent + 4 subtypes (requires Property)
8. **Epic 7** - API docs (can run in parallel with Epics 2-6)

---

## Quality Standards (Per User Story)

Every user story MUST include:

- [ ] **CRUD operations** - Create, Read, Update, Delete (where applicable)
- [ ] **Unit tests** - Service layer ≥80% coverage
- [ ] **API integration tests** - Controller endpoints 100% coverage
- [ ] **DTOs** - Request/response validation with class-validator
- [ ] **Error handling** - Proper HTTP status codes, error messages

---

## Related Documentation

- [Epic 0: Database Reset & Infrastructure](./EPIC_00_DATABASE_RESET.md)
- [Epic 1: Core Entities](./EPIC_01_CORE_ENTITIES.md)
- [Epic 2: Property & 1:1 Relations](./EPIC_02_PROPERTY_1to1.md)
- [Epic 3: Ownership](./EPIC_03_OWNERSHIP.md)
- [Epic 4: Mortgages & Loans](./EPIC_04_MORTGAGES_LOANS.md)
- [Epic 5: Rental Agreements](./EPIC_05_RENTAL_AGREEMENTS.md)
- [Epic 6: Property Events](./EPIC_06_PROPERTY_EVENTS.md)
- [Epic 7: API Documentation](./EPIC_07_API_DOCUMENTATION.md)

---

**Last Updated:** February 12, 2026
