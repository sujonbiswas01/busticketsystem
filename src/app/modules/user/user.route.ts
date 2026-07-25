import { Router } from "express"
import { validateRequest } from "../../middleware/validationRequest"
import { createUserSchema } from "./user.validation"
import { userController } from "./user.controller"
import auth from "../../middleware/Auth"
import { Role } from "../../../generated/prisma/browser"

const router=Router()
router.post("/register",validateRequest(createUserSchema), userController.UserRegister)
router.post("/login", userController.loginUser)
router.get("/me",auth([Role.ADMIN, Role.USER,Role.MANAGER]), userController.getMe)

export const AuthRouters=router