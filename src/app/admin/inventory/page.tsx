import prisma from "@/lib/prisma";
import { StockButton } from "@/components/admin/StockButton";
import { cn } from "@/lib/utils";
import { PromotionAlert } from "./types/schema";

// Logic for 3-day window notifications (Offers starting or ending)

function formatMsRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  const hLabel = hours === 1 ? "one hour" : `${hours} hours`;
  const mLabel = minutes === 1 ? "one minute" : `${minutes} minutes`;

  if (hours > 0) return `${hLabel} and ${mLabel}`;
  return mLabel;
}

function getPromotionNotification(start: Date | null, end: Date | null): PromotionAlert {
  if (!start || !end) return { status: "STABLE" };
  const now = new Date();
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  const eightHoursInMs = 8 * 60 * 60 * 1000;

  const msToStart = start.getTime() - now.getTime();
  const msToEnd = end.getTime() - now.getTime();

  if (msToStart > 0 && msToStart <= threeDaysInMs) {
    return {
      status: "STARTING_SOON",
      msRemaining: msToStart,
      isUrgent: msToStart <= eightHoursInMs
    };
  }

  if (msToEnd > 0 && msToEnd <= threeDaysInMs) {
    return {
      status: "ENDING_SOON",
      msRemaining: msToEnd,
      isUrgent: msToEnd <= eightHoursInMs
    };
  }

  if (now > end) return { status: "EXPIRED" };

  return { status: "STABLE" };
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
    const alert = getPromotionNotification(p.discountStart, p.discountEnd);
    return alert.status === "STARTING_SOON" || alert.status === "ENDING_SOON";
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

      {/* NEW SECTION: Promotion Alerts (The 3-Day Rule) */}

      {priorityPromotions.length > 0 && (
        <section className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
            Promotion Alerts (3-Day Window)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityPromotions.map((p) => {
              const alert = getPromotionNotification(p.discountStart, p.discountEnd);
              const isUrgent = alert.isUrgent;

              return (
                <div key={p.id} className={cn(
                  "bg-white p-3 rounded shadow-sm border flex justify-between items-center transition-all",
                  isUrgent ? "border-red-400 ring-2 ring-red-100 animate-pulse" : "border-amber-100"
                )}>
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.brand}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      alert.status === "STARTING_SOON" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700",
                      isUrgent && "bg-red-600 text-white"
                    )}>
                      {alert.status.replace("_", " ")}
                    </span>
                    {alert.msRemaining && (
                      <span className="text-[10px] font-mono text-gray-400">
                        {isUrgent ? "URGENT: " : ""}{formatMsRemaining(alert.msRemaining)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Existing Restocking Table */}

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