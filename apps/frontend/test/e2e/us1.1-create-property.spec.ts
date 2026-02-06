import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { getTestAccount, selectTestAccount, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

/**
 * US1.1: Create Property
 * 
 * As a property owner,
 * I can create a new property with complete information including all property fields,
 * So that I can start tracking my property portfolio with comprehensive data.
 * 
 * Based on requirements from: docs/project_management/EPIC_01_PROPERTY_MANAGEMENT.md
 * Entity definition: docs/project_management/entities/01_Property.md
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

  // Fetch test account ID from database
  console.log('=== FETCHING TEST ACCOUNT ID FROM DATABASE ===');
  const testAccount = await getTestAccount();
  console.log(`✓ Found Test Account with ID: ${testAccount.id}`);
  console.log(`✓ Using Test Account ID: ${testAccount.id}`);
});

// Clean up test data after each test
test.afterEach(async () => {
  console.log('=== CLEANING TEST DATA ===');
  try {
    // Get test account properties
    const testAccount = await getTestAccount();
    
    if (testAccount) {
      const propertiesResponse = await fetch(`${BACKEND_URL}/properties?accountId=${testAccount.id}`);
      
      if (propertiesResponse.ok) {
        const properties = await propertiesResponse.json();
        
        // Ensure properties is an array
        if (Array.isArray(properties)) {
          // Delete all test properties
          for (const property of properties) {
            await fetch(`${BACKEND_URL}/properties/${property.id}`, {
              method: 'DELETE',
            });
          }
          console.log(`✓ Cleaned test data: ${properties.length} properties deleted`);
        } else {
          console.log('✓ No properties to clean (response not an array)');
        }
      } else {
        console.log('✓ No properties to clean (response not ok)');
      }
    }
  } catch (error) {
    console.error('⚠️ Error cleaning test data:', error);
  }
});

test.describe('US1.1 - Create Property (TDD)', () => {
  // Configure tests to run serially to avoid database reset race conditions
  test.describe.configure({ mode: 'serial' });
  
  test('TC-E2E-1.1-001-create-with-required-fields', async ({ page }) => {
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    
    // Wait for page load
    await page.waitForSelector('body');
    
    // Select the test account (test-account-1)
    await selectTestAccount(page);
    
    // Click "New Property" button (use .first() to avoid strict mode violation with DataGrid row)
    const createButton = page.locator('button:has-text("נכס חדש")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    // Wait for create dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill required field: address
    const addressField = page.locator('input[name="address"]');
    await expect(addressField).toBeVisible({ timeout: 5000 });
    await addressField.fill('רחוב הרצל 1, תל אביב');
    
    // Submit form
    const saveButton = page.locator('button:has-text("שמירה")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {
      console.log('Dialog did not close, checking for success anyway');
    });
    
    // Wait a bit for property to appear in list
    await page.waitForTimeout(2000);
    
    // Verify property appears in list (use first() to handle multiple matches)
    await expect(page.locator('text=רחוב הרצל 1, תל אביב').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-1.1-002-create-with-all-fields', async ({ page }) => {
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForSelector('body');
    
    // Select the test account (test-account-1)
    await selectTestAccount(page);
    
    // Click "New Property" button (use .first() to avoid strict mode violation with DataGrid row)
    const createButton = page.locator('button:has-text("נכס חדש")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    // Wait for create dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill basic information fields (in מידע בסיסי accordion - expanded by default)
    await page.locator('input[name="address"]').fill('רחוב רוטשילד 50, תל אביב');
    await page.locator('input[name="fileNumber"]').fill('TLV-2024-001');
    
    // Select property type (click the visible dropdown div)
    await page.locator('[data-testid="property-type-select"]').click();
    await page.locator('li[data-value="RESIDENTIAL"]').click();
    
    // Select property status
    await page.locator('[data-testid="property-status-select"]').click();
    await page.locator('li[data-value="OWNED"]').click();
    
    await page.locator('input[name="city"]').fill('תל אביב');
    await page.locator('input[name="country"]').fill('ישראל');
    
    // Submit form
    const saveButton = page.locator('button:has-text("שמירה")');
    await saveButton.click();
    
    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {
      console.log('Dialog did not close, checking for success anyway');
    });
    
    // Wait a bit for property to appear
    await page.waitForTimeout(2000);
    
    // Verify property appears in list with address (use first() to handle multiple matches)
    await expect(page.locator('text=רחוב רוטשילד 50, תל אביב').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-1.1-003-validation-address-required', async ({ page }) => {
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    
    // Click "New Property" button (use .first() to avoid strict mode violation with DataGrid row)
    const createButton = page.locator('button:has-text("נכס חדש")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    // Wait for create dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Try to submit without filling required field
    const saveButton = page.locator('button:has-text("שמירה")');
    await saveButton.click();
    
    // Verify error message appears (MUI shows helper text or error state)
    const addressField = page.locator('input[name="address"]');
    await expect(addressField).toHaveAttribute('aria-invalid', 'true', { timeout: 5000 });
  });

  test('TC-E2E-1.1-004-view-created-property-in-list', async ({ page }) => {
    // First, create a property via API
    const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
    const accounts = await accountsResponse.json();
    const testAccount = accounts[0];
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: testAccount.id,
        address: 'רחוב דיזנגוף 100, תל אביב',
        country: 'ישראל',
      }),
    });
    
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    
    // Verify property appears in list (use first() to handle multiple matches)
    await expect(page.locator('text=רחוב דיזנגוף 100, תל אביב').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-1.1-005-create-multiple-properties', async ({ page }) => {
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    
    // Create first property
    await page.locator('button:has-text("נכס חדש")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await page.locator('input[name="address"]').fill('רחוב בן גוריון 1, חיפה');
    await page.locator('button:has-text("שמירה")').click();
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    // Create second property
    await page.locator('button:has-text("נכס חדש")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await page.locator('input[name="address"]').fill('רחוב ירושלים 2, באר שבע');
    await page.locator('button:has-text("שמירה")').click();
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    // Verify both properties appear in list (use first() to handle multiple matches)
    await expect(page.locator('text=רחוב בן גוריון 1, חיפה').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=רחוב ירושלים 2, באר שבע').first()).toBeVisible({ timeout: 10000 });
  });
});
