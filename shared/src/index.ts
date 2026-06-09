// Contracts shared between server and client.
// Change a type here and both sides fail to compile until they agree — that is
// the whole point of the shared package.

export interface Photographer {
  id: number;
  name: string;
  city: string;
  // IANA timezone (e.g. "America/Bogota") — the anchor for the photographer's
  // wall-clock availability. The calendar labels times in this zone.
  timezone: string;
  hourlyRate: number;
  rating: number;
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  id: number;
  photographerId: number;
  clientName: string;
  scheduledAt: string;
  status: BookingStatus;
  createdAt: string;
}

// Request payload for creating a booking.
export interface CreateBookingInput {
  photographerId: number;
  clientName: string;
  scheduledAt: string;
}

// A single availability interval on a concrete date (wall-clock, no timezone).
export interface AvailabilitySlot {
  id: number;
  photographerId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

// Full-week replace payload: every slot's date must fall within the week that
// starts on `weekStart` (a Monday). Replaces all of that photographer's slots
// in that week.
export interface SetAvailabilityInput {
  weekStart: string; // YYYY-MM-DD, must be a Monday
  slots: Array<{
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  }>;
}

export interface City {
  name: string;
  timezone: string; // IANA, e.g. "America/Bogota"
}

// Canonical city list — the single source of truth shared by the server (city
// validation + timezone derivation) and the client (city dropdowns). A
// photographer's city must be one of these; its timezone is derived, never typed.
export const CITIES: City[] = [
  { name: "Bogotá", timezone: "America/Bogota" },
  { name: "Medellín", timezone: "America/Bogota" },
  { name: "Cali", timezone: "America/Bogota" },
  { name: "Cartagena", timezone: "America/Bogota" },
  { name: "Mexico City", timezone: "America/Mexico_City" },
  { name: "New York", timezone: "America/New_York" },
  { name: "Los Angeles", timezone: "America/Los_Angeles" },
  { name: "São Paulo", timezone: "America/Sao_Paulo" },
  { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires" },
  { name: "London", timezone: "Europe/London" },
  { name: "Madrid", timezone: "Europe/Madrid" },
  { name: "Tokyo", timezone: "Asia/Tokyo" },
  { name: "Sydney", timezone: "Australia/Sydney" },
];

// The IANA timezone for a city name, or undefined if it is not a known city.
export function cityTimezone(name: string): string | undefined {
  return CITIES.find((c) => c.name === name)?.timezone;
}

// Request payload for updating a photographer's city (timezone is derived).
export interface UpdatePhotographerInput {
  city: string;
}

// Generic API error envelope returned by the server.
export interface ApiError {
  error: string;
  details?: unknown;
}
