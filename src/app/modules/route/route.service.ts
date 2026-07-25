import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { RouteCreateInput, RouteUpdateInput } from "./route.interface";

const createRoute = async (payload: RouteCreateInput) => {

  const routeExist = await prisma.route.findFirst({
    where: {
      from_city: payload.from_city,
      to_city: payload.to_city,
    },
  });

  if (routeExist) {
    throw new AppError(status.CONFLICT, "A route with this from_city and to_city already exists");
  }

  const result = await prisma.route.create({
    data: {
      ...payload,
      base_price: Number(payload.base_price),
    },
  });

  return result;
};

const getAllRoutes = async () => {
  const result = await prisma.route.findMany({
    orderBy: { created_at: "desc" },
  });
  return result;
};

const getSingleRoute = async (id: string) => {
  const result = await prisma.route.findUnique({
    where: { id },
    include: {
      buses: true,
      schedules: true,
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Route not found");
  }

  return result;
};

const updateRoute = async (id: string, payload: RouteUpdateInput) => {
  const routeExist = await prisma.route.findUnique({ where: { id } });
  if (!routeExist) {
    throw new AppError(status.NOT_FOUND, "Route not found");
  }

  if (payload.from_city || payload.to_city) {
    const duplicate = await prisma.route.findFirst({
      where: {
        from_city: payload.from_city ?? routeExist.from_city,
        to_city: payload.to_city ?? routeExist.to_city,
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new AppError(status.CONFLICT, "A route with this from_city and to_city already exists");
    }
  }

  const result = await prisma.route.update({
    where: { id },
    data: {
      ...payload,
      ...(payload.base_price !== undefined ? { base_price: Number(payload.base_price) } : {}),
    },
  });

  return result;
};

const deleteRoute = async (id: string) => {
  const routeExist = await prisma.route.findUnique({ where: { id } });
  if (!routeExist) {
    throw new AppError(status.NOT_FOUND, "Route not found");
  }
  const result = await prisma.route.delete({
    where: { id },
  });

  return result;
};

export const RouteService = {
  createRoute,
  getAllRoutes,
  getSingleRoute,
  updateRoute,
  deleteRoute,
};