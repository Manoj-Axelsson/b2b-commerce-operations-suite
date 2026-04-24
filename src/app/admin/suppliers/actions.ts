"use server";

import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Send a re-order email to the supplier and log it as a pending restock.
export async function sendReorderEmail(formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);

  if (!productId || isNaN(quantity) || quantity <= 0) {
    throw new Error("Invalid re-order data.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { supplier: true },
  });

  if (!product) throw new Error("Product not found.");
  if (!product.supplier) throw new Error("No supplier linked to this product.");

  await sendEmail({
    to: product.supplier.email,
    subject: `Re-order Request: ${product.name}`,
    html: `
      <h2>Re-order Request from Rajput Foods Sweden</h2>
      <p>Hello ${product.supplier.name},</p>
      <p>We would like to place a re-order for the following item:</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Product</strong></td><td style="padding:8px;border:1px solid #ddd">${product.name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Article No.</strong></td><td style="padding:8px;border:1px solid #ddd">${product.articleNo}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Brand</strong></td><td style="padding:8px;border:1px solid #ddd">${product.brand}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Current Stock</strong></td><td style="padding:8px;border:1px solid #ddd">${product.quantity}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Quantity Requested</strong></td><td style="padding:8px;border:1px solid #ddd"><strong>${quantity}</strong></td></tr>
      </table>
      <p style="margin-top:16px">Please confirm availability and expected delivery date.</p>
      <p>Best regards,<br/>Rajput Foods Sweden</p>
    `,
  });

  revalidatePath("/admin/inventory");
}

// CRUD actions for managing suppliers.
export async function saveSupplier(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (id) {
    await prisma.supplier.update({ where: { id }, data: { name, email } });
  } else {
    await prisma.supplier.create({ data: { name, email } });
  }

  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function deleteSupplier(id: string) {
  // Unlink products first so we don't break FK constraints
  await prisma.product.updateMany({
    where: { supplierId: id },
    data: { supplierId: null },
  });
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/admin/suppliers");
}
