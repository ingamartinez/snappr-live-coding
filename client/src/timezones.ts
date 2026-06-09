import { CITIES, type City } from "@snappr/shared";

// The viewer picks one of the canonical cities to see how a photographer's
// availability lines up with their own timezone. Same list the photographer's
// own city is chosen from — one source of truth lives in @snappr/shared.

// Default to the city matching the browser's timezone, else the first entry.
export function defaultViewerCity(): City {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return CITIES.find((c) => c.timezone === detected) ?? CITIES[0]!;
}
