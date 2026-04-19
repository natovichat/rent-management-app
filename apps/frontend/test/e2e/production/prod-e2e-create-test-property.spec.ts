/**
 * Production E2E — יצירת נכס פיקטיבי לבדיקות
 *
 * ה-API בפרודקשן דורש JWT תקף (חתום בשרת). Mock token מהבדיקות המקומיות לא יעבוד.
 *
 * הרצה:
 *   export E2E_PROD_JWT="<הדבק את ה-auth_token מ-localStorage אחרי התחברות לפרוד>"
 *   export FRONTEND_URL="https://rent-management-app-frontend.vercel.app"
 *   export BACKEND_URL="https://rent-app-backend-33ifaayi2a-uc.a.run.app/api"
 *   cd apps/frontend && npx playwright test test/e2e/production/prod-e2e-create-test-property.spec.ts
 *
 * ניקוי (מחיקה רכה): export E2E_CLEANUP=1
 */

import { test, expect } from '@playwright/test';

const BACKEND_URL =
  process.env.BACKEND_URL || 'https://rent-app-backend-33ifaayi2a-uc.a.run.app/api';
const TOKEN = process.env.E2E_PROD_JWT?.trim() || '';
const CLEANUP = process.env.E2E_CLEANUP === '1' || process.env.E2E_CLEANUP === 'true';

/** קידומת מזהה לכתובת — "נכס בדיקות" (המשתמש כתב לעיתים "נכנס" במקום "נכס") */
const TEST_ADDRESS_PREFIX = 'נכס בדיקות';

test.describe('Production — create test property (API)', () => {
  test.beforeEach(() => {
    test.skip(!TOKEN, 'Set E2E_PROD_JWT to the real JWT from browser localStorage (auth_token) after logging in to production.');
  });

  test('POST property, verify in list, optional DELETE', async ({ request }) => {
    const address = `${TEST_ADDRESS_PREFIX} — E2E ${Date.now()}`;

    const createRes = await request.post(`${BACKEND_URL}/properties`, {
      data: { address },
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    expect(
      createRes.ok(),
      `Create failed: ${createRes.status()} ${await createRes.text()}`,
    ).toBeTruthy();

    const created = await createRes.json();
    expect(created.id).toBeTruthy();
    expect(created.address).toContain(TEST_ADDRESS_PREFIX);

    const search = encodeURIComponent(TEST_ADDRESS_PREFIX);
    const listRes = await request.get(
      `${BACKEND_URL}/properties?search=${search}&limit=100&page=1`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );
    expect(listRes.ok(), await listRes.text()).toBeTruthy();
    const listBody = await listRes.json();
    const found = (listBody.data || []).some(
      (p: { id: string; address?: string }) =>
        p.id === created.id || p.address?.includes(TEST_ADDRESS_PREFIX),
    );
    expect(found, 'Created property should appear in search results').toBe(true);

    if (CLEANUP) {
      const del = await request.delete(`${BACKEND_URL}/properties/${created.id}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      expect(del.ok(), await del.text()).toBeTruthy();
    }
  });
});
