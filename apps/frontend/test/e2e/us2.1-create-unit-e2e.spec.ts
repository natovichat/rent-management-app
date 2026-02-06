/**
 * US2.1 - Create Unit - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite written FIRST before implementation.
 * 
 * Test Coverage:
 * - TC-E2E-001: Happy path - Create unit with required fields only
 * - TC-E2E-002: Happy path - Create unit with all optional fields
 * - TC-E2E-003: Happy path - Create unit with inline property creation
 * - TC-E2E-004: Error path - Missing required fields validation
 * - TC-E2E-005: Error path - Duplicate apartment number validation
 * - TC-E2E-006: Error path - Invalid numeric values
 * - TC-E2E-007: Navigation - Cancel creation flow
 * - TC-E2E-008: Success - Unit appears in list after creation
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us2.1-create-unit-e2e.spec.ts
 * 
 * EXPECTED: ALL tests FAIL initially (TDD - feature not implemented yet)
 * This is CORRECT - tests written FIRST, implementation comes next!
 */

import { test, expect, Page } from '@playwright/test';
import { selectTestAccount, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

// Test account ID - will be fetched dynamically after db:reset:force
let TEST_ACCOUNT_ID: string;
let TEST_PROPERTY_ID: string;

test.describe('US2.1 - Create Unit (TDD)', () => {
  let page: Page;
  
  // Increase test timeout to 60 seconds
  test.setTimeout(60000);

  /**
   * Helper: Wait for units page to be fully loaded and ready.
   */
  async function waitForUnitsPageReady() {
    await page.waitForLoadState('domcontentloaded');
    
    const url = page.url();
    if (!url.includes('/units')) {
      throw new Error(`Expected to be on /units page, but was redirected to: ${url}`);
    }
    
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    const createButton = page.locator('button:has-text("דירה חדשה")');
    await createButton.waitFor({ state: 'visible', timeout: 10000 });
    
    return createButton;
  }

  /**
   * Helper: Fetch Test Account ID from database
   */
  async function fetchTestAccountId(): Promise<string> {
    console.log('=== FETCHING TEST ACCOUNT ID FROM DATABASE ===');
    
    try {
      const response = await fetch(`${BACKEND_URL}/accounts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }
      
      const accounts = await response.json();
      const testAccount = accounts.find((acc: any) => acc.name === 'Test Account');
      
      if (!testAccount) {
        throw new Error('Test Account not found in database');
      }
      
      console.log(`✓ Found Test Account with ID: ${testAccount.id}`);
      return testAccount.id;
    } catch (error) {
      console.error('⚠️ Failed to fetch Test Account ID:', error);
      throw error;
    }
  }

  /**
   * Helper: Create a test property for unit creation tests
   */
  async function createTestProperty(): Promise<string> {
    console.log('=== CREATING TEST PROPERTY ===');
    
    try {
      const response = await fetch(`${BACKEND_URL}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Account-Id': TEST_ACCOUNT_ID,
        },
        body: JSON.stringify({
          address: 'רחוב הרצל 1, תל אביב',
          fileNumber: 'TEST-PROP-001',
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create property: ${response.status} - ${errorText}`);
      }
      
      const property = await response.json();
      console.log(`✓ Created test property with ID: ${property.id}`);
      return property.id;
    } catch (error) {
      console.error('⚠️ Failed to create test property:', error);
      throw error;
    }
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Reset database to clean state with only Test Account
    console.log('=== RESETTING DATABASE (npm run db:reset:force) ===');
    
    const { execSync } = require('child_process');
    try {
      execSync('npm run db:reset:force', {
        cwd: '/Users/aviad.natovich/personal/rentApplication/apps/backend',
        stdio: 'inherit',
        timeout: 30000,
      });
      console.log('✓ Database reset complete - only Test Account remains');
    } catch (error) {
      console.warn('⚠️ Failed to reset database:', error);
    }
    
    // Fetch Test Account ID
    TEST_ACCOUNT_ID = await fetchTestAccountId();
    console.log(`✓ Using Test Account ID: ${TEST_ACCOUNT_ID}`);
    
    // Create test property
    TEST_PROPERTY_ID = await createTestProperty();
    console.log(`✓ Using Test Property ID: ${TEST_PROPERTY_ID}`);
    
    await page.goto(`${FRONTEND_URL}/units`);
    
    // Select the test account
    await selectTestAccount(page);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  // ============================================================================
  // TC-E2E-001: Happy path - Create unit with required fields only
  // ============================================================================
  test('TC-E2E-001: Happy path - Create unit with required fields only', async () => {
    // Navigate to Units page
    await page.goto(`${FRONTEND_URL}/units`);
    
    // Wait for page to be ready
    const createButton = await waitForUnitsPageReady();
    
    // Select test account
    await selectTestAccount(page);
    
    // Click "דירה חדשה" button
    await createButton.click();
    
    // Wait for dialog to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Wait for form fields to be visible
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Fill required fields
    // Property selector
    await page.click('[id="property-select"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    // Select property by value attribute (MenuItem value matches property ID)
    const propertyOption = page.locator(`[role="option"][data-value="${TEST_PROPERTY_ID}"]`);
    await expect(propertyOption).toBeVisible({ timeout: 5000 });
    await propertyOption.click();
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    // Apartment number
    await page.fill('input[name="apartmentNumber"]', '5');
    
    // Submit form
    const saveButton = page.locator('button:has-text("שמירה")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {
      console.log('Dialog did not close, checking for success anyway');
    });
    
    // Wait for unit to appear in list
    await page.waitForTimeout(2000);
    
    // Verify unit appears in list
    await expect(page.locator('text=5').first()).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // TC-E2E-002: Happy path - Create unit with all optional fields
  // ============================================================================
  test('TC-E2E-002: Happy path - Create unit with all optional fields', async () => {
    await page.goto(`${FRONTEND_URL}/units`);
    const createButton = await waitForUnitsPageReady();
    await selectTestAccount(page);
    
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Fill required fields
    await page.click('[id="property-select"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    const propertyOption = page.locator(`[role="option"][data-value="${TEST_PROPERTY_ID}"]`);
    await expect(propertyOption).toBeVisible({ timeout: 5000 });
    await propertyOption.click();
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    await page.fill('input[name="apartmentNumber"]', '10');
    
    // Fill optional basic fields
    await page.fill('input[name="floor"]', '3');
    await page.fill('input[name="roomCount"]', '4');
    
    // TODO: Fill all additional fields when form is implemented:
    // - unitType (dropdown)
    // - area, bedrooms, bathrooms (numbers)
    // - balconyArea, storageArea (decimals)
    // - hasElevator, hasParking (checkboxes)
    // - parkingSpots (number)
    // - furnishingStatus, condition, occupancyStatus (dropdowns)
    // - isOccupied (checkbox)
    // - entryDate, lastRenovationDate (date pickers)
    // - currentRent, marketRent (decimals)
    // - utilities, notes (text)
    
    // Submit form
    const saveButton = page.locator('button:has-text("שמירה")');
    await saveButton.click();
    
    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Verify unit appears in list
    await expect(page.locator('text=10').first()).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // TC-E2E-003: Happy path - Create unit with inline property creation
  // ============================================================================
  test('TC-E2E-003: Happy path - Create unit with inline property creation', async () => {
    await page.goto(`${FRONTEND_URL}/units`);
    const createButton = await waitForUnitsPageReady();
    await selectTestAccount(page);
    
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Click property selector
    await page.click('[id="property-select"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    
    // Click "+ צור נכס חדש" option
    const createPropertyOption = page.locator('[role="listbox"]').locator('text=/צור נכס חדש/');
    await expect(createPropertyOption).toBeVisible({ timeout: 5000 });
    await createPropertyOption.click();
    
    // Wait for property creation dialog
    await page.waitForSelector('[role="dialog"]:has-text("נכס חדש")', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Fill property form (minimal required fields)
    await page.waitForSelector('input[name="address"]', { state: 'visible', timeout: 10000 });
    await page.fill('input[name="address"]', 'רחוב דיזנגוף 100, תל אביב');
    await page.fill('input[name="fileNumber"]', 'TEST-PROP-002');
    
    // Submit property creation
    const propertySaveButton = page.locator('[role="dialog"]:has-text("נכס חדש")').locator('button:has-text("שמירה")');
    await propertySaveButton.click();
    
    // Wait for property dialog to close and unit form to show again
    await page.waitForSelector('[role="dialog"]:has-text("נכס חדש")', { state: 'hidden', timeout: 10000 });
    await page.waitForSelector('[role="dialog"]:has-text("דירה חדשה")', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Verify property is now selected (should show "דיזנגוף" in selector)
    const propertySelector = page.locator('[id="property-select"]');
    const propertyText = await propertySelector.textContent();
    expect(propertyText).toContain('דיזנגוף');
    
    // Fill apartment number
    await page.fill('input[name="apartmentNumber"]', '15');
    
    // Submit unit creation
    const unitSaveButton = page.locator('button:has-text("שמירה")');
    await unitSaveButton.click();
    
    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Verify unit appears in list
    await expect(page.locator('text=15').first()).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // TC-E2E-004: Error path - Missing required fields validation
  // ============================================================================
  test('TC-E2E-004: Error path - Missing required fields validation', async () => {
    await page.goto(`${FRONTEND_URL}/units`);
    const createButton = await waitForUnitsPageReady();
    await selectTestAccount(page);
    
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Try to submit without filling required fields
    const saveButton = page.locator('button:has-text("שמירה")');
    await saveButton.click();
    
    // Wait for validation errors
    await page.waitForTimeout(1000);
    
    // Verify validation errors are shown
    // Property ID error
    const propertyError = page.locator('text=/נכס הוא שדה חובה/');
    await expect(propertyError).toBeVisible({ timeout: 5000 });
    
    // Apartment number error
    const apartmentError = page.locator('text=/מספר דירה הוא שדה חובה/');
    await expect(apartmentError).toBeVisible({ timeout: 5000 });
    
    // Dialog should still be open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  // ============================================================================
  // TC-E2E-005: Error path - Duplicate apartment number validation
  // ============================================================================
  test('TC-E2E-005: Error path - Duplicate apartment number validation', async () => {
    await page.goto(`${FRONTEND_URL}/units`);
    const createButton = await waitForUnitsPageReady();
    await selectTestAccount(page);
    
    // Create first unit
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    await page.click('[id="property-select"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    const propertyOption1 = page.locator(`[role="option"][data-value="${TEST_PROPERTY_ID}"]`);
    await expect(propertyOption1).toBeVisible({ timeout: 5000 });
    await propertyOption1.click();
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    await page.fill('input[name="apartmentNumber"]', '20');
    
    const saveButton = page.locator('button:has-text("שמירה")');
    await saveButton.click();
    
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Try to create second unit with same apartment number
    const createButton2 = await waitForUnitsPageReady();
    await createButton2.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    await page.click('[id="property-select"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    const propertyOption2 = page.locator(`[role="option"][data-value="${TEST_PROPERTY_ID}"]`);
    await expect(propertyOption2).toBeVisible({ timeout: 5000 });
    await propertyOption2.click();
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    await page.fill('input[name="apartmentNumber"]', '20');
    
    const saveButton2 = page.locator('button:has-text("שמירה")');
    await saveButton2.click();
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Verify error message about duplicate apartment number
    const errorMessage = page.locator('text=/מספר דירה.*כבר קיים/');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // TC-E2E-006: Error path - Invalid numeric values
  // ============================================================================
  test('TC-E2E-006: Error path - Invalid numeric values', async () => {
    await page.goto(`${FRONTEND_URL}/units`);
    const createButton = await waitForUnitsPageReady();
    await selectTestAccount(page);
    
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Fill required fields
    await page.click('[id="property-select"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    const propertyOption = page.locator(`[role="option"][data-value="${TEST_PROPERTY_ID}"]`);
    await expect(propertyOption).toBeVisible({ timeout: 5000 });
    await propertyOption.click();
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    await page.fill('input[name="apartmentNumber"]', '25');
    
    // Fill invalid numeric values
    await page.fill('input[name="floor"]', '-5'); // Negative floor
    await page.fill('input[name="roomCount"]', '0'); // Zero room count
    
    // Try to submit
    const saveButton = page.locator('button:has-text("שמירה")');
    await saveButton.click();
    
    // Wait for validation errors
    await page.waitForTimeout(1000);
    
    // Verify validation errors (if implemented)
    // Note: These validations may be implemented in the form or backend
    // For now, we just verify the form doesn't submit successfully
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  // ============================================================================
  // TC-E2E-007: Navigation - Cancel creation flow
  // ============================================================================
  test('TC-E2E-007: Navigation - Cancel creation flow', async () => {
    await page.goto(`${FRONTEND_URL}/units`);
    const createButton = await waitForUnitsPageReady();
    await selectTestAccount(page);
    
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Fill some fields
    await page.click('[id="property-select"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    const propertyOption = page.locator(`[role="option"][data-value="${TEST_PROPERTY_ID}"]`);
    await expect(propertyOption).toBeVisible({ timeout: 5000 });
    await propertyOption.click();
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    await page.fill('input[name="apartmentNumber"]', '30');
    
    // Click cancel
    const cancelButton = page.locator('button:has-text("ביטול")');
    await cancelButton.click();
    
    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    
    // Verify unit was NOT created (should not appear in list)
    await page.waitForTimeout(1000);
    const unitInList = page.locator('text=30');
    await expect(unitInList).not.toBeVisible({ timeout: 5000 });
  });

  // ============================================================================
  // TC-E2E-008: Success - Unit appears in list after creation
  // ============================================================================
  test('TC-E2E-008: Success - Unit appears in list after creation', async () => {
    await page.goto(`${FRONTEND_URL}/units`);
    const createButton = await waitForUnitsPageReady();
    await selectTestAccount(page);
    
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.waitForSelector('input[name="apartmentNumber"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Fill required fields
    await page.click('[id="property-select"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    const propertyOption = page.locator(`[role="option"][data-value="${TEST_PROPERTY_ID}"]`);
    await expect(propertyOption).toBeVisible({ timeout: 5000 });
    await propertyOption.click();
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    await page.fill('input[name="apartmentNumber"]', '35');
    
    // Submit form
    const saveButton = page.locator('button:has-text("שמירה")');
    await saveButton.click();
    
    // Wait for success (dialog closes)
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Verify unit appears in list with correct data
    await expect(page.locator('text=35').first()).toBeVisible({ timeout: 10000 });
    
    // Verify property address is shown (if displayed in list)
    await expect(page.locator('text=/הרצל/').first()).toBeVisible({ timeout: 5000 });
  });
});
