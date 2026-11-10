---
gse:
  id: TCP-001
  type: test-campaign
  sprint: 1
  branch: gse/sprint-01/chore/lint-ignore-plugin
  traces:
    implements: [REQ-005]
    derives_from: [TASK-001]
  created: "2026-11-10"
---

# Test Campaign TCP-001 — Sprint 1 / TASK-001

## Summary
- Executed: 42 tests across 8 files (unit + component/integration + 1 policy)
- Passed: 42 (100%)
- Failed: 0
- Duration: ~3.2 seconds
- Code coverage: not measured this run — baseline deferred to TASK-010

## Failures

_(none)_

## Evidence

- No screenshots — the suite runs under Vitest + jsdom (no browser). Visual
  regression is not available this cycle (acknowledged in `tests.md` TST-014).

## Coverage

| Module | Coverage | Delta from previous |
|--------|----------|---------------------|
| (not measured) | — | — |

## Requirements Coverage

| REQ ID | Test Cases | Status |
|--------|------------|--------|
| REQ-005 | TST-016 (policy: style checker passes with a scoped exception) | pass |

## Risk Coverage

| Risk Area | Test Depth | Confidence |
|-----------|------------|------------|
| Lint tooling / config change | policy test (TST-016) + full-suite regression | high |

## Notes

- **TDD trace:** `tests/policy/lint.test.ts` (TST-016) was written first and failed
  (`eslint .` exited non-zero — 7 errors from `.opencode/plugins/gse-guardrails.ts`),
  then `eslint.config.js` was amended to `globalIgnores(['dist', '.opencode'])`, after
  which the test and the whole suite pass.
- The project rule "lint must pass before commit" now holds again — the 7 blocking
  errors are gone and no project-code rule was relaxed.
