import { z } from "zod";
import type { CreateBookingInput } from "@snappr/shared";

export const createBookingSchema = z.object({
  photographerId: z.number().int().positive(),
  clientName: z.string().min(1),
  scheduledAt: z.string().datetime(),
}) satisfies z.ZodType<CreateBookingInput>;
