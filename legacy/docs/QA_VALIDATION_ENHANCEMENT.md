# QA Validation Enhancement - Requirement Coverage Mandatory

**Date**: 2026-02-03  
**Status**: ✅ Implemented  
**Impact**: All QA approvals now require full requirement coverage validation

## Overview

Enhanced the QA team manager and senior QA engineer skills to **MANDATE** requirement coverage validation before approving any user story or epic. This ensures every acceptance criterion is covered by passing tests.

---

## What Changed

### 1. QA Team Manager Skill (`qa-team-manager/SKILL.md`)

**Added Section**: "User Story Approval Requirements (MANDATORY)"

**New mandatory steps before approval:**

1. **Requirements Coverage Validation**
   - Map each acceptance criterion to test coverage
   - Verify unit, integration, and E2E tests exist for each requirement
   - Document coverage mapping in test report

2. **Test Execution Validation**
   - All tests executed (not just written) - capture output
   - Verify test output shows pass/fail counts
   - No tests skipped or disabled

3. **Test Results Validation**
   - 100% of tests passing
   - Test coverage > 80%
   - No test flakiness

4. **Acceptance Criteria Validation**
   - Each AC has corresponding passing test(s)
   - All user flows covered by E2E tests
   - All edge cases tested

**Added**: Requirement Coverage Template
- Standard markdown template for documenting AC → Test mapping
- Includes test execution summary
- Requires QA approval signature

### 2. Senior QA Engineer Skill (`senior-qa-engineer/SKILL.md`)

**Added Section**: "Requirement Coverage Validation (MANDATORY)"

**New 5-step process:**

1. **Extract Acceptance Criteria**
   - Read user story from epic file
   - List ALL acceptance criteria

2. **Map Tests to Requirements**
   - For EACH AC, identify covering unit/integration/E2E tests
   - Document test file names and test descriptions

3. **Validate Test Execution**
   - Execute ALL test types
   - Capture outputs
   - Save to test-results folder

4. **Generate Coverage Report**
   - Create AC → Test mapping document
   - Include test execution outputs
   - Document any gaps

5. **Approval Decision**
   - ✅ APPROVED: All ACs covered + All tests passing
   - ⚠️ CONDITIONAL: Minor gaps with justification
   - ❌ REJECTED: Major gaps or failing tests

**Added**: Example coverage mapping with TypeScript code

### 3. Implement User Story Skill (`implement-user-story/SKILL.md`)

**Enhanced Step 9**: "Verify Phase 2 Test Execution & Requirement Coverage"

**Added Part A: Requirement Coverage Mapping**
- Extract acceptance criteria from user story
- Map tests to each AC
- Create coverage map document
- Save to: `test-results/[US_NUMBER]_COVERAGE_REPORT.md`

**Enhanced Part B: Test Execution Validation**
- Same as before (execute all tests, capture outputs)

**Added Part C: Coverage Validation**
- Count ACs vs covered ACs
- Validate coverage percentages
- Check all test types present for critical ACs

**Enhanced Blocking Conditions:**
- ❌ Any AC not covered by tests → BLOCK Phase 3
- ❌ Coverage map not created → BLOCK Phase 3

**Enhanced Step 10**: "Phase 3 Quality Gate - Coverage & Critical Bug Check"

**Added Part A: Requirement Coverage Validation (MUST PASS)**
1. Coverage Report Review
2. Test Execution Evidence
3. Acceptance Criteria Coverage (check each AC)
4. Test Type Coverage

**Coverage Gate:**
- If ANY AC not covered → REJECT, request tests
- If ANY test type missing for critical AC → REJECT
- If coverage report missing → REJECT
- If test execution not proven → REJECT

**Enhanced Final Decision Matrix:**
- If Part A (Coverage) FAILS → REJECT, return to QA for tests
- If Part A PASSES but Part B (Functional) FAILS → REJECT, return to Dev
- If both PASS → APPROVE

---

## Enforcement

### Blocking Conditions (Cannot Approve If):

1. ❌ Any acceptance criterion not covered by tests
2. ❌ Coverage report not generated
3. ❌ Tests written but not executed
4. ❌ Test execution outputs not captured
5. ❌ Any tests failing
6. ❌ Critical test type missing (unit/integration/E2E)

### Required Evidence Before Approval:

1. **Coverage Report**: `test-results/[US_NUMBER]_COVERAGE_REPORT.md`
   - Maps each AC to covering tests
   - Shows coverage statistics (X/X ACs covered)

2. **Test Execution Logs**:
   - Backend test output (npm test)
   - Integration test output
   - E2E test output (npx playwright test)
   - Pass/fail counts for each

3. **Coverage Validation Statement**:
   - "✅ 5/5 acceptance criteria covered"
   - "✅ All tests passing"
   - "✅ 100% requirement coverage"

---

## Example Coverage Report Format

```markdown
## User Story US1.7 - Test Coverage Report

### Acceptance Criteria Coverage:

**AC1**: User can filter by property type
- ✅ Unit Tests: 
  - properties.service.spec.ts: "should filter by type"
  - properties.service.spec.ts: "should return empty array for invalid type"
- ✅ Integration Tests: 
  - properties.controller.spec.ts: "GET /properties?type=apartment"
  - properties.controller.spec.ts: "GET /properties?type=invalid returns 400"
- ✅ E2E Tests: 
  - filter-properties.e2e.spec.ts: "filters properties by type in UI"
  - filter-properties.e2e.spec.ts: "shows validation error for invalid type"
- Status: ✅ FULLY COVERED

**AC2**: Filter supports multiple property types
- ✅ Unit Tests: properties.service.spec.ts - "should filter by multiple types"
- ✅ Integration Tests: properties.controller.spec.ts - "GET /properties?type=apt,house"
- ✅ E2E Tests: filter-properties.e2e.spec.ts - "selects multiple types"
- Status: ✅ FULLY COVERED

[... continue for all ACs ...]

### Test Execution Summary:

**Unit Tests:**
- Executed: ✅ Yes
- Total Tests: 15
- Passing: 15
- Failing: 0
- Coverage: 87%
- Output: test-results/unit-tests-output.txt

**Integration Tests:**
- Executed: ✅ Yes
- Total Tests: 8
- Passing: 8
- Failing: 0
- Coverage: All /properties endpoints tested
- Output: test-results/integration-tests-output.txt

**E2E Tests:**
- Executed: ✅ Yes
- Total Tests: 5
- Passing: 5
- Failing: 0
- User Flows: Filter by type, Filter by city, Clear filters, Pagination
- Output: test-results/e2e-tests-output.txt

### Approval Decision:

Coverage Status:
- ✅ All 5 acceptance criteria have tests
- ✅ All tests executed successfully
- ✅ All 28 tests passing (15 unit + 8 integration + 5 E2E)
- ✅ No critical or major bugs

**QA Approval**: ✅ APPROVED FOR PRODUCTION

**Signed**: QA Team Leader  
**Date**: 2026-02-03
```

---

## Impact on Workflow

### Phase 2 Now Requires:

**Before (Previous):**
- Write tests
- Execute tests
- Capture output

**After (Enhanced):**
- Write tests
- **Map tests to acceptance criteria** ← NEW
- Execute tests
- Capture output
- **Generate coverage report** ← NEW
- **Validate 100% AC coverage** ← NEW

### Phase 3 Now Requires:

**Before (Previous):**
- Check for critical bugs
- Approve if no blockers

**After (Enhanced):**
- **Validate coverage report exists** ← NEW
- **Verify each AC is covered** ← NEW
- **Confirm all tests executed** ← NEW
- Check for critical bugs
- Approve only if coverage + functionality both pass

---

## Benefits

### 1. **Guarantees Requirement Fulfillment**
- Every acceptance criterion must have tests
- No feature can be approved with untested requirements

### 2. **Traceability**
- Clear mapping from requirement → test
- Easy to see what each test validates

### 3. **Quality Assurance**
- Prevents "we think we tested it" scenarios
- Forces explicit validation of every requirement

### 4. **Documentation**
- Coverage reports serve as test documentation
- Future developers can see what was tested

### 5. **Prevents Regressions**
- Comprehensive test coverage
- Easier to maintain quality over time

---

## Process Example

### Scenario: Implementing US1.7 - Filter Properties

**Epic File Contains:**
```markdown
### US1.7: Filter Properties

**Acceptance Criteria:**
1. User can filter by property type
2. Filter supports multiple property types
3. Filter by city (partial match, case-insensitive)
4. Pagination works with filters
5. Clear filters returns to unfiltered view
```

**Phase 2 - QA Team:**

1. **Read Epic**: Extract 5 acceptance criteria
2. **Write Tests**: Create unit/integration/E2E tests
3. **Map Coverage**:
   - AC1 → 3 unit tests, 2 integration, 1 E2E
   - AC2 → 2 unit tests, 1 integration, 1 E2E
   - AC3 → 3 unit tests, 2 integration, 1 E2E
   - AC4 → 2 unit tests, 2 integration, 1 E2E
   - AC5 → 0 unit, 0 integration, 1 E2E (UI-only)
4. **Execute All**: Run npm test + npx playwright test
5. **Generate Report**: Create coverage map document
6. **Validate**: 5/5 ACs covered, all tests passing

**Phase 3 - QA Team Leader:**

1. **Review Coverage Report**: ✅ Exists, 5/5 ACs covered
2. **Review Test Evidence**: ✅ All outputs captured, all passing
3. **Check Functionality**: ✅ No critical bugs
4. **Approval**: ✅ APPROVED FOR PRODUCTION

---

## Migration from Previous Process

### For Existing User Stories:

If a user story was approved before this enhancement:
- ✅ No action needed (already in production)
- ✅ Coverage reports are forward-looking only

### For In-Progress User Stories:

If currently in Phase 2 or Phase 3:
1. Generate coverage report retroactively
2. Map existing tests to ACs
3. Identify any gaps
4. Write additional tests if needed
5. Re-validate before approval

---

## Files Modified

1. `.cursor/skills/qa-team-manager/SKILL.md`
   - Added "User Story Approval Requirements" section
   - Added coverage template
   - Enhanced quality gates

2. `.cursor/skills/senior-qa-engineer/SKILL.md`
   - Added "Requirement Coverage Validation" section
   - Added 5-step coverage process
   - Enhanced quality checklist

3. `.cursor/skills/implement-user-story/SKILL.md`
   - Enhanced Step 9 (Phase 2 verification)
   - Enhanced Step 10 (Phase 3 quality gate)
   - Added Part A: Coverage Validation
   - Enhanced blocking conditions
   - Updated decision matrix

---

## Summary

**Before this enhancement:**
- QA wrote tests and checked if they passed
- Coverage of requirements was implicit
- Risk of missing acceptance criteria

**After this enhancement:**
- QA must explicitly map tests to acceptance criteria
- Coverage report is mandatory artifact
- 100% requirement coverage enforced
- Cannot approve without coverage validation

**Bottom line:** Every acceptance criterion MUST have tests, and every test MUST pass before approval.

---

**Status**: ✅ Enhancement Complete and Enforced  
**Effective**: Immediately for all new user stories  
**Enforcement**: Automated via skill validation
