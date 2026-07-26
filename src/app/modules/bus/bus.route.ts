import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";
import { createBusSchema, updateBusSchema } from "./bus.validation";
import { busController } from "./bus.controller";
import auth from "../../middleware/Auth";
import { Role } from "../../../generated/prisma/browser";

const router = Router();

router.post(
  "/",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(createBusSchema),
  busController.createBus
);

router.get(
  "/",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  busController.getAllBuses
);

router.get(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  busController.getSingleBus
);

router.delete(
  "/:id",
  auth([Role.ADMIN]),
  busController.deleteBus
);

export const BusRouters = router;