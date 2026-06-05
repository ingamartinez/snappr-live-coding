import { Router } from "express";
import { createBooking } from "./bookings.repo.js";
import { createBookingSchema } from "./bookings.schema.js";

export const bookingsRouter = Router();

// Express 5 forwards rejected promises to the error handler automatically.
bookingsRouter.post("/", async (req, res) => {
  const input = createBookingSchema.parse(req.body);
  const booking = await createBooking(input);
  res.status(201).json(booking);
});
