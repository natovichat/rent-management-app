# Workflow Update: 5-Phase Test-Driven Development

**Date:** February 3, 2026  
**Change Type:** Major Workflow Enhancement  
**Status:** ✅ Implemented

---

## 🎯 What Changed

### From 4-Phase to 5-Phase Workflow

**OLD (4 Phases):**
```
Phase 0: API Contract Design
   ↓
Phase 1: Parallel Implementation
   ↓
Phase 2: Integration Testing
   ↓
Phase 3: Review & Validation
```

**NEW (5 Phases with TDD):**
```
Phase 0: QA Writes E2E Tests FIRST (NEW!)
   ↓ (Tests fail - expected!)
   ↓ (Create: cycle-1-[timestamp]/)
   
Phase 1: API Contract Design
   ↓
   
Phase 2: Parallel Implementation
   ↓ (Dev makes Phase 0 tests pass)
   
Phase 3: QA Re-runs ALL Tests
   ↓ (Phase 0 tests now pass!)
   ↓ (Create: cycle-2-[timestamp]/)
   
Phase 4: Review & Validation
   ✅ (Approve for production)
```

---

## 🔥 Key Innovation: Test-Driven Development at E2E Level

### Core Principle

**Write E2E tests BEFORE implementing the feature**

This enforces:
1. ✅ **Clear acceptance criteria** - Tests define what "done" means
2. ✅ **Cannot forget tests** - Tests exist before code
3. ✅ **Better design** - Thinking through test cases improves implementation
4. ✅ **Quality gate** - Feature can't be approved until Phase 0 tests pass
5. ✅ **Prevents shortcuts** - Dev can't skip edge cases if tests exist

---

## 📋 New Phase 0: QA Writes E2E Tests

### What Happens in Phase 0

**QA Team Leader Task:**
1. Read user story requirements
2. Design comprehensive E2E test cases
3. Write Playwright tests in `apps/frontend/test/e2e/us[X].[Y]-[feature]-e2e.spec.ts`
4. Run tests → ALL FAIL (expected - feature not implemented!)
5. Create test cycle documentation:
   - Location: `docs/test-results/epic-XX/user-story-X.X/cycle-1-[timestamp]/`
   - Files: `e2e-test-output.txt` (failing tests), `TEST_REPORT.md`

### Example Phase 0 Test Output

```
Running 8 tests using 2 workers

  ✘  TC-E2E-001: Happy path - Create property (30.0s)
  ✘  TC-E2E-002: Happy path - Required fields only (12.0s)  
  ✘  TC-E2E-003: Error path - Invalid input (30.0s)
  ✘  TC-E2E-004: Error path - Negative value (30.0s)
  ✘  TC-E2E-005: Edge case - Special characters (30.0s)
  ✘  TC-E2E-006: Navigation - Cancel flow (30.0s)
  ✘  TC-E2E-007: UI - Form validation (30.0s)
  ✘  TC-E2E-008: UI - Success message (30.0s)

8 tests, 0 passed, 8 failed
```

**This is CORRECT!** ✅ Tests failing means feature isn't implemented (we're doing TDD).

---

## 🔄 Test Cycle Tracking

### Test Cycles Explained

**Cycle Index** tracks QA-to-Dev feedback loop iterations:

**cycle-1-[timestamp]** (Phase 0):
- QA writes E2E tests
- Executes tests
- All tests fail (feature doesn't exist)
- Status: EXPECTED - Ready for implementation

**cycle-2-[timestamp]** (Phase 3):
- After Phase 2 implementation
- QA re-runs ALL tests
- Tests should now PASS
- Status: If pass → Approve | If fail → Return to Phase 2

**cycle-3-[timestamp]** (Phase 3 re-run):
- After dev fixes bugs from cycle-2
- QA re-runs tests again
- Status: If pass → Approve | If fail → Return to Phase 2

**cycle-N-[timestamp]**:
- Continue until all tests pass
- Then proceed to Phase 4 approval

---

## 📊 Test Cycle Naming Convention

### Format: `cycle-<index>-<YYYY-MM-DD-HH:MM:SS>`

**Examples:**
```
cycle-1-2026-02-03-14:30:22   First test (Phase 0) - all fail
cycle-2-2026-02-03-18:01:45   Re-test (Phase 3) - some pass
cycle-3-2026-02-04-09:15:30   Re-test (Phase 3) - all pass!
```

**Location:** `docs/test-results/epic-XX/user-story-X.X/`

**Why Under docs/?**
- Test results are documentation
- Tracked in version control
- Historical record of QA efforts
- Easy to find alongside project docs

---

## 🎯 Benefits of New Workflow

### 1. Tests Can't Be Forgotten
**OLD:** Dev implements → QA writes tests (if time permits)  
**NEW:** QA writes tests → Dev implements to pass them

**Result:** 100% test coverage guaranteed

### 2. Clear Success Criteria
**OLD:** "Feature should work" (vague)  
**NEW:** "All Phase 0 tests must pass" (concrete)

**Result:** No ambiguity about "done"

### 3. Prevents "Tests Written But Not Executed" Issue
**OLD:** Tests written but not run → feature marked complete  
**NEW:** Tests run in Phase 0 (fail) → Tests re-run in Phase 3 (must pass)

**Result:** Tests MUST be executed twice (Phase 0 + Phase 3)

### 4. Better Implementation Quality
**OLD:** Dev guesses at edge cases  
**NEW:** Dev sees all test cases upfront

**Result:** Comprehensive implementation from the start

### 5. Clear QA Approval Criteria
**OLD:** "Tests pass" (which tests?)  
**NEW:** "Phase 0 tests now pass after implementation"

**Result:** Explicit verification that implementation meets requirements

---

## 📝 Updated Files

### 1. Workflow Templates
**File:** `.cursor/WORKFLOW_TEMPLATES.md`

**Changes:**
- Updated Template 1 (Full Stack) to 5-phase workflow
- Added Phase 0: QA Writes E2E Tests section
- Renamed Phase 1 → Phase 2, Phase 2 → Phase 3, Phase 3 → Phase 4
- Added TDD philosophy explanation
- Updated tips and troubleshooting

### 2. Implement User Story Skill
**File:** `.cursor/skills/implement-user-story/SKILL.md`

**Changes:**
- Updated description from "4-phase" to "5-phase"
- Added Phase 0 explanation
- Updated Step 7: Execute Workflow with Phase 0-4 breakdown
- Updated Step 9: Phase 3 Verification (was Phase 2)
- Updated Step 10: Phase 4 Quality Gate (was Phase 3)
- Added test cycle comparison examples
- Updated workflow execution example to show 5 phases

### 3. Documentation Organization Rule
**File:** `.cursor/rules/documentation-organization.mdc`

**Changes:**
- Updated test results location: `test-results/` → `docs/test-results/`
- Updated cycle naming: `test-cycle-YYYYMMDD-HHMMSS` → `cycle-<index>-YYYY-MM-DD-HH:MM:SS`
- Added cycle index explanation
- Added "Why under docs/" rationale
- Updated all examples with new format

### 4. Test Results Guide
**File:** `docs/test-results/README.md`

**Changes:**
- Created comprehensive guide for test results
- Documented cycle naming convention
- Explained QA-to-Dev feedback loop
- Provided quick commands and examples

---

## 🎓 How to Use the New Workflow

### For QA Engineers

**Phase 0 (First thing you do):**
```bash
1. Read user story requirements
2. Write E2E tests: apps/frontend/test/e2e/us[X].[Y]-[feature]-e2e.spec.ts
3. Run tests: npx playwright test [file]
4. Expect: ALL TESTS FAIL (this is correct!)
5. Create cycle-1-[timestamp]/ with failing test outputs
6. Document in TEST_REPORT.md: "Tests ready, ready for implementation"
```

**Phase 3 (After dev implements):**
```bash
1. Determine next cycle index (2, 3, 4, ...)
2. Create cycle-[index]-[timestamp]/ folder
3. Re-run Phase 0 E2E tests (should NOW pass!)
4. Run backend unit tests
5. Run API integration tests
6. Create TEST_REPORT.md with cycle comparison
7. If tests pass → Proceed to Phase 4
8. If tests fail → Notify dev, return to Phase 2, increment cycle
```

### For Dev Engineers

**Before Phase 2:**
- Review Phase 0 E2E tests
- Understand what tests are checking
- Implementation goal: Make these tests pass

**During Phase 2:**
- Implement features
- Run Phase 0 tests locally to check progress
- Commit when tests pass

**After Phase 3:**
- If tests fail, review cycle-[N]-[timestamp]/TEST_REPORT.md
- Fix bugs
- Notify QA when ready for re-test

---

## 🚀 Impact on Quality

### Prevents Past Issues

**Issue:** "Tests written but not executed" (US1.1 initial problem)  
**Solution:** Tests run TWICE now (Phase 0 fail → Phase 3 pass)

**Issue:** Incomplete test coverage  
**Solution:** Tests written first means 100% coverage by design

**Issue:** Features approved without E2E tests  
**Solution:** Phase 0 tests must pass in Phase 3 before Phase 4 approval

### Expected Outcomes

**Fewer bugs in production:**
- Tests written first cover all user flows
- Edge cases identified upfront
- Acceptance criteria clearly defined

**Faster development:**
- Dev knows exact target (make tests pass)
- No guessing about requirements
- Less back-and-forth

**Better QA:**
- QA thinks through flows before implementation
- Tests define acceptance criteria
- Clear pass/fail criteria

---

## 📈 Success Metrics

### Measuring TDD Effectiveness

**Ideal Pattern:**
- Cycle 1 (Phase 0): 0/N tests pass (all fail - expected)
- Cycle 2 (Phase 3): N/N tests pass (all pass - great!)

**Acceptable Pattern:**
- Cycle 1: 0/N tests pass
- Cycle 2: (N-2)/N tests pass (minor issues)
- Cycle 3: N/N tests pass (bugs fixed)

**Problem Pattern:**
- Cycle 1-5+: Tests still failing
- Indicates: Poor requirements, implementation issues, or test quality problems

### Track These Metrics

1. **Average cycles to approval** per user story
   - Target: ≤ 2 cycles (Phase 0 fail → Phase 3 pass)
   - Good: 2-3 cycles
   - Needs improvement: 4+ cycles

2. **Phase 0 test pass rate** (Phase 3)
   - Target: 100% pass rate in Phase 3
   - Good: ≥ 95%
   - Needs improvement: < 90%

3. **Critical bugs found in Phase 3**
   - Target: 0 critical bugs
   - Good: 0-1 critical bugs
   - Needs improvement: 2+ critical bugs

---

## ⚠️ Important Notes

### Phase 0 Tests Failing is GOOD

**DO NOT be alarmed when Phase 0 tests fail!**

This is **EXPECTED** and **CORRECT** behavior:
- Tests written before feature exists
- Nothing to test yet
- Tests define what needs to be built

**Only be alarmed if:**
- Phase 3 tests still fail after implementation
- Tests fail in cycle-3, cycle-4, cycle-5+ (too many iterations)

### Test Cycles Show Process Health

**Healthy:**
```
cycle-1: Phase 0 tests written, all fail ✅
cycle-2: Phase 3 re-run, all pass ✅
```
**2 cycles = Excellent implementation quality**

**Acceptable:**
```
cycle-1: Phase 0 tests written, all fail ✅
cycle-2: Phase 3 re-run, 6/8 pass ⚠️
cycle-3: Phase 3 re-run, 8/8 pass ✅
```
**3 cycles = Good, minor fixes needed**

**Needs Improvement:**
```
cycle-1: Phase 0 tests written, all fail ✅
cycle-2: Phase 3 re-run, 2/8 pass ❌
cycle-3: Phase 3 re-run, 5/8 pass ⚠️
cycle-4: Phase 3 re-run, 7/8 pass ⚠️
cycle-5: Phase 3 re-run, 8/8 pass ✅
```
**5 cycles = Implementation quality issues or test quality issues**

---

## 🔄 Migration from Old Workflow

### For Ongoing Work

**User stories already in progress:**
- Can finish with 4-phase workflow (Phase 0 optional for now)
- Encourage QA to write missing E2E tests

**New user stories starting after Feb 3, 2026:**
- MUST use 5-phase workflow
- Phase 0 is mandatory

### For Future Retrospectives

If process improvement agent finds:
- "Tests not written" issue
- "Tests not executed" issue
- "Feature approved without E2E coverage"

**Root cause will be:** Didn't follow Phase 0 TDD approach  
**Prevention:** Enforce Phase 0 in all workflows

---

## 📚 Related Documentation

- `.cursor/WORKFLOW_TEMPLATES.md` - Updated workflow templates
- `.cursor/skills/implement-user-story/SKILL.md` - Updated skill with 5 phases
- `.cursor/rules/documentation-organization.mdc` - Test results organization
- `docs/test-results/README.md` - Test results guide

---

## ✅ Verification Checklist

When using new workflow:

**Phase 0 (QA):**
- [ ] E2E tests written before any implementation
- [ ] Tests executed (all fail - expected)
- [ ] cycle-1-[timestamp]/ created with outputs
- [ ] TEST_REPORT.md documents test readiness

**Phase 1-2 (Design + Implementation):**
- [ ] API contract approved
- [ ] Implementation completed
- [ ] Dev commits work

**Phase 3 (QA Re-test):**
- [ ] Phase 0 E2E tests re-run (should now pass!)
- [ ] Backend unit tests run
- [ ] API integration tests run
- [ ] cycle-2-[timestamp]/ created with results
- [ ] TEST_REPORT.md includes cycle comparison
- [ ] If tests fail → Increment cycle, notify dev

**Phase 4 (Approval):**
- [ ] All team leaders review Phase 3 results
- [ ] Verify Phase 0 tests now pass
- [ ] Approve for production

---

## 🎉 Summary

**Major Update:** 4-phase → 5-phase workflow with Test-Driven Development

**Key Changes:**
1. ✅ Added Phase 0: QA writes E2E tests first
2. ✅ Renumbered phases (0-4 instead of 0-3)
3. ✅ Test cycle indexing (cycle-1, cycle-2, cycle-3, ...)
4. ✅ Readable timestamp format (YYYY-MM-DD-HH:MM:SS)
5. ✅ Test results under docs/ folder
6. ✅ Emphasis on test-first development

**Files Updated:**
- `.cursor/WORKFLOW_TEMPLATES.md`
- `.cursor/skills/implement-user-story/SKILL.md`
- `.cursor/rules/documentation-organization.mdc`

**Files Created:**
- `docs/test-results/README.md`
- `docs/WORKFLOW_UPDATE_5_PHASE_TDD.md`

**Impact:** Higher quality, better test coverage, fewer bugs in production! 🚀

---

**Effective Date:** February 3, 2026  
**Applies To:** All new user story implementations  
**Status:** ✅ Active and Enforced
