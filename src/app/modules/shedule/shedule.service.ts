import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { ScheduleCreateInput, ScheduleUpdateInput } from "./shedule.interface";
import { parseDateForPrisma } from "../../utils/parseDate";
import { ScheduleWhereInput } from "../../../generated/prisma/models";

const ensureNoScheduleConflict = async (
  bus_id: string,
  date: Date,
  time: string,
  excludeId?: string
) => {
  const conflict = await prisma.schedule.findFirst({
    where: {
      bus_id,
      date,
      time,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });

  if (conflict) {
    throw new AppError(
      status.CONFLICT,
      "This bus is already scheduled for the same date and time"
    );
  }
};

const createSchedule = async (payload: ScheduleCreateInput,registrationNumber:string,from:string,to:string) => {

    const busExist = await prisma.bus.findUnique({ where: { registrationNumber } });
  if (!busExist) {
    throw new AppError(status.NOT_FOUND, "Bus not found");
  }

  const routeExist = await prisma.route.findFirst({ where: { from_city:from, to_city:to } });
  if (!routeExist) {
    throw new AppError(status.NOT_FOUND, "Route not found");
  }

  await ensureNoScheduleConflict(busExist.id, payload.date as any, payload.time as any);

  if(busExist.status === "ACTIVE"){ 
    throw new AppError(status.CONFLICT, "This bus is already active and scheduled for another route.");
  }



  const result = await prisma.schedule.create({
    data: {
        ...payload,
        bus_id: busExist.id,
        route_id: routeExist.id,
    },

  });
  if(result.bus_id === busExist.id){
    await prisma.bus.update({
      where: { id: busExist.id },
      data: { status: "ACTIVE" },
    });
  }

  return result;
};

const getAllSchedules = async (from:string,to:string,date:any) => {
      const andConditions: ScheduleWhereInput[] | ScheduleWhereInput  = [];

      if (date) {
      const dateRange = parseDateForPrisma(date);
      andConditions.push({date: dateRange});
    }

  const result = await prisma.schedule.findMany({
    where:{
        AND:andConditions,
      route: {
        from_city: from,
        to_city: to
      }
    },
    include: {
      bus: true,
      route: true,
    },
    orderBy: { date: "asc" },
  });

  return result;
};

const getSingleSchedule = async (id: string) => {
  const result = await prisma.schedule.findUnique({
    where: { id },
    include: {
      bus: true,
      route: true,
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Schedule not found");
  }

  return result;
};

const updateSchedule = async (id: string, payload: ScheduleUpdateInput,registrationNumber:string,from:string,to:string) => {
  const scheduleExist = await prisma.schedule.findUnique({ where: { id } });
  if (!scheduleExist) {
    throw new AppError(status.NOT_FOUND, "Schedule not found");
  }

      const busExist = await prisma.bus.findUnique({ where: { registrationNumber } });;
  if (!busExist) {
    throw new AppError(status.NOT_FOUND, "Bus not found");
  }

  
  const routeExist = await prisma.route.findFirst({ where: { from_city:from, to_city:to } });
  if (!routeExist) {
    throw new AppError(status.NOT_FOUND, "Route not found");
  }

  const result = await prisma.schedule.update({
    where: { id },
    data: {
      ...payload
    },
  });

  return result;
};

const deleteSchedule = async (id: string) => {
  const scheduleExist = await prisma.schedule.findUnique({ where: { id } });
  if (!scheduleExist) {
    throw new AppError(status.NOT_FOUND, "Schedule not found");
  }

  const result = await prisma.schedule.delete({
    where: { id },
  });

  return result;
};

export const ScheduleService = {
  createSchedule,
  getAllSchedules,
  getSingleSchedule,
  updateSchedule,
  deleteSchedule,
};