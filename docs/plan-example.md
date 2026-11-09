# CalcApp v0.1 — example plan (fallback)

Use this only if your own plan is not ready after the planning workshop:
`cp docs/plan-example.md docs/plan.md`, then adapt it. Your own plan is always better.

## T1 — Expense type with validation        [next]
Accept: a test rejects an amount <= 0 and an empty category; a valid expense passes
Branch: feat/expense-type

## T2 — ExpenseItem component        [todo]
Accept: a test renders one expense and shows its amount (2 decimals), category and description
Branch: feat/expense-item

## T3 — ExpenseForm component        [todo]
Accept: a test fills amount, category and description, clicks Add and receives the expense
Branch: feat/expense-form

## T4 — Two pages and navigation        [todo]
Accept: a test starts at "/" and sees links "Dashboard" and "Add Expense"; at "/add" sees the heading "Add Expense"
Branch: feat/routing

## T5 — Save and load expenses (localStorage)        [todo]
Accept: a test saves an expense and loads it back; an empty store returns []
Branch: feat/expense-storage

## T6 — Dashboard list and total        [todo]
Accept: after adding 42.50 Food and 7.50 Transport, the dashboard lists both and shows the total 50.00
Branch: feat/dashboard

## T7 — Minimal styling        [todo]
Accept: the form and the list are readable on a laptop screen; all tests still pass
Branch: feat/styling
