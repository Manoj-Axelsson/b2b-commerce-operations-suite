import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/utils";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [user, latestOrder, activePromotions] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.order.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        discountPrice: { not: null },
        OR: [
          { discountStart: null },
          // eslint-disable-next-line react-hooks/purity
          { discountStart: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } } // Starting in next 3 days
        ],
        AND: [
          // eslint-disable-next-line react-hooks/purity
          { OR: [{ discountEnd: null }, { discountEnd: { gte: new Date() } }] }
        ]
      },
      take: 4,
      orderBy: { discountStart: "asc" }
    })
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">My Account</h1>

        {/* PROMOTION SECTION */}
        {activePromotions.length > 0 && (
          <section className="bg-brand-cream border border-brand-primary/20 rounded-3xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-brand-primary flex items-center gap-2 uppercase tracking-widest">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Special Offers For You
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {activePromotions.map((product) => {
                const isUpcoming = product.discountStart && product.discountStart > new Date();
                return (
                  <div key={product.id} className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-white flex justify-between items-center group hover:bg-white transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{product.name}</p>
                      <p className="text-[10px] text-slate-500">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        isUpcoming ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                      )}>
                        {isUpcoming ? "Coming Soon" : "Active Sale"}
                      </span>
                      <p className="text-xs font-bold text-brand-primary mt-1">
                        View Item →
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href="/shop" className="block text-center text-xs font-bold text-brand-primary hover:underline pt-2">
              Browse All Deals
            </Link>
          </section>
        )}

        {/* NOTIFICATION SECTION */}
        {latestOrder && (
          <div className="space-y-4">
            {latestOrder.status === "AWAITING_PAYMENT" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Action Required: Payment</p>
                    <p className="text-xs text-blue-700">Order #{latestOrder.id.slice(-6).toUpperCase()} is ready for payment.</p>
                  </div>
                </div>
                <Link href="/account/orders" className="text-xs font-bold text-blue-600 hover:underline">Pay Now →</Link>
              </div>
            )}

            {latestOrder.status === "SHIPPED" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V9.414a1 1 0 00-.293-.707l-2.414-2.414A1 1 0 0016.586 6H14z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-900">Order Shipped!</p>
                    <p className="text-xs text-green-700">Order #{latestOrder.id.slice(-6).toUpperCase()} is on its way to you.</p>
                  </div>
                </div>
                <Link href="/account/orders" className="text-xs font-bold text-green-600 hover:underline">Track Order →</Link>
              </div>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
            <p><strong>Admin Approved:</strong> {user.isApproved ? "Yes" : "Pending admin approval"}</p>
          </div>
        </div>

        {!user.isApproved && (
          <div className="p-4 bg-yellow-100 text-yellow-800 text-sm rounded-2xl border border-yellow-200">
            Your account is awaiting admin approval. You can browse, but cannot place orders or view full pricing.
          </div>
        )}

        <div className="space-y-4">
          <Link 
            href="/account/orders"
            className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-brand-primary transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">My Orders</p>
                <p className="text-xs text-slate-500">Track your current requests and view history</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}