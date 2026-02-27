# ✅ New Requirement: HTML Reports for ALL E2E Test Executions

**Date:** February 3, 2026  
**Status:** ✅ MANDATORY (Effective Immediately)  
**Applies To:** ALL E2E test executions

---

## 🎯 What Changed?

### New Requirement Added:

**EVERY E2E test execution MUST generate an HTML report for manual review.**

This is **IN ADDITION TO** the existing Epic-level HTML report.

---

## 📋 Two Types of HTML Reports (Both Mandatory)

### 1. Epic-Level HTML Report (Existing)

**Purpose:** High-level summary for stakeholders  
**Scope:** All user stories in an Epic  
**Location:** `docs/test-results/epic-XX/E2E_TEST_REPORT.html`  
**Update:** After each user story Phase 4 completion  

**Content:**
- Summary statistics
- Progress bars
- Per-story cards
- Achievements & issues
- Next steps

**Audience:** Management, stakeholders, team leads

---

### 2. Per-Execution HTML Report (NEW!)

**Purpose:** Detailed results for debugging and manual review  
**Scope:** Single test execution  
**Location:** `playwright-report/index.html` (then archived)  
**Update:** EVERY time E2E tests run  

**Content:**
- Full test traces
- Screenshots on failure
- Videos (optional)
- Detailed error messages
- Interactive debugging
- Duration per test
- Retry information

**Audience:** QA engineers, developers

---

## 🚀 How to Implement

### Step 1: Configure Playwright (One-Time Setup)

**File:** `apps/frontend/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ✅ MANDATORY: HTML Reporter
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // ✅ MANDATORY: Screenshots on failure
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',  // Recommended
    trace: 'retain-on-failure',   // Recommended
  },
});
```

---

### Step 2: Run Tests (Generates HTML Automatically)

```bash
cd apps/frontend
npm run test:e2e

# ✅ HTML report automatically generated at:
# playwright-report/index.html
```

---

### Step 3: Manual Review (MANDATORY!)

```bash
# Open report for manual review
npx playwright show-report

# OR
open playwright-report/index.html
```

**QA Engineer MUST:**
- ✅ Review ALL test results
- ✅ Check screenshots (if any failures)
- ✅ Verify behavior matches expectations
- ✅ Document unexpected issues

---

### Step 4: Archive Report

```bash
# Create cycle folder with timestamp
timestamp=$(date +%Y%m%d-%H%M%S)
mkdir -p docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp

# Archive Playwright report
cp -r playwright-report docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp/

# Add cycle notes
cat > docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp/CYCLE_NOTES.md << EOF
# Cycle X - Manual Review

**Date:** $(date)
**Tests:** 8 total, 6 passed, 2 failed
**Duration:** 45 seconds

## Manual Review:
✅ HTML report reviewed
✅ Screenshots verified
✅ Core functionality works
⚠️ 2 timing issues (not bugs)

## Next Steps:
- Proceed to manual testing
EOF
```

---

### Step 5: Commit

```bash
# Commit archived report
git add docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp/
git commit -m "test: add US1.1 E2E execution report - cycle X (6/8 passing)"
```

---

## 📁 Directory Structure

### After Implementing This Requirement:

```
docs/test-results/epic-01/
├── E2E_TEST_REPORT.html                    ← Epic-level (summary)
├── README.md
├── user-story-1.1/
│   ├── cycle-1-20260203-143022/
│   │   ├── playwright-report/              ← Execution 1 HTML
│   │   │   ├── index.html                  ← OPEN THIS!
│   │   │   ├── data/
│   │   │   │   ├── screenshots/
│   │   │   │   └── traces/
│   │   │   └── assets/
│   │   ├── test-output.log
│   │   └── CYCLE_NOTES.md
│   ├── cycle-2-20260203-150145/
│   │   ├── playwright-report/              ← Execution 2 HTML
│   │   │   └── index.html
│   │   └── ...
│   └── FINAL_STATUS.md
└── user-story-1.2/
    └── ...
```

---

## ✅ Updated Checklists

### E2E Test Checklist (Updated):

**Before marking E2E tests as complete:**

- [ ] E2E test files written
- [ ] Playwright configured with HTML reporter
- [ ] Tests executed: `npm run test:e2e`
- [ ] **HTML report generated** (`playwright-report/index.html`)
- [ ] **HTML report manually reviewed** ← NEW!
- [ ] Screenshots verified (if failures) ← NEW!
- [ ] Issues documented in CYCLE_NOTES.md ← NEW!
- [ ] **HTML report archived** in cycle folder ← NEW!
- [ ] Epic HTML report updated (E2E_TEST_REPORT.html)
- [ ] All tests passing (or known issues documented)

---

## 🎯 Why This Requirement?

### Problems This Solves:

**Before (Text Logs Only):**
- ❌ Hard to verify what actually happened
- ❌ No visual proof of failures
- ❌ Difficult to debug timing issues
- ❌ Can't show stakeholders results easily
- ❌ No historical record of test evolution

**After (HTML Reports):**
- ✅ Visual proof of test execution
- ✅ Screenshots show exactly what happened
- ✅ Easy debugging with interactive traces
- ✅ Stakeholders can see actual results
- ✅ Historical archive of all executions
- ✅ Quality gate: Must review before approval

---

## 📊 Benefits

### For QA Engineers:

1. **Visual Verification** - See actual UI during tests
2. **Screenshot Evidence** - Proof of failures
3. **Interactive Debugging** - Click traces, watch videos
4. **Better Documentation** - Share HTML with team
5. **Confidence** - Visual confirmation tests work

### For Developers:

1. **Easier Debugging** - See exactly what failed
2. **Reproduce Issues** - Screenshots show state
3. **Understand Tests** - Visual flow is clearer

### For Management:

1. **Transparency** - Can see actual test results
2. **Quality Assurance** - Visual proof of testing
3. **Progress Tracking** - Archive shows evolution
4. **Compliance** - Documentation of QA process

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake 1: Not Reviewing HTML Report

```bash
# WRONG - Just running tests without review
npm run test:e2e
# "Tests passed, moving on!"

# CORRECT - Manual review mandatory
npm run test:e2e
npx playwright show-report  # ← MUST DO THIS!
# Review all results, then proceed
```

---

### ❌ Mistake 2: Not Archiving Report

```bash
# WRONG - Report generated but not archived
npm run test:e2e
# Report stays in playwright-report/ folder (gets overwritten!)

# CORRECT - Archive for reference
npm run test:e2e
cp -r playwright-report docs/test-results/.../cycle-X-timestamp/
# Now it's preserved!
```

---

### ❌ Mistake 3: Skipping Manual Review Because Tests Passed

```bash
# WRONG - Tests passed, assuming everything is fine
# "All green, no need to look!"

# CORRECT - Always review HTML report
# Even if all tests pass:
# - Verify visual behavior
# - Check test duration
# - Look for unexpected warnings
# - Confirm screenshots (if configured)
```

---

## 📚 Documentation Updated

### Files Changed:

1. ✅ `.cursor/rules/e2e-html-reports.mdc`
   - Added Section 1.5: Per-Execution HTML Reports
   - Added Section 21: Two Types of Reports
   - Added Section 22: Complete Workflow Example
   - Added Section 23: Quick Reference Commands
   - Updated Summary

2. ✅ `docs/project_management/GENERAL_REQUIREMENTS.md`
   - Added Section 24.5: Per-Execution HTML Reports
   - Updated E2E Test Checklist
   - Added mandatory review requirements

3. ✅ `docs/project_management/E2E_HTML_REPORTS_REQUIREMENT.md` (this file)
   - Summary of new requirement
   - Implementation guide
   - Examples and checklists

---

## 🎓 Training & Onboarding

### For New Team Members:

**When you join the project:**

1. Read `.cursor/rules/e2e-html-reports.mdc`
2. Understand the two types of HTML reports
3. Practice:
   - Run E2E tests
   - Open HTML report
   - Review results
   - Archive report

**First E2E Test Execution:**

1. Run: `npm run test:e2e`
2. Open: `npx playwright show-report`
3. Review: Check all test results
4. Archive: Save to cycle folder
5. Document: Add CYCLE_NOTES.md
6. Ask: Get feedback from senior QA

---

## 📞 Getting Help

### Questions?

**If you're unsure:**

1. Check `.cursor/rules/e2e-html-reports.mdc` (detailed guide)
2. Look at example: `docs/test-results/epic-01/user-story-1.1/cycle-1-*/`
3. Ask QA team lead
4. Review this document

**Common Questions:**

**Q: Do I need HTML report even if all tests pass?**  
A: YES! Always generate and review.

**Q: Can I skip archiving if tests failed?**  
A: NO! Archive is especially important for failures (screenshots!).

**Q: How long should I keep archived reports?**  
A: Keep last 3 cycles per user story, archive older ones.

**Q: Can I use CI screenshots instead?**  
A: HTML report from CI can be downloaded as artifact, but local run preferred.

---

## 🎯 Success Criteria

**This requirement is successfully implemented when:**

1. ✅ Playwright config includes HTML reporter
2. ✅ Every E2E run generates `playwright-report/index.html`
3. ✅ QA engineers review HTML report before approval
4. ✅ HTML reports archived in cycle folders
5. ✅ CYCLE_NOTES.md documents review findings
6. ✅ Team follows workflow consistently
7. ✅ No PRs approved without HTML report review

---

## 📝 Quick Reference

### Generate & Review:

```bash
# 1. Run tests (generates HTML)
npm run test:e2e

# 2. Review (MANDATORY!)
npx playwright show-report

# 3. Archive
timestamp=$(date +%Y%m%d-%H%M%S)
mkdir -p docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp
cp -r playwright-report docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp/

# 4. Document
# Add CYCLE_NOTES.md

# 5. Commit
git add docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp/
git commit -m "test: add E2E execution report - cycle X"
```

---

## ✅ Summary

```
📊 Two HTML reports required (both mandatory):
   1. Epic-level (summary) - docs/test-results/epic-XX/E2E_TEST_REPORT.html
   2. Per-execution (detailed) - playwright-report/index.html

🔄 Workflow:
   1. Run E2E tests → HTML auto-generated
   2. Manual review → Open in browser
   3. Archive → Copy to cycle folder
   4. Document → Add CYCLE_NOTES.md
   5. Commit → Save to Git

✅ Benefits:
   - Visual verification
   - Screenshot evidence
   - Easier debugging
   - Quality gate
   - Historical archive

🚨 Never skip HTML report review!
```

---

**Status:** ✅ Requirement Active  
**Effective:** February 3, 2026  
**Mandatory For:** ALL E2E test executions  
**See Also:** `.cursor/rules/e2e-html-reports.mdc`
