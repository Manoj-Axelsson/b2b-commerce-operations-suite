import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/lib/auth-actions";
import { ADMIN_EMAIL } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Only the hardcoded admin email can access this panel.
  // No database role check — email is the single source of truth.
  if (session.user.email !== ADMIN_EMAIL) {
    redirect("/login");
  }

  const user = { email: session.user.email };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-yellow-50 p-4 border-r border-yellow-200 flex flex-col justify-between">
        <nav className="flex flex-col gap-2">
          <h2 className="font-bold mb-2 text-yellow-800">Admin Panel</h2>

          <Link href="/admin/inventory" className="p-2 hover:bg-yellow-100 rounded transition-colors text-sm">
            Stock level
          </Link>
          <Link href="/admin/products" className="p-2 hover:bg-yellow-100 rounded transition-colors text-sm">
            Products
          </Link>
          <Link href="/admin/orders" className="p-2 hover:bg-yellow-100 rounded transition-colors text-sm">
            Orders
          </Link>
          <Link href="/admin/customers" className="p-2 hover:bg-yellow-100 rounded transition-colors text-sm">
            Customers
          </Link>
        </nav>

        <div className="pt-4 border-t border-yellow-200">
          <div className="px-2 mb-4">
            <p className="text-xs text-yellow-700 truncate font-medium">
              {user.email}
            </p>
            <p className="text-[10px] text-yellow-600 uppercase tracking-wider">
              Admin
            </p>
          </div>

          <Link
            href="/admin/two-factor-setup"
            className="block p-2 text-xs text-yellow-700 hover:bg-yellow-100 rounded transition-colors mb-2"
          >
            🔐 Manage 2FA
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left p-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
