# CalcApp starter

Public starter of **CalcApp**, the running example of the AI4SE course
("AI for Software Engineering"). A minimal React app — it only shows "CalcApp" on `/`
and has one passing test: you build the rest during the course.

Stack (pinned): Vite 7, React 19, React Router 7, TypeScript 5.9, Vitest 4, ESLint 9.
Requires Node.js 20.19+ (or 22.12+) and npm.

## Start

```sh
git clone https://github.com/nicolasguelfi/calcapp-starter calcapp
cd calcapp
git checkout -b mywork j2-start
npm ci            # install the exact locked versions
npm test          # tests in watch mode (q to quit) — or: npm run test:run
npm run dev       # open the printed http://localhost:5173
```

Other scripts: `npm run lint`, `npm run build` (to `dist/`), `npm start` (serves `dist/`
on `$PORT`, default 3000), `npm run preview`.

## Late or lost? Restart from a recovery tag

Clone again in a **new folder** and start a branch at the tag of the current exercise:

```sh
git clone https://github.com/nicolasguelfi/calcapp-starter calcapp-restart
cd calcapp-restart
git checkout -b mywork j2-part1     # ← replace by the tag you need
npm ci
```

| Tag | Content | Use it for |
|---|---|---|
| `j2-start` | this starter | day 2 morning: git first, steering opencode, technical plan |
| `j2-part1` | first task of CalcApp v0.1 done | day 2 afternoon: CalcApp v0.1 part 2 |
| `j2-v0.1` | CalcApp v0.1 shipped | day 2 end: code review, bridge to GSE-One |

Later tags (`p3-start`, …) are added during the course: `git fetch --tags && git tag`.

## Container

```sh
docker build -t calcapp .
docker run --rm -p 3000:3000 calcapp     # http://localhost:3000
```

Multi-stage image: Node 22 runs the tests and builds, nginx serves `dist/`.
It listens on `$PORT` (default **3000**) and has a health check on `GET /`
(busybox `wget`, no curl needed).

## Conventions

See [AGENTS.md](AGENTS.md) (read by opencode): TDD, one branch per task, never commit
to `main` directly, never commit secrets.
