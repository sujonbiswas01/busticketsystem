import { z } from "zod";

export const createScheduleSchema = z.object({
 date: z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  })
  .transform((val) => new Date(val).toISOString()),
     time: z.string().regex(
    /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i,
    "Time must be like 10:30 AM"
  ),

});

export const updateScheduleSchema = z.object({
    date: z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  })
  .transform((val) => new Date(val).toISOString()),
    time: z.string().min(1, "Time is required")

});