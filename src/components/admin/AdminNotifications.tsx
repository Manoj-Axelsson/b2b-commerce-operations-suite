// Server Component — runs all notification queries and passes counts to the
// client dropdown. Keeping the Prisma calls here avoids any client-side
// data fetching and ensures counts are always fresh on each navigation.

import prisma from "@/lib/prisma";
import { AdminNotificationsDropdown, NotificationCounts } from "./AdminNotificationsDropdown";

// --- Date helpers ---

const getNow = (): Date => new Date();

const getIn24Hours = (): Date => {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d;
};

const getIn3Days = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d;
};

// --- Query helpers ---

// Low stock: quantity <= minQuantity
// Prisma doesn't support field-to-field comparisons in where clauses,
// so we fetch all non-deleted products and filter in JS.
// The inventory dataset is small so this is acceptable.
const countLowStockProducts = async (): Promise<number> => {
  // Use a targeted selection to minimize data transfer
  const products = await prisma.product.findMany({
    where: { isDeleted: false, isActive: true },
    select: { quantity: true, minQuantity: true },
  });

  // Since Prisma doesn't support field-to-field comparison directly in the where clause 
  // without raw queries, we filter in JS but keep the payload tiny.
  return products.filter((p) => p.quantity <= p.minQuantity).length;
};

// Pending member approvals (non-admin users who haven't been approved yet)
const countPendingApprovals = async (): Promise<number> => {
  return prisma.user.count({
    where: {
      isApproved: false,
      role: { not: "admin" },
    },
  });
};

// Detailed info for promotions
export interface DetailedPromotionAlert {
  productId: string;
  productName: string;
  articleNo: string;
  eventType: 'STARTING' | 'ENDING';
  discountType: string;
}

// Promotions starting within the next 24 hours
const getPromotionsStartingSoon = async (): Promise<DetailedPromotionAlert[]> => {
  const now = getNow();
  const in24h = getIn24Hours();

  const products = await prisma.product.findMany({
    where: {
      isDeleted: false,
      discountStart: { gte: now, lte: in24h },
    },
    select: { id: true, name: true, articleNo: true, discountType: true },
  });

  return products.map(p => ({
    productId: p.id,
    productName: p.name,
    articleNo: p.articleNo,
    eventType: 'STARTING',
    discountType: p.discountType ?? 'PROMOTION'
  }));
};

// Promotions ending within the next 24 hours
const getPromotionsEndingSoon = async (): Promise<DetailedPromotionAlert[]> => {
  const now = getNow();
  const in24h = getIn24Hours();

  const products = await prisma.product.findMany({
    where: {
      isDeleted: false,
      discountEnd: { gte: now, lte: in24h },
    },
    select: { id: true, name: true, articleNo: true, discountType: true },
  });

  return products.map(p => ({
    productId: p.id,
    productName: p.name,
    articleNo: p.articleNo,
    eventType: 'ENDING',
    discountType: p.discountType ?? 'PROMOTION'
  }));
};

// Products whose expiryDate is within the next 3 days (and not already expired)
const countExpiringSoon = async (): Promise<number> => {
  const now = getNow();
  const in3days = getIn3Days();

  return prisma.product.count({
    where: {
      isDeleted: false,
      expiryDate: {
        gte: now,
        lte: in3days,
      },
    },
  });
};

// Run all four queries in parallel for efficiency
export const AdminNotifications = async () => {
  const [lowStock, pendingApprovals, promotionsStarting, promotionsEnding, expiringSoon] =
    await Promise.all([
      countLowStockProducts(),
      countPendingApprovals(),
      getPromotionsStartingSoon(),
      getPromotionsEndingSoon(),
      countExpiringSoon(),
    ]);

  const detailedPromotions = [...promotionsStarting, ...promotionsEnding];

  const counts: NotificationCounts = {
    lowStock,
    pendingApprovals,
    promotionsEndingSoon: detailedPromotions.length,
    detailedPromotions,
    expiringSoon,
  };

  return <AdminNotificationsDropdown counts={counts} />;
};
