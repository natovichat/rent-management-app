# US1.5 - Mark Property Mortgage Status - E2E Test Results (Cycle 1)

**Date:** February 5, 2026  
**Test Phase:** TDD - Tests written BEFORE implementation  
**Status:** ✅ All 8 tests written, ❌ All tests FAILING (expected - feature not implemented yet)

---

## Test Summary

**Total Tests:** 8  
**Passed:** 0  
**Failed:** 8  
**Skipped:** 0

---

## Test Cases

### TC-E2E-1.5-001-mortgage-checkbox-exists
**Status:** ❌ FAILED  
**Expected:** Mortgage checkbox (משועבד) exists in property creation form  
**Actual:** Checkbox not found - feature not implemented  
**Error:** `expect(locator).toBeVisible() failed - Expected: visible, Received: hidden`

### TC-E2E-1.5-002-checkbox-defaults-unchecked
**Status:** ❌ NOT RUN (blocked by TC-001)  
**Expected:** Checkbox defaults to false (unchecked)  
**Note:** Will run after TC-001 passes

### TC-E2E-1.5-003-create-mortgaged-property
**Status:** ❌ NOT RUN (blocked by TC-001)  
**Expected:** Create property with isMortgaged=true, verify via API  
**Note:** Will run after TC-001 passes

### TC-E2E-1.5-004-create-unmortgaged-property
**Status:** ❌ NOT RUN (blocked by TC-001)  
**Expected:** Create property with isMortgaged=false, verify via API  
**Note:** Will run after TC-001 passes

### TC-E2E-1.5-005-list-displays-mortgage-indicator
**Status:** ❌ NOT RUN (blocked by TC-001)  
**Expected:** Property list shows visual indicator for mortgaged properties  
**Note:** Will run after TC-001 passes

### TC-E2E-1.5-006-details-shows-mortgage-status
**Status:** ❌ NOT RUN (blocked by TC-001)  
**Expected:** Property details page displays mortgage status  
**Note:** Will run after TC-001 passes

### TC-E2E-1.5-007-edit-mortgage-status
**Status:** ❌ NOT RUN (blocked by TC-001)  
**Expected:** Edit property and update mortgage status to true  
**Note:** Will run after TC-001 passes

### TC-E2E-1.5-008-toggle-mortgage-status
**Status:** ❌ NOT RUN (blocked by TC-001)  
**Expected:** Toggle mortgage status from true to false  
**Note:** Will run after TC-001 passes

---

## Test File Location

**File:** `apps/frontend/test/e2e/us1.5-mortgage-status.spec.ts`

---

## Implementation Requirements

Based on failing tests, the following must be implemented:

### 1. Backend Requirements
- [ ] Add `isMortgaged` boolean field to Property model
- [ ] Add `isMortgaged` to Property DTOs (CreatePropertyDto, UpdatePropertyDto)
- [ ] Update Property entity schema
- [ ] Ensure field defaults to `false` in database

### 2. Frontend Requirements
- [ ] Add "Is Mortgaged" (משועבד) checkbox to property form
- [ ] Place checkbox in "משפטי ורישום" (Legal & Registry) accordion section
- [ ] Checkbox should default to unchecked (false)
- [ ] Form should submit `isMortgaged` value to API
- [ ] Property list should display visual indicator for mortgaged properties
- [ ] Property details page should display mortgage status
- [ ] Edit form should allow updating mortgage status

### 3. Visual Indicator Requirements
- [ ] Design visual indicator (icon/badge/text) for mortgaged properties in list
- [ ] Indicator should only show for properties where `isMortgaged=true`
- [ ] Consider accessibility (aria-label, data-testid)

---

## Next Steps

1. **Backend Team:** Implement `isMortgaged` field in Property model and API
2. **Frontend Team:** Add checkbox to property form and display logic
3. **QA Team:** Re-run tests after implementation (Cycle 2)

---

## Test Execution Command

```bash
cd apps/frontend && npm run test:e2e -- test/e2e/us1.5-mortgage-status.spec.ts
```

---

## Notes

- All tests are written following TDD principles (tests before implementation)
- Tests use the new test account system (`setTestAccountInStorage`)
- Tests include comprehensive logging for debugging
- Database is reset before each test
- Tests verify both UI and API behavior
- Tests cover create, read, update scenarios

---

**This is expected behavior - tests should fail until feature is implemented!**
