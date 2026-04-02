 //src/app/admin/inventory/page.tsx

import prisma from "@/lib/prisma";
import { StockButton } from "@/components/admin/StockButton";

function getStockStatus(quantity: number, minQuantity: number) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= minQuantity) return "Required Restocking";
  return "OK";
}

export default async function AdminInventoryPage() {
  

  // Hämta produkter via Prisma
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Dela upp produkter baserat på lagernivå för de två tabellerna
  const restockNeeded = products.filter(
    (p) => p.quantity <= p.minQuantity
  );
  const okStock = products.filter((p) => p.quantity > p.minQuantity);

  return (
    <main className="p-6 space-y-8">
      <div className="bg-yellow-100 p-2 text-xs text-yellow-800 rounded border border-yellow-200">
        ⚠️ <strong>AUTH ACTIVATED:</strong> This is in (Real Mode).
      </div>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Stock Balance</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Totalt items: {products.length}
        </span>
      </div>

      {/* SEKTION: PÅFYLLNING BEHÖVS */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-red-600 flex items-center gap-2">
          🔴 Restocking required ({restockNeeded.length})
        </h2>
        {restockNeeded.length === 0 ? (
          <p className="text-gray-500 italic bg-gray-50 p-4 rounded border">All products have good stock levels.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border shadow-sm">
            <table className="min-w-full text-sm bg-white">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 text-left font-semibold">Itemnr</th>
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Brand</th>
                  <th className="p-3 text-center font-semibold">Stock Level</th>
                  <th className="p-3 text-right font-semibold text-gray-500">Min. Level</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {restockNeeded.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-red-50 transition-colors">
                    <td className="p-3 font-mono text-xs text-gray-500">{p.articleNo}</td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-gray-600">{p.brand}</td>
                    <td className="p-3 flex justify-center">
                      <StockButton productId={p.id} currentStock={p.quantity} />
                    </td>
                    <td className="p-3 text-right text-gray-400 italic">{p.minQuantity}</td>
                    <td className="p-3 text-left">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 whitespace-nowrap">
                        {getStockStatus(p.quantity, p.minQuantity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SEKTION: ALLA PRODUKTER */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">OK Stock level ({okStock.length})</h2>
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <table className="min-w-full text-sm bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-left font-semibold">Itemnr</th>
                <th className="p-3 text-left font-semibold">Name</th>
                <th className="p-3 text-left font-semibold">Brand</th>
                <th className="p-3 text-center font-semibold">Stock Level</th>
                <th className="p-3 text-right font-semibold text-gray-500">Min. Level</th>
                <th className="p-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {okStock.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-mono text-xs text-gray-500">{p.articleNo}</td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-gray-600">{p.brand}</td>
                  <td className="p-3 flex justify-center">
                    <StockButton productId={p.id} currentStock={p.quantity} />
                  </td>
                  <td className="p-3 text-right text-gray-400">{p.minQuantity}</td>
                  <td className="p-3 text-left">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
                      {getStockStatus(p.quantity, p.minQuantity)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}