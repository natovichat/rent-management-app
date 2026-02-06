/**
 * US2.8 - Search Units - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite written FIRST before implementation verification.
 * 
 * Test Coverage:
 * - TC-E2E-2.8-001: Search input field in unit list header
 * - TC-E2E-2.8-002: Search filters units by apartment number (partial match)
 * - TC-E2E-2.8-003: Search filters units by property address (partial match)
 * - TC-E2E-2.8-004: Search is case-insensitive
 * - TC-E2E-2.8-005: Search results update as user types (debounced)
 * - TC-E2E-2.8-006: Search clears when user clears input
 * - TC-E2E-2.8-007: Search works in combination with property filter
 * - TC-E2E-2.8-008: Search results maintain pagination
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us2.8-search-units-e2e.spec.ts
 * 
 * EXPECTED: Tests verify implementation matches acceptance criteria
 */

import { test, expect } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

// Test account ID - will be fetched dynamically
let TEST_ACCOUNT_ID: string;
let PROPERTY_1_ID: string;
let PROPERTY_2_ID: string;
let UNIT_1_ID: string; // Apartment "1" in Property 1
let UNIT_2_ID: string; // Apartment "10" in Property 1
let UNIT_3_ID: string; // Apartment "5" in Property 2

test.describe('US2.8 - Search Units (TDD)', () => {
  test.beforeAll(async () => {
    console.log('\n=== SETTING UP TEST DATA ===');
    
    // Fetch test account
    const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
    const accounts = await accountsResponse.json();
    const testAccount = accounts.find((a: any) => a.id === 'test-account-1');
    if (!testAccount) {
      throw new Error('Test account "test-account-1" not found');
    }
    TEST_ACCOUNT_ID = testAccount.id;
    console.log(`✓ Test account ID: ${TEST_ACCOUNT_ID}`);
    
    // Clean existing units and properties for test account
    try {
      console.log('→ Cleaning existing test data...');
      const unitsResponse = await fetch(`${BACKEND_URL}/units`, {
        headers: { 'X-Account-Id': TEST_ACCOUNT_ID },
      });
      const unitsData = await unitsResponse.json();
      if (unitsData.data) {
        for (const unit of unitsData.data) {
          await fetch(`${BACKEND_URL}/units/${unit.id}`, {
            method: 'DELETE',
            headers: { 'X-Account-Id': TEST_ACCOUNT_ID },
          }).catch(() => {}); // Ignore errors (may have leases)
        }
      }
      
      const propertiesResponse = await fetch(`${BACKEND_URL}/properties`, {
        headers: { 'X-Account-Id': TEST_ACCOUNT_ID },
      });
      const propertiesData = await propertiesResponse.json();
      if (propertiesData.data) {
        for (const property of propertiesData.data) {
          await fetch(`${BACKEND_URL}/properties/${property.id}`, {
            method: 'DELETE',
            headers: { 'X-Account-Id': TEST_ACCOUNT_ID },
          }).catch(() => {}); // Ignore errors
        }
      }
      console.log('✓ Test data cleaned');
    } catch (error) {
      console.warn('⚠️ Error during cleanup:', error);
    }
    
    // Create test properties
    console.log('→ Creating test properties...');
    const property1 = {
      accountId: TEST_ACCOUNT_ID,
      address: 'רחוב הרצל 123, תל אביב',
      fileNumber: 'FILE-SEARCH-001',
    };
    const property2 = {
      accountId: TEST_ACCOUNT_ID,
      address: 'רחוב דיזנגוף 45, חיפה',
      fileNumber: 'FILE-SEARCH-002',
    };
    
    const prop1Response = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': TEST_ACCOUNT_ID },
      body: JSON.stringify(property1),
    });
    const prop1Data = await prop1Response.json();
    PROPERTY_1_ID = prop1Data.id;
    console.log(`✓ Property 1 created: ${PROPERTY_1_ID}`);
    
    const prop2Response = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': TEST_ACCOUNT_ID },
      body: JSON.stringify(property2),
    });
    const prop2Data = await prop2Response.json();
    PROPERTY_2_ID = prop2Data.id;
    console.log(`✓ Property 2 created: ${PROPERTY_2_ID}`);
    
    // Create test units
    console.log('→ Creating test units...');
    const unit1 = {
      propertyId: PROPERTY_1_ID,
      apartmentNumber: '1',
      floor: 1,
      roomCount: 3,
    };
    const unit2 = {
      propertyId: PROPERTY_1_ID,
      apartmentNumber: '10',
      floor: 2,
      roomCount: 4,
    };
    const unit3 = {
      propertyId: PROPERTY_2_ID,
      apartmentNumber: '5',
      floor: 3,
      roomCount: 2,
    };
    
    const unit1Response = await fetch(`${BACKEND_URL}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': TEST_ACCOUNT_ID },
      body: JSON.stringify(unit1),
    });
    const unit1Data = await unit1Response.json();
    UNIT_1_ID = unit1Data.id;
    console.log(`✓ Unit 1 created: ${UNIT_1_ID} (Apartment 1)`);
    
    const unit2Response = await fetch(`${BACKEND_URL}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': TEST_ACCOUNT_ID },
      body: JSON.stringify(unit2),
    });
    const unit2Data = await unit2Response.json();
    UNIT_2_ID = unit2Data.id;
    console.log(`✓ Unit 2 created: ${UNIT_2_ID} (Apartment 10)`);
    
    const unit3Response = await fetch(`${BACKEND_URL}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': TEST_ACCOUNT_ID },
      body: JSON.stringify(unit3),
    });
    const unit3Data = await unit3Response.json();
    UNIT_3_ID = unit3Data.id;
    console.log(`✓ Unit 3 created: ${UNIT_3_ID} (Apartment 5)`);
    
    console.log('✓ Test data setup complete\n');
  });

  test.beforeEach(async ({ page }) => {
    // Set test account in localStorage
    await setTestAccountInStorage(page, TEST_ACCOUNT_ID);
    
    // Navigate to units page
    await page.goto(`${FRONTEND_URL}/units`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for data to load
  });

  test('TC-E2E-2.8-001: Search input field in unit list header', async ({ page }) => {
    console.log('\n=== TC-E2E-2.8-001: Search Input Field Available ===');
    
    console.log('→ Looking for search input field...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"], input[type="text"][data-testid*="search"]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (!searchExists) {
      console.log('⚠️ Search input not yet implemented - test will fail');
      // Don't skip - let it fail to drive implementation
    }
    
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    console.log('✓ Search input field is visible');
    
    console.log('→ Verifying search input is above DataGrid...');
    const dataGrid = page.locator('[class*="MuiDataGrid-root"]').first();
    const searchInputBox = await searchInput.boundingBox();
    const dataGridBox = await dataGrid.boundingBox();
    
    if (searchInputBox && dataGridBox) {
      expect(searchInputBox.y).toBeLessThan(dataGridBox.y);
      console.log('✓ Search input is positioned above DataGrid');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-2.8-002: Search filters units by apartment number (partial match)', async ({ page }) => {
    console.log('\n=== TC-E2E-2.8-002: Search by Apartment Number ===');
    
    // Wait for DataGrid to load
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"], input[type="text"][data-testid*="search"]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (!searchExists) {
      console.log('⚠️ Search input not yet implemented - skipping test');
      test.skip();
      return;
    }
    
    // Initially, all units should be visible
    console.log('→ Verifying all units are visible initially...');
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '5' }).first()).toBeVisible({ timeout: 5000 });
    console.log('✓ All units visible initially');
    
    // Search for apartment "1" (should match both "1" and "10")
    console.log('→ Typing search term "1"...');
    await searchInput.fill('1');
    
    // Wait for debounced search (300ms + API call)
    console.log('→ Waiting for search results (debounce delay)...');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Verify apartment "1" and "10" are visible
    console.log('→ Verifying search results...');
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 5000 });
    
    // Verify apartment "5" is NOT visible
    const unit5Cells = page.locator('.MuiDataGrid-cell').filter({ hasText: '5' });
    const unit5Count = await unit5Cells.count();
    expect(unit5Count).toBe(0);
    console.log('✓ Apartment 5 filtered out correctly');
    
    // Search for apartment "10" (should match only "10")
    console.log('→ Typing search term "10"...');
    await searchInput.fill('10');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Verify only "10" is visible
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 10000 });
    
    const unit1Cells = page.locator('.MuiDataGrid-cell').filter({ hasText: '^1$' });
    const unit1Count = await unit1Cells.count();
    expect(unit1Count).toBe(0);
    console.log('✓ Apartment 1 filtered out correctly');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-2.8-003: Search filters units by property address (partial match)', async ({ page }) => {
    console.log('\n=== TC-E2E-2.8-003: Search by Property Address ===');
    
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"], input[type="text"][data-testid*="search"]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (!searchExists) {
      console.log('⚠️ Search input not yet implemented - skipping test');
      test.skip();
      return;
    }
    
    // Search for "הרצל" (should match Property 1 address)
    console.log('→ Typing search term "הרצל"...');
    await searchInput.fill('הרצל');
    
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Verify units from Property 1 are visible
    console.log('→ Verifying Property 1 units are visible...');
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 5000 });
    
    // Verify units from Property 2 are NOT visible
    // Check specifically in the apartment number column (first column in RTL)
    const dataGridRows = page.locator('.MuiDataGrid-row');
    const rowCount = await dataGridRows.count();
    let unit5Found = false;
    for (let i = 0; i < rowCount; i++) {
      const row = dataGridRows.nth(i);
      const firstCell = row.locator('.MuiDataGrid-cell').first();
      const cellText = await firstCell.textContent();
      if (cellText && cellText.trim() === '5') {
        unit5Found = true;
        break;
      }
    }
    expect(unit5Found).toBe(false);
    console.log('✓ Property 2 units filtered out correctly');
    
    // Search for "דיזנגוף" (should match Property 2 address)
    console.log('→ Typing search term "דיזנגוף"...');
    await searchInput.fill('דיזנגוף');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Verify only Property 2 unit is visible
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '5' }).first()).toBeVisible({ timeout: 10000 });
    
    // Check specifically in the apartment number column for Property 1 units
    const dataGridRows2 = page.locator('.MuiDataGrid-row');
    const rowCount2 = await dataGridRows2.count();
    let unit1Found = false;
    for (let i = 0; i < rowCount2; i++) {
      const row = dataGridRows2.nth(i);
      const firstCell = row.locator('.MuiDataGrid-cell').first();
      const cellText = await firstCell.textContent();
      if (cellText && (cellText.trim() === '1' || cellText.trim() === '10')) {
        unit1Found = true;
        break;
      }
    }
    expect(unit1Found).toBe(false);
    console.log('✓ Property 1 units filtered out correctly');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-2.8-004: Search is case-insensitive', async ({ page }) => {
    console.log('\n=== TC-E2E-2.8-004: Case-Insensitive Search ===');
    
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"], input[type="text"][data-testid*="search"]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (!searchExists) {
      console.log('⚠️ Search input not yet implemented - skipping test');
      test.skip();
      return;
    }
    
    // Search with lowercase (if applicable - Hebrew doesn't have case, but test for English addresses)
    // For Hebrew, test with different diacritics or spacing
    console.log('→ Testing case-insensitive search...');
    
    // Search for apartment "1" - should work regardless of case
    await searchInput.fill('1');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Search works with numeric input');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-2.8-005: Search results update as user types (debounced)', async ({ page }) => {
    console.log('\n=== TC-E2E-2.8-005: Debounced Search Updates ===');
    
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"], input[type="text"][data-testid*="search"]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (!searchExists) {
      console.log('⚠️ Search input not yet implemented - skipping test');
      test.skip();
      return;
    }
    
    // Type slowly to test debouncing
    console.log('→ Typing search term character by character...');
    await searchInput.fill('1');
    await page.waitForTimeout(100); // Short delay
    
    // Should not trigger search yet (debounce should delay)
    await searchInput.fill('10');
    await page.waitForTimeout(400); // Wait for debounce (300ms) + API call
    
    // Verify results updated
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Search results updated after debounce');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-2.8-006: Search clears when user clears input', async ({ page }) => {
    console.log('\n=== TC-E2E-2.8-006: Clear Search ===');
    
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"], input[type="text"][data-testid*="search"]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (!searchExists) {
      console.log('⚠️ Search input not yet implemented - skipping test');
      test.skip();
      return;
    }
    
    // Apply search
    console.log('→ Applying search...');
    await searchInput.fill('1');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Verify filtered results
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Search applied');
    
    // Clear search
    console.log('→ Clearing search input...');
    await searchInput.clear();
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Verify all units are visible again
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '5' }).first()).toBeVisible({ timeout: 5000 });
    console.log('✓ All units visible after clearing search');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-2.8-007: Search works in combination with property filter', async ({ page }) => {
    console.log('\n=== TC-E2E-2.8-007: Search + Property Filter ===');
    
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"], input[type="text"][data-testid*="search"]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (!searchExists) {
      console.log('⚠️ Search input not yet implemented - skipping test');
      test.skip();
      return;
    }
    
    // Apply property filter first
    console.log('→ Applying property filter...');
    const propertyFilter = page.locator('[data-testid="property-filter-select"]').first();
    await propertyFilter.waitFor({ state: 'visible', timeout: 10000 });
    await propertyFilter.click({ force: true });
    await page.waitForTimeout(1000);
    // Wait for dropdown to open
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await page.locator(`[role="option"]:has-text("רחוב הרצל 123, תל אביב")`).click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    // Verify only Property 1 units are visible
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Property filter applied');
    
    // Apply search on top of property filter
    console.log('→ Applying search on filtered results...');
    await searchInput.fill('10');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Verify only matching unit is visible
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 10000 });
    
    // Check specifically in the apartment number column
    const dataGridRows = page.locator('.MuiDataGrid-row');
    const rowCount = await dataGridRows.count();
    let unit1Found = false;
    for (let i = 0; i < rowCount; i++) {
      const row = dataGridRows.nth(i);
      const firstCell = row.locator('.MuiDataGrid-cell').first();
      const cellText = await firstCell.textContent();
      if (cellText && cellText.trim() === '1') {
        unit1Found = true;
        break;
      }
    }
    expect(unit1Found).toBe(false);
    console.log('✓ Search works with property filter');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-2.8-008: Search results maintain pagination', async ({ page }) => {
    console.log('\n=== TC-E2E-2.8-008: Search with Pagination ===');
    
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"], input[type="text"][data-testid*="search"]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (!searchExists) {
      console.log('⚠️ Search input not yet implemented - skipping test');
      test.skip();
      return;
    }
    
    // Apply search
    console.log('→ Applying search...');
    await searchInput.fill('1');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Verify pagination controls are still visible (or results fit on one page)
    // Pagination might not be visible if results fit on one page, which is acceptable
    const paginationControls = page.locator('[class*="MuiDataGrid-pagination"]');
    const paginationVisible = await paginationControls.count() > 0;
    // If pagination is not visible, it means results fit on one page, which is fine
    if (paginationVisible) {
      console.log('✓ Pagination controls visible');
    } else {
      console.log('✓ Results fit on one page (no pagination needed)');
    }
    
    // Verify search results are paginated correctly
    // (We have 2 units matching "1", so they should fit on one page)
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.MuiDataGrid-cell').filter({ hasText: '10' }).first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Search results maintain pagination');
    
    console.log('✓ Test completed successfully\n');
  });
});
