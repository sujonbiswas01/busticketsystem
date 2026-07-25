import z from "zod";
import { createUserSchema } from "./user.validation";

export type UserCreateInput = z.infer<typeof createUserSchema>;