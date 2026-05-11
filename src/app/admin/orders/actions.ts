"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
type OrderStatus = "IN_PROCESS" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;

  if (!orderId || !status) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/orders");
}
