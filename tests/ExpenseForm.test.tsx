import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ExpenseForm from '../src/ExpenseForm'

describe('ExpenseForm', () => {
  it('exposes a labelled amount, category and date field', () => {
    render(<ExpenseForm onAdd={vi.fn()} />)

    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
  })

  it('calls onAdd once with exactly the entered values on submit', () => {
    const onAdd = vi.fn()
    render(<ExpenseForm onAdd={onAdd} />)

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '42.5' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } })
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith({ amount: 42.5, category: 'Food', date: '2026-11-10' })
  })
})
