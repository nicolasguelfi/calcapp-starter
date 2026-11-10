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
})