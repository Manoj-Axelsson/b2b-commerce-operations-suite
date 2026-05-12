import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<OrderStatus, string> = {
  IN_PROCESS: "In Review",
  AWAITING_PAYMENT: "Awaiting Payment",
  CONFIRMED: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  IN_PROCESS: "bg-blue-100 text-blue-700",
  AWAITING_PAYMENT: "bg-orange-100 text-orange-700",
  CONFIRMED: "bg-green-100 text-green-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function UserOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return (
    <div className="min-h-screen bg-brand-cream p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
            <Link href="/account" className="p-2 hover:bg-white rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </Link>
            <h1 className="text-3xl font-serif font-bold text-brand-primary">My Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
               </svg>
            </div>
            <p className="text-slate-600 mb-6">You haven't placed any orders yet.</p>
            <Link href="/shop" className="inline-block bg-brand-primary text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-gold-dark transition-colors">
                Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Link 
                key={order.id} 
                href={`/account/orders/${order.id}`}
                className="block bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-brand-primary hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="p-6">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <div>
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">Order ID: {order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-sm font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString("sv-SE", { dateStyle: "long" })}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                        <div className="flex -space-x-3 overflow-hidden">
                             {/* Small product preview avatars or just icons */}
                             <div className="w-10 h-10 bg-brand-cream border-2 border-white rounded-full flex items-center justify-center text-brand-primary text-xs font-bold">
                                {order.items.length}
                             </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500">
                                {order.items.map(i => i.productName).join(", ").slice(0, 60)}
                                {order.items.length > 2 && "..."}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="text-lg font-bold text-brand-primary">{formatCurrency(Number(order.totalPrice))}</p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end text-xs font-bold text-brand-primary uppercase tracking-widest group-hover:gap-2 transition-all">
                        <span>View Details</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
