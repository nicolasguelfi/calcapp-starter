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

export type ValidationResult =
  | { ok: true; value: ExpenseDraft }
  | { ok: false; message: string }

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}

export function validateExpense(input: ExpenseInput): ValidationResult {
  const amount = typeof input.amount === 'string' ? Number(input.amount) : input.amount

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: 'Amount must be a positive number' }
  }

  if (!isCategory(input.category)) {
    return { ok: false, message: 'Category is required' }
  }

  if (input.date.trim() === '') {
    return { ok: false, message: 'Date is required' }
  }

  return { ok: true, value: { amount, category: input.category, date: input.date } }
}
