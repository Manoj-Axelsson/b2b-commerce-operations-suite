"use server";

import { getSession } from "@/lib/session";
import { createOrderFromCart } from "@/modules/checkout/checkout.services";
import { redirect } from "next/navigation";
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
