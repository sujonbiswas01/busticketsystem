import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";
import { createDriverSchema, updateDriverSchema } from "./driver.validation";
import { driverController } from "./driver.controller";
import auth from "../../middleware/Auth";
import { Role } from "../../../generated/prisma/browser";

const router = Router();

router.post(
  "/",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(createDriverSchema),
  driverController.createDriver
);

router.get(
  "/",
  auth([Role.ADMIN, Role.MANAGER]),
  driverController.getAllDrivers
);

router.get(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER]),
  driverController.getSingleDriver
);

router.patch(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(updateDriverSchema),
  driverController.updateDriver
);

router.delete(
  "/:id",
  auth([Role.ADMIN]),
  driverController.deleteDriver
);

export const DriverRouters = router;