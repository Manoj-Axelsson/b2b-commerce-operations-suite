import prisma from "@/lib/prisma";
import { StockButton } from "@/components/admin/StockButton";
import { NotificationStatus } from "./types/schema";

// Logic for 3-day window notifications (Offers starting or ending)

function getPromotionNotification(start: Date | null, end: Date | null): NotificationStatus {
  if (!start || !end) return "STABLE";
  const now = new Date();
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

  const msToStart = start.getTime() - now.getTime();
  const msToEnd = end.getTime() - now.getTime();

  if (msToStart > 0 && msToStart <= threeDaysInMs) return "STARTING_SOON";
  if (msToEnd > 0 && msToEnd <= threeDaysInMs) return "ENDING_SOON";
  if (now > end) return "EXPIRED";

  return "STABLE";
}

function getStockStatus(quantity: number, minQuantity: number) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= minQuantity) return "Required Restocking";
  return "OK";
}

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  const restockNeeded = products.filter((p) => p.quantity <= p.minQuantity);

  // Filter for products that have a 3-day notification (Starting or Ending)

  const priorityPromotions = products.filter((p) => {
    const status = getPromotionNotification(p.discountStart, p.discountEnd);
    return status === "STARTING_SOON" || status === "ENDING_SOON";
  });

  return (
    <main className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Rajput Foods Inventory</h1>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Total items: {products.length}
          </span>
        </div>
      </div>

// NEW SECTION: Promotion Alerts (The 3-Day Rule)

      {priorityPromotions.length > 0 && (
        <section className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
            Promotion Alerts (3-Day Window)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityPromotions.map((p) => {
              const status = getPromotionNotification(p.discountStart, p.discountEnd);
              return (
                <div key={p.id} className="bg-white p-3 rounded shadow-sm border border-amber-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.brand}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status === "STARTING_SOON" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    }`}>
                    {status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

// Existing Restocking Table

      <section>
        <h2 className="text-xl font-semibold mb-3 text-red-600">Restocking required ({restockNeeded.length})</h2>
        <div className="overflow-x-auto rounded-lg border shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-left">Item Nr</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-center">Stock Level</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {restockNeeded.map((p) => (
                <tr key={p.id} className="border-t hover:bg-red-50 transition-colors">
                  <td className="p-3 font-mono text-xs text-gray-400">{p.articleNo}</td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 flex justify-center">
                    <StockButton productId={p.id} currentStock={p.quantity} />
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
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