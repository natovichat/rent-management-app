import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { getTestAccount, getAccountById, selectTestAccount, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

/**
 * US1.1.2: Account Selector & Multi-Account Filtering
 * 
 * As a user with multiple accounts,
 * I can select an account from the account selector in the main screen anpld see only properties (and other data) belonging to that account,
 * So that I can manage multiple portfolios separately and view data specific to each account.
 * 
 * Based on requirements from:
 * - docs/project_management/US1.1.2_ACCOUNT_SELECTOR.md
 * - docs/project_management/EPIC_01_PROPERTY_MANAGEMENT.md
 */

// Reset database before each test
test.beforeEach(async () => {
  console.log('=== RESETTING DATABASE (npm run db:reset:force) ===');
  try {
    execSync('npm run db:reset:force', {
      cwd: '/Users/aviad.natovich/personal/rentApplication', // Run from project root
      stdio: 'inherit',
    });
    console.log('✓ Database reset complete - only Test Account remains');
  } catch (error) {
    console.error('⚠️ Failed to reset database:', error);
    throw error;
  }

  // Fetch test account ID
  console.log('=== FETCHING TEST ACCOUNT ID FROM DATABASE ===');
  const testAccount = await getTestAccount();
  console.log(`✓ Found Test Account with ID: ${testAccount.id}`);
  console.log(`✓ Using Test Account ID: ${testAccount.id}`);
});

test.describe('US1.1.2 - Account Selector & Multi-Account Filtering (TDD)', () => {
  // Configure tests to run serially to avoid database reset race conditions
  test.describe.configure({ mode: 'serial' });
  
  test('TC-E2E-1.1.2-001-account-selector-visible', async ({ page }) => {
    /**
     * Acceptance Criteria:
     * - Account selector component visible in main header/navigation
     * - Account selector displays all accounts from database (GET /accounts)
     * - Account selector shows account name and identifier
     */
    
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    
    // Wait for page load
    await page.waitForSelector('body');
    
    // Verify account selector is visible
    const accountSelector = page.locator('[aria-label*="חשבון"], [data-testid="account-selector"], .MuiSelect-select:has-text("חשבון")').first();
    await expect(accountSelector).toBeVisible({ timeout: 15000 });
    
    // Click account selector to open dropdown
    await accountSelector.click();
    
    // Verify dropdown opens with options
    const accountOptions = page.locator('[role="option"]');
    await expect(accountOptions.first()).toBeVisible({ timeout: 5000 });
    
    // Verify at least one account is displayed
    const optionCount = await accountOptions.count();
    expect(optionCount).toBeGreaterThan(0);
  });

  test('TC-E2E-1.1.2-002-switching-accounts-filters-properties', async ({ page }) => {
    /**
     * Acceptance Criteria:
     * - Properties list filters by selectedAccountId
     * - Changing account refreshes all lists automatically
     */
    
    // Create a second test account via API (check if exists first)
    console.log('=== CREATING TEST ACCOUNT: Test Account 2 ===');
    let allAccounts = await (await fetch(`${BACKEND_URL}/accounts`)).json();
    let account2 = allAccounts.find((a: any) => a.id === 'test-account-2');
    
    if (!account2) {
      const createAccountResponse = await fetch(`${BACKEND_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'test-account-2',
          name: 'Test Account 2',
          status: 'ACTIVE',
        }),
      });
      
      if (!createAccountResponse.ok) {
        const errorText = await createAccountResponse.text();
        throw new Error(`Failed to create second test account: ${createAccountResponse.status} - ${errorText}`);
      }
      
      account2 = await createAccountResponse.json();
      console.log(`✓ Created Test Account 2 with ID: ${account2.id}`);
    } else {
      console.log(`✓ Test Account 2 already exists with ID: ${account2.id}`);
    }
    
    // Get both accounts
    const account1 = await getAccountById('test-account-1');
    const account2Data = await getAccountById('test-account-2');
    
    // Create properties for each account
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: account1.id,
        address: 'נכס חשבון 1 - רחוב הרצל 1',
        country: 'ישראל',
      }),
    });
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: account2Data.id,
        address: 'נכס חשבון 2 - רחוב רוטשילד 2',
        country: 'ישראל',
      }),
    });
    
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForTimeout(2000);
    
    // Select test-account-1 explicitly (in case default is different)
    await selectTestAccount(page);
    
    // Verify we see property from account 1
    await expect(page.locator('text=רחוב הרצל 1').first()).toBeVisible({ timeout: 10000 });
    
    // Should NOT see property from account 2
    await expect(page.locator('text=רחוב רוטשילד 2').first()).not.toBeVisible({ timeout: 5000 });
    
    // Switch to account 2
    const accountSelector2 = page.locator('[aria-label*="חשבון"], [data-testid="account-selector"], .MuiSelect-select').first();
    await accountSelector2.click();
    await page.waitForTimeout(500);
    
    // Select account 2 using data-value
    const account2Option = page.locator('[role="option"][data-value="test-account-2"]');
    await account2Option.click();
    
    // Wait for data to refresh
    await page.waitForTimeout(2000);
    
    // Verify we now see property from account 2
    await expect(page.locator('text=רחוב רוטשילד 2').first()).toBeVisible({ timeout: 10000 });
    
    // Should NOT see property from account 1
    await expect(page.locator('text=רחוב הרצל 1').first()).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-E2E-1.1.2-003-selected-account-persists', async ({ page }) => {
    /**
     * Acceptance Criteria:
     * - Selected account persists across page navigation
     * - AccountContext provides consistent selectedAccountId
     */
    
    // Create second account
    await fetch(`${BACKEND_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'test-account-2',
        name: 'Test Account 2',
        status: 'ACTIVE',
      }),
    });
    
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForTimeout(1000);
    
    // Select second account
    const accountSelector = page.locator('[aria-label*="חשבון"], [data-testid="account-selector"], .MuiSelect-select').first();
    await accountSelector.click();
    
    const accountOptions = page.locator('[role="option"]');
    const secondAccountText = await accountOptions.nth(1).textContent();
    await accountOptions.nth(1).click();
    
    await page.waitForTimeout(1000);
    
    // Navigate to a different page (e.g., home or dashboard)
    await page.goto(`${FRONTEND_URL}/`);
    await page.waitForTimeout(1000);
    
    // Navigate back to properties
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForTimeout(1000);
    
    // Verify same account is still selected
    const currentAccountText = await page.locator('[aria-label*="חשבון"], [data-testid="account-selector"], .MuiSelect-select').first().textContent();
    
    // Account name should be in the current text
    expect(currentAccountText).toContain(secondAccountText?.trim() || 'Test Account 2');
  });

  test('TC-E2E-1.1.2-004-default-account-selected', async ({ page }) => {
    /**
     * Acceptance Criteria:
     * - Default account selected on application load (first account or last selected)
     * - Account selector has clear visual indicator of selected account
     */
    
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForTimeout(1000);
    
    // Verify account selector shows a selected account (not empty)
    const accountSelector = page.locator('[aria-label*="חשבון"], [data-testid="account-selector"], .MuiSelect-select').first();
    await expect(accountSelector).toBeVisible({ timeout: 10000 });
    
    const selectedText = await accountSelector.textContent();
    expect(selectedText).toBeTruthy(); // Should have text (account name)
    expect(selectedText?.length).toBeGreaterThan(0);
  });

  test('TC-E2E-1.1.2-005-keyboard-navigation-works', async ({ page }) => {
    /**
     * Acceptance Criteria:
     * - Account selector is accessible (keyboard navigation, screen reader)
     */
    
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForTimeout(1000);
    
    // Focus on the account selector by clicking on it
    const accountSelector = page.locator('[aria-label*="חשבון"], [data-testid="account-selector"], .MuiSelect-select').first();
    await accountSelector.click();
    await page.waitForTimeout(500);
    
    // Verify dropdown opened
    const accountOptions = page.locator('[role="option"]');
    await expect(accountOptions.first()).toBeVisible({ timeout: 5000 });
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Verify selection changed (dropdown closed)
    await expect(accountOptions.first()).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-E2E-1.1.2-006-mobile-viewport-works', async ({ page }) => {
    /**
     * Acceptance Criteria:
     * - Account selector works on mobile/tablet
     */
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForTimeout(1000);
    
    // Verify account selector is visible on mobile
    const accountSelector = page.locator('[aria-label*="חשבון"], [data-testid="account-selector"], .MuiSelect-select').first();
    await expect(accountSelector).toBeVisible({ timeout: 10000 });
    
    // Click account selector
    await accountSelector.click();
    
    // Verify dropdown works
    const accountOptions = page.locator('[role="option"]');
    await expect(accountOptions.first()).toBeVisible({ timeout: 5000 });
    
    // Verify can select an option
    await accountOptions.first().click();
    
    // Verify dropdown closed
    await expect(accountOptions.first()).not.toBeVisible({ timeout: 5000 });
  });
});
