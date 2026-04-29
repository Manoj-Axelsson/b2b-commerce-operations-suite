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
  const products = await prisma.product.findMany({
    where: { isDeleted: false, isActive: true },
    select: { quantity: true, minQuantity: true },
  });

  const lowStockItems = products.filter((p) => p.quantity <= p.minQuantity);
  return lowStockItems.length;
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

// Promotions ending within the next 24 hours (discountEnd is set and in the window)
const countPromotionsEndingSoon = async (): Promise<number> => {
  const now = getNow();
  const in24h = getIn24Hours();

  return prisma.product.count({
    where: {
      isDeleted: false,
      discountEnd: {
        gte: now,
        lte: in24h,
      },
    },
  });
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
  const [lowStock, pendingApprovals, promotionsEndingSoon, expiringSoon] =
    await Promise.all([
      countLowStockProducts(),
      countPendingApprovals(),
      countPromotionsEndingSoon(),
      countExpiringSoon(),
    ]);

  const counts: NotificationCounts = {
    lowStock,
    pendingApprovals,
    promotionsEndingSoon,
    expiringSoon,
  };

  return <AdminNotificationsDropdown counts={counts} />;
};
