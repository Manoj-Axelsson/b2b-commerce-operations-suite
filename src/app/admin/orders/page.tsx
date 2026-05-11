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
import { updateOrderStatus } from "./actions";
type OrderStatus = "IN_PROCESS" | "AWAITING_PAYMENT" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_STYLES: Record<OrderStatus, string> = {
  IN_PROCESS: "bg-yellow-100 text-yellow-800",
  AWAITING_PAYMENT: "bg-orange-100 text-orange-800",
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

export default async function AdminOrdersPage() {
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
    },
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Total: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500 italic bg-gray-50 p-6 rounded border text-center">
          No orders yet.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
                  <form action={updateOrderStatus} className="flex items-center gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="text-xs border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
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
                </div>
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
                    <td colSpan={3} className="p-3 text-right font-bold text-gray-700">
                      Total
                    </td>
                    <td className="p-3 text-right font-bold text-gray-900">
                      {formatCurrency(Number(order.totalPrice))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
