# Test Results Documentation

**Location:** `docs/test-results/`  
**Purpose:** Store all test execution results organized by epic, user story, and test cycle  
**Version Control:** YES - These files should be committed to track testing history

---

## Directory Structure

```
docs/test-results/
├── epic-01/                          # Epic 01: Property Management
│   ├── user-story-1.1/               # US1.1: Create Property
│   │   ├── cycle-1-2026-02-03-14:30:22/  # First test run
│   │   │   ├── backend-unit-output.txt
│   │   │   ├── e2e-test-output.txt
│   │   │   ├── api-integration-output.txt
│   │   │   ├── TEST_REPORT.md        # QA summary and decision
│   │   │   └── screenshots/          # Optional: UI screenshots
│   │   ├── cycle-2-2026-02-03-18:01:45/  # Re-run after bug fixes
│   │   │   ├── backend-unit-output.txt
│   │   │   ├── e2e-test-output.txt
│   │   │   └── TEST_REPORT.md
│   │   └── latest -> cycle-2-2026-02-03-18:01:45/  # Symlink to latest
│   ├── user-story-1.2/
│   │   └── cycle-1-2026-02-03-15:00:00/
│   └── epic-summary/
│       └── EPIC_01_TEST_SUMMARY.md   # Final epic-level test summary
├── epic-02/
│   └── user-story-2.1/
└── README.md                         # This file
```

---

## Naming Convention

### Test Cycle Folder Format

```
cycle-<index>-<YYYY-MM-DD-HH:MM:SS>
```

**Components:**
- `<index>`: Sequential number (1, 2, 3, ...)
  - Starts at 1 for the first test run
  - Increments with each re-test (after bug fixes)
  - Helps track how many QA-to-Dev feedback loop iterations occurred
  
- `<YYYY-MM-DD-HH:MM:SS>`: Readable timestamp
  - Year-Month-Day-Hour:Minute:Second format
  - Human-readable and easily sortable
  - Uses 24-hour time format

**Examples:**
```
cycle-1-2026-02-03-14:30:22  → First test run: Feb 3, 2026 at 2:30:22 PM
cycle-2-2026-02-03-18:01:45  → Second run: Feb 3, 2026 at 6:01:45 PM  
cycle-3-2026-02-04-09:15:30  → Third run: Feb 4, 2026 at 9:15:30 AM
```

---

## Required Files in Each Test Cycle

### Mandatory Files

Every test cycle folder **MUST** contain:

#### 1. TEST_REPORT.md (ALWAYS REQUIRED)
**Purpose:** QA summary, test results, bug reports, and production readiness decision

**Template:**
```markdown
# Test Report: US[X].[Y] [Story Title]

**Epic:** [Epic Number] - [Epic Name]  
**User Story:** US[X].[Y] - [Story Title]  
**Test Cycle:** cycle-[index]-[timestamp]  
**Date:** [Readable Date]  
**Status:** [PASSED | FAILED | BLOCKED]

## Executive Summary
[Brief overview of test results]

## Test Results
[Detailed test results by category]

## Bug Summary
- Critical: [count]
- Major: [count]
- Minor: [count]

## Performance Benchmarks
[Performance test results]

## Acceptance Criteria Verification
[Checklist of all acceptance criteria with pass/fail]

## Recommendation
[QA decision: APPROVED | CONDITIONAL | REJECTED]

## Sign-Off
[Team leader approvals]
```

#### 2. Backend Test Output (if applicable)
- **backend-unit-output.txt**: Full output from `npm test -- --testPathPattern=[module]`
- **backend-e2e-output.txt**: Full output from E2E API tests

#### 3. Frontend Test Output (if applicable)
- **e2e-test-output.txt**: Full output from `npx playwright test`
- **api-integration-output.txt**: Frontend API integration tests

### Optional Files

- **screenshots/**: Browser screenshots from E2E tests
- **performance-report.txt**: Detailed performance benchmarks
- **coverage-report.html**: Test coverage HTML report
- **[engineer-name]-notes.md**: Individual engineer notes

---

## QA-to-Dev Feedback Loop

### Test Cycle Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: QA Integration Testing                            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  QA creates:                                                 │
│  docs/test-results/epic-XX/user-story-X.X/cycle-1-[time]/   │
│  - Run all tests                                             │
│  - Document results in TEST_REPORT.md                        │
│  - Include all test outputs                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
                  ┌─────────┐
                  │ Tests   │
                  │ Pass?   │
                  └─────────┘
                   │       │
              YES  │       │  NO
                   │       │
                   ↓       ↓
          ┌────────────┐  ┌─────────────────────────────────┐
          │ Phase 3:   │  │ QA notifies Dev Team:            │
          │ Review &   │  │ "Please review test results at:  │
          │ Approve    │  │ cycle-1-[time]/"                 │
          └────────────┘  └─────────────────────────────────┘
                                      ↓
                          ┌─────────────────────────────────┐
                          │ Dev Team:                        │
                          │ - Reviews TEST_REPORT.md         │
                          │ - Analyzes test outputs          │
                          │ - Fixes bugs                     │
                          │ - Commits fixes                  │
                          └─────────────────────────────────┘
                                      ↓
                          ┌─────────────────────────────────┐
                          │ Back to Phase 2 (NEW CYCLE):     │
                          │ QA creates:                      │
                          │ cycle-2-[time]/                  │
                          │ - Re-run all tests               │
                          │ - Verify bugs fixed              │
                          └─────────────────────────────────┘
                                      ↓
                                (Repeat until tests pass)
```

### Multiple Test Cycles Example

For a user story that required 3 test cycles:

```
docs/test-results/epic-01/user-story-1.1/
├── cycle-1-2026-02-03-14:30:22/  # Initial test run
│   ├── backend-unit-output.txt    (53/53 passed)
│   ├── e2e-test-output.txt        (0/8 passed) ← FAILED
│   └── TEST_REPORT.md             (Decision: Return to Dev)
│
├── cycle-2-2026-02-03-18:01:45/  # After fixing auth issues
│   ├── backend-unit-output.txt    (53/53 passed)
│   ├── e2e-test-output.txt        (1/8 passed) ← Still issues
│   └── TEST_REPORT.md             (Decision: Return to Dev)
│
├── cycle-3-2026-02-04-09:15:30/  # After fixing selectors
│   ├── backend-unit-output.txt    (53/53 passed)
│   ├── e2e-test-output.txt        (8/8 passed) ← PASSED!
│   └── TEST_REPORT.md             (Decision: Approved)
│
└── latest -> cycle-3-2026-02-04-09:15:30/
```

**This shows:**
- Initial test failed (cycle 1)
- First fix attempt still had issues (cycle 2)
- Second fix successful (cycle 3)
- Feature approved after 3 cycles

---

## When to Create New Test Cycle

Create a **new test cycle folder** when:

1. ✅ **Initial QA Testing** (Phase 2 first run)
   - Create `cycle-1-[timestamp]/`
   
2. ✅ **After Dev Team Bug Fixes**
   - QA re-runs tests after dev commits fixes
   - Create `cycle-2-[timestamp]/` (or 3, 4, etc.)
   
3. ✅ **After Major Code Changes**
   - Feature significantly modified
   - Create new cycle to verify changes

**DO NOT create new cycle** for:
- ❌ Running same tests multiple times without code changes
- ❌ Re-running individual failed tests (update same cycle folder)
- ❌ Test infrastructure debugging (use temp files)

---

## File Content Requirements

### TEST_REPORT.md Structure

**Must Include:**
1. Executive Summary
   - Overall test status (PASSED/FAILED/BLOCKED)
   - Test counts (passed/failed/skipped)
   - Critical bugs count
   
2. Test Results by Category
   - Backend unit tests
   - Backend E2E tests
   - Frontend E2E tests
   - Performance benchmarks
   
3. Bug Summary (if failures)
   - Severity classification (Critical/Major/Minor)
   - Bug descriptions
   - Steps to reproduce
   - Screenshots (if applicable)
   
4. Acceptance Criteria Verification
   - Checklist of all criteria from user story
   - Pass/fail status for each
   
5. QA Decision
   - APPROVED: All tests pass, no critical bugs
   - CONDITIONAL: Tests pass with minor known issues
   - REJECTED: Critical/major bugs, return to dev
   
6. Team Sign-Offs
   - Backend Team Leader
   - Web Team Leader
   - QA Team Leader

### Test Output Files

**backend-unit-output.txt:**
```
[Full output from: npm test -- --testPathPattern=[module]]
- Include: test names, pass/fail, timing, coverage
- Must show: Total tests, Passed, Failed, Duration
```

**e2e-test-output.txt:**
```
[Full output from: npx playwright test [spec-file]]
- Include: test names, pass/fail, timing, screenshots
- Must show: Total tests, Passed, Failed, Duration
```

**api-integration-output.txt:**
```
[Full output from: API integration tests]
- Include: endpoint tests, request/response validation
- Must show: Endpoints tested, Pass/fail, Performance
```

---

## Symlink Management

### Latest Symlink

Always maintain a `latest` symlink pointing to the most recent test cycle:

```bash
# After creating cycle-2
cd docs/test-results/epic-01/user-story-1.1
ln -sfn cycle-2-2026-02-03-18:01:45 latest

# Now latest points to cycle-2
ls -la latest/  # Shows contents of cycle-2
```

**Benefits:**
- Easy access to most recent test results
- No need to remember exact cycle number
- Scripts can always reference `latest/`

**Usage:**
```bash
# View latest test report
cat docs/test-results/epic-01/user-story-1.1/latest/TEST_REPORT.md

# Copy latest test outputs
cp docs/test-results/epic-01/user-story-1.1/latest/*.txt ./analysis/
```

---

## Quick Commands

### Creating Test Cycle Folder

```bash
# Variables
EPIC="01"
USER_STORY="1.1"
CYCLE_INDEX="1"  # Increment for re-runs (2, 3, ...)

# Create folder with readable timestamp
TIMESTAMP=$(date +%Y-%m-%d-%H:%M:%S)
TEST_DIR="docs/test-results/epic-${EPIC}/user-story-${USER_STORY}/cycle-${CYCLE_INDEX}-${TIMESTAMP}"
mkdir -p "${TEST_DIR}"

# Run tests and save outputs
cd apps/backend && npm test > "${TEST_DIR}/backend-unit-output.txt" 2>&1
cd apps/frontend && npx playwright test > "${TEST_DIR}/e2e-test-output.txt" 2>&1

# Create TEST_REPORT.md
touch "${TEST_DIR}/TEST_REPORT.md"

# Update latest symlink
cd "docs/test-results/epic-${EPIC}/user-story-${USER_STORY}"
ln -sfn "cycle-${CYCLE_INDEX}-${TIMESTAMP}" latest
```

### Viewing Test Results

```bash
# View latest test report
cat docs/test-results/epic-01/user-story-1.1/latest/TEST_REPORT.md

# View all test cycles for a user story
ls -la docs/test-results/epic-01/user-story-1.1/

# View test output from specific cycle
cat docs/test-results/epic-01/user-story-1.1/cycle-1-2026-02-03-14:30:22/e2e-test-output.txt

# Compare test results between cycles
diff docs/test-results/epic-01/user-story-1.1/cycle-1-*/TEST_REPORT.md \
     docs/test-results/epic-01/user-story-1.1/cycle-2-*/TEST_REPORT.md
```

### Finding Test Results

```bash
# Find all TEST_REPORT.md files
find docs/test-results -name "TEST_REPORT.md"

# Find all failed test cycles (grep for FAILED in reports)
grep -r "Status:.*FAILED" docs/test-results/*/*/cycle-*/TEST_REPORT.md

# Find latest test results for each user story
find docs/test-results -type l -name "latest"
```

---

## Integration with Feature Workflow

### Phase 2: QA Integration Testing

**Step 1:** Create test cycle folder
```bash
mkdir -p docs/test-results/epic-XX/user-story-X.X/cycle-1-$(date +%Y-%m-%d-%H:%M:%S)
```

**Step 2:** Run all tests and capture outputs
```bash
TEST_DIR="docs/test-results/epic-XX/user-story-X.X/cycle-1-[timestamp]"
npm test > "${TEST_DIR}/backend-unit-output.txt" 2>&1
npx playwright test > "${TEST_DIR}/e2e-test-output.txt" 2>&1
```

**Step 3:** Create TEST_REPORT.md with results

**Step 4:** Make decision
- If tests pass → Create `latest` symlink → Proceed to Phase 3
- If tests fail → Notify dev team with test cycle location

### QA-to-Dev Communication

**When tests fail, QA sends:**
```
Test cycle FAILED for US1.1. Please review:

Location: docs/test-results/epic-01/user-story-1.1/cycle-1-2026-02-03-14:30:22/
Report: TEST_REPORT.md
Outputs:
- backend-unit-output.txt: 53/53 passed ✅
- e2e-test-output.txt: 0/8 passed ❌

Critical Issues:
1. Authentication flow timeout
2. Button selector not found
3. Form submission hanging

Please fix and notify QA when ready for re-test.
```

**After dev fixes, QA creates:**
```
docs/test-results/epic-01/user-story-1.1/cycle-2-[timestamp]/
```

**Loop continues until tests pass.**

---

## Best Practices

### DO:
- ✅ Create new cycle folder for each QA test run
- ✅ Capture complete test output (don't truncate)
- ✅ Include all test types in each cycle
- ✅ Write detailed TEST_REPORT.md with actionable bugs
- ✅ Update `latest` symlink after each cycle
- ✅ Commit test results to version control
- ✅ Use sequential cycle numbers (1, 2, 3, ...)

### DON'T:
- ❌ Reuse same cycle folder for re-runs (create new cycle)
- ❌ Manually edit test output files (raw output only)
- ❌ Skip TEST_REPORT.md (always required)
- ❌ Use abbreviations in timestamps (use readable format)
- ❌ Create cycle folders without running tests
- ❌ Delete old cycle folders (keep history)

---

## Cleanup Policy

### Keep:
- ✅ All test cycle folders (historical record)
- ✅ TEST_REPORT.md files (important decisions)
- ✅ Latest test outputs (for reference)

### Clean (carefully):
- ⚠️ Screenshot folders if very large (>100MB)
- ⚠️ Old cycle folders after epic is complete and stable for 6+ months

### Never Delete:
- ❌ latest/ symlink
- ❌ TEST_REPORT.md files
- ❌ Final passing test cycle

---

## Example: Complete Test Cycle History

```
docs/test-results/epic-01/user-story-1.7/
├── cycle-1-2026-02-03-02:39:53/    # Initial test: Backend filtering missing
│   ├── backend-unit-output.txt      (53/53 passed)
│   ├── e2e-test-output.txt          (56/56 passed - but using frontend-only filtering!)
│   └── TEST_REPORT.md               (Phase 3 review caught backend gap)
│
├── cycle-2-2026-02-03-04:00:00/    # After backend filter implementation
│   ├── backend-unit-output.txt      (53/53 passed)
│   ├── backend-filter-e2e-output.txt (16/16 passed)
│   ├── e2e-test-output.txt          (56/56 passed)
│   └── TEST_REPORT.md               (APPROVED - all teams sign off)
│
└── latest -> cycle-2-2026-02-03-04:00:00/
```

**What this tells us:**
- Feature needed 2 test cycles
- Initial cycle passed frontend tests but backend review caught gap
- Second cycle verified backend implementation
- Feature approved in cycle 2

---

## Epic-Level Summary

After all user stories complete, create:
```
docs/test-results/epic-XX/epic-summary/EPIC_XX_TEST_SUMMARY.md
```

**Contains:**
- All user stories test status
- Aggregate test metrics
- Epic-level quality gates
- Overall production readiness

---

## Related Documentation

- See: `.cursor/rules/documentation-organization.mdc` - Full documentation rules
- See: `.cursor/rules/test-execution-verification.mdc` - Test execution requirements
- See: `.cursor/skills/implement-user-story/SKILL.md` - Feature workflow with testing

---

## Quick Reference

```bash
# Create cycle folder
mkdir -p docs/test-results/epic-01/user-story-1.1/cycle-1-$(date +%Y-%m-%d-%H:%M:%S)

# Run tests with output
npm test > docs/test-results/.../cycle-1-.../backend-unit-output.txt 2>&1

# Update latest symlink
ln -sfn cycle-2-2026-02-03-18:01:45 latest

# View latest report
cat docs/test-results/epic-01/user-story-1.1/latest/TEST_REPORT.md
```

---

**Last Updated:** February 3, 2026  
**Applies To:** All epics and user stories  
**Status:** ✅ MANDATORY - Must follow this structure
