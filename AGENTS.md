# CalcApp — project conventions for coding agents

CalcApp is the running example of the AI4SE course: a small React single-page app,
built step by step by the learner. Keep changes small and explain them.

## Stack (pinned — do not upgrade without asking)

- React 19 + React Router 7 (`createBrowserRouter`), TypeScript 5.9 (strict)
- Vite 7 (dev server, build), Vitest 4 + Testing Library + jsdom (tests)
- ESLint 9 (flat config, `eslint.config.js`)
- Dependencies are locked in `package-lock.json`: install with `npm ci`.
  Add a new dependency only when the learner agrees, and commit the updated lock file.

## Commands

| Goal | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Tests (watch / once) | `npm test` / `npm run test:run` |
| Lint | `npm run lint` |
| Build | `npm run build` (type-check + bundle to `dist/`) |
| Serve the build | `npm start` (port `$PORT`, default 3000) |
| Container | `docker build -t calcapp .` then `docker run -p 3000:3000 calcapp` |

## Layout

- `src/` — application code (`App.tsx` = routes, `pages/` = one component per route)
- `tests/` — tests, mirroring `src/` (`tests/setup.ts` loads jest-dom matchers)
- `docs/` — plan and documentation written by the learner

## Rules

1. **TDD**: write or update a failing test first, then the code that makes it pass,
   then refactor. Never delete or weaken a test to make it pass.
2. Before proposing a commit: `npm run test:run` and `npm run lint` must pass.
3. **One branch per task** (`feat/<short-name>`, `fix/<short-name>`).
   **Never commit directly to `main`**; `main` only receives merges of finished tasks.
4. Small commits with clear messages; show `git status` / `git diff` before committing.
5. **Never commit secrets**: no keys, passwords or tokens in code, tests or docs;
   `.env*` files stay out of git (already in `.gitignore`).
6. Ask before deleting files, rewriting history, or changing the stack or the Dockerfile.
