import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  // Not every test file runs under jsdom (e.g. tests/policy/coverage.test.ts).
  if (typeof localStorage !== 'undefined') localStorage.clear()
  vi.restoreAllMocks()
})
