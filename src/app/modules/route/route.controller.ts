import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { RouteService } from "./route.service";

const createRoute = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  const result = await RouteService.createRoute(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Route created successfully",
    data: result,
  });
});

const getAllRoutes = catchAsync(async (req: Request, res: Response) => {
  const result = await RouteService.getAllRoutes();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Routes retrieved successfully",
    data: result,
  });
});

const getSingleRoute = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RouteService.getSingleRoute(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Route retrieved successfully",
    data: result,
  });
});

const updateRoute = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const result = await RouteService.updateRoute(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Route updated successfully",
    data: result,
  });
});

const deleteRoute = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RouteService.deleteRoute(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Route deleted successfully",
    data: result,
  });
});

export const routeController = {
  createRoute,
  getAllRoutes,
  getSingleRoute,
  updateRoute,
  deleteRoute,
};