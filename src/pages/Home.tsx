import { useState } from 'react'
import { formatAmount, monthTotal } from '../money'
import { loadExpenses, saveExpenses } from '../storage'
import type { Expense } from '../storage'

// "This month" is the current calendar month in local time, matching the dates
// read from the date input.
function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function Home() {
  const [load] = useState(() => loadExpenses())
  const [expenses, setExpenses] = useState<Expense[]>(() => (load.ok ? load.items : []))
  const [error, setError] = useState<string | null>(null)

  // A failed read is NOT an empty list: say so rather than show "No expenses yet",
  // which would invite the user to believe their data is gone (DEC-007).
  if (!load.ok) {
    return (
      <main className="app">
        <h1>CalcApp</h1>
        <p role="alert">Could not load your saved expenses. Reload the page to try again.</p>
      </main>
    )
  }

  const total = monthTotal(expenses, currentMonth())
  const newestFirst = [...expenses].sort((a, b) => b.date.localeCompare(a.date))

  function handleDelete(id: string | undefined) {
    // A stored row without an id cannot be told apart from another one, so there
    // is nothing safe to delete.
    if (id === undefined) return
    if (!window.confirm('Delete this expense?')) return

    const remaining = expenses.filter((expense) => expense.id !== id)
    const result = saveExpenses(remaining)
    if (!result.ok) {
      // Keep the list as it is: the screen must not diverge from storage.
      setError(result.message)
      return
    }

    setError(null)
    setExpenses(remaining)
  }

  return (
    <main className="app">
      <h1>CalcApp</h1>
      {error !== null && <p role="alert">{error}</p>}
      <p>Total: {formatAmount(total)}</p>
      {expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <ul>
          {newestFirst.map((expense) => (
            <li key={expense.id}>
              {formatAmount(expense.amount)} — {expense.category} — {expense.date}{' '}
              <button type="button" onClick={() => handleDelete(expense.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
