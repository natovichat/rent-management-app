# 🚀 Quick Guide: E2E HTML Reports

**Quick reference for generating and reviewing E2E HTML reports**

---

## ⚡ Quick Start (3 Steps)

### 1. Run E2E Tests
```bash
cd apps/frontend
npm run test:e2e
```

### 2. Review HTML Report (MANDATORY!)
```bash
npm run test:e2e:report
```

### 3. Archive Report
```bash
# Create cycle folder
timestamp=$(date +%Y%m%d-%H%M%S)
mkdir -p docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp

# Copy report
cp -r playwright-report docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp/
```

---

## 📝 Available Scripts

```bash
# Run E2E tests (generates HTML report)
npm run test:e2e

# Open HTML report for review
npm run test:e2e:report

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug
```

---

## 📊 Two Types of Reports

### Epic-Level Report (Summary)
```bash
# Location
open docs/test-results/epic-01/E2E_TEST_REPORT.html

# Purpose: High-level overview for stakeholders
# Update: After Phase 4 of each user story
```

### Per-Execution Report (Detailed)
```bash
# Location
open playwright-report/index.html

# Purpose: Detailed results for debugging
# Update: EVERY test execution
```

---

## ✅ Manual Review Checklist

After EVERY E2E test run:

- [ ] HTML report opened: `npm run test:e2e:report`
- [ ] All test results reviewed
- [ ] Screenshots checked (if failures)
- [ ] Test duration reasonable
- [ ] No unexpected errors
- [ ] Issues documented
- [ ] Report archived in cycle folder

---

## 📁 Archive Report Template

```bash
# Full workflow
timestamp=$(date +%Y%m%d-%H%M%S)
cycle_dir="docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp"

# Create folder and archive report
mkdir -p "$cycle_dir"
cp -r playwright-report "$cycle_dir/"

# Add cycle notes
cat > "$cycle_dir/CYCLE_NOTES.md" << EOF
# Cycle X - E2E Test Execution

**Date:** $(date)
**Tests:** 8 total, 6 passed, 2 failed
**Duration:** 45 seconds

## Manual Review:
✅ HTML report reviewed
✅ Screenshots verified
⚠️ 2 timing issues (not code bugs)

## Next Steps:
- Proceed to manual testing
EOF

# Commit
git add "$cycle_dir"
git commit -m "test: add E2E execution report - cycle X (6/8 passing)"
```

---

## 🔍 Finding Reports

### Latest Execution Report:
```bash
open playwright-report/index.html
```

### Archived Reports:
```bash
# List archived cycles
ls -la docs/test-results/epic-01/user-story-1.1/

# Open specific cycle
open docs/test-results/epic-01/user-story-1.1/cycle-1-20260203-143022/playwright-report/index.html
```

### Epic Summary Report:
```bash
open docs/test-results/epic-01/E2E_TEST_REPORT.html
```

---

## 🐛 Debugging Failures

### View Screenshots:
```bash
# Screenshots in report
npm run test:e2e:report
# Click on failed test → See screenshot

# Manual location
open playwright-report/data/screenshots/
```

### View Traces:
```bash
# Interactive trace viewer
npx playwright show-trace playwright-report/data/traces/trace-name.zip
```

### View Videos:
```bash
# Videos (if enabled)
open playwright-report/data/videos/
```

---

## 🚨 Common Issues

### Issue: Report not generated
```bash
# Check playwright.config.ts has HTML reporter
# Should see: reporter: 'html'

# Re-run tests
npm run test:e2e
```

### Issue: Can't open report
```bash
# Try alternative command
npx playwright show-report

# Or open file directly
open playwright-report/index.html
```

### Issue: Old report showing
```bash
# Playwright overwrites old report
# Archive before running new tests!

# Archive current report first
cp -r playwright-report docs/test-results/.../cycle-X/

# Then run new tests
npm run test:e2e
```

---

## 📚 Full Documentation

- **Detailed Rule:** `.cursor/rules/e2e-html-reports.mdc`
- **Requirements:** `docs/project_management/GENERAL_REQUIREMENTS.md` (Section 24.5)
- **Overview:** `docs/project_management/E2E_HTML_REPORTS_REQUIREMENT.md`
- **This Guide:** `docs/test-results/E2E_HTML_REPORTS_QUICK_GUIDE.md`

---

## 🎯 Remember

```
✅ Generate HTML report on EVERY E2E run
✅ ALWAYS manually review the report
✅ Archive report in cycle folder
✅ Document findings in CYCLE_NOTES.md
✅ Never skip manual review (even if tests pass!)
```

---

**Need Help?** Ask QA team lead or check `.cursor/rules/e2e-html-reports.mdc`
