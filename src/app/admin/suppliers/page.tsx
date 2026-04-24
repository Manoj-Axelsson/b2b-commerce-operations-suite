import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_EMAIL } from "@/lib/utils";
import { saveSupplier, deleteSupplier } from "./actions";

export default async function AdminSuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ editId?: string; create?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.email !== ADMIN_EMAIL) redirect("/login");

  const params = await searchParams;
  const editId = params.editId;
  const isCreating = params.create === "true";

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const editingSupplier = editId ? suppliers.find((s) => s.id === editId) : null;

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
        <Link
          href="?create=true"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded text-sm transition-colors"
        >
          + Add Supplier
        </Link>
      </div>

      {/* Create / Edit form */}
      {(isCreating || editingSupplier) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-yellow-900">
            {editingSupplier ? `Edit: ${editingSupplier.name}` : "New Supplier"}
          </h2>
          <form action={saveSupplier} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" name="id" value={editingSupplier?.id || ""} />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-yellow-800 uppercase">Name *</label>
              <input
                name="name"
                defaultValue={editingSupplier?.name || ""}
                required
                className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-yellow-800 uppercase">Email *</label>
              <input
                name="email"
                type="email"
                defaultValue={editingSupplier?.email || ""}
                required
                className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="md:col-span-2 flex gap-2 pt-2 border-t border-yellow-200">
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded transition-colors"
              >
                Save
              </button>
              <Link
                href="/admin/suppliers"
                className="bg-white border border-gray-300 text-gray-600 px-6 py-2 rounded text-sm"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Supplier list */}
      <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
        {suppliers.length === 0 ? (
          <p className="p-6 text-center text-gray-400 italic">
            No suppliers yet. Add one to enable re-order emails from the inventory page.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="p-4 text-left">Supplier</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-center">Products</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">{s.name}</td>
                  <td className="p-4 text-gray-600">{s.email}</td>
                  <td className="p-4 text-center">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                      {s._count.products}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-4">
                      <Link
                        href={`?editId=${s.id}`}
                        className="text-blue-600 hover:underline text-xs font-semibold"
                      >
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteSupplier(s.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
