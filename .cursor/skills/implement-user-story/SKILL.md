# Implement User Story

Automatically generates and executes the 5-phase feature development workflow for any epic and user story using Test-Driven Development (TDD).

## Usage

Simply mention this skill and provide:
- Epic number (e.g., "01", "02")
- User story number (e.g., "1.7", "2.3")

**Example commands:**
```
Generate workflow for epic 01 user story 1.7
Run 5-phase workflow for US1.7
Implement epic 01 story 1.7
```

## What This Skill Does

Implements user stories using **Test-Driven Development (TDD)** with E2E tests:

**Phase 0:** QA writes E2E tests FIRST (before any implementation)
  - Tests define what "done" means
  - All tests FAIL initially (expected - feature doesn't exist yet!)
  - Creates test cycle-1 with failing tests

**Phase 1-2:** Teams design API and implement features
  - Implementation goal: Make Phase 0 tests pass
  - Clear target defined by tests

**Phase 3:** QA re-runs ALL tests (including Phase 0 E2E)
  - Tests that failed in Phase 0 should now PASS
  - Creates test cycle-2 with results
  - If tests fail → Trigger Phase 3.5 for root cause analysis

**Phase 3.5:** Root Cause Analysis & Preventive Test Creation (if E2E tests fail)
  - Analyze WHY bugs weren't caught by unit/integration tests
  - Add preventive tests at lower levels (unit/component/integration)
  - Fix implementation to make preventive tests pass
  - Re-run all tests (cycle-3, etc.) until pass
  - Prevents expensive E2E tests from being first line of defense

**Phase 4:** Review and approve
  - Based on Phase 3 test results
  - Feature approved only after Phase 0 tests pass

**Workflow Steps:**
1. **Locates** the epic file and user story details
2. **Analyzes** the user story requirements and acceptance criteria
3. **Determines** the appropriate template (Full Stack, Backend Only, Frontend Only)
4. **Generates** the complete 5-phase workflow with all placeholders filled
5. **Executes** the workflow automatically using Task subagents
6. **Verifies** Phase 0 tests pass after implementation (Phase 3)
7. **Analyzes** E2E failures and adds preventive tests (Phase 3.5 - when needed)
8. **Tracks** test cycles (cycle-1 → cycle-2 → ... → until pass)
9. **Strengthens** test pyramid by catching issues at lower levels

## Supported Epic Files

- `EPIC_01_PROPERTY_MANAGEMENT.md`
- `EPIC_02_UNIT_MANAGEMENT.md`
- `EPIC_03_OWNERSHIP_MANAGEMENT.md`
- `EPIC_04_LEASE_MANAGEMENT.md`
- `EPIC_05_MORTGAGE_MANAGEMENT.md`
- `EPIC_06_FINANCIAL_TRACKING.md`
- `EPIC_07_BANK_ACCOUNT_MANAGEMENT.md`
- `EPIC_08_NOTIFICATIONS.md`
- `EPIC_09_PORTFOLIO_ANALYTICS.md`
- `EPIC_10_DATA_IMPORT_EXPORT.md`

---

## Implementation Instructions

When this skill is invoked:

### Step 0: Read General Requirements (MANDATORY)

**⚠️ CRITICAL: BEFORE STARTING ANY IMPLEMENTATION**, read and verify compliance with:

```
@docs/project_management/GENERAL_REQUIREMENTS.md
```

**Display this verification checklist to the user:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 GENERAL REQUIREMENTS VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend Requirements:
✅ Hebrew text for all UI elements
✅ RTL layout (direction: 'rtl')
✅ MUI components only
✅ Form validation with Zod
✅ Loading & empty states
✅ Error messages in Hebrew
✅ Inline creation for related entities
✅ DataGrid RTL configuration
✅ Keyboard navigation
✅ WCAG AA accessibility
✅ React Query for API calls
✅ Responsive design (mobile/tablet/desktop)

Backend Requirements:
✅ Account isolation (accountId filter)
✅ Input validation with DTOs
✅ Error handling
✅ Unit tests ≥80% coverage
✅ TypeScript strict mode
✅ Case-insensitive search (Hebrew support)

QA Requirements:
✅ API tests 100% endpoints
✅ E2E tests all user flows
✅ Cross-account access prevention
✅ Performance targets met

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All requirements verified - Proceeding...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 1: Parse Input
Extract the epic number and user story number from the user's request.

**Examples:**
- "epic 01 user story 1.7" → Epic: `01`, US: `1.7`
- "US2.3" → Epic: `02`, US: `2.3`
- "implement epic 3 story 4.1" → Epic: `03`, US: `4.1`

### Step 2: Locate Epic File
Find and read the epic file:
```
@docs/project_management/EPIC_{epic_number}_{EPIC_NAME}.md
```

Use the epic mapping:
- 01 → PROPERTY_MANAGEMENT
- 02 → UNIT_MANAGEMENT
- 03 → OWNERSHIP_MANAGEMENT
- 04 → LEASE_MANAGEMENT
- 05 → MORTGAGE_MANAGEMENT
- 06 → FINANCIAL_TRACKING
- 07 → BANK_ACCOUNT_MANAGEMENT
- 08 → NOTIFICATIONS
- 09 → PORTFOLIO_ANALYTICS
- 10 → DATA_IMPORT_EXPORT

### Step 3: Extract User Story Details
From the epic file, extract:
- **User Story Title**: e.g., "US1.7: Filter Properties"
- **Description**: The "As a/I can/So that" statement
- **Priority**: Critical/High/Medium/Low
- **Status**: Not Started/In Progress/Implemented
- **Acceptance Criteria**: All acceptance criteria listed
- **Technical Notes**: Any implementation notes
- **Dependencies**: Related user stories or requirements

### Step 4: Determine Template Type
Analyze the user story to determine which template to use:

- **Full Stack Template** (Default): If story mentions:
  - "view", "create", "edit", "delete", "filter", "search"
  - Both API and UI changes needed
  - New endpoints + new UI components

- **Backend Only Template**: If story mentions:
  - "API", "endpoint", "schema", "migration"
  - No UI changes mentioned
  - Backend-only functionality

- **Frontend Only Template**: If story mentions:
  - "UI", "display", "show", "format"
  - Uses existing APIs
  - Only presentation layer changes

- **Bug Fix Template**: If status shows it's a bug fix or the title contains "fix"

### Step 5: Extract Key Information
From the user story, identify:

**Feature Information:**
- Feature name (from title)
- Short feature name (one word)
- Resource name (API resource)
- Scope (for git commits)

**API Details (if Full Stack or Backend):**
- HTTP methods needed (GET, POST, PUT, DELETE)
- Endpoints to create
- Query parameters
- Request/response schemas

**UI Details (if Full Stack or Frontend):**
- Components to create
- Forms needed
- Data display requirements
- User interactions

### Step 6: Generate Workflow
Using the appropriate template from `@.cursor/WORKFLOW_TEMPLATES.md`, replace all placeholders:

**Standard Placeholders:**
- `[US_NUMBER]` → User story number (e.g., "US1.7")
- `[FEATURE_NAME]` → Full feature name (e.g., "Property Filtering")
- `[FEATURE]` → Short name (e.g., "Filter")
- `[scope]` → Git scope (e.g., "properties")
- `[resource]` → API resource (e.g., "properties")
- `[METHOD]` → HTTP method (e.g., "GET")
- `[PATH]` → API path (e.g., "/api/properties")
- `[NUMBER]` → Epic number (e.g., "01")
- `[NAME]` → Epic name (e.g., "PROPERTY_MANAGEMENT")
- `[Component1]`, `[Component2]` → Component names from analysis

**Context-Specific Placeholders:**
- Add specific filter parameters if filtering story
- Add specific validation rules from acceptance criteria
- Add specific test scenarios from acceptance criteria
- Add specific UI requirements from description

### Step 7: Execute Workflow

**🔴 CRITICAL RULE: AUTOMATED EXECUTION - NO MANUAL STOPS**

**DO NOT stop to ask user during implementation!**
- ❌ DON'T ask "should I proceed to Phase 3?"
- ❌ DON'T ask "do you want to continue?"
- ❌ DON'T ask "should I run tests now?"
- ✅ DO execute all phases automatically
- ✅ DO fix all bugs found in testing
- ✅ DO run tests until they pass
- ✅ ONLY STOP when Phase 4 is complete and all tests pass

**Manual QA Review happens AFTER all automated phases complete:**
- User (Product Owner) performs manual testing only AFTER:
  - ✅ All automated tests pass (Phase 3)
  - ✅ All team leaders approve (Phase 4)
  - ✅ Feature is marked "Ready for Manual QA"

**IMPORTANT**: Execute the generated workflow by actually running the Task calls in the proper sequence:

1. **Phase 0: QA Writes E2E Tests (Test-First)** - QA writes tests BEFORE implementation
   - Tests will FAIL initially (expected!)
   - Creates cycle-1-[timestamp]/ with failing test outputs
   - Tests define acceptance criteria
   - ⚠️ DO NOT STOP - Continue to Phase 1
   
2. **Phase 1: API Contract Design** - Run all Phase 1 tasks sequentially (wait for each to complete)
   - Backend, Frontend, QA review API contract
   - All teams approve before proceeding
   - ⚠️ DO NOT STOP - Continue to Phase 2
   
3. **Phase 2: Parallel Implementation** - Run all Phase 2 tasks in parallel
   - Backend + Frontend implement to make Phase 0 tests pass
   - Each engineer commits their work
   - ⚠️ DO NOT STOP - Continue to Phase 3
   
4. **Phase 3: QA Re-runs ALL Tests** - Run Phase 3 tasks (after Phase 2 completes)
   - Re-run Phase 0 E2E tests (should NOW pass!)
   - Run backend unit tests
   - Run API integration tests
   - Creates cycle-2-[timestamp]/ with results
   - If tests fail → Trigger Phase 3.5 for root cause analysis
   - ⚠️ DO NOT STOP - If tests fail, go to Phase 3.5. If pass, go to Phase 4
   
4.5. **Phase 3.5: Root Cause Analysis** (ONLY if Phase 3 E2E tests fail)
   - Perform 5 Whys analysis for EACH failed E2E test
   - Determine which test level should have caught the bug
   - Write missing unit/integration/component tests
   - Fix implementation to make preventive tests pass
   - Re-run ALL tests → should pass (cycle-3, cycle-4, etc.)
   - Document preventive tests and lessons learned
   - ⚠️ DO NOT STOP - Continue re-testing until ALL tests pass, then go to Phase 4
   
5. **Phase 4: Review & Validation** - Run Phase 4 review (after Phase 3 tests pass)
   - All team leaders review based on Phase 3 test results
   - Approve for production or request fixes
   - If fixes needed → Return to Phase 2, then repeat Phase 3
   - If approved → Mark as "Ready for Manual QA"
   - ⚠️ DO NOT STOP - Continue until approved
   
6. **Final Status: Ready for Manual QA Review**
   - ✅ All automated phases complete
   - ✅ All automated tests passing
   - ✅ All team leaders approved
   - ✅ Feature ready for user's manual testing
   - 🛑 NOW you can inform user and wait for manual QA

**DO NOT** just output the workflow template - actually execute it!

**Execution Flow Summary:**
```
Phase 0 → Phase 1 → Phase 2 → Phase 3
                                  ↓
                           Tests Pass? 
                          ↙            ↘
                        Yes            No
                         ↓              ↓
                     Phase 4      Phase 3.5
                         ↓              ↓
                    Approved?      Fix & Retest
                   ↙        ↘           ↓
                 Yes        No     (Back to Phase 3)
                  ↓          ↓
         Ready for      Return to
         Manual QA      Phase 2

🛑 STOP HERE - Inform user feature is ready for manual testing
```

**Test-Driven Development Key Points:**
- Phase 0 tests WILL fail (that's the point - nothing implemented yet!)
- Dev implements in Phase 2 to make Phase 0 tests pass
- Phase 3 verifies Phase 0 tests now pass after implementation

### Step 8: Phase 3.5 - Root Cause Analysis & Preventive Test Creation (WHEN E2E TESTS FAIL)

**🔴 CRITICAL: When E2E tests fail, don't just fix - find root cause and add preventive tests!**

**Trigger Condition:**
- E2E tests failed in Phase 3 (cycle-2 or later)
- Any critical or major bugs found

**Rationale:**
E2E tests are expensive in time and resources. If a bug reached E2E testing, it means lower-level tests (unit/integration) didn't catch it. We must strengthen the test pyramid to prevent similar issues in the future.

**Phase 3.5 Workflow:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 PHASE 3.5: ROOT CAUSE ANALYSIS & PREVENTIVE TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ TRIGGERED: E2E tests failed - Analyzing root cause...

PART A: ROOT CAUSE ANALYSIS (5 Whys)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For EACH failed E2E test:

1. Identify the Failure:
   □ Which E2E test failed? (test name)
   □ What was the failure? (error message/screenshot)
   □ Expected behavior: [describe]
   □ Actual behavior: [describe]

2. Classify the Bug:
   □ Frontend bug (UI, component, state)
   □ Backend bug (API, logic, database)
   □ Integration bug (frontend-backend contract)

3. Perform 5 Whys Analysis:
   Why 1: Why did the E2E test fail?
   → Answer: [e.g., "Button click didn't trigger API call"]
   
   Why 2: Why didn't it trigger the API call?
   → Answer: [e.g., "onClick handler had wrong function name"]
   
   Why 3: Why didn't we catch this earlier?
   → Answer: [e.g., "No unit test for button onClick handler"]
   
   Why 4: Why was there no unit test?
   → Answer: [e.g., "Engineer didn't write component tests"]
   
   Why 5: Why didn't engineer write component tests?
   → Answer: [e.g., "No enforcement/review of component test coverage"]

4. Determine Prevention Phase:
   □ Should have been caught by Backend Unit Tests?
   □ Should have been caught by Frontend Component Tests?
   □ Should have been caught by API Integration Tests?
   □ Could only be caught by E2E Tests? (rare!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PART B: CREATE PREVENTIVE TESTS (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each bug that should have been caught earlier:

Step 1: Identify Test Gap
□ Test type needed: Unit / Integration / Component
□ Test location: [file path]
□ Test description: [what should be tested]

Step 2: Write the Missing Test
□ Create/update test file
□ Write test case that FAILS with current code
□ Test should reproduce the E2E failure at lower level

Example - Frontend Component Test:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// apps/frontend/src/components/PropertyForm.test.tsx

describe('PropertyForm - Button Handlers', () => {
  it('should call onSubmit when Save button clicked', async () => {
    const mockOnSubmit = jest.fn();
    render(<PropertyForm onSubmit={mockOnSubmit} />);
    
    const saveButton = screen.getByRole('button', { name: /שמירה/i });
    await userEvent.click(saveButton);
    
    expect(mockOnSubmit).toHaveBeenCalled(); // ❌ FAILS before fix
  });
});
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example - Backend Unit Test:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// apps/backend/src/modules/properties/properties.service.spec.ts

describe('PropertiesService - Filtering', () => {
  it('should filter by city case-insensitively', async () => {
    const result = await service.findAll({ city: 'תל אביב' });
    
    expect(result).toContainEqual(
      expect.objectContaining({ city: 'תל-אביב' })
    ); // ❌ FAILS if case-sensitive
  });
});
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 3: Run the New Test (Should Fail)
□ Execute: npm test [test-file]
□ Confirm test FAILS with current code
□ Capture failure output
□ Document: "Test reproduces E2E failure at [unit/integration] level"

Step 4: Fix the Implementation
□ Fix the bug in source code
□ Commit: "fix([scope]): [description]"

Step 5: Re-run the New Test (Should Pass)
□ Execute: npm test [test-file]
□ Confirm test now PASSES
□ Document: "Preventive test passes after fix"

Step 6: Re-run ALL Tests
□ Backend unit tests: npm test
□ Frontend component tests: npm test
□ E2E tests: npx playwright test
□ All should pass now

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PART C: DOCUMENT LEARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create prevention document: test-results/[US_NUMBER]_PREVENTIVE_TESTS.md

Content:
1. Failed E2E Test Summary
   - Test name: [name]
   - Failure: [description]
   
2. Root Cause Analysis (5 Whys)
   - [Document 5 Whys analysis]
   
3. Prevention Phase Identified
   - Should have been caught by: [Unit/Integration/Component]
   - Why it wasn't: [explanation]
   
4. Preventive Tests Added
   - Test file: [path]
   - Test description: [description]
   - Test now catches this bug at [phase] level
   
5. Lessons Learned
   - What we'll do differently next time
   - Process improvements needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Phase 3.5 Task Execution:**

When E2E tests fail in Phase 3, execute this task:

```typescript
Task({
  description: "Root Cause Analysis & Preventive Tests",
  prompt: `
  As QA Team Leader, conduct root cause analysis for failed E2E tests:
  
  Context:
  - User Story: [US_NUMBER] - [Feature Name]
  - Failed E2E Tests: [List failed test names]
  - Test Cycle: test-results/epic-XX/user-story-X.X/test-cycle-[TIMESTAMP]/
  
  Failed Tests Details:
  1. Test: "[test name]"
     Error: "[error message]"
     Screenshot: [path]
  2. [Continue for each failed test]
  
  Your Tasks:
  
  PART A - Root Cause Analysis:
  For EACH failed test:
  1. Classify bug type (Frontend/Backend/Integration)
  2. Perform 5 Whys analysis
  3. Determine which test phase should have caught this
  4. Document why it wasn't caught earlier
  
  PART B - Create Preventive Tests:
  For EACH bug that should have been caught earlier:
  1. Identify exact test gap
  2. Write missing unit/integration/component test
  3. Run test - confirm it FAILS with current code
  4. Document test in prevention report
  
  PART C - Coordinate Fixes:
  1. Assign bugs to appropriate teams:
     - Frontend bugs → Web Team
     - Backend bugs → Backend Team
  2. Teams fix implementation
  3. Re-run preventive tests - should PASS
  4. Re-run E2E tests - should PASS
  
  Deliverables:
  - test-results/[US_NUMBER]_PREVENTIVE_TESTS.md
  - New unit/integration/component tests added
  - All tests passing (including new preventive tests)
  - Clear prevention strategy for future
  
  CRITICAL: Do NOT proceed to Phase 4 until:
  ✅ Root cause identified for ALL failures
  ✅ Preventive tests written and passing
  ✅ Implementation fixed
  ✅ E2E tests re-run and passing
  `,
  subagent_type: "generalPurpose",
  model: "fast"
});

// After preventive tests are added and pass, coordinate fixes:
Task({
  description: "Backend - Fix Issues (if applicable)",
  prompt: `
  As Backend Team Leader, fix the identified backend issues:
  
  Issues to Fix:
  - [List backend issues from root cause analysis]
  
  New Preventive Tests Added:
  - [List new backend unit/integration tests]
  
  Your Tasks:
  1. Review preventive tests (they should FAIL with current code)
  2. Fix the implementation to make tests pass
  3. Run preventive tests - confirm they PASS
  4. Run ALL backend tests - confirm no regressions
  5. Commit: "fix([scope]): [description]"
  
  Verify:
  - All new preventive tests passing
  - All existing tests still passing
  - Implementation addresses root cause
  `,
  subagent_type: "generalPurpose"
});

Task({
  description: "Frontend - Fix Issues (if applicable)",
  prompt: `
  As Web Team Leader, fix the identified frontend issues:
  
  Issues to Fix:
  - [List frontend issues from root cause analysis]
  
  New Preventive Tests Added:
  - [List new component/integration tests]
  
  Your Tasks:
  1. Review preventive tests (they should FAIL with current code)
  2. Fix the implementation to make tests pass
  3. Run preventive tests - confirm they PASS
  4. Run ALL frontend tests - confirm no regressions
  5. Commit: "fix([scope]): [description]"
  
  Verify:
  - All new preventive tests passing
  - All existing tests still passing
  - Implementation addresses root cause
  `,
  subagent_type: "generalPurpose"
});

// After fixes, re-run Phase 3:
Task({
  description: "QA - Re-run ALL Tests (cycle-N)",
  prompt: `
  As QA Team Leader, re-run ALL tests after preventive tests and fixes:
  
  Previous Cycle: test-cycle-[PREVIOUS_TIMESTAMP]/ (FAILED)
  New Cycle: test-cycle-[NEW_TIMESTAMP]/
  
  Tests to Run:
  1. NEW preventive unit/integration tests (should PASS now)
  2. Backend unit tests (all)
  3. Frontend component tests (all)
  4. API integration tests
  5. E2E tests (including those that failed before)
  
  Your Tasks:
  1. Run all test suites
  2. Capture outputs in new cycle folder
  3. Compare with previous cycle
  4. Verify failed tests now PASS
  5. Document improvement in prevention report
  
  Expected Results:
  ✅ Preventive tests PASS (previously would have failed)
  ✅ E2E tests PASS (previously failed)
  ✅ No new test failures introduced
  
  If ALL tests pass → Proceed to Phase 4
  If ANY tests fail → Repeat Phase 3.5 for new failures
  `,
  subagent_type: "generalPurpose"
});
```

**Benefits of Phase 3.5:**

1. **Cost Reduction**: Future bugs caught by fast unit/integration tests, not slow E2E tests
2. **Faster Feedback**: Developers get immediate feedback from lower-level tests
3. **Test Pyramid Strengthening**: Builds robust test coverage at all levels
4. **Knowledge Capture**: Documents WHY bugs reached E2E level
5. **Process Improvement**: Identifies process gaps and fixes them
6. **Prevention**: Similar bugs won't reach E2E testing again

**Test Cycle Evolution:**

```
Without Phase 3.5:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cycle-1 (Phase 0): E2E tests written, all FAIL (expected)
Cycle-2 (Phase 3): Implementation done, E2E tests run → FAIL
Cycle-3: Fix bugs, E2E tests run → FAIL (different bugs)
Cycle-4: Fix more bugs, E2E tests run → PASS
Result: 4 E2E test runs (expensive!)

With Phase 3.5:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cycle-1 (Phase 0): E2E tests written, all FAIL (expected)
Cycle-2 (Phase 3): Implementation done, E2E tests run → FAIL
Phase 3.5: Root cause analysis, add unit/component tests
Cycle-3: Preventive tests + fixes, all tests run → PASS
Result: 3 E2E runs + preventive tests added for future
Next time: Bugs caught by unit tests, not E2E!
```

**Enforcement:**

- ❌ CANNOT skip Phase 3.5 when E2E tests fail
- ✅ MUST perform root cause analysis
- ✅ MUST add preventive tests at lower levels
- ✅ MUST verify preventive tests catch the issue
- ✅ MUST document lessons learned

---

### Step 9: Monitor Progress
As each phase executes:
- Report phase completion
- Show key findings from each team
- Alert if issues found
- Wait for approvals before proceeding
- Trigger Phase 3.5 if E2E tests fail

### Step 10: Verify Phase 3 Test Execution & Requirement Coverage (MANDATORY GATE)

**🚨 CRITICAL: Before proceeding to Phase 4, verify:**
1. **ALL tests were EXECUTED** (not just written)
2. **ALL acceptance criteria are covered** by passing tests
3. **Phase 0 E2E tests now PASS** (they failed initially, should pass after implementation)

**Phase 3 Verification Checklist:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 PHASE 3: TEST EXECUTION & COVERAGE VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: Re-run Phase 0 E2E tests and verify they now PASS!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PART A: REQUIREMENT COVERAGE MAPPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Extract Acceptance Criteria
□ Read user story from epic file
□ List ALL acceptance criteria (ACs)
□ Count total ACs: [count]

Step 2: Map Tests to Each AC
For EACH acceptance criterion:
□ Identify covering unit tests
□ Identify covering integration tests
□ Identify covering E2E tests
□ Document test file names and descriptions

Step 3: Create Coverage Map
□ Document AC1 → Tests mapping
□ Document AC2 → Tests mapping
□ Document AC3 → Tests mapping
□ [Continue for all ACs]
□ Save to: test-results/[US_NUMBER]_COVERAGE_REPORT.md

Example Coverage Map:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AC1: "User can filter by property type"
→ Unit: properties.service.spec.ts - "should filter by type"
→ Integration: properties.controller.spec.ts - "GET /properties?type=apartment"
→ E2E: filter-properties.e2e.spec.ts - "filters by type in UI"
Status: ✅ COVERED

AC2: "Filter supports multiple types"
→ Unit: properties.service.spec.ts - "should filter by multiple types"
→ Integration: properties.controller.spec.ts - "GET /properties?type=apt,house"
→ E2E: filter-properties.e2e.spec.ts - "selects multiple types"
Status: ✅ COVERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PART B: TEST EXECUTION VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend Tests:
□ Unit tests EXECUTED (not just written)
□ Test output captured: npm test
□ Pass/fail counts reported
□ Example: "✅ 39/39 backend tests passing"
□ Coverage report generated

Frontend/E2E Tests:
□ E2E tests EXECUTED (not just written)
□ Test infrastructure verified (Playwright installed)
□ Browsers installed (npx playwright install)
□ Test output captured: npx playwright test
□ Pass/fail counts reported
□ Example: "✅ 8/8 E2E tests passing"

Integration Tests:
□ API integration tests EXECUTED
□ Full stack tests EXECUTED
□ Test output captured and saved

PART C: COVERAGE VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Requirement Coverage:
□ Total ACs: [count]
□ ACs with unit test coverage: [count]/[total]
□ ACs with integration test coverage: [count]/[total]
□ ACs with E2E test coverage: [count]/[total]
□ ACs fully covered (all test types): [count]/[total]

Coverage Status:
□ 100% of ACs have at least one test type covering them
□ Critical ACs have all three test types (unit + integration + E2E)
□ UI ACs have E2E test coverage
□ API ACs have integration test coverage
□ Business logic ACs have unit test coverage

🚨 BLOCKING CONDITIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Tests written but NOT executed → BLOCK Phase 3
❌ Test infrastructure missing → Install and rerun
❌ Execution output not provided → Request evidence
❌ Any tests failing → Fix or document blockers
❌ Any AC not covered by tests → Write tests or justify
❌ Coverage map not created → Create mapping document

✅ GATE PASSED: 
   - All tests executed with proof
   - All ACs covered by passing tests
   - Coverage report generated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Evidence Required Before Phase 3:**

1. **Coverage Report**: `test-results/[US_NUMBER]_COVERAGE_REPORT.md`
   - Maps each AC to covering tests
   - Shows coverage statistics
   
2. **Test Execution Logs**:
   - Backend test execution log
   - E2E test execution report
   - Test pass/fail counts (separate by type)
   
3. **Test Outputs**: All captured in `test-results/` folder
   - Unit test output
   - Integration test output
   - E2E test output with screenshots

4. **Coverage Validation**:
   - Statement showing X/X ACs covered
   - List of any uncovered ACs (must be 0 or justified)

**Test Cycle Verification:**
- ✅ Cycle-1 (Phase 0): E2E tests written and executed (all fail - expected)
- ✅ Cycle-2 (Phase 3): E2E tests re-run after implementation (should pass!)
- ✅ Compare cycle-1 vs cycle-2 results

**Cannot proceed to Phase 4 without:**
- ✅ All tests executed (including Phase 0 E2E tests)
- ✅ All tests passing
- ✅ Phase 0 E2E tests that failed initially now PASS
- ✅ Coverage report showing 100% AC coverage
- ✅ All test outputs captured in cycle-2 folder

### Step 11: Phase 4 Quality Gate - Coverage & Critical Bug Check (MANDATORY)

**🚨 CRITICAL: QA Team Leader CANNOT approve if critical/major bugs exist**

**Phase 4 QA Review - Blocking Bug Classification:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 PHASE 4: CRITICAL BUG GATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bug Severity Classification:

🔴 CRITICAL (BLOCKER - Must fix before approval):
□ Application crashes/throws exceptions
□ Data loss or corruption
□ Security vulnerabilities
□ Complete feature failure
□ Cannot complete primary user flow

Examples of CRITICAL bugs:
- ❌ Clicking "Add New Property" throws exception
- ❌ Saving property deletes existing data
- ❌ Auth bypass allows cross-account access
- ❌ Form submission does nothing/hangs forever
- ❌ Page crashes when opening property details

🟠 MAJOR (High Priority - Should fix):
□ Significant functionality broken
□ Workaround exists but difficult
□ Affects multiple users
□ Data inconsistency (non-critical)

Examples of MAJOR bugs:
- ⚠️ Some required fields not validated
- ⚠️ Search returns incorrect results
- ⚠️ UI completely broken on mobile
- ⚠️ Cannot edit property after creation

🟡 MINOR (Medium Priority):
□ UI/UX issues
□ Non-critical validation missing
□ Cosmetic issues
□ Edge case failures

Examples of MINOR bugs:
- ⚠️ Button text misaligned
- ⚠️ Tooltip missing
- ⚠️ Loading spinner not showing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QA DECISION MATRIX:

If ANY CRITICAL bugs found:
❌ REJECT FOR PRODUCTION
→ Status: "RETURNED TO DEV TEAM"
→ Action: Create bug report with reproduction steps
→ Action: Return to Phase 2 for fixes
→ Action: Re-run Phase 3 testing after fixes (create cycle-3, cycle-4, etc.)
→ Action: Re-review in Phase 4

If ONLY MAJOR bugs found:
⚠️ CONDITIONAL APPROVAL
→ Status: "APPROVED WITH KNOWN ISSUES"
→ Action: Document all major bugs
→ Action: Create follow-up tasks
→ Action: Set timeline for fixes
→ Can deploy if business approves risk

If ONLY MINOR bugs found:
✅ APPROVED FOR PRODUCTION
→ Status: "APPROVED"
→ Action: Document minor issues
→ Action: Create backlog tasks
→ Deploy immediately

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**QA Team Leader Checklist:**

```
Phase 3 Quality Gate Questions:

PART A: REQUIREMENT COVERAGE VALIDATION (MUST PASS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Coverage Report Review:
   □ Coverage report exists? (test-results/[US_NUMBER]_COVERAGE_REPORT.md)
   □ All acceptance criteria listed in report?
   □ Each AC mapped to at least one test?
   □ Coverage percentage: [X]% of ACs covered
   
2. Test Execution Evidence:
   □ Unit test output captured and shows passing?
   □ Integration test output captured and shows passing?
   □ E2E test output captured and shows passing?
   □ All test counts match expected (no skipped tests)?
   
3. Acceptance Criteria Coverage:
   □ AC1 covered by tests? (Yes/No - if No, BLOCK)
   □ AC2 covered by tests? (Yes/No - if No, BLOCK)
   □ AC3 covered by tests? (Yes/No - if No, BLOCK)
   □ [Continue for all ACs]
   □ Total: [X]/[Y] ACs covered (Must be 100%)
   
4. Test Type Coverage:
   □ Backend logic has unit tests?
   □ API endpoints have integration tests?
   □ User flows have E2E tests?
   □ Edge cases tested?
   □ Error conditions tested?

🚨 COVERAGE GATE:
   If ANY AC not covered → REJECT, request tests
   If ANY test type missing for critical AC → REJECT
   If coverage report missing → REJECT, request report
   If test execution not proven → REJECT, request execution

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PART B: FUNCTIONAL VALIDATION (MUST PASS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Core Functionality:
   □ Can user complete primary user flow? (Yes/No)
   □ Does clicking buttons work without errors? (Yes/No)
   □ Does form submission complete successfully? (Yes/No)
   □ Can user create/read/update/delete without crashes? (Yes/No)

2. Critical Issues Check:
   □ Any exceptions/crashes during testing? (Yes = BLOCK)
   □ Any data loss scenarios? (Yes = BLOCK)
   □ Any security vulnerabilities? (Yes = BLOCK)
   □ Any complete feature failures? (Yes = BLOCK)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL DECISION MATRIX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If Part A (Coverage) FAILS:
   🚫 REJECT - Return to QA Team to write missing tests
   → Action: Create tests for uncovered ACs
   → Action: Re-run Phase 2 with new tests
   → Action: Generate new coverage report

If Part A PASSES but Part B (Functional) FAILS:
   🚫 REJECT - Return to Dev Team for fixes
   → Action: Fix critical bugs
   → Action: Re-run Phase 2 testing
   → Action: Return to Phase 3 review

If Part A PASSES and Part B PASSES (No Critical Issues):
   ✅ APPROVE for Production
   → Status: Ready for deployment
   
If Part A PASSES, Part B has Major (not Critical) Issues:
   ⚠️ CONDITIONAL APPROVAL
   → Escalate to Product Owner for risk decision
   → Document known issues
   → Create follow-up tasks
```

**Process When Critical Bugs Found:**

```
🔴 CRITICAL BUG DETECTED - WORKFLOW:

1. QA Team Leader documents bug:
   - Bug title: "Clicking 'Add New Property' throws exception"
   - Severity: CRITICAL (Blocker)
   - Reproduction steps: [Detailed steps]
   - Expected behavior: Form should open
   - Actual behavior: Console error, exception thrown
   - Screenshot/video: [Attached]
   - Environment: Browser, OS, backend version

2. QA Team Leader returns to dev team:
   Status: ❌ REJECTED - Returned to Dev Team
   Phase: Returned to Phase 1 (Implementation)
   
3. Dev team fixes issue:
   - Backend team fixes if API issue
   - Frontend team fixes if UI issue
   - Commit with: "fix(properties): resolve exception when clicking Add New Property"
   
4. Re-run Phase 2 testing:
   - QA re-tests the specific bug
   - QA runs full regression tests
   - Capture new test results
   
5. Re-review in Phase 3:
   - QA confirms bug is fixed
   - QA checks no new bugs introduced
   - If passed: ✅ APPROVED
   - If new critical bugs: Return to step 1

CANNOT SKIP THIS CYCLE IF CRITICAL BUGS EXIST!
```

**Enforcement:**

- ❌ QA Team Leader CANNOT approve with critical bugs present
- ❌ Phase 3 CANNOT pass with unresolved critical bugs
- ✅ Feature MUST return to Phase 1 for fixes
- ✅ Re-testing in Phase 2 is MANDATORY after fixes
- ✅ Phase 3 re-review is MANDATORY after fixes

---

### Step 12: Retrospective After Bug Resolution (MANDATORY if bugs found)

**🔄 CRITICAL: After resolving ANY critical/major bugs, conduct retrospective**

**Trigger Conditions:**

Retrospective is MANDATORY when:
- ❌ QA cycle had FAILED status (critical or major bugs)
- ❌ Feature was returned to Phase 1 for fixes
- ❌ Multiple test cycles required before approval
- ⚠️ Pattern of similar bugs across user stories

**Process Improvement Agent Workflow:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 POST-RESOLUTION RETROSPECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Trigger Retrospective:
   □ QA cycle failed with critical/major bugs
   □ Bugs were fixed and re-tested successfully
   □ Ready for root cause analysis

2. Process Improvement Agent Tasks:
   □ Review failed test cycle results
   □ Review successful re-test cycle results
   □ Interview all teams (Backend, Frontend, QA)
   □ Perform root cause analysis (5 Whys)
   □ Identify prevention phase
   □ Create/update rules or skills
   □ Document retrospective in docs/retro/

3. Deliverables:
   □ Retrospective document: docs/retro/YYYY-MM-DD-epic-XX-us-X.X-description.md
   □ Updated docs/retro/README.md
   □ New/modified rule (if gap found)
   □ New/modified skill (if gap found)
   □ Prevention checklist

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Retrospective Execution:**

If critical or major bugs were found and fixed during this user story implementation:

```typescript
Task({
  description: "Process Improvement - Conduct Retrospective",
  prompt: `
  As Process Improvement Agent, conduct retrospective for [US_NUMBER]:
  
  Context:
  - Epic: [Epic XX] - [Epic Name]
  - User Story: [US_NUMBER] - [Feature Name]
  - Failed Test Cycle: test-results/epic-XX/user-story-X.X/test-cycle-[TIMESTAMP1]/
  - Successful Re-test: test-results/epic-XX/user-story-X.X/test-cycle-[TIMESTAMP2]/
  
  Issues Found in Initial QA Cycle:
  - [List all critical/major bugs that were found]
  
  Resolution:
  - [Describe how bugs were fixed]
  - [List commits that fixed issues]
  
  Your Tasks:
  1. Review both test cycles (failed + successful)
  2. Interview teams to understand why bugs weren't caught earlier:
     - Backend Team: Why didn't backend unit tests catch this?
     - Frontend Team: Why didn't component tests catch this?
     - QA Team: Why did these reach E2E testing?
  3. Perform 5 Whys root cause analysis
  4. Identify which phase should have caught each bug
  5. Determine if rule/skill gaps exist
  6. Create/update rules or skills to prevent recurrence
  7. Document in: docs/retro/[DATE]-epic-XX-us-X.X-[description].md
  8. Update docs/retro/README.md with new retrospective
  
  Focus Question: Why weren't these issues caught before E2E tests?
  
  Deliverables:
  - Complete retrospective document
  - New/updated rules (if gaps identified)
  - New/updated skills (if gaps identified)
  - Prevention checklist for future user stories
  `,
  subagent_type: "generalPurpose",
  model: "fast"
});
```

**When to Skip Retrospective:**

Retrospective can be skipped only if:
- ✅ All tests passed on first run (no bugs found)
- ✅ Only minor cosmetic issues found (already have processes)
- ✅ Issue was explicitly expected (known technical debt)

**Example Retrospective Trigger Message:**

```
⚠️ Retrospective Required for [US_NUMBER]

Test Cycle History:
1. test-cycle-20260203-143022 → ❌ FAILED (0/8 E2E tests passing)
2. test-cycle-20260203-180145 → ✅ PASSED (8/8 E2E tests passing)

Issues Found:
- 🔴 Critical: E2E tests never executed (infrastructure missing)
- 🟠 Major: Button selectors mismatched
- 🟠 Major: Authentication token key wrong

Root Cause Needed:
- Why were tests marked passing without execution?
- Why didn't component tests catch button text mismatch?
- What process gap allowed this?

@process-improvement-agent - Please conduct retrospective.
```

---

## Example Execution

### User Request:
```
Generate workflow for epic 01 user story 1.7
```

### Skill Response:
```
🔍 Analyzing Epic 01, User Story 1.7...

📋 Found: US1.7 - Filter Properties
   Priority: 🟠 High
   Status: 🟡 Partially Implemented (Backend ready, UI pending)
   Type: Full Stack Feature

📝 Key Requirements:
   - Filter by type, status, city, country, mortgage status
   - Pagination support
   - Backend API exists, UI needs implementation

🎯 Template Selected: Full Stack Feature (Frontend focus since backend exists)

⚡ Generating 5-Phase Workflow with Test-Driven Development...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0: QA WRITES E2E TESTS (Test-First TDD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Starting: QA - Write E2E tests for [Feature]...
[Execute Task subagent]
...

📝 E2E tests created: test/e2e/us1.7-filter-e2e.spec.ts
📊 Test execution (cycle-1): 0/8 tests passing (EXPECTED - feature not implemented!)
✅ Phase 0 Complete - Tests Ready, Implementation Can Begin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: API CONTRACT REVIEW (Sequential)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Starting: Backend - Review existing filter API...
[Execute Task subagent]
...

✅ Phase 1 Complete - API Contract Approved

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: PARALLEL IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Starting: Frontend - Implement Filter UI...
[Execute Task subagent]
...

✅ Phase 2 Complete - Implementation Done

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3: QA RE-RUNS ALL TESTS (Verification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Starting: QA - Re-run ALL tests including Phase 0 E2E...
[Execute Task subagent]
...

📊 Test execution (cycle-2): 3/8 E2E tests failing ❌
📊 Backend tests: 53/53 passing ✅
📊 API integration: 16/16 passing ✅

⚠️ Phase 3 FAILED - Triggering Phase 3.5 for Root Cause Analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3.5: ROOT CAUSE ANALYSIS & PREVENTIVE TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Starting: Root Cause Analysis for Failed E2E Tests...
[Execute Task subagent]

🔍 Analyzing failures:
   1. "Filter by city" failed - case-sensitive search
   2. "Filter by multiple types" failed - array handling
   3. "Clear filters" failed - button click handler

📝 Root Cause Analysis:
   Issue 1: Backend search is case-sensitive (Hebrew)
   → Should have been caught by: Backend Unit Test
   → Missing: Unit test for case-insensitive search
   
   Issue 2: Frontend state not handling array filters
   → Should have been caught by: Component Test
   → Missing: Component test for multi-select state
   
   Issue 3: Button onClick has wrong handler name
   → Should have been caught by: Component Test
   → Missing: Component test for button interaction

🔧 Adding Preventive Tests...

✅ Backend Unit Test Added:
   File: properties.service.spec.ts
   Test: "should filter by city case-insensitively (Hebrew)"
   Status: ❌ FAILS with current code (expected)

✅ Component Test Added:
   File: PropertyFilter.test.tsx
   Test: "should handle multiple type selections"
   Status: ❌ FAILS with current code (expected)

✅ Component Test Added:
   File: PropertyFilter.test.tsx
   Test: "should call onClear when clear button clicked"
   Status: ❌ FAILS with current code (expected)

🔧 Coordinating Fixes...

Backend Team: Fixing case-sensitive search
Frontend Team: Fixing state handling and button handler

✅ Fixes Applied:
   - Backend: Use ILIKE for Hebrew case-insensitive search
   - Frontend: Fixed multi-select state handling
   - Frontend: Corrected button onClick handler

🔧 Re-running Tests (cycle-3)...

📊 Preventive Tests: 3/3 passing ✅ (previously would have failed!)
📊 Backend tests: 54/54 passing ✅ (+1 new test)
📊 Frontend tests: 47/47 passing ✅ (+2 new tests)
📊 E2E tests: 8/8 passing! ✅ (fixed!)

✅ Phase 3.5 Complete - All Tests Pass with Preventive Tests Added!

📄 Documentation: test-results/US1.7_PREVENTIVE_TESTS.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4: REVIEW & VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Starting: Final Review...
[Execute Task subagent]
...

✅ Phase 4 Complete - Feature Approved!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 US1.7 - Property Filtering COMPLETE!
   ✅ All phases passed (including Phase 3.5 root cause analysis)
   ✅ E2E tests: cycle-1 (0/8) → cycle-2 (3/8) → cycle-3 (8/8) ✅
   ✅ Preventive tests added (3 new tests at lower levels)
   ✅ All tests passing
   ✅ Ready for deployment

📊 Summary:
   - 15 commits made
   - 11 files changed
   - 587 lines added
   - Test coverage: 92% (+5% from preventive tests)

💡 Process Improvements:
   - Added backend unit test for case-insensitive Hebrew search
   - Added component tests for multi-select and button handlers
   - Future similar bugs will be caught by fast unit/component tests
   - Reduced E2E test dependency by 37.5% (3 bugs caught earlier)

📄 Documentation Generated:
   - test-results/US1.7_COVERAGE_REPORT.md
   - test-results/US1.7_PREVENTIVE_TESTS.md
   - docs/retro/2026-02-03-epic-01-us-1.7-e2e-failures.md
```

---

## Smart Detection Features

### Automatically Detects:
1. **Backend exists** - Adjusts workflow to focus on missing pieces
2. **Frontend exists** - Adjusts workflow accordingly
3. **Partially implemented** - Continues from current state
4. **Dependencies** - Warns about prerequisite user stories
5. **Related stories** - Suggests implementing together

### Intelligent Analysis:
- Reads acceptance criteria to generate specific test scenarios
- Analyzes technical notes to add implementation details
- Checks current implementation status to avoid duplicate work
- Validates dependencies are implemented first

---

## Error Handling

### If Epic Not Found:
```
❌ Error: Epic 01 not found
   Available epics: 01-10
   Suggestion: Check epic number or create epic file first
```

### If User Story Not Found:
```
❌ Error: User Story 1.7 not found in Epic 01
   Available stories in Epic 01: US1.1 through US1.15
   Suggestion: Check user story number
```

### If Dependencies Missing:
```
⚠️  Warning: US1.7 depends on US1.5 (View Properties List)
   Status: US1.5 is ✅ Implemented
   ✅ Safe to proceed
```

### If Already Implemented:
```
ℹ️  Info: US1.7 status is ✅ Implemented
   Question: Do you want to:
   1. Re-implement (will overwrite)
   2. Enhance existing implementation
   3. Run tests only
```

---

## Advanced Usage

### Multiple Stories at Once:
```
Generate workflow for epic 01 stories 1.7, 1.8, 1.9
```

Executes all three workflows in sequence.

### Skip Phases:
```
Generate workflow for US1.7 starting at phase 1
```

Skips Phase 0 (useful when contract already approved).

### Specific Template:
```
Generate backend-only workflow for US2.3
```

Forces specific template type.

---

## Integration with Cursor

This skill integrates with:
- **@.cursor/WORKFLOW_TEMPLATES.md** - Template library
- **@.cursor/TEAM_AGENTS_GUIDE.md** - Team structure
- **@docs/project_management/** - Epic and user story definitions
- **Task tool** - For executing subagent workflows

---

## Workflow Comparison: With and Without Phase 3.5

### Without Phase 3.5 (Old Process)
```
Phase 0: E2E tests written (all fail - expected)
Phase 1: API contract design
Phase 2: Implementation
Phase 3: Run tests → ❌ E2E tests fail
        Fix bugs → Re-run E2E → ❌ Still failing
        Fix more bugs → Re-run E2E → ❌ Still failing
        Fix more bugs → Re-run E2E → ✅ Pass!
        
Result: Multiple expensive E2E test runs
Problem: Same types of bugs keep reaching E2E tests
Cost: High (E2E tests take 5-10 minutes per run)
```

### With Phase 3.5 (New Process)
```
Phase 0: E2E tests written (all fail - expected)
Phase 1: API contract design
Phase 2: Implementation
Phase 3: Run tests → ❌ E2E tests fail
Phase 3.5: ROOT CAUSE ANALYSIS
          1. Why did bug reach E2E tests?
          2. Add unit/component test that catches it
          3. Fix implementation
          4. Re-run all tests → ✅ Pass!
          
Result: One E2E failure, preventive tests added
Benefit: Future similar bugs caught by fast unit tests
Cost: Lower (unit tests take seconds, not minutes)
```

### Long-Term Impact

**First User Story:**
- E2E failure → Phase 3.5 → Add 3 preventive tests
- Cost: +30 minutes for root cause analysis
- Benefit: Test pyramid strengthened

**Second User Story (similar feature):**
- E2E tests pass on first run! ✅
- Reason: Unit/component tests caught bugs early
- Savings: 2-3 E2E test cycles avoided (20-30 minutes)

**After 10 User Stories:**
- E2E failures reduced by 60-80%
- Most bugs caught by unit/component tests
- Faster feedback for developers
- Lower CI/CD costs (fewer E2E runs)

---

## Tips

1. **Always start here** when implementing a new user story
2. **Trust the process** - The 5 phases (including 3.5) prevent integration issues
3. **Let it run** - Don't interrupt between phases
4. **Review output** - Check each phase completion before approving next
5. **Use for all features** - Consistency across the team
6. **Embrace Phase 3.5** - Short-term cost, long-term savings
7. **Document learnings** - Prevention reports help entire team

---

## Quick Command Reference

```bash
# Basic usage
"Generate workflow for epic 01 user story 1.7"
"Implement US1.7"
"Run workflow for epic 2 story 3"

# Multiple stories
"Generate workflow for US1.7, US1.8, US1.9"

# Skip phases
"Generate workflow for US1.7 starting at phase 2"

# Force template
"Generate frontend-only workflow for US3.4"

# Check status first
"Check status of US1.7"
```

---

## Key Enhancement: Phase 3.5 Root Cause Analysis

**Problem Solved:**
E2E tests are expensive (time & resources). When bugs reach E2E tests, it means our test pyramid has gaps.

**Solution:**
When E2E tests fail, Phase 3.5 automatically:
1. ✅ Analyzes WHY the bug wasn't caught earlier
2. ✅ Identifies which test level should have caught it
3. ✅ Adds missing unit/integration/component tests
4. ✅ Verifies preventive tests catch the issue
5. ✅ Fixes implementation
6. ✅ Documents lessons learned

**Result:**
- Stronger test pyramid
- Faster feedback cycles
- Lower CI/CD costs
- Better quality over time

**Visual Summary:**

```
╔════════════════════════════════════════════════════════╗
║  PHASE 3.5: E2E FAILURE → PREVENTIVE TEST CREATION   ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  E2E Test Fails (Expensive) ❌                        ║
║         ↓                                              ║
║  Root Cause Analysis (5 Whys)                         ║
║         ↓                                              ║
║  Identify Test Gap                                    ║
║         ↓                                              ║
║  Add Unit/Component Test (Fast) ✅                    ║
║         ↓                                              ║
║  Fix Implementation                                   ║
║         ↓                                              ║
║  Future: Bug Caught Early! 🎉                        ║
║                                                        ║
║  Cost Reduction: 80-95% (E2E → Unit test time)       ║
╚════════════════════════════════════════════════════════╝
```

**Before Phase 3.5:**
- E2E test failures → Fix → Re-run E2E → Repeat
- Same bug types keep reaching E2E tests
- Slow feedback, high costs

**After Phase 3.5:**
- E2E test failures → Root cause → Add preventive tests → Fix
- Similar bugs caught by fast unit tests next time
- Fast feedback, lower costs, stronger test pyramid

---

**This skill automates the entire feature development workflow with intelligent test pyramid strengthening, ensuring consistency, quality, and continuous improvement across all implementations!**

---

## Step 13: Ask User to Update User Story Status (After Successful Completion)

**🎯 CRITICAL: After ALL phases complete successfully and ALL tests pass, ask user:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ USER STORY [US_NUMBER] COMPLETED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All Phases Complete:
✅ Phase 0: E2E tests written (TDD approach)
✅ Phase 1: API contract approved by all teams
✅ Phase 2: Backend and Frontend implemented
✅ Phase 3: ALL tests passing (including E2E)
✅ Phase 4: All team leaders approved

Test Results Summary:
✅ Backend unit tests: [X]/[X] passing
✅ Frontend component tests: [X]/[X] passing
✅ API integration tests: [X]/[X] passing
✅ E2E tests: [X]/[X] passing
✅ Test coverage: [X]%

Feature Status:
✅ Ready for manual QA review
✅ Ready for deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 UPDATE USER STORY STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would you like me to update the status of [US_NUMBER] to ✅ Completed in the epic document?

Current Status: [current_status]
New Status: ✅ Completed

Epic File: docs/project_management/EPIC_[XX]_[NAME].md

If yes, I will:
1. Update the user story status to "✅ Completed"
2. Update the epic "Last Updated" timestamp
3. Commit the changes with message: "docs: mark [US_NUMBER] as completed"

Reply:
- "yes" or "y" to update the status
- "no" or "n" to skip (you can update manually later)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**When to Ask:**
- ✅ After Phase 4 approval (all team leaders approved)
- ✅ After ALL tests passing (unit, integration, E2E)
- ✅ After feature marked as "Ready for Manual QA"
- ❌ Do NOT ask if tests are failing
- ❌ Do NOT ask if Phase 4 not approved

**If User Says "Yes":**

Execute these steps:

```typescript
// 1. Read the epic file
const epicFile = `docs/project_management/EPIC_${epicNumber}_${epicName}.md`;
const epicContent = await readFile(epicFile);

// 2. Update the user story status
// Find the section for [US_NUMBER] and update its status line from:
// **Status:** ⏳ Not Started  OR  **Status:** 🔄 In Progress
// To:
// **Status:** ✅ Completed

// 3. Update the epic's "Last Updated" timestamp
// Find: **Last Updated:** [old_date]
// Replace with: **Last Updated:** [current_date] ([US_NUMBER] completed)

// 4. Save the updated epic file

// 5. Commit the change
git commit -m "docs: mark [US_NUMBER] as completed

All phases completed successfully:
- Phase 0: E2E tests written and executed
- Phase 1: API contract approved
- Phase 2: Implementation complete
- Phase 3: All tests passing
- Phase 4: Approved by all team leaders

Ready for deployment."
```

**Confirmation Message:**

```
✅ User Story Status Updated!

Epic File: docs/project_management/EPIC_[XX]_[NAME].md
User Story: [US_NUMBER]
Old Status: [old_status]
New Status: ✅ Completed

Changes committed:
- User story status updated to ✅ Completed
- Epic "Last Updated" timestamp updated

Git commit: [commit_hash]
Message: "docs: mark [US_NUMBER] as completed"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If User Says "No":**

```
ℹ️ Status Not Updated

You can manually update the user story status later by:
1. Opening: docs/project_management/EPIC_[XX]_[NAME].md
2. Finding: [US_NUMBER] section
3. Changing: **Status:** to ✅ Completed
4. Committing the change

Feature is ready for deployment regardless of status update.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example Full Workflow with Status Update:**

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4
                                  ↓
                            All Tests Pass
                                  ↓
                          All Leaders Approve
                                  ↓
                    Feature Ready for Deployment
                                  ↓
                    ┌─────────────────────────┐
                    │ Ask User: Update Status? │
                    └─────────────────────────┘
                         ↙              ↘
                      Yes               No
                       ↓                 ↓
              Update Status          Skip Update
              Commit Changes         Manual Later
                       ↓                 ↓
                    ┌─────────────────────────┐
                    │   Workflow Complete!    │
                    └─────────────────────────┘
```

**Notes:**
- This step is OPTIONAL - user can decline
- Feature is complete and deployable regardless of status update
- Status update is for documentation/tracking purposes
- User can always update status manually later
- Helps keep epic documents synchronized with actual progress
