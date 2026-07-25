import z from "zod";
import { createDriverSchema, updateDriverSchema } from "./driver.validation";

export type DriverCreateInput = z.infer<typeof createDriverSchema>;
export type DriverUpdateInput = z.infer<typeof updateDriverSchema>;