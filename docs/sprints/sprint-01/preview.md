---
gse:
  type: preview
  sprint: 1
  branch: gse/sprint-01/integration
  status: approved
  preview_variant: static
  created: "2026-11-10"
  updated: "2026-11-10"
  traces:
    derives_from: [PLN-001]
    implements: [REQ-001, REQ-002]
    decided_by: [DEC-002, DEC-007]
---

# Sprint 1 — Preview

**Variant choice (Inform):** `static`. The generic guidance for web projects is
`scaffold`, but this project already *is* a running React/Vite app — a scaffold would
duplicate an existing project. Only two visible surfaces change this sprint, so a
wireframe description is the right weight.

**Targets:** the only user-visible changes this sprint are the two error states
(TASK-004 → REQ-001) and the date validation message (TASK-003 → REQ-002). All other
tasks are invisible (storage internals, ids, tooling).

## UI Preview — Dashboard load failure (TASK-004 / REQ-001 / DEC-007)

```
  ┌─────────────────────────────────────────────┐
  │  CalcApp            Dashboard   Add Expense │
  ├─────────────────────────────────────────────┤
  │                                             │
  │   ⚠  We couldn't load your expenses.        │
  │      Your saved data may still be there —   │
  │      we just can't read it right now.       │
  │      Nothing has been changed or deleted.   │
  │                                             │
  │      [ Try again ]                          │
  │                                             │
  └─────────────────────────────────────────────┘
```

- Distinct from the existing empty state ("No expenses yet", total `0.00 €`).
- The notice appears only when the read *failed* — a genuinely empty store still
  shows the normal empty state.
- While the notice is shown, **Add Expense must not overwrite** the unreadable data
  (DEC-007): submitting there shows the save-failure message below rather than
  replacing the stored list.

## UI Preview — Add page save failure (TASK-004 / REQ-001 / DEC-002)

```
  ┌─────────────────────────────────────────────┐
  │  CalcApp            Dashboard   Add Expense │
  ├─────────────────────────────────────────────┤
  │  Add Expense                                │
  │                                             │
  │   Amount    [ 42.50            ]            │
  │   Category  [ Food           ▾ ]            │
  │   Date      [ 2026-11-10       ]            │
  │                                             │
  │   ⚠  Couldn't save — your browser blocked   │
  │      storage. Nothing was lost and your     │
  │      entries are still filled in below —    │
  │      check your browser settings and try    │
  │      again.                                 │
  │                                             │
  │   [ Add expense ]                           │
  └─────────────────────────────────────────────┘
```

- The typed values **remain in the fields** after a failed save (DEC-002).
- The page does not navigate away and does not behave as if the save succeeded.

## UI Preview — Date validation message (TASK-003 / REQ-002)

```
  ┌─────────────────────────────────────────────┐
  │  Add Expense                                │
  │                                             │
  │   Amount    [ 42.50            ]            │
  │   Category  [ Food           ▾ ]            │
  │   Date      [ 10/11/2026       ]  ← aria-invalid
  │                                             │
  │   ⚠  Enter a valid date in the form         │
  │      YYYY-MM-DD.                            │
  │                                             │
  │   [ Add expense ]                           │
  └─────────────────────────────────────────────┘
```

- Reuses the existing validation-styling pattern (`role="alert"` + `aria-invalid` on
  the offending field only, from RVW-2).
- A date with surrounding whitespace is *accepted* after trimming (no message).

## Not previewed (no visible surface)

TASK-001 (style checker), TASK-002 (trunk), TASK-005 (id helper), TASK-006 (storage
tests), TASK-009 (CI), TASK-010 (coverage) — no user-visible artefact this sprint.

## Validation questions for the user

1. Is the load-failure wording clear that **nothing was lost**?
2. Is "Try again" the right action (vs. just an explanation)?
3. Is the save-failure message too long for a small screen?
