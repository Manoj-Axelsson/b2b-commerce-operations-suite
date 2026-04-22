import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { DeleteProductButton } from "./DeleteProductButton";
import { ToggleVisibilityButton } from "./ToggleVisibilityButton";

export const metadata = {
  title: "Products — Admin | Rajput Foods",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: {
      category: { select: { name: true } },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
        >
          + Add Product
        </Link>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-[11px]">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-right">Price (öre)</th>
              <th className="p-4 text-center">Visibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const hasOrders = product._count.orderItems > 0;

              return (
                <tr key={product.id} className="hover:bg-gray-50 transition align-middle">

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border bg-gray-50 shrink-0 overflow-hidden relative">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                            sizes="40px"
                          />
                        ) : (
                          <span className="text-[8px] text-gray-300 italic flex items-center justify-center h-full">
                            No img
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-gray-400 text-xs font-mono">{product.articleNo}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-gray-600">{product.category.name}</td>

                  <td className="p-4 text-center">
                    <span className={`font-bold text-xs ${product.quantity <= 0
                        ? "text-red-600"
                        : product.quantity <= product.minQuantity
                          ? "text-orange-500"
                          : "text-green-700"
                      }`}>
                      {product.quantity}
                    </span>
                    <span className="text-gray-300 text-xs"> / {product.minQuantity} min</span>
                  </td>

                  <td className="p-4 text-right font-mono text-gray-700">{product.price}</td>

                  <td className="p-4 text-center">
                    <ToggleVisibilityButton id={product.id} isActive={product.isActive} />
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs text-blue-600 hover:underline font-bold"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={product.id} hasOrders={hasOrders} />
                    </div>
                  </td>

                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                  No products yet. Add your first product to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
