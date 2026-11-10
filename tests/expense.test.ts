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

  it('rejects an empty date', () => {
    const result = validateExpense({ amount: 42.5, category: 'Food', date: '' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/date/i)
  })

  it('reports the first offending field, amount before category', () => {
    const result = validateExpense({ amount: 0, category: '', date: '' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/amount/i)
  })
})
