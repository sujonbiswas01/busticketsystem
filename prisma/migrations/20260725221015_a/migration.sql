/*
  Warnings:

  - You are about to drop the column `license_number` on the `drivers` table. All the data in the column will be lost.
  - The required column `licenseNumber` was added to the `drivers` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "license_number",
ADD COLUMN     "licenseNumber" TEXT NOT NULL;
