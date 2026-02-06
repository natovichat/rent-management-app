# Phase 3.5: Root Cause Analysis - US1.8 Filter Properties

**Date:** February 5, 2026  
**Cycle:** cycle-1-20260205-191225  
**Status:** 🔍 Root Cause Analysis Complete

## Failing Tests Analysis

### Test 1: TC-E2E-1.8-004 - Filter by City

**Root Cause:**
- City input has 300ms debounce delay
- Test was not waiting long enough for debounce + API call
- Potential backdrop interference from previous interactions

**Fix Applied:**
1. Added `ensureDropdownsClosed()` before interacting with city input
2. Added explicit click on input to ensure focus
3. Increased wait time: 600ms for debounce + `waitForFilterResults()` for API
4. Ensured proper sequencing: click → fill → wait debounce → wait API

### Test 2: TC-E2E-1.8-005 - Filter by Country

**Root Cause:**
- Dropdown backdrop might be interfering with clicks
- Not ensuring dropdowns closed before country select interaction

**Fix Applied:**
1. Added `ensureDropdownsClosed()` before country select
2. Improved `selectMuiOption()` helper to handle backdrops better
3. Added proper wait for filter results after selection

### Test 3: TC-E2E-1.8-007 - Multiple Filters Simultaneously

**Root Cause:**
- Complex sequence of interactions causing race conditions
- Dropdowns not properly closed between filter selections
- City input debounce timing in multi-filter scenario

**Fix Applied:**
1. Added `ensureDropdownsClosed()` between each filter selection
2. Added explicit delays between filter interactions (300ms)
3. Improved city input handling in multi-filter scenario
4. Better sequencing: type → close → status → close → city → checkbox

## Technical Improvements

### 1. Enhanced Dropdown Closing Logic

```typescript
async function ensureDropdownsClosed(page: Page) {
  // Press Escape multiple times
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  
  // Wait for backdrops to disappear
  const backdrop = page.locator('.MuiBackdrop-root:visible');
  try {
    await backdrop.waitFor({ state: 'hidden', timeout: 2000 });
  } catch {
    // Backdrop might not exist, that's fine
  }
  
  await page.waitForTimeout(300);
}
```

### 2. Improved City Input Interaction

```typescript
// Before:
await cityInput.fill('תל אביב');
await waitForFilterResults(page);

// After:
await cityInput.click(); // Ensure focus
await page.waitForTimeout(200);
await cityInput.fill('תל אביב');
await page.waitForTimeout(600); // Wait for debounce (300ms) + buffer
await waitForFilterResults(page); // Wait for API call
```

### 3. Better Multi-Filter Sequencing

```typescript
// Select type → close dropdown → wait
await selectMuiOption(page, 'filter-property-type', 'מגורים');
await ensureDropdownsClosed(page);
await page.waitForTimeout(300);

// Select status → close dropdown → wait
await selectMuiOption(page, 'filter-property-status', 'בבעלות');
await ensureDropdownsClosed(page);
await page.waitForTimeout(300);

// Enter city (with proper debounce handling)
// Check checkbox
```

## Expected Improvements

After these fixes:
- ✅ City filter test should pass (proper debounce handling)
- ✅ Country filter test should pass (backdrop handling)
- ✅ Multiple filters test should pass (better sequencing)

## Next Steps

1. Re-run all E2E tests
2. Verify all 11 tests pass
3. If still failing, investigate further timing issues
4. Proceed to Phase 4 if all tests pass

## Status

🔍 Root causes identified  
✅ Fixes applied  
⏳ Awaiting test re-run to verify fixes
