# Snappr Live Coding Scaffold

Full-stack TypeScript: **Node/Express + React/Vite + Postgres**, in a pnpm monorepo
with end-to-end type safety via a shared package.

## Prerequisites

Node 20+, pnpm, Docker.

## Quickstart

```bash
cp .env.example .env    # optional — defaults already match docker-compose
pnpm setup              # install deps, start Postgres, migrate, seed
pnpm dev                # http://localhost:5173 (client) + :3001 (server)
```

If `pnpm setup` runs before Docker finishes booting Postgres, just run
`pnpm migrate && pnpm seed` again — both retry the connection.

## Environment

All config lives in the monorepo-root `.env` (both server and client read it):

| Variable       | Default                                          | Used by          |
| -------------- | ------------------------------------------------ | ---------------- |
| `SERVER_PORT`  | `3001`                                            | Express server   |
| `CLIENT_PORT`  | `5173`                                            | Vite dev server  |
| `DATABASE_URL` | `postgres://snappr:snappr@localhost:5433/snappr` | server (pg pool) |

Change a port in one place and both sides stay in sync — the client's `/api`
proxy target is derived from `SERVER_PORT`.

## Scripts

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Run server + client together                  |
| `pnpm test`      | Run vitest                                     |
| `pnpm typecheck` | Typecheck every package                        |
| `pnpm db:up`       | Start Postgres (Docker, host port 5433)      |
| `pnpm db:generate` | Generate a migration from the Drizzle schema |
| `pnpm db:reset`    | Drop volume, recreate, migrate, seed         |
| `pnpm migrate`     | Apply pending migrations                     |
| `pnpm seed`        | Load sample photographers + bookings         |

## Structure

```
shared/   @snappr/shared   API contracts (types)
server/   @snappr/server   Express + Drizzle ORM (pg) + zod
client/   @snappr/client   React + Vite + TanStack Query
```

The client proxies `/api` to the server, so the browser talks same-origin.
