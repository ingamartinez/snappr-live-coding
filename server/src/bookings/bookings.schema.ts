import { z } from "zod";
import type { CreateBookingInput } from "@snappr/shared";

export const createBookingSchema = z.object({
  photographerId: z.number().int().positive(),
  clientName: z.string().min(1),
  scheduledAt: z.string().datetime(),
}) satisfies z.ZodType<CreateBookingInput>;

// PATCH /:id/cancel — the id arrives as a URL string, so coerce before validating.
export const bookingIdParamSchema = z.coerce.number().int().positive();
