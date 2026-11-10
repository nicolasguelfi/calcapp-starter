# Decision Journal

<!-- Append DEC-NNN entries below. Gate/Inform: full format. Auto-tier: logged in decisions-auto.log. -->
<!-- This is the AUTHORITATIVE format — spec §11 and activities reference this template. -->

### DEC-001 — Trunk policy: merge `mywork` into `main`

- **Sprint:** 1
- **Type:** scope-shaping
- **Tier:** Gate
- **Date:** 2026-11-10
- **Decision:** `main` becomes the trunk; the full CalcApp work on `mywork` is merged into `main`.
- **Context:** Adopting an external project revealed `main` (8744f3d) is 24 commits behind `mywork` (4659ae4). The entire application lives on `mywork`; `main` holds only the starter skeleton + CI kit. No GSE merge can proceed until the trunk is defined.
- **Options considered:** (A) merge `mywork` into `main`; (B) promote `mywork` as the trunk and abandon `main`.
- **Excluded alternative:** Creating a brand-new third branch as trunk — excluded because it fragments history and adds a copy with no benefit for a single-developer project.
- **Rationale:** Option A matches the methodology's model (`main` is the trunk and receives merges, P12) and keeps releases on the conventional line.
- **Consequences:** Now — one merge brings the app into `main`; 3 months — standard branch/merge flow works without special-casing; 1 year — `main` is the trustworthy release line. Reversibility: Medium cost.
- **Traces:** derives_from: [OQ-002, REQ-006]; impacts: [TASK-002]

### DEC-002 — Failed-save recovery keeps the form values

- **Sprint:** 1
- **Type:** behavioral
- **Tier:** Inform
- **Date:** 2026-11-10
- **Decision:** When saving an expense fails, the form keeps the typed values and shows an error, so the user can retry without re-entering.
- **Context:** REQ-001 prohibits silent loss; the recovery UX (forget vs. preserve the typed values) was left open by OQ-001.
- **Options considered:** not applicable (Inform tier).
- **Rationale:** Aligns with the user's stated top priority ("never lose my data") — preserving the typed input avoids data loss on a transient storage failure.
- **Consequences:** Now — storage access is wrapped so a failure surfaces a message; 3 months — retry UX can be refined without changing the data contract; 1 year — negligible. Reversibility: Low cost.
- **Traces:** derives_from: [OQ-001, REQ-001]

### DEC-003 — Id generation independent of secure context, uniqueness preserved

- **Sprint:** 1
- **Type:** architectural
- **Tier:** Inform
- **Date:** 2026-11-10
- **Decision:** Introduce a small `newId()` helper using `crypto.randomUUID()` when available, and otherwise a fallback built on `crypto.getRandomValues()` combined with a timestamp and a monotonic counter. Ids must be unique across all ids ever persisted in this origin — **not only within a session**.
- **Context:** REQ-003 — `crypto.randomUUID()` requires a secure context and is undefined over plain-HTTP preview / older browsers (RVW-6); `Home` relies on id uniqueness for list keys (`key={expense.id}`) and deletion (`filter(e => e.id !== id)`). The security design pass (RVW-202, MEDIUM) showed the original "unique within a session" wording under-specified the property, since ids are persisted across sessions.
- **Options considered:** not applicable (Inform tier).
- **Rationale:** A single seam keeps id generation testable in isolation (see LRN-002); cross-session uniqueness is the property the delete-by-id path actually depends on. A collision would silently delete two distinct expenses.
- **Consequences:** Now — one helper + a test stubbing `crypto.randomUUID` as undefined and a test seeding a colliding stored id; 3 months — later features reuse the helper; 1 year — negligible. Reversibility: Low cost.
- **Traces:** derives_from: [REQ-003, RVW-6, RVW-202]; impacts: [TASK-005]

### DEC-004 — Reject non-ISO and calendar-invalid dates at validation

- **Sprint:** 1
- **Type:** behavioral
- **Tier:** Inform
- **Date:** 2026-11-10
- **Decision:** `validateExpense` rejects (with a date-field message) both non-ISO strings and syntactically-ISO-but-calendar-invalid dates (e.g. `2026-02-31`); accepted dates are stored trimmed.
- **Context:** REQ-002 — the loader and the month total (`date.slice(0,7)`) silently drop malformed dates, so validation must be strict.
- **Options considered:** not applicable (Inform tier).
- **Rationale:** Strict rejection at the boundary prevents the silent-exclusion failure the requirement exists to stop; "reject" is chosen over "normalise" to keep behaviour predictable.
- **Consequences:** Now — additional validation tests; 3 months — no invalid dates in storage; 1 year — negligible. Reversibility: Low cost.
- **Traces:** derives_from: [REQ-002]; impacts: [TASK-003]

### DEC-005 — CI scope excludes coverage for this sprint

- **Sprint:** 1
- **Type:** architectural
- **Tier:** Inform
- **Date:** 2026-11-10
- **Decision:** The CI job runs lint, tests and build only; coverage is not part of it this sprint.
- **Context:** The workflow on `main` runs `test:coverage`, but neither the script nor the coverage provider exists on the working copy; REQ-008 (coverage) is `could`.
- **Options considered:** not applicable (Inform tier).
- **Rationale:** Keeps the CI job green and dependency-light now; coverage can be added once REQ-008 lands, without a red build in the meantime.
- **Consequences:** Now — CI is green and meaningful; 3 months — coverage likely folded in after REQ-008; 1 year — negligible. Reversibility: Low cost.
- **Traces:** derives_from: [REQ-007, REQ-008]; impacts: [TASK-009, TASK-010]

### DEC-006 — Populate task↔requirement links and add an intent note

- **Sprint:** 1
- **Type:** cosmetic
- **Tier:** Inform
- **Date:** 2026-11-10
- **Decision:** Populate `TASK.implements` links, and record `docs/plan.md` as the adopted project's intent source (a one-line intent note).
- **Context:** OQ-003 — the adopted project has no `docs/intent.md`, so intent and coverage are only readable prose.
- **Options considered:** not applicable (Inform tier).
- **Rationale:** Makes coverage machine-checkable and gives future scope questions a citable intent source (RVW-113, RVW-116).
- **Consequences:** Now — small metadata edits; 3 months — `/gse:audit` can verify coverage; 1 year — negligible. Reversibility: Low cost.
- **Traces:** derives_from: [OQ-003]

### DEC-007 — Unreadable storage is never overwritten (load failure ≠ empty)

- **Sprint:** 1
- **Type:** architectural
- **Tier:** Gate
- **Date:** 2026-11-10
- **Decision:** `loadExpenses()` distinguishes "no data" from "cannot read data" (returning `{ ok: false, reason }` on a read failure); the Add-flow refuses to save when the preceding read failed; the Dashboard shows a load-error notice distinct from the empty state.
- **Context:** The security design pass (RVW-201, HIGH) showed that a fail-open loader plus the existing read-modify-write (`saveExpenses([...loadExpenses(), expense])`) destroys the entire stored list after any transient read failure — the exact "lose my data" outcome the user's top priority forbids.
- **Options considered:** (A) distinguish empty from failure and refuse to overwrite; (B) keep fail-open and add a manual backup key; (C) leave as-is.
- **Excluded alternative:** (C) leave as-is — excluded because it silently defeats REQ-001 and the user's stated priority.
- **Rationale:** Option A fixes the destructive interaction at its source (the read/write contract) with the least added surface; a backup key can be added later if needed.
- **Consequences:** Now — the `loadExpenses` contract changes to a result type and the Add-flow gains a guard; 3 months — no silent data loss on storage hiccups; 1 year — negligible. Reversibility: Low cost.
- **Traces:** derives_from: [REQ-001, REQ-004, RVW-201]; impacts: [TASK-004]
