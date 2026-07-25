import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be valid"),
  licenseNumber: z.string().min(3, "License number is required"),
  status: z
  .enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED"])
  .default("ACTIVE")
});

export const updateDriverSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  licenseNumber: z.string().min(3).optional(),
  status: z
  .enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED"])
  .default("ACTIVE")
});