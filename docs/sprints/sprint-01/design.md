---
gse:
  type: design
  sprint: 1
  branch: gse/sprint-01/integration
  status: approved
  created: "2026-11-10"
  updated: "2026-11-10"
  traces:
    derives_from: [PLN-001]
    implements: [REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-007, REQ-008]
    tested_by: []
    decided_by: [DEC-001, DEC-002, DEC-003, DEC-004, DEC-005, DEC-006]
---

# Sprint 1 — Design

Design is **incremental and light** this sprint: CalcApp v0.1 already exists, so this
design mostly *preserves existing seams* and adds one new one, rather than
restructuring. No new components beyond a small id helper.

## Scope Analysis (Step 1)

| Requirement | Component(s) affected |
|---|---|
| REQ-001 (storage failure) | Persistence, Add-flow, Dashboard |
| REQ-002 (dates) | Validation |
| REQ-003 (ids) | Identity (new), Add-flow |
| REQ-004 (damaged data) | Persistence, Dashboard |
| REQ-005 (style checker) | Tooling (`eslint.config.js`) |
| REQ-006 (trunk) | Version control (no code) |
| REQ-007 (CI) | Tooling (workflow) |
| REQ-008 (coverage) | Tooling (coverage) |

## Component Decomposition (Step 2)

```
Component: Validation  (src/expense.ts — existing)
  Responsibility: Decide whether an expense draft is valid; the single place that
                  trims and validates the date (REQ-002) and knows the category list.
  Dependencies:   none
  Dependents:     Form, Persistence (load guard reuses isCategory/isStoredExpense)
  Interface:      validateExpense(draft) -> ValidationResult   (see Step 3)
  Requirements:   REQ-002, REQ-004 (shared shape rules)

Component: Persistence  (src/storage.ts — existing, hardened)
  Responsibility: The ONLY module that touches localStorage; load validates shape,
                  save signals failure instead of throwing past the caller (REQ-001,
                  REQ-004).
  Dependencies:   Validation (category/shape rules)
  Dependents:     Add-flow, Dashboard
  Interface:      loadExpenses() -> Expense[] ; saveExpenses(items) -> SaveResult
  Requirements:   REQ-001, REQ-004

Component: Identity  (new small module, e.g. src/id.ts)
  Responsibility: Produce a unique expense id without requiring a secure context
                  (REQ-003). Single seam so it is testable in isolation (LRN-002).
  Dependencies:   none
  Dependents:     Add-flow
  Interface:      newId() -> string
  Requirements:   REQ-003

Component: Add-flow  (src/pages/AddExpense.tsx — existing, adjusted)
  Responsibility: Build a draft, obtain an id, save, and on failure surface an error
                  while keeping the typed values (REQ-001, DEC-002); REFUSE to save
                  when the existing list could not be read, so unreadable data is
                  never overwritten (DEC-007).
  Dependencies:   Identity, Persistence, Form
  Dependents:     Router
  Requirements:   REQ-001, REQ-003

Component: Form  (src/ExpenseForm.tsx — existing)
  Responsibility: Render labelled fields, call validateExpense, call onAdd; keep its
                  values when onAdd reports a save failure (DEC-002).
  Dependencies:   Validation
  Dependents:     Add-flow
  Requirements:   REQ-001, REQ-002

Component: Dashboard  (src/pages/Home.tsx — existing)
  Responsibility: List valid expenses newest-first with the month total; tolerate a
                  failed or damaged load without breaking, and show a load-error
                  notice that is DISTINCT from the empty state when the read failed
                  (REQ-001, REQ-004, DEC-007).
  Dependencies:   Persistence
  Requirements:   REQ-001, REQ-004

Component: Tooling  (eslint.config.js, CI workflow, coverage — repo config)
  Responsibility: Make the repository's own guards pass and stay passing (REQ-005,
                  REQ-007, REQ-008).
  Requirements:   REQ-005, REQ-006, REQ-007, REQ-008
```

**Decomposition rules check:** single responsibility per component ✓ · dependencies
flow towards the stable core (Validation has no deps; UI depends on core) ✓ · no
circular dependencies ✓ · components talk through explicit interfaces ✓.

## Shared State (Step 2.5)

| Name | Scope | Mechanism | Rationale | Traces |
|---|---|---|---|---|
| `expenses` (key `calcapp.expenses`) | Add-flow (write), Dashboard (read) | `localStorage`, accessed **only** through the Persistence module | One logical list must be consistent between the page that writes it and the page that reads it; funnelling every access through one module is what makes REQ-001/REQ-004 testable | REQ-001, REQ-003, REQ-004 |

No other cross-component state exists (the app has no session/user/theme state in v0.1).

## Interface Contracts (Step 3)

```
Interface: Validation
  validateExpense(draft: ExpenseDraft) -> ValidationResult
    - Input:  { amount: number, category: string, date: string }
    - Output: { ok: true,  value: Expense }
              { ok: false, field: 'amount'|'category'|'date', message: string }
    - Errors: none thrown (failure is a returned value)
    - Invariants: on ok, value.date is trimmed and calendar-valid (DEC-004);
                  category ∈ CATEGORIES
    - Side effects: none (pure)

Interface: Persistence
  loadExpenses() -> LoadResult
    - Output: { ok: true,  items: Expense[] }   — items filtered by the shape rules;
                a missing key or a parse error yields { ok: true, items: [] } (empty ≠ failure)
              { ok: false, reason: string }      — a storage READ failure (REQ-001, DEC-007)
    - Errors: never throws; failure is a returned value
    - Side effects: reads localStorage

  saveExpenses(items: Expense[]) -> SaveResult
    - Output: { ok: true } | { ok: false, message: string }
    - Errors: a storage write failure is RETURNED, not thrown (REQ-001, DEC-002)
    - Side effects: writes localStorage
    - Contract: a caller MUST NOT write when its preceding read failed — no
      read-modify-write over unreadable data (Add-flow + DEC-007)

Interface: Identity
  newId() -> string
    - Output: a string unique among ids produced in the same session (REQ-003)
    - Errors: never throws
    - Invariants: uniqueness (used as React list key and delete key)
    - Side effects: none
```

## Architecture Decisions (Step 4)

| DEC | Topic | Tier |
|---|---|---|
| DEC-001 | Trunk policy — merge `mywork` into `main` | Gate |
| DEC-002 | Failed-save recovery keeps the form values | Inform |
| DEC-003 | `newId()` seam, secure-context independent, uniqueness preserved | Inform |
| DEC-004 | Reject non-ISO and calendar-invalid dates | Inform |
| DEC-005 | CI scope excludes coverage this sprint | Inform |
| DEC-006 | Populate task↔requirement links + intent note | Inform |
| DEC-007 | Unreadable storage is never overwritten (load failure ≠ empty) | Gate |

## Dependency Graph

```
       (stable core)                     (UI)
  Validation  <----- Form <----- Add-flow
      ^                             |  \
      |                             |   \
  Persistence <---------------------+    Identity
      ^                                   
      |                                    
  Dashboard
```
Dependencies point towards `Validation` / `Persistence`; nothing depends on a UI
component. No cycles.

## Validation (Step 5)

```
Design Validation — Sprint 1
────────────────────────────
  ✓ Coverage: every REQ-001..008 addressed by a component
  ✓ Circular dependencies: none
  ✓ Interface completeness: 4/4 components have an interface
  ✓ Error handling: each interface defines its failure cases (returned, not thrown)
  ✓ Decision records: 6 DEC entries for the choices made
  ✓ Consistency: no contradiction with existing decisions
```

## Inform-tier Decisions

Accepted as-is at DESIGN closure (2026-11-10) — low-stakes choices the agent made
autonomously (P7 Inform tier), recorded here for visibility:

- `loadExpenses` returns a **result type** (`{ ok, items } | { ok: false, reason }`)
  instead of throwing.
- Invalid dates are **rejected** rather than normalised (DEC-004).
- The `newId()` helper lives in its **own small module** (the Identity component).
- CI **excludes coverage** this sprint (DEC-005).
- `TASK.implements` links populated and `docs/plan.md` recorded as the intent source
  (DEC-006).
- The component diagram is rendered as **text/ASCII** rather than Mermaid.
