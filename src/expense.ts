export const CATEGORIES = ['Food', 'Transport', 'Housing', 'Leisure', 'Other'] as const

export type Category = (typeof CATEGORIES)[number]

export type ExpenseDraft = {
  amount: number
  category: Category
  date: string
}

export type ExpenseInput = {
  amount: number | string
  category: string
  date: string
}

export type ExpenseField = 'amount' | 'category' | 'date'

export type ValidationResult =
  | { ok: true; value: ExpenseDraft }
  | { ok: false; field: ExpenseField; message: string }

// Shared with src/storage.ts, so reading back what we stored applies the same
// category rule as accepting it in the form.
export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// A date must be a real calendar date in ISO form (YYYY-MM-DD). The dashboard
// groups by `date.slice(0, 7)`, so a malformed date would be silently dropped
// from the month total instead of surfacing an error (RVW-4). Rejecting it here
// keeps the stored data trustworthy.
export function isIsoDate(value: string): value is string {
  if (!ISO_DATE.test(value)) return false

  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))
  const day = Number(value.slice(8, 10))
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function validateExpense(input: ExpenseInput): ValidationResult {
  const amount = typeof input.amount === 'string' ? Number(input.amount) : input.amount

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, field: 'amount', message: 'Amount must be a positive number' }
  }

  if (!isCategory(input.category)) {
    return { ok: false, field: 'category', message: 'Category is required' }
  }

  const date = input.date.trim()

  if (date === '') {
    return { ok: false, field: 'date', message: 'Date is required' }
  }

  if (!isIsoDate(date)) {
    return { ok: false, field: 'date', message: 'Date must be a valid date (YYYY-MM-DD)' }
  }

  return { ok: true, value: { amount, category: input.category, date } }
}
