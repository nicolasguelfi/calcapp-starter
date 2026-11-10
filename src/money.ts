import type { ExpenseDraft } from './expense'

export function formatAmount(amount: number): string {
  return `${amount.toFixed(2)} €`
}

export function monthTotal(expenses: readonly ExpenseDraft[], month: string): number {
  return expenses
    .filter((expense) => expense.date.slice(0, 7) === month)
    .reduce((total, expense) => total + expense.amount, 0)
}
