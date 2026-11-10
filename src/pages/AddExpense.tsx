import { useState } from 'react'
import { useNavigate } from 'react-router'
import ExpenseForm from '../ExpenseForm'
import { loadExpenses, saveExpenses } from '../storage'
import { newId } from '../id'
import type { ExpenseDraft } from '../expense'

export default function AddExpense() {
  const navigate = useNavigate()
  const [saveError, setSaveError] = useState<string | null>(null)

  // The id is created here, in the submit handler, not during render: StrictMode
  // renders twice in development, and only the handler runs once per submit.
  function handleAdd(draft: ExpenseDraft) {
    // Never write over a list we could not read: a failed read is not an empty
    // list, and saving on top of it would destroy the stored expenses (DEC-007).
    const existing = loadExpenses()
    if (!existing.ok) {
      setSaveError(
        'Could not read your saved expenses, so nothing was saved. Reload the page and try again.',
      )
      return
    }

    const expense = { ...draft, id: newId() }
    const result = saveExpenses([...existing.items, expense])
    if (!result.ok) {
      setSaveError(result.message)
      return
    }

    navigate('/')
  }

  return (
    <main className="app">
      <h1>Add Expense</h1>
      {saveError !== null && <p role="alert">{saveError}</p>}
      <ExpenseForm onAdd={handleAdd} />
    </main>
  )
}
