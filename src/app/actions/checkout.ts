"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createOrderFromCart } from "@/modules/checkout/checkout.services";
import { revalidatePath } from "next/cache";

export async function processCheckoutAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const addressId = formData.get("addressId") as string;
  if (!addressId) throw new Error("Delivery address is required");

  try {
    const order = await createOrderFromCart({
      userId: session.user.id,
      addressId: addressId,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/shop");
    
    // Redirect to a success page or back to account orders
    return { success: true, orderId: order.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

export async function saveAddressAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  try {
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
    const message = error instanceof Error ? error.message : "Failed to save address";
    return { success: false, error: message };
  }
}
