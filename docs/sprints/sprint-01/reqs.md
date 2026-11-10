---
gse:
  type: requirement
  sprint: 1
  branch: gse/sprint-01/integration
  elicitation_summary: "User's words: 'Never lose my data.' Reformulation: the fixes cluster into data safety (never lose or silently drop an expense), correct behaviour (dates validated/stored properly, ids that work everywhere), a tidy setup (style checker, CI, coverage) and version-control hygiene. The user's stated priority — data safety — is why REQ-001 and REQ-004 are promoted to `must` (above their source tasks' original `should`)."
  status: approved
  created: "2026-11-10"
  updated: "2026-11-10"
  traces:
    derives_from: [PLN-001]
    decided_by: []
---

# Sprint 1 — Requirements

Goal (from PLN-001): establish a trustworthy baseline — unblock the toolchain,
reconcile the trunk, close the medium-priority review findings, add CI.

Priority signal from the user: **data safety first** — REQ-001 and REQ-004 are
`must` for that reason.

**REQ ↔ TASK map:** REQ-001→TASK-004 · REQ-002→TASK-003 · REQ-003→TASK-005 ·
REQ-004→TASK-006 · REQ-005→TASK-001 · REQ-006→TASK-002 · REQ-007→TASK-009 (deferred to pool) ·
REQ-008→TASK-010 · REQ-009→TASK-011.

**Amendment (2026-11-10, at USER request — TESTS):** REQ-009 (performance) added; TASK-009
(CI) returned to the backlog pool (the course supplies a CI quality kit); TASK-011 added
for REQ-009 using the freed point, so the sprint budget stays 10/10.

## Functional Requirements

### REQ-001 — Never lose an expense when browser storage fails
- **type:** functional · **priority:** must · **source:** TASK-004
- **Description:** As a user, I want to be told when saving or loading fails, so that
  I never lose an expense silently.
- **Measurement:** unit/integration tests that stub the storage API to throw, then
  assert a visible error and no crash.
- **Acceptance criteria:**
  - Given saving to the browser throws an error, when I submit the form, then I see
    an error message and the app neither crashes nor behaves as though it succeeded,
    and the typed values are kept for a retry (DEC-002).
  - Given loading from the browser throws an error, when the dashboard opens, then it
    shows a load-error notice distinct from the empty state instead of breaking (DEC-007).
  - Given a preceding read failed, when I submit a new expense, then the existing
    stored data is NOT overwritten (the app refuses to save from a failed read, DEC-007).
- **Interpretation note:** this requirement prohibits *silent* loss — the failure
  must be visible. The retry-recovery question (OQ-001) was settled in DESIGN as
  DEC-002 (typed values are kept for a retry); DEC-007 adds the load-failure
  distinction and the no-overwrite guarantee.

### REQ-002 — Validate and normalise the expense date
- **type:** functional · **priority:** should · **source:** TASK-003
- **Description:** As a user, I want dates stored exactly as valid ISO dates, so that
  the monthly total never silently excludes an expense.
- **Measurement:** unit tests calling `validateExpense` directly (the boundary where
  the defect lives — the date `<input type="date">` normalises UI input, so the
  whitespace case is only reachable at the validation unit).
- **Acceptance criteria:**
  - Given `validateExpense` receives a date with surrounding whitespace, when it
    validates, then the accepted date value is trimmed.
  - Given `validateExpense` receives a non-ISO string such as `"10/11/2026"`, then it
    is rejected with a message on the date field.
  - Given `validateExpense` receives a syntactically-ISO but calendar-invalid date
    such as `"2026-02-31"` or `"2026-13-01"`, then it is rejected with a message on
    the date field.

### REQ-003 — Generate expense ids without requiring a secure context, and keep them unique
- **type:** functional · **priority:** should · **source:** TASK-005
- **Description:** As a user, I want adding an expense to work regardless of how the
  app is served (plain-HTTP preview, older browser), and ids must stay unique so
  deleting one expense never affects another.
- **Measurement:** tests stubbing `crypto.randomUUID` as undefined, plus a
  two-entries-in-one-session uniqueness assertion (deletion removes exactly one row).
- **Acceptance criteria:**
  - Given `crypto.randomUUID` is unavailable, when I submit a valid expense, then an
    id is generated and the expense is stored and listed.
  - Given two expenses are added in the same session, then their ids differ and
    deleting one leaves the other present.

## Verification Requirement

### REQ-004 — Damaged stored data is handled safely on load
- **type:** verification (test) · **priority:** must · **source:** TASK-006 (RVW-7)
- **Description:** The wrong-shape guard already implemented under RVW-1 must be
  pinned by tests, so a future change cannot silently reintroduce the dashboard crash.
- **Measurement:** loader tests feeding `{}`, `"hello"`, `42`, `null` and a mixed list
  of good and broken rows.
- **Ownership note:** REQ-001 owns the *storage-API-throws* failure mode; REQ-004 owns
  the *valid-JSON-wrong-shape* failure mode. They are distinct and non-overlapping.
- **Acceptance criteria:**
  - Given the storage key holds valid JSON that is not an expense list, when the
    loader runs, then it returns an empty list and no invalid row is rendered.
  - Given a mixed list of good and broken rows, when the loader runs, then only valid
    rows are returned.

## Non-Functional Requirements

### REQ-005 — The repository passes its style checker
- **type:** non-functional · **category:** maintainability · **priority:** must · **source:** TASK-001
- **Why:** a failing style checker blocks every commit (project rule) — the sprint
  cannot land anything until it is green.
- **Acceptance criteria:**
  - Given a clean checkout, when `npm run lint` runs, then it exits 0.
  - The exception is scoped to `.opencode/**` only; running the checker over `src/`
    and `tests/` with the exception disabled reports no removed or weakened rules.

### REQ-006 — The trunk contains the full application
- **type:** non-functional · **category:** maintainability · **priority:** must · **source:** TASK-002
- **Why:** all CalcApp work sits on `mywork`; `main` holds only the skeleton, so no
  merge can proceed safely until the trunk is agreed.
- **Acceptance criteria:**
  - (Decision) A `DEC-NNN` records the trunk policy — merge `mywork` into `main`, or
    promote `mywork` as trunk. *(Verifiable now.)*
  - (State — unblocked by DEC-001) Given the branch named in that `DEC-NNN`, when
    `npm ci && npm run test:run` runs, then all tests pass and the application source
    is present. *(OQ-002 resolved in DESIGN: DEC-001 — merge `mywork` into `main`.)*

### REQ-007 — CI runs lint, tests and build
- **type:** non-functional · **category:** maintainability · **priority:** should · **source:** TASK-009
- **Why:** an automatic build keeps the baseline honest.
- **Depends on:** REQ-005 (a style error must fail the run).
- **Scope note:** coverage is **not** part of this CI job — it is REQ-008. The
  workflow copied from `main` must therefore drop `test:coverage` until REQ-008 lands
  (neither the `test:coverage` script nor the coverage provider exists on the working
  copy).
- **Acceptance criteria:**
  - Given a push or pull request, when CI runs, then lint, tests and build execute,
    and a style error fails the run.
  - Verification route: workflow file in the repo; remote `nicolasguelfi/ai4se-reference-calcapp`, `sync_mode: manual`.

### REQ-008 — Test coverage is measured against a floor
- **type:** non-functional · **category:** maintainability · **priority:** could · **source:** TASK-010
- **Why:** the 60% floor is configured but no coverage figure has ever been produced.
- **Acceptance criteria:**
  - `npm run test:coverage` produces a percentage; below the floor
    (`config.yaml` → `testing.coverage.minimum`, currently 60) the command exits
    non-zero; the baseline figure is committed under
    `docs/sprints/sprint-01/test-reports/`.
  - The coverage tooling is copied from `main` (it already exists there), so no new
    dependency is added — consistent with AGENTS.md.

### REQ-009 — Dashboard responds quickly with 1,000 stored expenses
- **type:** non-functional · **category:** performance · **priority:** should · **source:** TASK-011
- **Why:** the dashboard renders every stored expense and the month total scans the
  list; with a large history it must stay responsive.
- **Measurement:** an automated test that seeds 1,000 stored expenses, renders the
  dashboard, and asserts the list and the month total are shown within 200 ms.
- **Acceptance criteria:**
  - Given 1,000 stored expenses, when the dashboard opens, then the list and the
    current-month total are rendered in **under 200 ms** (measured by the test).
  - The month total with 1,000 expenses equals the sum of that month's rows only.

## User Stories (illustrative subset)

*(Illustrative — not exhaustive; REQ-003 and REQ-005..008 are verified by their unit
criteria above.)*

```
Story: REQ-001 — An expense is never silently lost
  Given the browser refuses to save
  When I submit a valid expense
  Then I see an error message
  And the app does not crash or navigate away as if it succeeded

Story: REQ-002 — Dates are stored cleanly
  Given validateExpense receives " 2026-11-10 "
  When it validates
  Then the accepted date is "2026-11-10"
  And it counts toward this month's total

Story: REQ-004 — Damaged data does not break the dashboard
  Given the storage key holds valid JSON that is not an expense list
  When the loader runs
  Then it returns an empty list without throwing
```

## Validation

```
Requirements Validation — Sprint 1
──────────────────────────────────
  ✓ Completeness: 8/8 sprint tasks covered (REQ-009 added; REQ-007's task deferred to the pool)
  ⚠ Testability: 3 conditions need external state to verify
        REQ-006 (state clause) — unblocked: OQ-002 resolved as DEC-001 (merge mywork into main)
        REQ-007 — verification route is the hosted runner (manual sync)
        REQ-008 — command exists only after TASK-010 copies the tooling
  ✓ Ambiguity: no unmeasured vague terms
  ⚠ Consistency: reconciled this revision — REQ-001/004 priority vs backlog
        (TASK-004/006 promoted to `must`), REQ-007 vs TASK-009 CI scope aligned
  ✓ Traceability: every requirement maps to a task (see REQ ↔ TASK map)
  ✓ Duplicates: REQ-001 vs REQ-004 overlapping criterion separated by failure mode
```
*(Findings from the Step 7.5 requirements-analyst audit — RVW-101/102/104/105/106/
107/108/109 addressed by the amendments above; RVW-103 by the backlog promotion.)*

## Coverage Analysis (Step 6)

| Dimension | Status |
|---|---|
| Functionality | ✓ REQ-001..003 |
| Data & persistence | ✓ REQ-001, REQ-004 |
| Error handling | ✓ REQ-001, REQ-004 |
| Maintainability | ✓ REQ-005..008 |
| Accessibility | ⚠ partial — no accessibility REQ this sprint; existing `aria-invalid` behaviour retained but not re-specified (acknowledged acceptable for v0.1) |
| UI & visual quality | ⚠ none — v0.1 styling stays minimal (acknowledged) |
| Security | ⚠ acknowledged decision — v0.1 stores personal financial data in `localStorage` (same-origin readable) and `npm start` serves over plain HTTP on the local network; **no new security surface added this sprint**, plain-HTTP serving accepted as a dev-only exposure (not changed) |
| Performance | ✓ REQ-009 (1,000 expenses rendered in < 200 ms) |
| Deployment & operations | ⚠ REQ-007 adds a CI surface — acknowledged; container unchanged |
| Internationalisation | — not requested |

## Quality Assurance Summary (Step 7)

```
Reliability:
  ✓ REQ-004 — measurement plan defined (typed-invalid + mixed-list cases)
  ✓ REQ-009 — metric (< 200 ms with 1,000 expenses) + measurement (automated test) defined
  ⚠ REQ-001 — error-path conditions described; recovery target deferred to OQ-001

Maintainability:
  ✓ REQ-005 — metric (lint exit 0, ignore scoped to .opencode/**) defined
  ✓ REQ-006 — decision clause verifiable now; state clause unblocked by DEC-001
  ✓ REQ-007 — metric (CI runs and fails on style error) defined
  ⚠ REQ-008 — floor set (60%); baseline unknown until first run
```

## Open Questions

- id: OQ-001
  question: "On a failed save, should the typed expense values remain in the form for a retry?"
  resolves_in: DESIGN
  impact: behavioral
  status: resolved
  raised_at: REQ-001
  resolved_at: "2026-11-10"
  resolved_in: DESIGN
  answer: "Yes — keep the typed values in the form after a failed save so the user can retry without re-entering them."
  answered_by: agent
  confidence: High
  traces: [DEC-002]
- id: OQ-002
  question: "Which branch is the trunk — merge `mywork` into `main`, or promote `mywork`?"
  resolves_in: DESIGN
  impact: scope-shaping
  status: resolved
  raised_at: REQ-006
  resolved_at: "2026-11-10"
  resolved_in: DESIGN
  answer: "Merge `mywork` into `main` — `main` becomes the trunk containing the full CalcApp."
  answered_by: user
  confidence: Verified
  traces: [DEC-001]
- id: OQ-003
  question: "Should TASK `implements:` links be populated and a short `docs/intent.md` added (or `docs/plan.md` linked as intent) so coverage is machine-checkable?"
  resolves_in: DESIGN
  impact: cosmetic
  status: resolved
  raised_at: REQ-004
  resolved_at: "2026-11-10"
  resolved_in: DESIGN
  answer: "Yes — populate `TASK.implements` and add a one-line intent note linking `docs/plan.md` as the adopted project's intent source."
  answered_by: agent
  confidence: High
  traces: []
