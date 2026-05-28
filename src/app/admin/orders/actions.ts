"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, AdjustmentType, PaymentStatus } from "@/generated/prisma/client";
import { updateOrderStatus as updateOrderService } from "@/modules/orders/order.services";
import {
  addOrderAdjustment,
  removeOrderAdjustment,
} from "@/modules/orders/order.adjustment";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkIsAdmin } from "@/lib/utils";
import { runManagedTransaction } from "@/lib/managedTransaction";

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
  const nextStatus = formData.get("status") as string;

  if (nextStatus === "MARK_AS_PAID") {
    await runManagedTransaction(undefined, async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.RECEIVED,
          paymentReceivedAt: new Date(),
          status: OrderStatus.CONFIRMED,
        },
      });

      // Write audit event
      await tx.orderEvent.create({
        data: {
          orderId,
          previousStatus: order.status,
          nextStatus: OrderStatus.CONFIRMED,
          actorId,
          actorRole: "ADMIN",
          notes: "Payment manually marked as RECEIVED by Admin via dropdown and order confirmed",
        },
      });
    });
  } else {
    const shippingMethod = (formData.get("shippingMethod") as string) || undefined;
    const trackingNumber = (formData.get("trackingNumber") as string) || undefined;
    const estDateRaw = formData.get("estimatedArrivalDate") as string;
    const estimatedArrivalDate = estDateRaw && !isNaN(Date.parse(estDateRaw)) ? new Date(estDateRaw) : undefined;

    await updateOrderService({
      orderId,
      nextStatus: nextStatus as OrderStatus,
      actorId,
      actorRole: "ADMIN",
      notes: `Manual status update via Admin Dashboard to ${nextStatus}`,
      shippingMethod,
      trackingNumber,
      estimatedArrivalDate,
    });
  }

  revalidatePath("/admin/orders");
}

/**
 * Server action: add a financial adjustment (discount / fee) to an order.
 */
export async function addAdjustmentAction(formData: FormData): Promise<void> {
  const actorId = await verifyAdmin();

  const orderId = formData.get("orderId") as string;
  const type = formData.get("type") as AdjustmentType;
  const amountRaw = parseFloat(formData.get("amount") as string);
  const amount = Math.round(amountRaw * 100);
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

/**
 * Server action: manually mark an order as paid by an admin.
 */
export async function markOrderAsPaid(formData: FormData): Promise<void> {
  const actorId = await verifyAdmin();
  const orderId = formData.get("orderId") as string;

  await runManagedTransaction(undefined, async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.RECEIVED,
        paymentReceivedAt: new Date(),
        status: OrderStatus.CONFIRMED,
      },
    });

    // Write audit event
    await tx.orderEvent.create({
      data: {
        orderId,
        previousStatus: order.status,
        nextStatus: OrderStatus.CONFIRMED,
        actorId,
        actorRole: "ADMIN",
        notes: "Payment manually marked as RECEIVED by Admin and order confirmed",
      },
    });
  });

  revalidatePath("/admin/orders");
}
