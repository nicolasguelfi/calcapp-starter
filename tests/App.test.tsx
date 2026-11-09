import { render, screen } from '@testing-library/react'
import App from '../src/App'

describe('App', () => {
  it('shows the CalcApp title on the home page', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'CalcApp' })).toBeInTheDocument()
  })
})
