// src/components/AdminSidebar.tsx
import Link from "next/link";
import { getCurrentUser, logout } from "@/lib/auth-actions";

export async function AdminSidebar() {
  const user = await getCurrentUser();

  // Standard: Role-based access control at the component level
  if (!user || (user.role !== "ADMIN" && user.role !== "SHOP_KEEPER")) {
    return null;
  }

  const isAdmin = user.role === "ADMIN";
  const isShopOwner = user.role === "SHOP_KEEPER";

  return (
    <aside className="hidden md:flex w-64 border-r p-4 flex-col h-full bg-white">
      <div className="font-bold text-xl mb-6 px-2">Admin Panel</div>
      
      <nav className="flex-1 space-y-1 text-sm">
        <Link 
          href="/admin/inventory" 
          className="block p-2 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          Inventory
        </Link>
        <Link 
          href="/admin/orders" 
          className="block p-2 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          Orders
        </Link>
        <Link 
          href="/admin/customers" 
          className="block p-2 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          Customers
        </Link>

        {/* Shop Owner Tools */}
        {isShopOwner && (
          <div className="pt-6 mt-4 border-t border-gray-50">
            <div className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Shop Owner
            </div>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors">
              Stock Alerts
            </button>
          </div>
        )}

        {/* Admin Tools */}
        {isAdmin && (
          <div className="pt-6 mt-4 border-t border-gray-50">
            <div className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              System Admin
            </div>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors">
              Settings
            </button>
            <button className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Security Logs
            </button>
          </div>
        )}
      </nav>

      {/* User & Logout Section */}
      <div className="pt-4 border-t border-gray-100 mt-auto">
        <div className="px-2 mb-4">
          <p className="text-xs text-gray-500 truncate max-w-full font-medium">{user.email}</p>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-[9px] font-black text-blue-600 uppercase">
            {user.role}
          </span>
        </div>
        <form action={logout}>
          <button 
            type="submit"
            className="w-full text-left p-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:translate-x-1 transition-transform">🚪 Log out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
