import { Router } from "express";
import { z } from "zod";
import { getPhotographer, listPhotographers } from "./photographers.repo.js";

export const photographersRouter = Router();

const listQuery = z.object({ city: z.string().min(1).optional() });

// Express 5 forwards rejected promises to the error handler, so async handlers
// need no try/catch — a thrown ZodError lands in the central handler as a 400.
photographersRouter.get("/", async (req, res) => {
  const { city } = listQuery.parse(req.query);
  const photographers = await listPhotographers(city);
  res.json(photographers);
});

photographersRouter.get("/:id", async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const photographer = await getPhotographer(id);
  if (!photographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  res.json(photographer);
});
