import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import App, { routes } from '../src/App'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('App', () => {
  it('shows the CalcApp title on the home page', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'CalcApp' })).toBeInTheDocument()
  })

  it('shows the Add Expense heading at /add', () => {
    renderAt('/add')
    expect(screen.getByRole('heading', { name: 'Add Expense' })).toBeInTheDocument()
  })

  it.each(['/', '/add'])('offers the Dashboard and Add Expense links on %s', (path) => {
    renderAt(path)
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Add Expense' })).toHaveAttribute('href', '/add')
  })
})
