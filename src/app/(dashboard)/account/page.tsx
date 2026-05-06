import { redirect } from "next/navigation";
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

        <LogoutButton />
      </div>
    </div>
  );
}