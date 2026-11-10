// TST-016 — The style checker passes with a scoped exception (REQ-005)
//
// Policy test (static, no runtime): `npm run lint` must exit 0. The installed
// GSE-One plugin directory (`.opencode/`) is third-party tooling, not project
// code, so the style checker must ignore it while keeping the project's own
// rules unchanged.
import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'

describe('TST-016 — the style checker passes with a scoped exception', () => {
  it('runs eslint over the project and exits 0', () => {
    const runLint = () =>
      execFileSync('npx', ['eslint', '.'], { encoding: 'utf8', stdio: 'pipe' })

    expect(runLint).not.toThrow()
  })
})
