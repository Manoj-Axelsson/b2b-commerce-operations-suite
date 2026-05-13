"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_EMAIL } from "@/lib/utils";
import { runManagedTransaction } from "@/lib/managedTransaction";

/**
 * verifyAdmin
 * Ensures the current session belongs to an authorized administrator.
 */
const verifyAdmin = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.role === "admin";
  if (!session || !isAdmin) {
    throw new Error("Unauthorized. Admin access required.");
  }
};

export async function saveCustomer(formData: FormData) {
  await verifyAdmin();
  
  const id = formData.get("id") as string;
  const name = formData.get("name") as string || "";
  const email = formData.get("email") as string || "";
  const password = formData.get("password") as string || "";
  const role = formData.get("role") as string || "user";
  const isApproved = formData.get("isApproved") === "true";

  // Security: Protect the primary admin account
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    throw new Error("The primary admin account is protected and cannot be modified here.");
  }

  try {
    if (id && id.trim() !== "") {
      // UPDATE existing user
      await prisma.user.update({
        where: { id },
        data: { name, email, role, isApproved }
      });
    } else {
      // CREATE new user via Better Auth
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      const result = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        }
      });

      if (!result || !result.user) {
        throw new Error("Auth system failed to create the account.");
      }

      // Sync custom fields immediately after creation
      await prisma.user.update({
        where: { email: result.user.email },
        data: {
          role,
          isApproved: true, 
          emailVerified: true,
        }
      });
    }
  } catch (error: unknown) {
    console.error("SAVE CUSTOMER ERROR:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save customer.");
  }

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(id: string) {
  await verifyAdmin();
  if (!id) return;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (id === session?.user?.id) throw new Error("Self-deletion blocked.");

    // Delete in strict dependency order
    const userOrders = await prisma.order.findMany({
      where: { userId: id },
      select: { id: true },
    });
    const orderIds = userOrders.map((o) => o.id);

    // Delete in strict dependency order inside a managed transaction.
    // signal is undefined here — Next.js 16 Server Actions do not expose request.signal.
    // The DB-level timeout guards in runManagedTransaction still apply unconditionally.
    await runManagedTransaction(undefined, async (tx) => {
      await tx.stockMovement.updateMany({
        where: { performedByUserId: id },
        data: { performedByUserId: null },
      });
      await tx.cartItem.deleteMany({ where: { cart: { userId: id } } });
      await tx.cart.deleteMany({ where: { userId: id } });
      await tx.wishlist.deleteMany({ where: { userId: id } });
      await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.order.deleteMany({ where: { userId: id } });
      await tx.address.deleteMany({ where: { userId: id } });
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    revalidatePath("/admin/customers");
  } catch (error: unknown) {
    console.error("DELETE CUSTOMER ERROR:", error);
    throw new Error(error instanceof Error ? error.message : "Could not delete user.");
  }
}
