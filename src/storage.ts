import type { ExpenseDraft } from './expense'

export const STORAGE_KEY = 'calcapp.expenses'

export function saveExpenses(expenses: readonly ExpenseDraft[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function loadExpenses(): ExpenseDraft[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []

  try {
    return JSON.parse(raw) as ExpenseDraft[]
  } catch {
    return []
  }
}