// Contracts shared between server and client.
// Change a type here and both sides fail to compile until they agree — that is
// the whole point of the shared package.

export interface Photographer {
  id: number;
  name: string;
  city: string;
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

// Generic API error envelope returned by the server.
export interface ApiError {
  error: string;
  details?: unknown;
}
