import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { BusService } from "./bus.service";

const createBus = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  const result = await BusService.createBus(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Bus created successfully",
    data: result,
  });
});

const getAllBuses = catchAsync(async (req: Request, res: Response) => {
  const result = await BusService.getAllBuses();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Buses retrieved successfully",
    data: result,
  });
});

const getSingleBus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BusService.getSingleBus(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bus retrieved successfully",
    data: result,
  });
});

const updateBus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const result = await BusService.updateBus(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bus updated successfully",
    data: result,
  });
});

const deleteBus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BusService.deleteBus(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bus deleted successfully",
    data: result,
  });
});

export const busController = {
  createBus,
  getAllBuses,
  getSingleBus,
  updateBus,
  deleteBus,
};