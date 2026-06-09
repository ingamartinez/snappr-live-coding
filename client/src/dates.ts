// Week math for the availability calendar. Dates are YYYY-MM-DD strings parsed
// at UTC midnight so weekday and arithmetic are timezone-stable (no DST drift).

export function mondayOf(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// The seven dates (Mon..Sun) of the week starting at `weekStart`.
export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function weekdayLabel(index: number): string {
  return WEEKDAY_LABELS[index]!;
}

// "2026-06-08" -> "Jun 8" for compact column headers.
export function shortDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// A reference instant inside the week — used to resolve offsets DST-correctly
// (an offset can differ between weeks, so we anchor to the week being shown).
export function weekReference(weekStart: string): Date {
  return new Date(`${weekStart}T12:00:00Z`);
}

// Minutes a timezone is ahead of UTC at a given instant (DST-aware via Intl).
function offsetMinutes(timeZone: string, at: Date): number {
  const inTz = new Date(at.toLocaleString("en-US", { timeZone }));
  const inUtc = new Date(at.toLocaleString("en-US", { timeZone: "UTC" }));
  return Math.round((inTz.getTime() - inUtc.getTime()) / 60000);
}

function hhmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m ? `${h}:${String(m).padStart(2, "0")}` : `${h}`;
}

// "UTC-5", "UTC+5:30", or "UTC".
export function utcOffsetLabel(timeZone: string, at: Date): string {
  const mins = offsetMinutes(timeZone, at);
  if (mins === 0) return "UTC";
  return `UTC${mins > 0 ? "+" : "-"}${hhmm(Math.abs(mins))}`;
}

// How far `toTz` is ahead of `fromTz`: "+7h", "−3h 30m", or "same time".
export function offsetDeltaLabel(fromTz: string, toTz: string, at: Date): string {
  const diff = offsetMinutes(toTz, at) - offsetMinutes(fromTz, at);
  if (diff === 0) return "same time";
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${diff > 0 ? "+" : "−"}${h}h${m ? ` ${m}m` : ""}`;
}
