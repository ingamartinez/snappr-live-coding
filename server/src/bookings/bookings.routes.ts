import { Router } from "express";
import { cancelBooking, createBooking } from "./bookings.repo.js";
import { bookingIdParamSchema, createBookingSchema } from "./bookings.schema.js";

export const bookingsRouter = Router();

// Express 5 forwards rejected promises to the error handler automatically.
bookingsRouter.post("/", async (req, res) => {
  const input = createBookingSchema.parse(req.body);
  const booking = await createBooking(input);
  res.status(201).json(booking);
});

bookingsRouter.patch("/:id/cancel", async (req, res) => {
  const id = bookingIdParamSchema.parse(req.params.id);
  const booking = await cancelBooking(id);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(booking);
});
