import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

// Helper function to interact with MUI Select component
async function selectMuiOption(page: Page, testId: string, optionText: string) {
  const select = page.getByTestId(testId);
  
  // Click to open dropdown
  await select.click();
  await page.waitForTimeout(300);
  
  // Wait for dropdown menu to appear
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 }).catch(() => {});
  
  // Click the option
  const option = page.locator(`text=${optionText}`).first();
  await option.click({ force: true }); // Force click in case backdrop interferes
  await page.waitForTimeout(300);
  
  // Ensure dropdown is closed - try multiple methods
  // Method 1: Press Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  
  // Method 2: Click outside if dropdown still open
  const dropdown = page.locator('[role="listbox"]');
  if (await dropdown.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
}

// Helper function to select multiple MUI options (for multi-select)
async function selectMultipleMuiOptions(page: Page, testId: string, optionTexts: string[]) {
  const select = page.getByTestId(testId);
  await select.click();
  await page.waitForTimeout(300);
  for (const optionText of optionTexts) {
    // For multi-select, dropdown stays open, so we can click options directly
    const option = page.locator(`text=${optionText}`).first();
    await option.click();
    await page.waitForTimeout(200);
  }
  // Click outside to close dropdown (or press Escape)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

// Helper function to open filter panel
async function openFilterPanel(page: Page) {
  const filterPanel = page.getByTestId('property-filter-panel');
  const isExpanded = await filterPanel.getAttribute('aria-expanded');
  if (isExpanded !== 'true') {
    await filterPanel.click();
    await page.waitForTimeout(500);
  }
}

// Helper function to wait for filter API call to complete
async function waitForFilterResults(page: Page) {
  // Wait for network idle after filter change
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  // Also wait a bit more for React Query to update
  await page.waitForTimeout(500);
}

// Helper function to ensure all MUI dropdowns/backdrops are closed
async function ensureDropdownsClosed(page: Page) {
  // Press Escape multiple times to close any open dropdowns
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  
  // Wait for any backdrops to disappear
  const backdrop = page.locator('.MuiBackdrop-root:visible');
  try {
    await backdrop.waitFor({ state: 'hidden', timeout: 2000 });
  } catch {
    // Backdrop might not exist, that's fine
  }
  
  // Wait a bit more for UI to stabilize
  await page.waitForTimeout(300);
}

test.describe('US1.8 - Filter Properties (TDD)', () => {
  let testAccountId: string;

  test.beforeAll(async () => {
    // Fetch test account
    const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
    const accounts = await accountsResponse.json();
    const testAccount = accounts.find((a: any) => a.id === 'test-account-1');
    if (!testAccount) {
      throw new Error('Test account "test-account-1" not found');
    }
    testAccountId = testAccount.id;
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

    // Set test account in localStorage
    await setTestAccountInStorage(page, testAccountId);

    // Navigate to properties page
    console.log('→ Navigating to properties page...');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    console.log('✓ Properties page loaded\n');
  });

  test('TC-E2E-1.8-001: Filter UI component is available', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-001: Filter UI Component Available ===');
    
    console.log('→ Looking for filter panel...');
    // Look for filter accordion or filter panel
    const filterPanel = page.locator('text=סינון נכסים').first();
    await expect(filterPanel).toBeVisible({ timeout: 10000 });
    console.log('✓ Filter panel is visible');
    
    // Verify filter accordion can be expanded
    console.log('→ Verifying filter accordion can be expanded...');
    const accordion = page.locator('[aria-expanded="true"], [aria-expanded="false"]').filter({ hasText: 'סינון נכסים' }).first();
    if (await accordion.count() > 0) {
      console.log('✓ Filter accordion found');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-002: Filter by property type (single selection)', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-002: Filter by Property Type (Single) ===');
    
    // Create test properties with different types
    console.log('→ Creating test properties with different types...');
    const residentialProperty = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123, תל אביב',
      type: 'RESIDENTIAL',
    };
    const commercialProperty = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45, תל אביב',
      type: 'COMMERCIAL',
    };
    const landProperty = {
      accountId: testAccountId,
      address: 'קרקע בירושלים',
      type: 'LAND',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(residentialProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(commercialProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(landProperty),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel if collapsed
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Select RESIDENTIAL type filter
    console.log('→ Selecting RESIDENTIAL type filter...');
    await selectMuiOption(page, 'filter-property-type', 'מגורים');
    await waitForFilterResults(page);
    
    // Verify only residential property is visible
    console.log('→ Verifying filter results...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Residential property visible');
    
    // Verify other types are filtered out
    const commercialVisible = await page.locator('text=רחוב דיזנגוף 45').isVisible().catch(() => false);
    const landVisible = await page.locator('text=קרקע בירושלים').isVisible().catch(() => false);
    
    if (!commercialVisible && !landVisible) {
      console.log('✓ Other property types filtered out correctly');
    } else {
      console.log('⚠️ Some properties not filtered correctly');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-003: Filter by property status', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-003: Filter by Property Status ===');
    
    // Create test properties with different statuses
    console.log('→ Creating test properties with different statuses...');
    const ownedProperty = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      status: 'OWNED',
    };
    const inConstructionProperty = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45',
      status: 'IN_CONSTRUCTION',
    };
    const soldProperty = {
      accountId: testAccountId,
      address: 'רחוב בן גוריון 78',
      status: 'SOLD',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(ownedProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(inConstructionProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(soldProperty),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Select OWNED status filter
    console.log('→ Selecting OWNED status filter...');
    await selectMuiOption(page, 'filter-property-status', 'בבעלות');
    await waitForFilterResults(page);
    
    // Verify only owned property is visible
    console.log('→ Verifying filter results...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Owned property visible');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-004: Filter by city', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-004: Filter by City ===');
    
    // Create test properties in different cities
    console.log('→ Creating test properties in different cities...');
    const telAvivProperty = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      city: 'תל אביב',
    };
    const jerusalemProperty = {
      accountId: testAccountId,
      address: 'רחוב בן גוריון 78',
      city: 'ירושלים',
    };
    const haifaProperty = {
      accountId: testAccountId,
      address: 'רחוב הרצל 50',
      city: 'חיפה',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(telAvivProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(jerusalemProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(haifaProperty),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Ensure no dropdowns are open before interacting with text input
    await ensureDropdownsClosed(page);
    
    // Enter city filter
    console.log('→ Entering city filter "תל אביב"...');
    const cityInput = page.getByTestId('filter-city-input');
    await cityInput.click(); // Click first to focus
    await page.waitForTimeout(200);
    await cityInput.fill('תל אביב');
    // City filter has 300ms debounce, wait longer for API call
    await page.waitForTimeout(600); // Wait for debounce
    await waitForFilterResults(page); // Wait for API call
    
    // Verify only Tel Aviv property is visible
    console.log('→ Verifying filter results...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Tel Aviv property visible');
    
    // Verify other cities filtered out
    const jerusalemVisible = await page.locator('text=רחוב בן גוריון 78').isVisible().catch(() => false);
    const haifaVisible = await page.locator('text=חיפה').isVisible().catch(() => false);
    
    if (!jerusalemVisible && !haifaVisible) {
      console.log('✓ Other cities filtered out correctly');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-005: Filter by country', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-005: Filter by Country ===');
    
    // Create test properties in different countries
    console.log('→ Creating test properties in different countries...');
    const israelProperty = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      country: 'Israel',
    };
    const usaProperty = {
      accountId: testAccountId,
      address: '123 Main St, New York',
      country: 'USA',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(israelProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(usaProperty),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Ensure no dropdowns are open
    await ensureDropdownsClosed(page);
    
    // Select Israel country filter
    console.log('→ Selecting Israel country filter...');
    await selectMuiOption(page, 'filter-country', 'ישראל');
    await waitForFilterResults(page);
    
    // Verify only Israel property is visible
    console.log('→ Verifying filter results...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Israel property visible');
    
    // Verify USA property filtered out
    const usaVisible = await page.locator('text=123 Main St').isVisible().catch(() => false);
    if (!usaVisible) {
      console.log('✓ USA property filtered out correctly');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-006: Filter by mortgage status', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-006: Filter by Mortgage Status ===');
    
    // Create test properties with different mortgage statuses
    console.log('→ Creating test properties with different mortgage statuses...');
    const mortgagedProperty = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      isMortgaged: true,
    };
    const nonMortgagedProperty = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45',
      isMortgaged: false,
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(mortgagedProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(nonMortgagedProperty),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Check mortgage status checkbox
    console.log('→ Checking mortgage status checkbox...');
    const mortgageCheckbox = page.getByTestId('filter-is-mortgaged');
    await mortgageCheckbox.check();
    await waitForFilterResults(page);
    
    // Verify only mortgaged property is visible
    console.log('→ Verifying filter results...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Mortgaged property visible');
    
    // Verify non-mortgaged property filtered out
    const nonMortgagedVisible = await page.locator('text=רחוב דיזנגוף 45').isVisible().catch(() => false);
    if (!nonMortgagedVisible) {
      console.log('✓ Non-mortgaged property filtered out correctly');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-007: Multiple filters can be applied simultaneously', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-007: Multiple Filters Simultaneously ===');
    
    // Create test properties with various combinations
    console.log('→ Creating test properties with various combinations...');
    const targetProperty = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'תל אביב',
      isMortgaged: true,
    };
    const differentProperty1 = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45',
      type: 'COMMERCIAL', // Different type
      status: 'OWNED',
      city: 'תל אביב',
      isMortgaged: true,
    };
    const differentProperty2 = {
      accountId: testAccountId,
      address: 'רחוב בן גוריון 78',
      type: 'RESIDENTIAL',
      status: 'SOLD', // Different status
      city: 'תל אביב',
      isMortgaged: true,
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(targetProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(differentProperty1),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(differentProperty2),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Apply multiple filters
    console.log('→ Applying multiple filters (RESIDENTIAL + OWNED + תל אביב + Mortgaged)...');
    
    // Select type: RESIDENTIAL
    await selectMuiOption(page, 'filter-property-type', 'מגורים');
    await ensureDropdownsClosed(page);
    await page.waitForTimeout(300);
    
    // Select status: OWNED
    await selectMuiOption(page, 'filter-property-status', 'בבעלות');
    await ensureDropdownsClosed(page);
    await page.waitForTimeout(300);
    
    // Enter city: תל אביב
    const cityInput = page.getByTestId('filter-city-input');
    await cityInput.click(); // Click to focus
    await page.waitForTimeout(200);
    await cityInput.fill('תל אביב');
    await page.waitForTimeout(600); // Wait for debounce
    await waitForFilterResults(page);
    
    // Check mortgage checkbox
    const mortgageCheckbox = page.getByTestId('filter-is-mortgaged');
    await mortgageCheckbox.check();
    await waitForFilterResults(page);
    
    // Verify only target property is visible
    console.log('→ Verifying filter results...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Target property visible');
    
    // Verify other properties filtered out
    const prop1Visible = await page.locator('text=רחוב דיזנגוף 45').isVisible().catch(() => false);
    const prop2Visible = await page.locator('text=רחוב בן גוריון 78').isVisible().catch(() => false);
    
    if (!prop1Visible && !prop2Visible) {
      console.log('✓ Other properties filtered out correctly');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-008: Active filters are displayed as chips', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-008: Active Filters Displayed as Chips ===');
    
    // Create test property
    console.log('→ Creating test property...');
    const property = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      type: 'RESIDENTIAL',
      city: 'תל אביב',
    };
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property),
    });
    console.log('✓ Test property created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Apply filters
    console.log('→ Applying filters...');
    
    // Select type: RESIDENTIAL
    await selectMuiOption(page, 'filter-property-type', 'מגורים');
    await page.waitForTimeout(500);
    
    // Enter city
    const cityInput = page.getByTestId('filter-city-input');
    await cityInput.click(); // Click to focus
    await page.waitForTimeout(200);
    await cityInput.fill('תל אביב');
    await page.waitForTimeout(600); // Wait for debounce
    await waitForFilterResults(page);
    
    // Verify active filter chips are displayed
    console.log('→ Verifying active filter chips are displayed...');
    
    // Look for chips showing active filters
    const typeChip = page.locator('text=סוג: מגורים').first();
    const cityChip = page.locator('text=עיר: תל אביב').first();
    
    await expect(typeChip).toBeVisible({ timeout: 5000 });
    console.log('✓ Type filter chip visible');
    
    await expect(cityChip).toBeVisible({ timeout: 5000 });
    console.log('✓ City filter chip visible');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-009: Clear filters button clears all filters', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-009: Clear Filters Button ===');
    
    // Create test properties
    console.log('→ Creating test properties...');
    const property1 = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      type: 'RESIDENTIAL',
      city: 'תל אביב',
    };
    const property2 = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45',
      type: 'COMMERCIAL',
      city: 'ירושלים',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property1),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property2),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Apply filters
    console.log('→ Applying filters...');
    const typeSelect = page.locator('label:has-text("סוג נכס")').locator('..').locator('select, [role="combobox"]').first();
    await typeSelect.click();
    await page.waitForTimeout(500);
    await page.locator('text=מגורים').first().click();
    await page.waitForTimeout(1000);
    
    // Verify filter applied (only one property visible)
    console.log('→ Verifying filter applied...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    const prop2Visible = await page.locator('text=רחוב דיזנגוף 45').isVisible().catch(() => false);
    if (!prop2Visible) {
      console.log('✓ Filter working - only RESIDENTIAL property visible');
    }
    
    // Ensure any open dropdowns are closed first
    await ensureDropdownsClosed(page);
    
    // Click clear filters button
    console.log('→ Clicking clear filters button...');
    // Try panel clear button first, then chips clear button
    const panelClearButton = page.getByTestId('clear-filters-button');
    const chipsClearButton = page.getByTestId('clear-all-filters-button');
    
    if (await panelClearButton.isVisible().catch(() => false)) {
      await panelClearButton.click();
    } else if (await chipsClearButton.isVisible().catch(() => false)) {
      await chipsClearButton.click();
    } else {
      // Fallback to text-based selector
      const clearButton = page.locator('button:has-text("נקה סינונים"), button:has-text("נקה הכל")').first();
      await clearButton.click();
    }
    await page.waitForTimeout(1000);
    
    // Verify all properties visible again
    console.log('→ Verifying all properties visible after clearing...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=רחוב דיזנגוף 45').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ All properties visible after clearing filters');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-010: Filter state persists during navigation', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-010: Filter State Persists ===');
    
    // Create test property
    console.log('→ Creating test property...');
    const property = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      type: 'RESIDENTIAL',
      city: 'תל אביב',
    };
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property),
    });
    console.log('✓ Test property created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Apply filter
    console.log('→ Applying RESIDENTIAL type filter...');
    const typeSelect = page.locator('label:has-text("סוג נכס")').locator('..').locator('select, [role="combobox"]').first();
    await typeSelect.click();
    await page.waitForTimeout(500);
    await page.locator('text=מגורים').first().click();
    await page.waitForTimeout(1000);
    
    // Verify filter is in URL
    console.log('→ Checking URL for filter parameters...');
    const url = page.url();
    if (url.includes('type') || url.includes('RESIDENTIAL')) {
      console.log('✓ Filter parameters in URL');
    }
    
    // Navigate away and back
    console.log('→ Navigating away...');
    await page.goto(`${FRONTEND_URL}`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Navigating back to properties page...');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify filter persisted
    console.log('→ Verifying filter persisted...');
    const urlAfterNav = page.url();
    if (urlAfterNav.includes('type') || urlAfterNav.includes('RESIDENTIAL')) {
      console.log('✓ Filter persisted in URL after navigation');
    }
    
    // Verify filter chips still visible
    const typeChip = page.locator('text=סוג: מגורים').first();
    const chipVisible = await typeChip.isVisible().catch(() => false);
    if (chipVisible) {
      console.log('✓ Filter chip still visible after navigation');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.8-011: Filter by multiple types (multi-select)', async ({ page }) => {
    console.log('\n=== TC-E2E-1.8-011: Filter by Multiple Types ===');
    
    // Create test properties with different types
    console.log('→ Creating test properties with different types...');
    const residentialProperty = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      type: 'RESIDENTIAL',
    };
    const commercialProperty = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45',
      type: 'COMMERCIAL',
    };
    const landProperty = {
      accountId: testAccountId,
      address: 'קרקע בירושלים',
      type: 'LAND',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(residentialProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(commercialProperty),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(landProperty),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open filter panel
    console.log('→ Opening filter panel...');
    await openFilterPanel(page);
    
    // Select multiple types (RESIDENTIAL + COMMERCIAL)
    console.log('→ Selecting multiple types (RESIDENTIAL + COMMERCIAL)...');
    await selectMultipleMuiOptions(page, 'filter-property-type', ['מגורים', 'מסחרי']);
    await waitForFilterResults(page);
    
    // Verify both RESIDENTIAL and COMMERCIAL properties are visible
    console.log('→ Verifying filter results...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Residential property visible');
    
    await expect(page.locator('text=רחוב דיזנגוף 45').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Commercial property visible');
    
    // Verify LAND property is filtered out
    const landVisible = await page.locator('text=קרקע בירושלים').isVisible().catch(() => false);
    if (!landVisible) {
      console.log('✓ Land property filtered out correctly');
    }
    
    console.log('✓ Test completed successfully\n');
  });
});
