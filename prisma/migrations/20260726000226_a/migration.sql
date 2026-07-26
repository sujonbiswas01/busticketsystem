/*
  Warnings:

  - You are about to alter the column `total_seats` on the `buses` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "buses" ALTER COLUMN "total_seats" SET DATA TYPE INTEGER;
