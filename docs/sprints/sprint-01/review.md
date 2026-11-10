---
gse:
  type: review
  sprint: 1
  branch: gse/sprint-01/integration
  status: done
  created: "2026-11-10"
  updated: "2026-11-10"
  traces:
    derives_from: [PLN-001]
    implements: [REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009]
---

# Sprint 1 — Review

Scope: `git diff main..gse/sprint-01/integration` (TASK-003..006, 010, 011) plus
`53deae7` (TASK-001). TASK-002 is a version-control operation with no code.

Perspectives run in parallel: code-reviewer, security-auditor, requirements-analyst,
architect, test-strategist (IMPL tier), ux-advocate. Devil's advocate (P16) run in a
separate fresh context. Suite at review time: **66 tests / 11 files green**, lint clean,
coverage 100 % lines.

## Summary

| Severity | Count |
|---|---|
| HIGH | 5 |
| MEDIUM | 16 |
| LOW | 11 |
| **Total** | **32** |

`[AI-INTEGRITY]` findings: 15. `DA execution: isolated` (devil-advocate sub-agent).

**Headline:** the sprint's headline metrics are honest, but the central promise —
*"never lose my data"* — has one unclosed destruction path (RVW-001) that the DEC-007
design pass did not consider, and three artefact-level claims do not survive contact
with the repository (RVW-004, RVW-005, RVW-008).

---

## HIGH

### RVW-001 [HIGH] — The add flow re-persists the FILTERED list, destroying dropped rows
- **perspective:** devil-advocate
- **location:** `src/pages/AddExpense.tsx:26` (with `src/storage.ts:74`, `src/pages/Home.tsx:38`)
- **finding:** `loadExpenses()` returns `items` **after** `isStoredExpense` filtering, and the add/delete paths write `[...existing.items, expense]` back. Every stored row the read guard silently drops (a valid-JSON wrong-shape row) is therefore **permanently destroyed on the next add or delete** — the exact "lose my data" outcome DEC-007 claims to have closed, and directly contradicting TASK-004's "no data clobber" acceptance criterion.
- **suggestion:** have `loadExpenses()` expose the rows it dropped (or the raw array) so the write path re-emits untouched rows, or refuse to save when rows were filtered. Add a test that seeds a wrong-shape row and asserts it survives an add.
- **task:** TASK-004 · **status:** open

### RVW-002 [HIGH] — The load-failure screen is a dead end
- **perspective:** ux-advocate
- **location:** `src/pages/Home.tsx:20-27`
- **finding:** a failed read replaces the whole dashboard with plain text and offers no retry control, no cause, and no reassurance. The user cannot tell a transient read failure from permanently blocked storage and has no way forward in-app. The approved `preview.md` promised a **"Try again"** button plus "Nothing has been changed or deleted"; the shipped UI keeps the code-level guarantee but drops the affordance that makes it visible.
- **suggestion:** add the previewed retry button (re-run `loadExpenses()`, update state) and state explicitly that nothing was changed or deleted.
- **task:** TASK-004 · **status:** open

### RVW-003 [HIGH] — The add-flow read-failure message discards the typed values it exists to preserve
- **perspective:** ux-advocate
- **location:** `src/pages/AddExpense.tsx:19-21`
- **finding:** the message says "Reload the page and try again" — which throws away the typed values DEC-002 deliberately preserves — and gives no cause or remedy, so while the store is unreadable the core task is impossible with no actionable path.
- **suggestion:** drop the reload instruction, keep the values, and say storage is blocked plus how to re-enable it, with a retry that re-reads storage.
- **task:** TASK-004 · **status:** open

### RVW-004 [HIGH] — TST-015 declared in the approved plan but not implemented
- **perspective:** test-strategist, requirements-analyst, architect, devil-advocate
- **location:** `docs/sprints/sprint-01/tests.md:125`
- **finding:** the policy test "only the persistence module touches `localStorage`" is declared (and cited as enforcing DEC-007 + the design `## Shared State`), but no test implements it — `tests/policy/` holds only `coverage.test.ts` and `lint.test.ts`. The sprint's central invariant is unguarded: a future direct `localStorage` read in `Home.tsx` would pass the whole suite. As worded the check would also be **red today**, since several tests touch `localStorage` directly.
- **suggestion:** implement `tests/policy/localstorage.test.ts` scoped to `src/**` (asserting no `localStorage` outside `src/storage.ts`), or move TST-015 to `workflow.skipped` and strike it from the traceability map.
- **task:** TASK-006 · **status:** open

### RVW-005 [HIGH] — DEC-005 and REQ-007 rest on a false premise
- **perspective:** devil-advocate
- **location:** `.gse/decisions.md:66` (DEC-005), `docs/sprints/sprint-01/reqs.md` (REQ-007), `.github/workflows/ci.yml:20`
- **finding:** DEC-005 and REQ-007 assert that "neither the `test:coverage` script nor the coverage provider exists on the working copy". Both exist (`package.json` carries `test:coverage`; `@vitest/coverage-v8` is installed) and the repo's CI workflow already runs `npm run test:coverage`. The decision's premise is false, its scope exclusion is materialised nowhere, and REQ-007 contradicts REQ-008 in the same document.
- **suggestion:** correct DEC-005 / REQ-007 to the real reason (the coverage run had never been *exercised*, not that it was impossible), and either drop `test:coverage` from `ci.yml` or delete DEC-005.
- **task:** TASK-010, TASK-009 · **status:** open

---

## MEDIUM

### RVW-006 [MEDIUM] — `newId()` fallback can emit constant-entropy ids
- **perspective:** devil-advocate, code-reviewer, security-auditor
- **location:** `src/id.ts:19-25`
- **finding:** when `crypto.getRandomValues` is unavailable (the very non-secure contexts DEC-003 targets) the `Uint32Array` stays zero-filled, so `entropy` is the constant `"0000…0"` and uniqueness rests on `Date.now()` plus a counter that **resets on every page load** — cross-session collisions are possible, which DEC-003 itself says silently deletes two expenses. The `crypto === undefined` path is never exercised.
- **suggestion:** fail loudly (or use a documented entropy source) when neither `randomUUID` nor `getRandomValues` exists, and add a test for that path.
- **task:** TASK-005 · **status:** open

### RVW-007 [MEDIUM] — The read guard still accepts non-ISO dates (RVW-4's read side)
- **perspective:** security-auditor, architect, devil-advocate
- **location:** `src/storage.ts:37-38` (with `src/money.ts:9`)
- **finding:** `isStoredExpense` accepts **any** non-empty string date, so a row written by the pre-fix app (`"10/11/2026"` — literally RVW-4's scenario) still loads, still renders, and is still silently excluded from the month total. No test feeds a non-ISO date to the loader. The asymmetry is commented, so it is a documented residual rather than a hidden bug.
- **suggestion:** reuse `isIsoDate` in `isStoredExpense` (or surface "N rows could not be counted") and add the loader case.
- **task:** TASK-004, TASK-006 · **status:** open

### RVW-008 [MEDIUM] — TST-007's collision assertion can never fail
- **perspective:** devil-advocate, test-strategist
- **location:** `tests/id.test.ts:20-28`, `docs/sprints/sprint-01/tests.md:65-70`
- **finding:** the plan's original case ("a storage-seeded colliding id … the new ids differ from the stored one") was rewritten into "1,000 ids are distinct" — which the module-level counter guarantees on its own — and `expect(ids.has('existing-stored-id'))` is vacuous: no generated id (UUID, or `base36-counter-32hex`) can ever equal that literal. The assertion **cannot fail**.
- **suggestion:** restore a falsifiable case — freeze `Date.now()`, precompute the fallback id, seed it as the stored id, and assert the next id differs; add a persisted round-trip through `storage.ts`.
- **task:** TASK-005 · **status:** open

### RVW-009 [MEDIUM] — TST-017 does not pin the configured coverage floor
- **perspective:** code-reviewer, requirements-analyst, devil-advocate, test-strategist
- **location:** `tests/policy/coverage.test.ts:19`
- **finding:** `expect(thresholds?.lines).toBeGreaterThan(0)` passes for a floor of 1 %, and never compares against `.gse/config.yaml → testing.coverage.minimum` (60) or checks the declared "exits non-zero below the floor" behaviour, so the report's "enforced at 60 %" claim is unverified. The 60 in `vite.config.ts` is a hand-maintained duplicate of the config value.
- **suggestion:** assert `thresholds?.lines` equals the value read from `.gse/config.yaml` (single source), and consider `perFile` so one file dropping to 0 % is not masked by a high global average.
- **task:** TASK-010 · **status:** open

### RVW-010 [MEDIUM] — TST-018 seeds a single month and gates on a flaky wall clock
- **perspective:** test-strategist, devil-advocate, code-reviewer
- **location:** `tests/dashboard-performance.test.tsx:25,35`
- **finding:** the test seeds **every** row in the current month, so REQ-009's criterion "the month total equals the sum of **that month's** rows only" is never exercised (a total that summed all months would still yield `10000.00 €`); and `expect(elapsed).toBeLessThan(200)` measures real `performance.now()` on a synced volume, so it will fail intermittently. Measured render is ~88 ms; the suite total is 320–460 ms.
- **suggestion:** seed a mix of months and assert the month-filtered total; keep the 200 ms budget but record the measured value in the campaign and label it a smoke check, not proof of responsiveness.
- **task:** TASK-011 · **status:** open

### RVW-011 [MEDIUM] — TST-014 declared but not implemented
- **perspective:** requirements-analyst, architect, test-strategist, devil-advocate
- **location:** `docs/sprints/sprint-01/tests.md:115`
- **finding:** the declared add → list → delete journey has no test; it exists only as split slices (add-and-return in `AddExpense.test.tsx`, delete in isolation in `Home.test.tsx`). The traceability row cites TST-014 as covering REQ-001/002/003, so the matrix asserts end-to-end coverage that does not exist.
- **suggestion:** add one jsdom journey test, or mark TST-014 covered-by-composition and remove it from the REQ trace lists.
- **task:** TASK-006 · **status:** open

### RVW-012 [MEDIUM] — REQ-003's delete-isolation criterion is no longer covered
- **perspective:** requirements-analyst
- **location:** `docs/sprints/sprint-01/tests.md:66-70`
- **finding:** REQ-003's acceptance criterion ("two expenses added in the same session … deleting one leaves the other present") is not covered by the tests traced to REQ-003: rewriting TST-007 into a volume-uniqueness test dropped the deletion-isolation assertion.
- **suggestion:** re-add a two-entry add-then-delete-one assertion traced to REQ-003, or add the existing `Home.test.tsx` deletion case to REQ-003's trace list.
- **task:** TASK-005 · **status:** open

### RVW-013 [MEDIUM] — `test_evidence` campaign references are bulk-assigned and mismatched
- **perspective:** requirements-analyst, devil-advocate
- **location:** `.gse/backlog.yaml` TASK-002..011
- **finding:** six tasks cite `coverage-baseline.md`, whose own frontmatter scopes it to `implements: [REQ-008] / derives_from: [TASK-010]` and carries no per-REQ table — so evidence for REQ-001/002/003/004/009 points at a campaign that formally implements only REQ-008. TASK-002 (REQ-006) points at the TASK-001 lint campaign, measured on a different branch.
- **suggestion:** re-point each task at a per-task campaign record (or extend the report's traces), and run one campaign on `main` for REQ-006.
- **task:** TASK-002, TASK-003, TASK-004, TASK-005, TASK-006, TASK-011 · **status:** open

### RVW-014 [MEDIUM] — Duplicate campaign ID `TCP-002`
- **perspective:** devil-advocate
- **location:** `docs/sprints/sprint-01/test-reports/TCP-001-sprint-01-task-001.md:3`, `coverage-baseline.md:3`
- **finding:** both files declare `gse.id: TCP-002`, so the artefact named TCP-001 identifies itself as TCP-002 and two artefacts share one ID — a P6 uniqueness violation that will mis-resolve any `campaign_ref` by ID.
- **suggestion:** renumber to TCP-001 (TASK-001 campaign) and TCP-002 (coverage baseline).
- **task:** TASK-010 · **status:** open

### RVW-015 [MEDIUM] — design.md's Identity contract contradicts DEC-003
- **perspective:** architect
- **location:** `docs/sprints/sprint-01/design.md:135` vs `.gse/decisions.md:39`
- **finding:** the interface says `newId()` is "unique among ids produced in **the same session**", while DEC-003 explicitly supersedes that ("unique across all ids ever persisted … not only within a session"). The code satisfies the stronger property; the contract does not state it.
- **suggestion:** update `design.md:135` to the cross-session wording.
- **task:** TASK-005 · **status:** open

### RVW-016 [MEDIUM] — The documented Form contract is not implemented
- **perspective:** architect
- **location:** `docs/sprints/sprint-01/design.md:73-74` vs `src/ExpenseForm.tsx:7`
- **finding:** design says the Form must "keep its values when **`onAdd` reports a save failure**", but `onAdd: (expense: ExpenseDraft) => void` has no failure channel; values survive only incidentally because `AddExpense.handleAdd` returns early without navigating.
- **suggestion:** add the failure channel (e.g. `onAdd` returns a result, or a `saveError` prop), or restate the Form responsibility to match the page-owned mechanism.
- **task:** TASK-004 · **status:** open

### RVW-017 [MEDIUM] — Sprint Plan Maintenance Steps 4-5 were skipped after PRODUCE
- **perspective:** devil-advocate
- **location:** `.gse/status.yaml:125-149` vs `.gse/plan.yaml:37-43`
- **finding:** the closure commit touched only `backlog.yaml` / `plan.yaml`, so `status.yaml` still reports `last_activity_timestamp: 19:29:48Z`, `task_status_snapshot` lists all eleven tasks as planned/open (the backlog says six `review`), `activity_history` has no PRODUCE entry, `health.score` is `0.0` with an empty `last_computed`, and no coach `workflow_observation` exists after 19:30:33Z.
- **suggestion:** re-run the closure (cursor, `activity_history`, `task_status_snapshot`, one coach observation per axis) and refresh `plan.yaml.updated` / `coherence.last_evaluated`.
- **task:** — (process) · **status:** open

### RVW-018 [MEDIUM] — State timestamps mix UTC and local-time conventions
- **perspective:** devil-advocate
- **location:** `.gse/plan.yaml:37`, six `test_evidence.timestamp` values in `.gse/backlog.yaml`
- **finding:** `"2026-11-10T21:00:00Z"` and `"2026-11-10T20:58:00Z"` are local wall-clock (+01:00) times labelled UTC (the commits are `19:58:36Z` / `19:57:56Z`), while the TASK-001/002 entries are genuine UTC — the same field mixes two conventions and the newest evidence post-dates its own event by ~1 h.
- **suggestion:** normalise every state timestamp to UTC and correct the seven values.
- **task:** — (process) · **status:** open

### RVW-019 [MEDIUM] — A failed delete shows the add-oriented save message
- **perspective:** code-reviewer, ux-advocate
- **location:** `src/pages/Home.tsx:42,53` (text from `src/storage.ts:47-50`)
- **finding:** a failed **delete** surfaces "Could not save your expense — the browser storage is unavailable", naming the wrong operation and the wrong cardinality, so the message contradicts what actually happened.
- **suggestion:** return an operation-aware message (e.g. "Could not delete this expense — the list is unchanged").
- **task:** TASK-004 · **status:** open

### RVW-020 [MEDIUM] — TST-016 does not verify the ignore is scoped to `.opencode`
- **perspective:** security-auditor, requirements-analyst
- **location:** `tests/policy/lint.test.ts:18-30`
- **finding:** the test asserts only that `eslint .` exits 0, so REQ-005's second criterion ("the exception is scoped to `.opencode/**` only; no project rule is removed or weakened") is unverified — a future broadening of `globalIgnores` (e.g. adding `src`) would keep the test green while silently disabling lint over all project code.
- **suggestion:** assert the ignored set equals exactly `['dist', '.opencode']`, or lint a deliberately-bad fixture under `src/` and assert eslint reports it.
- **task:** TASK-001 · **status:** open

### RVW-021 [MEDIUM] — Lint is disabled over a committed third-party plugin tree
- **perspective:** security-auditor
- **location:** `eslint.config.js:11`
- **finding:** `globalIgnores(['dist', '.opencode'])` removes static analysis from ~101 files that are **committed to git** (not gitignored), including the executable `.opencode/plugins/gse-guardrails.ts`. A plugin directory that ships in the repo and can run code in the dev/agent environment is a supply-chain entry point, and lint is no longer the gate over it. No alternative control was recorded.
- **suggestion:** keep the ignore but treat `.opencode/**` as vendored — pin/verify its hash and cover it with a security-oriented scanner; record the excluded alternative (un-tracking `.opencode`).
- **task:** TASK-001 · **status:** open

---

## LOW

### RVW-022 [LOW] — `isIsoDate` rejects ISO years 0000–0099
- **perspective:** code-reviewer, devil-advocate · **location:** `src/expense.ts:41`
- **finding:** `Date.UTC(year, …)` folds years 0–99 into 1900+year, so `isIsoDate("0050-01-01")` returns `false` although the regex admits it and the message claims it "must be a valid date".
- **suggestion:** set the year with `setUTCFullYear` after construction, and add the boundary case. **task:** TASK-003 · **status:** open

### RVW-023 [LOW] — Uncovered branches and a no-op Delete control
- **perspective:** test-strategist, devil-advocate · **location:** `src/id.ts:20`, `src/pages/Home.tsx:35,62`
- **finding:** the `getRandomValues`-unavailable branch and the `if (id === undefined) return` guard are the only uncovered lines; a legacy id-less row renders a **live Delete button that silently does nothing**.
- **suggestion:** add a `crypto = {}` test and an id-less-row test; render the button disabled/absent or backfill ids on load. **task:** TASK-005, TASK-004 · **status:** open

### RVW-024 [LOW] — Dashboard recomputes the sort and total every render
- **perspective:** code-reviewer · **location:** `src/pages/Home.tsx:14,29-30`
- **finding:** `monthTotal` and the O(n log n) sort recompute on every render — the dominant cost the REQ-009 budget measures — and `const [load] = useState(...)` discards the setter for a value that can never change.
- **suggestion:** wrap both in `useMemo` keyed on `expenses`, and use `useMemo` for the one-time load. **task:** TASK-011 · **status:** open

### RVW-025 [LOW] — The lint policy test hardcodes a POSIX binary path
- **perspective:** code-reviewer, devil-advocate · **location:** `tests/policy/lint.test.ts:14`
- **finding:** `node_modules/.bin/eslint` assumes a POSIX layout (no `eslint.cmd` on Windows) and that `process.cwd()` is the repo root, regressing portability versus the previous `npx eslint` form.
- **suggestion:** resolve the path from the module location (`import.meta.dirname`) and pick the platform-specific binary. **task:** TASK-001 · **status:** open

### RVW-026 [LOW] — The positive-amount rule is duplicated
- **perspective:** code-reviewer · **location:** `src/storage.ts:31-39` vs `src/expense.ts:53-55`
- **finding:** `Number.isFinite && > 0` is written in both the write validator and the read guard (the category rule is already shared via `isCategory`).
- **suggestion:** extract a shared predicate. **task:** TASK-006 · **status:** open

### RVW-027 [LOW] — Weak assertions in three tests
- **perspective:** test-strategist, code-reviewer · **location:** `tests/storage.test.ts:48`, `tests/AddExpense.test.tsx:93`, `tests/Home.test.tsx:122`
- **finding:** `expect(result.reason).toBeTruthy()` accepts any non-empty string; `expect(result.items[0].id).toBeTruthy()` accepts any non-empty string; the delete-failure test asserts the list length and alert but not that the total is unchanged.
- **suggestion:** assert the exact `reason`, assert the id differs from a pre-existing one, and assert the total. **task:** TASK-004, TASK-005 · **status:** open

### RVW-028 [LOW] — tests.md hygiene
- **perspective:** test-strategist, devil-advocate · **location:** `docs/sprints/sprint-01/tests.md:137-144`, `.gse/plan.yaml:36`
- **finding:** TST-019 (a unit test) is filed under "## Performance Tests"; `plan.yaml` still says "18 TSTs" while 19 are declared; TST-018 relies on the real clock while `Home.test.tsx` freezes it.
- **suggestion:** regroup TST-019, correct the count, freeze the clock in TST-018. **task:** TASK-006, TASK-011 · **status:** open

### RVW-029 [LOW] — design.md stale self-references, signature drift, dead `reason`
- **perspective:** architect · **location:** `docs/sprints/sprint-01/design.md:13,111,122,126,175,178`
- **finding:** the frontmatter `decided_by` omits DEC-007; the validation block claims "4/4 components" (3 interfaces) and "6 DEC entries" (7 listed); the signatures drift from the code (`Expense[]` vs `readonly ExpenseDraft[]`; `value: Expense` vs `ExpenseDraft`); and `LoadResult.reason` is read by nobody (both callers hardcode their own message).
- **suggestion:** regenerate the frontmatter/summary from the actual DEC set and interfaces, align the signatures, and either surface `reason` at the call sites or drop it. **task:** TASK-004 · **status:** open

### RVW-030 [LOW] — Error-state accessibility polish
- **perspective:** ux-advocate · **location:** `src/ExpenseForm.tsx:16,22-24,33-39,47,56,72`, `src/pages/AddExpense.tsx:38`, `src/App.css`
- **finding:** the persistent `role="alert"` node is not re-announced on a repeated identical failure; the message has no `id` and no field carries `aria-describedby`; there is no error styling at all (errors render as plain body text); focus stays on the submit button; a stale error is not cleared on edit; Delete buttons share the accessible name "Delete" with no row context; buttons are below the 44 px touch-target minimum.
- **suggestion:** re-announce via an attempt key, wire `aria-describedby`, add an `.error` style, move focus to the first invalid field, clear on edit, add per-row `aria-label`s, and set `min-height: 44px` on buttons. **task:** TASK-004 · **status:** open

### RVW-031 [LOW] — Copy diverges from the approved preview
- **perspective:** ux-advocate · **location:** `src/expense.ts:68`, `src/pages/Home.tsx:54-56`, `src/pages/AddExpense.tsx:8-33`
- **finding:** the date message ("Date must be a valid date (YYYY-MM-DD)") diverges from the approved "Enter a valid date in the form YYYY-MM-DD"; "Total:" is in fact the *current-month* total; the empty state is a bare "No expenses yet" with no next step; and the add page never checks readability at mount, so a user fills the whole form before discovering it cannot be saved.
- **suggestion:** align the copy with `preview.md`, label the total "This month:", add a call to action, and show a mount-time notice when the store is unreadable. **task:** TASK-004 · **status:** open

### RVW-032 [LOW] — Traceability smalls
- **perspective:** requirements-analyst, devil-advocate · **location:** `.gse/backlog.yaml` TASK-011/002, `docs/sprints/sprint-01/reqs.md` (validation summary)
- **finding:** TASK-011 sets `derives_from: [REQ-009]` on the requirement it implements (a self-referential loop that loses the user origin); the delete-write-failure guard and its test trace to no REQ and carry no TST label (scope creep); the validation summary says "8/8 sprint tasks covered" while nine requirements exist and REQ-007 is deferred; TASK-002's `last_commit` holds a timestamp while TASK-003..011 leave it `null` under `branch_status: active`.
- **suggestion:** drop the self-reference, add a REQ-001 criterion (or a DEC) for the delete guard, state "8/9 REQs delivered; REQ-007 deferred", and populate `last_commit`. **task:** TASK-002, TASK-011 · **status:** open

---

## AI Integrity Findings (P16)

Devil's advocate execution: **isolated** (separate fresh-context sub-agent).

- **Verified, not hallucinated:** the coverage table reproduces byte-for-byte; "66 tests / 11 files" is exact; Vitest 4 + `@vitest/coverage-v8` are installed and real; the perf test genuinely passes; TCP-001's "42/42 (41 app + 1 policy)" is arithmetically consistent with the git history. No CRITICAL emitted (no previously-`Verified` claim was found false).
- **`[AI-INTEGRITY]` findings:** RVW-001, RVW-004, RVW-005, RVW-006, RVW-008, RVW-010, RVW-011, RVW-013, RVW-014, RVW-017, RVW-018, RVW-022, RVW-023, RVW-024, RVW-025, RVW-028, RVW-032 (15).
- **Complaisance:** the "1,000-id volume test" was accepted as strengthening TST-007 when it in fact made the assertion unfalsifiable (RVW-008) — the agent's own framing, not the user's. The 60 % floor was "confirmed" while 100 % was measured, leaving an inert gate (RVW-009).
- **Per the P16 contract, at least one finding must be addressed (fixed, dismissed with a DEC-, or escalated) before REVIEW proceeds to DELIVER.**
