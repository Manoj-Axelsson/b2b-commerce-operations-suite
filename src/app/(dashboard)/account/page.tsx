import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { LogoutButton } from "./LogoutButton";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">My Account</h1>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
            <p><strong>Admin Approved:</strong> {user.isApproved ? "Yes" : "Pending admin approval"}</p>
          </div>
        </div>

        {!user.isApproved && (
          <div className="p-4 bg-yellow-100 text-yellow-800 text-sm rounded">
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