import { StrictMode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../src/App'
import { loadExpenses, STORAGE_KEY } from '../src/storage'

// Render the real routes at /add inside StrictMode: the double render in
// development must not save the expense twice.
function renderAddPage() {
  const router = createMemoryRouter(routes, { initialEntries: ['/add'] })
  render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

function submitValidExpense() {
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '42.5' } })
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } })
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-10' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add' }))
}

describe('add expense flow', () => {
  it('stores the submitted expense once and returns to the dashboard', () => {
    renderAddPage()

    submitValidExpense()

    expect(screen.getByRole('heading', { name: 'CalcApp' })).toBeInTheDocument()

    expect(loadExpenses()).toEqual({
      ok: true,
      items: [{ id: expect.any(String), amount: 42.5, category: 'Food', date: '2026-11-10' }],
    })
  })

  // TST-010 — a failed save keeps the typed values, shows a message, stays put,
  // and does not lose the expenses already stored (REQ-001, DEC-002)
  it('keeps the values and the existing list when the save fails', () => {
    const existing = { id: 'food', amount: 7.5, category: 'Transport', date: '2026-10-05' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    renderAddPage()

    submitValidExpense()

    // Still on the add page, with a message and the typed values intact.
    expect(screen.getByRole('heading', { name: 'Add Expense' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toHaveValue(42.5)
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-10')

    // The stored list was not clobbered.
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual([existing])
  })

  // TST-012 — refuse to write when the existing list could not be read (REQ-001, DEC-007)
  it('refuses to save when the existing list cannot be read', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    renderAddPage()

    submitValidExpense()

    expect(setItem).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add Expense' })).toBeInTheDocument()
  })
})
