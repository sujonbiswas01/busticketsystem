import { z } from "zod";

export const createBusSchema = z.object({
  busName: z.string().min(2, "Bus name must be at least 2 characters"),
  busNumber: z.string().min(1, "Bus number is required"),
  busType: z.enum(["AC", "NON_AC", "DELUXE"]),
  totalSeats: z
    .number()
    .int("Total seats must be an integer")
    .positive("Total seats must be a positive number"),
  licenseNumber: z.string().min(3, "License number must be at least 3 characters"),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).optional(),
});

export const updateBusSchema = z.object({
  busName: z.string().min(2).optional(),
  busNumber: z.string().min(1).optional(),
  busType: z.enum(["AC", "NON_AC", "DELUXE"]).optional(),
  totalSeats: z.number().positive().optional(),
  registrationNumber: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).optional(),
});