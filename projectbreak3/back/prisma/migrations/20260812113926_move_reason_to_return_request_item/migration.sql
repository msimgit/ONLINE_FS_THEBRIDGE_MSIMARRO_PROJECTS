/*
  Warnings:

  - You are about to drop the column `reason` on the `ReturnRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReturnRequest" DROP COLUMN "reason";

-- AlterTable
ALTER TABLE "ReturnRequestItem" ADD COLUMN     "reason" TEXT;
