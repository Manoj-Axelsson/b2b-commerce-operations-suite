import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { saveCustomer } from "./actions";
import Link from "next/link";
import { DeleteButton } from "./DeleteButton";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string | null;
  isRegistered: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; editId?: string; create?: string }>;
}) {
  const params = await searchParams;
  const query = params.search || "";
  const isCreating = params.create === "true";
  const editId = params.editId;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let user = session?.user as AdminUser | undefined;
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev && !user) {
    user = {
      id: "dev-admin",
      name: "Dev Admin",
      email: "dev@example.com",
      emailVerified: true,
      role: "ADMIN",
      isRegistered: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
    };
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SHOP_KEEPER")) {
    return <div className="p-8 text-center text-red-600 font-bold">Access denied</div>;
  }

  const customersData = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        {
          orders: {
            some: {
              OR: [
                { deliveryStreet: { contains: query, mode: "insensitive" } },
                { deliveryCity: { contains: query, mode: "insensitive" } },
                { deliveryPostalCode: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    },
    include: {
      orders: {
        select: {
          deliveryStreet: true,
          deliveryCity: true,
          deliveryPostalCode: true,
          deliveryCountry: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatAddr = (o: { deliveryStreet: string; deliveryPostalCode: string; deliveryCity: string } | null | undefined) =>
    o ? `${o.deliveryStreet}, ${o.deliveryPostalCode} ${o.deliveryCity}` : "";

  const editingCustomer = editId ? customersData.find((c) => c.id === editId) : null;
  const currentAddress = formatAddr(editingCustomer?.orders?.[0]);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
          {isDev && <span className="text-[10px] bg-yellow-200 px-2 py-1 rounded font-mono font-bold">REAL MODE</span>}
        </div>
        <Link href="?create=true" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition">
          + Create
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="search"
          defaultValue={query}
          placeholder="Search name, email, or street..."
          className="border p-2 rounded-md w-full max-w-md outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition">Search</button>
      </form>

      {(isCreating || editingCustomer) && (
        <div className="bg-blue-50 p-6 border border-blue-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-blue-900">
            {editingCustomer ? `Edit: ${editingCustomer.name}` : "Create New User"}
          </h2>
          <form action={saveCustomer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="hidden" name="id" value={editingCustomer?.id || ""} />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-blue-700 uppercase">Name</label>
              <input name="name" defaultValue={editingCustomer?.name || ""} className="border p-2 rounded bg-white" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-blue-700 uppercase">Email</label>
              <input name="email" type="email" defaultValue={editingCustomer?.email || ""} className="border p-2 rounded bg-white" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-blue-700 uppercase italic">Last Address</label>
              <input value={currentAddress || "No orders"} className="border p-2 rounded bg-gray-50 text-gray-400" disabled />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-blue-700 uppercase">Role</label>
              <select name="role" defaultValue={editingCustomer?.role || "CUSTOMER"} className="border p-2 rounded bg-white">
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="lg:col-span-4 flex gap-2 pt-2 border-t border-blue-100">
              <button type="submit" className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 font-bold">Save</button>
              <Link href="/admin/customers" className="bg-white border border-gray-300 text-gray-600 px-8 py-2 rounded">Cancel</Link>
            </div>
          </form>
        </div>
      )}

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-[11px]">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Addresses</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customersData.map((c) => {
              const uniqueAddresses = Array.from(new Set(c.orders.map(o => formatAddr(o)).filter(Boolean)));
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition align-top">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{c.name}</div>
                    <div className="text-gray-500 text-xs">{c.email}</div>
                  </td>
                  <td className="p-4 text-gray-600 leading-tight">
                    {uniqueAddresses.length > 0 ? (
                      <ul className="space-y-1">
                        {uniqueAddresses.map((addr, i) => <li key={i}>{addr}</li>)}
                      </ul>
                    ) : <span className="text-gray-400 italic">No history</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${c.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        c.role === 'SHOP_KEEPER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {c.role || "CUSTOMER"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-4 font-bold">
                      <Link href={`/admin/customers/${c.id}`} className="text-gray-500 hover:text-black transition text-xs">View History</Link>
                      <Link href={`?editId=${c.id}`} className="text-blue-600 hover:underline text-xs">Edit</Link>
                      <DeleteButton id={c.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

