"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, AdjustmentType } from "@/generated/prisma/client";
import { updateOrderStatus as updateOrderService } from "@/modules/orders/order.services";
import {
  addOrderAdjustment,
  removeOrderAdjustment,
} from "@/modules/orders/order.adjustment";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkIsAdmin } from "@/lib/utils";

/**
 * Utility to verify admin session and return user ID.
 */
async function verifyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = checkIsAdmin(session?.user);

  if (!session?.user || !isAdmin) {
    throw new Error("Unauthorized. Admin access required.");
  }

  return session.user.id;
}

/**
 * Server action: update order status from the admin dashboard form.
 */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const actorId = await verifyAdmin();

  const orderId = formData.get("orderId") as string;
  const nextStatus = formData.get("status") as OrderStatus;

  await updateOrderService({
    orderId,
    nextStatus,
    actorId,
    actorRole: "ADMIN",
    notes: `Manual status update via Admin Dashboard to ${nextStatus}`,
  });

  revalidatePath("/admin/orders");
}

/**
 * Server action: add a financial adjustment (discount / fee) to an order.
 */
export async function addAdjustmentAction(formData: FormData): Promise<void> {
  const actorId = await verifyAdmin();

  const orderId = formData.get("orderId") as string;
  const type = formData.get("type") as AdjustmentType;
  const amount = parseFloat(formData.get("amount") as string);
  const descriptionRaw = formData.get("description");
  const description =
    typeof descriptionRaw === "string" && descriptionRaw.length > 0
      ? descriptionRaw
      : undefined;

  await addOrderAdjustment({
    orderId,
    type,
    amount,
    description,
    actorId,
  });

  revalidatePath("/admin/orders");
}

/**
 * Server action: remove an adjustment and revert the totals.
 */
export async function removeAdjustmentAction(formData: FormData): Promise<void> {
  const actorId = await verifyAdmin();

  const orderId = formData.get("orderId") as string;
  const adjustmentId = formData.get("adjustmentId") as string;

  await removeOrderAdjustment(orderId, adjustmentId, actorId);

  revalidatePath("/admin/orders");
}
