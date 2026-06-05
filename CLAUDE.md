# Snappr Live Coding — Scaffold

Full-stack TypeScript monorepo, ready for a live coding session. Node + React + Postgres.

## Layout

- `shared/` — `@snappr/shared`: types shared by server and client (the single source of truth for API contracts).
- `server/` — `@snappr/server`: Express + `pg` (raw SQL, no ORM) + zod validation.
- `client/` — `@snappr/client`: React + Vite + TanStack Query.

## Run

```bash
pnpm setup     # install + start db (docker) + migrate + seed
pnpm dev       # server (:3001) + client (:5173) together
pnpm test      # vitest
pnpm typecheck # tsc across all packages
```

`pnpm db:reset` wipes and re-seeds the database.

## Conventions

- **Contracts live in `shared/`.** Add/change an API type there first; both sides must agree or compilation fails.
- **SQL is raw and parameterized.** Never interpolate input into a query — use `$1, $2`. Repos map snake_case rows to camelCase contracts.
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
