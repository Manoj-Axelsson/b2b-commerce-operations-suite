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
  const nextStatus = formData.get("status") as OrderStatus;
  const notesRaw = formData.get("notes") as string;
  const notes = notesRaw?.trim() || `Manual status update via Admin Dashboard to ${nextStatus}`;

  await updateOrderService({
    orderId,
    nextStatus,
    actorId,
    actorRole: "ADMIN",
    notes,
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

    const nextStatus = order.status === OrderStatus.AWAITING_PAYMENT ? OrderStatus.CONFIRMED : order.status;

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.RECEIVED,
        paymentReceivedAt: new Date(),
        status: nextStatus,
      },
    });

    // Write audit event
    await tx.orderEvent.create({
      data: {
        orderId,
        previousStatus: order.status,
        nextStatus: nextStatus,
        actorId,
        actorRole: "ADMIN",
        notes: nextStatus === OrderStatus.CONFIRMED
          ? "Payment manually marked as RECEIVED by Admin, status transitioned to CONFIRMED"
          : "Payment manually marked as RECEIVED by Admin",
      },
    });
  });

  revalidatePath("/admin/orders");
}

/**
 * Server action: allocate transport details for an order in To Ship state.
 */
export async function allocateTransport(formData: FormData): Promise<void> {
  const actorId = await verifyAdmin();
  const orderId = formData.get("orderId") as string;
  const transportMethod = formData.get("transportMethod") as string;
  const trackingNumber = formData.get("trackingNumber") as string;
  const estimatedArrivalRaw = formData.get("estimatedArrival") as string;

  const estimatedArrival = estimatedArrivalRaw ? new Date(estimatedArrivalRaw) : null;

  if (!transportMethod?.trim()) {
    throw new Error("Transport method is required.");
  }

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
        transportMethod: transportMethod.trim(),
        trackingNumber: trackingNumber?.trim() || null,
        estimatedArrival,
      },
    });

    // Write audit event
    await tx.orderEvent.create({
      data: {
        orderId,
        previousStatus: order.status,
        nextStatus: order.status,
        actorId,
        actorRole: "ADMIN",
        notes: `Transport allocated: ${transportMethod.trim()}` +
          (trackingNumber?.trim() ? ` (Tracking: ${trackingNumber.trim()})` : "") +
          (estimatedArrival ? ` (Est. Arrival: ${estimatedArrival.toLocaleDateString("sv-SE")})` : ""),
      },
    });
  });

  revalidatePath("/admin/orders");
}

/**
 * Server action: mark refund for a cancelled paid order as processed.
 */
export async function markRefundAsProcessed(formData: FormData): Promise<void> {
  const actorId = await verifyAdmin();
  const orderId = formData.get("orderId") as string;

  await runManagedTransaction(undefined, async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { status: true, paymentStatus: true, isRefunded: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.CANCELLED) {
      throw new Error("Order must be cancelled to process a refund.");
    }

    if (order.paymentStatus !== PaymentStatus.RECEIVED) {
      throw new Error("Order has no received payment to refund.");
    }

    if (order.isRefunded) {
      throw new Error("Refund has already been processed.");
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        isRefunded: true,
      },
    });

    // Write audit event
    await tx.orderEvent.create({
      data: {
        orderId,
        previousStatus: order.status,
        nextStatus: order.status,
        actorId,
        actorRole: "ADMIN",
        notes: "Refund processed and marked as resolved by Admin",
      },
    });
  });

  revalidatePath("/admin/orders");
}
