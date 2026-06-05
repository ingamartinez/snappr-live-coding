# Snappr — Agent Workflow

This file is the contract for any AI agent or human working on this repo. It keeps
the work disciplined: every change is traceable from a GitHub issue to a merged PR.

## Source of truth

1. **`CLAUDE.md`** — architecture, layout, conventions, domain, API surface. Read FIRST.
2. **GitHub Issues** — granular tasks, bugs, features. One issue per unit of work.
3. **This file (`AGENTS.md`)** — workflow conventions only.

If `CLAUDE.md` and an issue conflict, ask — do not silently pick.

## Issue-first rule (mandatory)

**No code changes without an open issue.** Before any work:

1. Search existing issues: `gh issue list --search "<keywords>"`. If one exists, use it.
2. If none, create one: `gh issue create --title "..." --label "<label>" --body "..."`.
3. Branch off it (see below). The issue number ties the branch, commits, and PR together.

Why: every change is traceable, and the history reads as a series of intentional units.

## Labels (canonical list)

Issues are labelled by **work type**, mirroring the commit/branch `<type>`. Pick the one
that matches the change. Do NOT invent new labels without an issue to track it.

| Label      | Use for                                  |
| ---------- | ---------------------------------------- |
| `feat`     | New feature                              |
| `fix`      | Bug fix                                  |
| `chore`    | Tooling, dependencies, config            |
| `refactor` | Code change with no behavior change      |
| `test`     | Tests only                               |
| `docs`     | Documentation only                       |

GitHub's triage labels (`question`, `help wanted`, `good first issue`, `duplicate`,
`invalid`, `wontfix`) still exist and are orthogonal — use them as flags, not as the type.

## Branch naming

```
<type>/<issue>-<short-slug>
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`.

Examples:

- `feat/3-filter-photographers-by-city`
- `fix/7-booking-conflict-validation`

Never commit directly to `main`.

## Commit format (conventional commits, no AI attribution)

```
<type>(<scope>): <subject> (#<issue>)
```

Scopes: `photographers`, `bookings`, `shared`, `server`, `client`, `db`, `ci`, `docs`.

Examples:

- `feat(photographers): add city filter to list endpoint (#3)`
- `fix(bookings): reject overlapping scheduled_at (#7)`
- `chore(ci): add typecheck + test workflow (#1)`

NEVER add `Co-Authored-By` or any AI attribution line.

## PR convention

- Title: same as the closing commit subject.
- Body MUST include `Closes #<issue>` so the issue auto-closes on merge.
- Self-review checklist: `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test` clean, manual smoke described.
- **Squash merge** by default — keeps history linear, one commit per issue on `main`.
- Open the PR; the human decides when to merge (especially in a live session).

## Tech baseline (do not deviate without an issue)

- **Package manager**: pnpm (monorepo workspaces). Run scripts from repo root.
- **Contracts live in `shared/`** (`@snappr/shared`). Add/change an API type there FIRST;
  both server and client must agree or compilation fails.
- **Server**: Express 5 + Drizzle ORM + zod. Feature folders:
  `server/src/<feature>/<feature>.routes.ts`, `.repo.ts`, `.schema.ts`.
  Express 5 is async-native: handlers may be `async` and any rejection is forwarded
  to the central error handler — NO per-handler `try/catch` needed.
- **Linting**: ESLint flat config (`eslint.config.js`), lean type-aware. The rule that
  earns its keep is `@typescript-eslint/no-floating-promises` — a forgotten `await`
  is invisible to tsc. Run `pnpm lint`; keep it green before a PR.
- **Data layer is Drizzle.** Schema in `server/src/db/schema.ts`. Edit it, then
  `pnpm db:generate` to produce a migration in `server/drizzle/`. Never hand-edit
  applied migrations — change the schema and generate a new one.
- **Validation at the edge with zod.** Routes parse `req.body`/`req.query`; the central
  error handler turns `ZodError` into 400.
- **Client**: React + Vite + TanStack Query. Routes in `client/src/App.tsx`,
  pages in `client/src/pages/`.
- **Tests**: Vitest (`pnpm test`). Keep the suite green before opening a PR.
- **No build step in verification** — use `pnpm typecheck` + `pnpm lint` + `pnpm test`.

## Local commands

```bash
pnpm setup        # install + db up + migrate + seed
pnpm dev          # server (:3001) + client (:5173)
pnpm test         # vitest
pnpm typecheck    # tsc across all packages
pnpm lint         # eslint (lean type-aware)
pnpm db:generate  # generate a migration after editing the schema
pnpm db:reset     # wipe volume, re-apply migrations + seed
```

## gh CLI

The default `gh` account is `ingamartinez` — no special config needed. Verify any time:

```bash
gh auth status   # should show: Logged in to github.com account ingamartinez
```

## Sub-agent orchestration (Claude Code)

This repo ships one project-scoped sub-agent in `.claude/agents/`:

| Agent                | Role                                                      | When to invoke              |
| -------------------- | -------------------------------------------------------- | --------------------------- |
| `snappr-implementer` | Claim issue → branch → code + tests → commit → push → PR | For every code change       |

The agent stops before merging — the human presses merge. It follows this file as
the binding contract. Architectural / multi-step work belongs in the `/sdd-*` flow.
