import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";
import { createRouteSchema, updateRouteSchema } from "./route.validation";
import { routeController } from "./route.controller";
import auth from "../../middleware/Auth";
import { Role } from "../../../generated/prisma/browser";

const router = Router();

router.post(
  "/",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(createRouteSchema),
  routeController.createRoute
);

router.get(
  "/",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  routeController.getAllRoutes
);

router.get(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  routeController.getSingleRoute
);

router.patch(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(updateRouteSchema),
  routeController.updateRoute
);

router.delete(
  "/:id",
  auth([Role.ADMIN]),
  routeController.deleteRoute
);

export const RouteRouters = router;