import { StrictMode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../src/App'
import { loadExpenses } from '../src/storage'

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

describe('add expense flow', () => {
  it('stores the submitted expense once and returns to the dashboard', () => {
    renderAddPage()

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '42.5' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } })
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('heading', { name: 'CalcApp' })).toBeInTheDocument()

    const stored = loadExpenses()
    expect(stored).toHaveLength(1)
    expect(stored[0]).toEqual({
      id: expect.any(String),
      amount: 42.5,
      category: 'Food',
      date: '2026-11-10',
    })
  })
})
