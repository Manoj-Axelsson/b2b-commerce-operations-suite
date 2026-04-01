// src/components/AdminSidebar.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/auth-actions"; // Importera din nya logout-action

export async function AdminSidebar() {
  const user = await getCurrentUser();

  // Om ingen användare eller fel roll, visa inget
  if (!user || (user.role !== "ADMIN" && user.role !== "SHOP_KEEPER")) {
    return null;
  }

  const isAdmin = user.role === "ADMIN";
  const isShopOwner = user.role === "SHOP_KEEPER";

  return (
    <aside className="w-64 border-r p-4 flex flex-col h-full bg-white">
      <div className="font-bold text-xl mb-6">Admin Panel</div>
      
      <nav className="flex-1 space-y-2 text-sm">
        <Link 
          href="/admin/inventory" 
          className="block p-2 hover:bg-gray-100 rounded transition-colors"
        >
          Inventory
        </Link>
        <Link 
          href="/admin/orders" 
          className="block p-2 hover:bg-gray-100 rounded transition-colors"
        >
          Orders
        </Link>
        <Link 
          href="/admin/customers" 
          className="block p-2 hover:bg-gray-100 rounded transition-colors"
        >
          Customers
        </Link>

        {/* Verktyg för Shop Owner */}
        {isShopOwner && (
          <div className="pt-4 mt-4 border-t">
            <div className="font-semibold px-2 mb-2 text-gray-500 uppercase text-xs tracking-wider">
              Shop owner tools
            </div>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded transition-colors">
              View stock levels
            </button>
          </div>
        )}

        {/* Verktyg för Admin */}
        {isAdmin && (
          <div className="pt-4 mt-2 border-t">
            <div className="font-semibold px-2 mb-2 text-gray-500 uppercase text-xs tracking-wider">
              Admin tools
            </div>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded transition-colors">
              System settings
            </button>
            <button className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
              Delete customer
            </button>
          </div>
        )}
      </nav>

      {/* Utloggningssektion längst ner */}
      <div className="pt-4 border-t mt-auto">
        <div className="px-2 mb-2">
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <p className="text-[10px] font-bold text-blue-600">{user.role}</p>
        </div>
        <form action={logout}>
          <button 
            type="submit"
            className="w-full text-left p-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
          >
            <span>Log out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
