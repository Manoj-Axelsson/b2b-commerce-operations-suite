// src/app/admin/layout.tsx
import Link from "next/link";
import { auth } from "@/lib/auth/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/lib/auth-actions"; // Se till att denna fil finns

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Kontrollera behörighet: Endast ADMIN får se denna layout
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-yellow-50 p-4 border-r border-yellow-200 flex flex-col justify-between">
        <nav className="flex flex-col gap-2">
          <h2 className="font-bold mb-2 text-yellow-800">Admin Panel</h2>
          <div className="text-[10px] bg-yellow-200 p-1 mb-4 rounded font-mono text-center">
            AUTH ACTIVATED
          </div>
          
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

        {/* Nedre sektion med användarinfo och logout */}
        <div className="pt-4 border-t border-yellow-200">
          <div className="px-2 mb-4">
            <p className="text-xs text-yellow-700 truncate font-medium">
              {session.user.email}
            </p>
            <p className="text-[10px] text-yellow-600 uppercase tracking-wider">
              {session.user.role}
            </p>
          </div>
          
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

      {/* Huvudinnehåll */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}






/*
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- DEVELOPMENT OVERRIDE START ---
  // Om du vill se sidan direkt utan inloggning under utveckling, 
  // ändra false till true här:
  const SKIP_AUTH = false; 
  if (SKIP_AUTH && process.env.NODE_ENV !== "production") {
    return (
      <div className="admin-layout flex min-h-screen">
        <aside className="w-64 bg-yellow-50 p-4 border-r border-yellow-200">
          <nav className="flex flex-col gap-2">
            <h2 className="font-bold mb-2 text-yellow-800">Admin Panel (Dev)</h2>
            <div className="text-[10px] bg-yellow-200 p-1 mb-4 rounded">AUTH DEACTIVATED</div>
            <Link href="/admin/inventory" className="p-2 hover:bg-yellow-100 rounded">Stock level</Link>
            <Link href="/admin/products" className="p-2 hover:bg-yellow-100 rounded">Products</Link>
            <Link href="/admin/orders" className="p-2 hover:bg-yellow-100 rounded">Orders</Link>
            <Link href="/admin/customers" className="p-2 hover:bg-yellow-100 rounded">Customers</Link>
          </nav>
        </aside>
        <main className="flex-1 p-8 bg-white">{children}</main>
      </div>
    );
  }
  // --- DEVELOPMENT OVERRIDE SLUT ---

  // 1. Hämta sessionstoken asynkront (Next.js 16/15+)
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // 2. Verifiera sessionen mot databasen
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  // 3. Kontrollera giltighet och utgångsdatum
  if (!session || new Date() > session.expiresAt) {
    redirect("/login");
  }

  // 4. Kontrollera ADMIN-roll (skiftlägeskänsligt i Prisma 7)
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="admin-layout flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r shadow-inner">
        <nav className="flex flex-col gap-2">
          <h2 className="font-bold mb-4 px-2">Admin Panel</h2>
          <Link href="/admin/inventory" className="p-2 hover:bg-white rounded transition-all">Stock level</Link>
          <Link href="/admin/products" className="p-2 hover:bg-white rounded transition-all">Products</Link>
          <Link href="/admin/orders" className="p-2 hover:bg-white rounded transition-all">Orders</Link>
          <Link href="/admin/customers" className="p-2 hover:bg-yellow-100 rounded">Customers</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
          {children}
        </div>
      </main>
    </div>
  );
}

*/