---
gse:
  id: TCP-002
  type: test-campaign
  sprint: 1
  branch: gse/sprint-01/test/coverage-baseline
  traces:
    implements: [REQ-008]
    derives_from: [TASK-010]
  created: "2026-11-10"
---

# Coverage Baseline — Sprint 1 (TASK-010)

Command: `npm run test:coverage` (Vitest 4, v8 provider), run on the sprint
integration branch. 66 tests, 11 files, all passing.

## Baseline

| Scope | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| All files | 99.13 | 97.14 | 100 | 100 |
| `src` | 100 | 98 | 100 | 100 |
| `src/pages` | 97.5 | 95 | 100 | 100 |

Files with anything uncovered:

- `src/pages/Home.tsx` — 96.29 % stmts / 92.85 % branch — line 35, the
  `if (id === undefined) return` guard in `handleDelete` (no test deletes a
  stored row that carries no id).
- `src/id.ts` — 87.5 % branch — line 20, the `crypto.getRandomValues` availability
  guard (the no-`getRandomValues` path is not exercised).

## Floor

`.gse/config.yaml → testing.coverage.minimum` = **60 %**, now enforced by
`vite.config.ts → test.coverage.thresholds.lines` — a run below it exits non-zero
(TST-017).

**Decision: the 60 % floor is confirmed, not adjusted.** The measured baseline
(100 % lines) sits far above it; 60 % is a floor with headroom for new code, not a
target. It can be raised once the app grows.

## Notes

- `src/main.tsx` (bootstrap glue — mounts `<App/>`) is excluded from measurement.
- `coverage/` output is generated and git-ignored; this file records the figure.
