import { useNavigate } from 'react-router'
import ExpenseForm from '../ExpenseForm'
import { loadExpenses, saveExpenses } from '../storage'
import type { ExpenseDraft } from '../expense'

export default function AddExpense() {
  const navigate = useNavigate()

  // The id is created here, in the submit handler, not during render: StrictMode
  // renders twice in development, and only the handler runs once per submit.
  function handleAdd(draft: ExpenseDraft) {
    const expense = { ...draft, id: crypto.randomUUID() }
    saveExpenses([...loadExpenses(), expense])
    navigate('/')
  }

  return (
    <main className="app">
      <h1>Add Expense</h1>
      <ExpenseForm onAdd={handleAdd} />
    </main>
  )
}
