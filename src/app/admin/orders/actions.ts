"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, AdjustmentType } from "@/generated/prisma/client";
import { updateOrderStatus as updateOrderService } from "@/modules/orders/order.services";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ADMIN_EMAIL } from "@/lib/utils";
import { formatSafeError, BusinessError } from "@/lib/error";

export async function updateOrderStatus(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.role === "admin";

  if (!session || !isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;

  if (!orderId || !status) {
    throw new BusinessError("Missing orderId or status", 400);
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
    formatSafeError(error);
  }
}

export async function addAdjustmentAction(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.role === "admin";

  if (!session || !isAdmin) {
    throw new Error("Unauthorized");
  }

  const orderId = formData.get("orderId") as string;
  const type = formData.get("type") as AdjustmentType;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;

  if (!orderId || !type || isNaN(amount)) {
    throw new BusinessError("Invalid adjustment data", 400);
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
    formatSafeError(error);
  }
}

export async function removeAdjustmentAction(formData: FormData): Promise<void> {
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
    formatSafeError(error);
  }
}
