"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createOrderFromCart } from "@/modules/checkout/checkout.services";
import { revalidatePath } from "next/cache";

import { formatSafeError, BusinessError } from "@/lib/error";

export async function processCheckoutAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const addressId = formData.get("addressId") as string;
  const idempotencyKey = formData.get("idempotencyKey") as string;

  if (!addressId) throw new BusinessError("Delivery address is required", 400);

  try {
    const order = await createOrderFromCart({
      userId: session.user.id,
      addressId: addressId,
      idempotencyKey: idempotencyKey,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/shop");

    return { success: true, orderId: order.id };
  } catch (error) {
    return formatSafeError(error);
  }
}

export async function saveAddressAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    if (!formData.get("street") || !formData.get("city")) {
      throw new BusinessError("Street and City are required", 400);
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        street: formData.get("street") as string,
        houseNumber: formData.get("houseNumber") as string,
        apartment: formData.get("apartment") as string || null,
        city: formData.get("city") as string,
        postalCode: formData.get("postalCode") as string,
        country: formData.get("country") as string,
        phoneNumber: formData.get("phoneNumber") as string || null,
        addressLabel: formData.get("addressLabel") as string || "Home",
      },
    });

    revalidatePath("/shop/checkout");
    return { success: true, addressId: address.id };
  } catch (error) {
    return formatSafeError(error);
  }
}
