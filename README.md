# CalcApp

CalcApp is a **personal budget tracker**: you record an expense (amount, category,
date), see your expenses listed newest-first with the total for the current month,
and delete an expense. It is also the running example of the AI4SE course
("AI for Software Engineering"), where it is built step by step.

All data stays in your browser (`localStorage`): there is no account, no server and
no network call.

## Features (v0.1)

- **Two pages with navigation** — a *Dashboard* (`/`) and an *Add Expense* page
  (`/add`); both offer links to each other.
- **Add an expense** — a form with a labelled amount, category and date field.
  Categories are a fixed list: Food, Transport, Housing, Leisure, Other.
- **Validation** — the amount must be a positive number, the category one of the
  list, and the date must not be empty. The first offending field gets an error
  message and is marked `aria-invalid`.
- **Dashboard list** — every stored expense, newest first, showing
  `amount — category — date`; the month total is the sum of the current calendar
  month only, printed as `42.50 €`.
- **Empty state** — with nothing stored the page reads "No expenses yet" and the
  total is `0.00 €`.
- **Delete** — removes one expense from the list and from storage after a
  `window.confirm` confirmation; cancelling changes nothing.
- **Persistence** — expenses are saved in `localStorage` under `calcapp.expenses`.
  A missing key or corrupt JSON reads back as an empty list, and rows that do not
  match the validation rules are dropped instead of breaking the page.

There is no description field and no styling beyond a minimal layout in this
version.

## Tech stack (pinned — do not upgrade without asking)

| Layer | Choice |
|---|---|
| UI | React 19 |
| Routing | React Router 7 (`createBrowserRouter`) |
| Language | TypeScript 5.9 (strict) |
| Build / dev server | Vite 7 |
| Tests | Vitest 4 + Testing Library + jsdom |
| Lint | ESLint 9 (flat config) |

Node.js 20.19+ (see `engines` in `package.json`) and npm are required.
Dependencies are locked in `package-lock.json`, so install with `npm ci`.

## Install and run

```sh
npm ci          # install the exact locked versions
npm run dev     # start the dev server, open the printed URL
```

`npm run dev` prints the local URL to open (Vite's default is
<http://localhost:5173>).

To run the production build instead:

```sh
npm run build   # type-check + bundle to dist/
npm start       # serve dist/ on $PORT (default 3000)
```

## Scripts

All scripts are defined in `package.json`:

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | `tsc -b` then `vite build`, output in `dist/` |
| `npm start` | serve the built `dist/` via `vite preview` on `$PORT` (default 3000) |
| `npm run preview` | serve the built `dist/` (Vite preview defaults) |
| `npm test` | Vitest in watch mode (`q` to quit) |
| `npm run test:run` | Vitest once (used in CI and in the Docker build) |
| `npm run lint` | ESLint over the whole repository |

## Project structure

```
src/
  main.tsx        entry point: mounts <App /> in StrictMode, imports App.css
  App.tsx         routes (exported for tests) + layout with the navigation links
  pages/
    Home.tsx      "/"   dashboard: month total, newest-first list, delete
    AddExpense.tsx "/add" add page: builds the expense id, saves, navigates home
  ExpenseForm.tsx form: amount / category / date fields, validation, onAdd callback
  expense.ts      CATEGORIES, expense types and validateExpense
  money.ts        formatAmount and monthTotal
  storage.ts      Expense type, STORAGE_KEY, saveExpenses / loadExpenses
  App.css         minimal layout styles
tests/
  setup.ts        jest-dom matchers, afterEach clearing localStorage and mocks
  *.test.ts(x)    tests mirroring src/: expense, money, storage, ExpenseForm,
                  App, AddExpense, Home
docs/
  plan.md         plan of CalcApp v0.1 (tasks T1–T8 and their acceptance criteria)
docker/
  nginx.conf.template  nginx config used by the container image
Dockerfile        multi-stage image: Node 22 tests + builds, nginx serves dist/
```

Tests live next to the code they cover by name but in their own `tests/`
directory; tests that render pages mount the exported `routes` from `src/App.tsx`
in a `createMemoryRouter`.

## Container

```sh
docker build -t calcapp .
docker run --rm -p 3000:3000 calcapp    # http://localhost:3000
```

The image is multi-stage: a Node 22 stage installs the locked dependencies, runs
`npm run test:run` and `npm run build`; an nginx stage serves `dist/` and falls
back to `index.html` for unknown paths so client-side routing works. It listens on
`$PORT` (default **3000**) and has a health check on `GET /`.

## Conventions

See [AGENTS.md](AGENTS.md): TDD, one branch per task, never commit to `main`
directly, never commit secrets.
## Why

Data stays in localStorage on purpose: v0.1 is single-user and offline, no backend until the plan needs one. Stored data is validated on load because a browser can hold anything under our key. The delete confirmation is a deliberate trade-off: one more click against losing data on a misclick.
