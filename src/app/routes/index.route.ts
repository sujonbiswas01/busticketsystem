import { Router } from "express";
import { AuthRouters } from "../modules/user/user.route";

const router = Router()

router.use("/v1/auth",AuthRouters)

export const IndexRouter=router