# Epic Update Strategy: Complete Fields & Inline Creation

**Date:** February 2, 2026  
**Purpose:** Update all user stories to include complete field coverage and inline entity creation patterns

---

## Update Rules

### Rule 1: Complete Field Coverage
**For ALL CREATE and EDIT user stories:**
- Include ALL fields from the entity data model (reference: `docs/project_management/entities/`)
- Don't limit to "basic" fields only
- Include both required and optional fields
- Reference entity documentation for complete field list

### Rule 2: Inline Entity Creation
**For ALL forms with Foreign Key relationships:**
- Add "+ Create New" option in dropdown/select for FK entities
- Allow user to create related entity without leaving current form
- Auto-select newly created entity
- Follow pattern from `@.cursor/rules/inline-entity-creation.mdc`

---

## Entity Field References

### Property (from `01_Property.md`)
**Current Fields:**
- address*, fileNumber, type, status, country*, city
- totalArea, landArea, estimatedValue
- gush, helka, isMortgaged
- notes, accountId*, investmentCompanyId

**NEW Fields to Add (60+ total):**
- cadastralNumber, taxId, registrationDate, acquisitionDate
- acquisitionPrice, acquisitionMethod, landType, landDesignation
- buildingPermitNumber, constructionYear, lastRenovationYear
- floors, totalUnits, parkingSpaces
- sharedOwnershipPercentage, isPartialOwnership
- isSold, saleDate, salePrice
- propertyCondition, zoning, utilities
- propertyManager, managementCompany
- legalStatus, restrictions
- estimationDate, estimationSource
- multipleParcels, parcelList, parcelDetails
- insuranceDetails, insuranceExpiry
- taxAmount, taxFrequency, lastTaxPayment
- managementFees, managementFeeFrequency

### Owner (from `02_Owner.md`)
**Current Fields:**
- name*, idNumber, type*, email, phone, address, notes

**NEW Fields to Add:**
- dateOfBirth, nationality, secondaryPhone
- familyRelation, relationshipType
- taxResidency, taxId
- bankDetails, preferredPaymentMethod

### Unit (from `06_Unit.md`)
**Current Fields:**
- apartmentNumber*, propertyId*, floor, roomCount, notes

**NEW Fields to Add:**
- unitType (APARTMENT | STUDIO | PENTHOUSE | COMMERCIAL | STORAGE | PARKING)
- area, bedrooms, bathrooms
- balconyArea, storageArea
- hasElevator, hasParking, parkingSpots
- furnishingStatus, condition
- entryDate, lastRenovationDate
- currentRent, marketRent
- isOccupied, occupancyStatus
- utilities

### Tenant (from `10_Tenant.md`)
**Current Fields:**
- name*, email, phone, notes

**NEW Fields to Add:**
- idNumber, dateOfBirth, nationality
- secondaryPhone, workPhone
- employer, monthlyIncome
- previousAddress, moveInDate
- emergencyContact, emergencyPhone
- numberOfOccupants, hasPets
- creditScore, referenceContact
- preferredLanguage, preferredContactMethod
- bankAccountDetails

### Lease (from `07_Lease.md`)
**Current Fields:**
- unitId*, tenantId*, startDate*, endDate*
- monthlyRent*, paymentTo*, status, notes

**NEW Fields to Add:**
- securityDeposit, securityDepositPaid
- rentPaymentDay, rentPaymentMethod
- indexationLinked, indexationBase
- indexationPercentage
- utilityPaymentResponsibility
- latePaymentFee, latePaymentGracePeriod
- renewalOption, renewalTerms
- earlyTerminationClause, earlyTerminationFee
- specialConditions, attachments

### Mortgage (from `03_Mortgage.md`)
**Current Fields:**
- propertyId*, bank*, loanAmount*, interestRate
- monthlyPayment, startDate*, endDate
- status*, bankAccountId, notes

**NEW Fields to Add:**
- loanType (FIXED | VARIABLE | PRIME_BASED | INTEREST_ONLY)
- currency (ILS | USD | EUR)
- originalLoanAmount, outstandingBalance
- linkedPropertiesDetails (JSON for multi-property)
- loanPurpose, mortgageNumber
- paymentFrequency, nextPaymentDate
- indexationLinked, indexationRate
- prepaymentAllowed, prepaymentPenalty
- coSigners

### InvestmentCompany (from `04_InvestmentCompany.md`)
**Current Fields:**
- name*, registrationNumber, country*
- investmentAmount, ownershipPercentage, notes

**NEW Fields to Add:**
- companyType, taxId, incorporationDate
- address, phone, email
- contactPerson, contactPhone, contactEmail
- profitSharePercentage, investmentDate
- loanToCompany, loanAmount
- partners (JSON array)
- distributionPolicy
- boardMembers, keyPersonnel

---

## FK Relationship Inline Creation Mappings

### Property Form
**FK:** `investmentCompanyId` → InvestmentCompany
**Add:** "+ Create Investment Company" option
**Action:** Open inline dialog to create company, auto-select after creation

### Unit Form
**FK:** `propertyId` → Property
**Add:** "+ Create Property" option
**Action:** Open inline dialog to create property, auto-select after creation

### Lease Form
**FK:** `tenantId` → Tenant
**Add:** "+ Create Tenant" option
**Action:** Open inline dialog to create tenant, auto-select after creation

**FK:** `unitId` → Unit
**Add:** "+ Create Unit" option (with property selection)
**Action:** Open inline dialog to create unit, auto-select after creation

### PropertyOwnership Form
**FK:** `ownerId` → Owner
**Add:** "+ Create Owner" option ✅ (Already implemented)
**Action:** Working as reference

**FK:** `propertyId` → Property
**Add:** "+ Create Property" option
**Action:** Open inline dialog to create property, auto-select after creation

### Mortgage Form
**FK:** `propertyId` → Property
**Add:** "+ Create Property" option
**Action:** Open inline dialog to create property, auto-select after creation

**FK:** `bankAccountId` → BankAccount
**Add:** "+ Create Bank Account" option
**Action:** Open inline dialog to create bank account, auto-select after creation

### PropertyExpense Form
**FK:** `propertyId` → Property
**Add:** "+ Create Property" option
**Action:** Open inline dialog to create property, auto-select after creation

### PropertyIncome Form
**FK:** `propertyId` → Property
**Add:** "+ Create Property" option
**Action:** Open inline dialog to create property, auto-select after creation

### PropertyValuation Form
**FK:** `propertyId` → Property
**Add:** "+ Create Property" option
**Action:** Open inline dialog to create property, auto-select after creation

---

## Implementation Pattern (Reference)

See `@.cursor/rules/inline-entity-creation.mdc` for complete pattern.

**Quick Template:**

```tsx
// 1. Add dialog state
const [createDialogOpen, setCreateDialogOpen] = useState(false);

// 2. Add form hook for inline creation
const entityForm = useForm<EntityFormData>({
  resolver: zodResolver(entitySchema),
  defaultValues: { ... }
});

// 3. Add creation mutation with auto-select
const createMutation = useMutation({
  mutationFn: entityApi.create,
  onSuccess: (newEntity) => {
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    parentForm.setValue('entityId', newEntity.id); // AUTO-SELECT
    setCreateDialogOpen(false);
  }
});

// 4. Enhance select with create option
<Select onChange={(e) => {
  if (e.target.value === '__CREATE_NEW__') {
    setCreateDialogOpen(true);
  } else {
    parentForm.setValue('entityId', e.target.value);
  }
}}>
  {entities.map(e => <MenuItem value={e.id}>{e.name}</MenuItem>)}
  <MenuItem value="__CREATE_NEW__" sx={{ color: 'primary.main', fontWeight: 600 }}>
    + Create New Entity
  </MenuItem>
</Select>

// 5. Add creation dialog
<Dialog open={createDialogOpen}>
  <form onSubmit={entityForm.handleSubmit(handleSubmit)}>
    {/* Form fields */}
  </form>
</Dialog>
```

---

## Epic-by-Epic Update Summary

### Epic 01 - Property Management
**User Stories to Update:**
- US1.1 (Create Property): Add ALL property fields
- US1.2 (Add Property Details): Update to include ALL detail fields
- US1.9 (Edit Property): Include ALL editable fields
- **NEW AC:** US1.1, US1.2, US1.9 - Add "+ Create Investment Company" inline option

### Epic 02 - Unit Management
**User Stories to Update:**
- US2.1 (Create Unit): Add ALL unit fields + inline property creation
- US2.4 (Edit Unit): Include ALL editable unit fields
- **NEW AC:** US2.1, US2.4 - Add "+ Create Property" inline option

### Epic 03 - Tenant Management
**User Stories to Update:**
- US3.1 (Create Tenant): Add ALL tenant fields
- US3.4 (Edit Tenant): Include ALL editable tenant fields

### Epic 04 - Lease Management
**User Stories to Update:**
- US4.1 (Create Lease): Add ALL lease fields + inline tenant/unit creation
- US4.5 (Edit Lease): Include ALL editable lease fields
- **NEW AC:** US4.1, US4.5 - Add "+ Create Tenant" and "+ Create Unit" inline options

### Epic 05 - Ownership Management
**User Stories to Update:**
- US5.1 (Add Ownership): Add ALL ownership fields
- US5.4 (Edit Ownership): Include ALL editable ownership fields
- **NEW AC:** ✅ Already has "+ Create Owner" (reference implementation)
- **NEW AC:** Add "+ Create Property" inline option

### Epic 06 - Mortgage Management
**User Stories to Update:**
- US6.1 (Create Mortgage): Add ALL mortgage fields + inline property/bank account creation
- US6.5 (Edit Mortgage): Include ALL editable mortgage fields
- **NEW AC:** US6.1, US6.5 - Add "+ Create Property" and "+ Create Bank Account" inline options

### Epic 07 - Bank Account Management
**User Stories to Update:**
- US7.1 (Create Bank Account): Add ALL bank account fields
- US7.3 (Edit Bank Account): Include ALL editable bank account fields

### Epic 08 - Financial Tracking
**User Stories to Update:**
- US8.1 (Add Expense): Add ALL expense fields + inline property creation
- US8.4 (Add Income): Add ALL income fields + inline property creation
- US8.8 (Add Valuation): Add ALL valuation fields + inline property creation
- **NEW AC:** Add "+ Create Property" inline option for all

### Epic 09 - Investment Companies
**User Stories to Update:**
- US9.1 (Create Investment Company): Add ALL investment company fields
- US9.4 (Edit Investment Company): Include ALL editable fields

---

## Acceptance Criteria Template Additions

### For ALL Create User Stories:
Add these acceptance criteria:

```
**Field Coverage:**
- Form includes ALL fields from {Entity} data model (see: docs/project_management/entities/{NN}_{Entity}.md)
- Required fields marked with asterisk (*)
- Optional fields clearly indicated
- Field validation according to data type and constraints
- Help text/tooltips for complex fields

**Field Groups:**
- Basic Information section
- Detailed Information section  
- Financial Information section (if applicable)
- Legal/Registry Information section (if applicable)
- Additional Notes section
```

### For ALL Forms with FK Relationships:
Add these acceptance criteria:

```
**Inline Entity Creation:**
- {FKEntity} dropdown includes "+ Create New {FKEntity}" option at bottom
- Option visually distinct (blue text, bold, with + icon)
- Clicking option opens inline creation dialog
- Dialog includes all required fields for {FKEntity}
- Dialog validates {FKEntity} data before creation
- On successful creation:
  - New {FKEntity} automatically selected in parent form
  - {FKEntity} dropdown refreshes to include new entity
  - Success message displayed
  - Dialog closes
- User can cancel creation without affecting parent form
- Parent form data preserved when creating inline entity
```

---

## Validation Requirements

### For All CRUD Operations:
```
**Validation Rules:**
- Required fields cannot be empty
- Email fields must be valid email format
- Phone fields must match expected format
- Date fields must be valid dates
- Number fields must be positive (where applicable)
- Percentage fields must be 0-100 (where applicable)
- Foreign key fields must reference existing entities
- Unique constraints enforced (e.g., fileNumber, idNumber)
- Data type validation (string, number, date, enum)
- Length constraints (min/max length for strings)
```

---

## Testing Requirements

### For All User Stories with Inline Creation:
```
**Testing Checklist:**
- [ ] "+ Create New" option visible in dropdown
- [ ] Click opens creation dialog
- [ ] Required fields validated in inline dialog
- [ ] Optional fields work correctly
- [ ] Cancel closes dialog without creating
- [ ] Success creates entity
- [ ] **Newly created entity auto-selected** in parent form
- [ ] Entity list refreshed after creation
- [ ] Success message shown
- [ ] Error message shown on failure
- [ ] Loading state displayed during creation
- [ ] Can continue parent form after creation
- [ ] Multiple creates work (can create multiple in same session)
```

---

## Implementation Priority

### Phase 1: Core Entities (High Priority)
1. Property - Add all fields + Investment Company inline creation
2. Unit - Add all fields + Property inline creation  
3. Tenant - Add all fields
4. Lease - Add all fields + Tenant/Unit inline creation

### Phase 2: Financial Entities (High Priority)
5. Mortgage - Add all fields + Property/Bank Account inline creation
6. Bank Account - Add all fields
7. Investment Company - Add all fields

### Phase 3: Supporting Entities (Medium Priority)
8. PropertyOwnership - Verify all fields + Property inline creation
9. PropertyExpense - Add all fields + Property inline creation
10. PropertyIncome - Add all fields + Property inline creation
11. PropertyValuation - Add all fields + Property inline creation

---

## Next Steps

1. ✅ Create this strategy document
2. ⏭️ Update Epic 01 (Property Management)
3. ⏭️ Update Epic 02 (Unit Management)
4. ⏭️ Update Epic 03 (Tenant Management)
5. ⏭️ Update Epic 04 (Lease Management)
6. ⏭️ Update Epic 05 (Ownership Management)
7. ⏭️ Update Epic 06 (Mortgage Management)
8. ⏭️ Update Epic 07 (Bank Account Management)
9. ⏭️ Update Epic 08 (Financial Tracking)
10. ⏭️ Update Epic 09 (Investment Companies)
11. ⏭️ Update remaining epics as needed

---

**This strategy ensures complete, professional CRUD operations with excellent UX for all entity management!**
