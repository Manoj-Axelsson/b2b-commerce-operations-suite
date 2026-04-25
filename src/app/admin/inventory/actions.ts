"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { AdminProductUpdateSchema, AdminProductUpdate } from "./types/schema";

/**
 * Standardized Action Response Type
 */
export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * saveProductUpdate
 * 
 * Handles full product updates including pricing, promotions, and inventory.
 * Validates data against the AdminProductUpdateSchema before persisting.
 */
export const saveProductUpdate = async (
  productId: string,
  rawData: Partial<AdminProductUpdate>
): Promise<ActionResponse> => {
  try {
    // 1. Authenticate and verify admin session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    // 2. Validate input using the type-safe schema
    const validation = AdminProductUpdateSchema.safeParse({
      ...rawData,
      id: productId, // Ensure ID matches the target
    });

    if (!validation.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const validatedData = validation.data;

    // 3. Persist changes to database
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: validatedData.name,
        brand: validatedData.brand,
        price: validatedData.price,
        discountPrice: validatedData.discountPrice,
        discountStart: validatedData.discountStart,
        discountEnd: validatedData.discountEnd,
        quantity: validatedData.quantity,
        minQuantity: validatedData.minQuantity,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        imageUrl: validatedData.imageUrl,
        // Add other fields as necessary from the validated data
      },
    });

    // 4. Revalidate paths for immediate UI updates
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");

    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error("[SAVE_PRODUCT_UPDATE_ERROR]:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during the update.",
    };
  }
};

/**
 * logStockMovement
 * 
 * Internal helper to track inventory changes for auditing.
 */
export const logStockMovement = async (
  productId: string,
  quantity: number,
  changeType: "RESTOCK" | "SALE" | "ADJUSTMENT" | "DAMAGE" | "RETURN",
  note?: string
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return prisma.stockMovement.create({
    data: {
      productId,
      quantity,
      changeType,
      note,
      performedByUserId: session?.user?.id,
    },
  });
};
