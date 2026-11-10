# CalcApp v0.1 — plan

Personal budget tracker: add an expense (amount, category, date), list expenses with a
monthly total, two pages with navigation, data in localStorage, and delete an expense.

Decisions: categories are a fixed list (Food, Transport, Housing, Leisure, Other); no
description field in v0.1; delete asks for confirmation (`window.confirm` stubbed with
`vi.spyOn`); "this month" is the current calendar month, the list shows all expenses
newest-first; no styling this version.

## T1 — Expense model and validation        [next]
Accept: a test accepts {42.5, 'Food', '2026-11-10'} and rejects amount 0, -1, 'abc', an empty category and an empty date, returning a message for the first offending field
Branch: feat/expense-model

## T2 — Money helpers        [todo]
Accept: monthTotal(expenses, '2026-11') sums only that month's expenses, and formatAmount(42.5) is '42.50 €' (plain toFixed, no Intl locale or narrow no-break spaces)
Branch: feat/money-helpers

## T3 — Save and load expenses (localStorage)        [todo]
Accept: loadExpenses() returns exactly what saveExpenses() wrote, and [] for a missing key or corrupt JSON; tests/setup.ts gains an afterEach clearing localStorage and restoring mocks
Branch: feat/expense-storage

## T4 — Two pages and navigation        [todo]
Accept: the exported routes rendered in a createMemoryRouter at '/add' show the heading "Add Expense", and every page offers links "Dashboard" (/) and "Add Expense" (/add); tests/App.test.tsx is updated, not weakened
Branch: feat/routing

## T5 — ExpenseForm component        [todo]
Accept: the form exposes a labelled amount, category and date field, and submitting 42.5 / Food / 2026-11-10 calls onAdd once with exactly those values (fields queried by label or role)
Branch: feat/expense-form

## T6 — Add flow: form to storage to home        [todo]
Accept: submitting from /add leaves the app at / and stores exactly one matching expense, the id being generated in the submit handler so StrictMode's double render does not duplicate it
Branch: feat/add-expense-flow

## T7 — Dashboard list and total        [todo]
Accept: with 42.50 Food dated this month and 7.50 Transport dated last month the list shows both, newest first, with the total 42.50 €; with nothing to show it reads "No expenses yet" and 0.00 € (clock frozen with vi.setSystemTime)
Branch: feat/dashboard

## T8 — Delete an expense with confirmation        [todo]
Accept: with window.confirm stubbed to true, Delete removes only that expense from the list and from localStorage, and updates the total; stubbed to false, list, total and storage are unchanged
Branch: feat/delete-expense
