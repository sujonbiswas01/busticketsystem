/*
  Warnings:

  - You are about to drop the column `seat_id` on the `bookings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_seat_id_fkey";

-- DropIndex
DROP INDEX "bookings_seat_id_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "seat_id";

-- CreateTable
CREATE TABLE "bookingseats" (
    "id" TEXT NOT NULL,
    "seat_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookingseats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookingseats" ADD CONSTRAINT "bookingseats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingseats" ADD CONSTRAINT "bookingseats_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
