// Cities the viewer can pick to see how a photographer's availability lines up
// with their own timezone. The photographer's own zone comes from the API
// (photographer.timezone); this list is only for the viewer's perspective.

export interface CityTz {
  label: string;
  timeZone: string;
}

export const VIEWER_CITIES: CityTz[] = [
  { label: "Bogotá", timeZone: "America/Bogota" },
  { label: "Mexico City", timeZone: "America/Mexico_City" },
  { label: "New York", timeZone: "America/New_York" },
  { label: "Los Angeles", timeZone: "America/Los_Angeles" },
  { label: "São Paulo", timeZone: "America/Sao_Paulo" },
  { label: "Buenos Aires", timeZone: "America/Argentina/Buenos_Aires" },
  { label: "London", timeZone: "Europe/London" },
  { label: "Madrid", timeZone: "Europe/Madrid" },
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
  { label: "Sydney", timeZone: "Australia/Sydney" },
];

// Default to the city matching the browser's timezone, else the first entry.
export function defaultViewerCity(): CityTz {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return VIEWER_CITIES.find((c) => c.timeZone === detected) ?? VIEWER_CITIES[0]!;
}
