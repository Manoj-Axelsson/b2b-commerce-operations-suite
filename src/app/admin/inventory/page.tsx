import { prisma } from "@/lib/prisma";
import { StockButton } from "@/components/admin/StockButton";
import { cn } from "@/lib/utils";
import { PromotionAlert } from "./types/schema";
import { Suspense } from "react";
import { InventoryFilters } from "./components/InventoryFilters";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory — Admin | Rajput Foods",
};

// Logic for 3-day window notifications (Offers starting or ending)



function getPromotionNotification(start: Date | null, end: Date | null): PromotionAlert | null {
  if (!start || !end) return null;
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

  if (now >= start && now <= end) {
    return { status: "ACTIVE" };
  }

  return null;
}

function getStockStatus(quantity: number, minQuantity: number) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= minQuantity) return "Required Restocking";
  return "OK";
}

interface AdminInventoryPageProps {
  searchParams: Promise<{
    name?: string;
    sort?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminInventoryPage({ searchParams }: AdminInventoryPageProps) {
  const params = await searchParams;
  const { name = "", sort = "", category = "", page = "1" } = params;
  const currentPage = parseInt(page, 10) || 1;
  const pageSize = 50;

  // 1. Fetch only essential data for alerts and categories
  // We fetch ALL active products but only specific fields to calculate alerts without heavy overhead
  const [allRelevantProducts, categories, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: { isDeleted: false },
      select: { 
        id: true, name: true, brand: true, articleNo: true,
        quantity: true, minQuantity: true, 
        discountStart: true, discountEnd: true 
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.count({
      where: {
        isDeleted: false,
        ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
        ...(category ? { categoryId: category } : {}),
      },
    }),
  ]);

  // 2. Fetch the paginated products that are needed for the table
  const [_products, pendingOrders] = await Promise.all([
    prisma.product.findMany({
      where: {
        isDeleted: false,
        ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
        ...(category ? { categoryId: category } : {}),
      },
      orderBy:
        sort === "price_asc" ? { price: "asc" } :
          sort === "price_desc" ? { price: "desc" } :
            { name: "asc" },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    }),
    prisma.order.findMany({
      where: { status: "IN_PROCESS" },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const restockNeeded = allRelevantProducts.filter((p) => p.quantity <= p.minQuantity);
  const priorityPromotions = allRelevantProducts.filter((p) => {
    const alert = getPromotionNotification(p.discountStart, p.discountEnd);
    return alert !== null;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <main className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-rajput-gold">Admin Command Center</h1>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Inventory: {allRelevantProducts.length} items
          </span>
        </div>
      </div>

      <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse rounded-lg" />}>
        <InventoryFilters categories={categories} />
      </Suspense>

      {/* ALERT CENTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NEW SECTION: Order Request Alerts */}
        {pendingOrders.length > 0 && (
          <section className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              New Order Requests ({pendingOrders.length})
            </h2>
            <div className="flex flex-col gap-2 max-h-75 overflow-y-auto">
              {pendingOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders?orderId=${order.id}`}
                  className="bg-white p-3 rounded shadow-sm border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all flex justify-between items-center group"
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm text-blue-900 group-hover:text-blue-600">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">{order.user.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("sv-SE")}
                    </p>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Review Request →</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: Promotion Alerts (The 3-Day Rule) */}
        {priorityPromotions.length > 0 && (
          <section className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              Promotion Alerts ({priorityPromotions.length})
            </h2>
            <div className="flex flex-col gap-2 max-h-75 overflow-y-auto">
              {priorityPromotions.map((p) => {
                const alert = getPromotionNotification(p.discountStart, p.discountEnd);
                if (!alert) return null;
                const isUrgent = alert.isUrgent;

                return (
                  <div key={p.id} className={cn(
                    "bg-white p-2 px-4 rounded shadow-sm border flex items-center gap-4 transition-all w-full",
                    isUrgent ? "border-red-400 ring-2 ring-red-100 animate-pulse" : "border-amber-100"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      isUrgent ? "bg-red-500" : "bg-amber-400"
                    )} />

                    <div className="flex-1">
                      <p className="font-medium text-sm inline-block mr-2">{p.name}</p>
                      <span className="text-xs text-gray-400">{p.brand}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        alert.status === "STARTING_SOON" ? "bg-blue-100 text-blue-700" :
                          alert.status === "ENDING_SOON" ? "bg-orange-100 text-orange-700" :
                            "bg-green-100 text-green-700",
                        isUrgent && "bg-red-600 text-white"
                      )}>
                        {alert.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4 pb-8">
          <Link
            href={`/admin/inventory?${new URLSearchParams({ ...params, page: (currentPage - 1).toString() })}`}
            className={cn(
              "px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
              currentPage <= 1 ? "pointer-events-none opacity-50 bg-gray-50" : "hover:bg-gray-100"
            )}
          >
            Previous
          </Link>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={`/admin/inventory?${new URLSearchParams({ ...params, page: (currentPage + 1).toString() })}`}
            className={cn(
              "px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
              currentPage >= totalPages ? "pointer-events-none opacity-50 bg-gray-50" : "hover:bg-gray-100"
            )}
          >
            Next
          </Link>
        </div>
      )}

    </main>
  );
}