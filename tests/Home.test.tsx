import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../src/App'
import type { ExpenseDraft } from '../src/expense'
import { loadExpenses, saveExpenses } from '../src/storage'

// Stored expenses carry the id added by the add flow; the list needs it as a key.
type StoredExpense = ExpenseDraft & { id: string }

function renderDashboard() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] })
  return render(<RouterProvider router={router} />)
}

describe('dashboard', () => {
  beforeEach(() => {
    // Freeze the clock so "this month" is always November 2026.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-10T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lists every expense newest first and totals the current month', () => {
    const stored: StoredExpense[] = [
      { id: 'transport', amount: 7.5, category: 'Transport', date: '2026-10-05' },
      { id: 'food', amount: 42.5, category: 'Food', date: '2026-11-10' },
    ]
    saveExpenses(stored)

    renderDashboard()

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('42.50 €')
    expect(items[0]).toHaveTextContent('Food')
    expect(items[0]).toHaveTextContent('2026-11-10')
    expect(items[1]).toHaveTextContent('7.50 €')
    expect(items[1]).toHaveTextContent('Transport')
    expect(items[1]).toHaveTextContent('2026-10-05')

    expect(screen.getByText('Total: 42.50 €')).toBeInTheDocument()
  })

  it('says there is nothing to show and totals 0.00 € when there are no expenses', () => {
    renderDashboard()

    expect(screen.getByText('No expenses yet')).toBeInTheDocument()
    expect(screen.getByText('Total: 0.00 €')).toBeInTheDocument()
  })

  it('deletes only the confirmed expense from the list, the total and storage', () => {
    const stored: StoredExpense[] = [
      { id: 'transport', amount: 7.5, category: 'Transport', date: '2026-10-05' },
      { id: 'food', amount: 42.5, category: 'Food', date: '2026-11-10' },
    ]
    saveExpenses(stored)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderDashboard()

    fireEvent.click(within(screen.getByText(/Food/)).getByRole('button', { name: 'Delete' }))

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('Transport')
    expect(screen.queryByText(/Food/)).not.toBeInTheDocument()
    expect(screen.getByText('Total: 0.00 €')).toBeInTheDocument()
    expect(loadExpenses()).toEqual([stored[0]])
  })

  it('keeps the list, the total and storage when the deletion is not confirmed', () => {
    const stored: StoredExpense[] = [
      { id: 'transport', amount: 7.5, category: 'Transport', date: '2026-10-05' },
      { id: 'food', amount: 42.5, category: 'Food', date: '2026-11-10' },
    ]
    saveExpenses(stored)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderDashboard()

    fireEvent.click(within(screen.getByText(/Food/)).getByRole('button', { name: 'Delete' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Total: 42.50 €')).toBeInTheDocument()
    expect(loadExpenses()).toEqual(stored)
  })
})
