---
gse:
  type: test
  sprint: 1
  branch: gse/sprint-01/integration
  traces:
    derives_from: [PLN-001]
    implements: [REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009]
    decided_by: [DEC-001, DEC-002, DEC-003, DEC-004, DEC-005, DEC-006, DEC-007]
  status: approved
  created: "2026-11-10"
  updated: "2026-11-10"
---

# Test Definitions — Sprint 1

## Test Strategy

- **Domain:** web (single-page React app, client-only)
- **Pyramid target:** Unit ~50% · Integration ~30% · E2E ~15% · Policy ~5%
- **Coverage target:** 60% (from `config.yaml → testing.coverage.minimum`; baseline unknown until TASK-010)
- **Framework:** Vitest + Testing Library + jsdom (already installed)
- **Conventions:** each test names its `TST-NNN` in the test title or comment so the
  deterministic TST-implementation check can find it; validation tests trace to REQS,
  verification tests to DESIGN, policy tests to DEC.
- **Risk-based priority:** REQ-001 / REQ-004 (data safety, `must`) and every module
  touched by a review finding (RVW-3..7) get the deepest coverage.
- **CI integration:** deferred with TASK-009 (pool) — the course supplies a CI kit.
- **Review passes:** strategy and TST-spec reviews did **not** auto-fire (domain is not
  security-sensitive, budget 10 ≤ 15, TST count < 20, no `quality_gap` trace).

## Unit Tests (verification + validation)

### TST-001 — Save failure returns a failure result
- **Implements:** REQ-001 · **Component:** Persistence (`storage.ts`)
- **Given** the storage API throws on write · **When** `saveExpenses` is called
- **Then** it returns `{ ok: false, message }` and does not throw
- **Level:** unit

### TST-002 — Load failure is distinguishable from empty
- **Implements:** REQ-001, DEC-007 · **Component:** Persistence (`storage.ts`)
- **Given** the storage API throws on read · **When** `loadExpenses` is called
- **Then** it returns `{ ok: false, reason }` — NOT a success with an empty list
- **Level:** unit

### TST-003 — A date with surrounding whitespace is trimmed
- **Implements:** REQ-002 · **Component:** Validation (`expense.ts`)
- **Given** `" 2026-11-10 "` · **When** validated · **Then** the accepted value's date is `"2026-11-10"`
- **Level:** unit

### TST-004 — A non-ISO date is rejected
- **Implements:** REQ-002 · **Component:** Validation (`expense.ts`)
- **Given** `"10/11/2026"` · **When** validated · **Then** `{ ok: false, field: 'date', message }`
- **Level:** unit

### TST-005 — A calendar-invalid date is rejected
- **Implements:** REQ-002, DEC-004 · **Component:** Validation (`expense.ts`)
- **Given** `"2026-02-31"` and `"2026-13-01"` · **When** validated · **Then** `{ ok: false, field: 'date' }`
- **Level:** unit

### TST-006 — Id generation works without a secure context
- **Implements:** REQ-003, DEC-003 · **Component:** Identity (`id.ts`)
- **Given** `crypto.randomUUID` is undefined · **When** `newId()` is called · **Then** a non-empty id is returned
- **Level:** unit

### TST-007 — Ids do not collide (persisted-dataset uniqueness)
- **Implements:** REQ-003, DEC-003 · **Component:** Identity (`id.ts`)
- **Given** a stored id, and 1,000 ids generated in one run
- **When** ids are generated · **Then** all 1,000 are distinct from each other
  and none equals the stored id (volume run — no collisions across a realistic dataset)
- **Level:** unit

### TST-008 — Wrong-shape stored data yields an empty list
- **Implements:** REQ-004 · **Component:** Persistence (`storage.ts`)
- **Given** `{}`, `"hello"`, `42`, `null` under the key · **When** the loader runs · **Then** `{ ok: true, items: [] }`
- **Level:** unit

### TST-009 — Mixed good/broken rows are filtered
- **Implements:** REQ-004 · **Component:** Persistence (`storage.ts`)
- **Given** a list mixing valid rows and rows with a bad amount/category/date
- **When** the loader runs · **Then** only the valid rows are returned
- **Level:** unit

## Integration Tests

### TST-010 — Add flow keeps values and reports a save failure
- **Implements:** REQ-001, DEC-002 · **Components:** Form + Add-flow + Persistence
- **Setup:** storage stub whose `setItem` throws; a pre-existing in-memory list is on screen;
  render the add route in a memory router
- **Steps:** fill amount/category/date → submit
- **Expected:** a save-failure message is shown; the typed values remain; the route does not
  change; the previously listed expenses are **not** lost from the in-memory list
- **Level:** integration

### TST-011 — Dashboard shows a load-failure notice, not the empty state
- **Implements:** REQ-001, DEC-007 · **Components:** Dashboard + Persistence
- **Setup:** storage stub whose `getItem` throws
- **Expected:** the "couldn't load" notice is shown; the empty state is NOT shown
- **Level:** integration

### TST-012 — Add refuses to overwrite unreadable data
- **Implements:** REQ-001, DEC-007 · **Components:** Add-flow + Persistence + Dashboard
- **Setup:** storage stub that fails reads but tracks writes
- **Expected:** after a failed read, submitting does not write an overwriting list
- **Level:** integration

### TST-013 — Empty store still shows the normal empty state
- **Implements:** REQ-004, DEC-007 · **Components:** Dashboard + Persistence
- **Given** the storage key is absent · **When** the dashboard opens
- **Then** "No expenses yet" and `0.00 €` are shown (not the load-failure notice)
- **Level:** integration

## E2E Tests

### TST-014 — Add → list → delete journey still works
- **Implements:** REQ-001, REQ-002, REQ-003 · **Flow:** enter an expense → see it listed with the month total → delete it after confirmation
- **Level:** e2e
- **Evidence limitation (acknowledged, P15):** the project runs Vitest + jsdom with **no
  browser**, so this executes as a jsdom journey test (routes mounted in a memory router) with
  **no screenshot**. Real-browser screenshot/video evidence would require adding Playwright —
  out of scope for this cycle. Visual regression is likewise not available.

## Policy Tests (fast, static)

### TST-015 — Only the persistence module touches localStorage
- **Enforces:** DEC-007 + design `## Shared State` · **Rule:** no `localStorage` reference outside `src/storage.ts`
- **Level:** policy

### TST-016 — The style checker passes with a scoped exception
- **Enforces:** REQ-005 · **Rule:** `npm run lint` exits 0; the ignore covers `.opencode/**` only
- **Level:** policy

### TST-017 — Coverage floor is enforced
- **Enforces:** REQ-008 · **Rule:** `npm run test:coverage` exits non-zero below the configured floor
- **Level:** policy

## Performance Tests

### TST-019 — An empty date is rejected
- **Implements:** REQ-002 · **Component:** Validation (`expense.ts`)
- **Given** `""` (empty date) · **When** validated
- **Then** `{ ok: false, field: 'date', message }` (the empty case, alongside the
  impossible-date case TST-005 and the non-ISO case TST-004)
- **Level:** unit

### TST-018 — Dashboard renders 1,000 expenses under 200 ms
- **Implements:** REQ-009 · **Components:** Dashboard + Persistence
- **Setup:** seed 1,000 expenses (mixed months) into storage
- **Steps:** render the dashboard; measure the render duration
- **Expected:** list AND current-month total rendered in **< 200 ms**; the total equals that month's rows only
- **Level:** performance

## Traceability summary

| REQ | TSTs |
|---|---|
| REQ-001 | TST-001, TST-002, TST-010, TST-011, TST-012 |
| REQ-002 | TST-003, TST-004, TST-005, TST-019 |
| REQ-003 | TST-006, TST-007 |
| REQ-004 | TST-008, TST-009, TST-013 |
| REQ-005 | TST-016 |
| REQ-006 | (verified at DELIVER on the trunk branch) |
| REQ-007 | deferred (TASK-009 in pool — course CI kit) |
| REQ-008 | TST-017 |
| REQ-009 | TST-018 |
