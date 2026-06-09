// Pure week-math helpers. Dates are YYYY-MM-DD wall-clock strings; we parse at
// UTC midnight so day-of-week and arithmetic are timezone-stable (no DST drift).

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isMonday(date: string): boolean {
  return new Date(`${date}T00:00:00Z`).getUTCDay() === 1;
}

// The Sunday that closes the week beginning on `weekStart` (a Monday).
export function weekEnd(weekStart: string): string {
  return addDays(weekStart, 6);
}
