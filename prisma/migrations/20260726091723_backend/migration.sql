/*
  Warnings:

  - You are about to drop the column `bus_id` on the `seats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registration_number]` on the table `buses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `registration_Number` to the `seats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "seats" DROP CONSTRAINT "seats_bus_id_fkey";

-- AlterTable
ALTER TABLE "seats" DROP COLUMN "bus_id",
ADD COLUMN     "registration_Number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "buses_registration_number_key" ON "buses"("registration_number");

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_registration_Number_fkey" FOREIGN KEY ("registration_Number") REFERENCES "buses"("registration_number") ON DELETE CASCADE ON UPDATE CASCADE;
