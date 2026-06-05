# Snappr Live Coding — Scaffold

Full-stack TypeScript monorepo, ready for a live coding session. Node + React + Postgres.

## Layout

- `shared/` — `@snappr/shared`: types shared by server and client (the single source of truth for API contracts).
- `server/` — `@snappr/server`: Express + Drizzle ORM (typed SQL over `pg`) + zod validation.
- `client/` — `@snappr/client`: React + Vite + TanStack Query.

## Run

```bash
pnpm setup       # install + start db (docker) + migrate + seed
pnpm dev         # server (:3001) + client (:5173) together
pnpm test        # vitest
pnpm typecheck   # tsc across all packages
pnpm db:generate # generate a migration after editing the schema
```

`pnpm db:reset` wipes the volume and re-applies migrations + seed.

## Environment & ports

All config lives in the **monorepo-root `.env`** (loaded by absolute path, since
`pnpm --filter` runs each script with its package dir as cwd — a bare dotenv would miss it):

| Variable       | Default | Used by                          |
| -------------- | ------- | -------------------------------- |
| `SERVER_PORT`  | `3001`  | Express (`server/src/env.ts`)    |
| `CLIENT_PORT`  | `5173`  | Vite (`client/vite.config.ts`)   |
| `DATABASE_URL` | …5433…  | Drizzle pool                     |

- The backend port lives in one place; the client's `/api` proxy target is **derived** from it.
- Postgres is on host port **5433** (Docker) to avoid clashing with a local Postgres on 5432.
- **Remote access (Tailnet/LAN):** Vite runs with `host: true` + `allowedHosts` for the
  tailnet domain, so the app is reachable at `http://<host>.<tailnet>.ts.net:5173`.
  The **backend is not exposed** — Vite proxies `/api` to `localhost` on this machine.
  (Express binds `0.0.0.0` by default; Vite binds localhost unless `host: true`.)

## Client routes

- `/` — minimal landing (clean slate for live work).
- `/example` — the photographers demo (reference). Routes in `client/src/App.tsx`,
  pages in `client/src/pages/`.

## Conventions

- **Contracts live in `shared/`.** Add/change an API type there first; both sides must agree or compilation fails.
- **Data layer is Drizzle.** Schema in `server/src/db/schema.ts`; edit it, then `pnpm db:generate` to produce a migration in `server/drizzle/`. Repos use the typed query builder and map rows to the `shared/` contracts.
- **Migrations are versioned and committed.** Never hand-edit applied migrations; change the schema and generate a new one.
- **Validation at the edge with zod.** Routes parse `req.body`/`req.query`; the central error handler turns `ZodError` into 400.
- **Feature folders** on the server: `server/src/<feature>/<feature>.routes.ts`, `.repo.ts`, `.schema.ts`.
- Keep it pragmatic. This is a 1-hour scaffold, not a platform — add layers only when a real requirement demands them.

## Domain

`photographers` (id, name, city, hourly_rate, rating) and `bookings`
(photographer_id, client_name, scheduled_at, status). Snappr is a photography marketplace.

## API

- `GET /api/health`
- `GET /api/photographers?city=<city>`
- `GET /api/photographers/:id`
- `POST /api/bookings` — body: `{ photographerId, clientName, scheduledAt }`
