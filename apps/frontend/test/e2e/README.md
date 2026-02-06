# E2E Tests Setup Guide

## Prerequisites

1. **Install Playwright:**
```bash
cd apps/frontend
npm install -D @playwright/test
```

2. **Install browsers:**
```bash
npx playwright install
```

3. **Create Playwright config** (`apps/frontend/playwright.config.ts`):
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

4. **Ensure backend is running:**
```bash
cd apps/backend
npm run start:dev
```

## Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test apps/frontend/test/e2e/us1.1-engineer2-e2e-ui.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with UI mode
npx playwright test --ui
```

## Test Structure

- `us1.1-engineer2-e2e-ui.spec.ts` - E2E user flow tests for US1.1 Property Creation
