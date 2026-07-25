import { z } from "zod";

export const createBusSchema = z.object({
  busName: z.string().min(2, "Bus name must be at least 2 characters"),
  busNumber: z.string().min(1, "Bus number is required"),
  busType: z.enum(["AC", "NON_AC", "DELUXE"]), 
  totalSeats: z.number().int().positive("Total seats must be a positive number"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).optional(),
  driverId: z.string().uuid().optional(),
  routeId: z.string().uuid("Valid route id is required"),
});

export const updateBusSchema = z.object({
  busName: z.string().min(2).optional(),
  busNumber: z.string().min(1).optional(),
  busType: z.enum(["AC", "NON_AC", "DELUXE"]).optional(),
  totalSeats: z.number().int().positive().optional(),
  registrationNumber: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).optional(),
  driverId: z.string().uuid().optional().nullable(),
  routeId: z.string().uuid().optional(),
});