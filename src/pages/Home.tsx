import { formatAmount, monthTotal } from '../money'
import { loadExpenses } from '../storage'

// "This month" is the current calendar month in local time, matching the dates
// read from the date input.
function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function Home() {
  const expenses = loadExpenses()
  const total = monthTotal(expenses, currentMonth())
  const newestFirst = [...expenses].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <main className="app">
      <h1>CalcApp</h1>
      <p>Total: {formatAmount(total)}</p>
      {expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <ul>
          {newestFirst.map((expense) => (
            <li key={expense.id}>
              {formatAmount(expense.amount)} — {expense.category} — {expense.date}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
