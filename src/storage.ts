import type { ExpenseDraft } from './expense'

export const STORAGE_KEY = 'calcapp.expenses'

// What actually lives in storage: a draft plus the id the add flow gives it.
export type Expense = ExpenseDraft & { id: string }

export function saveExpenses(expenses: readonly ExpenseDraft[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function loadExpenses(): Expense[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []

  try {
    return JSON.parse(raw) as Expense[]
  } catch {
    return []
  }
}