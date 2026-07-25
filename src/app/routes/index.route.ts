import { Router } from "express";
import { AuthRouters } from "../modules/user/user.route";
import { DriverRouters } from "../modules/driver/driver.route";
import { BusRouters } from "../modules/bus/bus.route";

const router = Router()

router.use("/v1/auth",AuthRouters)
router.use("/v1/driver",DriverRouters)
router.use("/v1/bus", BusRouters);

export const IndexRouter=router