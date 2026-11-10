import { newId } from '../src/id'

describe('newId', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // TST-006 — id generation works without a secure context (REQ-003, DEC-003)
  it('returns a non-empty id when crypto.randomUUID is unavailable', () => {
    // A non-secure context (plain-HTTP preview, older Safari) has no randomUUID.
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })

    const id = newId()

    expect(typeof id).toBe('string')
    expect(id).not.toBe('')
  })

  // TST-007 — ids do not collide across a realistic dataset (REQ-003, DEC-003)
  it('produces 1,000 distinct ids, none equal to a stored one', () => {
    const stored = 'existing-stored-id'
    const ids = new Set<string>()

    for (let i = 0; i < 1000; i += 1) ids.add(newId())

    expect(ids.size).toBe(1000)
    expect(ids.has(stored)).toBe(false)
  })

  it('stays collision-free in the fallback path too', () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })
    const ids = new Set<string>()

    for (let i = 0; i < 1000; i += 1) ids.add(newId())

    expect(ids.size).toBe(1000)
  })
})
