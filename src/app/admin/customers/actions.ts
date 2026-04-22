//src/app/admin/customers/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveCustomer(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string || "";
  const email = formData.get("email") as string || "";
  const role = formData.get("role") as string || "CUSTOMER";

  try {
    if (id && id.trim() !== "") {
      await prisma.user.update({
        where: { id },
        data: { name, email, role }
      });
    } else {
      // Schema requires 'id', 'name', 'email'. 
      // Defaults handle 'isRegistered' (false) and 'emailVerified' (false).
      const newId = `user_${Math.random().toString(36).substring(2, 15)}`;
      await prisma.user.create({
        data: {
          id: newId,
          name,
          email,
          role,
          isApproved: true, // Typically true if admin creates them
          emailVerified: false,
        }
      });
    }
  } catch (e) {
    console.error("SAVE ERROR:", e);
    throw new Error("Failed to save customer.");
  }

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(id: string) {
  if (!id) return;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (id === session?.user?.id) throw new Error("Self-deletion blocked.");

    // Using transaction as per your "Complete Cleanup" standard
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.account.deleteMany({ where: { userId: id } }),
      prisma.wishlist.deleteMany({ where: { userId: id } }), // Added Wishlist cleanup based on schema
      prisma.address.deleteMany({ where: { userId: id } }),  // Added Address cleanup based on schema
      prisma.order.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    console.error("DELETE ERROR:", error);
    throw new Error("Could not delete user.");
  }
}
