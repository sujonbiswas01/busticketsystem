import z from "zod";
import { createScheduleSchema, updateScheduleSchema } from "./shedule.validation";


export type ScheduleCreateInput = z.infer<typeof createScheduleSchema>;
export type ScheduleUpdateInput = z.infer<typeof updateScheduleSchema>;