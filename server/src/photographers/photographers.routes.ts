import { Router } from "express";
import { z } from "zod";
import { getPhotographer, listPhotographers } from "./photographers.repo.js";

export const photographersRouter = Router();

const listQuery = z.object({ city: z.string().min(1).optional() });

photographersRouter.get("/", async (req, res, next) => {
  try {
    const { city } = listQuery.parse(req.query);
    const photographers = await listPhotographers(city);
    res.json(photographers);
  } catch (err) {
    next(err);
  }
});

photographersRouter.get("/:id", async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const photographer = await getPhotographer(id);
    if (!photographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }
    res.json(photographer);
  } catch (err) {
    next(err);
  }
});
