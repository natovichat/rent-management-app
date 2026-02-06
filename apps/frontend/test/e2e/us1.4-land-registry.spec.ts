import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { getTestAccount, setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

/**
 * US1.4: Add Land Registry Information
 * 
 * As a property owner,
 * I can add land registry information (Gush and Helka) to my properties,
 * So that I can track official land registry details for legal and administrative purposes.
 * 
 * Acceptance Criteria:
 * 1. Form includes Gush (גוש) text field
 * 2. Form includes Helka (חלקה) text field
 * 3. Fields are optional
 * 4. Values are saved to Property model
 * 5. Values are displayed in property details view
 * 6. Values can be edited after creation
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

test.describe('US1.4 - Add Land Registry Information (TDD)', () => {
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

  test('TC-E2E-1.4-001-gush-field-exists', async ({ page }) => {
    console.log('=== TC-E2E-1.4-001: Verifying Gush field exists in form ===');
    
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

    // Expand "משפטי ורישום" (Legal & Registry) accordion to reveal Gush and Helka fields
    console.log('→ Expanding Legal & Registry accordion...');
    const legalAccordion = page.locator('[data-testid="accordion-משפטי-ורישום"]');
    const legalSummary = page.locator('[data-testid="accordion-summary-משפטי-ורישום"]');
    const isExpanded = await legalAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await legalSummary.click();
      await page.waitForTimeout(500); // Wait for accordion to expand
      console.log('✓ Legal & Registry accordion expanded');
    }

    // Verify Gush (גוש) field exists
    console.log('→ Looking for Gush (גוש) field...');
    const gushField = page.locator('input[name="gush"]');
    await expect(gushField).toBeVisible({ timeout: 5000 });
    console.log('✓ Gush field found and visible');

    // Verify field has correct label
    const gushLabel = page.locator('label:has-text("גוש"), label[for*="gush"]');
    await expect(gushLabel.first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Gush label found');
  });

  test('TC-E2E-1.4-002-helka-field-exists', async ({ page }) => {
    console.log('=== TC-E2E-1.4-002: Verifying Helka field exists in form ===');
    
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

    // Expand "משפטי ורישום" (Legal & Registry) accordion to reveal Gush and Helka fields
    console.log('→ Expanding Legal & Registry accordion...');
    const legalAccordion = page.locator('[data-testid="accordion-משפטי-ורישום"]');
    const legalSummary = page.locator('[data-testid="accordion-summary-משפטי-ורישום"]');
    const isExpanded = await legalAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await legalSummary.click();
      await page.waitForTimeout(500); // Wait for accordion to expand
      console.log('✓ Legal & Registry accordion expanded');
    }

    // Verify Helka (חלקה) field exists
    console.log('→ Looking for Helka (חלקה) field...');
    const helkaField = page.locator('input[name="helka"]');
    await expect(helkaField).toBeVisible({ timeout: 5000 });
    console.log('✓ Helka field found and visible');

    // Verify field has correct label
    const helkaLabel = page.locator('label:has-text("חלקה"), label[for*="helka"]');
    await expect(helkaLabel.first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Helka label found');
  });

  test('TC-E2E-1.4-003-create-with-gush-helka', async ({ page }) => {
    console.log('=== TC-E2E-1.4-003: Create property with Gush and Helka ===');
    
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

    // Expand "משפטי ורישום" (Legal & Registry) accordion to reveal Gush and Helka fields
    console.log('→ Expanding Legal & Registry accordion...');
    const legalAccordion = page.locator('[data-testid="accordion-משפטי-ורישום"]');
    const legalSummary = page.locator('[data-testid="accordion-summary-משפטי-ורישום"]');
    const isExpanded = await legalAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await legalSummary.click();
      await page.waitForTimeout(500); // Wait for accordion to expand
      console.log('✓ Legal & Registry accordion expanded');
    }

    // Fill Gush (גוש) field
    console.log('→ Filling Gush field...');
    const gushField = page.locator('input[name="gush"]');
    await expect(gushField).toBeVisible({ timeout: 5000 });
    await gushField.fill('6543');
    console.log('✓ Gush field filled with: 6543');

    // Fill Helka (חלקה) field
    console.log('→ Filling Helka field...');
    const helkaField = page.locator('input[name="helka"]');
    await expect(helkaField).toBeVisible({ timeout: 5000 });
    await helkaField.fill('123');
    console.log('✓ Helka field filled with: 123');

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
    // Retry a few times to handle database commit timing
    console.log('=== VERIFYING VIA API ===');
    let properties: any[] = [];
    let createdProperty: any = undefined;
    let retries = 0;
    const maxRetries = 5;
    
    while (!createdProperty && retries < maxRetries) {
      if (retries > 0) {
        console.log(`→ Retry ${retries}/${maxRetries} - waiting 1s before checking API again...`);
        await page.waitForTimeout(1000);
      }
      
      properties = await fetchProperties(testAccount.id);
      console.log(`✓ Fetched ${properties.length} properties (attempt ${retries + 1})`);
      createdProperty = properties.find((p: any) => p.address === 'רחוב דיזנגוף 100, תל אביב');
      retries++;
    }
    
    console.log('Created property:', createdProperty ? 'FOUND' : 'NOT FOUND');
    expect(createdProperty).toBeDefined();
    expect(createdProperty.gush).toBe('6543');
    expect(createdProperty.helka).toBe('123');
    console.log('✓ Gush and Helka values verified in API response');
  });

  test('TC-E2E-1.4-004-create-without-gush-helka', async ({ page }) => {
    console.log('=== TC-E2E-1.4-004: Create property without Gush and Helka (optional fields) ===');
    
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

    // Fill ONLY required field: address
    const addressField = page.locator('input[name="address"]');
    await expect(addressField).toBeVisible({ timeout: 5000 });
    await addressField.fill('רחוב בן גוריון 5, חיפה');
    console.log('✓ Address field filled');

    // DO NOT fill Gush or Helka fields (they are optional)
    console.log('→ Skipping optional Gush and Helka fields');

    // Submit form - should succeed without validation errors
    console.log('=== SUBMITTING FORM ===');
    const saveButton = page.locator('button:has-text("שמירה")');
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await expect(saveButton).toBeEnabled(); // Button should be enabled
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

    // Verify property was created without Gush/Helka via API
    console.log('=== VERIFYING VIA API ===');
    const properties = await fetchProperties(testAccount.id);
    const createdProperty = properties.find((p: any) => p.address === 'רחוב בן גוריון 5, חיפה');
    
    expect(createdProperty).toBeDefined();
    expect(createdProperty.address).toBe('רחוב בן גוריון 5, חיפה');
    // Optional fields should be null or undefined
    expect(createdProperty.gush).toBeFalsy(); // null or undefined
    expect(createdProperty.helka).toBeFalsy(); // null or undefined
    console.log('✓ Property created successfully without Gush/Helka (fields are optional)');
  });

  test('TC-E2E-1.4-005-view-displays-gush-helka', async ({ page }) => {
    console.log('=== TC-E2E-1.4-005: Verify Gush and Helka display in property details view ===');
    
    // First, create a property with Gush and Helka via API
    console.log('→ Creating property via API with Gush and Helka...');
    const createResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: testAccount.id,
        address: 'רחוב ויצמן 10, ירושלים',
        gush: '7890',
        helka: '456',
      }),
    });
    expect(createResponse.ok).toBe(true);
    const createdProperty = await createResponse.json();
    const propertyId = createdProperty.id;
    console.log(`✓ Property created with ID: ${propertyId}`);

    // Navigate to property details page
    console.log('→ Navigating to property details page...');
    await page.goto(`${FRONTEND_URL}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Verify Gush (גוש) is displayed
    console.log('→ Looking for Gush (גוש) in details view...');
    const gushDisplay = page.locator('text=/גוש.*7890|7890.*גוש/');
    await expect(gushDisplay.first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Gush value displayed in details view');

    // Verify Helka (חלקה) is displayed
    console.log('→ Looking for Helka (חלקה) in details view...');
    const helkaDisplay = page.locator('text=/חלקה.*456|456.*חלקה/');
    await expect(helkaDisplay.first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Helka value displayed in details view');
  });

  test('TC-E2E-1.4-006-edit-update-gush-helka', async ({ page }) => {
    console.log('=== TC-E2E-1.4-006: Edit property and update Gush and Helka ===');
    
    // First, create a property via API without Gush/Helka
    console.log('→ Creating property via API without Gush/Helka...');
    const createResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: testAccount.id,
        address: 'רחוב אלנבי 30, תל אביב',
      }),
    });
    expect(createResponse.ok).toBe(true);
    const createdProperty = await createResponse.json();
    const propertyId = createdProperty.id;
    console.log(`✓ Property created with ID: ${propertyId}`);

    // Navigate to property details/edit page
    console.log('→ Navigating to property edit page...');
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

    // Expand "משפטי ורישום" (Legal & Registry) accordion to reveal Gush and Helka fields
    console.log('→ Expanding Legal & Registry accordion...');
    const legalAccordion = page.locator('[data-testid="accordion-משפטי-ורישום"]');
    const legalSummary = page.locator('[data-testid="accordion-summary-משפטי-ורישום"]');
    const isExpanded = await legalAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await legalSummary.click();
      await page.waitForTimeout(500); // Wait for accordion to expand
      console.log('✓ Legal & Registry accordion expanded');
    }

    // Fill Gush (גוש) field
    console.log('→ Filling Gush field...');
    const gushField = page.locator('input[name="gush"]');
    await expect(gushField).toBeVisible({ timeout: 10000 });
    await gushField.fill('1111');
    console.log('✓ Gush field filled with: 1111');

    // Fill Helka (חלקה) field
    console.log('→ Filling Helka field...');
    const helkaField = page.locator('input[name="helka"]');
    await expect(helkaField).toBeVisible({ timeout: 10000 });
    await helkaField.fill('2222');
    console.log('✓ Helka field filled with: 2222');

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
    
    expect(updatedProperty.gush).toBe('1111');
    expect(updatedProperty.helka).toBe('2222');
    console.log('✓ Gush and Helka values updated successfully');
  });

  test('TC-E2E-1.4-007-gush-helka-persist-after-save', async ({ page }) => {
    console.log('=== TC-E2E-1.4-007: Verify Gush and Helka persist after save ===');
    
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
    await addressField.fill('רחוב רוטשילד 50, תל אביב');
    console.log('✓ Address field filled');

    // Expand "משפטי ורישום" (Legal & Registry) accordion to reveal Gush and Helka fields
    console.log('→ Expanding Legal & Registry accordion...');
    const legalAccordion = page.locator('[data-testid="accordion-משפטי-ורישום"]');
    const legalSummary = page.locator('[data-testid="accordion-summary-משפטי-ורישום"]');
    const isExpanded = await legalAccordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await legalSummary.click();
      await page.waitForTimeout(500); // Wait for accordion to expand
      console.log('✓ Legal & Registry accordion expanded');
    }

    // Fill Gush (גוש) field
    console.log('→ Filling Gush field...');
    const gushField = page.locator('input[name="gush"]');
    await expect(gushField).toBeVisible({ timeout: 5000 });
    await gushField.fill('9999');
    console.log('✓ Gush field filled with: 9999');

    // Fill Helka (חלקה) field
    console.log('→ Filling Helka field...');
    const helkaField = page.locator('input[name="helka"]');
    await expect(helkaField).toBeVisible({ timeout: 5000 });
    await helkaField.fill('8888');
    console.log('✓ Helka field filled with: 8888');

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
    await expect(page.locator('text=רחוב רוטשילד 50, תל אביב').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Property visible in list');

    // Verify persistence via API immediately after creation
    console.log('=== VERIFYING PERSISTENCE VIA API (IMMEDIATE) ===');
    const properties1 = await fetchProperties(testAccount.id);
    const createdProperty1 = properties1.find((p: any) => p.address === 'רחוב רוטשילד 50, תל אביב');
    expect(createdProperty1).toBeDefined();
    expect(createdProperty1.gush).toBe('9999');
    expect(createdProperty1.helka).toBe('8888');
    console.log('✓ Values persisted immediately after save');

    // Wait a bit and verify again (persistence check)
    console.log('=== VERIFYING PERSISTENCE VIA API (AFTER DELAY) ===');
    await page.waitForTimeout(3000);
    const properties2 = await fetchProperties(testAccount.id);
    const createdProperty2 = properties2.find((p: any) => p.address === 'רחוב רוטשילד 50, תל אביב');
    expect(createdProperty2).toBeDefined();
    expect(createdProperty2.gush).toBe('9999');
    expect(createdProperty2.helka).toBe('8888');
    console.log('✓ Values persisted after delay (no data loss)');
  });
});
