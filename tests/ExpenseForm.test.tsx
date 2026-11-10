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

  // Submitting an invalid form must say what is wrong: doing nothing at all is
  // the worst possible answer to a click on Add.
  it('reports the first offending field instead of submitting', () => {
    const onAdd = vi.fn()
    render(<ExpenseForm onAdd={onAdd} />)

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Amount must be a positive number')
    expect(screen.getByLabelText('Amount')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Date')).not.toHaveAttribute('aria-invalid')
  })

  it('marks the offending field, then clears the message and submits once it is fixed', () => {
    const onAdd = vi.fn()
    render(<ExpenseForm onAdd={onAdd} />)

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '42.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Date is required')
    expect(screen.getByLabelText('Date')).toHaveAttribute('aria-invalid', 'true')

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith({ amount: 42.5, category: 'Food', date: '2026-11-10' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
