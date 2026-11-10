// @vitest-environment node
//
// TST-017 — The coverage floor is enforced (REQ-008)
//
// Policy test (static, no runtime): the test runner must be configured with a
// line-coverage floor, so `npm run test:coverage` exits non-zero when a change
// drops coverage below the minimum in .gse/config.yaml. Asserting the configured
// floor keeps this fast — actually running coverage here would be recursive.
//
// Runs in the Node environment: importing vite.config.ts pulls in esbuild, which
// cannot load under jsdom's globals.
import { describe, it, expect } from 'vitest'
import config from '../../vite.config'

describe('TST-017 — the coverage floor is enforced', () => {
  it('configures a line-coverage threshold', () => {
    const thresholds = config.test?.coverage?.thresholds

    expect(thresholds?.lines).toBeGreaterThan(0)
  })
})
