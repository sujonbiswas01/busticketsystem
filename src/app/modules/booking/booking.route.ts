import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";

import { bookingController } from "./booking.controller";
import auth from "../../middleware/Auth";
import { Role } from "../../../generated/prisma/browser";

const router = Router();

router.post(
  "/:bus_id",
  auth([Role.USER, Role.ADMIN, Role.MANAGER]),
  bookingController.createBooking
);

router.get(
  "/",
  auth([Role.ADMIN, Role.MANAGER]),
  bookingController.getAllBookings
);

router.get(
  "/me",
  auth([Role.USER, Role.ADMIN, Role.MANAGER]),
  bookingController.getMyBookings
);

router.get(
  "/:id",
  auth([Role.USER, Role.ADMIN, Role.MANAGER]),
  bookingController.getSingleBooking
);

router.patch(
  "/:id/status",
  auth([Role.ADMIN, Role.MANAGER]),
  bookingController.updateBookingStatus
);

router.patch(
  "/:id/cancel",
  auth([Role.USER, Role.ADMIN, Role.MANAGER]),
  bookingController.cancelBooking
);

export const BookingRouters = router;