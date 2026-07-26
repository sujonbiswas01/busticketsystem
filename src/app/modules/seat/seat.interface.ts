import z from "zod";
import { createSeatSchema, updateSeatSchema } from "./seat.validation";

export type SeatCreateInput = z.infer<typeof createSeatSchema>;
export type SeatUpdateInput = z.infer<typeof updateSeatSchema>;