"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ADMIN_EMAIL } from "@/lib/utils";
import { AdminProductUpdateSchema } from "../inventory/types/schema";

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

/**
 * Helper to parse numeric values from FormData safely
 */
const parseFormInt = (value: FormDataEntryValue | null): number | null => {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Helper to parse date values from FormData safely
 */
const parseFormDate = (value: FormDataEntryValue | null): Date | null => {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

export async function createProduct(formData: FormData) {
  await verifyAdmin();

  const data = {
    name: formData.get("name") as string,
    brand: formData.get("brand") as string,
    articleNo: formData.get("articleNo") as string,
    description: formData.get("description") as string || null,
    imageUrl: formData.get("imageUrl") as string || null,
    price: parseFormInt(formData.get("price")) ?? 0,
    weightValue: parseFormInt(formData.get("weightValue")) ?? 0,
    weightUnit: formData.get("weightUnit") as string,
    quantity: parseFormInt(formData.get("quantity")) ?? 0,
    minQuantity: parseFormInt(formData.get("minQuantity")) ?? 5,
    categoryId: formData.get("categoryId") as string,
    discountPrice: parseFormInt(formData.get("discountPrice")),
    discountStart: parseFormDate(formData.get("discountStart")),
    discountEnd: parseFormDate(formData.get("discountEnd")),
  };

  // Strict validation using the standardized schema
  const validation = AdminProductUpdateSchema.safeParse(data);
  if (!validation.success) {
    const errorMsg = validation.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(" | ");
    throw new Error(`Validation Error: ${errorMsg}`);
  }

  try {
    await prisma.product.create({
      data: {
        ...validation.data,
        isActive: true,
        isDeleted: false,
      },
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    throw new Error("Failed to create product. The article number may already exist.");
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  await verifyAdmin();

  const id = formData.get("id") as string;
  if (!id) throw new Error("Product ID is required.");

  const data = {
    name: formData.get("name") as string,
    brand: formData.get("brand") as string,
    articleNo: formData.get("articleNo") as string,
    description: formData.get("description") as string || null,
    imageUrl: formData.get("imageUrl") as string || null,
    price: parseFormInt(formData.get("price")) ?? 0,
    weightValue: parseFormInt(formData.get("weightValue")) ?? 0,
    weightUnit: formData.get("weightUnit") as string,
    quantity: parseFormInt(formData.get("quantity")) ?? 0,
    minQuantity: parseFormInt(formData.get("minQuantity")) ?? 5,
    categoryId: formData.get("categoryId") as string,
    discountPrice: parseFormInt(formData.get("discountPrice")),
    discountStart: parseFormDate(formData.get("discountStart")),
    discountEnd: parseFormDate(formData.get("discountEnd")),
  };

  const validation = AdminProductUpdateSchema.safeParse(data);
  if (!validation.success) {
    const errorMsg = validation.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(" | ");
    throw new Error(`Validation Error: ${errorMsg}`);
  }

  try {
    await prisma.product.update({
      where: { id },
      data: validation.data,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    throw new Error("Failed to update product.");
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function toggleProductVisibility(id: string, currentStatus: boolean) {
  await verifyAdmin();
  if (!id) return;

  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
  } catch (error) {
    console.error("TOGGLE VISIBILITY ERROR:", error);
    throw new Error("Failed to update visibility.");
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProduct(id: string) {
  await verifyAdmin();
  if (!id) return;

  try {
    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      await prisma.product.update({
        where: { id },
        data: {
          isActive: false,
          isDeleted: true,
        },
      });
    } else {
      await prisma.wishlist.deleteMany({ where: { productId: id } });
      await prisma.cartItem.deleteMany({ where: { productId: id } });
      await prisma.stockMovement.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
    }
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    throw new Error("Failed to delete product.");
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
