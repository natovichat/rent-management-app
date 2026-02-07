/**
 * Production Smoke Tests - Critical User Flows
 * 
 * These tests run against the PRODUCTION environment on Vercel.
 * They verify critical functionality works in the real deployed environment.
 * 
 * SETUP:
 * 1. Set environment variable: FRONTEND_URL=https://rent-management-app-frontend.vercel.app
 * 2. Set environment variable: BACKEND_URL=https://rent-app-backend-6s337cqx6a-uc.a.run.app
 * 3. Run: FRONTEND_URL=https://rent-management-app-frontend.vercel.app npx playwright test test/e2e/production/smoke-tests.spec.ts
 * 
 * IMPORTANT:
 * - Uses REAL production data (read-only tests preferred)
 * - Tests should be non-destructive when possible
 * - Run after every deployment to catch configuration issues
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_FRONTEND = process.env.FRONTEND_URL || 'https://rent-management-app-frontend.vercel.app';
const PRODUCTION_BACKEND = process.env.BACKEND_URL || 'https://rent-app-backend-6s337cqx6a-uc.a.run.app';

test.describe('Production Smoke Tests', () => {
  
  test('SMOKE-001: Homepage loads correctly', async ({ page }) => {
    console.log('\n=== SMOKE-001: Homepage ===');
    
    await page.goto(PRODUCTION_FRONTEND);
    await page.waitForLoadState('networkidle');
    
    // Verify homepage content
    await expect(page.locator('text=מערכת ניהול דירות להשכרה')).toBeVisible();
    await expect(page.locator('text=ניהול נכסים')).toBeVisible();
    
    console.log('✓ Homepage loaded successfully');
  });

  test('SMOKE-002: Properties list page loads', async ({ page }) => {
    console.log('\n=== SMOKE-002: Properties List ===');
    
    await page.goto(`${PRODUCTION_FRONTEND}/properties`);
    await page.waitForLoadState('networkidle');
    
    // Verify properties page
    await expect(page.locator('text=ניהול נכסים')).toBeVisible();
    
    console.log('✓ Properties list page loaded');
  });

  test('SMOKE-003: Property details page loads (dynamic route)', async ({ page }) => {
    console.log('\n=== SMOKE-003: Property Details (Dynamic Route) ===');
    
    // First get a property ID from the API
    const propertiesResponse = await fetch(`${PRODUCTION_BACKEND}/properties?page=1&pageSize=1`, {
      headers: {
        'X-Account-Id': '061cf47d-f167-4f5d-8602-6f24792dc008', // Production account
      },
    });
    
    const propertiesData = await propertiesResponse.json();
    
    if (!propertiesData.data || propertiesData.data.length === 0) {
      console.log('⚠️ No properties found in production - skipping test');
      test.skip();
      return;
    }
    
    const propertyId = propertiesData.data[0].id;
    const propertyAddress = propertiesData.data[0].address;
    
    console.log(`→ Testing dynamic route: /properties/${propertyId}`);
    console.log(`→ Property: ${propertyAddress}`);
    
    // Navigate to property details - THIS IS THE CRITICAL TEST!
    await page.goto(`${PRODUCTION_FRONTEND}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');
    
    // VERIFY: Should NOT redirect to homepage
    expect(page.url()).toContain(`/properties/${propertyId}`);
    console.log('✓ URL is correct (not redirected to homepage)');
    
    // VERIFY: Property details are displayed (not homepage)
    const isHomepage = await page.locator('text=ברוכים הבאים למערכת').isVisible({ timeout: 2000 }).catch(() => false);
    expect(isHomepage).toBe(false);
    console.log('✓ Not showing homepage content');
    
    // VERIFY: Property details are visible
    const hasPropertyContent = await page.locator('text=פרטים').or(page.locator(`text=${propertyAddress}`)).first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasPropertyContent).toBe(true);
    console.log('✓ Property details page displayed');
    
    console.log('✓ CRITICAL: Dynamic routing works on production!');
  });

  test('SMOKE-004: Navigation from list to details works', async ({ page }) => {
    console.log('\n=== SMOKE-004: List to Details Navigation ===');
    
    // Go to properties list
    await page.goto(`${PRODUCTION_FRONTEND}/properties`);
    await page.waitForLoadState('networkidle');
    
    // Find first property link
    const firstPropertyLink = page.locator('[href^="/properties/"]').first();
    const linkExists = await firstPropertyLink.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!linkExists) {
      console.log('⚠️ No property links found - skipping test');
      test.skip();
      return;
    }
    
    console.log('→ Clicking on property link...');
    await firstPropertyLink.click();
    await page.waitForLoadState('networkidle');
    
    // VERIFY: We're on a property details page (not homepage)
    expect(page.url()).toMatch(/\/properties\/[a-f0-9-]+/);
    console.log('✓ Navigated to property details page');
    
    // VERIFY: Not homepage
    const isHomepage = await page.locator('text=ברוכים הבאים למערכת').isVisible({ timeout: 2000 }).catch(() => false);
    expect(isHomepage).toBe(false);
    console.log('✓ Property details displayed (not homepage)');
    
    console.log('✓ Navigation from list to details works!');
  });

  test('SMOKE-005: Leases page loads', async ({ page }) => {
    console.log('\n=== SMOKE-005: Leases Page ===');
    
    await page.goto(`${PRODUCTION_FRONTEND}/leases`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=חוזי שכירות').or(page.locator('text=שכירויות'))).toBeVisible();
    
    console.log('✓ Leases page loaded');
  });

  test('SMOKE-006: Tenants page loads', async ({ page }) => {
    console.log('\n=== SMOKE-006: Tenants Page ===');
    
    await page.goto(`${PRODUCTION_FRONTEND}/tenants`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=דיירים')).toBeVisible();
    
    console.log('✓ Tenants page loaded');
  });

  test('SMOKE-007: Expenses page loads', async ({ page }) => {
    console.log('\n=== SMOKE-007: Expenses Page ===');
    
    await page.goto(`${PRODUCTION_FRONTEND}/expenses`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=הוצאות')).toBeVisible();
    
    console.log('✓ Expenses page loaded');
  });
});
