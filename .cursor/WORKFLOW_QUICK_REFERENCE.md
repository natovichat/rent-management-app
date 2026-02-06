# Feature Development Workflow - Quick Reference Card

**MANDATORY 4-PHASE WORKFLOW FOR ALL FEATURES**

## ⚡ Quick Flow

```
┌─────────────────────────────────────────────────────────┐
│ Phase 0: API CONTRACT DESIGN (Sequential)              │
│ Backend designs → Frontend reviews → QA plans tests    │
│ ✅ Exit: All teams approve API contract                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 1: PARALLEL IMPLEMENTATION                        │
│ Backend (4 eng) + Frontend (4 eng) work in parallel    │
│ ✅ Exit: Both teams complete with tests passing        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 2: FULL STACK INTEGRATION (After both complete)  │
│ QA (4 eng) tests real frontend + real backend          │
│ ✅ Exit: All integration tests pass                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 3: REVIEW & VALIDATION                            │
│ All team leaders review and approve                    │
│ ✅ Exit: Production ready                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Phase 0 Checklist

**DO NOT START PHASE 1 UNTIL ALL BOXES CHECKED:**

- [ ] Backend team designs complete API specification
- [ ] API specification includes: endpoints, DTOs, validation, errors
- [ ] Frontend team reviews API specification
- [ ] Frontend team confirms API meets ALL UI requirements
- [ ] QA team reviews API specification
- [ ] QA team creates test plan from specification
- [ ] **ALL THREE TEAMS APPROVE** the API contract

**Time Investment**: 30-60 minutes  
**Time Saved**: Hours of integration debugging

---

## ⚙️ Phase 1 Breakdown

### Backend Team (4 Engineers)

| Engineer | Responsibility | Commit Message |
|----------|---------------|----------------|
| 1 | Database schema & migrations | `feat(scope): add schema` |
| 2 | API endpoints & validation | `feat(scope): add endpoints` |
| 3 | Business logic & services | `feat(scope): add logic` |
| 4 | API integration tests | `test(scope): add API tests` |

### Frontend Team (4 Engineers)

| Engineer | Responsibility | Commit Message |
|----------|---------------|----------------|
| 1 | UI components | `feat(scope): add components` |
| 2 | API integration hooks | `feat(scope): integrate API` |
| 3 | State management | `feat(scope): add state` |
| 4 | Component tests | `test(scope): add component tests` |

**Exit Criteria**: Both teams complete, all unit tests pass

---

## 🧪 Phase 2 QA Testing

### QA Team (4 Engineers)

| Engineer | Focus | Tests |
|----------|-------|-------|
| 1 | API Integration | Real API + Real DB tests |
| 2 | E2E User Flows | Real UI + Real API tests |
| 3 | Edge Cases | Boundary, error, special cases |
| 4 | Performance | Load, response time, optimization |

**Exit Criteria**: All integration tests pass, no blocking issues

**If Issues Found**: Return to Phase 1 for fixes, then retest

---

## ✅ Phase 3 Final Review

Each team leader reviews:

| Team | Reviews |
|------|---------|
| Backend | API performance, security, scalability, code quality |
| Frontend | UX quality, accessibility, responsiveness, patterns |
| QA | Test coverage, acceptance criteria, edge cases |

**Exit Criteria**: ALL three team leaders approve

---

## 🚀 Using Templates

### Step 1: Choose Template

| Feature Type | Template File |
|--------------|---------------|
| Full Stack (most common) | WORKFLOW_TEMPLATES.md - Template 1 |
| Backend Only | WORKFLOW_TEMPLATES.md - Template 2 |
| Frontend Only | WORKFLOW_TEMPLATES.md - Template 3 |
| Bug Fix | WORKFLOW_TEMPLATES.md - Template 4 |

### Step 2: Customize

Replace placeholders:
- `[US_NUMBER]` → e.g., US1.7
- `[FEATURE_NAME]` → e.g., Property Filtering
- `[scope]` → e.g., properties
- `[EPIC_NUMBER]` → e.g., 01

### Step 3: Execute

Paste into Agent mode, run phases sequentially.

---

## ⚠️ Common Mistakes

| Mistake | Consequence | Solution |
|---------|-------------|----------|
| Skip Phase 0 | Integration breaks | Always design API contract first |
| Start Phase 1 without approval | Wasted work | Wait for all teams to approve |
| Skip Phase 2 | Production bugs | Never skip integration testing |
| Skip Phase 3 | Quality issues | Always get final approval |

---

## 💡 Pro Tips

### Phase 0
- **Invest time here** - Every minute saves 10 in Phase 2
- **Get consensus** - Don't proceed with disagreements
- **Document clearly** - Future you will thank you

### Phase 1
- **Follow contract exactly** - No "improvements" without re-approval
- **Commit frequently** - Each engineer commits their work
- **Communicate blockers** - Don't wait until end to report issues

### Phase 2
- **Test thoroughly** - Real frontend + real backend
- **Report issues clearly** - Specific, reproducible steps
- **Retest after fixes** - Verify issues actually resolved

### Phase 3
- **Be thorough** - Final checkpoint before production
- **Don't rush** - Quality over speed
- **Document learnings** - Capture what worked/didn't work

---

## 📊 Success Metrics

Track these to measure workflow effectiveness:

| Metric | Target | Meaning |
|--------|--------|---------|
| Integration bugs | Decreasing | Better Phase 0 contracts |
| Rework rate | < 20% | Good API design prevents changes |
| Test coverage | > 80% | Comprehensive testing |
| Phase 0 time | 30-60 min | Efficient contract design |
| Phase 2 pass rate | > 80% | Quality implementation |

---

## 🎯 Example: Property Filtering

### Phase 0 Output
```yaml
Endpoint: GET /api/properties?type=X&status=Y
Request: Query params (type, status, city, etc.)
Response: { items: [], total: 0, page: 1, totalPages: 0 }
Status: ✅ Approved by all teams
```

### Phase 1 Output
```
Backend: ✅ 4 engineers complete (API, tests, logic)
Frontend: ✅ 4 engineers complete (UI, hooks, tests)
Commits: 8 commits pushed
Tests: 45 passing
```

### Phase 2 Output
```
QA Testing: ✅ All tests passing
- API integration: 12/12 tests pass
- E2E flows: 8/8 tests pass
- Edge cases: 10/10 tests pass
- Performance: < 100ms response time
```

### Phase 3 Output
```
Backend Leader: ✅ Approved (performant, secure)
Frontend Leader: ✅ Approved (accessible, responsive)
QA Leader: ✅ Approved (comprehensive coverage)
Status: 🚀 Production ready
```

---

## 🔗 Related Documentation

- **Full Workflow Details**: `.cursor/rules/feature-development-workflow.mdc`
- **Copy-Paste Templates**: `.cursor/WORKFLOW_TEMPLATES.md`
- **Team Coordination**: `.cursor/TEAM_AGENTS_GUIDE.md`
- **Git Commits**: `.cursor/rules/git-commit-strategy.mdc`

---

## 🆘 Quick Help

**Q: Can I skip Phase 0 for small features?**  
A: Only if there are ZERO API changes. Otherwise, always do Phase 0.

**Q: Phase 2 found issues, what now?**  
A: Return to Phase 1, fix issues, commit fixes, retest in Phase 2.

**Q: How long should Phase 0 take?**  
A: 30-60 minutes. If longer, contract is too complex (split feature).

**Q: Can Backend and Frontend start at same time?**  
A: NO! Phase 0 MUST complete and be approved first.

**Q: What if teams disagree in Phase 0?**  
A: Discuss until consensus. Don't proceed without agreement.

---

## ✨ Remember

```
⏱️  Time in Phase 0 = Time saved in Phase 2
🎯 API Contract = Blueprint for success  
🧪 Integration Testing = Catch issues before production
✅ Final Review = Quality gate
```

**This workflow is MANDATORY for professional, high-quality development.**

---

**Print this card** | Keep nearby when coordinating teams | Reference during planning

---

© 2026 | Feature Development Workflow v1.0 | All features must follow this process
