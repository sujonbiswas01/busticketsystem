import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";

import { IRequestUser } from "../../interface/requestuser.interface";
import { uuidv6 } from "zod";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";

const createBooking = async (user: IRequestUser, bus_id: string) => {
  const userExist = await prisma.user.findUnique({ where: { email: user.email } });
  if (!userExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const busExist = await prisma.bus.findUnique({ where: { id: bus_id },
  
  include: {
      driver: true,
      route: true,
      seats: true,
      schedules: true,
    }, });
  if (!busExist) {
    throw new AppError(status.NOT_FOUND, "Bus not found");
  }

  const seatExist = await prisma.seat.findFirst({
    where: {
      registration_Number: busExist.registrationNumber,
      status: "AVAILABLE",
    },
  });
  if (!seatExist) {
    throw new AppError(status.NOT_FOUND, "No available seats for this bus");
  }

  const result = await prisma.$transaction(async (tx) => {
    const resultbooking = await prisma.booking.create({
      data: {
        user_id: userExist.id,
        schedule_id: busExist.id,
        seat_id: seatExist.id,
        total_price: Number(busExist.route.base_price),
      },
    });

     const transactionId = String(uuidv6());

     const paymentData = await tx.payment.create({
      data: {
        booking_id: resultbooking.id,
        transaction_id: transactionId,
        amount: Number(busExist.route.base_price),
        user_id: userExist.id,
        bus_id: busExist.id,
      },
    });

     const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Ticket for ${busExist.busName} from ${busExist.route.from_city} to ${busExist.route.to_city}`,
            },
            unit_amount:  Number(busExist.route.base_price) * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: resultbooking.id,
        paymentId: paymentData.id
      },
      payment_intent_data: {
        metadata: {
          bookingId: resultbooking.id,
          paymentId: paymentData.id,
        },
      },
      success_url: `${envVars.FRONTEND_URL}/payment/${busExist.id}?bookingId=${resultbooking.id}&paymentId=${paymentData.id}`,
      cancel_url: `${envVars.FRONTEND_URL}/payment/${busExist.id}?bookingId=${resultbooking.id}&paymentId=${paymentData.id}`,
    });
    return {
      resultbooking,
      paymentData,
      paymentUrl: session.url,
    };

  });
  return {
    booking: result.resultbooking,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl,
  };



};

const getAllBookings = async () => {
  const result = await prisma.booking.findMany({
    include: {
      user: true,
      seat: true,
      payment: true,
    },
    orderBy: { created_at: "desc" },
  });

  return result;
};

const getSingleBooking = async (id: string) => {
  const result = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      seat: true,
      payment: true,
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  return result;
};

const getMyBookings = async (userId: string) => {
  const result = await prisma.booking.findMany({
    where: { user_id: userId },
    include: {
      seat: true,
      payment: true,
    },
    orderBy: { created_at: "desc" },
  });

  return result;
};

const updateBookingStatus = async (id: string, payload: any) => {
  const bookingExist = await prisma.booking.findUnique({ where: { id } });
  if (!bookingExist) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  const result = await prisma.booking.update({
    where: { id },
    data: payload,
  });

  return result;
};

const cancelBooking = async (id: string, userId: string) => {
  const bookingExist = await prisma.booking.findUnique({ where: { id } });
  if (!bookingExist) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (bookingExist.user_id !== userId) {
    throw new AppError(status.FORBIDDEN, "You can only cancel your own booking");
  }

  if (bookingExist.booking_status === "CANCELLED") {
    throw new AppError(status.BAD_REQUEST, "This booking is already cancelled");
  }

  const result = await prisma.booking.update({
    where: { id },
    data: { booking_status: "CANCELLED" },
  });

  return result;
};

export const BookingService = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getMyBookings,
  updateBookingStatus,
  cancelBooking,
};