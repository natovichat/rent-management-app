/**
 * Smoke Tests - Critical User Flows
 * 
 * Run against local or production:
 * - Local:      FRONTEND_URL=http://localhost:3001 npx playwright test test/e2e/production/smoke-tests.spec.ts
 * - Production: FRONTEND_URL=https://rent-management-app-frontend.vercel.app npx playwright test ...
 */

import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api';

test.describe('Production Smoke Tests', () => {

  test('SMOKE-001: Homepage redirects to dashboard', async ({ page }) => {
    console.log('\n=== SMOKE-001: Homepage / Dashboard ===');

    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');

    // Homepage redirects to /dashboard
    expect(page.url()).toContain('/dashboard');

    // Dashboard content is visible
    await expect(page.locator('text=לוח בקרה').first()).toBeVisible({ timeout: 10000 });

    console.log('✓ Homepage redirects to dashboard and loads correctly');
  });

  test('SMOKE-002: Properties list page loads', async ({ page }) => {
    console.log('\n=== SMOKE-002: Properties List ===');

    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');

    // Properties page content
    await expect(page.locator('text=ניהול נכסים').first()).toBeVisible({ timeout: 10000 });

    console.log('✓ Properties list page loaded');
  });

  test('SMOKE-003: Property details page loads (dynamic route)', async ({ page }) => {
    console.log('\n=== SMOKE-003: Property Details (Dynamic Route) ===');

    // Get a property ID from the API
    const propertiesResponse = await fetch(`${BACKEND_URL}/properties?page=1&limit=1`);
    const propertiesData = await propertiesResponse.json();

    if (!propertiesData.data || propertiesData.data.length === 0) {
      console.log('⚠️ No properties found – skipping test');
      test.skip();
      return;
    }

    const propertyId = propertiesData.data[0].id;
    const propertyAddress = propertiesData.data[0].address;

    console.log(`→ Testing dynamic route: /properties/${propertyId}`);
    console.log(`→ Property: ${propertyAddress}`);

    await page.goto(`${FRONTEND_URL}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');

    // Should stay on property details page
    expect(page.url()).toContain(`/properties/${propertyId}`);
    console.log('✓ URL is correct (not redirected)');

    // Property details content is visible
    const hasContent = await page.locator('text=פרטים כלליים')
      .or(page.locator(`text=${propertyAddress}`))
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    expect(hasContent).toBe(true);
    console.log('✓ Property details content displayed');

    // New sections should be visible (accordions)
    await expect(page.locator('text=בעלויות').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=משכנתאות').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=חוזי שכירות').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=אירועי הנכס').first()).toBeVisible({ timeout: 5000 });
    console.log('✓ All property detail sections visible (ownerships, mortgages, leases, events)');
  });

  test('SMOKE-004: Navigation from list to details works', async ({ page }) => {
    console.log('\n=== SMOKE-004: List to Details Navigation ===');

    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');

    // Find the first clickable property row
    const firstPropertyLink = page.locator('[href^="/properties/"]').first();
    const linkExists = await firstPropertyLink.isVisible({ timeout: 10000 }).catch(() => false);

    if (!linkExists) {
      console.log('⚠️ No property links found – skipping test');
      test.skip();
      return;
    }

    console.log('→ Clicking on property link...');
    await firstPropertyLink.click();
    await page.waitForLoadState('networkidle');

    // Should be on property details page
    expect(page.url()).toMatch(/\/properties\/[a-f0-9-]+/);
    console.log('✓ Navigated to property details page');

    // Property details should be visible
    await expect(page.locator('text=פרטים כלליים').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Property details displayed');

    console.log('✓ Navigation from list to details works!');
  });

  test('SMOKE-005: Leases page loads', async ({ page }) => {
    console.log('\n=== SMOKE-005: Leases Page ===');

    await page.goto(`${FRONTEND_URL}/leases`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=חוזי שכירות').first()).toBeVisible({ timeout: 10000 });

    console.log('✓ Leases page loaded');
  });

  test('SMOKE-006: Persons page loads', async ({ page }) => {
    console.log('\n=== SMOKE-006: Persons Page ===');

    await page.goto(`${FRONTEND_URL}/persons`);
    await page.waitForLoadState('networkidle');

    // Page should load (persons/owners)
    const hasContent = await page.locator('text=אנשים')
      .or(page.locator('text=רשימת אנשים'))
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(hasContent).toBe(true);
    console.log('✓ Persons page loaded');
  });

  test('SMOKE-007: Mortgages page loads', async ({ page }) => {
    console.log('\n=== SMOKE-007: Mortgages Page ===');

    await page.goto(`${FRONTEND_URL}/mortgages`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=משכנתאות').first()).toBeVisible({ timeout: 10000 });

    console.log('✓ Mortgages page loaded');
  });

  test('SMOKE-008: Owners page loads', async ({ page }) => {
    console.log('\n=== SMOKE-008: Owners Page ===');

    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('text=בעלים')
      .or(page.locator('text=ניהול בעלים'))
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(hasContent).toBe(true);
    console.log('✓ Owners page loaded');
  });

  test('SMOKE-009: Bank accounts page loads', async ({ page }) => {
    console.log('\n=== SMOKE-009: Bank Accounts Page ===');

    await page.goto(`${FRONTEND_URL}/bank-accounts`);
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('text=חשבונות בנק')
      .or(page.locator('text=חשבון בנק'))
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(hasContent).toBe(true);
    console.log('✓ Bank accounts page loaded');
  });

  test('SMOKE-010: Add property event flow', async ({ page }) => {
    console.log('\n=== SMOKE-010: Add Property Event ===');

    // Get a property ID
    const propertiesResponse = await fetch(`${BACKEND_URL}/properties?page=1&limit=1`);
    const propertiesData = await propertiesResponse.json();

    if (!propertiesData.data || propertiesData.data.length === 0) {
      console.log('⚠️ No properties found – skipping test');
      test.skip();
      return;
    }

    const propertyId = propertiesData.data[0].id;
    await page.goto(`${FRONTEND_URL}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');

    // Scroll down to find the events section
    await page.keyboard.press('End');
    await page.waitForTimeout(500);

    const addEventBtn = page.locator('button:has-text("הוסף אירוע")').first();
    await addEventBtn.scrollIntoViewIfNeeded();
    const btnVisible = await addEventBtn.isVisible({ timeout: 10000 }).catch(() => false);
    expect(btnVisible).toBe(true);
    console.log('✓ Add event button is visible on property details page');

    // Click it and verify dialog opens
    await addEventBtn.click();
    await expect(page.locator('text=בחר סוג אירוע').first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Event creation dialog opens correctly');
  });
});
