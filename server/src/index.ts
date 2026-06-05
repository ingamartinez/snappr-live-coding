import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { bookingsRouter } from "./bookings/bookings.routes.js";
import { SERVER_PORT } from "./env.js";
import { photographersRouter } from "./photographers/photographers.routes.js";

const app = express();
const port = SERVER_PORT;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/photographers", photographersRouter);
app.use("/api/bookings", bookingsRouter);

// Central error handler: turn validation errors into 400s, everything else into 500s.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Invalid request", details: err.flatten() });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`✓ server listening on http://localhost:${port}`);
});
