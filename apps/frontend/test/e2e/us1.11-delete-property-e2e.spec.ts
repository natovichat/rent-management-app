/**
 * US1.11 - Delete Property - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite written FIRST before implementation.
 * 
 * Test Coverage:
 * - TC-E2E-1.11-001: Happy path - Delete property from list actions (no units)
 * - TC-E2E-1.11-002: Happy path - Delete property from details page (no units)
 * - TC-E2E-1.11-003: Confirmation dialog - Shows confirmation dialog before deletion
 * - TC-E2E-1.11-004: Confirmation dialog - Cancel button closes dialog without deleting
 * - TC-E2E-1.11-005: Confirmation dialog - Confirm button proceeds with deletion
 * - TC-E2E-1.11-006: Error handling - Cannot delete property with associated units
 * - TC-E2E-1.11-007: Error message - Shows error message when deletion fails due to units
 * - TC-E2E-1.11-008: Success notification - Shows success message after successful deletion
 * - TC-E2E-1.11-009: Data refresh - Property removed from list after deletion
 * - TC-E2E-1.11-010: Navigation - Redirects to properties list after deletion from details page
 * - TC-E2E-1.11-011: Security - Multi-tenancy enforced (cannot delete other account's property)
 * - TC-E2E-1.11-012: Validation - Delete button only visible for own account's properties
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us1.11-delete-property-e2e.spec.ts
 * 
 * EXPECTED: ALL tests FAIL initially (TDD - feature not implemented yet)
 * This is CORRECT - tests written FIRST, implementation comes next!
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US1.11 - Delete Property (TDD)', () => {
  let testAccountId: string;
  let testPropertyId: string;
  let testPropertyWithUnitsId: string;

  test.beforeAll(async () => {
    console.log('\n=== SETTING UP TEST ACCOUNT ===');
    
    // Fetch test account
    const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
    const accounts = await accountsResponse.json();
    const testAccount = accounts.find((a: any) => a.id === 'test-account-1');
    if (!testAccount) {
      throw new Error('Test account "test-account-1" not found');
    }
    testAccountId = testAccount.id;
    console.log(`✓ Test account found: ${testAccountId}`);
  });

  test.beforeEach(async ({ page }) => {
    console.log('\n=== CLEANING TEST DATA ===');
    
    try {
      // Clean properties for test account
      console.log('→ Deleting properties for test account...');
      const propertiesResponse = await fetch(`${BACKEND_URL}/properties/test/cleanup`, {
        method: 'DELETE',
        headers: {
          'X-Account-Id': testAccountId,
        },
      });
      if (propertiesResponse.ok) {
        const result = await propertiesResponse.json();
        console.log(`✓ Deleted ${result.deletedCount || 0} properties`);
      }
    } catch (error) {
      console.warn('⚠️ Error during cleanup:', error);
    }

    // Create a test property WITHOUT units (can be deleted)
    console.log('→ Creating test property WITHOUT units (deletable)...');
    const createResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': testAccountId,
      },
      body: JSON.stringify({
        address: 'רחוב הרצל 123, תל אביב',
        fileNumber: 'TEST-DELETE-001',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        city: 'תל אביב',
        country: 'ישראל',
      }),
    });
    
    if (createResponse.ok) {
      const property = await createResponse.json();
      testPropertyId = property.id;
      console.log(`✓ Test property created (no units): ${testPropertyId}`);
    } else {
      throw new Error('Failed to create test property');
    }

    // Create a test property WITH units (cannot be deleted)
    console.log('→ Creating test property WITH units (non-deletable)...');
    const createWithUnitsResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': testAccountId,
      },
      body: JSON.stringify({
        address: 'רחוב דיזנגוף 50, תל אביב',
        fileNumber: 'TEST-DELETE-002',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        city: 'תל אביב',
        country: 'ישראל',
      }),
    });
    
    if (createWithUnitsResponse.ok) {
      const propertyWithUnits = await createWithUnitsResponse.json();
      testPropertyWithUnitsId = propertyWithUnits.id;
      console.log(`✓ Test property created (with units): ${testPropertyWithUnitsId}`);
      
      // Create a unit for this property
      console.log('→ Creating unit for property...');
      const unitResponse = await fetch(`${BACKEND_URL}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Account-Id': testAccountId,
        },
        body: JSON.stringify({
          propertyId: testPropertyWithUnitsId,
          apartmentNumber: '1',
          floor: 1,
          roomCount: 3,
        }),
      });
      
      if (unitResponse.ok) {
        const unit = await unitResponse.json();
        console.log(`✓ Unit created for property: ${unit.id}`);
      } else {
        const errorText = await unitResponse.text();
        console.error(`❌ Failed to create unit: ${unitResponse.status} ${errorText}`);
        throw new Error(`Failed to create unit for property: ${unitResponse.status}`);
      }
    }

    // Set test account in localStorage
    await setTestAccountInStorage(page, testAccountId);
  });

  test('TC-E2E-1.11-001-delete-from-list-actions', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-001: Delete Property from List Actions ===');
    
    console.log('→ Step 1: Navigate to properties list');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Verify property appears in list');
    const propertyAddress = page.locator(`text=רחוב הרצל 123, תל אביב`).first();
    await expect(propertyAddress).toBeVisible({ timeout: 10000 });
    console.log('✓ Property found in list');
    
    console.log('→ Step 3: Find delete button in actions column');
    // Find the DataGrid row containing the address, then find delete button
    const row = propertyAddress.locator('xpath=ancestor::div[contains(@class, "MuiDataGrid-row")]');
    const deleteButton = row.locator('button[aria-label="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Delete button found');
    
    console.log('→ Step 4: Click delete button');
    await deleteButton.click();
    
    console.log('→ Step 5: Verify confirmation dialog appears');
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await expect(confirmDialog.locator('text=מחיקת נכס')).toBeVisible();
    console.log('✓ Confirmation dialog displayed');
    
    console.log('→ Step 6: Confirm deletion and wait for responses');
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await expect(confirmButton).toBeVisible();
    
    // Set up response listeners BEFORE clicking
    const deleteResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/properties/') && response.request().method() === 'DELETE' && response.status() === 200,
      { timeout: 15000 }
    );
    
    const refetchResponsePromise = page.waitForResponse(
      (response) => {
        const url = response.url();
        return url.includes('/properties?') && 
               response.request().method() === 'GET' && 
               response.status() === 200;
      },
      { timeout: 20000 }
    );
    
    // Click and wait for both responses
    await Promise.all([
      confirmButton.click(),
      deleteResponsePromise,
    ]);
    console.log('✓ DELETE request completed');
    
    // Wait for refetch
    const refetchResponse = await refetchResponsePromise;
    console.log('✓ Properties list refetched');
    
    // Verify the deleted property is not in the response
    const responseData = await refetchResponse.json();
    const propertyExists = responseData.data?.some((p: any) => 
      p.address === 'רחוב הרצל 123, תל אביב' || p.id === testPropertyId
    );
    if (propertyExists) {
      throw new Error(`Property still exists in API response after deletion. Response: ${JSON.stringify(responseData.data)}`);
    }
    console.log('✓ Property not in API response');
    
    console.log('→ Step 7: Wait for success notification');
    const snackbarMessage = page.locator('.MuiSnackbar-root .MuiAlert-message');
    await expect(snackbarMessage).toBeVisible({ timeout: 10000 });
    await expect(snackbarMessage).toHaveText(/הנכס נמחק בהצלחה/);
    console.log('✓ Success notification displayed');
    
    console.log('→ Step 8: Verify property removed from list');
    // Wait for React to re-render and DataGrid to update
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    await page.waitForTimeout(1000); // Additional buffer for React re-render
    
    // Wait for the property text to disappear from the DOM
    await page.waitForFunction(
      (address) => {
        const textElements = Array.from(document.querySelectorAll('*'));
        return !textElements.some(el => (el.textContent || '').includes(address));
      },
      'רחוב הרצל 123, תל אביב',
      { timeout: 10000 }
    );
    
    // Final check - property should not be visible
    await expect(propertyAddress).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Property removed from list');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-002-delete-from-details-page', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-002: Delete Property from Details Page ===');
    
    console.log('→ Step 1: Navigate to property details page');
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Verify property details page loaded');
    await expect(page.locator('text=רחוב הרצל 123, תל אביב')).toBeVisible({ timeout: 10000 });
    console.log('✓ Property details page loaded');
    
    console.log('→ Step 3: Find delete button');
    const deleteButton = page.locator('button:has-text("מחק נכס"), button[aria-label*="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Delete button found');
    
    console.log('→ Step 4: Click delete button');
    await deleteButton.click();
    
    console.log('→ Step 5: Verify confirmation dialog appears');
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await expect(confirmDialog.locator('text=מחיקת נכס')).toBeVisible();
    console.log('✓ Confirmation dialog displayed');
    
    console.log('→ Step 6: Confirm deletion');
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await expect(confirmButton).toBeVisible();
    
    // Set up DELETE response listener BEFORE clicking
    const deleteResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/properties/') && response.request().method() === 'DELETE' && response.status() === 200,
      { timeout: 15000 }
    );
    
    // Click and wait for DELETE response
    await Promise.all([
      confirmButton.click(),
      deleteResponsePromise,
    ]);
    console.log('✓ DELETE request completed');
    
    console.log('→ Step 7: Wait for success notification');
    const snackbarMessage = page.locator('.MuiSnackbar-root .MuiAlert-message');
    await expect(snackbarMessage).toBeVisible({ timeout: 10000 });
    await expect(snackbarMessage).toHaveText(/הנכס נמחק בהצלחה/);
    console.log('✓ Success notification displayed');
    
    console.log('→ Step 8: Verify redirected to properties list');
    await expect(page).toHaveURL(new RegExp(`${FRONTEND_URL}/properties`), { timeout: 10000 });
    console.log('✓ Redirected to properties list');
    
    console.log('→ Step 9: Verify property not in list');
    // Wait for any refetch requests to complete
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for the property text to disappear from the DataGrid
    await page.waitForFunction(
      (address) => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const style = window.getComputedStyle(parent);
              if (style.display === 'none' || style.visibility === 'hidden') {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent?.includes(address)) {
            return false;
          }
        }
        return true;
      },
      'רחוב הרצל 123, תל אביב',
      { timeout: 15000 }
    );
    
    // Final check - property should not be visible
    await expect(page.locator('text=רחוב הרצל 123, תל אביב')).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Property removed from list');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-003-confirmation-dialog-shown', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-003: Confirmation Dialog Shown ===');
    
    console.log('→ Step 1: Navigate to properties list');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Click delete button');
    const propertyAddress = page.locator(`text=רחוב הרצל 123, תל אביב`).first();
    await expect(propertyAddress).toBeVisible({ timeout: 10000 });
    const row = propertyAddress.locator('xpath=ancestor::div[contains(@class, "MuiDataGrid-row")]');
    const deleteButton = row.locator('button[aria-label="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();
    
    console.log('→ Step 3: Verify confirmation dialog appears');
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    console.log('✓ Dialog visible');
    
    console.log('→ Step 4: Verify dialog title');
    await expect(confirmDialog.locator('text=מחיקת נכס')).toBeVisible();
    console.log('✓ Dialog title correct');
    
    console.log('→ Step 5: Verify dialog message contains property address');
    await expect(confirmDialog.locator('text=רחוב הרצל 123')).toBeVisible();
    console.log('✓ Dialog message shows property address');
    
    console.log('→ Step 6: Verify cancel button exists');
    const cancelButton = confirmDialog.locator('button:has-text("ביטול")');
    await expect(cancelButton).toBeVisible();
    console.log('✓ Cancel button found');
    
    console.log('→ Step 7: Verify confirm button exists');
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await expect(confirmButton).toBeVisible();
    console.log('✓ Confirm button found');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-004-confirmation-dialog-cancel', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-004: Confirmation Dialog Cancel ===');
    
    console.log('→ Step 1: Navigate to properties list');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Verify property exists in list');
    const propertyAddress = page.locator(`text=רחוב הרצל 123, תל אביב`).first();
    await expect(propertyAddress).toBeVisible({ timeout: 10000 });
    console.log('✓ Property found in list');
    
    console.log('→ Step 3: Click delete button');
    const row = propertyAddress.locator('xpath=ancestor::div[contains(@class, "MuiDataGrid-row")]');
    const deleteButton = row.locator('button[aria-label="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();
    
    console.log('→ Step 4: Verify confirmation dialog appears');
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    console.log('✓ Dialog visible');
    
    console.log('→ Step 5: Click cancel button');
    const cancelButton = confirmDialog.locator('button:has-text("ביטול")');
    await cancelButton.click();
    
    console.log('→ Step 6: Verify dialog closes');
    await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Dialog closed');
    
    console.log('→ Step 7: Verify property still in list');
    await expect(propertyAddress).toBeVisible({ timeout: 5000 });
    console.log('✓ Property still exists (not deleted)');
    
    console.log('→ Step 8: Verify no success notification');
    const snackbar = page.locator('.MuiSnackbar-root');
    await expect(snackbar).not.toBeVisible({ timeout: 2000 });
    console.log('✓ No notification shown (correct)');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-005-confirmation-dialog-confirm', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-005: Confirmation Dialog Confirm ===');
    
    console.log('→ Step 1: Navigate to properties list');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Click delete button');
    const propertyAddress = page.locator(`text=רחוב הרצל 123, תל אביב`).first();
    await expect(propertyAddress).toBeVisible({ timeout: 10000 });
    const row = propertyAddress.locator('xpath=ancestor::div[contains(@class, "MuiDataGrid-row")]');
    const deleteButton = row.locator('button[aria-label="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();
    
    console.log('→ Step 3: Verify confirmation dialog appears');
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    console.log('✓ Dialog visible');
    
    console.log('→ Step 4: Click confirm button');
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    
    // Set up DELETE response listener BEFORE clicking
    const deleteResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/properties/') && response.request().method() === 'DELETE' && response.status() === 200,
      { timeout: 15000 }
    );
    
    // Click and wait for DELETE response
    await Promise.all([
      confirmButton.click(),
      deleteResponsePromise,
    ]);
    console.log('✓ DELETE request completed');
    
    console.log('→ Step 5: Verify dialog closes');
    await expect(confirmDialog).not.toBeVisible({ timeout: 10000 });
    console.log('✓ Dialog closed');
    
    console.log('→ Step 6: Verify success notification');
    const snackbarMsg = page.locator('.MuiSnackbar-root .MuiAlert-message');
    await expect(snackbarMsg).toBeVisible({ timeout: 10000 });
    await expect(snackbarMsg).toHaveText(/הנכס נמחק בהצלחה/);
    console.log('✓ Success notification displayed');
    
    // Wait for snackbar to disappear
    await snackbarMsg.locator('xpath=ancestor::div[contains(@class, "MuiSnackbar-root")]').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
    
    console.log('→ Step 7: Verify property removed from list');
    // Wait for any refetch requests to complete
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for the property text to disappear from the DataGrid
    await page.waitForFunction(
      (address) => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const style = window.getComputedStyle(parent);
              if (style.display === 'none' || style.visibility === 'hidden') {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent?.includes(address)) {
            return false;
          }
        }
        return true;
      },
      'רחוב הרצל 123, תל אביב',
      { timeout: 15000 }
    );
    
    await expect(page.locator('text=רחוב הרצל 123, תל אביב')).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Property deleted successfully');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-006-cannot-delete-with-units', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-006: Cannot Delete Property with Units ===');
    
    console.log('→ Step 1: Navigate to properties list');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Verify property with units appears in list');
    const propertyAddress = page.locator(`text=רחוב דיזנגוף 50, תל אביב`).first();
    await expect(propertyAddress).toBeVisible({ timeout: 10000 });
    console.log('✓ Property with units found in list');
    
    console.log('→ Step 3: Find delete button');
    const row = propertyAddress.locator('xpath=ancestor::div[contains(@class, "MuiDataGrid-row")]');
    const deleteButton = row.locator('button[aria-label="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Delete button found');
    
    console.log('→ Step 4: Click delete button');
    await deleteButton.click();
    
    console.log('→ Step 5: Verify confirmation dialog appears');
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    console.log('✓ Confirmation dialog displayed');
    
    console.log('→ Step 6: Confirm deletion');
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await confirmButton.click();
    
    console.log('→ Step 7: Wait for error notification');
    const snackbar = page.locator('.MuiSnackbar-root .MuiAlert-message');
    await expect(snackbar).toBeVisible({ timeout: 10000 });
    await expect(snackbar).toHaveText(/לא ניתן למחוק נכס.*יחידות|יחידות.*נכס/);
    console.log('✓ Error notification displayed');
    
    console.log('→ Step 8: Verify property still in list');
    await page.waitForTimeout(2000);
    await expect(propertyAddress).toBeVisible({ timeout: 5000 });
    console.log('✓ Property still exists (not deleted)');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-007-error-message-with-units', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-007: Error Message When Deletion Fails Due to Units ===');
    
    console.log('→ Step 1: Navigate to property details page');
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyWithUnitsId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Click delete button');
    const deleteButton = page.locator('button:has-text("מחק נכס"), button[aria-label*="מחיקה"]').first();
    await deleteButton.click();
    
    console.log('→ Step 3: Confirm deletion');
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await confirmButton.click();
    
    console.log('→ Step 4: Verify error message displayed');
    const snackbar = page.locator('.MuiSnackbar-root .MuiAlert-message');
    await expect(snackbar).toBeVisible({ timeout: 10000 });
    
    // Error message should mention units
    const errorText = await snackbar.textContent();
    console.log(`→ Error message: "${errorText}"`);
    expect(errorText).toMatch(/לא ניתן|יחידות|נכס.*יחידות/);
    console.log('✓ Error message mentions units');
    
    console.log('→ Step 5: Verify error notification is error type (red)');
    const alert = page.locator('.MuiSnackbar-root .MuiAlert-root');
    await expect(alert).toHaveClass(/MuiAlert-standardError|MuiAlert-filledError/);
    console.log('✓ Error notification styled correctly');
    
    console.log('→ Step 6: Verify still on details page (not redirected)');
    await expect(page).toHaveURL(new RegExp(`${FRONTEND_URL}/properties/${testPropertyWithUnitsId}`), { timeout: 5000 });
    console.log('✓ Still on details page (correct behavior)');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-008-success-notification', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-008: Success Notification After Deletion ===');
    
    console.log('→ Step 1: Navigate to properties list');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Delete property');
    const propertyAddress = page.locator(`text=רחוב הרצל 123, תל אביב`).first();
    await expect(propertyAddress).toBeVisible({ timeout: 10000 });
    const row = propertyAddress.locator('xpath=ancestor::div[contains(@class, "MuiDataGrid-row")]');
    const deleteButton = row.locator('button[aria-label="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();
    
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await confirmButton.click();
    
    console.log('→ Step 3: Verify success notification appears');
    const snackbar = page.locator('.MuiSnackbar-root');
    await expect(snackbar).toBeVisible({ timeout: 10000 });
    console.log('✓ Snackbar visible');
    
    console.log('→ Step 4: Verify success message text');
    const message = snackbar.locator('.MuiAlert-message');
    await expect(message).toHaveText(/הנכס נמחק בהצלחה/);
    console.log('✓ Success message correct');
    
    console.log('→ Step 5: Verify success notification is success type (green)');
    const alert = snackbar.locator('.MuiAlert-root');
    await expect(alert).toHaveClass(/MuiAlert-standardSuccess|MuiAlert-filledSuccess/);
    console.log('✓ Success notification styled correctly');
    
    console.log('→ Step 6: Verify notification auto-dismisses after timeout');
    await expect(snackbar).not.toBeVisible({ timeout: 7000 });
    console.log('✓ Notification auto-dismissed');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-009-property-removed-from-list', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-009: Property Removed from List After Deletion ===');
    
    console.log('→ Step 1: Navigate to properties list');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Verify property exists in list');
    const propertyAddress = page.locator(`text=רחוב הרצל 123, תל אביב`).first();
    await expect(propertyAddress).toBeVisible({ timeout: 10000 });
    console.log('✓ Property found in list');
    
    console.log('→ Step 3: Delete property');
    const row = propertyAddress.locator('xpath=ancestor::div[contains(@class, "MuiDataGrid-row")]');
    const deleteButton = row.locator('button[aria-label="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();
    
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    
    console.log('→ Step 4: Confirm deletion');
    // Set up DELETE response listener BEFORE clicking
    const deleteResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/properties/') && response.request().method() === 'DELETE' && response.status() === 200,
      { timeout: 15000 }
    );
    
    // Click and wait for DELETE response
    await Promise.all([
      confirmButton.click(),
      deleteResponsePromise,
    ]);
    console.log('✓ DELETE request completed');
    
    // Wait for success notification (indicates mutation completed and invalidation happened)
    const snackbarMessage = page.locator('.MuiSnackbar-root .MuiAlert-message');
    await expect(snackbarMessage).toBeVisible({ timeout: 10000 });
    await expect(snackbarMessage).toHaveText(/הנכס נמחק בהצלחה/);
    console.log('✓ Success notification displayed');
    
    // Wait for snackbar to disappear (indicates UI has processed the update)
    await snackbarMessage.locator('xpath=ancestor::div[contains(@class, "MuiSnackbar-root")]').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
    
    console.log('→ Step 5: Verify property removed from list');
    // Wait for any refetch requests to complete
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for the property text to disappear from the DataGrid
    // Use a more robust check that waits for the DataGrid to update
    await page.waitForFunction(
      (address) => {
        // Check all visible text in the document
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              // Skip hidden elements
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const style = window.getComputedStyle(parent);
              if (style.display === 'none' || style.visibility === 'hidden') {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent?.includes(address)) {
            return false; // Property still found
          }
        }
        return true; // Property not found
      },
      'רחוב הרצל 123, תל אביב',
      { timeout: 15000 }
    );
    
    // Final check - property should not be visible
    await expect(propertyAddress).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Property removed from list');
    
    console.log('→ Step 6: Verify list still shows other properties');
    const otherProperty = page.locator(`text=רחוב דיזנגוף 50, תל אביב`);
    await expect(otherProperty).toBeVisible({ timeout: 5000 });
    console.log('✓ Other properties still visible');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-010-redirect-after-deletion', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-010: Redirect to List After Deletion from Details Page ===');
    
    console.log('→ Step 1: Navigate to property details page');
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Verify on details page');
    await expect(page).toHaveURL(new RegExp(`${FRONTEND_URL}/properties/${testPropertyId}`), { timeout: 10000 });
    console.log('✓ On details page');
    
    console.log('→ Step 3: Delete property');
    const deleteButton = page.locator('button:has-text("מחק נכס"), button[aria-label*="מחיקה"]').first();
    await deleteButton.click();
    
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const confirmButton = confirmDialog.locator('button:has-text("מחק")').filter({ hasNotText: 'מוחק' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await confirmButton.click();
    
    console.log('→ Step 4: Wait for redirect');
    await page.waitForTimeout(2000);
    
    console.log('→ Step 5: Verify redirected to properties list');
    await expect(page).toHaveURL(new RegExp(`${FRONTEND_URL}/properties`), { timeout: 10000 });
    console.log('✓ Redirected to properties list');
    
    console.log('→ Step 6: Verify properties list page loaded');
    // Check for DataGrid component (more reliable than text)
    const dataGrid = page.locator('[class*="MuiDataGrid-root"]').first();
    await expect(dataGrid).toBeVisible({ timeout: 10000 });
    console.log('✓ Properties list page loaded');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-011-multi-tenancy-enforced', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-011: Multi-Tenancy Enforced ===');
    
    console.log('→ Step 1: Create property for different account');
    // Get a different account (not test-account-1)
    const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
    const accounts = await accountsResponse.json();
    const otherAccount = accounts.find((a: any) => a.id !== 'test-account-1');
    
    if (!otherAccount) {
      console.log('⚠️ No other account found - skipping multi-tenancy test');
      test.skip();
      return;
    }
    
    // Create property for other account
    const createResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': otherAccount.id,
      },
      body: JSON.stringify({
        address: 'נכס של חשבון אחר',
        fileNumber: 'OTHER-001',
      }),
    });
    
    let otherAccountPropertyId: string;
    if (createResponse.ok) {
      const property = await createResponse.json();
      otherAccountPropertyId = property.id;
      console.log(`✓ Property created for other account: ${otherAccountPropertyId}`);
    } else {
      throw new Error('Failed to create property for other account');
    }
    
    console.log('→ Step 2: Navigate to properties list (test account)');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 3: Verify other account property NOT visible');
    await expect(page.locator('text=נכס של חשבון אחר')).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Other account property not visible (correct)');
    
    console.log('→ Step 4: Try to access other account property directly via URL');
    await page.goto(`${FRONTEND_URL}/properties/${otherAccountPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 5: Verify property not accessible (404 or redirect)');
    // Should either show 404 or redirect to list
    const currentUrl = page.url();
    const is404 = currentUrl.includes('404') || page.locator('text=לא נמצא').isVisible();
    const isRedirected = currentUrl.includes('/properties') && !currentUrl.includes(otherAccountPropertyId);
    
    expect(is404 || isRedirected).toBeTruthy();
    console.log('✓ Property not accessible (multi-tenancy enforced)');
    
    // Cleanup: Delete other account property
    try {
      await fetch(`${BACKEND_URL}/properties/${otherAccountPropertyId}`, {
        method: 'DELETE',
        headers: {
          'X-Account-Id': otherAccount.id,
        },
      });
    } catch (error) {
      // Ignore cleanup errors
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.11-012-delete-button-visibility', async ({ page }) => {
    console.log('\n=== TC-E2E-1.11-012: Delete Button Visibility ===');
    
    console.log('→ Step 1: Navigate to properties list');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 2: Verify delete button visible for own account properties');
    const propertyAddress = page.locator(`text=רחוב הרצל 123, תל אביב`).first();
    await expect(propertyAddress).toBeVisible({ timeout: 10000 });
    
    const row = propertyAddress.locator('xpath=ancestor::div[contains(@class, "MuiDataGrid-row")]');
    const deleteButton = row.locator('button[aria-label="מחיקה"]').first();
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Delete button visible for own account property');
    
    console.log('→ Step 3: Navigate to property details page');
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Step 4: Verify delete button visible on details page');
    const detailsDeleteButton = page.locator('button:has-text("מחק נכס"), button[aria-label*="מחיקה"]').first();
    await expect(detailsDeleteButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Delete button visible on details page');
    
    console.log('✓ Test completed successfully\n');
  });
});
