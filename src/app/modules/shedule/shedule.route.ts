import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";
import auth from "../../middleware/Auth";
import { Role } from "../../../generated/prisma/browser";
import { createScheduleSchema, updateScheduleSchema } from "./shedule.validation";
import { scheduleController } from "./shedule.controller";

const router = Router();

router.post(
  "/",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(createScheduleSchema),
  scheduleController.createSchedule
);

router.get(
  "/",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  scheduleController.getAllSchedules
);

router.get(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  scheduleController.getSingleSchedule
);

router.patch(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(updateScheduleSchema),
  scheduleController.updateSchedule
);

router.delete(
  "/:id",
  auth([Role.ADMIN]),
  scheduleController.deleteSchedule
);

export const ScheduleRouters = router;