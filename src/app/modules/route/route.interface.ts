import z from "zod";
import { createRouteSchema, updateRouteSchema } from "./route.validation";

export type RouteCreateInput = z.infer<typeof createRouteSchema>;
export type RouteUpdateInput = z.infer<typeof updateRouteSchema>;