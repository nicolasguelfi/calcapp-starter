import { isCategory } from './expense'
import type { ExpenseDraft } from './expense'

export const STORAGE_KEY = 'calcapp.expenses'

// What lives in storage: a draft plus the id the add flow gives it. The id is
// optional because saveExpenses also accepts bare drafts (plan T3), and the read
// guard mirrors the write contract rather than inventing a stricter one.
export type Expense = ExpenseDraft & { id?: string }

// Mirrors the rules validateExpense applies on the way in. The dashboard spreads,
// sorts and formats whatever comes back, so a row it cannot handle is dropped
// instead of being passed on to crash the render.
function isStoredExpense(value: unknown): value is Expense {
  if (typeof value !== 'object' || value === null) return false

  const expense = value as Record<string, unknown>

  return (
    (expense.id === undefined || (typeof expense.id === 'string' && expense.id !== '')) &&
    typeof expense.amount === 'number' &&
    Number.isFinite(expense.amount) &&
    expense.amount > 0 &&
    isCategory(expense.category) &&
    typeof expense.date === 'string' &&
    expense.date.trim() !== ''
  )
}

export function saveExpenses(expenses: readonly ExpenseDraft[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function loadExpenses(): Expense[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) return []

  return parsed.filter(isStoredExpense)
}