// service for payment module

import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
const deleteParticipantAndPayment = async (
  bookingId?: string,
  paymentId?: string,
) => {
  if (!bookingId || !paymentId) {
    console.error("Missing bookingId or paymentId in session metadata");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: { id: paymentId },
    });

    await tx.booking.deleteMany({
      where: { id: bookingId },
    });
  });

  console.log(
    `Payment failed. Deleted booking ${bookingId} and payment ${paymentId}`,
  );
};


const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });
  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;

      console.log(bookingId,paymentId,session,"se")

      if (!bookingId || !paymentId) {
        console.error("Missing bookingId or paymentId in session metadata");
        return {
          message: "Missing bookingId or paymentId in session metadata",
        };
      }

      const participant = await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
      });
      if (!participant) {
        console.error(`Booking with id ${bookingId} not found`);
        return { message: `Booking with id ${bookingId} not found` };
      }

       await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: {
            id: bookingId,
          },
          data: {
            payment_status: PaymentStatus.PAID,
          },
        });

        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            stripeEventId: event.id,
            payment_status: PaymentStatus.PAID,
            paymentGatewayData: session as any,
          },
        });
      });
      

      if (session.payment_status !== "paid") {
        await deleteParticipantAndPayment(bookingId, paymentId);
        break;
      }

     

      console.log(
        `Processed checkout.session.completed for booking ${bookingId} and payment ${paymentId}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;
      await deleteParticipantAndPayment(bookingId, paymentId);
      break;
    }

    case "payment_intent.succeeded": {
      const session = event.data.object;
      console.log(
        `Payment intent ${session.id} succeeded.`,
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      const participantId = session.metadata?.participantId;
      const paymentId = session.metadata?.paymentId;
      await deleteParticipantAndPayment(participantId, paymentId);
      break;
    }
    case "checkout.session.async_payment_failed":{
      const session = event.data.object;
      const participantId = session.metadata?.participantId;
      const paymentId = session.metadata?.paymentId;
      await deleteParticipantAndPayment(participantId, paymentId);
      break;
    }
    case "payment_intent.canceled":{
      const session = event.data.object;
      const participantId = session.metadata?.participantId;
      const paymentId = session.metadata?.paymentId;

      await deleteParticipantAndPayment(participantId, paymentId);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return {message : `Webhook Event ${event.id} processed successfully`}
};


export const PaymentService = {
    handlerStripeWebhookEvent
}