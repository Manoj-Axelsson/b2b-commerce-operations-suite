"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/generated/prisma/client";
import { updateOrderStatus as updateOrderService } from "@/modules/orders/order.services";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ADMIN_EMAIL } from "@/lib/utils";

export async function updateOrderStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.role === "admin";

  if (!session || !isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;

  if (!orderId || !status) {
    throw new Error("Missing orderId or status");
  }

  try {
    await updateOrderService({
      orderId,
      nextStatus: status,
      actorId: session.user.id,
      actorRole: "ADMIN",
      notes: `Manual status update via Admin Dashboard to ${status}`,
    });

    revalidatePath("/admin/orders");
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error; // Re-throw to be caught by error boundary
  }
}

export async function addAdjustmentAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.role === "admin";

  if (!session || !isAdmin) {
    throw new Error("Unauthorized");
  }

  const orderId = formData.get("orderId") as string;
  const type = formData.get("type") as any;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;

  if (!orderId || !type || isNaN(amount)) {
    throw new Error("Invalid adjustment data");
  }

  try {
    await import("@/modules/orders/order.adjustment").then(m => 
      m.addOrderAdjustment({
        orderId,
        type,
        amount,
        description,
        actorId: session.user.id
      })
    );
    revalidatePath("/admin/orders");
  } catch (error) {
    console.error("Adjustment failed:", error);
    throw error;
  }
}

export async function removeAdjustmentAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.role === "admin";

  if (!session || !isAdmin) throw new Error("Unauthorized");

  const orderId = formData.get("orderId") as string;
  const adjustmentId = formData.get("adjustmentId") as string;

  try {
    await import("@/modules/orders/order.adjustment").then(m => 
      m.removeOrderAdjustment(orderId, adjustmentId, session.user.id)
    );
    revalidatePath("/admin/orders");
  } catch (error) {
    console.error("Removal failed:", error);
    throw error;
  }
}
