import type { Booking, CreateBookingInput, Photographer } from "@snappr/shared";

// Thin typed fetch wrapper. Returns parsed JSON or throws on non-2xx.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchPhotographers(city?: string): Promise<Photographer[]> {
  const query = city ? `?city=${encodeURIComponent(city)}` : "";
  return request<Photographer[]>(`/api/photographers${query}`);
}

export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return request<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
