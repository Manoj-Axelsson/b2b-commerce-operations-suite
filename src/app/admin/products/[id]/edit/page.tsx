import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "../../ProductForm";

export const metadata = {
  title: "Edit Product — Admin | Rajput Foods",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        brand: true,
        articleNo: true,
        description: true,
        imageUrl: true,
        price: true,
        weightValue: true,
        weightUnit: true,
        quantity: true,
        minQuantity: true,
        categoryId: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="space-y-6">

      <nav className="text-sm text-gray-500">
        <Link href="/admin/products" className="hover:text-gray-800 transition-colors">
          Products
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800 font-semibold">Edit: {product.name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>

      <ProductForm categories={categories} product={product} />
    </main>
  );
}
