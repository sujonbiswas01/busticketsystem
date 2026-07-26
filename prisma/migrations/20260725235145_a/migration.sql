/*
  Warnings:

  - You are about to drop the column `Driver_id` on the `buses` table. All the data in the column will be lost.
  - You are about to alter the column `base_price` on the `routes` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "buses" DROP CONSTRAINT "buses_Driver_id_fkey";

-- AlterTable
ALTER TABLE "buses" DROP COLUMN "Driver_id",
ADD COLUMN     "licenseNumber" TEXT;

-- AlterTable
ALTER TABLE "routes" ALTER COLUMN "base_price" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_licenseNumber_fkey" FOREIGN KEY ("licenseNumber") REFERENCES "drivers"("licenseNumber") ON DELETE CASCADE ON UPDATE CASCADE;
