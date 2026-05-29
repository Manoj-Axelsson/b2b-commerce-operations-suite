import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders — Admin | Rajput Foods",
};
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_EMAIL } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { updateOrderStatus, addAdjustmentAction, removeAdjustmentAction, markOrderAsPaid } from "./actions";
import { OrderStatus, AdjustmentType } from "@/generated/prisma/client";
import { ORDER_TRANSITIONS } from "@/modules/orders/order.machine";
import Link from "next/link";

const STATUS_STYLES: Record<OrderStatus, string> = {
  IN_PROCESS: "bg-yellow-100 text-yellow-800",
  AWAITING_PAYMENT: "bg-indigo-100 text-indigo-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  IN_PROCESS: "In Process",
  AWAITING_PAYMENT: "Awaiting Payment",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.status || "ALL";

  const session = await auth.api.getSession({ headers: await headers() });

  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.role === "admin";
  if (!session || !isAdmin) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, articleNo: true } },
        },
      },
      adjustments: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  const counts = {
    ALL: orders.length,
    IN_REVIEW: orders.filter(o => o.status === "IN_PROCESS").length,
    AWAITING_PAYMENT: orders.filter(o => o.status === "AWAITING_PAYMENT").length,
    TO_SHIP: orders.filter(o => o.status === "CONFIRMED").length,
    COMPLETED_CANCELLED: orders.filter(o => ["DELIVERED", "SHIPPED", "CANCELLED"].includes(o.status)).length,
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === "in_review") return o.status === "IN_PROCESS";
    if (activeTab === "awaiting_payment") return o.status === "AWAITING_PAYMENT";
    if (activeTab === "to_ship") return o.status === "CONFIRMED";
    if (activeTab === "completed_cancelled") return ["DELIVERED", "SHIPPED", "CANCELLED"].includes(o.status);
    return true; // ALL
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <Link
          href="/admin/orders"
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === "ALL" || !activeTab
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          All ({counts.ALL})
        </Link>
        <Link
          href="?status=in_review"
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === "in_review"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          In Review ({counts.IN_REVIEW})
        </Link>
        <Link
          href="?status=awaiting_payment"
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === "awaiting_payment"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Awaiting Payment ({counts.AWAITING_PAYMENT})
        </Link>
        <Link
          href="?status=to_ship"
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === "to_ship"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          To Ship ({counts.TO_SHIP})
        </Link>
        <Link
          href="?status=completed_cancelled"
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === "completed_cancelled"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Completed / Cancelled ({counts.COMPLETED_CANCELLED})
        </Link>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 italic bg-gray-50 p-6 rounded border text-center">
          No orders found.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >
              {/* Order header */}
              <div className="flex flex-wrap justify-between items-start gap-4 p-4 border-b bg-gray-50">
                <div>
                  <p className="text-xs font-mono text-gray-400">{order.id}</p>
                  <p className="font-semibold text-gray-900">
                    {order.user.name}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({order.user.email})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleString("sv-SE")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>

                  {/* Status update form */}
                  {ORDER_TRANSITIONS[order.status].length > 0 && (
                    <form action={updateOrderStatus} className="flex items-center gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <input
                        type="text"
                        name="notes"
                        placeholder="Reason/Notes (optional)..."
                        className="text-xs border rounded px-2 py-1 w-48 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="text-xs border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value={order.status} disabled>
                          {STATUS_LABELS[order.status]} (Current)
                        </option>
                        {ORDER_TRANSITIONS[order.status].map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-xs bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-3 py-1 rounded transition-colors"
                      >
                        Update
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Payment Info Overlay */}
              <div className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold flex flex-wrap justify-between items-center gap-2 ${
                order.status === "CANCELLED" && order.paymentStatus === "RECEIVED"
                  ? "bg-gray-500 text-white"
                  : order.paymentStatus === "RECEIVED"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}>
                <div className="flex items-center gap-3">
                  <span>Payment: {order.paymentStatus}</span>
                  {order.paymentReceivedAt && (
                    <span>Received: {new Date(order.paymentReceivedAt).toLocaleDateString()}</span>
                  )}
                  {order.status === "CANCELLED" && order.paymentStatus === "RECEIVED" && (
                    <span className="ml-4 bg-red-600 text-white px-2 py-0.5 rounded font-extrabold animate-pulse text-[9px]">
                      ⚠️ Refund Required
                    </span>
                  )}
                </div>
                {order.paymentStatus !== "RECEIVED" && order.status !== "CANCELLED" && (
                  <form action={markOrderAsPaid} className="flex items-center">
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Mark as Paid
                    </button>
                  </form>
                )}
              </div>

              {/* Delivery address */}
              <div className="px-4 py-2 bg-blue-50 border-b text-xs text-gray-600">
                📦 {order.deliveryStreet}, {order.deliveryPostalCode}{" "}
                {order.deliveryCity}, {order.deliveryCountry}
              </div>

              {/* Order items */}
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Article
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="p-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono text-xs text-gray-400">
                        {item.product.articleNo}
                      </td>
                      <td className="p-3 text-gray-800">{item.productName}</td>
                      <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-700 font-medium">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-gray-500">
                      Subtotal
                    </td>
                    <td className="p-3 text-right text-gray-700">
                      {formatCurrency(Number(order.subtotalPrice))}
                    </td>
                  </tr>
                  {order.adjustments.map((adj) => (
                    <tr key={adj.id} className="text-xs">
                      <td colSpan={3} className="p-3 text-right italic text-gray-500">
                        <div className="flex items-center justify-end gap-2">
                          {adj.description || adj.type}
                          <form action={removeAdjustmentAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="adjustmentId" value={adj.id} />
                            <button type="submit" className="text-red-500 hover:text-red-700">
                              ✕
                            </button>
                          </form>
                        </div>
                      </td>
                      <td className={`p-3 text-right ${Number(adj.amount) < 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(Number(adj.amount))}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2">
                    <td colSpan={3} className="p-3 text-right font-bold text-gray-700">
                      Total
                    </td>
                    <td className="p-3 text-right font-bold text-gray-900 text-lg">
                      {formatCurrency(Number(order.totalPrice))}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Manage Financials (Only if IN_PROCESS) */}
              {order.status === "IN_PROCESS" && (
                <div className="p-4 bg-yellow-50 border-t">
                  <h4 className="text-xs font-bold text-yellow-800 uppercase mb-3">Add Financial Adjustment</h4>
                  <form action={addAdjustmentAction} className="flex flex-wrap items-center gap-4">
                    <input type="hidden" name="orderId" value={order.id} />
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-yellow-700 font-bold">Type</label>
                      <select name="type" className="text-xs border rounded p-1">
                        <option value={AdjustmentType.DELIVERY_FEE}>Delivery Fee</option>
                        <option value={AdjustmentType.DISCOUNT}>Discount</option>
                        <option value={AdjustmentType.LOGISTICS}>Logistics</option>
                        <option value={AdjustmentType.HANDLING_FEE}>Handling Fee</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-yellow-700 font-bold">Amount (SEK)</label>
                      <input 
                        type="number" 
                        name="amount" 
                        step="0.01" 
                        placeholder="e.g. 79.00"
                        className="text-xs border rounded p-1 w-24"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[10px] text-yellow-700 font-bold">Description</label>
                      <input 
                        type="text" 
                        name="description" 
                        placeholder="e.g. Express Delivery"
                        className="text-xs border rounded p-1 w-full"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="bg-yellow-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                    >
                      Add Adjustment
                    </button>
                  </form>
                </div>
              )}

              {/* Order Timeline / Audit Log */}
              <div className="p-4 bg-gray-50 border-t">
                <details className="group">
                  <summary className="text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-2">
                    <span>Audit Trail / History</span>
                    <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 space-y-3">
                    {order.events.map((event) => (
                      <div key={event.id} className="text-[10px] border-l-2 border-gray-200 pl-3 py-1">
                        <div className="flex justify-between font-mono text-gray-400">
                          <span>{new Date(event.createdAt).toLocaleString("sv-SE")}</span>
                          <span>{event.actorRole}</span>
                        </div>
                        <p className="text-gray-700 mt-0.5">
                          {event.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
