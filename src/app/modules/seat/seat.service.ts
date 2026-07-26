import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { SeatCreateInput, SeatUpdateInput } from "./seat.interface";
import { IRequestUser } from "../../interface/requestuser.interface";

const createSeat = async (payload: SeatCreateInput,user:IRequestUser) => {
  const busExist = await prisma.bus.findUnique({
    where: { registrationNumber: payload.registration_Number },
  });
  if (!busExist) {
    throw new AppError(status.NOT_FOUND, "Bus not found with this registration number");
  }
  const seatExist = await prisma.seat.findFirst({
    where: {
      registration_Number: payload.registration_Number,
      seat_number: payload.seat_number,
    },
  });
  if (seatExist) {
    throw new AppError(status.CONFLICT, "This seat number already exists for this bus");
  }
  const userExist = await prisma.user.findUnique({ where: { email: user.email } });
  if(!userExist){
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  const result = await prisma.seat.create({
    data: {
      ...payload,
      user_id: userExist.id,
    },
  });

  return result;
};

const getAllSeats = async () => {
  const result = await prisma.seat.findMany({
    include: {
      bus: true,
      user: true,
      booking: true,
    },
  });
  return result;
};

const getSingleSeat = async (id: string) => {
  const result = await prisma.seat.findUnique({
    where: { id },
    include: {
      bus: true,
      user: true,
      booking: true,
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Seat not found");
  }

  return result;
};

const getSeatsByBus = async (registration_Number: string) => {
  const busExist = await prisma.bus.findUnique({
    where: { registrationNumber: registration_Number },
  });
  if (!busExist) {
    throw new AppError(status.NOT_FOUND, "Bus not found with this registration number");
  }

  const result = await prisma.seat.findMany({
    where: { registration_Number },
    orderBy: { seat_number: "asc" },
  });

  return result;
};

const updateSeat = async (id: string, payload: SeatUpdateInput,user:IRequestUser) => {
  const seatExist = await prisma.seat.findUnique({ where: { id } });
  if (!seatExist) {
    throw new AppError(status.NOT_FOUND, "Seat not found");
  }

  if (payload.registration_Number) {
    const busExist = await prisma.bus.findUnique({
      where: { registrationNumber: payload.registration_Number },
    });
    if (!busExist) {
      throw new AppError(status.NOT_FOUND, "Bus not found with this registration number");
    }
  }

  if (payload.seat_number) {
    const duplicate = await prisma.seat.findFirst({
      where: {
        registration_Number: payload.registration_Number ?? seatExist.registration_Number,
        seat_number: payload.seat_number,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw new AppError(status.CONFLICT, "This seat number already exists for this bus");
    }
  }

    const userExist = await prisma.user.findUnique({ where: { email: user.email } });
    if(!userExist){
        throw new AppError(status.NOT_FOUND, "User not found");
    }


  const result = await prisma.seat.update({
    where: { id },
    data: {
      ...payload,
      user_id: userExist.id,
    },
  });

  return result;
};

const deleteSeat = async (id: string) => {
  const seatExist = await prisma.seat.findUnique({
    where: { id },
    include: { booking: true },
  });

  if (!seatExist) {
    throw new AppError(status.NOT_FOUND, "Seat not found");
  }

  if (seatExist.booking) {
    throw new AppError(status.BAD_REQUEST, "Cannot delete seat, an active booking exists for this seat");
  }

  const result = await prisma.seat.delete({
    where: { id },
  });

  return result;
};

export const SeatService = {
  createSeat,
  getAllSeats,
  getSingleSeat,
  getSeatsByBus,
  updateSeat,
  deleteSeat,
};