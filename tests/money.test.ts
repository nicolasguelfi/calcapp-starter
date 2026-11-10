import type { ExpenseDraft } from '../src/expense'
import { formatAmount, monthTotal } from '../src/money'

describe('formatAmount', () => {
  it('formats an amount with two decimals and a euro sign', () => {
    expect(formatAmount(42.5)).toBe('42.50 €')
  })

  it('pads a whole number to two decimals', () => {
    expect(formatAmount(7)).toBe('7.00 €')
  })

  it('formats zero without a minus sign or extra decimals', () => {
    expect(formatAmount(0)).toBe('0.00 €')
  })

  it('uses a plain space, not a non-breaking one', () => {
    expect(formatAmount(42.5)).not.toMatch(/\u00a0|\u202f/)
  })
})

describe('monthTotal', () => {
  const expenses: ExpenseDraft[] = [
    { amount: 42.5, category: 'Food', date: '2026-11-10' },
    { amount: 7.5, category: 'Transport', date: '2026-10-31' },
    { amount: 12, category: 'Leisure', date: '2026-11-02' },
  ]

  it('sums only the expenses of the given month', () => {
    expect(monthTotal(expenses, '2026-11')).toBe(54.5)
  })

  it('returns zero when no expense matches the month', () => {
    expect(monthTotal(expenses, '2026-12')).toBe(0)
  })

  it('returns zero for an empty list', () => {
    expect(monthTotal([], '2026-11')).toBe(0)
  })
})
