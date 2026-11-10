import { createBrowserRouter, Link, Outlet, RouterProvider } from 'react-router'
import Home from './pages/Home'
import AddExpense from './pages/AddExpense'

function Layout() {
  return (
    <>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/add">Add Expense</Link>
      </nav>
      <Outlet />
    </>
  )
}

// Exported so tests can mount the same routes in a createMemoryRouter.
// eslint-disable-next-line react-refresh/only-export-components
export const routes = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/add', element: <AddExpense /> },
    ],
  },
]

const router = createBrowserRouter(routes)

export default function App() {
  return <RouterProvider router={router} />
}
