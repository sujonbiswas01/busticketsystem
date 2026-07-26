import { Router } from "express";
import { AuthRouters } from "../modules/user/user.route";
import { DriverRouters } from "../modules/driver/driver.route";
import { BusRouters } from "../modules/bus/bus.route";
import { RouteRouters } from "../modules/route/route.route";
import { SeatRouters } from "../modules/seat/seat.route";

const router = Router()

router.use("/v1/auth",AuthRouters)
router.use("/v1/driver",DriverRouters)
router.use("/v1/bus", BusRouters);
router.use("/v1/route", RouteRouters);
router.use("/v1/seat", SeatRouters);

export const IndexRouter=router