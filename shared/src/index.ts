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

// Generic API error envelope returned by the server.
export interface ApiError {
  error: string;
  details?: unknown;
}
