import type {
  AvailabilitySlot,
  Booking,
  CreateBookingInput,
  Photographer,
  SetAvailabilityInput,
  UpdatePhotographerInput,
} from "@snappr/shared";

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

export function fetchPhotographer(id: number): Promise<Photographer> {
  return request<Photographer>(`/api/photographers/${id}`);
}

export function updatePhotographer(
  id: number,
  input: UpdatePhotographerInput,
): Promise<Photographer> {
  return request<Photographer>(`/api/photographers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function fetchAvailability(
  photographerId: number,
  weekStart: string,
): Promise<AvailabilitySlot[]> {
  return request<AvailabilitySlot[]>(
    `/api/photographers/${photographerId}/availability?weekStart=${weekStart}`,
  );
}

export function setAvailability(
  photographerId: number,
  input: SetAvailabilityInput,
): Promise<AvailabilitySlot[]> {
  return request<AvailabilitySlot[]>(`/api/photographers/${photographerId}/availability`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
