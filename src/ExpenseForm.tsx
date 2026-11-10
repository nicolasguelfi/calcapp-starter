import { useState } from 'react'
import type { FormEvent } from 'react'
import { CATEGORIES, validateExpense } from './expense'
import type { Category, ExpenseDraft, ExpenseField, ValidationResult } from './expense'

type Props = {
  onAdd: (expense: ExpenseDraft) => void
}

type Invalid = Extract<ValidationResult, { ok: false }>

export default function ExpenseForm({ onAdd }: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [date, setDate] = useState('')
  const [error, setError] = useState<Invalid | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = validateExpense({ amount, category, date })
    if (!result.ok) {
      setError(result)
      return
    }

    setError(null)
    onAdd(result.value)
  }

  // Absent rather than false on the fields that are fine, so the marker only
  // appears where it means something.
  function ariaInvalid(field: ExpenseField) {
    return error?.field === field ? ('true' as const) : undefined
  }

  return (
    <form onSubmit={handleSubmit}>
      {error !== null && <p role="alert">{error.message}</p>}

      <label>
        Amount
        <input
          type="number"
          step="0.01"
          value={amount}
          aria-invalid={ariaInvalid('amount')}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>

      <label>
        Category
        <select
          value={category}
          aria-invalid={ariaInvalid('category')}
          onChange={(event) => setCategory(event.target.value as Category)}
        >
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input
          type="date"
          value={date}
          aria-invalid={ariaInvalid('date')}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      <button type="submit">Add</button>
    </form>
  )
}
