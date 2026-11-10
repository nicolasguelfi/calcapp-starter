import { isCategory } from './expense'
import type { ExpenseDraft } from './expense'

export const STORAGE_KEY = 'calcapp.expenses'

// What lives in storage: a draft plus the id the add flow gives it. The id is
// optional because saveExpenses also accepts bare drafts (plan T3), and the read
// guard mirrors the write contract rather than inventing a stricter one.
export type Expense = ExpenseDraft & { id?: string }

// A READ can fail (storage disabled, a security error). That is different from
// "nothing stored yet": a failure must never look like an empty list, or the next
// save would overwrite data we simply could not read (DEC-007).
export type LoadResult = { ok: true; items: Expense[] } | { ok: false; reason: string }

// A WRITE can fail (quota exceeded, storage disabled). Returning it lets the
// caller keep the user's input instead of throwing past it and losing the
// expense (REQ-001, DEC-002).
export type SaveResult = { ok: true } | { ok: false; message: string }

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

export function saveExpenses(expenses: readonly ExpenseDraft[]): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'Could not save your expense — the browser storage is unavailable.',
    }
  }
}

export function loadExpenses(): LoadResult {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { ok: false, reason: 'Browser storage could not be read' }
  }

  if (raw === null) return { ok: true, items: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Damaged DATA (a parse error) is not a failed READ: an empty list is right.
    return { ok: true, items: [] }
  }

  if (!Array.isArray(parsed)) return { ok: true, items: [] }

  return { ok: true, items: parsed.filter(isStoredExpense) }
}
