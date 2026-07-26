/*
  Warnings:

  - You are about to alter the column `total_price` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - A unique constraint covering the columns `[seat_number]` on the table `seats` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "total_price" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "seats_seat_number_key" ON "seats"("seat_number");
