import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { BusCreateInput, BusUpdateInput } from "./bus.interface";

const ensureUniqueBusFields = async (
  busNumber?: string,
  registrationNumber?: string,
  excludeId?: string
) => {
  if (busNumber) {
    const busNumberExist = await prisma.bus.findFirst({
      where: {
        busNumber
      },
    });
    if (busNumberExist) {
      throw new AppError(status.CONFLICT, "Bus number already exists, must be unique");
    }
  }

  if (registrationNumber) {
    const regNumberExist = await prisma.bus.findFirst({
      where: {
        registrationNumber,
      },
    });
    if (regNumberExist) {
      throw new AppError(status.CONFLICT, "Registration number already exists, must be unique");
    }
  }
};

const createBus = async (payload: BusCreateInput,from: string,to: string) => {
  const registrationNumber = `BUS-${Date.now()}`;
  await ensureUniqueBusFields(payload.busNumber,registrationNumber);

  const routeExist = await prisma.route.findFirst({ where: {from_city:from,to_city:to} });
  if (!routeExist) {
    throw new AppError(status.NOT_FOUND, "Route not found");
  }

  const driverExist = await prisma.driver.findUnique({ where: { licenseNumber: payload.licenseNumber } });

  if (!driverExist) {
      throw new AppError(status.NOT_FOUND, "Driver not found");
    }

  const result = await prisma.bus.create({
    data: {
      ...payload,
      totalSeats: Number(payload.totalSeats),
      routeId: routeExist.id,
      licenseNumber:driverExist.licenseNumber,
      registrationNumber: registrationNumber,
    },
  });

  return result;
};

const getAllBuses = async () => {
  const result = await prisma.bus.findMany({
    include: {
      driver: true,
      route: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getSingleBus = async (id: string) => {
  const result = await prisma.bus.findUnique({
    where: { id },
    include: {
      driver: true,
      route: true,
      seats: true,
      schedules: true,
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Bus not found");
  }

  return result;
};
const deleteBus = async (id: string) => {
  const busExist = await prisma.bus.findUnique({ where: { id } });
  if (!busExist) {
    throw new AppError(status.NOT_FOUND, "Bus not found");
  }

  const result = await prisma.bus.delete({
    where: { id },
  });

  return result;
};

export const BusService = {
  createBus,
  getAllBuses,
  getSingleBus,
  deleteBus,
};