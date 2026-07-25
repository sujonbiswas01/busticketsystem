import { z } from "zod";

export const createRouteSchema = z.object({
  from_city: z.string().min(2, "From city must be at least 2 characters"),
  to_city: z.string().min(2, "To city must be at least 2 characters"),
  distance: z.string().min(1, "Distance is required"),
  base_price: z.number().positive("Base price must be a positive number"),
})

export const updateRouteSchema = z.object({
  from_city: z.string().min(2).optional(),
  to_city: z.string().min(2).optional(),
  distance: z.string().min(1).optional(),
  base_price: z.number().positive().optional(),
});