-- AlterTable
ALTER TABLE "order" ALTER COLUMN "subtotalPrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_item" ALTER COLUMN "lineTotal" DROP NOT NULL;
