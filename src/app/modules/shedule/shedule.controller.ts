import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ScheduleService } from "./shedule.service";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body};
    const { registrationNumber, from, to } = req.query;
    console.log(registrationNumber,from,to,payload,"register")
  const result = await ScheduleService.createSchedule(payload, registrationNumber as string, from as string, to as string);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
    const { from, to, date } = req.query;
  const result = await ScheduleService.getAllSchedules(from as string, to as string, date);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Schedules retrieved successfully",
    data: result,
  });
});

const getSingleSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ScheduleService.getSingleSchedule(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const { registrationNumber, from, to } = req.body;
  const result = await ScheduleService.updateSchedule(id as string, payload, registrationNumber as string, from as string, to as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Schedule updated successfully",
    data: result,
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ScheduleService.deleteSchedule(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const scheduleController = {
  createSchedule,
  getAllSchedules,
  getSingleSchedule,
  updateSchedule,
  deleteSchedule,
};