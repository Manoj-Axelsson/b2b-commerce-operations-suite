/*
  Warnings:

  - Changed the type of `type` on the `OrderAdjustment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "OrderAdjustment" DROP COLUMN "type",
ADD COLUMN     "type" "AdjustmentType" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "createdBy" DROP NOT NULL;
