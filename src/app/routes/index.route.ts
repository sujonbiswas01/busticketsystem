import { Router } from "express";
import { AuthRouters } from "../modules/user/user.route";
import { DriverRouters } from "../modules/driver/driver.route";

const router = Router()

router.use("/v1/auth",AuthRouters)
router.use("/v1/driver",DriverRouters)


export const IndexRouter=router