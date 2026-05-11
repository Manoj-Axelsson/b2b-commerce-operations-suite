"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, AdjustmentType } from "@/generated/prisma/client";
import { updateOrderStatus as updateOrderStatusService } from "@/modules/orders/order.services";
import { addOrderAdjustment, removeOrderAdjustment } from "@/modules/orders/order.adjustment";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ADMIN_EMAIL } from "@/lib/utils";

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;
  const notes = formData.get("notes") as string;

  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.role === "admin" || session?.user?.email === ADMIN_EMAIL;
  if (!session || !isAdmin) throw new Error("Unauthorized");

  if (!orderId || !status) return;

  await updateOrderStatusService({
    orderId,
    nextStatus: status,
    actorId: session.user.id,
    actorRole: session.user.role || "ADMIN",
    notes
  });

  revalidatePath("/admin/orders");
}

export async function addAdjustmentAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.role === "admin" || session?.user?.email === ADMIN_EMAIL;
  if (!session || !isAdmin) throw new Error("Unauthorized");

  const orderId = formData.get("orderId") as string;
  const type = formData.get("type") as AdjustmentType;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;

  await addOrderAdjustment({
    orderId,
    type,
    amount,
    description,
    actorId: session.user.id
  });

  revalidatePath("/admin/orders");
}

export async function removeAdjustmentAction(orderId: string, adjustmentId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.role === "admin" || session?.user?.email === ADMIN_EMAIL;
  if (!session || !isAdmin) throw new Error("Unauthorized");

  await removeOrderAdjustment(orderId, adjustmentId, session.user.id);

  revalidatePath("/admin/orders");
}
