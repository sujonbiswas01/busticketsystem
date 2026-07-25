import { Router } from "express"
import { validateRequest } from "../../middleware/validationRequest"
import { createUserSchema } from "./user.validation"
import { userController } from "./user.controller"

const router=Router()
router.post("/register",validateRequest(createUserSchema), userController.UserRegister)
router.post("/login", userController.loginUser)

export const AuthRouters=router