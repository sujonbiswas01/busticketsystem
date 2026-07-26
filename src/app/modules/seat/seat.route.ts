import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";
import { createSeatSchema, updateSeatSchema } from "./seat.validation";
import { seatController } from "./seat.controller";
import auth from "../../middleware/Auth";
import { Role } from "../../../generated/prisma/browser";

const router = Router();

router.post(
  "/",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(createSeatSchema),
  seatController.createSeat
);

router.get(
  "/",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  seatController.getAllSeats
);

router.get(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  seatController.getSingleSeat
);

router.get(
  "/bus/:registrationNumber",
  auth([Role.ADMIN, Role.MANAGER, Role.USER]),
  seatController.getSeatsByBus
);

router.patch(
  "/:id",
  auth([Role.ADMIN, Role.MANAGER]),
  validateRequest(updateSeatSchema),
  seatController.updateSeat
);

router.delete(
  "/:id",
  auth([Role.ADMIN]),
  seatController.deleteSeat
);

export const SeatRouters = router;