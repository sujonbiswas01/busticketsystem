import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";

import { IRequestUser } from "../../interface/requestuser.interface";
import { uuidv6 } from "zod";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";

const createBooking = async (user: IRequestUser, bus_id: string, seatNumber: string[],scheduletime:string) => {
  const userExist = await prisma.user.findUnique({ where: { email: user.email } });
  if (!userExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  //  await prisma.booking.deleteMany({
  //   where:{
  //     payment_status:"PENDING",
  //     booking_status:"PENDING",
  //   }
  // })

  const busExist = await prisma.bus.findUnique({
    where: { id: bus_id },
    include: {
      driver: true,
      route: true,
      seats: true,
      schedules: true,
    },
  });
  if (!busExist) {
    throw new AppError(status.NOT_FOUND, "Bus not found");
  }

  const seatExist = await prisma.seat.findMany({
    where: {
      registration_Number: busExist.registrationNumber,
      seat_number: {
        in: seatNumber,
      },
      status: "AVAILABLE",
    },
  });

  console.log(seatExist,"seat")

  if(!seatExist){
    throw new AppError(status.NOT_FOUND, "Selected seats not found");
  }

  if (seatExist.length !== seatNumber.length) {
    throw new AppError(status.BAD_REQUEST, "One or more selected seats are not available");
  }

  const seatlength = seatExist.length;
  const totalPrice = seatlength * Number(busExist.route.base_price);

  const seatById = new Map(seatExist.map((seat) => [seat.id, seat] as const));

 const scheduleExist = busExist.schedules.find((schedule) => schedule.time === scheduletime);

  if (!scheduleExist) {
    throw new AppError(status.NOT_FOUND, "Schedule not found for the selected time");
  }

  const scheduleId = scheduleExist.id;


  const result = await prisma.$transaction(async (tx) => {
    const resultbooking = await prisma.booking.create({
      data: {
        user_id: userExist.id,
        schedule_id: scheduleId,
        total_price: totalPrice,
        Bookingseats: {
          createMany: {
            data: seatExist.map((seat1) => {
              const seat = seatById.get(seat1.id)
              return {
                seat_id: seat?.id as string,
              }
            })
          }
        }
      },
    });

    
    const transactionId = String(uuidv6());
    console.log(transactionId,"disdf")

    const paymentData = await tx.payment.create({
      data: {
        booking_id: resultbooking.id,
        transaction_id: String(uuidv6()),
        payment_status: "PENDING",
        amount: totalPrice,
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
            unit_amount: totalPrice * 100,
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

  if(session.payment_status === "paid"){
      const updated = await tx.seat.updateMany({
      where: {
        id: {
          in: seatExist.map((seat) => seat.id),
        },
      },
      data: {
        status: "BOOKED",
      },
    });

    if (updated.count !== seatExist.length) {
  throw new AppError(409, "Some seats were booked by another user");
}
  }

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