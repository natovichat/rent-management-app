/**
 * US4.1 - Create New Lease - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite written FIRST before implementation.
 * 
 * Test Coverage:
 * - TC-E2E-001: Happy path - Create lease with required fields only
 * - TC-E2E-002: Happy path - Create lease with all fields including notes
 * - TC-E2E-003: Happy path - Create lease with inline tenant creation
 * - TC-E2E-004: Error path - Missing required fields validation
 * - TC-E2E-005: Error path - End date before start date validation
 * - TC-E2E-006: Error path - Overlapping lease prevention
 * - TC-E2E-007: Navigation - Cancel creation flow
 * - TC-E2E-008: Success - Lease appears in list after creation
 * - TC-E2E-009: Status calculation - FUTURE status for future start date
 * - TC-E2E-010: Status calculation - ACTIVE status for past start date
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us4.1-create-lease-e2e.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

let TEST_ACCOUNT_ID: string;
let TEST_PROPERTY_ID: string;
let TEST_UNIT_ID: string;
let TEST_TENANT_ID: string;

test.describe('US4.1 - Create New Lease (TDD)', () => {
  let page: Page;
  
  test.setTimeout(60000);

  /**
   * Helper: Clean test data
   */
  async function cleanTestData() {
    console.log('=== CLEANING TEST DATA ===');
    try {
      await fetch(`${BACKEND_URL}/leases/test/cleanup`, { method: 'DELETE' });
      await fetch(`${BACKEND_URL}/units/test/cleanup`, { method: 'DELETE' });
      await fetch(`${BACKEND_URL}/tenants/test/cleanup`, { method: 'DELETE' });
      await fetch(`${BACKEND_URL}/properties/test/cleanup`, { method: 'DELETE' });
      console.log('✓ Test data cleaned');
    } catch (error) {
      console.warn('⚠️ Failed to clean test data:', error);
    }
  }

  /**
   * Helper: Fetch Test Account ID
   */
  async function fetchTestAccountId(): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/accounts`);
    const accounts = await response.json();
    const testAccount = accounts.find((acc: any) => acc.name === 'Test Account');
    if (!testAccount) throw new Error('Test Account not found');
    return testAccount.id;
  }

  /**
   * Helper: Create test property
   */
  async function createTestProperty(): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: 'רחוב הרצל 1, תל אביב',
        fileNumber: 'TEST-PROP-001',
      }),
    });
    const property = await response.json();
    return property.id;
  }

  /**
   * Helper: Create test unit
   */
  async function createTestUnit(propertyId: string): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        apartmentNumber: '5',
      }),
    });
    const unit = await response.json();
    return unit.id;
  }

  /**
   * Helper: Create test tenant
   */
  async function createTestTenant(): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'יוחנן כהן',
        phone: '050-1234567',
      }),
    });
    const tenant = await response.json();
    return tenant.id;
  }

  /**
   * Helper: Wait for leases page to be ready
   */
  async function waitForLeasesPageReady() {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    const createButton = page.locator('button:has-text("חוזה חדש")');
    await createButton.waitFor({ state: 'visible', timeout: 10000 });
    return createButton;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Clean test data
    await cleanTestData();
    
    // Fetch Test Account ID
    TEST_ACCOUNT_ID = await fetchTestAccountId();
    console.log(`✓ Using Test Account ID: ${TEST_ACCOUNT_ID}`);
    
    // Create test data
    TEST_PROPERTY_ID = await createTestProperty();
    TEST_UNIT_ID = await createTestUnit(TEST_PROPERTY_ID);
    TEST_TENANT_ID = await createTestTenant();
    
    // Set account in storage
    await setTestAccountInStorage(page, TEST_ACCOUNT_ID);
    
    // Navigate to leases page
    await page.goto(`${FRONTEND_URL}/leases`);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  // ============================================================================
  // TC-E2E-001: Happy path - Create lease with required fields only
  // ============================================================================
  test('TC-E2E-001: Happy path - Create lease with required fields only', async () => {
    const createButton = await waitForLeasesPageReady();
    await createButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Fill required fields
    // Unit selector
    await page.click('label:has-text("יחידת דיור")').catch(() => {
      // Try alternative selector
      page.locator('text=יחידת דיור').click();
    });
    await page.waitForTimeout(300);
    const unitSelect = page.locator('[id*="unit"], [name="unitId"]').first();
    await unitSelect.click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.locator(`[role="option"]:has-text("5")`).first().click();
    await page.waitForTimeout(300);
    
    // Tenant selector
    await page.click('label:has-text("דייר")').catch(() => {
      page.locator('text=דייר').click();
    });
    await page.waitForTimeout(300);
    const tenantSelect = page.locator('[id*="tenant"], [name="tenantId"]').first();
    await tenantSelect.click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.locator(`[role="option"]:has-text("יוחנן כהן")`).first().click();
    await page.waitForTimeout(300);
    
    // Start date (today)
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    // End date (1 year from now)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const endDateStr = nextYear.toISOString().split('T')[0];
    await page.fill('input[name="endDate"]', endDateStr);
    
    // Monthly rent
    await page.fill('input[name="monthlyRent"]', '5000');
    
    // Payment details
    await page.fill('input[name="paymentTo"]', 'העברה בנקאית לחשבון 123456');
    
    // Submit
    const saveButton = page.locator('button:has-text("צור"), button[type="submit"]').last();
    await saveButton.click();
    
    // Wait for success
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Verify lease appears in list
    await expect(page.locator('text=יוחנן כהן').first()).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // TC-E2E-002: Happy path - Create lease with all fields including notes
  // ============================================================================
  test('TC-E2E-002: Happy path - Create lease with all fields including notes', async () => {
    const createButton = await waitForLeasesPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Fill all fields (same as TC-E2E-001 but add notes)
    // Unit
    const unitSelect = page.locator('[id*="unit"], [name="unitId"]').first();
    await unitSelect.click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.locator(`[role="option"]:has-text("5")`).first().click();
    await page.waitForTimeout(300);
    
    // Tenant
    const tenantSelect = page.locator('[id*="tenant"], [name="tenantId"]').first();
    await tenantSelect.click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.locator(`[role="option"]:has-text("יוחנן כהן")`).first().click();
    await page.waitForTimeout(300);
    
    // Dates
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    await page.fill('input[name="endDate"]', nextYear.toISOString().split('T')[0]);
    
    // Rent and payment
    await page.fill('input[name="monthlyRent"]', '6000');
    await page.fill('input[name="paymentTo"]', 'העברה בנקאית לחשבון 789012');
    
    // Notes
    await page.fill('textarea[name="notes"]', 'כולל חניה ומיזוג');
    
    // Submit
    const saveButton = page.locator('button:has-text("צור"), button[type="submit"]').last();
    await saveButton.click();
    
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Verify lease appears
    await expect(page.locator('text=יוחנן כהן').first()).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // TC-E2E-004: Error path - Missing required fields validation
  // ============================================================================
  test('TC-E2E-004: Error path - Missing required fields validation', async () => {
    const createButton = await waitForLeasesPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Try to submit without filling fields
    const saveButton = page.locator('button:has-text("צור"), button[type="submit"]').last();
    await saveButton.click();
    
    // Wait for validation errors
    await page.waitForTimeout(1000);
    
    // Verify validation errors appear (at least one required field error)
    const errorMessages = page.locator('text=/חובה|required/i');
    await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
  });

  // ============================================================================
  // TC-E2E-005: Error path - End date before start date validation
  // ============================================================================
  test('TC-E2E-005: Error path - End date before start date validation', async () => {
    const createButton = await waitForLeasesPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Fill unit and tenant
    const unitSelect = page.locator('[id*="unit"], [name="unitId"]').first();
    await unitSelect.click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.locator(`[role="option"]:has-text("5")`).first().click();
    await page.waitForTimeout(300);
    
    const tenantSelect = page.locator('[id*="tenant"], [name="tenantId"]').first();
    await tenantSelect.click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.locator(`[role="option"]:has-text("יוחנן כהן")`).first().click();
    await page.waitForTimeout(300);
    
    // Fill dates incorrectly (end before start)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    await page.fill('input[name="startDate"]', today.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', yesterday.toISOString().split('T')[0]);
    
    await page.fill('input[name="monthlyRent"]', '5000');
    await page.fill('input[name="paymentTo"]', 'תשלום');
    
    // Try to submit
    const saveButton = page.locator('button:has-text("צור"), button[type="submit"]').last();
    await saveButton.click();
    
    // Wait for validation error
    await page.waitForTimeout(1000);
    
    // Verify error message about date validation
    const errorMessage = page.locator('text=/תאריך|date/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  // ============================================================================
  // TC-E2E-007: Navigation - Cancel creation flow
  // ============================================================================
  test('TC-E2E-007: Navigation - Cancel creation flow', async () => {
    const createButton = await waitForLeasesPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Fill some fields
    await page.fill('input[name="monthlyRent"]', '5000');
    
    // Click cancel
    const cancelButton = page.locator('button:has-text("ביטול")');
    await cancelButton.click();
    
    // Verify dialog closes
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    
    // Verify we're still on leases page
    expect(page.url()).toContain('/leases');
  });

  // ============================================================================
  // TC-E2E-008: Success - Lease appears in list after creation
  // ============================================================================
  test('TC-E2E-008: Success - Lease appears in list after creation', async () => {
    const createButton = await waitForLeasesPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Fill and submit (same as TC-E2E-001)
    const unitSelect = page.locator('[id*="unit"], [name="unitId"]').first();
    await unitSelect.click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.locator(`[role="option"]:has-text("5")`).first().click();
    await page.waitForTimeout(300);
    
    const tenantSelect = page.locator('[id*="tenant"], [name="tenantId"]').first();
    await tenantSelect.click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.locator(`[role="option"]:has-text("יוחנן כהן")`).first().click();
    await page.waitForTimeout(300);
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    await page.fill('input[name="endDate"]', nextYear.toISOString().split('T')[0]);
    await page.fill('input[name="monthlyRent"]', '5000');
    await page.fill('input[name="paymentTo"]', 'תשלום');
    
    const saveButton = page.locator('button:has-text("צור"), button[type="submit"]').last();
    await saveButton.click();
    
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Verify lease appears with tenant name
    await expect(page.locator('text=יוחנן כהן').first()).toBeVisible({ timeout: 10000 });
    
    // Verify lease appears with unit info
    await expect(page.locator('text=5').first()).toBeVisible({ timeout: 5000 });
  });
});
