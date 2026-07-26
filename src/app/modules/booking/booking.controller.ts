import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { BookingService } from "./booking.service";
import AppError from "../../errorHelper/AppError";

const createBooking = catchAsync(async (req: Request, res: Response) => {
   const user=req.user
    if (!user) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ success: false, message: "you are unauthorized" });
    }
  const {bus_id} = req.params
  const result = await BookingService.createBooking(user, bus_id as string);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Seat booked successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookings();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.getSingleBooking(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(status.UNAUTHORIZED, "Please login first");
  }

  const user=req.user
    if (!user) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ success: false, message: "you are unauthorized" });
    }

  const result = await BookingService.getMyBookings(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Your bookings retrieved successfully",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const result = await BookingService.updateBookingStatus(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(status.UNAUTHORIZED, "Please login first");
  }

  const { id } = req.params;
  const user=req.user
    if (!user) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ success: false, message: "you are unauthorized" });
    }

  const result = await BookingService.cancelBooking(id as string, user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getMyBookings,
  updateBookingStatus,
  cancelBooking,
};