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

const createBus = async (payload: BusCreateInput) => {
  await ensureUniqueBusFields(payload.busNumber, payload.registrationNumber);

  const routeExist = await prisma.route.findUnique({ where: { id: payload.routeId } });
  if (!routeExist) {
    throw new AppError(status.NOT_FOUND, "Route not found");
  }

  if (payload.driverId) {
    const driverExist = await prisma.driver.findUnique({ where: { id: payload.driverId } });
    if (!driverExist) {
      throw new AppError(status.NOT_FOUND, "Driver not found");
    }
  }

  const result = await prisma.bus.create({
    data: {
      ...payload,
      totalSeats: BigInt(payload.totalSeats),
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
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Bus not found");
  }

  return result;
};

const updateBus = async (id: string, payload: BusUpdateInput) => {
  const busExist = await prisma.bus.findUnique({ where: { id } });
  if (!busExist) {
    throw new AppError(status.NOT_FOUND, "Bus not found");
  }

  await ensureUniqueBusFields(payload.busNumber, payload.registrationNumber, id);

  if (payload.routeId) {
    const routeExist = await prisma.route.findUnique({ where: { id: payload.routeId } });
    if (!routeExist) {
      throw new AppError(status.NOT_FOUND, "Route not found");
    }
  }

  if (payload.driverId) {
    const driverExist = await prisma.driver.findUnique({ where: { id: payload.driverId } });
    if (!driverExist) {
      throw new AppError(status.NOT_FOUND, "Driver not found");
    }
  }

  const result = await prisma.bus.update({
    where: { id },
    data: {
      ...payload,
      ...(payload.totalSeats !== undefined ? { totalSeats: BigInt(payload.totalSeats) } : {}),
    },
  });

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
  updateBus,
  deleteBus,
};