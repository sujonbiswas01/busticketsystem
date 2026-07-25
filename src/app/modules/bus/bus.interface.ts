import z from "zod";
import { createBusSchema, updateBusSchema } from "./bus.validation";

export type BusCreateInput = z.infer<typeof createBusSchema>;
export type BusUpdateInput = z.infer<typeof updateBusSchema>;