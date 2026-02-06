import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Optimize for parallel execution
  // Local: Use 4 workers for faster test runs
  // CI: Use 2 workers (balance between speed and stability)
  workers: process.env.CI ? 2 : 4,
  
  // ✅ MANDATORY: HTML Reporter with multiple formats (GENERAL_REQUIREMENTS.md Section 24.5)
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never' // Don't auto-open during CI, manual review required
    }],
    ['list'], // Console output for CI/CD
    ['junit', { outputFile: 'test-results/junit.xml' }] // For CI/CD integration
  ],
  
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // ✅ MANDATORY: Screenshots on failure for manual review (GENERAL_REQUIREMENTS.md Section 24.5)
    screenshot: 'only-on-failure',
    
    // ✅ RECOMMENDED: Video on failure for debugging
    video: 'retain-on-failure',
    
    // ✅ RECOMMENDED: Trace on failure for interactive debugging
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // webServer disabled - using Docker containers instead
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3001',
  //   reuseExistingServer: true,
  // },
});
