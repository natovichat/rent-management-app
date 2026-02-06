# Feature Development Workflow Templates

Reusable templates for implementing user stories following the mandatory 5-phase workflow with Test-Driven Development (TDD).

---

## 🎯 5-Phase Workflow Philosophy

### Test-Driven Development (TDD) at E2E Level

**Core Principle:** Write tests BEFORE implementation, then implement to make tests pass.

**Why This Matters:**
- ✅ **Clear Success Criteria:** Tests define what "done" means
- ✅ **No Missing Tests:** Tests can't be forgotten if written first
- ✅ **Better Design:** Thinking through test cases improves implementation design
- ✅ **Prevents Shortcuts:** Dev can't skip edge cases if tests already exist
- ✅ **Quality Gate:** Feature can't be approved until Phase 0 tests pass

**The 5 Phases:**

```
Phase 0: QA Writes E2E Tests (Test-First)
   ↓ Expected: All tests FAIL (feature doesn't exist yet)
   ↓ Create: cycle-1-[timestamp]/ with failing tests
   
Phase 1: API Contract Design
   ↓ Teams agree on API contract
   ↓ QA reviews contract aligns with Phase 0 tests
   
Phase 2: Parallel Implementation
   ↓ Backend + Frontend implement to pass Phase 0 tests
   ↓ Dev commits code when ready
   
Phase 3: QA Re-runs ALL Tests
   ↓ Re-run Phase 0 E2E tests (should now PASS)
   ↓ Run backend unit tests
   ↓ Run API integration tests
   ↓ Create: cycle-2-[timestamp]/ with results
   ↓ If tests fail → Back to Phase 2 → Create cycle-3, etc.
   
Phase 4: Review & Validation
   ✅ All team leaders approve based on Phase 3 test results
   ✅ Feature approved for production
```

**Test Cycle Tracking:**
- **Cycle 1 (Phase 0):** E2E tests written, all fail (expected)
- **Cycle 2 (Phase 3):** After implementation, tests re-run (should pass)
- **Cycle 3+ (If needed):** Re-runs after bug fixes until all pass

---

## Quick Template Selection

| Feature Type | Template | Use When |
|--------------|----------|----------|
| Full Stack Feature | Template 1 | New endpoint + UI changes |
| Backend Only | Template 2 | API changes, no UI |
| Frontend Only | Template 3 | UI changes, no API |
| Bug Fix | Template 4 | Fixing existing functionality |

---

## 🎯 5-Phase Workflow Overview

```
Phase 0: QA Writes E2E Tests (Test-First) ← NEW!
   ↓ (Tests written and fail - expected for new features)
Phase 1: API Contract Design
   ↓ (All teams approve contract)
Phase 2: Parallel Implementation
   ↓ (Backend + Frontend implemented to pass tests)
Phase 3: QA Re-runs ALL Tests (Verification)
   ↓ (All tests pass, bugs fixed)
Phase 4: Review & Validation
   ✅ (Feature approved for production)
```

**Key Principle:** Write tests BEFORE implementation, then implement to make tests pass.

---

## Template 1: Full Stack Feature (MOST COMMON)

**Use for**: New features requiring both backend API and frontend UI changes.

**🎯 Test-Driven Development (TDD) Approach:**
This template implements E2E TDD - QA writes tests BEFORE implementation:
1. Phase 0: QA writes E2E tests → All tests FAIL (expected!)
2. Phase 1: Teams design API contract
3. Phase 2: Dev implements features → Making tests pass
4. Phase 3: QA re-runs all tests → Tests now PASS ✅
5. Phase 4: Final review and approval

**Benefits:**
- Clear acceptance criteria (defined by tests)
- Prevents implementation without test coverage
- Forces QA to think through user flows upfront
- Dev implements to make tests pass (clear target)

### Copy-Paste Template

```typescript
// ════════════════════════════════════════════
// USER STORY: [US_NUMBER] - [FEATURE_NAME]
// ════════════════════════════════════════════

// ════════════════════════════════════════════
// PHASE 0: QA WRITES E2E TESTS (Test-First TDD)
// ════════════════════════════════════════════

Task({
  description: "QA - Write E2E Tests for [FEATURE]",
  prompt: `
  As QA Team Leader, write comprehensive E2E tests BEFORE any implementation:
  
  **User Story:** [US_NUMBER] - [FEATURE_NAME]
  **Reference:** @docs/project_management/EPIC_[NUMBER]_[NAME].md
  
  **Your Tasks:**
  
  1. **Read User Story Requirements:**
     - Understand feature purpose
     - Identify all user flows
     - Note acceptance criteria
  
  2. **Design E2E Test Cases:**
     Create test file: apps/frontend/test/e2e/us[X].[Y]-[feature]-e2e.spec.ts
     
     Cover:
     - TC-E2E-001: Happy path - Complete [feature] flow
     - TC-E2E-002: Happy path - [feature] with required fields only
     - TC-E2E-003: Error path - Invalid input validation
     - TC-E2E-004: Error path - [specific error scenario]
     - TC-E2E-005: Edge case - [edge case]
     - TC-E2E-006: Navigation - Cancel/back flows
     - TC-E2E-007: [Feature-specific test]
     - TC-E2E-008: [Feature-specific test]
  
  3. **Write Playwright Tests:**
     ```typescript
     import { test, expect } from '@playwright/test';
     
     test.describe('US[X].[Y] - [Feature Name]', () => {
       test.beforeEach(async ({ page }) => {
         // Setup: Login and navigate
         await page.addInitScript(() => {
           localStorage.setItem('auth_token', 'test-token-123');
         });
         await page.goto('/[feature-path]');
       });
       
       test('TC-E2E-001: Happy path - [description]', async ({ page }) => {
         // Test steps based on user story requirements
         // These will FAIL initially - that's expected!
       });
       
       // ... more tests
     });
     ```
  
  4. **Run Tests (EXPECT FAILURES):**
     Execute:
     \`\`\`bash
     cd apps/frontend
     npx playwright test test/e2e/us[X].[Y]-[feature]-e2e.spec.ts
     \`\`\`
     
     Expected: All tests FAIL (feature not implemented yet)
     This is CORRECT - we're doing Test-Driven Development!
  
  5. **Create Test Cycle Documentation:**
     Create: docs/test-results/epic-[XX]/user-story-[X].[Y]/cycle-1-[timestamp]/
     
     Save:
     - e2e-test-output.txt (failing tests - expected)
     - TEST_REPORT.md with:
       * Test cases written: [count]
       * Expected failures: [all tests]
       * Ready for dev implementation: YES
  
  6. **Document Test Expectations:**
     For dev team, document:
     - What tests are checking
     - Expected behavior for each test
     - Acceptance criteria mapping
  
  **Deliverable:**
  - E2E test file created with comprehensive test coverage
  - Test execution output (all failing - expected)
  - TEST_REPORT.md documenting test readiness
  - Dev team can now implement to make tests pass
  
  **Note:** Tests failing at this stage is EXPECTED and GOOD - it means we're following TDD!
  `,
  subagent_type: "generalPurpose"
});

// ════════════════════════════════════════════
// PHASE 1: API CONTRACT DESIGN (Sequential)
// ════════════════════════════════════════════

Task({
  description: "Backend - Design [FEATURE] API",
  prompt: `
  As Backend Team Leader, design the API contract for [FEATURE_NAME]:
  
  Define:
  1. Endpoints:
     - [METHOD] [PATH] - [PURPOSE]
     Example: POST /api/[resource] - Create new [resource]
  
  2. Request Schema:
     {
       // Define request body/params
     }
  
  3. Response Schema:
     {
       // Define response structure
     }
  
  4. Query Parameters (if applicable):
     - [param]: [type] - [description]
  
  5. Error Responses:
     - 400: [validation errors]
     - 404: [not found errors]
     - 500: [server errors]
  
  6. Validation Rules:
     - [field]: [rules]
  
  Create API specification document that Web team can review.
  
  Reference: @docs/project_management/EPIC_[NUMBER]_[NAME].md User Story [US_NUMBER]
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "Web - Review [FEATURE] API",
  prompt: `
  As Web Team Leader, review the backend API contract for [FEATURE_NAME]:
  
  Verify:
  - All UI requirements can be met with this API
  - Response format works for UI components ([specific components])
  - Pagination/filtering parameters sufficient (if applicable)
  - Error responses allow for proper user feedback
  - Loading states can be implemented
  
  Approve or request specific changes to the contract.
  
  Reference: @docs/project_management/EPIC_[NUMBER]_[NAME].md User Story [US_NUMBER]
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "QA - Test Plan for [FEATURE]",
  prompt: `
  As QA Team Leader, review API contract and create test plan for [FEATURE_NAME]:
  
  Define:
  1. Test Scenarios:
     - Happy path: [describe]
     - Edge cases: [list]
     - Error conditions: [list]
  
  2. Test Data Requirements:
     - [data needed]
  
  3. Acceptance Criteria Verification:
     [List acceptance criteria from user story]
  
  Reference: @docs/project_management/EPIC_[NUMBER]_[NAME].md User Story [US_NUMBER]
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

// ════════════════════════════════════════════
// PHASE 2: PARALLEL IMPLEMENTATION
// ════════════════════════════════════════════

Task({
  description: "Backend - Implement [FEATURE]",
  prompt: `
  As Backend Team Leader, implement [FEATURE_NAME] (4 engineers):
  
  Engineer 1: Database Schema & Migrations
  - [Specific schema changes needed]
  - Create migration: [migration description]
  - Add indexes: [which fields]
  - Commit: "feat([scope]): add [feature] schema"
  
  Engineer 2: API Endpoints & Controllers
  - Implement [METHOD] /api/[path]
  - Add DTOs: [CreateDto, UpdateDto, ResponseDto]
  - Add validation with class-validator
  - Commit: "feat([scope]): add [feature] endpoints"
  
  Engineer 3: Business Logic & Services
  - Implement [FeatureService] methods
  - Add error handling
  - Add logging
  - Commit: "feat([scope]): add [feature] business logic"
  
  Engineer 4: Integration Tests
  - Test API endpoints with real DB
  - Test all CRUD operations (if applicable)
  - Test validation rules
  - Test error cases
  - Commit: "test([scope]): add [feature] integration tests"
  
  Follow the API contract agreed in Phase 0.
  Target: 80%+ test coverage.
  
  Reference: @docs/project_management/EPIC_[NUMBER]_[NAME].md User Story [US_NUMBER]
  `,
  subagent_type: "generalPurpose"
});

Task({
  description: "Frontend - Implement [FEATURE] UI",
  prompt: `
  As Web Team Leader, implement [FEATURE_NAME] UI (4 engineers):
  
  Engineer 1: UI Components
  - Create [Component1] (form/list/card)
  - Create [Component2]
  - Add validation (React Hook Form + Zod)
  - Commit: "feat([scope]): add [feature] components"
  
  Engineer 2: API Integration
  - Create useQuery/useMutation hooks
  - Handle loading states
  - Handle error states
  - Add optimistic updates (if needed)
  - Commit: "feat([scope]): integrate [feature] with API"
  
  Engineer 3: State Management & Data Flow
  - Connect components to API hooks
  - Manage form state
  - Handle navigation/routing
  - Commit: "feat([scope]): add [feature] state management"
  
  Engineer 4: Component Tests
  - Test components with mocked API (MSW)
  - Test form validation
  - Test error handling
  - Test user interactions
  - Commit: "test([scope]): add [feature] component tests"
  
  Use the API contract agreed in Phase 0.
  Ensure responsive design (mobile, tablet, desktop).
  Ensure accessibility (WCAG AA).
  
  Reference: @docs/project_management/EPIC_[NUMBER]_[NAME].md User Story [US_NUMBER]
  `,
  subagent_type: "generalPurpose"
});

// ════════════════════════════════════════════
// PHASE 3: QA RE-RUNS ALL TESTS (Verification)
// ════════════════════════════════════════════

Task({
  description: "QA - Re-run ALL Tests for [FEATURE]",
  prompt: `
  As QA Team Leader, RE-RUN all tests after implementation is complete:
  
  **CRITICAL:** This is the verification phase - implementation should make Phase 0 tests pass!
  
  **Test Cycle Setup:**
  1. Create new test cycle folder:
     CYCLE_INDEX=2  # Phase 0 was cycle 1
     mkdir -p docs/test-results/epic-[XX]/user-story-[X].[Y]/cycle-\${CYCLE_INDEX}-$(date +%Y-%m-%d-%H:%M:%S)
  
  **Engineer 1: Re-run Backend Unit Tests**
  - Run: npm test -- --testPathPattern=[module]
  - Verify: All unit tests pass
  - Check: Coverage ≥ 80%
  - Save: backend-unit-output.txt
  
  **Engineer 2: Re-run E2E Tests from Phase 0**
  - Run: npx playwright test test/e2e/us[X].[Y]-[feature]-e2e.spec.ts
  - Verify: Tests that failed in Phase 0 now PASS
  - Check: All user flows work end-to-end
  - Save: e2e-test-output.txt
  - Save: Screenshots if any tests still fail
  
  **Engineer 3: Run API Integration Tests**
  - Test all API endpoints with real backend
  - Test [specific scenarios]
  - Test with realistic data volumes
  - Verify response times acceptable
  - Save: api-integration-output.txt
  
  **Engineer 4: Run Performance & Edge Case Tests**
  - Measure API response times
  - Test with large datasets
  - Verify frontend performance
  - Test edge cases and boundary conditions
  - Save: performance-test-output.txt
  
  **Create TEST_REPORT.md:**
  Include:
  - Comparison with Phase 0 results (cycle 1 vs cycle 2)
  - Tests that were failing and are now passing
  - Any remaining failures (critical/major/minor)
  - Performance benchmarks
  - Decision: APPROVED / REJECTED / CONDITIONAL
  
  **If Tests Fail:**
  - Document failures clearly in TEST_REPORT.md
  - Notify dev team: "Please review cycle-[index]-[timestamp]/"
  - Return to Phase 2 for fixes
  - Create cycle-3 when ready for re-test
  
  **If Tests Pass:**
  - All acceptance criteria met
  - No critical/major bugs
  - Proceed to Phase 4 for final approval
  
  Reference: @docs/project_management/EPIC_[NUMBER]_[NAME].md User Story [US_NUMBER]
  `,
  subagent_type: "generalPurpose"
});

// ════════════════════════════════════════════
// PHASE 4: REVIEW & VALIDATION
// ════════════════════════════════════════════

Task({
  description: "Final Review - [FEATURE]",
  prompt: `
  Each team leader perform final review for [FEATURE_NAME]:
  
  **Review Phase 3 Test Results:**
  Location: docs/test-results/epic-[XX]/user-story-[X].[Y]/latest/TEST_REPORT.md
  
  Backend Team Leader:
  - Review API code quality and patterns
  - Verify query optimization and indexes
  - Verify Phase 3 backend tests all pass
  - Check backend unit test coverage ≥ 80%
  - Check error handling and logging
  - Verify security (input validation, auth)
  - Confirm API documentation updated
  
  Frontend Team Leader:
  - Review UI/UX quality
  - Verify responsive design works
  - Check accessibility compliance
  - Verify error messages are user-friendly
  - Confirm component patterns followed
  - Verify Phase 3 E2E tests all pass (tests from Phase 0 should now pass!)
  
  QA Team Leader:
  - Verify all acceptance criteria met
  - Confirm test coverage adequate (80%+)
  - Review Phase 3 integration test results
  - Check for edge cases coverage
  - Verify performance benchmarks met
  - Verify E2E tests from Phase 0 all pass after implementation
  - Check test cycle comparison (cycle 1 → cycle 2 improvements)
  
  Each team: Approve for production OR list specific issues that must be fixed.
  
  Reference: @docs/project_management/EPIC_[NUMBER]_[NAME].md User Story [US_NUMBER]
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});
```

### Customization Points

Replace these placeholders:
- `[US_NUMBER]`: User story number (e.g., US1.7)
- `[FEATURE_NAME]`: Feature name (e.g., Property Filtering)
- `[FEATURE]`: Short feature name (e.g., Filter)
- `[scope]`: Git commit scope (e.g., properties)
- `[resource]`: API resource name (e.g., properties)
- `[METHOD]`: HTTP method (GET, POST, PUT, DELETE)
- `[PATH]`: API path (e.g., /api/properties)
- `[NUMBER]`: Epic number (e.g., 01)
- `[NAME]`: Epic name (e.g., PROPERTY_MANAGEMENT)
- `[Component1]`, `[Component2]`: Actual component names

---

## Template 2: Backend Only Feature

**Use for**: API changes without frontend UI updates.

```typescript
// ════════════════════════════════════════════
// USER STORY: [US_NUMBER] - [FEATURE_NAME] (Backend Only)
// ════════════════════════════════════════════

// ════════════════════════════════════════════
// PHASE 0: API DESIGN
// ════════════════════════════════════════════

Task({
  description: "Backend - Design [FEATURE] API",
  prompt: `
  As Backend Team Leader, design the API for [FEATURE_NAME]:
  
  [Same as Template 1 Phase 0]
  
  Note: No immediate frontend changes, but document for future UI use.
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "QA - API Test Plan",
  prompt: `
  As QA Team Leader, create comprehensive API test plan:
  [Focus on API testing only]
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

// ════════════════════════════════════════════
// PHASE 1: BACKEND IMPLEMENTATION
// ════════════════════════════════════════════

Task({
  description: "Backend - Implement [FEATURE]",
  prompt: `
  As Backend Team Leader, implement [FEATURE_NAME]:
  
  [Same engineer breakdown as Template 1]
  
  Add comprehensive API documentation (Swagger).
  `,
  subagent_type: "generalPurpose"
});

// ════════════════════════════════════════════
// PHASE 2: API TESTING
// ════════════════════════════════════════════

Task({
  description: "QA - API Testing",
  prompt: `
  As QA Team Leader, thoroughly test API:
  
  All 4 engineers focus on API testing:
  - Integration tests
  - Load testing
  - Security testing
  - Edge cases
  `,
  subagent_type: "generalPurpose"
});

// ════════════════════════════════════════════
// PHASE 3: REVIEW
// ════════════════════════════════════════════

Task({
  description: "Final Review - [FEATURE] API",
  prompt: `
  Backend and QA teams review:
  
  - API quality and performance
  - Documentation completeness
  - Test coverage
  - Security validation
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});
```

---

## Template 3: Frontend Only Feature

**Use for**: UI changes without backend API changes.

```typescript
// ════════════════════════════════════════════
// USER STORY: [US_NUMBER] - [FEATURE_NAME] (Frontend Only)
// ════════════════════════════════════════════

// ════════════════════════════════════════════
// PHASE 0: DESIGN REVIEW
// ════════════════════════════════════════════

Task({
  description: "Web - Design [FEATURE] UI",
  prompt: `
  As Web Team Leader, design UI for [FEATURE_NAME]:
  
  1. Component structure
  2. Data requirements (from existing APIs)
  3. State management approach
  4. User interactions
  
  Document design for QA test planning.
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "QA - UI Test Plan",
  prompt: `
  As QA Team Leader, create UI test plan:
  
  Focus on user interactions, accessibility, responsiveness.
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

// ════════════════════════════════════════════
// PHASE 1: FRONTEND IMPLEMENTATION
// ════════════════════════════════════════════

Task({
  description: "Frontend - Implement [FEATURE]",
  prompt: `
  As Web Team Leader, implement [FEATURE_NAME] UI:
  
  [Same engineer breakdown as Template 1 Frontend]
  
  Use existing API endpoints (no backend changes needed).
  `,
  subagent_type: "generalPurpose"
});

// ════════════════════════════════════════════
// PHASE 2: UI TESTING
// ════════════════════════════════════════════

Task({
  description: "QA - UI Testing",
  prompt: `
  As QA Team Leader, test UI thoroughly:
  
  All 4 engineers focus on UI testing:
  - E2E user flows
  - Accessibility testing
  - Responsive design testing
  - Cross-browser testing
  `,
  subagent_type: "generalPurpose"
});

// ════════════════════════════════════════════
// PHASE 3: REVIEW
// ════════════════════════════════════════════

Task({
  description: "Final Review - [FEATURE] UI",
  prompt: `
  Frontend and QA teams review:
  
  - UX quality
  - Accessibility compliance
  - Responsive design
  - Test coverage
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});
```

---

## Template 4: Bug Fix

**Use for**: Fixing existing functionality (abbreviated workflow).

```typescript
// ════════════════════════════════════════════
// BUG FIX: [BUG_ID] - [BUG_DESCRIPTION]
// ════════════════════════════════════════════

// ════════════════════════════════════════════
// PHASE 0: INVESTIGATION
// ════════════════════════════════════════════

Task({
  description: "QA - Reproduce & Document Bug",
  prompt: `
  As QA Team Leader, reproduce and document bug [BUG_ID]:
  
  1. Reproduction steps
  2. Expected vs actual behavior
  3. Impact assessment
  4. Affected components (backend/frontend/both)
  5. Write failing test that reproduces bug
  
  Determine: Backend fix needed? Frontend fix needed? Both?
  `,
  subagent_type: "generalPurpose",
  model: "fast"
});

// ════════════════════════════════════════════
// PHASE 1: FIX IMPLEMENTATION
// ════════════════════════════════════════════

Task({
  description: "[Backend/Frontend] - Fix Bug",
  prompt: `
  As [Backend/Frontend] Team Leader, fix bug [BUG_ID]:
  
  1. Identify root cause
  2. Implement fix
  3. Verify failing test now passes
  4. Add additional tests if needed
  5. Commit: "fix([scope]): [bug description]"
  
  Ensure no regressions introduced.
  `,
  subagent_type: "generalPurpose"
});

// ════════════════════════════════════════════
// PHASE 2: VERIFICATION
// ════════════════════════════════════════════

Task({
  description: "QA - Verify Bug Fix",
  prompt: `
  As QA Team Leader, verify bug fix:
  
  1. Confirm original reproduction steps now work
  2. Run regression test suite
  3. Test edge cases related to fix
  4. Verify no new issues introduced
  
  Approve fix or report remaining issues.
  `,
  subagent_type: "generalPurpose",
  model: "fast"
});

// ════════════════════════════════════════════
// PHASE 3: REVIEW (Optional for minor bugs)
// ════════════════════════════════════════════

Task({
  description: "Review Bug Fix",
  prompt: `
  Quick review of bug fix:
  
  - Code quality
  - Test coverage
  - No regressions
  
  Approve for deployment.
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});
```

---

## Quick Start Guide

### Step 1: Choose Template
Select based on feature type (full stack, backend only, frontend only, bug fix).

### Step 2: Customize Placeholders
Replace all `[PLACEHOLDERS]` with actual values.

### Step 3: Paste into Chat
Copy the customized template and paste into Agent mode.

### Step 4: Execute Phases Sequentially
Let each phase complete before starting the next.

---

## Example: Complete Workflow

**User Story**: US1.7 - Property Filtering

### Customized Template

```typescript
// USER STORY: US1.7 - Property Filtering

// PHASE 0: API CONTRACT DESIGN
Task({
  description: "Backend - Design Filter API",
  prompt: `
  As Backend Team Leader, design the property filtering API contract:
  
  Define:
  1. Endpoint: GET /api/properties with query params
  2. Query Parameters:
     - type: RESIDENTIAL | COMMERCIAL | LAND | MIXED_USE
     - status: OWNED | IN_CONSTRUCTION | IN_PURCHASE | SOLD | INVESTMENT
     - city: string
     - country: string (default: "Israel")
     - isMortgaged: boolean
     - page: number (default: 1)
     - limit: number (default: 20)
  
  3. Response format:
     {
       items: Property[],
       total: number,
       page: number,
       totalPages: number
     }
  
  4. Error responses (400 for invalid params)
  
  Create API specification document.
  
  Reference: @docs/project_management/EPIC_01_PROPERTY_MANAGEMENT.md User Story US1.7
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

// [Rest of phases...]
```

---

## Tips for Success

1. **Always start with Phase 0** - QA writes E2E tests first (TDD approach)
2. **Expect failures in Phase 0** - Tests failing means you're doing TDD correctly!
3. **Use Phase 0 tests as acceptance criteria** - Implementation goal is to pass these tests
4. **Wait for API contract approval** - Don't proceed to Phase 2 until Phase 1 contract approved
5. **Commit frequently** - Each engineer commits their work during Phase 2
6. **Re-run ALL tests in Phase 3** - Including Phase 0 E2E tests (should now pass!)
7. **Track test cycles** - Use cycle-1, cycle-2, cycle-3... to show iteration history
8. **Don't skip Phase 3** - Re-testing verifies implementation works end-to-end
9. **Get full approval in Phase 4** - All team leaders must approve based on Phase 3 results

---

## Troubleshooting

**Q: Phase 0 E2E tests taking too long to write?**  
A: Good! Time spent here ensures comprehensive test coverage before implementation.

**Q: Can we skip Phase 0 for small features?**  
A: Only for very minor bug fixes. For new features, always write tests first (TDD principle).

**Q: All Phase 0 tests failed - is this bad?**  
A: No! This is EXPECTED and GOOD. Tests failing in Phase 0 means the feature isn't implemented yet (correct!).

**Q: Phase 3 tests still failing after implementation?**  
A: Create cycle-3 folder, notify dev team, return to Phase 2 for fixes. Repeat until tests pass.

**Q: How many test cycles are acceptable?**  
A: Ideally 2 cycles (Phase 0 fail → Phase 3 pass). 3-4 cycles is normal. 5+ suggests implementation issues.

**Q: Can dev start before Phase 0 tests are written?**  
A: NO! Phase 0 must complete first. Tests define what "done" means.

**Q: Teams disagree on API contract in Phase 1?**  
A: Discuss until consensus. Reference Phase 0 tests to guide decisions.

---

## 📋 Workflow Update History

### February 3, 2026: Added Phase 0 (QA Writes E2E Tests First)

**Change:** Shifted from 4-phase to 5-phase workflow

**Previous Workflow:**
1. Phase 0: API Contract Design
2. Phase 1: Parallel Implementation
3. Phase 2: Integration Testing
4. Phase 3: Review & Validation

**New Workflow (Test-Driven):**
1. **Phase 0: QA Writes E2E Tests (NEW!)** ← Tests written first, all fail (expected)
2. Phase 1: API Contract Design (previously Phase 0)
3. Phase 2: Parallel Implementation (previously Phase 1)
4. Phase 3: QA Re-runs ALL Tests (previously Phase 2)
5. Phase 4: Review & Validation (previously Phase 3)

**Benefits:**
- ✅ Forces test-first development
- ✅ Clear acceptance criteria defined upfront
- ✅ Prevents "tests written but not executed" issues
- ✅ Dev team implements to make tests pass (clear target)
- ✅ QA can't approve until Phase 0 tests pass
- ✅ Better quality, fewer bugs in production

**Test Cycle Naming:**
- Cycle 1: Phase 0 (tests written, all fail)
- Cycle 2: Phase 3 (after implementation, should pass)
- Cycle 3+: Re-tests after bug fixes

---

**Remember**: These templates enforce professional development practices with Test-Driven Development. Follow them for quality, maintainable features!
