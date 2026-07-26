import { z } from "zod";

export const createSeatSchema = z.object({
  registration_Number: z.string().min(1, "Bus registration number is required"),
  seat_number: z.string().min(1, "Seat number is required"),
  user_id: z.string().uuid().optional(),
  status: z.enum(["AVAILABLE", "BOOKED", "BLOCKED"]).default("AVAILABLE"),
});


export const updateSeatSchema = z.object({
  registration_Number: z.string().min(1).optional(),
  seat_number: z.string().min(1).optional(),
  user_id: z.string().uuid().optional().nullable(),
  status: z.enum(["AVAILABLE", "BOOKED", "BLOCKED"]).optional(),
});