import { CATEGORIES, validateExpense } from '../src/expense'

describe('CATEGORIES', () => {
  it('is the fixed list from the plan', () => {
    expect(CATEGORIES).toEqual(['Food', 'Transport', 'Housing', 'Leisure', 'Other'])
  })
})

describe('validateExpense', () => {
  it('accepts a valid expense', () => {
    const result = validateExpense({ amount: 42.5, category: 'Food', date: '2026-11-10' })

    expect(result).toEqual({
      ok: true,
      value: { amount: 42.5, category: 'Food', date: '2026-11-10' },
    })
  })

  it('normalises an amount given as a string', () => {
    const result = validateExpense({ amount: '42.5', category: 'Food', date: '2026-11-10' })

    expect(result).toEqual({
      ok: true,
      value: { amount: 42.5, category: 'Food', date: '2026-11-10' },
    })
  })

  it.each([0, -1, 'abc'])('rejects the amount %j', (amount) => {
    const result = validateExpense({ amount, category: 'Food', date: '2026-11-10' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/amount/i)
  })

  it('rejects an empty category', () => {
    const result = validateExpense({ amount: 42.5, category: '', date: '2026-11-10' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/category/i)
  })

  it('rejects a category outside the fixed list', () => {
    const result = validateExpense({ amount: 42.5, category: 'Rent', date: '2026-11-10' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/category/i)
  })

  // TST-019 — an empty date is rejected
  it('rejects an empty date', () => {
    const result = validateExpense({ amount: 42.5, category: 'Food', date: '' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.field).toBe('date')
      expect(result.message).toMatch(/date/i)
    }
  })

  // TST-003 — a date with surrounding whitespace is stored trimmed (RVW-3)
  it('trims surrounding whitespace from the date', () => {
    const result = validateExpense({ amount: 42.5, category: 'Food', date: ' 2026-11-10 ' })

    expect(result).toEqual({
      ok: true,
      value: { amount: 42.5, category: 'Food', date: '2026-11-10' },
    })
  })

  // TST-004 — a non-ISO date is rejected (RVW-4)
  it.each(['10/11/2026', '2026/11/10', '10-11-2026', '2026-11'])(
    'rejects the non-ISO date %j',
    (date) => {
      const result = validateExpense({ amount: 42.5, category: 'Food', date })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.field).toBe('date')
        expect(result.message).toMatch(/date/i)
      }
    },
  )

  // TST-005 — a syntactically ISO but calendar-invalid date is rejected (RVW-4, DEC-004)
  it.each(['2026-02-31', '2026-13-01', '2026-00-10', '2026-11-32'])(
    'rejects the impossible date %j',
    (date) => {
      const result = validateExpense({ amount: 42.5, category: 'Food', date })

      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.field).toBe('date')
    },
  )

  it('reports the first offending field, amount before category', () => {
    const result = validateExpense({ amount: 0, category: '', date: '' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/amount/i)
  })
})
