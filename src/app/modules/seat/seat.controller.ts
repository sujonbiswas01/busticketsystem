import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { SeatService } from "./seat.service";

const createSeat = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  const user=req.user
    if (!user) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ success: false, message: "you are unauthorized" });
    }

  const result = await SeatService.createSeat(payload,user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Seat created successfully",
    data: result,
  });
});

const getAllSeats = catchAsync(async (req: Request, res: Response) => {
  const result = await SeatService.getAllSeats();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Seats retrieved successfully",
    data: result,
  });
});

const getSingleSeat = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SeatService.getSingleSeat(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Seat retrieved successfully",
    data: result,
  });
});

const getSeatsByBus = catchAsync(async (req: Request, res: Response) => {
  const { registrationNumber } = req.params;
  const result = await SeatService.getSeatsByBus(registrationNumber as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Seats retrieved successfully for this bus",
    data: result,
  });
});

const updateSeat = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = { ...req.body };
   const user=req.user
    if (!user) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ success: false, message: "you are unauthorized" });
    }

  const result = await SeatService.updateSeat(id as string, payload, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Seat updated successfully",
    data: result,
  });
});

const deleteSeat = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SeatService.deleteSeat(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Seat deleted successfully",
    data: result,
  });
});

export const seatController = {
  createSeat,
  getAllSeats,
  getSingleSeat,
  getSeatsByBus,
  updateSeat,
  deleteSeat,
};