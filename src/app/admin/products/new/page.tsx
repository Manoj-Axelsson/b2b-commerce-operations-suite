import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = {
  title: "Add Product — Admin | Rajput Foods",
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="space-y-6">

      <nav className="text-sm text-gray-500">
        <Link href="/admin/products" className="hover:text-gray-800 transition-colors">
          Products
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800 font-semibold">Add New Product</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>

      {categories.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded text-sm">
          No categories exist yet. You must have at least one category before adding a product.
          Categories can be seeded via <code className="font-mono">npx prisma db seed</code>.
        </div>
      )}

      <ProductForm categories={categories} />
    </main>
  );
}
