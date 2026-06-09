import { Router } from "express";
import { z } from "zod";
import { getPhotographer } from "../photographers/photographers.repo.js";
import { getAvailabilityForWeek, setAvailabilityForWeek } from "./availability.repo.js";
import { availabilityQuerySchema, setAvailabilitySchema } from "./availability.schema.js";

// mergeParams so `:id` from the parent mount path (/photographers/:id/...) is visible.
export const availabilityRouter = Router({ mergeParams: true });

const idParam = z.coerce.number().int().positive();

availabilityRouter.get<{ id: string }>("/", async (req, res) => {
  const id = idParam.parse(req.params.id);
  if (!(await getPhotographer(id))) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  const { weekStart } = availabilityQuerySchema.parse(req.query);
  res.json(await getAvailabilityForWeek(id, weekStart));
});

availabilityRouter.put<{ id: string }>("/", async (req, res) => {
  const id = idParam.parse(req.params.id);
  if (!(await getPhotographer(id))) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  const input = setAvailabilitySchema.parse(req.body);
  res.json(await setAvailabilityForWeek(id, input));
});
