# PLAN — Photographer Weekly Availability

## Goal

Two capabilities:

1. A photographer can **set their availability for a given week** (date-based time slots).
2. Any user can **visualize the availability calendar** of a specific photographer.

"Simple but production-ready": one new table, two endpoints, validation at the edge, a
transactional full-week replace, and a read-only weekly calendar — no over-engineering.

## Decisions (locked)

- **Date-based model**, not a recurring template. Slots are tied to a real `date`
  (`YYYY-MM-DD`), so the calendar shows actual days. This was the explicit choice.
- **A "week" = Monday → Sunday**, identified by its `weekStart` (the Monday).
- **Setting a week is a full replace** of that photographer's slots within
  `[weekStart, weekStart + 6 days]`, done in a single transaction (delete + insert).
  This makes the write idempotent and sidesteps incremental overlap bugs.
- **Multiple intervals per day are allowed** (e.g. `09:00–12:00` + `14:00–18:00`).
  Overlaps within the same date are rejected at validation time.
- **Time of day is stored as wall-clock** (Postgres `time`, no timezone). It represents
  the photographer's local business hours. Per-photographer timezone conversion is
  **out of scope** (documented assumption).

## Data model

New table in `server/src/db/schema.ts`:

```ts
export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: serial("id").primaryKey(),
    photographerId: integer("photographer_id")
      .notNull()
      .references(() => photographers.id, { onDelete: "cascade" }),
    date: date("date").notNull(),            // "YYYY-MM-DD" (mode: "string")
    startTime: time("start_time").notNull(), // "HH:MM:SS"
    endTime: time("end_time").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_availability_photographer_date").on(t.photographerId, t.date),
    check("availability_time_order", sql`${t.endTime} > ${t.startTime}`),
  ],
);
```

Then `pnpm db:generate` → new versioned migration in `server/drizzle/` (committed, never
hand-edited).

> Note: DB-level overlap exclusion would need `btree_gist`. For this scope we enforce
> non-overlap in the validation/repo layer instead — simpler, still safe given the
> full-replace write path.

## Shared contracts (`shared/src/index.ts`)

```ts
export interface AvailabilitySlot {
  id: number;
  photographerId: number;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
}

// Full-week replace payload.
export interface SetAvailabilityInput {
  weekStart: string;  // YYYY-MM-DD, must be a Monday
  slots: Array<{ date: string; startTime: string; endTime: string }>;
}
```

Edge mapping: store/return `time` as `HH:MM` (trim the `:SS` Postgres gives back).

## API

| Method | Path                                            | Purpose                          |
| ------ | ----------------------------------------------- | -------------------------------- |
| `GET`  | `/api/photographers/:id/availability?weekStart=YYYY-MM-DD` | Read one week (calendar view) |
| `PUT`  | `/api/photographers/:id/availability`           | Replace one week (`SetAvailabilityInput`) |

- `GET` → `AvailabilitySlot[]` ordered by `date`, then `startTime`. 404 if photographer missing.
- `PUT` → returns the saved `AvailabilitySlot[]` for the week. 404 if photographer missing.
- Nest the router under the photographers feature so the URL stays resource-scoped.

## Server feature folder — `server/src/availability/`

Mirror the existing `bookings` / `photographers` pattern:

- **`availability.schema.ts`** — zod, `satisfies z.ZodType<SetAvailabilityInput>`:
  - `weekStart`: `YYYY-MM-DD`, refine = is a Monday.
  - each slot `date`: `YYYY-MM-DD`; `startTime`/`endTime`: `^\d{2}:\d{2}$`.
  - refine: `endTime > startTime` per slot.
  - refine: every slot `date` within `[weekStart, weekStart+6]`.
  - refine: no overlapping intervals within the same `date`.
  - cap slot count (e.g. ≤ 50) to bound payload.
  - query schema for `GET`: `weekStart` required, Monday.
- **`availability.repo.ts`**:
  - `toAvailabilitySlot(row)` → contract (`HH:MM` times).
  - `getAvailabilityForWeek(photographerId, weekStart)` → ordered slots in range.
  - `setAvailabilityForWeek(photographerId, input)` → `db.transaction`: delete existing
    slots in `[weekStart, weekStart+6]`, insert new, return mapped rows.
- **`availability.routes.ts`** — `GET` + `PUT`, zod-parse params/query/body, 404 guard via
  `getPhotographer`. Async handlers (Express 5 forwards rejections to the central handler).
- **`availability.schema.test.ts`** — vitest, mirror `bookings.schema.test.ts`: valid week,
  bad time order, overlap rejected, date outside week rejected, non-Monday `weekStart`.
- Wire in `server/src/index.ts`: `app.use("/api/photographers/:id/availability", ...)` or
  mount the sub-router inside `photographersRouter` with `mergeParams: true`.

## Seed (`server/src/db/seed.ts`)

Insert a couple of weeks of slots for the seeded photographers so the calendar isn't empty
on first load (use the current week's Monday, computed at seed time).

## Client

- **`client/src/api.ts`**:
  - `fetchAvailability(photographerId, weekStart): Promise<AvailabilitySlot[]>`
  - `setAvailability(photographerId, input: SetAvailabilityInput): Promise<AvailabilitySlot[]>`
- **Read-only calendar view** (the headline). New page + route under `/example`
  (reference area), e.g. `/example/:id/availability`:
  - Weekly grid: 7 columns Mon→Sun with real dates; each cell lists that date's intervals.
  - TanStack Query `useQuery(["availability", id, weekStart], …)`.
  - Empty/loading/error states.
  - **Stretch**: prev/next week navigation (re-derives `weekStart`).
- **Editor UI** for the photographer to set a week (mutation + `invalidateQueries`):
  - Per-day rows, add/remove intervals, submit the whole week (`PUT`).
  - Inline validation feedback from the 400 error envelope.
- Date helpers (`weekStart` = Monday of a date, list 7 days). JS `getDay()` is
  `0=Sun..6=Sat`; Monday = `date - ((getDay()+6)%7)` days. Keep helpers in one small module.

## Phasing (stop-anywhere slices for live coding)

1. **Foundation** — schema table + `pnpm db:generate` + shared contracts. ✅ compiles.
2. **Server read+write** — repo + routes + wire + zod + tests. ✅ `pnpm test` + `typecheck`.
3. **Seed** — availability rows for seeded photographers.
4. **Calendar view** — client api + read-only weekly grid (delivers capability #2).
5. **Editor** — set-the-week form + mutation (delivers capability #1).
6. **Polish** — week navigation, empty states, error display.

## Validation gate (per slice)

```bash
pnpm typecheck   # tsc across all packages
pnpm test        # vitest
```

## Out of scope (explicit)

- Per-photographer timezones / DST.
- Booking-vs-availability cross-checks (a booking landing outside availability).
- Recurring templates / copy-last-week.
- Auth / "who is this photographer" — the editor is open in the scaffold.

## Workflow

Per `AGENTS.md`: `main` is protected. Create an issue → branch
(`amartinez/feature/2026-06-09/availability`) → PR. Commit per slice with conventional
commits. Migrations committed alongside the schema change.
