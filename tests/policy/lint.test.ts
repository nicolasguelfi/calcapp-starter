// TST-016 — The style checker passes with a scoped exception (REQ-005)
//
// Policy test (static, no runtime): `npm run lint` must exit 0. The installed
// GSE-One plugin directory (`.opencode/`) is third-party tooling, not project
// code, so the style checker must ignore it while keeping the project's own
// rules unchanged.
//
// The linter is spawned from the local install (not `npx`) so the check is
// deterministic, and given a generous timeout: it shells out and can be slow on
// a synced/network volume. On failure the linter's own output is surfaced.
import { describe, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const eslintBin = join(process.cwd(), 'node_modules', '.bin', 'eslint')

describe('TST-016 — the style checker passes with a scoped exception', () => {
  it(
    'runs eslint over the project and exits 0',
    () => {
      try {
        execFileSync(eslintBin, ['.'], { encoding: 'utf8', stdio: 'pipe' })
      } catch (error) {
        const failure = error as { stdout?: string; stderr?: string }
        const output = `${failure.stdout ?? ''}${failure.stderr ?? ''}`.trim()
        throw new Error(`eslint exited non-zero:\n${output || String(error)}`)
      }
    },
    20_000,
  )
})
