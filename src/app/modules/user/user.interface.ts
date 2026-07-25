import z from "zod";
import { createUserSchema } from "./user.validation";

export type UserCreateInput = z.infer<typeof createUserSchema>;

export interface ILoginUser{
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}