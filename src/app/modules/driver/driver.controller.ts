import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DriverService } from "./driver.service";

const createDriver = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  const result = await DriverService.createDriver(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Driver created successfully",
    data: result,
  });
});

const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
  const result = await DriverService.getAllDrivers();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Drivers retrieved successfully",
    data: result,
  });
});

const getSingleDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DriverService.getSingleDriver(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Driver retrieved successfully",
    data: result,
  });
});

const updateDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const result = await DriverService.updateDriver(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Driver updated successfully",
    data: result,
  });
});

const deleteDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DriverService.deleteDriver(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Driver deleted successfully",
    data: result,
  });
});

export const driverController = {
  createDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriver,
  deleteDriver,
};