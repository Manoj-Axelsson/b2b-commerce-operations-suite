"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const name = (formData.get("name") as string) || "";
  const brand = (formData.get("brand") as string) || "";
  const articleNo = (formData.get("articleNo") as string) || "";
  const description = (formData.get("description") as string) || "";
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const price = parseInt(formData.get("price") as string, 10);
  const weightValue = parseInt(formData.get("weightValue") as string, 10);
  const weightUnit = (formData.get("weightUnit") as string) || "g";
  const quantity = parseInt(formData.get("quantity") as string, 10) || 0;
  const minQuantity = parseInt(formData.get("minQuantity") as string, 10) || 5;
  const categoryId = (formData.get("categoryId") as string) || "";

  if (!name || !brand || !articleNo || !categoryId || isNaN(price) || isNaN(weightValue)) {
    throw new Error("Missing required fields.");
  }

  try {
    await prisma.product.create({
      data: {
        name,
        brand,
        articleNo,
        description: description || null,
        imageUrl: imageUrl || null,
        price,
        weightValue,
        weightUnit,
        quantity,
        minQuantity,
        categoryId,
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
  const id = (formData.get("id") as string) || "";
  const name = (formData.get("name") as string) || "";
  const brand = (formData.get("brand") as string) || "";
  const articleNo = (formData.get("articleNo") as string) || "";
  const description = (formData.get("description") as string) || "";
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const price = parseInt(formData.get("price") as string, 10);
  const weightValue = parseInt(formData.get("weightValue") as string, 10);
  const weightUnit = (formData.get("weightUnit") as string) || "g";
  const quantity = parseInt(formData.get("quantity") as string, 10) || 0;
  const minQuantity = parseInt(formData.get("minQuantity") as string, 10) || 5;
  const categoryId = (formData.get("categoryId") as string) || "";

  if (!id) throw new Error("Product ID is required.");

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        brand,
        articleNo,
        description: description || null,
        imageUrl: imageUrl || null,
        price,
        weightValue,
        weightUnit,
        quantity,
        minQuantity,
        categoryId,
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

export async function toggleProductVisibility(id: string, currentStatus: boolean) {
  if (!id) return;

  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
  } catch (error) {
    console.error("TOGGLE VISIBILITY ERROR:", error);
    throw new Error("Failed to update product visibility.");
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProduct(id: string) {
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
