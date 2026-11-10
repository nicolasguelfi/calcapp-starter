# Review of CalcApp v0.1

Scope: `git diff j2-start -- src`, checked against `docs/plan.md` (T1–T8) on branch `fix/review`.
Focus: bugs and runtime errors, missing error handling, user input reaching storage
unvalidated, tests that prove nothing.

## Triage

| ID | Severity | File | Decision | Status |
|---|---|---|---|---|
| RVW-1 | HIGH | `src/storage.ts` | fix now | fixed — `b94e143` (test, RED), `72fe7f3` (fix) |
| RVW-2 | HIGH | `src/ExpenseForm.tsx` | fix now | fixed — `dd8b427` (test, RED), `479e9e2` (fix) |
| RVW-3 | MEDIUM | `src/expense.ts` | later | open |
| RVW-4 | MEDIUM | `src/expense.ts` | later | open |
| RVW-5 | MEDIUM | `src/storage.ts` | later | open |
| RVW-6 | MEDIUM | `src/pages/AddExpense.tsx` | later | open |
| RVW-7 | MEDIUM | `tests/storage.test.ts` | later | open |
| RVW-8 | LOW | `tests/money.test.ts` | later | open |
| RVW-9 | LOW | `tests/App.test.tsx` | later | open |
| RVW-10 | LOW | `tests/AddExpense.test.tsx` | later | open |
| RVW-11 | LOW | `src/App.tsx` | later | open |
| RVW-12 | LOW | `tests/Home.test.tsx` | later | open |
| RVW-13 | LOW | `src/storage.ts` | refuse — missing trailing newline is cosmetic; a formatter can handle it later, not worth a review cycle | refused |

Only the two HIGH findings are fixed in this cycle; everything marked `later` stays
open on purpose and is not silently dropped.

## Fix log

**RVW-1** (`b94e143`, `72fe7f3`) — `loadExpenses` now parses into `unknown`,
returns `[]` for anything that is not an array, and filters out rows that are not
objects or that carry a non-positive/non-numeric amount, an unknown category or an
empty date. `isCategory` moved to an export in `src/expense.ts` so the read boundary
applies the same category rule as the form. Tests cover `{}`, `"hello"`, `null`,
`42` and `{"expenses": []}`, plus a mixed list of good and broken rows.

One decision worth recording: the guard validates `id` **when present but does not
require it**, and `Expense["id"]` is now optional, with `Home.handleDelete` ignoring a
row that has none. The RED phase showed that requiring an id contradicted
`saveExpenses`' own contract — it accepts bare `ExpenseDraft`s and plan T3 pins the
round-trip ("returns exactly what `saveExpenses()` wrote") — so requiring one would
have meant editing that pre-existing test, which is RVW-7 territory and was deferred.
The guard mirrors the write contract instead of tightening it, and the case is
asserted positively in `keeps a valid draft that carries no id`.

**RVW-2** (`dd8b427`, `479e9e2`) — `ValidationResult`'s failure variant now carries
`field` next to `message`; the form keeps the result in state, renders
`<p role="alert">{message}</p>` and sets `aria-invalid="true"` on the offending field
only (absent elsewhere), clearing both on the next successful submit. Tests assert
that `onAdd` is not called while invalid, that the right field is marked, and that a
corrected submit clears the alert.

## Findings in brief

- **RVW-1 (HIGH, `src/storage.ts`)** — `loadExpenses` casts `JSON.parse` straight to
  `Expense[]`. Valid-but-wrong JSON (`{}`, `"hello"`, entries without `id`/`date`)
  reaches the renderers, where `[...expenses]`, `b.date.localeCompare` and
  `amount.toFixed` throw, blanking the dashboard with no recovery path.
- **RVW-2 (HIGH, `src/ExpenseForm.tsx`)** — `if (result.ok) onAdd(...)` discards
  `result.message`, so submitting an invalid or empty form does nothing at all: no
  message, no `aria-invalid`. No test covers the invalid path, so nothing failed.
- **RVW-3 (MEDIUM, `src/expense.ts`)** — the date is checked trimmed but returned
  untrimmed, so `" 2026-11-10 "` is stored and then silently excluded from the
  monthly total by `date.slice(0, 7)`.
- **RVW-4 (MEDIUM, `src/expense.ts`)** — the date is only checked for emptiness; a
  non-ISO date reaches storage and is silently dropped from the total.
- **RVW-5 (MEDIUM, `src/storage.ts`)** — neither `getItem` nor `setItem` is guarded:
  a storage error in the add flow throws before `navigate('/')` and loses the expense.
- **RVW-6 (MEDIUM, `src/pages/AddExpense.tsx`)** — `crypto.randomUUID()` needs a
  secure context; over plain HTTP (`vite preview --host 0.0.0.0`) or older Safari it
  is undefined and submit throws.
- **RVW-7 (MEDIUM, `tests/storage.test.ts`)** — every case uses id-less drafts and
  "corrupt JSON" only means a parse error, so the wrong-shape crash above is untested.
- **RVW-8 (LOW, `tests/money.test.ts`)** — the `not.toMatch(/\u00a0|\u202f/)` case is
  tautological given the exact-string assertion above it.
- **RVW-9 (LOW, `tests/App.test.tsx`)** — the first case renders the real `<App />`
  browser router instead of the memory-router helper, proving nothing extra.
- **RVW-10 (LOW, `tests/AddExpense.test.tsx`)** — asserts the heading and storage but
  not the dashboard list, so half of the T6 flow is unverified.
- **RVW-11 (LOW, `src/App.tsx`)** — no `errorElement`, so unknown paths and render
  errors show the default error screen or a blank page.
- **RVW-12 (LOW, `tests/Home.test.tsx`)** — redeclares `StoredExpense` instead of
  importing the `Expense` type that `src/storage.ts` already exports.
- **RVW-13 (LOW, refused, `src/storage.ts`)** — missing trailing newline; cosmetic
  only, a formatter can handle it later, not worth a review cycle.
