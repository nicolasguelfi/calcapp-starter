import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../src/App'
import { saveExpenses } from '../src/storage'
import type { Expense } from '../src/storage'

// "This month" in local time, matching the dashboard's own calculation.
function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function seed(count: number, month: string): Expense[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    amount: 10,
    category: 'Food' as const,
    date: `${month}-${String((i % 28) + 1).padStart(2, '0')}`,
  }))
}

describe('dashboard performance', () => {
  // TST-018 — 1,000 stored expenses render the list and the month total under 200 ms (REQ-009)
  it('renders 1,000 expenses and the current-month total in under 200 ms', () => {
    saveExpenses(seed(1000, currentMonth()))

    const start = performance.now()
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)
    const elapsed = performance.now() - start

    // Every seeded row is in the current month, so the total is 1,000 × 10.00 €.
    expect(screen.getAllByRole('listitem')).toHaveLength(1000)
    expect(screen.getByText('Total: 10000.00 €')).toBeInTheDocument()
    expect(elapsed, `render of 1,000 expenses took ${Math.round(elapsed)} ms`).toBeLessThan(200)
  })
})
