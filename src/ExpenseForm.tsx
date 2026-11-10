import { useState } from 'react'
import type { FormEvent } from 'react'
import { CATEGORIES, validateExpense } from './expense'
import type { Category, ExpenseDraft } from './expense'

type Props = {
  onAdd: (expense: ExpenseDraft) => void
}

export default function ExpenseForm({ onAdd }: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [date, setDate] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = validateExpense({ amount, category, date })
    if (result.ok) onAdd(result.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Amount
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>

      <label>
        Category
        <select value={category} onChange={(event) => setCategory(event.target.value as Category)}>
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
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      <button type="submit">Add</button>
    </form>
  )
}
