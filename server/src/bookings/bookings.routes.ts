import { Router } from "express";
import { createBooking } from "./bookings.repo.js";
import { createBookingSchema } from "./bookings.schema.js";

export const bookingsRouter = Router();

bookingsRouter.post("/", async (req, res, next) => {
  try {
    const input = createBookingSchema.parse(req.body);
    const booking = await createBooking(input);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});
