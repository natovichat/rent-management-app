# Implement Epic - Complete Epic Automation

Automatically implements an entire epic by executing all user stories sequentially using the @generate-workflow skill, and automatically runs comprehensive testing at the end.

## Usage

Simply mention this skill and provide the epic number:

**Example commands:**
```
Implement epic 01
Run epic 02
Execute epic 03 completely
implement-epic 04
```

---

## What This Skill Does

This is a **meta-workflow** that orchestrates the entire epic implementation:

1. **Reads** the epic file and extracts all user stories
2. **Filters** to feature stories only (excludes testing story)
3. **Executes** each user story using @generate-workflow skill
4. **Monitors** progress and reports status after each story
5. **Automatically executes** the testing user story after all features complete
6. **Verifies** all tests pass before marking epic complete
7. **Generates** epic completion report

---

## Epic Testing User Stories

Every epic has a **final testing user story** that verifies:
- ✅ Backend unit tests (≥80% coverage)
- ✅ API integration tests (100% endpoints)
- ✅ Frontend component tests (≥90% coverage)
- ✅ E2E tests (all user flows)
- ✅ Zero failing tests
- ✅ Zero critical bugs

**Testing Stories:**
- Epic 01: US1.18 - Complete Testing Coverage for Property Management
- Epic 02: US2.9 - Complete Testing Coverage for Unit Management
- Epic 03: US3.{N} - Complete Testing Coverage for Tenant Management
- Epic 04: US4.{N} - Complete Testing Coverage for Lease Management
- ... and so on for all epics

---

## Implementation Instructions

When this skill is invoked:

### Step 0: Read General Requirements (MANDATORY)

**⚠️ CRITICAL: BEFORE STARTING ANY EPIC IMPLEMENTATION**, read and verify compliance with:

```
@docs/project_management/GENERAL_REQUIREMENTS.md
```

**Display this verification checklist to the user:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 GENERAL REQUIREMENTS VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These requirements apply to ALL user stories in this epic:

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

⚠️  These requirements will be enforced for EVERY user story in this epic.
```

### Step 1: Parse Input
Extract the epic number from the user's request.

**Examples:**
- "implement epic 01" → Epic: `01`
- "run epic 2" → Epic: `02`
- "implement-epic 03" → Epic: `03`

### Step 2: Validate Epic Number
Ensure epic number is valid (01-13).

**Epic Mapping:**
```
01 → PROPERTY_MANAGEMENT
02 → UNIT_MANAGEMENT
03 → TENANT_MANAGEMENT
04 → LEASE_MANAGEMENT
05 → OWNERSHIP_MANAGEMENT
06 → MORTGAGE_MANAGEMENT
07 → BANK_ACCOUNT_MANAGEMENT
08 → FINANCIAL_TRACKING
09 → INVESTMENT_COMPANIES
10 → DASHBOARD_ANALYTICS
11 → AUTHENTICATION
12 → NOTIFICATIONS
13 → DATA_IMPORT_EXPORT
```

### Step 3: Read Epic File
Load the epic file:
```
/Users/aviad.natovich/personal/rentApplication/docs/project_management/EPIC_{epic_number}_{EPIC_NAME}.md
```

### Step 4: Extract All User Stories
Parse the epic file to find all user stories:

**Pattern to match:**
```regex
### US(\d+\.\d+): (.+)
```

**Extract:**
- User story number (e.g., "1.1", "1.2")
- User story title
- Priority
- Status
- Acceptance criteria
- Technical details

### Step 5: Categorize User Stories

**Feature Stories:** All stories EXCEPT the testing story
**Testing Story:** The final story with "Complete Testing Coverage" in the title

**Examples:**
```
Feature Stories:
- US1.1: Create Property
- US1.2: Add Property Details
- US1.3: Add Land Registry Information
- ... (all feature stories)

Testing Story:
- US1.18: Complete Testing Coverage for Property Management
```

### Step 6: Determine Execution Order

**Smart Ordering Based on Dependencies:**

1. **Check Status:** Identify which stories are already ✅ Implemented
2. **Check Dependencies:** Look for "Dependencies:" in each story
3. **Build Execution Graph:** Topologically sort based on dependencies
4. **Filter Pending:** Only execute stories that are:
   - ⏳ Pending / 🟡 Needs Enhancement / Not Started
   - OR user explicitly requests re-implementation

Please print the execution plan to the chat

### Step 7: Execute Feature Stories Sequentially

For each feature story (in dependency order):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPIC {NUMBER} - STORY {X} OF {TOTAL}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 User Story: US{X}.{Y} - {Title}
   Priority: {Priority}
   Status: {Status}
   
🚀 Executing 4-Phase Workflow...

[Call @generate-workflow skill with epic and user story number]
[Wait for completion]

✅ User Story Complete
   Files Changed: {count}
   Tests Added: {count}
   Coverage: {percent}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Important:**
- Execute stories **one at a time** (sequential)
- Wait for each story to complete before starting next
- Log all output from each workflow execution
- Handle errors gracefully (offer to skip/retry)
- Update epic file status after each story completes

### Step 8: Generate Mid-Epic Status Report

After all feature stories complete:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPIC {NUMBER} - FEATURE IMPLEMENTATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Implementation Summary:
   ✅ Stories Completed: {count}/{total}
   📝 Total Commits: {count}
   📁 Files Changed: {count}
   ➕ Lines Added: {count}
   ➖ Lines Removed: {count}

📈 Code Coverage:
   Backend: {percent}% (Target: ≥80%)
   Frontend: {percent}% (Target: ≥90%)

⚠️  Pre-Testing Checks:
   [ ] All feature stories implemented
   [ ] No compilation errors
   [ ] No linting errors
   [ ] All dependencies installed
   [ ] Database migrations applied

🧪 Next: Execute comprehensive testing story...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 9: Execute Testing User Story

**CRITICAL:** Automatically execute the testing story after features complete.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPIC {NUMBER} - COMPREHENSIVE TESTING PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 User Story: US{X}.{Y} - Complete Testing Coverage for {Epic Name}
   Priority: 🔴 Critical
   Type: Quality Assurance / Testing

🎯 Testing Levels:
   1. Backend Unit Tests (≥80% coverage)
   2. API Integration Tests (100% endpoints)
   3. Frontend Component Tests (≥90% coverage)
   4. E2E Tests (all user flows)

🚀 Executing Testing Workflow...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: BACKEND UNIT TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Running: npm run test:backend:unit -- {epic-name}

[Execute unit tests]
[Report coverage]
[Verify ≥80% coverage]

✅ Backend Unit Tests: PASSED
   Coverage: {percent}%
   Tests Run: {count}
   Passed: {count}
   Failed: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: API INTEGRATION TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Running: npm run test:backend:integration -- {epic-name}

[Execute API tests]
[Verify all endpoints tested]

✅ API Integration Tests: PASSED
   Endpoints Tested: {count}/{total}
   Tests Run: {count}
   Passed: {count}
   Failed: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3: FRONTEND COMPONENT TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Running: npm run test:frontend -- {epic-name}

[Execute component tests]
[Report coverage]
[Verify ≥90% coverage]

✅ Frontend Component Tests: PASSED
   Coverage: {percent}%
   Components Tested: {count}
   Tests Run: {count}
   Passed: {count}
   Failed: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4: END-TO-END TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Running: npm run test:e2e -- {epic-name}

[Execute E2E tests]
[Verify all user flows tested]

✅ E2E Tests: PASSED
   User Flows Tested: {count}
   Tests Run: {count}
   Passed: {count}
   Failed: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 10: Verify Quality Gates

**All Quality Gates Must Pass:**

```
🎯 Quality Gate Verification:

Backend Coverage:
   [ ] Unit test coverage ≥ 80%        ✅ {percent}%
   
API Coverage:
   [ ] All endpoints tested (100%)     ✅ {count}/{total}
   
Frontend Coverage:
   [ ] Component test coverage ≥ 90%   ✅ {percent}%
   
E2E Coverage:
   [ ] All user flows tested           ✅ {count} flows
   
Code Quality:
   [ ] Zero failing tests              ✅ 0 failures
   [ ] Zero critical bugs              ✅ 0 bugs
   [ ] No linting errors               ✅ Clean
   [ ] No TypeScript errors            ✅ Clean
   
Performance:
   [ ] API response times < 200ms      ✅ Avg: {ms}ms
   [ ] UI render times acceptable      ✅ Pass
   
Accessibility:
   [ ] WCAG AA compliance              ✅ Pass
   [ ] Keyboard navigation works       ✅ Pass
   [ ] Screen reader compatible        ✅ Pass
```

### Step 11: Generate Epic Completion Report

If all quality gates pass:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 EPIC {NUMBER}: {EPIC_NAME} - COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Epic Statistics:
   ✅ User Stories Completed: {count}/{total}
   📝 Total Commits: {count}
   📁 Files Created/Modified: {count}
   ➕ Lines Added: {count}
   ➖ Lines Removed: {count}
   ⏱️  Total Implementation Time: {duration}

📈 Test Coverage Summary:
   Backend Unit Tests: {percent}% (Target: ≥80%) ✅
   API Integration Tests: {count}/{total} endpoints (100%) ✅
   Frontend Component Tests: {percent}% (Target: ≥90%) ✅
   E2E Tests: {count} user flows covered ✅

🎯 Quality Metrics:
   ✅ All quality gates passed
   ✅ Zero failing tests
   ✅ Zero critical bugs
   ✅ Performance targets met
   ✅ Accessibility compliance verified

📝 Implementation Breakdown:

Feature Stories Completed:
{for each feature story}
   ✅ US{X}.{Y}: {Title}
      Status: ✅ Implemented
      Files: {count}
      Tests: {count}
{end for}

Testing Story Completed:
   ✅ US{X}.{Y}: Complete Testing Coverage for {Epic Name}
      Backend Tests: {count} (Coverage: {percent}%)
      API Tests: {count} (Endpoints: {count}/{total})
      Frontend Tests: {count} (Coverage: {percent}%)
      E2E Tests: {count} (Flows: {count})

🚀 Epic Status: ✅ COMPLETE AND PRODUCTION READY

Next Steps:
   1. Deploy to staging environment
   2. Perform manual QA review
   3. Update release notes
   4. Deploy to production
   5. Monitor metrics

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 12: Update Epic File Status

Automatically update the epic file:

```markdown
**Status:** ✅ Complete  
**Completion Date:** {date}  
**Test Coverage:** Backend {percent}%, Frontend {percent}%  
**All Quality Gates:** ✅ Passed
```

---

## Smart Features

### Automatic Skip of Implemented Stories
```
ℹ️  US1.5 is already ✅ Implemented - Skipping
ℹ️  US1.8 is already ✅ Implemented - Skipping
```

### Dependency Validation
```
⚠️  US1.7 depends on US1.5
   Status: US1.5 is ✅ Implemented
   ✅ Safe to proceed
```

### Error Recovery
```
❌ US1.9 failed during implementation
   Error: API endpoint conflict

Options:
   1. Skip and continue with remaining stories
   2. Retry US1.9
   3. Abort epic implementation
   
Your choice: _
```

### Incremental Progress Tracking
```
Epic 01 Progress: ████████░░░░░░░░ 50% (8/16 stories)
Current: US1.9 - Edit Property Information
Next: US1.10 - Delete Property
Estimated Time Remaining: 2 hours
```

---

## Testing Story Execution Details

The testing story execution follows this structure:

### Backend Team Tasks:
1. Run all unit tests for epic modules
2. Generate coverage report
3. Verify ≥80% coverage
4. Document any gaps
5. Fix failing tests

### QA Team Tasks (API):
1. **Engineer 1:** Test CRUD operations
2. **Engineer 2:** Test validation & errors
3. **Engineer 3:** Test edge cases & security
4. **Engineer 4:** Test performance & data integrity

### Frontend Team Tasks:
1. **Engineer 1:** Test components
2. **Engineer 2:** Test form validations
3. **Engineer 3:** Test user interactions
4. **Engineer 4:** Test data integration (MSW)

### QA Team Tasks (E2E):
1. **Engineer 1:** Test happy path flows
2. **Engineer 2:** Test error flows
3. **Engineer 3:** Test cross-feature integration
4. **Engineer 4:** Test UI/UX & accessibility

---

## Quality Gate Failures

If any quality gate fails, the epic CANNOT be marked complete:

```
❌ QUALITY GATE FAILURE

Failed Gates:
   ❌ Backend coverage: 72% (Target: ≥80%)
   ❌ Frontend coverage: 85% (Target: ≥90%)
   ❌ 3 failing E2E tests

Epic Status: 🔴 BLOCKED

Required Actions:
   1. Add unit tests to increase backend coverage to ≥80%
   2. Add component tests to increase frontend coverage to ≥90%
   3. Fix failing E2E tests:
      - Property filter not working with multiple filters
      - Search not clearing properly
      - Delete confirmation dialog not showing

Once fixed, re-run: implement-epic {number} --testing-only
```

---

## Advanced Usage

### Implement Only Pending Stories
```
implement-epic 01 --pending-only
```

Skips all ✅ Implemented stories automatically.

### Start from Specific Story
```
implement-epic 01 --start-from US1.7
```

Starts implementation from US1.7 onwards.

### Testing Only Mode
```
implement-epic 01 --testing-only
```

Skips feature stories, only runs testing story (useful after manual fixes).

### Force Re-implementation
```
implement-epic 01 --force
```

Re-implements ALL stories, even if already marked complete.

### Dry Run
```
implement-epic 01 --dry-run
```

Shows what would be executed without actually running workflows.

### Parallel Mode (Experimental)
```
implement-epic 01 --parallel
```

Runs independent stories in parallel (be careful - can cause conflicts).

---

## Error Handling

### Epic Not Found
```
❌ Error: Epic 01 not found
   
Available Epics:
   01 - Property Management
   02 - Unit Management
   03 - Tenant Management
   ...
   
Check: /docs/project_management/EPIC_*.md
```

### Testing Story Missing
```
⚠️  Warning: No testing story found in Epic 01
   
Expected: US1.{N} with "Complete Testing Coverage" in title
   
Action: Creating testing story automatically...
✅ Testing story added: US1.18
```

### Quality Gates Not Met
```
❌ Epic 01 cannot be marked complete
   
Failed Quality Gates:
   ❌ Backend coverage: 72% (need 80%)
   ❌ 5 failing tests
   
Required Actions:
   1. Fix failing tests
   2. Add unit tests for uncovered code
   3. Re-run: implement-epic 01 --testing-only
```

---

## Integration with Other Tools

### Git Integration
- Creates feature branches for each story
- Commits after each phase
- Tags epic completion
- Pushes to remote

### CI/CD Integration
- Triggers CI pipeline after each story
- Waits for CI to pass before continuing
- Deploys to staging after testing complete

### Monitoring Integration
- Logs all execution to file
- Reports progress to dashboard
- Sends notifications on completion/failure
- Tracks metrics (time, coverage, bugs)

---

## Example Execution

### User Request:
```
implement epic 01
```

### Skill Response:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 IMPLEMENTING EPIC 01: PROPERTY MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Epic Overview:
   Name: Property Management
   Priority: 🔴 Critical
   Total Stories: 18 (17 features + 1 testing)
   Current Status: 🟡 Partially Implemented

📊 Story Status:
   ✅ Implemented: 10 stories
   🟡 Needs Enhancement: 2 stories
   ⏳ Pending: 5 stories
   🧪 Testing: 1 story

🎯 Execution Plan:
   Phase 1: Implement 7 pending/enhancement stories
   Phase 2: Execute comprehensive testing (US1.18)
   Phase 3: Verify quality gates
   Phase 4: Mark epic complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 STORY 1 OF 7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 US1.1: Create Property
   Status: 🟡 Needs Enhancement (Add remaining fields)
   Priority: 🔴 Critical

🚀 Executing 4-Phase Workflow...

[Calls @generate-workflow for US1.1]
[Shows phase-by-phase progress]

✅ US1.1 Complete
   Files Changed: 5
   Lines Added: 247
   Tests Added: 12
   Coverage: 85%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 STORY 2 OF 7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 US1.7: Filter Properties
   Status: 🟡 Partially Implemented (Backend ready, UI pending)
   Priority: 🟠 High

🚀 Executing Frontend-Focused Workflow...

[Calls @generate-workflow for US1.7]
...

✅ US1.7 Complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

... [continues for all 7 stories] ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL FEATURE STORIES COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Implementation Summary:
   ✅ Stories Completed: 7/7
   📝 Total Commits: 28
   📁 Files Changed: 42
   ➕ Lines Added: 1,847
   ⏱️  Time Elapsed: 3 hours 24 minutes

🧪 Starting Comprehensive Testing Phase...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 TESTING STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 US1.18: Complete Testing Coverage for Property Management
   Priority: 🔴 Critical
   Type: Quality Assurance

🎯 Running All Test Levels...

[Executes backend unit tests]
✅ Backend Unit Tests: PASSED (Coverage: 84%)

[Executes API integration tests]
✅ API Integration Tests: PASSED (15/15 endpoints)

[Executes frontend component tests]
✅ Frontend Component Tests: PASSED (Coverage: 92%)

[Executes E2E tests]
✅ E2E Tests: PASSED (8/8 flows)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 QUALITY GATE VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Backend coverage ≥ 80%: 84%
✅ API endpoints tested: 15/15 (100%)
✅ Frontend coverage ≥ 90%: 92%
✅ E2E flows tested: 8 flows
✅ Zero failing tests: 0 failures
✅ Zero critical bugs: 0 bugs
✅ Performance targets met
✅ Accessibility compliance verified

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 EPIC 01: PROPERTY MANAGEMENT - COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Final Statistics:
   ✅ Total Stories: 18/18 (100%)
   📝 Total Commits: 75
   📁 Files Changed: 128
   ⏱️  Total Time: 4 hours 12 minutes

📈 Test Coverage:
   Backend: 84% ✅
   Frontend: 92% ✅
   E2E: 8 flows ✅

✅ Epic Status: COMPLETE AND PRODUCTION READY

Next Epic: Epic 02 - Unit Management
   Command: implement-epic 02

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Quick Command Reference

```bash
# Basic usage
"implement epic 01"
"implement-epic 02"
"Run epic 03"

# Advanced usage
"implement epic 01 --pending-only"        # Skip implemented stories
"implement epic 01 --start-from US1.7"    # Start from specific story
"implement epic 01 --testing-only"        # Only run testing story
"implement epic 01 --force"               # Re-implement everything
"implement epic 01 --dry-run"             # Preview execution plan

# Check status
"Check epic 01 status"
"Show epic 02 progress"
```

---

## Tips for Success

1. **Let it run** - This can take hours, don't interrupt
2. **Monitor progress** - Check each story completion
3. **Review failures** - Address any errors immediately
4. **Trust the testing** - The testing story catches regressions
5. **Use incrementally** - Run pending-only to continue partial epics

---

## Files Created/Updated

This skill will automatically:
- Update epic file status after each story
- Create test files for all stories
- Generate test coverage reports
- Update documentation
- Create git commits and tags
- Generate completion report

---

**This skill automates the complete epic lifecycle from first user story to final quality verification, ensuring every epic meets production standards before being marked complete!** 🚀
