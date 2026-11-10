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

export function validateExpense(input: ExpenseInput): ValidationResult {
  const amount = typeof input.amount === 'string' ? Number(input.amount) : input.amount

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, field: 'amount', message: 'Amount must be a positive number' }
  }

  if (!isCategory(input.category)) {
    return { ok: false, field: 'category', message: 'Category is required' }
  }

  if (input.date.trim() === '') {
    return { ok: false, field: 'date', message: 'Date is required' }
  }

  return { ok: true, value: { amount, category: input.category, date: input.date } }
}
