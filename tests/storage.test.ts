import type { ExpenseDraft } from '../src/expense'
import { loadExpenses, saveExpenses, STORAGE_KEY } from '../src/storage'

const expenses: ExpenseDraft[] = [
  { amount: 42.5, category: 'Food', date: '2026-11-10' },
  { amount: 7.5, category: 'Transport', date: '2026-10-31' },
]

describe('saveExpenses and loadExpenses', () => {
  it('loads exactly what was saved', () => {
    saveExpenses(expenses)

    expect(loadExpenses()).toEqual(expenses)
  })

  it('loads an empty list after saving an empty list', () => {
    saveExpenses(expenses)
    saveExpenses([])

    expect(loadExpenses()).toEqual([])
  })

  it('returns an empty list when nothing was ever saved', () => {
    expect(loadExpenses()).toEqual([])
  })

  it('returns an empty list when the stored JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{"amount": 42.5, "category":')

    expect(loadExpenses()).toEqual([])
  })

  // Valid JSON is not necessarily a list of expenses: the dashboard spreads and
  // sorts what it gets, so a wrong shape must not leave this function.
  it.each(['{}', '"hello"', 'null', '42', '{"expenses": []}'])(
    'returns an empty list when the stored JSON is not a list (%s)',
    (raw) => {
      localStorage.setItem(STORAGE_KEY, raw)

      expect(loadExpenses()).toEqual([])
    },
  )

  it('drops stored entries it cannot render and keeps valid drafts', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'food', amount: 42.5, category: 'Food', date: '2026-11-10' },
        { id: 'no-amount', category: 'Food', date: '2026-11-10' },
        { id: 'string-amount', amount: '42.5', category: 'Food', date: '2026-11-10' },
        { id: 'zero-amount', amount: 0, category: 'Food', date: '2026-11-10' },
        { id: 'unknown-category', amount: 1, category: 'Rent', date: '2026-11-01' },
        { id: 'blank-date', amount: 1, category: 'Food', date: ' ' },
        null,
      ]),
    )

    expect(loadExpenses()).toEqual([
      { id: 'food', amount: 42.5, category: 'Food', date: '2026-11-10' },
    ])
  })

  // saveExpenses accepts a bare draft (plan T3), so the read side accepts one too:
  // the guard mirrors the write contract, it does not tighten it.
  it('keeps a valid draft that carries no id', () => {
    saveExpenses([{ amount: 7.5, category: 'Transport', date: '2026-10-31' }])

    expect(loadExpenses()).toEqual([{ amount: 7.5, category: 'Transport', date: '2026-10-31' }])
  })
})