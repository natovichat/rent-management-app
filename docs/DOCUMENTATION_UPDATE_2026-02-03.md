# Documentation Organization Update - Test Results Location

**Date:** February 3, 2026  
**Rule Updated:** `.cursor/rules/documentation-organization.mdc`  
**Change Type:** Test Results Organization

---

## What Changed

### Old Structure
```
test-results/                         # Root level
├── epic-01/
│   └── user-story-1.1/
│       └── test-cycle-20260203-143022/   # Timestamp only
```

### New Structure
```
docs/
└── test-results/                     # Under docs/
    ├── epic-01/
    │   └── user-story-1.1/
    │       └── cycle-1-2026-02-03-14:30:22/  # Index + readable time
```

---

## Key Changes

### 1. Location: Root → docs/

**Old:** `test-results/epic-XX/...`  
**New:** `docs/test-results/epic-XX/...`

**Rationale:**
- Test results are **documentation** of QA efforts
- Should be version-controlled alongside project docs
- Easier to find all documentation in one place
- Aligns with documentation-first principle

---

### 2. Cycle Naming: Timestamp → Index + Readable Time

**Old Format:** `test-cycle-20260203-143022`  
**New Format:** `cycle-1-2026-02-03-14:30:22`

**Components:**
- **Cycle Index (`1`, `2`, `3`, ...)**: 
  - Sequential number tracking test iterations
  - Shows how many QA-to-Dev feedback loops occurred
  - Cycle 1 = initial test
  - Cycle 2+ = re-tests after bug fixes
  
- **Readable Timestamp (`YYYY-MM-DD-HH:MM:SS`)**:
  - Human-friendly format with colons and hyphens
  - Easy to read: `2026-02-03-14:30:22` = "Feb 3, 2026 at 2:30 PM"
  - Still sortable chronologically

**Benefits:**
- ✅ Immediately know if this is first test or re-test
- ✅ Track number of iterations to completion
- ✅ Readable timestamp without mental conversion
- ✅ Pattern reveals process health (many cycles = issues)

---

## Examples

### Single Test Cycle (Ideal Case)
```
docs/test-results/epic-01/user-story-1.5/
└── cycle-1-2026-02-03-15:00:00/
    ├── backend-unit-output.txt
    ├── e2e-test-output.txt
    └── TEST_REPORT.md (APPROVED - all pass)
```
**Interpretation:** Feature passed on first test - high quality implementation

---

### Multiple Test Cycles (QA Feedback Loop)
```
docs/test-results/epic-01/user-story-1.1/
├── cycle-1-2026-02-03-14:30:22/    # Initial: Found bugs
│   ├── e2e-test-output.txt (0/8 passed)
│   └── TEST_REPORT.md (REJECTED - auth issues)
│
├── cycle-2-2026-02-03-18:01:45/    # After fixes: Still issues
│   ├── e2e-test-output.txt (1/8 passed)
│   └── TEST_REPORT.md (REJECTED - selector issues)
│
├── cycle-3-2026-02-04-09:15:30/    # Final: All pass
│   ├── e2e-test-output.txt (8/8 passed)
│   └── TEST_REPORT.md (APPROVED)
│
└── latest -> cycle-3-2026-02-04-09:15:30/
```
**Interpretation:** Feature needed 3 cycles to stabilize - iterative improvement

---

## Migration Guide

### No Migration Needed
- No existing test results in old location
- All future test runs will use new structure
- Start fresh with `cycle-1-[timestamp]`

### If You Have Old Test Results

```bash
# Old location: test-results/epic-01/user-story-1.1/test-cycle-20260203-143022/
# New location: docs/test-results/epic-01/user-story-1.1/cycle-1-2026-02-03-14:30:22/

# Move and rename
mkdir -p docs/test-results/epic-01/user-story-1.1
mv test-results/epic-01/user-story-1.1/test-cycle-20260203-143022 \
   docs/test-results/epic-01/user-story-1.1/cycle-1-2026-02-03-14:30:22

# Clean up old structure
rm -rf test-results/  # After verifying all moved
```

---

## Usage Instructions

### For QA Engineers

**Initial Test Run:**
```bash
# Determine cycle index (always 1 for first test)
CYCLE_INDEX=1

# Create test cycle folder
EPIC="01"
USER_STORY="1.1"
TIMESTAMP=$(date +%Y-%m-%d-%H:%M:%S)
TEST_DIR="docs/test-results/epic-${EPIC}/user-story-${USER_STORY}/cycle-${CYCLE_INDEX}-${TIMESTAMP}"
mkdir -p "${TEST_DIR}"

# Run tests and save outputs
cd apps/backend && npm test > "${TEST_DIR}/backend-unit-output.txt" 2>&1
cd apps/frontend && npx playwright test > "${TEST_DIR}/e2e-test-output.txt" 2>&1

# Create TEST_REPORT.md
cat > "${TEST_DIR}/TEST_REPORT.md" << 'EOF'
# Test Report: US1.1 Create Property

**Test Cycle:** cycle-1-[timestamp]  
**Status:** [PASS/FAIL]
...
EOF

# Create latest symlink
cd "docs/test-results/epic-${EPIC}/user-story-${USER_STORY}"
ln -sfn "cycle-${CYCLE_INDEX}-${TIMESTAMP}" latest
```

**Re-Test After Bug Fixes:**
```bash
# Find highest existing cycle
cd docs/test-results/epic-01/user-story-1.1
LAST_CYCLE=$(ls -d cycle-* | grep -oE 'cycle-[0-9]+' | sed 's/cycle-//' | sort -n | tail -1)
CYCLE_INDEX=$((LAST_CYCLE + 1))  # Increment

# Create new cycle folder
TIMESTAMP=$(date +%Y-%m-%d-%H:%M:%S)
TEST_DIR="cycle-${CYCLE_INDEX}-${TIMESTAMP}"
mkdir -p "${TEST_DIR}"

# Run tests...
# Update latest symlink...
```

---

## Benefits of New Structure

### 1. Better Organization
- ✅ All documentation in `docs/` folder
- ✅ Test results integrated with project documentation
- ✅ Version-controlled test history

### 2. Clearer Cycle Tracking
- ✅ Cycle index shows iteration count at a glance
- ✅ Easy to see if feature had issues (many cycles = problems)
- ✅ Quick assessment of implementation quality

### 3. Human-Readable
- ✅ Timestamp format is intuitive
- ✅ No mental conversion needed (20260203 → Feb 3, 2026)
- ✅ Colons and hyphens improve readability

### 4. Process Transparency
- ✅ Clear record of QA-to-Dev feedback loop
- ✅ Shows how many iterations to approval
- ✅ Useful for retrospectives and process improvement

---

## Summary

**Updated Elements:**
- ✅ Test results location: `test-results/` → `docs/test-results/`
- ✅ Cycle naming: `test-cycle-YYYYMMDD-HHMMSS` → `cycle-<index>-YYYY-MM-DD-HH:MM:SS`
- ✅ Added cycle index logic explanation
- ✅ Added directory creation examples
- ✅ Added rationale for changes
- ✅ Created `docs/test-results/README.md` guide

**Rule File Updated:**
- `.cursor/rules/documentation-organization.mdc`
  - Golden Rules section
  - Folder Structure section
  - Naming Convention section
  - Test Cycle Comparison examples
  - Quick Reference section

**New Documentation:**
- `docs/test-results/README.md` - Comprehensive guide for test results

**Next Actions:**
- ✅ All future test runs will use new structure
- ✅ QA team will create test cycles with new format
- ✅ Process improvement agent will use new location for test analysis

---

**Change Status:** ✅ COMPLETE  
**Rule Updated:** `.cursor/rules/documentation-organization.mdc`  
**Documentation Added:** `docs/test-results/README.md`
