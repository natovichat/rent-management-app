import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { getTestAccount, setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

/**
 * US1.5: Mark Property Mortgage Status
 * 
 * As a property owner,
 * I can mark whether a property is mortgaged (משועבד),
 * So that I can quickly identify which properties have mortgage obligations.
 * 
 * Acceptance Criteria:
 * 1. Form includes checkbox for "Is Mortgaged" (משועבד)
 * 2. Checkbox defaults to false
 * 3. Value is saved to Property.isMortgaged field
 * 4. Property list displays visual indicator for mortgaged properties
 * 5. Property details page shows mortgage status
 * 6. Status can be updated after creation
 * 
 * Based on requirements from: docs/project_management/EPIC_01_PROPERTY_MANAGEMENT.md
 * 
 * TDD Phase 0: Tests written BEFORE implementation
 * Expected: All tests will FAIL initially (this is correct!)
 */

test.describe.configure({ mode: 'serial' });

/**
 * Helper function to fetch properties and handle paginated response
 */
async function fetchProperties(accountId: string) {
  const response = await fetch(`${BACKEND_URL}/properties?accountId=${accountId}`, {
    headers: { 'X-Account-Id': accountId },
  });
  expect(response.ok).toBe(true);
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

test.describe('US1.5 - Mark Property Mortgage Status (TDD)', () => {
  let testAccount: any;

  // Reset database before each test
  test.beforeEach(async () => {
    console.log('=== RESETTING DATABASE (npm run db:reset:force) ===');
    try {
      execSync('npm run db:reset:force', {
        cwd: '/Users/aviad.natovich/personal/rentApplication',
        stdio: 'inherit',
      });
      console.log('✓ Database reset complete - only Test Account remains');
    } catch (error) {
      console.error('⚠️ Failed to reset database:', error);
      throw error;
    }

    // Fetch test account ID from database
    console.log('=== FETCHING TEST ACCOUNT ID FROM DATABASE ===');
    testAccount = await getTestAccount();
    console.log(`✓ Found Test Account with ID: ${testAccount.id}`);
  });

  test('TC-E2E-1.5-001-mortgage-checkbox-exists', async ({ page }) => {
    console.log('=== TC-E2E-1.5-001: Verify mortgage checkbox exists in form ===');
    
    // Listen for console messages
    page.on('console', msg => {
      console.log(`[BROWSER]:`, msg.text());
    });
    
    // Set test account in localStorage (this navigates to frontend and sets account)
    await setTestAccountInStorage(page, testAccount.id);
    
    // Now navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');

    // Click "New Property" button
    const createButton = page.locator('button:has-text("נכס חדש")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // Wait for create dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✓ Create property dialog opened');

    // Fill required field: address
    const addressField = page.locator('input[name="address"]');
    await expect(addressField).toBeVisible({ timeout: 5000 });
    await addressField.fill('רחוב הרצל 1, תל אביב');
    console.log('✓ Address field filled');

    // Expand "בעלות" (Ownership) accordion to reveal mortgage checkbox
    console.log('→ Expanding Ownership accordion...');
    const ownershipAccordion = page.locator('[data-testid="accordion-בעלות"]');
    const ownershipSummary = page.locator('[data-testid="accordion-summary-בעלות"]');
    const isExpanded = await ownershipAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await ownershipSummary.click();
      await page.waitForTimeout(500); // Wait for accordion to expand
      console.log('✓ Ownership accordion expanded');
    }

    // Verify "Is Mortgaged" (משועבד) checkbox exists
    console.log('→ Looking for mortgage checkbox (משועבד)...');
    // MUI Checkbox: Use getByRole which works with FormControlLabel
    const mortgageCheckbox = page.getByRole('checkbox', { name: /הנכס משועבד/i });
    await expect(mortgageCheckbox).toBeVisible({ timeout: 5000 });
    console.log('✓ Mortgage checkbox found and visible');
  });

  test('TC-E2E-1.5-002-checkbox-defaults-unchecked', async ({ page }) => {
    console.log('=== TC-E2E-1.5-002: Verify checkbox defaults to unchecked ===');
    
    // Listen for console messages
    page.on('console', msg => {
      console.log(`[BROWSER]:`, msg.text());
    });
    
    // Set test account in localStorage (this navigates to frontend and sets account)
    await setTestAccountInStorage(page, testAccount.id);

    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');

    // Click "New Property" button
    const createButton = page.locator('button:has-text("נכס חדש")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // Wait for create dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✓ Create property dialog opened');

    // Fill required field: address
    const addressField = page.locator('input[name="address"]');
    await expect(addressField).toBeVisible({ timeout: 5000 });
    await addressField.fill('רחוב הרצל 1, תל אביב');
    console.log('✓ Address field filled');

    // Expand "בעלות" (Ownership) accordion
    console.log('→ Expanding Ownership accordion...');
    const ownershipAccordion = page.locator('[data-testid="accordion-בעלות"]');
    const ownershipSummary = page.locator('[data-testid="accordion-summary-בעלות"]');
    const isExpanded = await ownershipAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await ownershipSummary.click();
      await page.waitForTimeout(500);
      console.log('✓ Ownership accordion expanded');
    }

    // Verify checkbox is unchecked by default
    console.log('→ Checking if mortgage checkbox is unchecked by default...');
    const mortgageCheckbox = page.getByRole('checkbox', { name: /הנכס משועבד/i });
    await expect(mortgageCheckbox).toBeVisible({ timeout: 5000 });
    
    // Check if checkbox is checked (should be false)
    const isChecked = await mortgageCheckbox.isChecked();
    expect(isChecked).toBe(false);
    console.log('✓ Mortgage checkbox is unchecked by default (isChecked = false)');

    // Also verify via form state (if accessible)
    const checkboxValue = await mortgageCheckbox.getAttribute('checked');
    expect(checkboxValue).toBeNull(); // No checked attribute means unchecked
    console.log('✓ Checkbox has no checked attribute (defaults to false)');
  });

  test('TC-E2E-1.5-003-create-mortgaged-property', async ({ page }) => {
    console.log('=== TC-E2E-1.5-003: Create property with isMortgaged=true ===');
    
    // Listen for console messages
    page.on('console', msg => {
      console.log(`[BROWSER]:`, msg.text());
    });
    
    // Listen for network requests
    page.on('request', request => {
      if (request.url().includes('/properties')) {
        console.log(`[NETWORK REQUEST]:`, request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/properties')) {
        console.log(`[NETWORK RESPONSE]:`, response.status(), response.url());
      }
    });
    
    // Set test account in localStorage (this navigates to frontend and sets account)
    await setTestAccountInStorage(page, testAccount.id);

    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');

    // Click "New Property" button
    const createButton = page.locator('button:has-text("נכס חדש")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // Wait for create dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✓ Create property dialog opened');

    // Fill required field: address
    const addressField = page.locator('input[name="address"]');
    await expect(addressField).toBeVisible({ timeout: 5000 });
    await addressField.fill('רחוב דיזנגוף 100, תל אביב');
    console.log('✓ Address field filled');

    // Expand "בעלות" (Ownership) accordion
    console.log('→ Expanding Ownership accordion...');
    const ownershipAccordion = page.locator('[data-testid="accordion-בעלות"]');
    const ownershipSummary = page.locator('[data-testid="accordion-summary-בעלות"]');
    const isExpanded = await ownershipAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await ownershipSummary.click();
      await page.waitForTimeout(500);
      console.log('✓ Ownership accordion expanded');
    }

    // Check the mortgage checkbox
    console.log('→ Checking mortgage checkbox...');
    const mortgageCheckbox = page.getByRole('checkbox', { name: /הנכס משועבד/i });
    await expect(mortgageCheckbox).toBeVisible({ timeout: 5000 });
    await mortgageCheckbox.check();
    console.log('✓ Mortgage checkbox checked');

    // Verify checkbox is now checked
    const isChecked = await mortgageCheckbox.isChecked();
    expect(isChecked).toBe(true);
    console.log('✓ Verified checkbox is checked (isChecked = true)');

    // Submit form
    console.log('=== SUBMITTING FORM ===');
    const saveButton = page.locator('button:has-text("שמירה")');
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();
    console.log('✓ Save button clicked');

    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {
      console.log('⚠️ Dialog did not close within 15s, checking for success anyway');
    });

    // Wait for success notification
    console.log('→ Waiting for success notification...');
    await expect(page.locator('text=הנכס נוסף בהצלחה').or(page.locator('text=Property added successfully'))).toBeVisible({ timeout: 10000 }).catch(() => {
      console.log('⚠️ Success notification not found, but continuing...');
    });

    // Wait for property to appear in list
    console.log('=== WAITING FOR PROPERTY IN LIST ===');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=רחוב דיזנגוף 100, תל אביב').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Property visible in list');

    // Verify data was saved correctly via API
    console.log('=== VERIFYING VIA API ===');
    const properties = await fetchProperties(testAccount.id);
    console.log(`✓ Fetched ${properties.length} properties`);
    const createdProperty = properties.find((p: any) => p.address === 'רחוב דיזנגוף 100, תל אביב');
    
    console.log('Created property:', createdProperty ? 'FOUND' : 'NOT FOUND');
    expect(createdProperty).toBeDefined();
    expect(createdProperty.isMortgaged).toBe(true);
    console.log('✓ Property saved with isMortgaged=true verified in API response');
  });

  test('TC-E2E-1.5-004-create-unmortgaged-property', async ({ page }) => {
    console.log('=== TC-E2E-1.5-004: Create property with isMortgaged=false ===');
    
    // Listen for console messages
    page.on('console', msg => {
      console.log(`[BROWSER]:`, msg.text());
    });
    
    // Set test account in localStorage (this navigates to frontend and sets account)
    await setTestAccountInStorage(page, testAccount.id);

    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');

    // Click "New Property" button
    const createButton = page.locator('button:has-text("נכס חדש")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // Wait for create dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✓ Create property dialog opened');

    // Fill required field: address
    const addressField = page.locator('input[name="address"]');
    await expect(addressField).toBeVisible({ timeout: 5000 });
    await addressField.fill('רחוב בן גוריון 5, חיפה');
    console.log('✓ Address field filled');

    // DO NOT check the mortgage checkbox (it should default to false)
    console.log('→ Leaving mortgage checkbox unchecked (defaults to false)');

    // Submit form
    console.log('=== SUBMITTING FORM ===');
    const saveButton = page.locator('button:has-text("שמירה")');
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();
    console.log('✓ Save button clicked');

    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 }).catch(() => {
      console.log('⚠️ Dialog did not close, checking for success anyway');
    });

    // Wait for property to appear in list
    console.log('=== WAITING FOR PROPERTY IN LIST ===');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=רחוב בן גוריון 5, חיפה').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Property visible in list');

    // Verify property was created with isMortgaged=false via API
    console.log('=== VERIFYING VIA API ===');
    const properties = await fetchProperties(testAccount.id);
    const createdProperty = properties.find((p: any) => p.address === 'רחוב בן גוריון 5, חיפה');
    
    expect(createdProperty).toBeDefined();
    expect(createdProperty.address).toBe('רחוב בן גוריון 5, חיפה');
    expect(createdProperty.isMortgaged).toBe(false);
    console.log('✓ Property created successfully with isMortgaged=false verified in API');
  });

  test('TC-E2E-1.5-005-list-displays-mortgage-indicator', async ({ page }) => {
    console.log('=== TC-E2E-1.5-005: Verify property list displays mortgage indicator ===');
    
    // Listen for console messages
    page.on('console', msg => {
      console.log(`[BROWSER]:`, msg.text());
    });
    
    // First, create a mortgaged property via API
    console.log('→ Creating mortgaged property via API...');
    const mortgagedPropertyResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: testAccount.id,
        address: 'רחוב ויצמן 10, ירושלים',
        isMortgaged: true,
      }),
    });
    expect(mortgagedPropertyResponse.ok).toBe(true);
    const mortgagedProperty = await mortgagedPropertyResponse.json();
    console.log(`✓ Mortgaged property created with ID: ${mortgagedProperty.id}`);

    // Create a non-mortgaged property via API
    console.log('→ Creating non-mortgaged property via API...');
    const unmortgagedPropertyResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: testAccount.id,
        address: 'רחוב הרצל 20, חיפה',
        isMortgaged: false,
      }),
    });
    expect(unmortgagedPropertyResponse.ok).toBe(true);
    const unmortgagedProperty = await unmortgagedPropertyResponse.json();
    console.log(`✓ Non-mortgaged property created with ID: ${unmortgagedProperty.id}`);

    // Navigate to properties list page
    console.log('→ Navigating to properties list page...');
    await setTestAccountInStorage(page, testAccount.id);
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for list to load

    // Verify mortgaged property shows visual indicator
    console.log('→ Looking for mortgage indicator on mortgaged property...');
    const mortgagedRow = page.locator('text=רחוב ויצמן 10, ירושלים').locator('..').locator('..').first();
    await expect(mortgagedRow).toBeVisible({ timeout: 10000 });
    
    // Look for visual indicator (icon, badge, or text)
    // Could be: icon, badge with "משועבד", or similar visual element
    const mortgageIndicator = mortgagedRow.locator('[data-testid*="mortgage"], [aria-label*="משועבד"], .MuiChip-root:has-text("משועבד"), svg[data-testid*="mortgage"]').first();
    const indicatorVisible = await mortgageIndicator.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (indicatorVisible) {
      console.log('✓ Mortgage indicator found on mortgaged property');
      expect(indicatorVisible).toBe(true);
    } else {
      // Alternative: Check if there's any visual difference (icon, badge, etc.)
      console.log('⚠️ Direct indicator not found, checking for any mortgage-related visual element...');
      // This test will fail initially (expected) - implementation needed
      expect(indicatorVisible).toBe(true); // Will fail until implemented
    }

    // Verify non-mortgaged property does NOT show indicator
    console.log('→ Verifying non-mortgaged property has NO indicator...');
    const unmortgagedRow = page.locator('text=רחוב הרצל 20, חיפה').locator('..').locator('..').first();
    await expect(unmortgagedRow).toBeVisible({ timeout: 10000 });
    
    const noIndicator = unmortgagedRow.locator('[data-testid*="mortgage"], [aria-label*="משועבד"], .MuiChip-root:has-text("משועבד")');
    const noIndicatorVisible = await noIndicator.isVisible({ timeout: 2000 }).catch(() => false);
    expect(noIndicatorVisible).toBe(false);
    console.log('✓ Non-mortgaged property correctly has no mortgage indicator');
  });

  test('TC-E2E-1.5-006-details-shows-mortgage-status', async ({ page }) => {
    console.log('=== TC-E2E-1.5-006: Verify property details page shows mortgage status ===');
    
    // First, create a mortgaged property via API
    console.log('→ Creating mortgaged property via API...');
    const createResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: testAccount.id,
        address: 'רחוב רוטשילד 50, תל אביב',
        isMortgaged: true,
      }),
    });
    expect(createResponse.ok).toBe(true);
    const createdProperty = await createResponse.json();
    const propertyId = createdProperty.id;
    console.log(`✓ Property created with ID: ${propertyId}`);

    // Navigate to property details page
    console.log('→ Navigating to property details page...');
    await setTestAccountInStorage(page, testAccount.id);
    await page.goto(`${FRONTEND_URL}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Verify mortgage status is displayed
    console.log('→ Looking for mortgage status in details view...');
    // Look for text like "משועבד: כן" or "משועבד: כן" or similar
    const mortgageStatusDisplay = page.locator('text=/משועבד.*כן|כן.*משועבד|משועבד.*כן|Mortgaged.*Yes|Yes.*Mortgaged/');
    const statusVisible = await mortgageStatusDisplay.first().isVisible({ timeout: 10000 }).catch(() => false);
    
    if (statusVisible) {
      console.log('✓ Mortgage status displayed in details view');
      expect(statusVisible).toBe(true);
    } else {
      // Alternative: Check for any mortgage-related text
      console.log('⚠️ Direct status text not found, checking for mortgage-related content...');
      const alternativeDisplay = page.locator('text=/משועבד|Mortgaged/');
      const altVisible = await alternativeDisplay.first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(altVisible).toBe(true); // Will fail until implemented
    }
  });

  test('TC-E2E-1.5-007-edit-mortgage-status', async ({ page }) => {
    console.log('=== TC-E2E-1.5-007: Edit property and update mortgage status to true ===');
    
    // First, create a property via API with isMortgaged=false
    console.log('→ Creating property via API with isMortgaged=false...');
    const createResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: testAccount.id,
        address: 'רחוב אלנבי 30, תל אביב',
        isMortgaged: false,
      }),
    });
    expect(createResponse.ok).toBe(true);
    const createdProperty = await createResponse.json();
    const propertyId = createdProperty.id;
    console.log(`✓ Property created with ID: ${propertyId}`);

    // Navigate to property details/edit page
    console.log('→ Navigating to property edit page...');
    await setTestAccountInStorage(page, testAccount.id);
    await page.goto(`${FRONTEND_URL}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Find and click edit button (assuming there's an edit button or form is editable)
    console.log('→ Looking for edit button or form...');
    const editButton = page.locator('button:has-text("עריכה"), button:has-text("Edit")').first();
    const editButtonVisible = await editButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (editButtonVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Edit button clicked');
    } else {
      console.log('→ Form appears to be directly editable, proceeding...');
    }

    // Expand "בעלות" (Ownership) accordion to reveal mortgage checkbox
    console.log('→ Expanding Ownership accordion...');
    const ownershipAccordion = page.locator('[data-testid="accordion-בעלות"]');
    const ownershipSummary = page.locator('[data-testid="accordion-summary-בעלות"]');
    const isExpanded = await ownershipAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await ownershipSummary.click();
      await page.waitForTimeout(500);
      console.log('✓ Ownership accordion expanded');
    }

    // Check the mortgage checkbox
    console.log('→ Checking mortgage checkbox...');
    const mortgageCheckbox = page.getByRole('checkbox', { name: /הנכס משועבד/i });
    await expect(mortgageCheckbox).toBeVisible({ timeout: 10000 });
    await mortgageCheckbox.check();
    console.log('✓ Mortgage checkbox checked');

    // Verify checkbox is now checked
    const isChecked = await mortgageCheckbox.isChecked();
    expect(isChecked).toBe(true);
    console.log('✓ Verified checkbox is checked');

    // Submit form
    console.log('=== SUBMITTING FORM ===');
    const saveButton = page.locator('button:has-text("שמירה"), button:has-text("Save")').first();
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();
    console.log('✓ Save button clicked');

    // Wait for success notification or page update
    await page.waitForTimeout(2000);

    // Verify data was updated via API
    console.log('=== VERIFYING VIA API ===');
    const getResponse = await fetch(`${BACKEND_URL}/properties/${propertyId}?accountId=${testAccount.id}`);
    expect(getResponse.ok).toBe(true);
    const updatedProperty = await getResponse.json();
    
    expect(updatedProperty.isMortgaged).toBe(true);
    console.log('✓ Mortgage status updated successfully (isMortgaged=true)');

    // Verify success notification
    await expect(page.locator('text=הנכס עודכן בהצלחה').or(page.locator('text=Property updated successfully'))).toBeVisible({ timeout: 10000 }).catch(() => {
      console.log('⚠️ Success notification not found, but property was updated');
    });
  });

  test('TC-E2E-1.5-008-toggle-mortgage-status', async ({ page }) => {
    console.log('=== TC-E2E-1.5-008: Toggle mortgage status from true to false ===');
    
    // First, create a mortgaged property via API
    console.log('→ Creating mortgaged property via API...');
    const createResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: testAccount.id,
        address: 'רחוב רוטשילד 50, תל אביב',
        isMortgaged: true,
      }),
    });
    expect(createResponse.ok).toBe(true);
    const createdProperty = await createResponse.json();
    const propertyId = createdProperty.id;
    console.log(`✓ Mortgaged property created with ID: ${propertyId}`);

    // Navigate to property details/edit page
    console.log('→ Navigating to property edit page...');
    await setTestAccountInStorage(page, testAccount.id);
    await page.goto(`${FRONTEND_URL}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Find and click edit button
    console.log('→ Looking for edit button or form...');
    const editButton = page.locator('button:has-text("עריכה"), button:has-text("Edit")').first();
    const editButtonVisible = await editButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (editButtonVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Edit button clicked');
    } else {
      console.log('→ Form appears to be directly editable, proceeding...');
    }

    // Expand "בעלות" (Ownership) accordion
    console.log('→ Expanding Ownership accordion...');
    const ownershipAccordion = page.locator('[data-testid="accordion-בעלות"]');
    const ownershipSummary = page.locator('[data-testid="accordion-summary-בעלות"]');
    const isExpanded = await ownershipAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await ownershipSummary.click();
      await page.waitForTimeout(500);
      console.log('✓ Ownership accordion expanded');
    }

    // Verify checkbox is initially checked (property was created as mortgaged)
    console.log('→ Verifying checkbox is initially checked...');
    const mortgageCheckbox = page.getByRole('checkbox', { name: /הנכס משועבד/i });
    await expect(mortgageCheckbox).toBeVisible({ timeout: 10000 });
    const initiallyChecked = await mortgageCheckbox.isChecked();
    expect(initiallyChecked).toBe(true);
    console.log('✓ Verified checkbox is initially checked (property is mortgaged)');

    // Uncheck the mortgage checkbox
    console.log('→ Unchecking mortgage checkbox...');
    await mortgageCheckbox.uncheck();
    console.log('✓ Mortgage checkbox unchecked');

    // Verify checkbox is now unchecked
    const isChecked = await mortgageCheckbox.isChecked();
    expect(isChecked).toBe(false);
    console.log('✓ Verified checkbox is unchecked');

    // Submit form
    console.log('=== SUBMITTING FORM ===');
    const saveButton = page.locator('button:has-text("שמירה"), button:has-text("Save")').first();
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();
    console.log('✓ Save button clicked');

    // Wait for success notification or page update
    await page.waitForTimeout(2000);

    // Verify data was updated via API
    console.log('=== VERIFYING VIA API ===');
    const getResponse = await fetch(`${BACKEND_URL}/properties/${propertyId}?accountId=${testAccount.id}`);
    expect(getResponse.ok).toBe(true);
    const updatedProperty = await getResponse.json();
    
    expect(updatedProperty.isMortgaged).toBe(false);
    console.log('✓ Mortgage status toggled successfully (isMortgaged=false)');
  });
});
