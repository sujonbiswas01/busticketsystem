import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { DriverCreateInput, DriverUpdateInput } from "./driver.interface";

const createDriver = async (payload: DriverCreateInput) => {
  const driverExist = await prisma.driver.findUnique({
    where: { licenseNumber: payload.licenseNumber },
  });

  if (driverExist) {
    throw new AppError(status.CONFLICT, "Driver with this license number already exists");
  }

  const result = await prisma.driver.create({
    data: payload,
  });

  return result;
};

const getAllDrivers = async () => {
  const result = await prisma.driver.findMany({
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getSingleDriver = async (id: string) => {
  const result = await prisma.driver.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Driver not found");
  }

  return result;
};

const updateDriver = async (id: string, payload: DriverUpdateInput) => {
  const driverExist = await prisma.driver.findUnique({ where: { id } });

  if (!driverExist) {
    throw new AppError(status.NOT_FOUND, "Driver not found");
  }

  // if licenseNumber is being changed, check for duplicate
  if (payload.licenseNumber) {
    const duplicate = await prisma.driver.findFirst({
      where: {
        licenseNumber: payload.licenseNumber,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw new AppError(status.CONFLICT, "This license number is already used by another driver");
    }
  }

  const result = await prisma.driver.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteDriver = async (id: string) => {
  const driverExist = await prisma.driver.findUnique({ where: { id } });

  if (!driverExist) {
    throw new AppError(status.NOT_FOUND, "Driver not found");
  }

  const result = await prisma.driver.delete({
    where: { id },
  });

  return result;
};

export const DriverService = {
  createDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriver,
  deleteDriver,
};