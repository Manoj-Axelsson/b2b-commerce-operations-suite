"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_EMAIL } from "@/lib/utils";
import { runManagedTransaction } from "@/lib/managedTransaction";
import { BusinessError } from "@/lib/error";

// ─── Payload contracts ──────────────────────────────────────────────────────

interface CustomerFormPayload {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isApproved: boolean;
}

// ─── Authorization guard ────────────────────────────────────────────────────

const verifyAdmin = async (): Promise<void> => {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin =
    session?.user?.email === ADMIN_EMAIL || session?.user?.role === "admin";
  if (!session || !isAdmin) {
    throw new BusinessError("Unauthorized. Admin access required.", 403);
  }
};

// ─── FormData → typed payload ───────────────────────────────────────────────

const parseCustomerPayload = (formData: FormData): CustomerFormPayload => ({
  id: (formData.get("id") as string) || "",
  name: (formData.get("name") as string) || "",
  email: (formData.get("email") as string) || "",
  password: (formData.get("password") as string) || "",
  role: (formData.get("role") as string) || "user",
  isApproved: formData.get("isApproved") === "true",
});

export async function saveCustomer(formData: FormData): Promise<void> {
  await verifyAdmin();

  const payload = parseCustomerPayload(formData);
  const isMasterAdmin =
    payload.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isCreate = payload.id.trim() === "";

  // Domain validations — throws propagate naturally to the action boundary.

  if (isMasterAdmin && payload.role !== "admin") {
    throw new BusinessError(
      "The primary admin account must retain the 'admin' role.",
    );
  }
  if (isCreate && payload.password.length < 8) {
    throw new BusinessError(
      "New accounts require a password of at least 8 characters.",
    );
  }

  const finalApproved = isMasterAdmin ? true : payload.isApproved;
  const finalRole = isMasterAdmin ? "admin" : payload.role;

  if (!isCreate) {
    // ── Update path ─────────────────────────────────────────────────────
    await runManagedTransaction(undefined, async (tx) => {
      await tx.user.update({
        where: { id: payload.id },
        data: {
          name: payload.name,
          email: payload.email,
          role: finalRole,
          isApproved: finalApproved,
          emailVerified: isMasterAdmin ? true : undefined,
        },
      });
    });
  } else {

    const result = await auth.api.signUpEmail({
      body: {
        email: payload.email,
        password: payload.password,
        name: payload.name,
      },
    });
    if (!result?.user) {
      throw new BusinessError("The auth system failed to create the account.");
    }

    await runManagedTransaction(undefined, async (tx) => {
      await tx.user.update({
        where: { email: result.user.email },
        data: {
          role: finalRole,
          isApproved: finalApproved,
          emailVerified: true,
        },
      });
    });
  }

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(id: string): Promise<void> {
  await verifyAdmin();
  if (!id) return;

  const session = await auth.api.getSession({ headers: await headers() });
  if (id === session?.user?.id) {
    throw new BusinessError("Self-deletion blocked.");
  }

  await runManagedTransaction(undefined, async (tx) => {
    const orderCount = await tx.order.count({ where: { userId: id } });
    if (orderCount > 0) {
      throw new BusinessError(
        "Cannot delete customer with existing orders. Consider deactivating them instead.",
        409,
      );
    }
    await tx.user.delete({ where: { id } });
  });

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}
// ↑ deleteCustomer scope closes here.
