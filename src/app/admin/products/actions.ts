"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ADMIN_EMAIL } from "@/lib/utils";
import { AdminProductUpdateSchema } from "@/app/admin/inventory/types/schema";

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
 * Helper to parse integer values from FormData safely.
 * Returns null for empty or non-numeric strings.
 */
const parseFormInt = (value: FormDataEntryValue | null): number | null => {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Helper to parse date values from FormData safely.
 * Returns null for empty or invalid date strings.
 */
const parseFormDate = (value: FormDataEntryValue | null): Date | null => {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * createProduct
 * Validates and persists a new product. Redirects to /admin/products on success.
 */
export async function createProduct(formData: FormData) {
  await verifyAdmin();

  const rawData = {
    name: formData.get("name") as string,
    brand: formData.get("brand") as string,
    articleNo: formData.get("articleNo") as string,
    description: (formData.get("description") as string) || null,
    imageUrl: (formData.get("imageUrl") as string) || null,
    price: parseFormInt(formData.get("price")) ?? 0,
    weightValue: parseFormInt(formData.get("weightValue")) ?? 0,
    weightUnit: formData.get("weightUnit") as string,
    quantity: parseFormInt(formData.get("quantity")) ?? 0,
    minQuantity: parseFormInt(formData.get("minQuantity")) ?? 5,
    categoryId: formData.get("categoryId") as string,
    discountPrice: parseFormInt(formData.get("discountPrice")),
    discountStart: parseFormDate(formData.get("discountStart")),
    discountEnd: parseFormDate(formData.get("discountEnd")),
    expiryDate: parseFormDate(formData.get("expiryDate")),
  };

  const validation = AdminProductUpdateSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(" | ");
    throw new Error(`Validation Error: ${errorMsg}`);
  }

  const d = validation.data;

  // Derive images[] from imageUrl so the detail-page gallery (which reads images[])
  // always stays in sync with the grid card (which reads imageUrl).
  // imageUrl remains the single source of truth — no manual double-entry needed.
  const derivedImages = d.imageUrl ? [d.imageUrl] : [];

  try {
    await prisma.product.create({
      data: {
        name: d.name,
        brand: d.brand,
        articleNo: d.articleNo,
        description: d.description ?? null,
        imageUrl: d.imageUrl ?? null,
        images: derivedImages,
        ingredients: d.ingredients ?? null,
        price: d.price,
        weightValue: d.weightValue,
        weightUnit: d.weightUnit,
        quantity: d.quantity,
        minQuantity: d.minQuantity,
        categoryId: d.categoryId,
        discountPrice: d.discountPrice ?? null,
        discountStart: d.discountStart ?? null,
        discountEnd: d.discountEnd ?? null,
        expiryDate: d.expiryDate ?? null,
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

/**
 * updateProduct
 * Validates and updates an existing product by ID. Redirects to /admin/products on success.
 */
export async function updateProduct(formData: FormData) {
  await verifyAdmin();

  const id = formData.get("id") as string;
  if (!id) throw new Error("Product ID is required.");

  const rawData = {
    name: formData.get("name") as string,
    brand: formData.get("brand") as string,
    articleNo: formData.get("articleNo") as string,
    description: (formData.get("description") as string) || null,
    imageUrl: (formData.get("imageUrl") as string) || null,
    price: parseFormInt(formData.get("price")) ?? 0,
    weightValue: parseFormInt(formData.get("weightValue")) ?? 0,
    weightUnit: formData.get("weightUnit") as string,
    quantity: parseFormInt(formData.get("quantity")) ?? 0,
    minQuantity: parseFormInt(formData.get("minQuantity")) ?? 5,
    categoryId: formData.get("categoryId") as string,
    discountPrice: parseFormInt(formData.get("discountPrice")),
    discountStart: parseFormDate(formData.get("discountStart")),
    discountEnd: parseFormDate(formData.get("discountEnd")),
    expiryDate: parseFormDate(formData.get("expiryDate")),
  };

  const validation = AdminProductUpdateSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(" | ");
    throw new Error(`Validation Error: ${errorMsg}`);
  }

  const d = validation.data;

  // Keep images[] in sync with imageUrl (same logic as createProduct).
  const derivedImages = d.imageUrl ? [d.imageUrl] : [];

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: d.name,
        brand: d.brand,
        articleNo: d.articleNo,
        description: d.description ?? null,
        imageUrl: d.imageUrl ?? null,
        images: derivedImages,
        ingredients: d.ingredients ?? null,
        price: d.price,
        weightValue: d.weightValue,
        weightUnit: d.weightUnit,
        quantity: d.quantity,
        minQuantity: d.minQuantity,
        categoryId: d.categoryId,
        discountPrice: d.discountPrice ?? null,
        discountStart: d.discountStart ?? null,
        discountEnd: d.discountEnd ?? null,
        expiryDate: d.expiryDate ?? null,
      },
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    throw new Error("Failed to update product.");
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

/**
 * toggleProductVisibility
 * Flips the isActive flag for a product.
 */
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

/**
 * deleteProduct
 * Soft-deletes (if referenced by orders) or hard-deletes a product.
 */
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
